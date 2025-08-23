import re
from datetime import datetime
import calendar

class NLPProcessor:
    def __init__(self):
        # Mots-clés pour l'extraction d'entités
        self.month_keywords = {
            'janvier': 1, 'février': 2, 'mars': 3, 'avril': 4,
            'mai': 5, 'juin': 6, 'juillet': 7, 'août': 8,
            'septembre': 9, 'octobre': 10, 'novembre': 11, 'décembre': 12,
            'jan': 1, 'fév': 2, 'mar': 3, 'avr': 4, 'mai': 5, 'jun': 6,
            'jul': 7, 'aoû': 8, 'sep': 9, 'oct': 10, 'nov': 11, 'déc': 12
        }
        
        self.period_keywords = {
            'aujourd\'hui': 'today', 'ce jour': 'today',
            'hier': 'yesterday', 
            'cette semaine': 'this_week', 'semaine': 'week',
            'ce mois': 'this_month', 'mois': 'month',
            'cette année': 'this_year', 'année': 'year'
        }
        
        self.data_type_keywords = {
            'électricité': 'electricity', 'electrique': 'electricity',
            'eau': 'water', 'hydrique': 'water',
            'consommation': 'consumption',
            'utilisateur': 'user', 'users': 'user'
        }

    def extract_entities(self, text):
        """Extrait les entités du texte"""
        if not text:
            return {}
        
        text_lower = text.lower()
        entities = {}
        
        # Extraction des entités
        entities.update(self._extract_dates(text_lower))
        entities.update(self._extract_numbers(text_lower))
        entities.update(self._extract_periods(text_lower))
        entities.update(self._extract_data_types(text_lower))
        entities.update(self._extract_years(text_lower))
        
        return entities
    
    def _extract_dates(self, text):
        """Extrait les dates et mois"""
        dates = {}
        
        # Extraction des mois
        for month_name, month_num in self.month_keywords.items():
            if month_name in text:
                dates['month'] = month_num
                break
        
        return dates
    
    def _extract_numbers(self, text):
        """Extrait les nombres"""
        numbers = {}
        number_matches = re.findall(r'\b(\d+)\b', text)
        if number_matches:
            # Prendre le premier nombre significatif
            for num in number_matches:
                num_val = int(num)
                if num_val > 0:  # Éviter les zéros
                    numbers['value'] = num_val
                    break
        
        # Extraction des jours
        day_match = re.search(r'\b(\d{1,2})\s*(jours?|days?)\b', text)
        if day_match:
            numbers['days'] = int(day_match.group(1))
        
        return numbers
    
    def _extract_periods(self, text):
        """Extrait les périodes de temps"""
        periods = {}
        
        for period_keyword, period_value in self.period_keywords.items():
            if period_keyword in text:
                periods['period'] = period_value
                break
        
        return periods
    
    def _extract_data_types(self, text):
        """Extrait les types de données"""
        data_types = {}
        
        for data_keyword, data_value in self.data_type_keywords.items():
            if data_keyword in text:
                data_types['data_type'] = data_value
                break
        
        return data_types
    
    def _extract_years(self, text):
        """Extrait les années"""
        years = {}
        
        # Années complètes
        year_matches = re.findall(r'\b(20\d{2})\b', text)
        if year_matches:
            years['year'] = int(year_matches[0])
            
            # Si deux années pour la comparaison
            if len(year_matches) >= 2:
                years['year1'] = int(year_matches[0])
                years['year2'] = int(year_matches[1])
        
        return years
    
    def normalize_text(self, text):
        """Normalise le texte pour le traitement"""
        if not text:
            return ""
        
        # Convertir en minuscules
        text = text.lower()
        
        # Supprimer la ponctuation excessive
        text = re.sub(r'[^\w\s]', ' ', text)
        
        # Supprimer les espaces multiples
        text = re.sub(r'\s+', ' ', text).strip()
        
        return text