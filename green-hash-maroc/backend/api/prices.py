from flask import Blueprint, jsonify, request
import requests
import os
from dotenv import load_dotenv
import logging

load_dotenv()

prices_bp = Blueprint('prices', __name__)
logger = logging.getLogger(__name__)

COINGECKO_API_URL = "https://api.coingecko.com/api/v3"
CACHE = {}
CACHE_DURATION = 60  # 1 minute

def get_cached_price(crypto_id):
    """Récupérer le prix depuis le cache ou l'API"""
    import time
    current_time = time.time()
    
    if crypto_id in CACHE:
        cached_data = CACHE[crypto_id]
        if current_time - cached_data['timestamp'] < CACHE_DURATION:
            return cached_data['data']
    
    try:
        # Récupérer les prix en USD et EUR
        response = requests.get(
            f"{COINGECKO_API_URL}/simple/price",
            params={
                'ids': crypto_id,
                'vs_currencies': 'usd,eur',
                'include_24hr_change': 'true',
                'include_market_cap': 'true',
                'include_24hr_vol': 'true'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            CACHE[crypto_id] = {
                'data': data,
                'timestamp': current_time
            }
            return data
        else:
            logger.error(f"Erreur API CoinGecko: {response.status_code}")
            return None
            
    except Exception as e:
        logger.error(f"Erreur lors de la récupération du prix: {e}")
        return None

@prices_bp.route('/live', methods=['GET'])
def get_live_prices():
    """Récupérer les prix en temps réel des cryptomonnaies"""
    try:
        # Cryptomonnaies à surveiller
        cryptos = {
            'bitcoin': 'BTC',
            'binancecoin': 'BNB',
            'tether': 'USDT',
            'ethereum': 'ETH'
        }
        
        prices = {}
        
        for crypto_id, symbol in cryptos.items():
            price_data = get_cached_price(crypto_id)
            if price_data and crypto_id in price_data:
                prices[symbol] = {
                    'usd': price_data[crypto_id].get('usd', 0),
                    'eur': price_data[crypto_id].get('eur', 0),
                    'change_24h': price_data[crypto_id].get('usd_24h_change', 0),
                    'market_cap': price_data[crypto_id].get('usd_market_cap', 0),
                    'volume_24h': price_data[crypto_id].get('usd_24h_vol', 0),
                    'last_updated': price_data[crypto_id].get('last_updated_at', int(time.time()))
                }
        
        # Ajouter le prix de notre token GREENHASH (simulé pour le moment)
        prices['GREENHASH'] = {
            'usd': 0.05,  # Prix simulé
            'eur': 0.045,
            'change_24h': 2.5,
            'market_cap': 5000000,
            'volume_24h': 100000,
            'last_updated': int(time.time())
        }
        
        return jsonify({
            'success': True,
            'data': prices,
            'timestamp': int(time.time())
        })
        
    except Exception as e:
        logger.error(f"Erreur dans get_live_prices: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@prices_bp.route('/history/<crypto_id>', methods=['GET'])
def get_price_history(crypto_id):
    """Récupérer l'historique des prix"""
    try:
        days = request.args.get('days', 7, type=int)
        
        response = requests.get(
            f"{COINGECKO_API_URL}/coins/{crypto_id}/market_chart",
            params={
                'vs_currency': 'usd',
                'days': days,
                'interval': 'daily'
            },
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            
            # Formater les données pour le graphique
            prices = []
            for timestamp, price in data['prices']:
                prices.append({
                    'timestamp': timestamp,
                    'price': price
                })
            
            return jsonify({
                'success': True,
                'data': {
                    'prices': prices,
                    'market_caps': data['market_caps'],
                    'total_volumes': data['total_volumes']
                }
            })
        else:
            return jsonify({
                'success': False,
                'error': f'Erreur API: {response.status_code}'
            }), 400
            
    except Exception as e:
        logger.error(f"Erreur dans get_price_history: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500