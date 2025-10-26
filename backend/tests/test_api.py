"""
Tests for the Green Hash Maroc API endpoints.
"""
import pytest
from flask import url_for
from backend import create_app
from backend.models import db, MiningCalculation
from backend.config import TestingConfig

@pytest.fixture
def app():
    """Create and configure a new app instance for each test."""
    app = create_app()
    # Load testing config
    app.config.from_object(TestingConfig)

    # Create tables for testing
    with app.app_context():
        db.create_all()

    yield app

    # Clean up / reset resources
    with app.app_context():
        db.drop_all()

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture
def runner(app):
    """A test runner for the app's Click commands."""
    return app.test_cli_runner()

def test_health_check(client):
    """Test the health check endpoint."""
    response = client.get('/api/health')
    assert response.status_code == 200
    json_data = response.get_json()
    # Implementation returns 'ok' as status
    assert json_data['status'] in ('ok', 'healthy')
    assert 'timestamp' in json_data

def test_mining_test_endpoint(client):
    """Test the mining test endpoint."""
    response = client.get('/api/mining/test')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['success'] is True
    assert 'message' in json_data

def test_mining_calculation(client):
    """Test mining profitability calculation."""
    test_data = {
        'hashrate': 100,
        'power_cost': 0.12,
        'hardware_cost': 10000,
        'pool_fee': 2,
        'maintenance_cost': 500
    }
    
    response = client.post('/api/mining/calculate', json=test_data)
    assert response.status_code == 200
    
    json_data = response.get_json()
    assert json_data['success'] is True
    # The implementation returns a 'profit' object with 'daily' and 'monthly'
    assert 'data' in json_data
    assert 'profit' in json_data['data']
    assert 'daily' in json_data['data']['profit']
    assert 'monthly' in json_data['data']['profit']

def test_invalid_mining_calculation(client):
    """Test mining calculation with invalid data."""
    test_data = {
        'hashrate': 'invalid',
        'power_cost': 0.12
    }
    
    response = client.post('/api/mining/calculate', json=test_data)
    assert response.status_code == 400
    json_data = response.get_json()
    assert json_data['success'] is False
    assert 'error' in json_data

def test_database_operations(app):
    """Test database create and read operations."""
    with app.app_context():
        # Create a test calculation
        calc = MiningCalculation(
            wallet_address='0x0000000000000000000000000000000000000000',
            hashrate=100.0,
            power_cost=0.12,
            hardware_cost=10000.0,
            pool_fee=2.0,
            maintenance_cost=500.0,
            difficulty=1.0,
            daily_profit=50.0,
            monthly_profit=1500.0,
            roi=200.0,
            break_even_days=200,
            co2_saved=0.0,
            trees_compensated=0.0
        )
        db.session.add(calc)
        db.session.commit()
        
        # Read and verify
        saved_calc = MiningCalculation.query.first()
        assert saved_calc is not None
        assert saved_calc.hashrate == 100
        assert saved_calc.power_cost == 0.12
        assert saved_calc.daily_profit == 50.0

def test_json_structure(client):
    """Test JSON response structure consistency."""
    endpoints = [
        ('GET', '/api/health'),
        ('GET', '/api/mining/test')
    ]
    
    for method, endpoint in endpoints:
        response = client.open(endpoint, method=method)
        assert response.status_code == 200
        assert response.is_json
        json_data = response.get_json()
        
        # Common fields all responses should have
        assert isinstance(json_data, dict)
        if method == 'GET' and endpoint == '/api/health':
            assert 'status' in json_data
        else:
            assert 'success' in json_data