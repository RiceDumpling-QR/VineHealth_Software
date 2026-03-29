from flask import Flask
from routes.data_routes import data_blueprint
from routes.alert_routes import alert_blueprint
from routes.account_routes import account_blueprint

app = Flask(__name__)

# Register blueprints
app.register_blueprint(data_blueprint, url_prefix='/api/data')
app.register_blueprint(alert_blueprint, url_prefix='/api/alerts')
app.register_blueprint(account_blueprint, url_prefix='/api/account')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)