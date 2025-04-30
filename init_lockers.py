from app import app, db, Locker
from datetime import datetime

def init_lockers():
    with app.app_context():
        # Create test lockers
        lockers = [
            Locker(locker_number='L001', status='available'),
            Locker(locker_number='L002', status='available'),
            Locker(locker_number='L003', status='available'),
            Locker(locker_number='L004', status='available'),
            Locker(locker_number='L005', status='available'),
            Locker(locker_number='L006', status='available'),
        ]
        
        # First, clear existing lockers
        try:
            Locker.query.delete()
            db.session.commit()
        except Exception as e:
            print(f"Error clearing existing lockers: {e}")
            db.session.rollback()
        
        # Add new lockers
        for locker in lockers:
            db.session.add(locker)
        
        try:
            db.session.commit()
            print("Successfully initialized lockers!")
        except Exception as e:
            print(f"Error initializing lockers: {e}")
            db.session.rollback()

if __name__ == '__main__':
    init_lockers() 