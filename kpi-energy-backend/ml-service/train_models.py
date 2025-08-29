import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os

def create_training_data():
    # Données normales
    np.random.seed(42)
    n_samples = 1000

    # Données électriques normales
    electricity_data = {
        'network60kv_active_energy': np.random.normal(10000000, 2000000, n_samples),
        'network60kv_reactive_energy': np.random.normal(16000, 3000, n_samples),
        'network60kv_peak': np.random.normal(750, 150, n_samples),
        'network22kv_active_energy': np.random.normal(300000, 50000, n_samples),
        'network22kv_reactive_energy': np.random.normal(5500, 1000, n_samples),
        'network22kv_peak': np.random.normal(80, 20, n_samples),
        'network60kv_power_factor': np.random.normal(0.92, 0.03, n_samples),
        'network22kv_power_factor': np.random.normal(0.85, 0.04, n_samples)
    }

    # Données eau normales
    water_data = {
        'f3bis': np.random.normal(120000, 20000, n_samples),
        'f3': np.random.normal(110000, 18000, n_samples),
        'se2': np.random.normal(35000, 8000, n_samples),
        'se3bis': np.random.normal(32000, 7000, n_samples)
    }

    # Ajouter 10% d'anomalies pour chaque type
    n_anomalies = int(n_samples * 0.10)

    # ===== ANOMALIES ÉLECTRIQUES =====
    # Anomalies TRÈS BAISSES (valeurs extrêmement basses)
    electricity_anomalies_low = {
        'network60kv_active_energy': np.random.uniform(5000000, 8000000, n_anomalies),    # TRÈS BAS
        'network60kv_reactive_energy': np.random.uniform(5000, 10000, n_anomalies),       # TRÈS BAS
        'network60kv_peak': np.random.uniform(300, 500, n_anomalies),                     # TRÈS BAS
        'network22kv_active_energy': np.random.uniform(100000, 200000, n_anomalies),      # TRÈS BAS
        'network22kv_reactive_energy': np.random.uniform(2000, 4000, n_anomalies),        # TRÈS BAS
        'network22kv_peak': np.random.uniform(30, 50, n_anomalies),                       # TRÈS BAS
        'network60kv_power_factor': np.random.uniform(0.5, 0.7, n_anomalies),             # TRÈS BAS
        'network22kv_power_factor': np.random.uniform(0.5, 0.7, n_anomalies)              # TRÈS BAS
    }

    # Anomalies TRÈS ÉLEVÉES (valeurs extrêmement élevées)
    electricity_anomalies_high = {
        'network60kv_active_energy': np.random.uniform(20000000, 30000000, n_anomalies),  # TRÈS ÉLEVÉ
        'network60kv_reactive_energy': np.random.uniform(30000, 40000, n_anomalies),      # TRÈS ÉLEVÉ
        'network60kv_peak': np.random.uniform(1500, 2000, n_anomalies),                   # TRÈS ÉLEVÉ
        'network22kv_active_energy': np.random.uniform(600000, 800000, n_anomalies),      # TRÈS ÉLEVÉ
        'network22kv_reactive_energy': np.random.uniform(10000, 15000, n_anomalies),      # TRÈS ÉLEVÉ
        'network22kv_peak': np.random.uniform(150, 200, n_anomalies),                     # TRÈS ÉLEVÉ
        'network60kv_power_factor': np.random.uniform(0.98, 1.0, n_anomalies),            # TRÈS ÉLEVÉ
        'network22kv_power_factor': np.random.uniform(0.95, 1.0, n_anomalies)             # TRÈS ÉLEVÉ
    }

    # Anomalies INCOHÉRENTES (combinaisons anormales)
    electricity_anomalies_mixed = {
        'network60kv_active_energy': np.random.uniform(18000000, 25000000, n_anomalies),  # Élevé
        'network60kv_reactive_energy': np.random.uniform(5000, 10000, n_anomalies),       # Bas
        'network60kv_peak': np.random.uniform(300, 500, n_anomalies),                     # Bas
        'network22kv_active_energy': np.random.uniform(100000, 200000, n_anomalies),      # Bas
        'network22kv_reactive_energy': np.random.uniform(8000, 12000, n_anomalies),       # Élevé
        'network22kv_peak': np.random.uniform(150, 200, n_anomalies),                     # Élevé
        'network60kv_power_factor': np.random.uniform(0.5, 0.7, n_anomalies),             # Bas
        'network22kv_power_factor': np.random.uniform(0.95, 1.0, n_anomalies)             # Élevé
    }

    # ===== ANOMALIES EAU =====
    # Anomalies eau TRÈS ÉLEVÉES (fuites)
    water_anomalies_high = {
        'f3bis': np.random.uniform(300000, 400000, n_anomalies),  # TRÈS ÉLEVÉ
        'f3': np.random.uniform(250000, 350000, n_anomalies),     # TRÈS ÉLEVÉ
        'se2': np.random.uniform(80000, 100000, n_anomalies),     # TRÈS ÉLEVÉ
        'se3bis': np.random.uniform(70000, 90000, n_anomalies)    # TRÈS ÉLEVÉ
    }

    # Anomalies eau TRÈS BAISSES (problèmes production)
    water_anomalies_low = {
        'f3bis': np.random.uniform(50000, 80000, n_anomalies),    # TRÈS BAS
        'f3': np.random.uniform(40000, 70000, n_anomalies),       # TRÈS BAS
        'se2': np.random.uniform(10000, 20000, n_anomalies),      # TRÈS BAS
        'se3bis': np.random.uniform(8000, 15000, n_anomalies)     # TRÈS BAS
    }

    # Anomalies eau INCOHÉRENTES (ratios anormaux)
    water_anomalies_mixed = {
        'f3bis': np.random.uniform(50000, 80000, n_anomalies),    # Bas
        'f3': np.random.uniform(200000, 250000, n_anomalies),     # Élevé (ratio > 3)
        'se2': np.random.uniform(30000, 40000, n_anomalies),      # Normal
        'se3bis': np.random.uniform(30000, 35000, n_anomalies)    # Normal
    }

    # ===== CONCATÉNATION FINALE =====
    # Électricité: normales + 3 types d'anomalies
    electricity_df = pd.concat([
        pd.DataFrame(electricity_data),
        pd.DataFrame(electricity_anomalies_low),
        pd.DataFrame(electricity_anomalies_high),
        pd.DataFrame(electricity_anomalies_mixed)
    ])

    # Eau: normales + 3 types d'anomalies
    water_df = pd.concat([
        pd.DataFrame(water_data),
        pd.DataFrame(water_anomalies_high),
        pd.DataFrame(water_anomalies_low),
        pd.DataFrame(water_anomalies_mixed)
    ])

    print(f"📊 Dataset électrique: {len(electricity_data)} normales + {3*n_anomalies} anomalies")
    print(f"📊 Dataset eau: {len(water_data)} normales + {3*n_anomalies} anomalies")

    return electricity_df, water_df

