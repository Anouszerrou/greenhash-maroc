from flask import Blueprint, jsonify, request
import requests
import json
import os
from dotenv import load_dotenv
import logging
import time

load_dotenv()

dex_bp = Blueprint('dex', __name__)
logger = logging.getLogger(__name__)

# Adresses des contrats sur BSC Testnet
PANCAKE_ROUTER_ADDRESS = "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3"
WBNB_ADDRESS = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd"
USDT_ADDRESS = "0x7ef95a0FEE0Dd31b22626fA2e10Ee6A223F8a684"
GREENHASH_TOKEN_ADDRESS = "0x0000000000000000000000000000000000000000"  # À remplacer

@dex_bp.route('/quote', methods=['GET'])
def get_swap_quote():
    """Obtenir un devis pour un échange"""
    try:
        from_token = request.args.get('fromToken', '').upper()
        to_token = request.args.get('toToken', '').upper()
        amount = request.args.get('amount', type=float)
        
        if not from_token or not to_token or not amount:
            return jsonify({
                'success': False,
                'error': 'Paramètres manquants: fromToken, toToken, amount'
            }), 400
        
        # Taux de change simulés (dans une vraie implémentation, on utiliserait un DEX)
        exchange_rates = {
            'BNB-USDT': 300.0,
            'USDT-BNB': 1/300.0,
            'BNB-GREENHASH': 6000.0,  # 1 BNB = 6000 GREENHASH
            'GREENHASH-BNB': 1/6000.0,
            'USDT-GREENHASH': 20.0,   # 1 USDT = 20 GREENHASH
            'GREENHASH-USDT': 1/20.0
        }
        
        pair = f"{from_token}-{to_token}"
        if pair not in exchange_rates:
            return jsonify({
                'success': False,
                'error': f'Paire non supportée: {pair}'
            }), 400
        
        rate = exchange_rates[pair]
        output_amount = amount * rate
        
        # Simuler les frais (0.1%)
        fee_amount = output_amount * 0.001
        final_amount = output_amount - fee_amount
        
        # Adresses des tokens
        token_addresses = {
            'BNB': WBNB_ADDRESS,
            'USDT': USDT_ADDRESS,
            'GREENHASH': GREENHASH_TOKEN_ADDRESS
        }
        
        quote = {
            'fromToken': {
                'symbol': from_token,
                'address': token_addresses.get(from_token, ''),
                'amount': amount
            },
            'toToken': {
                'symbol': to_token,
                'address': token_addresses.get(to_token, ''),
                'amount': final_amount
            },
            'exchangeRate': rate,
            'fee': {
                'amount': fee_amount,
                'percentage': 0.1,
                'currency': to_token
            },
            'minimumReceived': final_amount * 0.99,  # 1% de slippage maximum
            'priceImpact': 0.1,
            'route': [from_token, to_token],
            'estimatedGas': 150000  # Estimation des frais de gaz
        }
        
        return jsonify({
            'success': True,
            'data': quote,
            'timestamp': int(time.time())
        })
        
    except Exception as e:
        logger.error(f"Erreur dans get_swap_quote: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@dex_bp.route('/tokens', methods=['GET'])
def get_supported_tokens():
    """Obtenir la liste des tokens supportés"""
    try:
        tokens = [
            {
                'symbol': 'BNB',
                'name': 'BNB',
                'address': WBNB_ADDRESS,
                'decimals': 18,
                'chainId': 97,
                'logoURI': 'https://tokens.pancakeswap.finance/images/0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c.png'
            },
            {
                'symbol': 'USDT',
                'name': 'Tether USD',
                'address': USDT_ADDRESS,
                'decimals': 18,
                'chainId': 97,
                'logoURI': 'https://tokens.pancakeswap.finance/images/0x55d398326f99059fF775485246999027B3197955.png'
            },
            {
                'symbol': 'GREENHASH',
                'name': 'Green Hash Token',
                'address': GREENHASH_TOKEN_ADDRESS,
                'decimals': 18,
                'chainId': 97,
                'logoURI': '/greenhash-logo.png'  # Logo local
            }
        ]
        
        return jsonify({
            'success': True,
            'data': tokens,
            'timestamp': int(time.time())
        })
        
    except Exception as e:
        logger.error(f"Erreur dans get_supported_tokens: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@dex_bp.route('/liquidity/<token_pair>', methods=['GET'])
def get_liquidity_info(token_pair):
    """Obtenir les informations de liquidité pour une paire"""
    try:
        # Informations de liquidité simulées
        liquidity_data = {
            'BNB-USDT': {
                'reserve0': 1000.0,  # BNB
                'reserve1': 300000.0,  # USDT
                'totalLiquidity': 500000.0,
                'volume24h': 150000.0,
                'fees24h': 150.0
            },
            'BNB-GREENHASH': {
                'reserve0': 100.0,  # BNB
                'reserve1': 600000.0,  # GREENHASH
                'totalLiquidity': 100000.0,
                'volume24h': 25000.0,
                'fees24h': 25.0
            }
        }
        
        if token_pair not in liquidity_data:
            return jsonify({
                'success': False,
                'error': f'Paire non trouvée: {token_pair}'
            }), 404
        
        return jsonify({
            'success': True,
            'data': liquidity_data[token_pair],
            'timestamp': int(time.time())
        })
        
    except Exception as e:
        logger.error(f"Erreur dans get_liquidity_info: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500