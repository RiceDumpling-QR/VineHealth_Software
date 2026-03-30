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
        response = supabase.table('alerts').insert({
            'alert_id': alert['alert_id'],
            'user_id': alert['user_id'],
            'device_id': alert['device_id'],
            'timestamp': alert['timestamp'],
            'title': alert['title'],
            'details': alert['details'],
            'resolved': alert['resolved'],
        }).execute()
        return jsonify({'status': 'success', 'message': 'Alert received successfully', 'data': response.data}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@alert_blueprint.route('/', methods=['GET'])
def list_alerts():
    try:
        # Optional query param: ?resolved=true|false
        resolved_param = request.args.get('resolved')
        query = supabase.table('alerts').select('*')
        if resolved_param is not None:
            resolved_bool = str(resolved_param).lower() in ('1', 'true', 't', 'yes')
            query = query.eq('resolved', resolved_bool)
        response = query.order('timestamp', desc=True).execute()
        return jsonify({'status': 'success', 'data': response.data}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


    @alert_blueprint.route('/<alert_id>', methods=['PATCH'])
    def patch_alert(alert_id):
        payload = request.get_json() or {}
        if 'resolved' not in payload:
            return jsonify({'status': 'error', 'message': 'resolved field required'}), 400
        resolved = payload.get('resolved')
        resolved_bool = True if str(resolved).lower() in ('1', 'true', 't', 'yes') else False
        try:
            response = supabase.table('alerts').update({'resolved': resolved_bool}).eq('alert_id', alert_id).execute()
            return jsonify({'status': 'success', 'data': response.data}), 200
        except Exception as e:
            return jsonify({'status': 'error', 'message': str(e)}), 500