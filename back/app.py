from flask import Flask
from flask_cors import CORS
from seeder import seed_all
from users import users_bp
from preferencias import static_data_bp, preferencias_bp
from reservas import reservas_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(users_bp, url_prefix='/api')
app.register_blueprint(static_data_bp, url_prefix='/api')
app.register_blueprint(preferencias_bp, url_prefix='/api/preferencias')
app.register_blueprint(reservas_bp, url_prefix='/api')

with app.app_context():
    seed_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)