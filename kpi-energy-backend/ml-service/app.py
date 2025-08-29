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

    print(f"📋 Features électriques brutes: {features}")

    features_array = np.array(features).reshape(1, -1)
    features_scaled = electricity_scaler.transform(features_array)

    print(f"📊 Features électriques scaled: {features_scaled}")

    prediction = electricity_model.predict(features_scaled)
    anomaly_score = electricity_model.decision_function(features_scaled)[0]

    print(f"🔮 Prédiction électrique: {prediction[0]}")
    print(f"📈 Score d'anomalie électrique: {anomaly_score}")

    anomaly_type = classify_electricity_anomaly(data, anomaly_score)
    is_anomaly = (prediction[0] == -1) or (anomaly_type not in ["GENERAL_ANOMALY"])


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

    print(f"📋 Features eau brutes: {features}")

    features_array = np.array(features).reshape(1, -1)
    features_scaled = water_scaler.transform(features_array)

    print(f"📊 Features eau scaled: {features_scaled}")

    prediction = water_model.predict(features_scaled)
    anomaly_score = water_model.decision_function(features_scaled)[0]

    print(f"🔮 Prédiction eau: {prediction[0]}")
    print(f"📈 Score d'anomalie eau: {anomaly_score}")

    anomaly_type = classify_water_anomaly(data, anomaly_score)
    is_anomaly = (prediction[0] == -1) or (anomaly_type not in ["GENERAL_ANOMALY"])


    return jsonify({
        'is_anomaly': bool(is_anomaly),
        'anomaly_score': float(anomaly_score),
        'anomaly_type': anomaly_type,
        'features': features
    })


def classify_electricity_anomaly(data, anomaly_score):
    print(f"🔍 Début classification électrique - Score: {anomaly_score}")
    print(f"📊 Données électriques: {data}")

    power_factor_60 = data.get('network60kv_power_factor', 1)
    power_factor_22 = data.get('network22kv_power_factor', 1)

    print(f"📏 Facteur puissance 60kV: {power_factor_60}")
    print(f"📏 Facteur puissance 22kV: {power_factor_22}")

    # Test LOW_POWER_FACTOR
    if power_factor_60 < 0.85:
        print("✅ Détection LOW_POWER_FACTOR (60kV < 0.85)")
        return "LOW_POWER_FACTOR"
    if power_factor_22 < 0.75:
        print("✅ Détection LOW_POWER_FACTOR (22kV < 0.75)")
        return "LOW_POWER_FACTOR"

    # Test CONSUMPTION_SPIKE
    active_energy_60 = data.get('network60kv_active_energy', 0)
    peak_60 = data.get('network60kv_peak', 0)

    print(f"⚡ Energie active 60kV: {active_energy_60}")
    print(f"📊 Pic 60kV: {peak_60}")

    if peak_60 > 0:
        ratio = active_energy_60 / peak_60
        print(f"📈 Ratio énergie/pic: {ratio}")
        if ratio < 500:
            print("✅ Détection CONSUMPTION_SPIKE (ratio < 500)")
            return "CONSUMPTION_SPIKE"

    # Test DATA_ENTRY_ERROR
    energy_60 = data.get('network60kv_active_energy')
    energy_22 = data.get('network22kv_active_energy')

    print(f"🔍 Vérification données nulles - 60kV: {energy_60}, 22kV: {energy_22}")

    if any(value == 0 for value in [energy_60, energy_22]):
        print("✅ Détection DATA_ENTRY_ERROR (valeur nulle)")
        return "DATA_ENTRY_ERROR"

    # Classification basée sur le score
    if anomaly_score < -0.5:
        print("✅ Détection SEVERE_ANOMALY (score < -0.5)")
        return "SEVERE_ANOMALY"
    elif anomaly_score < -0.2:
        print("✅ Détection MODERATE_ANOMALY (score < -0.2)")
        return "MODERATE_ANOMALY"

    print("⚠️  Aucune condition spécifique détectée, retour GENERAL_ANOMALY")
    return "GENERAL_ANOMALY"


def classify_water_anomaly(data, anomaly_score):
    print(f"🔍 Début classification eau - Score: {anomaly_score}")
    print(f"📊 Données eau: {data}")

    f3bis = data.get('f3bis', 0)
    f3 = data.get('f3', 0)
    se2 = data.get('se2', 0)
    se3bis = data.get('se3bis', 0)

    print(f"💧 F3bis: {f3bis}, F3: {f3}, SE2: {se2}, SE3bis: {se3bis}")

    # Test DATA_ENTRY_ERROR
    if any(value == 0 for value in [f3bis, f3, se2, se3bis]):
        print("✅ Détection DATA_ENTRY_ERROR (valeur nulle)")
        return "DATA_ENTRY_ERROR"

    # Test WATER_LEAK
    total = f3bis + f3 + se2 + se3bis
    print(f"📊 Total consommation eau: {total}")

    if total > 500000:
        print("✅ Détection WATER_LEAK (total > 500000)")
        return "WATER_LEAK"

    # Test PRODUCTION_ISSUE
    if f3bis > 0:
        ratio = f3 / f3bis
        print(f"📈 Ratio F3/F3bis: {ratio}")
        if ratio > 2.0:
            print("✅ Détection PRODUCTION_ISSUE (ratio > 2.0)")
            return "PRODUCTION_ISSUE"

    # Test LOW_CONSUMPTION
    if total < 50000:
        print("✅ Détection LOW_CONSUMPTION (total < 50000)")
        return "LOW_CONSUMPTION"

    # Classification basée sur le score
    if anomaly_score < -0.5:
        print("✅ Détection SEVERE_WATER_ANOMALY (score < -0.5)")
        return "SEVERE_WATER_ANOMALY"
    elif anomaly_score < -0.2:
        print("✅ Détection MODERATE_WATER_ANOMALY (score < -0.2)")
        return "MODERATE_WATER_ANOMALY"

    print("⚠️  Aucune condition spécifique détectée, retour GENERAL_ANOMALY")
    return "GENERAL_ANOMALY"


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'services': ['anomaly_detection']
    })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)