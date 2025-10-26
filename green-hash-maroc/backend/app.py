from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os
import logging
from datetime import datetime

# Charger les variables d'environnement
load_dotenv()

# Configuration de l'application
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///greenhash.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'green-hash-secret-key')

# Initialiser les extensions
db = SQLAlchemy(app)
CORS(app, origins=['http://localhost:3000', 'https://green-hash-maroc.vercel.app'])

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Importer les routes
from api.prices import prices_bp
from api.dex import dex_bp
from api.mining import mining_bp
from api.transactions import transactions_bp
from api.pool import pool_bp

# Enregistrer les blueprints
app.register_blueprint(prices_bp, url_prefix='/api/prices')
app.register_blueprint(dex_bp, url_prefix='/api/dex')
app.register_blueprint(mining_bp, url_prefix='/api/mining')
app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
app.register_blueprint(pool_bp, url_prefix='/api/pool')

# Modèles de base de données
class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    hash = db.Column(db.String(66), unique=True, nullable=False)
    from_address = db.Column(db.String(42), nullable=False)
    to_address = db.Column(db.String(42), nullable=False)
    value = db.Column(db.String(50), nullable=False)
    gas_price = db.Column(db.String(50), nullable=False)
    gas_used = db.Column(db.String(50), nullable=False)
    block_number = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    transaction_type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default='pending')

class MiningCalculation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    wallet_address = db.Column(db.String(42), nullable=False)
    hashrate = db.Column(db.Float, nullable=False)
    power_cost = db.Column(db.Float, nullable=False)
    hardware_cost = db.Column(db.Float, nullable=False)
    pool_fee = db.Column(db.Float, nullable=False)
    maintenance_cost = db.Column(db.Float, nullable=False)
    difficulty = db.Column(db.Float, nullable=False)
    daily_profit = db.Column(db.Float, nullable=False)
    monthly_profit = db.Column(db.Float, nullable=False)
    roi = db.Column(db.Float, nullable=False)
    break_even_days = db.Column(db.Integer, nullable=False)
    co2_saved = db.Column(db.Float, nullable=False)
    trees_compensated = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class StakingStats(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    total_staked = db.Column(db.Float, default=0)
    total_rewards = db.Column(db.Float, default=0)
    active_stakers = db.Column(db.Integer, default=0)
    current_apr = db.Column(db.Float, default=65.0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

# Routes de base
@app.route('/')
def home():
    return jsonify({
        'message': 'Green Hash Maroc API',
        'version': '1.0.0',
        'status': 'running',
        'endpoints': {
            'prices': '/api/prices',
            'dex': '/api/dex',
            'mining': '/api/mining',
            'transactions': '/api/transactions',
            'pool': '/api/pool'
        }
    })

@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'database': 'connected'
    })

# Créer les tables
with app.app_context():
    try:
        db.create_all()
        logger.info("Base de données initialisée avec succès")
    except Exception as e:
        logger.error(f"Erreur lors de l'initialisation de la base de données: {e}")

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_DEBUG', 'False').lower() in ['true', '1', 't']
    app.run(host='0.0.0.0', port=port, debug=debug)