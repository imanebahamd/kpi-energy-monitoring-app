import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os

# Créer des données d'exemple pour l'entraînement
def create_training_data():
    # Données électriques (exemple)
    np.random.seed(42)
    n_samples = 1000
    
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
    
    # Données eau
    water_data = {
        'f3bis': np.random.normal(120000, 20000, n_samples),
        'f3': np.random.normal(110000, 18000, n_samples),
        'se2': np.random.normal(35000, 8000, n_samples),
        'se3bis': np.random.normal(32000, 7000, n_samples)
    }
    
    return pd.DataFrame(electricity_data), pd.DataFrame(water_data)

def train_models():
    electricity_df, water_df = create_training_data()
    
    # Entraîner le modèle électrique
    electricity_scaler = StandardScaler()
    electricity_scaled = electricity_scaler.fit_transform(electricity_df)
    
    electricity_model = IsolationForest(
        n_estimators=100, 
        contamination=0.05,
        random_state=42
    )
    electricity_model.fit(electricity_scaled)
    
    # Entraîner le modèle eau
    water_scaler = StandardScaler()
    water_scaled = water_scaler.fit_transform(water_df)
    
    water_model = IsolationForest(
        n_estimators=100,
        contamination=0.05,
        random_state=42
    )
    water_model.fit(water_scaled)
    
    # Sauvegarder les modèles
    os.makedirs("models", exist_ok=True)
    joblib.dump(electricity_model, "models/electricity_model.joblib")
    joblib.dump(electricity_scaler, "models/electricity_scaler.joblib")
    joblib.dump(water_model, "models/water_model.joblib")
    joblib.dump(water_scaler, "models/water_scaler.joblib")
    
    print("Modèles entraînés et sauvegardés avec succès!")

if __name__ == "__main__":
    train_models()