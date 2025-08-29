from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import joblib
import os

app = Flask(__name__)
CORS(app)

# Répertoire des modèles
MODELS_DIR = "models"
os.makedirs(MODELS_DIR, exist_ok=True)

def load_model(data_type):
    """
    Charge les modèles et scalers depuis le disque.
    Si un modèle n'existe pas, lève une erreur.
    """
    model_path = os.path.join(MODELS_DIR, f"{data_type}_model.joblib")
    scaler_path = os.path.join(MODELS_DIR, f"{data_type}_scaler.joblib")

    if os.path.exists(model_path) and os.path.exists(scaler_path):
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        print(f"✅ Modèle {data_type} chargé depuis le disque")
        return model, scaler
    else:
        raise RuntimeError(
            f"❌ Modèle {data_type} introuvable. Lance d'abord 'python3 train_models.py' pour entraîner et sauvegarder les modèles."
        )

# Chargement des modèles
electricity_model, electricity_scaler = load_model("electricity")
water_model, water_scaler = load_model("water")

@app.route('/detect-anomaly', methods=['POST'])
def detect_anomaly():
    try:
        data = request.get_json()
        print("📥 Données reçues:", data)

        data_type = data.get('data_type')

        if data_type == 'electricity':
            return detect_electricity_anomaly(data)
        elif data_type == 'water':
            return detect_water_anomaly(data)
        else:
            return jsonify({'error': 'Type de données non supporté'}), 400

    except Exception as e:
        import traceback
        print("❌ Erreur détectée dans /detect-anomaly :")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


def detect_electricity_anomaly(data):
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

    features_array = np.array(features).reshape(1, -1)
    features_scaled = electricity_scaler.transform(features_array)

    prediction = electricity_model.predict(features_scaled)
    anomaly_score = electricity_model.decision_function(features_scaled)[0]

    is_anomaly = prediction[0] == -1
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
    features_scaled = water_scaler.transform(features_array)

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
    power_factor_60 = data.get('network60kv_power_factor', 1)
    power_factor_22 = data.get('network22kv_power_factor', 1)

    if power_factor_60 < 0.85 or power_factor_22 < 0.75:
        return "LOW_POWER_FACTOR"

    active_energy_60 = data.get('network60kv_active_energy', 0)
    peak_60 = data.get('network60kv_peak', 0)

    if peak_60 > 0 and active_energy_60 / peak_60 < 500:
        return "CONSUMPTION_SPIKE"

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

    if any(value == 0 for value in [f3bis, f3, se2, se3bis]):
        return "DATA_ENTRY_ERROR"

    total = f3bis + f3 + se2 + se3bis
    if total > 500000:
        return "WATER_LEAK"

    if f3bis > 0 and f3 / f3bis > 2.0:
        return "PRODUCTION_ISSUE"

    return "GENERAL_ANOMALY"


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'services': ['anomaly_detection']
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)