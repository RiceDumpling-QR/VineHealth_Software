from flask import Flask
from routes.data_routes import data_blueprint
from routes.alert_routes import alert_blueprint
from routes.profile_routes import profile_blueprint
from routes.device_routes import device_blueprint
from routes.auth_routes import auth_blueprint

app = Flask(__name__)

# Register blueprints
app.register_blueprint(data_blueprint, url_prefix='/api/data')
app.register_blueprint(alert_blueprint, url_prefix='/api/alerts')
app.register_blueprint(profile_blueprint, url_prefix='/api/profile')
app.register_blueprint(device_blueprint, url_prefix='/api/device')
app.register_blueprint(auth_blueprint, url_prefix='/api/auth')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)