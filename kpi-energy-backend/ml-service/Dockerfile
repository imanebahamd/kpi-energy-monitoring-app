# Image Python officielle
FROM python:3.10-slim

# Créer un dossier pour l'app
WORKDIR /app

# Copier les fichiers requirements.txt et installer les dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier tout le code du ML Service
COPY . .

# Exposer le port sur lequel le service écoute
EXPOSE 5000

# Lancer le service Python
CMD ["python3", "app.py"]
