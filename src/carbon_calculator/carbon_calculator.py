import os
import requests
from flask import Flask, jsonify
from flask_cors import CORS
import math
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Emission factors (grams CO2 per ton-km)
EMISSION_FACTORS = {
    'truck': 62,       # Average diesel truck
    'ship': 10,        # Container ship
    'plane': 500,      # Cargo plane
    'train': 22        # Freight train
}

class CarbonCalculator:
    def __init__(self):
        self.average_speed = {
            'truck': 80,    # km/h
            'ship': 25,     # knots (~46 km/h)
            'plane': 800,   # km/h
            'train': 60     # km/h
        }
    
    def calculate_distance(self, origin, destination):
        # Using Haversine formula for great-circle distance
        lat1, lon1 = origin['lat'], origin['lng']
        lat2, lon2 = destination['lat'], destination['lng']
        
        R = 6371  # Earth radius in km
        dLat = math.radians(lat2 - lat1)
        dLon = math.radians(lon2 - lon1)
        a = (math.sin(dLat/2) * math.sin(dLat/2) +
            math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
            math.sin(dLon/2) * math.sin(dLon/2))
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
        return R * c
    
    def calculate_emissions(self, order_data, supplier_location, destination_location):
        transport_type = order_data.get('transportType', 'truck').lower()
        distance = self.calculate_distance(supplier_location, destination_location)
        
        # Simple calculation: emissions = distance * emission factor * weight factor
        # Assuming average weight of 10 tons for all shipments
        weight_factor = 10  # tons
        emissions = distance * EMISSION_FACTORS[transport_type] * weight_factor / 1000  # convert to kg
        
        return {
            'orderId': order_data['id'],
            'emissions': round(emissions, 2),  # kg CO2
            'distance': round(distance, 2),     # km
            'transportType': transport_type,
            'timestamp': datetime.now().isoformat()
        }

@app.route('/calculate-carbon/<order_id>', methods=['GET'])
def calculate_carbon(order_id):
    calculator = CarbonCalculator()
    
    # Mock data - in real app, fetch from blockchain
    order_data = {
        'id': order_id,
        'transportType': 'truck'  # default
    }
    
    supplier_location = {
        'lat': 37.7749,  # San Francisco
        'lng': -122.4194
    }
    
    destination_location = {
        'lat': 34.0522,  # Los Angeles
        'lng': -118.2437
    }
    
    result = calculator.calculate_emissions(order_data, supplier_location, destination_location)
    return jsonify(result)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)