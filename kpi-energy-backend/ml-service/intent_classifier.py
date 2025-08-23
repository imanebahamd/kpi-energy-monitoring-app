import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.pipeline import Pipeline
import joblib
import os
import json

class IntentClassifier:
    def __init__(self):
        self.pipeline = self._build_pipeline()
        self.intents = self._load_intents()
        self._train_model()
    
    def _load_intents(self):
        """Charge les intents depuis un fichier JSON ou défaut"""
        intents_path = "data/intents.json"
        if os.path.exists(intents_path):
            try:
                with open(intents_path, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                print("Error loading intents.json, using default intents")
        
        # Intents par défaut si le fichier n'existe pas
        return {
            "ask_anomalies_today": [
                "anomalies aujourd'hui", "anomalies du jour", "problèmes aujourd'hui",
                "anomalies detectees aujourd'hui", "quelles anomalies aujourd'hui",
                "liste anomalies aujourd'hui", "anomalies ce jour"
            ],
            "ask_water_anomalies": [
                "anomalies eau", "problèmes eau", "fuites d'eau", 
                "consommation eau anormale", "anomalies eau mars",
                "anomalies eau 2024", "problèmes réseau eau"
            ],
            "ask_critical_anomalies": [
                "anomalies critiques", "problèmes urgents", "alertes critiques",
                "anomalies importantes", "anomalies majeures", "problemes graves"
            ],
            "ask_user_activity": [
                "activité utilisateurs", "activité des users", "connexions utilisateurs",
                "actions utilisateurs", "historique utilisateurs", "log utilisateurs"
            ],
            "ask_data_modifications": [
                "modifications données", "changements données", "historique modifications",
                "dernières modifications", "audit données", "changements récents"
            ],
            "ask_consumption_data": [
                "données consommation", "consommation énergie", "stats consommation",
                "chiffres consommation", "consommation électrique", "consommation eau"
            ],
            "ask_comparison": [
                "comparer données", "comparaison consommation", "comparaison années",
                "évolution consommation", "comparaison 2023 2024", "différence consommation"
            ],
            "greet": [
                "bonjour", "salut", "coucou", "hello", "hi", "bonsoir",
                "comment ça va", "ça va", "bienvenue"
            ],
            "goodbye": [
                "au revoir", "bye", "à plus", "goodbye", "see you", "ciao",
                "à bientôt", "je m'en vais"
            ],
            "thanks": [
                "merci", "thanks", "thank you", "merci beaucoup", 
                "je vous remercie", "super merci"
            ],
            "help": [
                "aide", "help", "assistance", "que peux-tu faire",
                "fonctionnalités", "commands", "menu"
            ]
        }
    
    def _build_pipeline(self):
        """Construit le pipeline ML pour la classification"""
        return Pipeline([
            ('tfidf', TfidfVectorizer(
                ngram_range=(1, 2),
                max_features=1500,
                stop_words=['le', 'la', 'les', 'de', 'des', 'du', 'et', 'ou', 'est'],
                min_df=2,
                max_df=0.8
            )),
            ('clf', MultinomialNB(alpha=0.1))
        ])
    
    def _prepare_training_data(self):
        """Prépare les données d'entraînement"""
        X, y = [], []
        for intent, examples in self.intents.items():
            for example in examples:
                X.append(example.lower())
                y.append(intent)
        return X, y
    
    def _train_model(self):
        """Entraîne le modèle de classification"""
        X, y = self._prepare_training_data()
        if len(X) > 0:
            self.pipeline.fit(X, y)
            print(f"Modèle entraîné avec {len(X)} exemples et {len(set(y))} intents")
        else:
            print("Aucune donnée d'entraînement disponible")
    
    def predict_intent(self, text):
        """Prédit l'intention d'un texte"""
        try:
            if not text or len(text.strip()) < 2:
                return "default"
            
            text_lower = text.lower()
            probas = self.pipeline.predict_proba([text_lower])[0]
            max_proba = np.max(probas)
            predicted_intent = self.pipeline.predict([text_lower])[0]
            
            # Seuil de confiance
            if max_proba > 0.5:
                return predicted_intent
            else:
                return "default"
                
        except Exception as e:
            print(f"Erreur prédiction intention: {e}")
            return "default"
    
    def save_model(self, path="models/intent_classifier.joblib"):
        """Sauvegarde le modèle"""
        os.makedirs(os.path.dirname(path), exist_ok=True)
        joblib.dump(self.pipeline, path)
        print(f"Modèle sauvegardé: {path}")
    
    def load_model(self, path="models/intent_classifier.joblib"):
        """Charge le modèle"""
        if os.path.exists(path):
            self.pipeline = joblib.load(path)
            print(f"Modèle chargé: {path}")