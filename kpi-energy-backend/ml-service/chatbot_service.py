from flask import Blueprint, request, jsonify
from intent_classifier import IntentClassifier
from nlp_processor import NLPProcessor
import logging
import json
import os

# Création du blueprint pour le chatbot
chatbot_bp = Blueprint('chatbot', __name__)

# Initialisation des modèles NLP
classifier = IntentClassifier()
nlp_processor = NLPProcessor()

@chatbot_bp.route('/webhook/rest/webhook', methods=['POST'])
def chatbot_webhook():
    """
    Endpoint principal pour le chatbot - Remplace RASA
    """
    try:
        data = request.get_json()
        sender = data.get('sender', 'default')
        message = data.get('message', '')
        context = data.get('context', {})
        
        logging.info(f"Received message from {sender}: {message}")
        
        # Traitement NLP personnalisé
        intent = classifier.predict_intent(message)
        entities = nlp_processor.extract_entities(message)
        
        # Logique métier basée sur l'intention
        response = process_intent(intent, entities, context, message)
        
        return jsonify({
            "responses": [{
                "text": response['text'],
                "metadata": {
                    "intent": intent,
                    "entities": entities,
                    "data": response.get('data', {})
                }
            }]
        })
        
    except Exception as e:
        logging.error(f"Error processing chatbot message: {e}")
        return jsonify({
            "responses": [{
                "text": "Désolé, une erreur s'est produite lors du traitement de votre demande.",
                "metadata": {"intent": "error"}
            }]
        }), 500

def process_intent(intent, entities, context, message):
    """
    Logique métier basée sur l'intention détectée
    """
    intent_handlers = {
        "ask_anomalies_today": handle_anomalies_today,
        "ask_water_anomalies": handle_water_anomalies,
        "ask_critical_anomalies": handle_critical_anomalies,
        "ask_user_activity": handle_user_activity,
        "ask_data_modifications": handle_data_modifications,
        "ask_consumption_data": handle_consumption_data,
        "ask_comparison": handle_comparison,
        "greet": handle_greeting,
        "goodbye": handle_goodbye,
        "thanks": handle_thanks,
        "help": handle_help
    }
    
    handler = intent_handlers.get(intent, handle_default)
    return handler(entities, context, message)

# Handlers d'intentions
def handle_anomalies_today(entities, context, message):
    return {
        "text": "Je vais rechercher les anomalies détectées aujourd'hui...",
        "data": {"action": "fetch_today_anomalies"}
    }

def handle_water_anomalies(entities, context, message):
    month = entities.get('month', 'ce mois-ci')
    year = entities.get('year', 'cette année')
    return {
        "text": f"Analyse des anomalies d'eau pour {month}/{year}...",
        "data": {"action": "fetch_water_anomalies", "month": month, "year": year}
    }

def handle_critical_anomalies(entities, context, message):
    period = entities.get('period', 'cette semaine')
    return {
        "text": f"Recherche des anomalies critiques pour {period}...",
        "data": {"action": "fetch_critical_anomalies", "period": period}
    }

def handle_user_activity(entities, context, message):
    period = entities.get('period', 'ce mois')
    return {
        "text": f"Analyse de l'activité des utilisateurs pour {period}...",
        "data": {"action": "fetch_user_activity", "period": period}
    }

def handle_data_modifications(entities, context, message):
    data_type = entities.get('data_type', 'électricité')
    days = entities.get('days', 7)
    return {
        "text": f"Recherche des modifications de données {data_type} des derniers {days} jours...",
        "data": {"action": "fetch_data_modifications", "data_type": data_type, "days": days}
    }

def handle_consumption_data(entities, context, message):
    month = entities.get('month', 'ce mois-ci')
    year = entities.get('year', 'cette année')
    return {
        "text": f"Extraction des données de consommation pour {month}/{year}...",
        "data": {"action": "fetch_consumption_data", "month": month, "year": year}
    }

def handle_comparison(entities, context, message):
    year1 = entities.get('year1', '2023')
    year2 = entities.get('year2', '2024')
    return {
        "text": f"Comparaison des données entre {year1} et {year2}...",
        "data": {"action": "fetch_comparison", "year1": year1, "year2": year2}
    }

def handle_greeting(entities, context, message):
    return {
        "text": "Bonjour ! Je suis EnergyTracker Assistant. Comment puis-je vous aider aujourd'hui ?"
    }

def handle_goodbye(entities, context, message):
    return {
        "text": "Au revoir ! N'hésitez pas à me contacter si vous avez besoin d'aide."
    }

def handle_thanks(entities, context, message):
    return {
        "text": "Je vous en prie ! N'hésitez pas si vous avez d'autres questions."
    }

def handle_help(entities, context, message):
    help_text = """
    Je peux vous aider avec :
    • Anomalies aujourd'hui
    • Anomalies d'eau par mois/année
    • Anomalies critiques
    • Activité des utilisateurs
    • Modifications de données
    • Données de consommation
    • Comparaisons
    
    Que souhaitez-vous savoir ?
    """
    return {"text": help_text}

def handle_default(entities, context, message):
    return {
        "text": "Je n'ai pas bien compris. Pouvez-vous reformuler votre demande ?"
    }

@chatbot_bp.route('/chatbot/health', methods=['GET'])
def chatbot_health():
    return jsonify({
        "status": "healthy", 
        "service": "energy_chatbot",
        "version": "1.0.0"
    })