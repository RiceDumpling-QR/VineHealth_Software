from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash
from config import supabase

profile_blueprint = Blueprint('profile', __name__)


@profile_blueprint.route('/create', methods=['POST'])
def create_profile():
    payload = request.get_json() or {}
    user_id = payload.get('user_id', '').strip()   # email as primary key
    username = payload.get('username', '').strip()
    password = payload.get('password', '')
    if not user_id or not username or not password:
        return jsonify({'status': 'error', 'message': 'user_id, username, and password are required'}), 400

    try:
        response = supabase.table('users').insert({
            'user_id': user_id,
            'username': username,
            'password': generate_password_hash(password),
            'devices': payload.get('devices', []),
            'profile_avatar': payload.get('profile_avatar', 'default_avatar'),
        }).execute()
        return jsonify({'status': 'success', 'message': 'Profile created successfully', 'data': response.data}), 201
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@profile_blueprint.route('/update', methods=['POST'])
def update_profile():
    payload = request.get_json() or {}
    user_id = payload.get('user_id', '').strip()
    if not user_id:
        return jsonify({'status': 'error', 'message': 'user_id required'}), 400

    update_fields = {}
    for k in ('username', 'devices', 'profile_avatar'):
        if k in payload:
            update_fields[k] = payload[k]

    try:
        response = supabase.table('users').update(update_fields).eq('user_id', user_id).execute()
        return jsonify({'status': 'success', 'message': 'Profile updated successfully', 'data': response.data}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
