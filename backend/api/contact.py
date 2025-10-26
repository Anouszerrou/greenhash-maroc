from flask import Blueprint, request, current_app, jsonify
import os
import smtplib
from email.message import EmailMessage

contact_bp = Blueprint('contact', __name__)


@contact_bp.route('/', methods=['POST'])
def send_contact_email():
    data = request.get_json() or {}
    name = data.get('name', '').strip()
    email = data.get('email', '').strip()
    subject = data.get('subject', 'Nouveau message depuis le formulaire de contact').strip()
    message = data.get('message', '').strip()

    if not name or not email or not message:
        return jsonify({'error': 'name, email et message sont requis'}), 400

    SMTP_HOST = os.getenv('SMTP_HOST')
    SMTP_PORT = int(os.getenv('SMTP_PORT', 587))
    SMTP_USER = os.getenv('SMTP_USER')
    SMTP_PASS = os.getenv('SMTP_PASS')
    RECEIVER = os.getenv('CONTACT_RECEIVER', SMTP_USER)

    if not SMTP_HOST or not SMTP_USER or not SMTP_PASS:
        current_app.logger.error('SMTP configuration manquante')
        return jsonify({'error': 'SMTP server not configured on the backend'}), 500

    email_msg = EmailMessage()
    email_msg['Subject'] = f"[GreenHash Maroc] {subject}"
    email_msg['From'] = SMTP_USER
    email_msg['To'] = RECEIVER
    body = f"Name: {name}\nEmail: {email}\n\nMessage:\n{message}\n"
    email_msg.set_content(body)

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(SMTP_USER, SMTP_PASS)
            smtp.send_message(email_msg)
    except Exception as e:
        current_app.logger.exception('Failed to send contact email: %s', e)
        return jsonify({'error': 'Erreur lors de l\'envoi du courriel'}), 500

    return jsonify({'message': 'Votre message a été envoyé avec succès'}), 200
