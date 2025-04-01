import sqlite3
from flask import Flask, jsonify, request
from flask_cors import CORS
from db import create_table, create_task, get_task, get_all_tasks, update_task, delete_task

app = Flask(__name__)
# Configure CORS with more explicit parameters to ensure it works properly
CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST", "PUT", "DELETE"], "allow_headers": ["Content-Type", "Authorization"]}})

# Initialize the database table
with app.app_context():
    create_table()

# Add a health check endpoint to verify the API is running
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/tasks', methods=['POST'])
def create_new_task():
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    due_date = data.get('due_date')

    if not title:
        return jsonify({'message': 'Title is required'}), 400

    task_id = create_task(title, description, due_date)
    if task_id:
        return jsonify({'message': 'Task created successfully', 'task_id': task_id}), 201
    else:
        return jsonify({'message': 'Failed to create task'}), 500

@app.route('/tasks/<int:task_id>', methods=['GET'])
def get_task_by_id(task_id):
    task = get_task(task_id)
    if task:
        task_dict = {
            'id': task[0],
            'title': task[1],
            'description': task[2],
            'due_date': task[3],
            'completed': bool(task[4])
        }
        return jsonify(task_dict), 200
    else:
        return jsonify({'message': 'Task not found'}), 404

@app.route('/tasks', methods=['GET'])
def get_all_tasks_route():
    tasks = get_all_tasks()
    task_list = []
    for task in tasks:
        task_dict = {
            'id': task[0],
            'title': task[1],
            'description': task[2],
            'due_date': task[3],
            'completed': bool(task[4])
        }
        task_list.append(task_dict)
    return jsonify(task_list), 200

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task_route(task_id):
    data = request.get_json()
    title = data.get('title')
    description = data.get('description')
    due_date = data.get('due_date')
    completed = data.get('completed')

    updated = update_task(task_id, title, description, due_date, completed)
    if updated:
        return jsonify({'message': 'Task updated successfully'}), 200
    else:
        return jsonify({'message': 'Task not found or no changes applied'}), 404

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task_route(task_id):
    deleted = delete_task(task_id)
    if deleted:
        return jsonify({'message': 'Task deleted successfully'}), 200
    else:
        return jsonify({'message': 'Task not found'}), 404

if __name__ == '__main__':
    # Explicitly set the host to 0.0.0.0 to make it accessible from other devices
    # This is especially important when running in a Docker container or VM
    app.run(debug=True, host='0.0.0.0', port=5000)


