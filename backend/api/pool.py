from flask import Blueprint, jsonify, request
import logging
from datetime import datetime, timedelta
from backend.models import StakingStats, db

pool_bp = Blueprint('pool', __name__)
logger = logging.getLogger(__name__)

@pool_bp.route('/stats', methods=['GET'])
def get_pool_stats():
    """Obtenir les statistiques du pool de staking"""
    try:
        # Récupérer ou créer les statistiques
        stats = StakingStats.query.first()
        if not stats:
            # Créer des statistiques par défaut
            stats = StakingStats(
                total_staked=1250000.0,
                total_rewards=890000.0,
                active_stakers=2847,
                current_apr=65.0
            )
            db.session.add(stats)
            db.session.commit()
        
        # Calculer l'APR en temps réel (simplifié)
        if stats.total_staked > 0:
            # Simuler le calcul de l'APR basé sur les récompenses distribuées
            daily_rewards = stats.total_rewards / 365
            apr = (daily_rewards * 365 * 100) / stats.total_staked
            stats.current_apr = min(apr, 80.0)  # Limiter à 80% maximum
        
        return jsonify({
            'success': True,
            'data': {
                'total_staked': str(stats.total_staked),
                'total_rewards': str(stats.total_rewards),
                'active_stakers': stats.active_stakers,
                'current_apr': stats.current_apr,
                'last_updated': stats.last_updated.isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Erreur dans get_pool_stats: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@pool_bp.route('/update_stats', methods=['PUT'])
def update_pool_stats():
    """Mettre à jour les statistiques du pool"""
    try:
        data = request.get_json()
        
        stats = StakingStats.query.first()
        if not stats:
            stats = StakingStats()
            db.session.add(stats)
        
        # Mettre à jour les champs fournis
        if 'total_staked' in data:
            stats.total_staked = float(data['total_staked'])
        
        if 'total_rewards' in data:
            stats.total_rewards = float(data['total_rewards'])
        
        if 'active_stakers' in data:
            stats.active_stakers = int(data['active_stakers'])
        
        if 'current_apr' in data:
            stats.current_apr = float(data['current_apr'])
        
        stats.last_updated = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Statistiques mises à jour avec succès'
        })
        
    except Exception as e:
        logger.error(f"Erreur dans update_pool_stats: {e}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@pool_bp.route('/leaderboard', methods=['GET'])
def get_leaderboard():
    """Obtenir le classement des stakers"""
    try:
        # Données simulées pour le leaderboard
        # Dans une vraie implémentation, on récupérerait depuis la base de données
        leaderboard = [
            {
                'rank': 1,
                'address': '0x1234...5678',
                'amount_staked': '500000',
                'rewards_earned': '75000',
                'apr': '65%'
            },
            {
                'rank': 2,
                'address': '0x2345...6789',
                'amount_staked': '350000',
                'rewards_earned': '52500',
                'apr': '65%'
            },
            {
                'rank': 3,
                'address': '0x3456...7890',
                'amount_staked': '250000',
                'rewards_earned': '37500',
                'apr': '65%'
            },
            {
                'rank': 4,
                'address': '0x4567...8901',
                'amount_staked': '200000',
                'rewards_earned': '30000',
                'apr': '65%'
            },
            {
                'rank': 5,
                'address': '0x5678...9012',
                'amount_staked': '150000',
                'rewards_earned': '22500',
                'apr': '65%'
            }
        ]
        
        return jsonify({
            'success': True,
            'data': {
                'leaderboard': leaderboard,
                'last_updated': datetime.utcnow().isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Erreur dans get_leaderboard: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@pool_bp.route('/history', methods=['GET'])
def get_pool_history():
    """Obtenir l'historique du pool"""
    try:
        days = request.args.get('days', 30, type=int)
        
        # Données simulées pour l'historique
        # Dans une vraie implémentation, on récupérerait depuis la base de données
        import random
        history = []
        
        for i in range(days):
            date = datetime.utcnow() - timedelta(days=i)
            history.append({
                'date': date.strftime('%Y-%m-%d'),
                'total_staked': 1200000 + (random.randint(-50000, 50000)),
                'total_rewards': 850000 + (random.randint(-20000, 20000)),
                'active_stakers': 2800 + (random.randint(-100, 100)),
                'apr': 65 + (random.randint(-5, 10))
            })
        
        history.reverse()  # Du plus ancien au plus récent
        
        return jsonify({
            'success': True,
            'data': {
                'history': history,
                'period': f'{days} days'
            }
        })
        
    except Exception as e:
        logger.error(f"Erreur dans get_pool_history: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@pool_bp.route('/user_stakes/<address>', methods=['GET'])
def get_user_stakes(address):
    """Obtenir les stakes d'un utilisateur"""
    try:
        # Données simulées pour les stakes utilisateur
        # Dans une vraie implémentation, on récupérerait depuis la base de données
        user_stakes = [
            {
                'pool_id': 1,
                'amount': '15000',
                'reward_debt': '2500',
                'deposit_time': '2024-01-15T10:30:00',
                'lock_end_time': '2024-01-22T10:30:00',
                'pending_rewards': '3200'
            }
        ]
        
        total_staked = sum(float(stake['amount']) for stake in user_stakes)
        total_pending = sum(float(stake['pending_rewards']) for stake in user_stakes)
        
        return jsonify({
            'success': True,
            'data': {
                'address': address,
                'stakes': user_stakes,
                'total_staked': str(total_staked),
                'total_pending_rewards': str(total_pending)
            }
        })
        
    except Exception as e:
        logger.error(f"Erreur dans get_user_stakes: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500