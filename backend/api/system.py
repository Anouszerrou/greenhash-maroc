"""
System status endpoints
"""
from flask import Blueprint, jsonify
from backend.extensions import db, cache
from backend.utils.cache_utils import cached

system_bp = Blueprint('system', __name__)

@system_bp.route('/status')
@cached(timeout=30, key_prefix='system_status')
def get_system_status():
    """Get system components status"""
    status = {
        'success': True,
        'services': {
            'api': {
                'status': 'healthy',
                'version': '1.0.0'
            },
            'database': check_database(),
            'redis': check_redis(),
            'jwt': {
                'status': 'configured',
                'version': '2.0.0'
            }
        }
    }
    return jsonify(status)

def check_database():
    """Check database connection"""
    try:
        # Execute a simple query
        db.session.execute('SELECT 1')
        return {
            'status': 'connected',
            'type': db.engine.name
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }

def check_redis():
    """Check Redis connection"""
    try:
        if isinstance(cache.cache, dict):
            # Simple cache for testing
            return {
                'status': 'simulated',
                'type': 'simple'
            }
            
        redis_client = cache.cache._read_client
        redis_info = redis_client.info()
        return {
            'status': 'connected',
            'version': redis_info.get('redis_version'),
            'used_memory': redis_info.get('used_memory_human')
        }
    except Exception as e:
        return {
            'status': 'error',
            'error': str(e)
        }