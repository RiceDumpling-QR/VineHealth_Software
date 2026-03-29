from flask import Blueprint, request, jsonify
from config import supabase

alert_blueprint = Blueprint('alerts', __name__)

@alert_blueprint.route('/', methods=['POST'])
def receive_alert():
    alert = request.get_json()
    if not alert or 'alert_id' not in alert:
        return jsonify({'status': 'error', 'message': 'Invalid alert format'}), 400

    # Insert alert into Supabase
    try:
        response = supabase.table('Alerts').insert({
            'alert_id': alert['alert_id'],
            'device_id': alert['device_id'],
            'timestamp': alert['timestamp'],
            'title': alert['title'],
            'details': alert['details']
        }).execute()
        return jsonify({'status': 'success', 'message': 'Alert received successfully', 'data': response.data}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500