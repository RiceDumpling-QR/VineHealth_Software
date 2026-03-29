from flask import Blueprint, request, jsonify
from config import supabase

account_blueprint = Blueprint('account', __name__)

@account_blueprint.route('/create', methods=['POST'])
def create_account():
    account = request.get_json()
    if not account or 'device_id' not in account:
        return jsonify({'status': 'error', 'message': 'Invalid account format'}), 400

    # Insert account into Supabase
    try:
        response = supabase.table('devices').insert({
            'device_id': account['device_id'],
            'plant_species': account['plant_species'],
            'crop_area': account['crop_area'],
            'crop_area_unit': account['crop_area_unit'],
            'profile_avatar': 'default_avatar'
        }).execute()
        return jsonify({'status': 'success', 'message': 'Account created successfully', 'data': response.data}), 201
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@account_blueprint.route('/update', methods=['POST'])
def update_account():
    account = request.get_json()
    if not account or 'device_id' not in account:
        return jsonify({'status': 'error', 'message': 'Invalid account format'}), 400

    # Update account in Supabase
    try:
        response = supabase.table('Devices').update({
            'plant_species': account['plant_species'],
            'crop_area': account['crop_area'],
            'crop_area_unit': account['crop_area_unit'],
            'profile_avatar': account['profile_avatar']
        }).eq('device_id', account['device_id']).execute()
        return jsonify({'status': 'success', 'message': 'Account updated successfully', 'data': response.data}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500