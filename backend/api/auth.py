"""
Authentication endpoints
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    get_jwt_identity,
    jwt_required
)
from backend.extensions import limiter
from backend.models import db, User
from datetime import timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("5 per minute")
def login():
    """Authenticate user and return JWT token"""
    try:
        data = request.get_json()
        
        if not data or 'signature' not in data or 'wallet_address' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing signature or wallet address'
            }), 400

        wallet_address = data['wallet_address'].lower()
        signature = data['signature']
        
        # Verify signature (implement your Web3 signature verification)
        # ...
        
        # Get or create user
        user = User.query.filter_by(wallet_address=wallet_address).first()
        if not user:
            user = User(wallet_address=wallet_address)
            db.session.add(user)
            db.session.commit()
        
        # Create tokens
        access_token = create_access_token(
            identity=wallet_address,
            expires_delta=timedelta(hours=1)
        )
        refresh_token = create_refresh_token(
            identity=wallet_address,
            expires_delta=timedelta(days=30)
        )
        
        return jsonify({
            'success': True,
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'bearer'
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
@limiter.limit("5 per minute")
def refresh():
    """Refresh access token"""
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)
    
    return jsonify({
        'success': True,
        'access_token': access_token,
        'token_type': 'bearer'
    })

@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def me():
    """Get current user info"""
    current_user = get_jwt_identity()
    user = User.query.filter_by(wallet_address=current_user).first()
    
    if not user:
        return jsonify({
            'success': False,
            'error': 'User not found'
        }), 404
    
    return jsonify({
        'success': True,
        'user': {
            'wallet_address': user.wallet_address,
            'created_at': user.created_at.isoformat()
        }
    })