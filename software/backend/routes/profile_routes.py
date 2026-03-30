from flask import Blueprint, request, jsonify
from config import supabase

profile_blueprint = Blueprint('profile', __name__)


@profile_blueprint.route('/create', methods=['POST'])
def create_profile():
    payload = request.get_json()
    if not payload or 'user_id' not in payload:
        return jsonify({'status': 'error', 'message': 'Invalid profile format'}), 400

    user_id = payload['user_id']
    try:
        response = supabase.table('users').insert({
            'user_id': user_id,
            'plant_species': payload.get('plant_species'),
            'crop_area': payload.get('crop_area', 0),
            'crop_area_unit': payload.get('crop_area_unit', 'sqm'),
            'profile_avatar': payload.get('profile_avatar', 'default_avatar')
        }).execute()
        return jsonify({'status': 'success', 'message': 'Profile created successfully', 'data': response.data}), 201
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@profile_blueprint.route('/update', methods=['POST'])
def update_profile():
    payload = request.get_json()
    if not payload or 'user_id' not in payload:
        return jsonify({'status': 'error', 'message': 'Invalid profile format'}), 400

    user_id = payload['user_id']
    try:
        # Only allow certain fields to be updated
        update_fields = {}
        for k in ('plant_species', 'crop_area', 'crop_area_unit', 'profile_avatar'):
            if k in payload:
                update_fields[k] = payload[k]

        response = supabase.table('users').update(update_fields).eq('user_id', user_id).execute()
        return jsonify({'status': 'success', 'message': 'Profile updated successfully', 'data': response.data}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
