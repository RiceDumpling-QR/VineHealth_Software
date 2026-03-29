from flask import Blueprint, request, jsonify
from config import supabase

data_blueprint = Blueprint('data', __name__)

@data_blueprint.route('/', methods=['POST'])
def receive_data():
    data = request.get_json()
    if not data or 'device_id' not in data:
        return jsonify({'status': 'error', 'message': 'Invalid data format'}), 400

    # Insert data into Supabase
    try:
        response = supabase.table('Data').insert({
            'device_id': data['device_id'],
            'timestamp': data['timestamp'],
            'NDVI': data['health_indexes'].get('NDVI'),
            'GNDVI': data['health_indexes'].get('GNDVI'),
            'EVI': data['health_indexes'].get('EVI'),
            'SAVI': data['health_indexes'].get('SAVI'),
            'temperature': data['environment_data'].get('temperature'),
            'relative_humidity': data['environment_data'].get('relative_humidity'),
            'soil_moisture': data['environment_data'].get('soil_moisture'),
            'light_intensity': data['environment_data'].get('light_intensity')
        }).execute()
        return jsonify({'status': 'success', 'message': 'Data received successfully', 'data': response.data}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500