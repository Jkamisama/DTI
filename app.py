from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import bcrypt
import jwt
import os
from dotenv import load_dotenv
import random

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure SQLite database
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///unilink.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'your-secret-key-here')

db = SQLAlchemy(app)

# User Model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    enrollment_number = db.Column(db.String(20), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(60), nullable=False)
    phone_number = db.Column(db.String(15), nullable=False)
    role = db.Column(db.String(20), default='student')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Locker Model
class Locker(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    locker_number = db.Column(db.String(10), unique=True, nullable=False)
    status = db.Column(db.String(20), default='available')  # available, occupied, maintenance
    current_delivery_id = db.Column(db.Integer, db.ForeignKey('delivery.id'), nullable=True)
    last_cleaned = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    current_delivery = db.relationship('Delivery', foreign_keys=[current_delivery_id], backref='assigned_locker')

# Delivery Model
class Delivery(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    locker_id = db.Column(db.Integer, db.ForeignKey('locker.id'), nullable=True)
    status = db.Column(db.String(20), default='pending')  # pending, assigned, delivered, picked_up
    delivery_code = db.Column(db.String(6), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    picked_up_at = db.Column(db.DateTime, nullable=True)
    
    user = db.relationship('User', backref='deliveries')
    locker = db.relationship('Locker', foreign_keys=[locker_id], backref='deliveries')

# Create tables
with app.app_context():
    db.create_all()

def generate_token(user_id):
    """Generate JWT token for user authentication"""
    token = jwt.encode(
        {
            'user_id': user_id,
            'exp': datetime.utcnow() + timedelta(days=1)
        },
        app.config['SECRET_KEY'],
        algorithm='HS256'
    )
    return token

@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        if User.query.filter_by(enrollment_number=data['enrollmentNumber']).first():
            return jsonify({'error': 'Enrollment number already registered'}), 400
        
        # Hash password
        hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
        
        # Create new user
        new_user = User(
            name=data['name'],
            enrollment_number=data['enrollmentNumber'],
            email=data['email'],
            password=hashed_password,
            phone_number=data['phoneNumber'],
            role=data.get('role', 'student')
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        return jsonify({'message': 'Registration successful'}), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        user = User.query.filter_by(email=data['email']).first()
        
        if user and bcrypt.checkpw(data['password'].encode('utf-8'), user.password):
            token = generate_token(user.id)
            
            return jsonify({
                'token': token,
                'user': {
                    'id': user.id,
                    'name': user.name,
                    'email': user.email,
                    'enrollmentNumber': user.enrollment_number,
                    'phoneNumber': user.phone_number,
                    'role': user.role
                }
            }), 200
        
        return jsonify({'error': 'Invalid email or password'}), 401
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Locker Management Endpoints
@app.route('/api/lockers', methods=['GET'])
def get_lockers():
    try:
        lockers = Locker.query.all()
        return jsonify([{
            'id': locker.id,
            'lockerNumber': locker.locker_number,
            'status': locker.status,
            'lastCleaned': locker.last_cleaned.isoformat() if locker.last_cleaned else None
        } for locker in lockers]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/lockers/<int:locker_id>/clean', methods=['POST'])
def clean_locker(locker_id):
    try:
        locker = Locker.query.get_or_404(locker_id)
        locker.last_cleaned = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': 'Locker cleaned successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Delivery Management Endpoints
@app.route('/api/deliveries', methods=['POST'])
def create_delivery():
    try:
        data = request.get_json()
        user_id = data['userId']
        
        # Generate a random 6-digit delivery code
        delivery_code = ''.join([str(random.randint(0, 9)) for _ in range(6)])
        
        new_delivery = Delivery(
            user_id=user_id,
            delivery_code=delivery_code
        )
        
        db.session.add(new_delivery)
        db.session.commit()
        
        return jsonify({
            'id': new_delivery.id,
            'deliveryCode': new_delivery.delivery_code,
            'status': new_delivery.status
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/deliveries/<int:delivery_id>/assign', methods=['POST'])
def assign_locker(delivery_id):
    try:
        delivery = Delivery.query.get_or_404(delivery_id)
        
        # Find an available locker
        available_locker = Locker.query.filter_by(status='available').first()
        if not available_locker:
            return jsonify({'error': 'No available lockers'}), 400
        
        # Update locker and delivery status
        available_locker.status = 'occupied'
        available_locker.current_delivery_id = delivery_id
        
        delivery.status = 'assigned'
        delivery.locker_id = available_locker.id
        
        db.session.commit()
        
        return jsonify({
            'lockerNumber': available_locker.locker_number,
            'deliveryCode': delivery.delivery_code
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/deliveries/<int:delivery_id>/pickup', methods=['POST'])
def pickup_delivery(delivery_id):
    try:
        data = request.get_json()
        delivery_code = data['deliveryCode']
        
        delivery = Delivery.query.get_or_404(delivery_id)
        if delivery.delivery_code != delivery_code:
            return jsonify({'error': 'Invalid delivery code'}), 400
        
        if delivery.status != 'assigned':
            return jsonify({'error': 'Delivery not ready for pickup'}), 400
        
        # Update delivery and locker status
        delivery.status = 'picked_up'
        delivery.picked_up_at = datetime.utcnow()
        
        locker = delivery.locker
        locker.status = 'available'
        locker.current_delivery_id = None
        
        db.session.commit()
        
        return jsonify({'message': 'Delivery picked up successfully'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/users/<int:user_id>/deliveries', methods=['GET'])
def get_user_deliveries(user_id):
    try:
        deliveries = Delivery.query.filter_by(user_id=user_id).all()
        return jsonify([{
            'id': delivery.id,
            'status': delivery.status,
            'deliveryCode': delivery.delivery_code,
            'lockerNumber': delivery.locker.locker_number if delivery.locker else None,
            'createdAt': delivery.created_at.isoformat(),
            'pickedUpAt': delivery.picked_up_at.isoformat() if delivery.picked_up_at else None
        } for delivery in deliveries]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/occupancy', methods=['GET'])
def get_occupancy():
    try:
        total_lockers = Locker.query.count()
        available_lockers = Locker.query.filter_by(status='available').count()
        occupied_lockers = Locker.query.filter_by(status='occupied').count()
        
        return jsonify({
            'total': total_lockers,
            'available': available_lockers,
            'occupied': occupied_lockers
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/lockers/status', methods=['GET'])
def get_locker_status():
    try:
        lockers = Locker.query.all()
        return jsonify([{
            'id': locker.id,
            'number': f'L{str(locker.id).zfill(3)}',  # Format as L001, L002, etc.
            'status': locker.status,
            'lastCleaned': locker.last_cleaned.isoformat() if locker.last_cleaned else None
        } for locker in lockers]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True) 