from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash
from config import supabase

auth_blueprint = Blueprint('auth', __name__)


@auth_blueprint.route('/login', methods=['POST'])
def login():
    payload = request.get_json() or {}
    user_id = payload.get('user_id', '').strip()   # email
    password = payload.get('password', '')
    if not user_id or not password:
        return jsonify({'status': 'error', 'message': 'user_id and password required'}), 400
    try:
        res = supabase.table('users').select('user_id, username, password, profile_avatar, devices').eq('user_id', user_id).single().execute()
        user = res.data
        if not user or not check_password_hash(user['password'], password):
            return jsonify({'status': 'error', 'message': 'Invalid credentials'}), 401
        return jsonify({
            'status': 'success',
            'user_id': user['user_id'],
            'username': user['username'],
            'profile_avatar': user['profile_avatar'],
            'devices': user['devices'],
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 401
