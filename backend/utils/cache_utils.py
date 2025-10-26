"""
Redis cache utilities
"""
import json
from functools import wraps
from flask import current_app
from backend.extensions import cache

def get_cache(key):
    """Get value from cache"""
    return cache.get(key)

def set_cache(key, value, timeout=300):
    """Set value in cache with timeout"""
    return cache.set(key, value, timeout=timeout)

def clear_cache(pattern="*"):
    """Clear cache keys matching pattern"""
    if isinstance(cache.cache, dict):
        # Simple cache (testing)
        cache.cache.clear()
        return True
        
    # Redis cache
    redis_client = cache.cache._read_client
    keys = redis_client.keys(pattern)
    if keys:
        return redis_client.delete(*keys)
    return True

def cache_key(*args, **kwargs):
    """Generate a cache key from arguments"""
    key_dict = {
        'args': args,
        'kwargs': kwargs
    }
    return f"cache_{hash(json.dumps(key_dict, sort_keys=True))}"

def cached(timeout=300, key_prefix='view'):
    """
    Decorator that caches view responses
    
    Example:
        @cached(timeout=60, key_prefix='prices')
        def get_prices():
            ...
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            cache_value = get_cache(
                f"{key_prefix}_{cache_key(*args, **kwargs)}"
            )
            
            if cache_value is not None:
                return cache_value
                
            value = f(*args, **kwargs)
            set_cache(
                f"{key_prefix}_{cache_key(*args, **kwargs)}", 
                value, 
                timeout
            )
            return value
        return decorated_function
    return decorator

def invalidate_cache(pattern):
    """
    Decorator that invalidates cache matching pattern
    
    Example:
        @invalidate_cache('prices_*')
        def update_prices():
            ...
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            clear_cache(pattern)
            return f(*args, **kwargs)
        return decorated_function
    return decorator