def train_models():
    electricity_df, water_df = create_training_data()

    # Entraîner le modèle électrique avec paramètres optimisés
    electricity_scaler = StandardScaler()
    electricity_scaled = electricity_scaler.fit_transform(electricity_df)

    electricity_model = IsolationForest(
        n_estimators=200,           # Augmenter le nombre d'arbres
        contamination=0.25,         # Contamination plus élevée (25%)
        random_state=42,
        max_samples=256,            # Taille d'échantillon
        max_features=0.8,           # Utiliser 80% des features
        n_jobs=-1,                  # Utiliser tous les CPU
        verbose=1                   # Afficher la progression
    )
    print("🔄 Entraînement du modèle électrique...")
    electricity_model.fit(electricity_scaled)

    # Entraîner le modèle eau
    water_scaler = StandardScaler()
    water_scaled = water_scaler.fit_transform(water_df)

    water_model = IsolationForest(
        n_estimators=200,
        contamination=0.20,         # 20% de contamination
        random_state=42,
        max_samples=256,
        max_features=1.0,           # Utiliser toutes les features
        n_jobs=-1,
        verbose=1
    )
    print("🔄 Entraînement du modèle eau...")
    water_model.fit(water_scaled)

    # Sauvegarder les modèles
    os.makedirs("models", exist_ok=True)
    joblib.dump(electricity_model, "models/electricity_model.joblib")
    joblib.dump(electricity_scaler, "models/electricity_scaler.joblib")
    joblib.dump(water_model, "models/water_model.joblib")
    joblib.dump(water_scaler, "models/water_scaler.joblib")

    # Afficher les statistiques
    print("\n✅ Modèles entraînés et sauvegardés avec succès!")
    print(f"📈 Taille dataset électrique: {len(electricity_df)} échantillons")
    print(f"📈 Taille dataset eau: {len(water_df)} échantillons")

    # Test rapide sur quelques anomalies connues
    print("\n🧪 Test rapide sur anomalies électriques:")
    test_electricity = np.array([[10000000, 16000, 750, 300000, 5500, 80, 0.7, 0.9]]).reshape(1, -1)
    test_electricity_scaled = electricity_scaler.transform(test_electricity)
    pred = electricity_model.predict(test_electricity_scaled)
    score = electricity_model.decision_function(test_electricity_scaled)[0]
    print(f"   Test faible facteur puissance: prediction={pred[0]}, score={score:.4f}")

    test_electricity2 = np.array([[0, 16000, 750, 300000, 5500, 80, 0.92, 0.85]]).reshape(1, -1)
    test_electricity2_scaled = electricity_scaler.transform(test_electricity2)
    pred2 = electricity_model.predict(test_electricity2_scaled)
    score2 = electricity_model.decision_function(test_electricity2_scaled)[0]
    print(f"   Test données nulles: prediction={pred2[0]}, score={score2:.4f}")

if __name__ == "__main__":
    train_models()