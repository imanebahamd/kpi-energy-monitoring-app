import requests
import json

# URL de votre service Flask
BASE_URL = "http://localhost:5000"

def test_anomalies():
    """Teste différents cas d'anomalies"""

    test_cases = [
        # Cas 1: Faible facteur de puissance (électricité)
        {
            'data_type': 'electricity',
            'network60kv_active_energy': 10000000,
            'network60kv_reactive_energy': 16000,
            'network60kv_peak': 750,
            'network22kv_active_energy': 300000,
            'network22kv_reactive_energy': 5500,
            'network22kv_peak': 80,
            'network60kv_power_factor': 0.7,  # Faible
            'network22kv_power_factor': 0.9
        },

        # Cas 2: Données nulles (électricité)
        {
            'data_type': 'electricity',
            'network60kv_active_energy': 0,  # Nul
            'network60kv_reactive_energy': 16000,
            'network60kv_peak': 750,
            'network22kv_active_energy': 300000,
            'network22kv_reactive_energy': 5500,
            'network22kv_peak': 80,
            'network60kv_power_factor': 0.92,
            'network22kv_power_factor': 0.85
        },

        # Cas 3: Fuite d'eau (eau)
        {
            'data_type': 'water',
            'f3bis': 300000,  # Élevé
            'f3': 200000,     # Élevé
            'se2': 100000,    # Élevé
            'se3bis': 80000   # Élevé
        },

        # Cas 4: Données nulles (eau)
        {
            'data_type': 'water',
            'f3bis': 120000,
            'f3': 110000,
            'se2': 0,        # Nul
            'se3bis': 32000
        },

        # Cas 5: Ratio élevé F3/F3bis (eau)
        {
            'data_type': 'water',
            'f3bis': 50000,
            'f3': 150000,    # Ratio = 3.0
            'se2': 35000,
            'se3bis': 32000
        }
    ]

    print("🧪 Début des tests d'anomalies...\n")

    for i, test_data in enumerate(test_cases, 1):
        print(f"=== TEST {i} ===")
        print(f"Type: {test_data['data_type']}")

        try:
            response = requests.post(
                f"{BASE_URL}/detect-anomaly",
                json=test_data,
                timeout=10
            )

            if response.status_code == 200:
                result = response.json()
                print(f"✅ Réponse: {json.dumps(result, indent=2)}")
            else:
                print(f"❌ Erreur HTTP: {response.status_code}")
                print(f"Message: {response.text}")

        except Exception as e:
            print(f"❌ Erreur de connexion: {e}")

        print("\n" + "-"*50 + "\n")

if __name__ == "__main__":
    test_anomalies()