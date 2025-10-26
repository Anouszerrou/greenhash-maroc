from flask import Blueprint, jsonify, request
import math
import logging
from datetime import datetime
from app import MiningCalculation, db

mining_bp = Blueprint('mining', __name__)
logger = logging.getLogger(__name__)

# Constantes de minage
BTC_BLOCK_REWARD = 6.25  # BTC par bloc
BLOCKS_PER_DAY = 144  # Blocs par jour en moyenne
NETWORK_HASHRATE_BTC = 180000000  # TH/s (exemple)
BTC_PRICE_USD = 30000  # Prix BTC simulé

@mining_bp.route('/calculate', methods=['POST'])
def calculate_mining_profitability():
    """Calculer la rentabilité du minage"""
    try:
        data = request.get_json()
        
        # Paramètres requis
        required_params = [
            'hashrate', 'power_cost', 'hardware_cost', 
            'pool_fee', 'maintenance_cost'
        ]
        
        for param in required_params:
            if param not in data:
                return jsonify({
                    'success': False,
                    'error': f'Paramètre manquant: {param}'
                }), 400
        
        # Extraction des paramètres
        hashrate = float(data['hashrate'])  # TH/s
        power_cost = float(data['power_cost'])  # $/kWh
        hardware_cost = float(data['hardware_cost'])  # $
        pool_fee = float(data['pool_fee'])  # %
        maintenance_cost = float(data['maintenance_cost'])  # $/mois
        difficulty = float(data.get('difficulty', 1.0))  # Facteur de difficulté
        
        # Calcul de la puissance électrique (estimation)
        power_consumption = hashrate * 100  # Watts par TH/s (estimation)
        power_cost_daily = (power_consumption / 1000) * power_cost * 24
        
        # Calcul de la probabilité de trouver un bloc
        network_hashrate = NETWORK_HASHRATE_BTC * difficulty
        miner_probability = hashrate / network_hashrate
        
        # Calcul des revenus quotidiens
        blocks_per_day_miner = BLOCKS_PER_DAY * miner_probability
        btc_earned_daily = blocks_per_day_miner * BTC_BLOCK_REWARD
        revenue_daily = btc_earned_daily * BTC_PRICE_USD
        
        # Calcul des frais
        pool_fee_daily = revenue_daily * (pool_fee / 100)
        maintenance_cost_daily = maintenance_cost / 30
        
        # Calcul des profits
        total_costs_daily = power_cost_daily + pool_fee_daily + maintenance_cost_daily
        profit_daily = revenue_daily - total_costs_daily
        profit_monthly = profit_daily * 30
        
        # Calcul du ROI
        roi_percentage = ((profit_monthly * 12) / hardware_cost) * 100 if hardware_cost > 0 else 0
        
        # Calcul du break-even
        break_even_days = hardware_cost / profit_daily if profit_daily > 0 else float('inf')
        
        # Calcul de l'impact environnemental (CO2 économisé)
        # Hypothèse : minage vert utilise 100% d'énergie renouvelable
        co2_factor = 0.5  # kg CO2/kWh (moyenne mondiale)
        co2_saved_daily = (power_consumption / 1000) * 24 * co2_factor
        
        # Calcul des arbres compensés (un arbre absorbe ~21kg CO2/an)
        trees_compensated_daily = co2_saved_daily * 365 / 21000
        
        # Sauvegarder dans la base de données
        calculation = MiningCalculation(
            wallet_address=data.get('wallet_address', ''),
            hashrate=hashrate,
            power_cost=power_cost,
            hardware_cost=hardware_cost,
            pool_fee=pool_fee,
            maintenance_cost=maintenance_cost,
            difficulty=difficulty,
            daily_profit=profit_daily,
            monthly_profit=profit_monthly,
            roi=roi_percentage,
            break_even_days=int(break_even_days) if break_even_days != float('inf') else 9999,
            co2_saved=co2_saved_daily,
            trees_compensated=trees_compensated_daily
        )
        
        db.session.add(calculation)
        db.session.commit()
        
        result = {
            'hashrate': hashrate,
            'revenue': {
                'daily_btc': btc_earned_daily,
                'daily_usd': revenue_daily,
                'monthly_usd': revenue_daily * 30
            },
            'costs': {
                'power_daily': power_cost_daily,
                'pool_fee_daily': pool_fee_daily,
                'maintenance_daily': maintenance_cost_daily,
                'total_daily': total_costs_daily
            },
            'profit': {
                'daily': profit_daily,
                'monthly': profit_monthly,
                'yearly': profit_daily * 365
            },
            'roi': roi_percentage,
            'break_even_days': int(break_even_days) if break_even_days != float('inf') else None,
            'environmental_impact': {
                'co2_saved_daily_kg': co2_saved_daily,
                'co2_saved_monthly_kg': co2_saved_daily * 30,
                'trees_compensated_daily': trees_compensated_daily,
                'trees_compensated_monthly': trees_compensated_daily * 30
            },
            'calculation_id': calculation.id
        }
        
        return jsonify({
            'success': True,
            'data': result,
            'timestamp': int(time.time())
        })
        
    except Exception as e:
        logger.error(f"Erreur dans calculate_mining_profitability: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@mining_bp.route('/equipment', methods=['GET'])
def get_mining_equipment():
    """Obtenir la liste des équipements de minage disponibles"""
    try:
        equipment = [
            {
                'id': 'antminer_s19',
                'name': 'Antminer S19 Pro',
                'hashrate': 110,  # TH/s
                'power_consumption': 3250,  # Watts
                'price': 2500,  # USD
                'efficiency': 29.5,  # J/TH
                'algorithm': 'SHA-256',
                'profitability': 15.5,  # USD/jour (estimation)
                'availability': 'In Stock'
            },
            {
                'id': 'whatsminer_m30s',
                'name': 'WhatsMiner M30S++',
                'hashrate': 112,  # TH/s
                'power_consumption': 3472,  # Watts
                'price': 2200,  # USD
                'efficiency': 31.0,  # J/TH
                'algorithm': 'SHA-256',
                'profitability': 14.8,  # USD/jour (estimation)
                'availability': 'In Stock'
            },
            {
                'id': 'antminer_s9',
                'name': 'Antminer S9',
                'hashrate': 14,  # TH/s
                'power_consumption': 1372,  # Watts
                'price': 300,  # USD
                'efficiency': 98.0,  # J/TH
                'algorithm': 'SHA-256',
                'profitability': 1.2,  # USD/jour (estimation)
                'availability': 'Used'
            }
        ]
        
        return jsonify({
            'success': True,
            'data': equipment,
            'timestamp': int(time.time())
        })
        
    except Exception as e:
        logger.error(f"Erreur dans get_mining_equipment: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@mining_bp.route('/difficulty', methods=['GET'])
def get_network_difficulty():
    """Obtenir la difficulté actuelle du réseau"""
    try:
        # Difficultés simulées (dans une vraie implémentation, on récupérerait depuis l'API du réseau)
        difficulties = {
            'bitcoin': {
                'difficulty': 25000000000000.0,
                'difficulty_change': -2.5,
                'next_difficulty_estimate': 24375000000000.0,
                'blocks_until_adjustment': 150,
                'estimated_adjustment_time': 1080000  # secondes
            },
            'greenhash': {
                'difficulty': 1.0,
                'difficulty_change': 0.0,
                'next_difficulty_estimate': 1.0,
                'blocks_until_adjustment': 0,
                'estimated_adjustment_time': 0
            }
        }
        
        return jsonify({
            'success': True,
            'data': difficulties,
            'timestamp': int(time.time())
        })
        
    except Exception as e:
        logger.error(f"Erreur dans get_network_difficulty: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500