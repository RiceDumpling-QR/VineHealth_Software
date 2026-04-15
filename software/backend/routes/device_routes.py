from flask import Blueprint, request, jsonify
from config import supabase

device_blueprint = Blueprint('device', __name__)


@device_blueprint.route('/create', methods=['POST'])
def create_device():
    payload = request.get_json()
    if not payload or 'device_id' not in payload or 'user_id' not in payload:
        return jsonify({'status': 'error', 'message': 'Invalid device format'}), 400

    device_id = payload['device_id']
    user_id = payload['user_id']

    # Ensure the user exists
    try:
        user_check = supabase.table('users').select('user_id').eq('user_id', user_id).execute()
        if not user_check or not getattr(user_check, 'data', None):
            return jsonify({'status': 'error', 'message': f'User {user_id} does not exist'}), 400
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

    # Check if device already exists — if so, reassign it to this user
    try:
        existing = supabase.table('devices').select('device_id').eq('device_id', device_id).execute()
        if existing.data:
            supabase.table('devices').update({
                'user_id': user_id,
                'device_name': payload.get('device_name'),
                'location': payload.get('location'),
            }).eq('device_id', device_id).execute()
            return jsonify({
                'status': 'success',
                'existed': True,
                'message': 'Device already exists and has been added to you',
            }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

    try:
        response = supabase.table('devices').insert({
            'device_id': device_id,
            'user_id': user_id,
            'device_name': payload.get('device_name'),
            'location': payload.get('location'),
        }).execute()
        return jsonify({'status': 'success', 'existed': False, 'message': 'Device created successfully', 'data': response.data}), 201
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@device_blueprint.route('/list', methods=['GET'])
def list_devices():
    user_id = request.args.get('user_id', '').strip()
    if not user_id:
        return jsonify({'status': 'error', 'message': 'user_id query parameter required'}), 400
    try:
        response = supabase.table('devices').select('*').eq('user_id', user_id).execute()
        return jsonify({'status': 'success', 'data': response.data}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@device_blueprint.route('/unassign', methods=['PATCH'])
def unassign_device():
    """Remove the user association from a device (sets user_id to null)."""
    payload = request.get_json()
    if not payload or 'device_id' not in payload:
        return jsonify({'status': 'error', 'message': 'device_id is required'}), 400

    device_id = payload['device_id']
    try:
        supabase.table('devices').update({'user_id': None}).eq('device_id', device_id).execute()
        return jsonify({'status': 'success', 'message': 'Device unassigned'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@device_blueprint.route('/update', methods=['POST'])
def update_device():
    payload = request.get_json()
    if not payload or 'device_id' not in payload:
        return jsonify({'status': 'error', 'message': 'Invalid device format'}), 400

    device_id = payload['device_id']
    try:
        update_fields = {}
        for k in ('device_name', 'location'):
            if k in payload:
                update_fields[k] = payload[k]

        response = supabase.table('devices').update(update_fields).eq('device_id', device_id).execute()
        return jsonify({'status': 'success', 'message': 'Device updated successfully', 'data': response.data}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
