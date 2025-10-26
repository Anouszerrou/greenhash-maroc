"""
Flask extensions initialization
"""
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache

# Database
db = SQLAlchemy()

# JWT
jwt = JWTManager()

# CORS
cors = CORS()

# Rate Limiter
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

# Cache
cache = Cache()

def init_extensions(app):
    """Initialize all Flask extensions."""
    
    # Initialize database
    db.init_app(app)
    
    # Initialize JWT
    jwt.init_app(app)
    
    # Initialize CORS with allowed origins
    cors.init_app(
        app,
        resources={
            r"/api/*": {
                "origins": app.config['CORS_ORIGINS'],
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
                "allow_headers": ["Content-Type", "Authorization"]
            }
        }
    )
    
    # Initialize rate limiter
    limiter.init_app(app)
    
    # Initialize cache
    cache.init_app(app)
    
    return app

# JWT error handlers
@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):
    return {
        "success": False,
        "error": "Token has expired",
        "code": "token_expired"
    }, 401

@jwt.invalid_token_loader
def invalid_token_callback(error):
    return {
        "success": False,
        "error": "Invalid token",
        "code": "invalid_token"
    }, 401

@jwt.unauthorized_loader
def missing_token_callback(error):
    return {
        "success": False,
        "error": "Authorization token required",
        "code": "token_required"
    }, 401