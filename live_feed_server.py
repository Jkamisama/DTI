from flask import Flask, Response, jsonify
from ultralytics import YOLO
import cv2
from flask_cors import CORS

app = Flask(__name__)
CORS(app)
model = YOLO('yolov8n.pt')  # Small YOLOv8 Nano model
camera = cv2.VideoCapture(0)  # 0 for default webcam

# Global variable to store current person count
current_person_count = 0

def generate_frames():
    global current_person_count
    while True:
        success, frame = camera.read()
        if not success:
            break
        else:
            results = model(frame)
            detections = results[0]
            person_count = 0

            for box in detections.boxes:
                cls = int(box.cls[0])
                if model.names[cls] == 'person':
                    person_count += 1
                    x1, y1, x2, y2 = box.xyxy[0]
                    cv2.rectangle(frame, (int(x1), int(y1)), (int(x2), int(y2)), (0, 255, 0), 2)
                    cv2.putText(frame, 'Person', (int(x1), int(y1) - 10),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

            # Update global person count
            current_person_count = person_count

            # Show total person count on screen
            cv2.putText(frame, f'Occupancy: {person_count}', (20, 50),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()

            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/occupancy')
def get_occupancy():
    return jsonify({'count': current_person_count})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
