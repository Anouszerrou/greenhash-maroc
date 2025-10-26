from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os
import logging

load_dotenv()
import sys

# SQLAlchemy and typing internals can be incompatible with Python 3.12+ in some
# environments. Provide a clear error to guide developers to use Python 3.11
if sys.version_info >= (3, 12):
    raise RuntimeError(
        "This application requires Python 3.10 or 3.11 due to SQLAlchemy compatibility. "
        "Please run the development setup script 'setup_dev.ps1' which creates a Python 3.11 venv."
    )

from .models import db

logger = logging.getLogger(__name__)


def create_app(test_config: dict | None = None) -> Flask:
    """Create and configure the Flask application."""
    # Initialize Flask app. Passing import_name twice caused a TypeError in tests.
    app = Flask(__name__)

    # Load configuration from environment
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///greenhash.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'green-hash-secret-key')

    if test_config:
        app.config.update(test_config)

    # Initialize extensions
    db.init_app(app)
    CORS(app, origins=['http://localhost:3000', 'http://localhost:3001', 'https://green-hash-maroc.vercel.app'])

    # Register blueprints (import here to avoid circular imports)
    from .api.prices import prices_bp
    from .api.dex import dex_bp
    from .api.mining import mining_bp
    from .api.transactions import transactions_bp
    from .api.pool import pool_bp
    from .api.contact import contact_bp

    app.register_blueprint(prices_bp, url_prefix='/api/prices')
    app.register_blueprint(dex_bp, url_prefix='/api/dex')
    app.register_blueprint(mining_bp, url_prefix='/api/mining')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(pool_bp, url_prefix='/api/pool')
    app.register_blueprint(contact_bp, url_prefix='/api/contact')

    @app.route('/')
    def home():
        return {
            'message': 'Green Hash Maroc API',
            'version': '1.0.0',
            'status': 'running'
        }

    @app.route('/api/health')
    def health_check():
        import time
        return {'status': 'ok', 'timestamp': time.time()}

    # Create tables if needed
    with app.app_context():
        try:
            db.create_all()
            logger.info('Database initialized')
        except Exception as e:
            logger.exception('Error initializing database: %s', e)

    return app
