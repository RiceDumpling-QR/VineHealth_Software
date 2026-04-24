from flask import Blueprint, request, jsonify
from config import supabase

device_blueprint = Blueprint('device', __name__)

VALID_DEVICE_IDS = {'A7K3M', '9XR2P', 'B5N8Q','TEST000','TEST001','TEST002','TEST003'}


@device_blueprint.route('/create', methods=['POST'])
def create_device():
    payload = request.get_json()
    if not payload or 'device_id' not in payload or 'user_id' not in payload:
        return jsonify({'status': 'error', 'message': 'Invalid device format'}), 400
    # Normalize device_id from payload to avoid issues with casing/whitespace
    device_id = payload['device_id']
    device_id = device_id.strip().upper()
    user_id = payload['user_id']

    # Debug logging to help troubleshoot mismatches from the client
    try:
        print(f"create_device: raw={repr(payload.get('device_id'))} normalized={device_id} in_valid={device_id in VALID_DEVICE_IDS} user_id={repr(user_id)}")
    except Exception:
        pass

    if device_id not in VALID_DEVICE_IDS:
        return jsonify({
            'status': 'error',
            'message': "The device you are trying to connect to doesn't exist. Please check the device ID and try again.",
        }), 404

    try:
        existing = supabase.table('devices').select('device_id, user_id').eq('device_id', device_id).execute()

        if not existing.data:
            # Device is valid but not yet in DB — create it and assign to this user
            supabase.table('devices').insert({
                'device_id': device_id,
                'user_id': user_id,
                'device_name': payload.get('device_name'),
                'location': payload.get('location'),
            }).execute()
            return jsonify({'status': 'success', 'existed': False, 'message': 'Device added to your account successfully.'}), 201

        current_owner = existing.data[0].get('user_id')
        if current_owner is not None:
            return jsonify({
                'status': 'error',
                'message': 'This device is already claimed by another user.',
            }), 409

        # Device exists and is unclaimed — assign to this user
        supabase.table('devices').update({
            'user_id': user_id,
            'device_name': payload.get('device_name'),
            'location': payload.get('location'),
        }).eq('device_id', device_id).execute()
        return jsonify({'status': 'success', 'existed': True, 'message': 'Device added to your account successfully.'}), 200

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

    # Normalize device_id to avoid whitespace/case mismatches
    device_id = payload['device_id'].strip().upper()
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
    # Normalize device_id for consistent DB lookups
    device_id = payload['device_id'].strip().upper()
    try:
        update_fields = {}
        for k in ('device_name', 'location'):
            if k in payload:
                update_fields[k] = payload[k]

        response = supabase.table('devices').update(update_fields).eq('device_id', device_id).execute()
        return jsonify({'status': 'success', 'message': 'Device updated successfully', 'data': response.data}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
