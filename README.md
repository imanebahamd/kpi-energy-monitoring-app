# 🏭 Système Intelligent de Suivi des KPIs Énergétiques et Hydriques

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Angular](https://img.shields.io/badge/Angular-17+-red.svg)](https://angular.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Python](https://img.shields.io/badge/Python-3.11+-yellow.svg)](https://www.python.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)


## 📋 Table des matières

- [À propos](#-à-propos)
- [Fonctionnalités principales](#-fonctionnalités-principales)
- [Architecture](#-architecture)
- [Technologies utilisées](#-technologies-utilisées)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
- [Intelligence Artificielle](#-intelligence-artificielle)
- [Roadmap](#-roadmap)
- [Auteur](#-auteurs)

## 🎯 À propos

Application web interactive développée pour **OCP Youssoufia** visant à moderniser la gestion de la consommation énergétique et de la production en eau d'une sous-station électrique industrielle.

### Contexte du projet

- **Organisme** : Office Chérifien des Phosphates (OCP) - Site de Youssoufia
- **Problématique** : Gestion manuelle via Excel, erreurs de saisie, manque de traçabilité
- **Solution** : Système centralisé avec détection intelligente d'anomalies par IA

### Objectifs

✅ Centralisation et fiabilisation des données énergétiques  
✅ Visualisation interactive avec tableaux de bord dynamiques  
✅ Détection automatique d'anomalies (IA)  
✅ Génération de rapports PDF/CSV  
✅ Traçabilité complète des actions utilisateurs  

## ⭐ Fonctionnalités principales

### 🔐 Authentification & Sécurité
- Authentification JWT sécurisée
- Gestion des rôles (Administrateur / Utilisateur)
- Réinitialisation de mot de passe (Email via SendGrid)
- Sessions sécurisées

### 📊 Gestion des données
- **Saisie mensuelle** : énergie électrique (60kV, 22kV) et production en eau
- **Validation en temps réel** lors de la saisie
- **Modification/Suppression** avec traçabilité
- **Calculs automatiques** : totaux, moyennes, facteur de puissance

### 📈 Visualisation & Rapports
- **Tableaux de synthèse** : vues mensuelles et annuelles
- **Graphiques interactifs** : évolution des KPIs
- **Génération de rapports** :
  - Mensuels
  - Annuels
  - Période personnalisée
- **Export multi-format** : PDF et CSV

### 🤖 Intelligence Artificielle
- **Algorithme** : Isolation Forest (détection non supervisée)
- **Anomalies détectées** :
  - 💧 Fuites d'eau
  - ⚡ Pics de consommation
  - 📉 Faible facteur de puissance
  - ⚠️ Erreurs de saisie
- **Modes** :
  - Surveillance en temps réel
  - Scans programmés (quotidiens)

### 🔔 Système d'alertes
- Notifications de dépassement de seuils
- Alertes visuelles pour anomalies
- Tableau de bord dédié

### 🔍 Audit & Traçabilité
- Enregistrement automatique de toutes les actions
- Journal d'audit complet (CRUD)
- Filtres avancés pour recherche
- Export des logs

### 👥 Gestion des utilisateurs (Admin)
- CRUD complet des comptes
- Attribution des rôles
- Activation/Désactivation des comptes
- Historique des connexions

## 🏗️ Architecture
```
┌─────────────────┐
│   Frontend      │
│   (Angular)     │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐      ┌──────────────┐
│   Backend       │◄────►│  PostgreSQL  │
│ (Spring Boot)   │      │   Database   │
└────────┬────────┘      └──────────────┘
         │
         │ REST API
         │
┌────────▼────────┐
│   AI Service    │
│   (Python)      │
│ Isolation Forest│
└─────────────────┘
```

### Architecture microservices

- **Frontend** : Application Angular (SPA)
- **Backend** : API REST Spring Boot
- **AI Service** : Module Python pour détection d'anomalies
- **Database** : PostgreSQL pour persistance
- **Containerization** : Docker pour déploiement

## 🛠️ Technologies utilisées

### Frontend
- **Angular 17+** - Framework TypeScript
- **TypeScript** - Langage de programmation
- **RxJS** - Programmation réactive
- **Chart.js** - Visualisation de données
- **Bootstrap** - Framework CSS

### Backend
- **Spring Boot 3.x** - Framework Java
- **Spring Security** - Sécurité & JWT
- **Spring Data JPA** - Persistance
- **PostgreSQL** - Base de données relationnelle
- **Maven** - Gestion de dépendances

### Intelligence Artificielle
- **Python 3.11+**
- **scikit-learn** - Isolation Forest
- **pandas** - Manipulation de données
- **NumPy** - Calculs numériques
- **Flask** - API service

### DevOps
- **Docker** - Conteneurisation
- **Docker Compose** - Orchestration
- **Git/GitHub** - Gestion de version
- **Postman** - Tests API

### Intégrations
- **SendGrid** - Envoi d'emails

## 📦 Prérequis

- **Node.js** >= 18.x
- **Java** >= 17
- **Python** >= 3.11
- **PostgreSQL** >= 15
- **Docker** & **Docker Compose** (recommandé)
- **Maven** >= 3.8

## 🚀 Installation

### Option 1 : Avec Docker (Recommandé)
```bash
# Cloner le repository
git clone https://github.com/imanebahamd/kpi-energy-monitoring-app.git
cd kpi-energy-monitoring-app

# Lancer avec Docker Compose
docker-compose up -d

# L'application sera accessible sur :
# Frontend: http://localhost:4200
# Backend: http://localhost:8080
# AI Service: http://localhost:5000
```



### Workflow typique

1. **Connexion** avec vos identifiants
2. **Saisie mensuelle** des données énergétiques et hydriques
3. **Validation automatique** par l'IA
4. **Consultation** des tableaux et graphiques
5. **Génération** de rapports (PDF/CSV)
6. **Surveillance** des alertes et anomalies

### Gestion des utilisateurs (Admin)
```
1. Se connecter en tant qu'administrateur
2. Accéder à "Gestion des utilisateurs"
3. Ajouter/Modifier/Supprimer des comptes
4. Attribuer les rôles appropriés
```

## 🤖 Intelligence Artificielle

### Algorithme Isolation Forest

L'application utilise l'algorithme **Isolation Forest** pour la détection non supervisée d'anomalies.

#### Types d'anomalies

| Type | Seuil | Description |
|------|-------|-------------|
| **Fuite d'eau** | +30% | Consommation > moyenne + 30% |
| **Pic de consommation** | +50% | Énergie > moyenne + 50% |
| **Faible cos φ** | < 0.85 | Facteur de puissance < 0.85 |
| **Erreur de saisie** | Valeur nulle/négative | Données incohérentes |

#### Performance du modèle

- **Précision** : ~95%
- **Rappel** : ~92%
- **F1-Score** : ~93.5%
- **Temps de prédiction** : < 100ms


## 🗺️ Roadmap

### Version 1.0 (Actuelle) ✅
- [x] Authentification et gestion des utilisateurs
- [x] Saisie et validation des données
- [x] Visualisation interactive
- [x] Détection d'anomalies par IA
- [x] Génération de rapports
- [x] Système d'audit


### Règles de contribution

- Code bien documenté
- Respect des conventions de codage
- Messages de commit clairs et descriptifs

## 👥 Auteur

**BAHAMD Imane**
- GitHub: [@imanebahamd](https://github.com/imanebahamd)


**Institution**
- **École Nationale des Sciences Appliquées de Marrakech (ENSA)**
- Filière : Génie Informatique – 2ème année du cycle ingénieur
- Année Universitaire : 2024-2025

---


<div align="center">

Made with ❤️ by [Imane Bahamd](https://github.com/imanebahamd)

</div>
