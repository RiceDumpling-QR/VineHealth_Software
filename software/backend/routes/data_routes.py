from flask import Blueprint, request, jsonify
from config import supabase
from datetime import datetime
from zoneinfo import ZoneInfo
from utils.alert_rules import generate_alerts

data_blueprint = Blueprint('data', __name__)

@data_blueprint.route('/', methods=['POST'], strict_slashes=False)
def receive_data():
    data = request.get_json()
    if not data or 'device_id' not in data:
        return jsonify({'status': 'error', 'message': 'Invalid data format'}), 400

    # Build insert payload dynamically to avoid missing-column errors
    try:
        insert_payload = {
            'device_id': data['device_id']
        }

        # Convert incoming timestamp to EST date + time_range
        ts = data.get('timestamp')
        try:
            if ts:
                # handle trailing Z
                if ts.endswith('Z'):
                    ts = ts.replace('Z', '+00:00')
                dt = datetime.fromisoformat(ts)
            else:
                # use current UTC time
                dt = datetime.utcnow()
            # convert to America/New_York (EST/EDT)
            ny = dt.astimezone(ZoneInfo('America/New_York'))
        except Exception:
            # fallback to now in NY
            ny = datetime.now(ZoneInfo('America/New_York'))

        # date as YYYY-MM-DD in EST
        insert_payload['date'] = ny.date().isoformat()

        # determine time range — only sunrise/noon/sunset are accepted
        hour = ny.hour
        if 3 <= hour < 9:
            insert_payload['time_range'] = 'sunrise'
        elif 9 <= hour < 15:
            insert_payload['time_range'] = 'noon'
        elif 15 <= hour < 21:
            insert_payload['time_range'] = 'sunset'
        else:
            return jsonify({'status': 'error', 'message': 'Data outside active hours (3 AM–9 PM EST). Only sunrise, noon, and sunset readings are accepted.'}), 400

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

        # Ensure device exists and retrieve user_id (needed for alert generation)
        device_id = data['device_id']
        user_id = None
        try:
            dev_check = supabase.table('devices').select('device_id,user_id').eq('device_id', device_id).execute()
            if not dev_check or not getattr(dev_check, 'data', None):
                return jsonify({'status': 'error', 'message': f"Device '{device_id}' not found. Create the device before sending data."}), 400
            user_id = dev_check.data[0].get('user_id')
            if user_id is None:
                return jsonify({'status': 'error', 'message': f"Device '{device_id}' is not assigned to any user. Data ingestion is not allowed."}), 403
        except Exception:
            return jsonify({'status': 'error', 'message': 'Failed to verify device existence'}), 500

        response = supabase.table('data').insert(insert_payload).execute()

        # Generate and store alerts based on health indexes
        if health:
            health_lower = {k.lower(): v for k, v in health.items() if v is not None}
            timestamp_iso = ny.isoformat()
            alerts = generate_alerts(device_id, user_id, health_lower, timestamp_iso)
            if alerts:
                try:
                    supabase.table('alerts').insert(alerts).execute()
                except Exception:
                    pass  # alert insert failure should not block the data response

        return jsonify({'status': 'success', 'message': 'Data received successfully', 'data': response.data}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@data_blueprint.route('/', methods=['GET'], strict_slashes=False)
def query_data():
    """Query data by device_id and date (YYYY-MM-DD). Returns matching rows and daily averages."""
    device_id = request.args.get('device_id')
    date = request.args.get('date')
    if not device_id or not date:
        return jsonify({'status': 'error', 'message': 'device_id and date query parameters are required'}), 400

    try:
        resp = supabase.table('data').select('*').eq('device_id', device_id).eq('date', date).execute()
        rows = resp.data if getattr(resp, 'data', None) else []

        # compute simple daily averages for temperature and relative_humidity
        temps = [r.get('temperature') for r in rows if r.get('temperature') is not None]
        hums = [r.get('relative_humidity') for r in rows if r.get('relative_humidity') is not None]
        avg_temp = sum(temps) / len(temps) if temps else None
        avg_hum = sum(hums) / len(hums) if hums else None

        return jsonify({
            'status': 'success',
            'data': rows,
            'summary': {
                'avg_temperature': avg_temp,
                'avg_relative_humidity': avg_hum
            }
        }), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@data_blueprint.route('/dates', methods=['GET'], strict_slashes=False)
def query_dates():
    """Return all distinct dates (sorted descending) that exist for a given device_id."""
    device_id = request.args.get('device_id')
    if not device_id:
        return jsonify({'status': 'error', 'message': 'device_id query parameter is required'}), 400

    try:
        resp = supabase.table('data').select('date').eq('device_id', device_id).execute()
        rows = resp.data if getattr(resp, 'data', None) else []
        dates = sorted({r['date'] for r in rows if r.get('date')}, reverse=True)
        return jsonify({'status': 'success', 'dates': dates}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


@data_blueprint.route('/range', methods=['GET'], strict_slashes=False)
def query_range():
    """Return all data rows for a device between start_date and end_date (inclusive), sorted by date then time_range."""
    device_id = request.args.get('device_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    if not device_id or not start_date or not end_date:
        return jsonify({'status': 'error', 'message': 'device_id, start_date, and end_date are required'}), 400

    try:
        resp = (
            supabase.table('data')
            .select('*')
            .eq('device_id', device_id)
            .gte('date', start_date)
            .lte('date', end_date)
            .execute()
        )
        rows = resp.data if getattr(resp, 'data', None) else []

        time_order = {'sunrise': 0, 'noon': 1, 'sunset': 2, 'night': 3}
        rows.sort(key=lambda r: (r.get('date', ''), time_order.get(r.get('time_range', ''), 4)))

        return jsonify({'status': 'success', 'data': rows}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500