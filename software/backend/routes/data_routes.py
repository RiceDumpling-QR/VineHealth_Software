from flask import Blueprint, request, jsonify
from config import supabase

data_blueprint = Blueprint('data', __name__)

@data_blueprint.route('/', methods=['POST'])
def receive_data():
    data = request.get_json()
    if not data or 'device_id' not in data:
        return jsonify({'status': 'error', 'message': 'Invalid data format'}), 400

    # Build insert payload dynamically to avoid missing-column errors
    try:
        insert_payload = {
            'device_id': data['device_id'],
            'timestamp': data.get('timestamp')
        }

        # Add health indexes (map keys to lowercase to match Postgres column names)
        health = data.get('health_indexes', {}) or {}
        for k, v in health.items():
            if v is not None:
                insert_payload[k.lower()] = v

        # Add environment data (map keys to lowercase)
        env = data.get('environment_data', {}) or {}
        for k, v in env.items():
            if v is not None:
                insert_payload[k.lower()] = v

        response = supabase.table('data').insert(insert_payload).execute()
        return jsonify({'status': 'success', 'message': 'Data received successfully', 'data': response.data}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500