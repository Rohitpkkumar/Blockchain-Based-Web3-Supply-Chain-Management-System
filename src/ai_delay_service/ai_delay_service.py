import os
import requests
from flask import Flask, jsonify
from flask_cors import CORS
import numpy as np
from datetime import datetime, timedelta
import pytz

app = Flask(__name__)
CORS(app)

# Configuration
OPENWEATHER_API_KEY = os.getenv('b6e133693db77a1896d2efed3254f225')
GOOGLE_MAPS_API_KEY = os.getenv('AIzaSyDscD4FBINMhL9-EBw2Cd9KDh-cMIo1fPM')

class DelayPredictor:
    def __init__(self):
        self.weather_thresholds = {
            'rain': 0.3,
            'snow': 0.1,
            'storm': 0.5,
            'fog': 0.7
        }
        self.traffic_thresholds = {
            'light': 0.3,
            'moderate': 0.6,
            'heavy': 0.8
        }
    
    def get_weather_data(self, lat, lng):
        url = f"https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lng}&appid={OPENWEATHER_API_KEY}"
        response = requests.get(url)
        if response.status_code == 200:
            return response.json()
        return None
    
    def get_traffic_data(self, origin_lat, origin_lng, dest_lat, dest_lng):
        url = f"https://maps.googleapis.com/maps/api/distancematrix/json?origins={origin_lat},{origin_lng}&destinations={dest_lat},{dest_lng}&departure_time=now&key={GOOGLE_MAPS_API_KEY}"
        response = requests.get(url)
        if response.status_code == 200:
            return response.json()
        return None
    
    def predict_delay(self, order_data, supplier_location, destination_location):
        # Get weather data for supplier location
        supplier_weather = self.get_weather_data(supplier_location['lat'], supplier_location['lng'])
        destination_weather = self.get_weather_data(destination_location['lat'], destination_location['lng'])
        
        # Get traffic data between supplier and destination
        traffic_data = self.get_traffic_data(
            supplier_location['lat'], supplier_location['lng'],
            destination_location['lat'], destination_location['lng']
        )
        
        # Calculate weather impact
        weather_impact = 0
        weather_reasons = []
        
        if supplier_weather:
            if 'rain' in supplier_weather['weather'][0]['description'].lower():
                weather_impact += 0.4
                weather_reasons.append("rain at origin")
            if 'snow' in supplier_weather['weather'][0]['description'].lower():
                weather_impact += 0.7
                weather_reasons.append("snow at origin")
        
        if destination_weather:
            if 'rain' in destination_weather['weather'][0]['description'].lower():
                weather_impact += 0.3
                weather_reasons.append("rain at destination")
            if 'snow' in destination_weather['weather'][0]['description'].lower():
                weather_impact += 0.5
                weather_reasons.append("snow at destination")
        
        # Calculate traffic impact
        traffic_impact = 0
        traffic_reason = "normal traffic conditions"
        
        if traffic_data and 'rows' in traffic_data and len(traffic_data['rows']) > 0:
            duration = traffic_data['rows'][0]['elements'][0]['duration_in_traffic']['value']
            normal_duration = traffic_data['rows'][0]['elements'][0]['duration']['value']
            
            traffic_ratio = duration / normal_duration
            
            if traffic_ratio > 1.8:
                traffic_impact = 0.8
                traffic_reason = "heavy traffic congestion"
            elif traffic_ratio > 1.4:
                traffic_impact = 0.6
                traffic_reason = "moderate traffic"
            elif traffic_ratio > 1.1:
                traffic_impact = 0.3
                traffic_reason = "light traffic"
        
        # Combine factors
        total_probability = min(0.9, (weather_impact * 0.6 + traffic_impact * 0.4))
        
        # Estimate delay in hours (base 1 hour + weighted additional)
        estimated_delay = 1 + (weather_impact * 3 + traffic_impact * 2)
        
        # Combine reasons
        reasons = []
        if weather_reasons:
            reasons.append(f"Weather: {', '.join(weather_reasons)}")
        reasons.append(f"Traffic: {traffic_reason}")
        
        return {
            'orderId': order_data['id'],
            'probability': round(total_probability, 2),
            'reason': ' '.join(reasons),
            'estimatedDelay': round(estimated_delay, 1),
            'timestamp': datetime.now(pytz.utc).isoformat()
        }

@app.route('/predict-delay/<order_id>', methods=['GET'])
def predict_delay(order_id):
    # In a real implementation, you would fetch order data from your blockchain
    # For now, we'll use mock data
    predictor = DelayPredictor()
    
    # Mock data - in real app, fetch from blockchain
    order_data = {
        'id': order_id,
        'supplierId': 'SUPP-001',
        'productId': 'PROD-A101'
    }
    
    supplier_location = {
        'lat': 37.7749,
        'lng': -122.4194
    }
    
    destination_location = {
        'lat': 34.0522,
        'lng': -118.2437
    }
    
    prediction = predictor.predict_delay(order_data, supplier_location, destination_location)
    return jsonify(prediction)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002)