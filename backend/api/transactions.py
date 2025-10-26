from flask import Blueprint, jsonify, request
from datetime import datetime
import logging
from backend.models import Transaction, db

transactions_bp = Blueprint('transactions', __name__)
logger = logging.getLogger(__name__)

@transactions_bp.route('/log', methods=['POST'])
def log_transaction():
    """Enregistrer une transaction dans la base de données"""
    try:
        data = request.get_json()
        
        # Validation des données requises
        required_fields = ['hash', 'from_address', 'to_address', 'value', 'gas_price', 'gas_used', 'block_number', 'transaction_type']
        
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'success': False,
                    'error': f'Champ manquant: {field}'
                }), 400
        
        # Vérifier si la transaction existe déjà
        existing_tx = Transaction.query.filter_by(hash=data['hash']).first()
        if existing_tx:
            return jsonify({
                'success': False,
                'error': 'Transaction déjà enregistrée'
            }), 400
        
        # Créer une nouvelle transaction
        transaction = Transaction(
            hash=data['hash'],
            from_address=data['from_address'],
            to_address=data['to_address'],
            value=str(data['value']),
            gas_price=str(data['gas_price']),
            gas_used=str(data['gas_used']),
            block_number=int(data['block_number']),
            transaction_type=data['transaction_type'],
            status=data.get('status', 'pending')
        )
        
        db.session.add(transaction)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Transaction enregistrée avec succès',
            'data': {
                'id': transaction.id,
                'hash': transaction.hash,
                'timestamp': transaction.timestamp.isoformat()
            }
        })
        
    except Exception as e:
        logger.error(f"Erreur dans log_transaction: {e}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@transactions_bp.route('/history/<address>', methods=['GET'])
def get_transaction_history(address):
    """Obtenir l'historique des transactions pour une adresse"""
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        transaction_type = request.args.get('type', None)
        
        # Construire la requête
        query = Transaction.query.filter(
            (Transaction.from_address == address) | (Transaction.to_address == address)
        )
        
        if transaction_type:
            query = query.filter(Transaction.transaction_type == transaction_type)
        
        # Pagination
        transactions = query.order_by(Transaction.timestamp.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        # Formater les résultats
        transaction_list = []
        for tx in transactions.items:
            transaction_list.append({
                'id': tx.id,
                'hash': tx.hash,
                'from_address': tx.from_address,
                'to_address': tx.to_address,
                'value': tx.value,
                'gas_price': tx.gas_price,
                'gas_used': tx.gas_used,
                'block_number': tx.block_number,
                'timestamp': tx.timestamp.isoformat(),
                'transaction_type': tx.transaction_type,
                'status': tx.status
            })
        
        return jsonify({
            'success': True,
            'data': {
                'transactions': transaction_list,
                'total_pages': transactions.pages,
                'current_page': page,
                'total_transactions': transactions.total,
                'has_next': transactions.has_next,
                'has_prev': transactions.has_prev
            }
        })
        
    except Exception as e:
        logger.error(f"Erreur dans get_transaction_history: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@transactions_bp.route('/stats', methods=['GET'])
def get_transaction_stats():
    """Obtenir les statistiques des transactions"""
    try:
        # Statistiques globales
        total_transactions = Transaction.query.count()
        
        # Transactions par type
        staking_tx = Transaction.query.filter(Transaction.transaction_type == 'staking').count()
        swap_tx = Transaction.query.filter(Transaction.transaction_type == 'swap').count()
        invest_tx = Transaction.query.filter(Transaction.transaction_type == 'investment').count()
        
        # Volume total (approximation)
        from sqlalchemy import func
        total_volume = db.session.query(func.sum(Transaction.value.cast(db.Integer))).scalar() or 0
        
        # Transactions des 24 dernières heures
        from datetime import timedelta
        last_24h = datetime.utcnow() - timedelta(hours=24)
        recent_tx = Transaction.query.filter(Transaction.timestamp >= last_24h).count()
        
        return jsonify({
            'success': True,
            'data': {
                'total_transactions': total_transactions,
                'transactions_24h': recent_tx,
                'total_volume': str(total_volume),
                'by_type': {
                    'staking': staking_tx,
                    'swap': swap_tx,
                    'investment': invest_tx
                }
            }
        })
        
    except Exception as e:
        logger.error(f"Erreur dans get_transaction_stats: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@transactions_bp.route('/update_status', methods=['PUT'])
def update_transaction_status():
    """Mettre à jour le statut d'une transaction"""
    try:
        data = request.get_json()
        
        if 'hash' not in data or 'status' not in data:
            return jsonify({
                'success': False,
                'error': 'Hash et status sont requis'
            }), 400
        
        transaction = Transaction.query.filter_by(hash=data['hash']).first()
        if not transaction:
            return jsonify({
                'success': False,
                'error': 'Transaction non trouvée'
            }), 404
        
        transaction.status = data['status']
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Statut mis à jour avec succès'
        })
        
    except Exception as e:
        logger.error(f"Erreur dans update_transaction_status: {e}")
        db.session.rollback()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500