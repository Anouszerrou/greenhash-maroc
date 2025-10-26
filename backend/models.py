from datetime import datetime
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class Transaction(db.Model):
    __tablename__ = "transactions"

    id = db.Column(db.Integer, primary_key=True)
    hash = db.Column(db.String(66), unique=True, nullable=False)
    from_address = db.Column(db.String(42), nullable=False)
    to_address = db.Column(db.String(42), nullable=False)
    value = db.Column(db.String(50), nullable=False)
    gas_price = db.Column(db.String(50), nullable=False)
    gas_used = db.Column(db.String(50), nullable=False)
    block_number = db.Column(db.Integer, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    transaction_type = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(20), default="pending")


class MiningCalculation(db.Model):
    __tablename__ = "mining_calculations"

    id = db.Column(db.Integer, primary_key=True)
    wallet_address = db.Column(db.String(42), nullable=False)
    hashrate = db.Column(db.Float, nullable=False)
    power_cost = db.Column(db.Float, nullable=False)
    hardware_cost = db.Column(db.Float, nullable=False)
    pool_fee = db.Column(db.Float, nullable=False)
    maintenance_cost = db.Column(db.Float, nullable=False)
    difficulty = db.Column(db.Float, nullable=False)
    daily_profit = db.Column(db.Float, nullable=False)
    monthly_profit = db.Column(db.Float, nullable=False)
    roi = db.Column(db.Float, nullable=False)
    break_even_days = db.Column(db.Integer, nullable=False)
    co2_saved = db.Column(db.Float, nullable=False)
    trees_compensated = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class StakingStats(db.Model):
    __tablename__ = "staking_stats"

    id = db.Column(db.Integer, primary_key=True)
    total_staked = db.Column(db.Float, default=0)
    total_rewards = db.Column(db.Float, default=0)
    active_stakers = db.Column(db.Integer, default=0)
    current_apr = db.Column(db.Float, default=65.0)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)
