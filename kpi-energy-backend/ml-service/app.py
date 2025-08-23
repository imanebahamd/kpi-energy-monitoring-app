from flask import Flask, request, jsonify 
from flask_cors import CORS 
import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import json
import os
from chatbot_service import chatbot_bp

app = Flask(__name__)
CORS(app)

# Enregistrement du blueprint chatbot
app.register_blueprint(chatbot_bp, url_prefix='/api')

# Charger ou initialiser les modèles
MODELS_DIR = "models"
os.makedirs(MODELS_DIR, exist_ok=True)

def load_or_train_model(data_type):
    model_path = f"{MODELS_DIR}/{data_type}_model.joblib"
    scaler_path = f"{MODELS_DIR}/{data_type}_scaler.joblib"
    
    try:
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        print(f"Modèle {data_type} chargé depuis le disque")
    except:
        print(f"Entraînement d'un nouveau modèle pour {data_type}")
        # En production, vous chargeriez les données depuis la base de données
        # Pour l'exemple, nous créons un modèle basique
        model = IsolationForest(
            n_estimators=100, 
            contamination=0.05,  # 5% de anomalies attendues
            random_state=42
        )
        scaler = StandardScaler()
        
        # Sauvegarder les modèles
        joblib.dump(model, model_path)
        joblib.dump(scaler, scaler_path)
    
    return model, scaler

# Modèles pour chaque type de données
electricity_model, electricity_scaler = load_or_train_model("electricity")
water_model, water_scaler = load_or_train_model("water")

@app.route('/detect-anomaly', methods=['POST'])
def detect_anomaly():
    try:
        data = request.get_json()
        data_type = data.get('data_type')
        
        if data_type == 'electricity':
            return detect_electricity_anomaly(data)
        elif data_type == 'water':
            return detect_water_anomaly(data)
        else:
            return jsonify({'error': 'Type de données non supporté'}), 400
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def detect_electricity_anomaly(data):
    # Préparer les features
    features = [
        data.get('network60kv_active_energy', 0),
        data.get('network60kv_reactive_energy', 0),
        data.get('network60kv_peak', 0),
        data.get('network22kv_active_energy', 0),
        data.get('network22kv_reactive_energy', 0),
        data.get('network22kv_peak', 0),
        data.get('network60kv_power_factor', 0),
        data.get('network22kv_power_factor', 0)
    ]
    
    # Normaliser les features
    features_array = np.array(features).reshape(1, -1)
    features_scaled = electricity_scaler.fit_transform(features_array)
    
    # Détection d'anomalie
    prediction = electricity_model.predict(features_scaled)
    anomaly_score = electricity_model.decision_function(features_scaled)[0]
    
    # -1 = anomalie, 1 = normal
    is_anomaly = prediction[0] == -1
    
    # Déterminer le type d'anomalie
    anomaly_type = classify_electricity_anomaly(data, anomaly_score)
    
    return jsonify({
        'is_anomaly': bool(is_anomaly),
        'anomaly_score': float(anomaly_score),
        'anomaly_type': anomaly_type,
        'features': features
    })

def detect_water_anomaly(data):
    features = [
        data.get('f3bis', 0),
        data.get('f3', 0),
        data.get('se2', 0),
        data.get('se3bis', 0)
    ]
    
    features_array = np.array(features).reshape(1, -1)
    features_scaled = water_scaler.fit_transform(features_array)
    
    prediction = water_model.predict(features_scaled)
    anomaly_score = water_model.decision_function(features_scaled)[0]
    
    is_anomaly = prediction[0] == -1
    anomaly_type = classify_water_anomaly(data, anomaly_score)
    
    return jsonify({
        'is_anomaly': bool(is_anomaly),
        'anomaly_score': float(anomaly_score),
        'anomaly_type': anomaly_type,
        'features': features
    })

def classify_electricity_anomaly(data, anomaly_score):
    # Logique de classification des types d'anomalies électriques
    power_factor_60 = data.get('network60kv_power_factor', 1)
    power_factor_22 = data.get('network22kv_power_factor', 1)
    
    if power_factor_60 < 0.85 or power_factor_22 < 0.75:
        return "LOW_POWER_FACTOR"
    
    active_energy_60 = data.get('network60kv_active_energy', 0)
    peak_60 = data.get('network60kv_peak', 0)
    
    # Vérifier les ratios anormaux
    if peak_60 > 0 and active_energy_60 / peak_60 < 500:  #Ratio anormal
        return "CONSUMPTION_SPIKE"
    
    # Vérifier les valeurs nulles ou extrêmes
    if any(value == 0 for value in [
        data.get('network60kv_active_energy'),
        data.get('network22kv_active_energy')
    ]):
        return "DATA_ENTRY_ERROR"
    
    return "GENERAL_ANOMALY"

def classify_water_anomaly(data, anomaly_score):
    f3bis = data.get('f3bis', 0)
    f3 = data.get('f3', 0)
    se2 = data.get('se2', 0)
    se3bis = data.get('se3bis', 0)
    
    # Vérifier les valeurs nulles
    if any(value == 0 for value in [f3bis, f3, se2, se3bis]):
        return "DATA_ENTRY_ERROR"
    
    # Vérifier les fuites (valeurs anormalement élevées)
    total = f3bis + f3 + se2 + se3bis
    if total > 500000:  # Seuil arbitraire, à ajuster selon vos données
        return "WATER_LEAK"
    
    # Vérifier les ratios entre stations
    if f3bis > 0 and f3 / f3bis > 2.0:  # Ratio anormal
        return "PRODUCTION_ISSUE"
    
    return "GENERAL_ANOMALY"




@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'services': ['anomaly_detection', 'chatbot']
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)