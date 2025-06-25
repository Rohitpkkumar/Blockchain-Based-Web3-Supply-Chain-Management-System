# ai_delay_service/train_model.py
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import joblib
import json
from datetime import datetime

def generate_realistic_synthetic_data(num_samples=10000):
    """Generates synthetic supply chain delay data with realistic patterns"""
    np.random.seed(42)
    
    # Base data
    data = {
        'shipment_id': [f'SHIP-{i:05d}' for i in range(1, num_samples+1)],
        'distance_km': np.random.uniform(50, 3000, num_samples),
        'shipment_type': np.random.choice(
            ['standard', 'perishable', 'hazardous'], 
            num_samples,
            p=[0.6, 0.3, 0.1]
        ),
        'vehicle_type': np.random.choice(
            ['truck', 'ship', 'plane', 'train'],
            num_samples,
            p=[0.7, 0.2, 0.05, 0.05]
        ),
        'carrier_experience': np.random.randint(1, 20, num_samples),
        'time_of_day': np.random.choice(
            ['morning', 'afternoon', 'evening', 'night'],
            num_samples
        ),
        'day_of_week': np.random.choice(
            ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            num_samples
        ),
        'month': np.random.choice(
            ['January', 'February', 'March', 'April', 'May', 'June', 
             'July', 'August', 'September', 'October', 'November', 'December'],
            num_samples
        ),
        'border_crossings': np.random.poisson(0.7, num_samples),
        'origin_weather': np.random.choice(
            ['clear', 'rain', 'snow', 'fog', 'storm'],
            num_samples,
            p=[0.6, 0.2, 0.1, 0.08, 0.02]
        ),
        'dest_weather': np.random.choice(
            ['clear', 'rain', 'snow', 'fog', 'storm'],
            num_samples,
            p=[0.6, 0.2, 0.1, 0.08, 0.02]
        ),
        'traffic_level': np.random.choice(
            ['low', 'medium', 'high', 'severe'],
            num_samples,
            p=[0.5, 0.3, 0.15, 0.05]
        ),
        'road_conditions': np.random.choice(
            ['normal', 'construction', 'accident', 'closed'],
            num_samples,
            p=[0.7, 0.2, 0.08, 0.02]
        )
    }
    
    # Generate realistic delays
    data['actual_delay_hours'] = (
        # Base delay based on distance
        0.05 * data['distance_km'] +
        
        # Weather impacts
        np.where(data['origin_weather'] == 'rain', 2, 0) +
        np.where(data['origin_weather'] == 'snow', 5, 0) +
        np.where(data['origin_weather'] == 'storm', 8, 0) +
        np.where(data['origin_weather'] == 'fog', 1, 0) +
        
        np.where(data['dest_weather'] == 'rain', 1, 0) +
        np.where(data['dest_weather'] == 'snow', 3, 0) +
        np.where(data['dest_weather'] == 'storm', 5, 0) +
        
        # Traffic impacts
        np.where(data['traffic_level'] == 'medium', 1, 0) +
        np.where(data['traffic_level'] == 'high', 3, 0) +
        np.where(data['traffic_level'] == 'severe', 6, 0) +
        
        # Road conditions
        np.where(data['road_conditions'] == 'construction', 2, 0) +
        np.where(data['road_conditions'] == 'accident', 4, 0) +
        np.where(data['road_conditions'] == 'closed', 8, 0) +
        
        # Vehicle type
        np.where(data['vehicle_type'] == 'ship', 
                np.random.normal(12, 4, num_samples), 0) +
        np.where(data['vehicle_type'] == 'plane', 
                np.random.normal(2, 1, num_samples), 0) +
        np.where(data['vehicle_type'] == 'train', 
                np.random.normal(3, 2, num_samples), 0) +
        
        # Shipment type
        np.where(data['shipment_type'] == 'perishable', 2, 0) +
        np.where(data['shipment_type'] == 'hazardous', 4, 0) +
        
        # Border crossings
        0.5 * data['border_crossings'] +
        
        # Random noise
        np.random.gamma(shape=2, scale=1, size=num_samples)
    )
    
    # Cap delays at 72 hours
    data['actual_delay_hours'] = np.minimum(data['actual_delay_hours'], 72)
    
    # Add some extreme delays
    extreme_mask = np.random.random(num_samples) < 0.05
    data['actual_delay_hours'][extreme_mask] = np.random.uniform(24, 72, extreme_mask.sum())
    
    return pd.DataFrame(data)

def add_engineered_features(df):
    """Adds additional meaningful features to the dataset"""
    # Weather severity scores
    weather_severity = {'clear': 0, 'fog': 1, 'rain': 2, 'snow': 3, 'storm': 4}
    df['origin_weather_severity'] = df['origin_weather'].map(weather_severity)
    df['dest_weather_severity'] = df['dest_weather'].map(weather_severity)
    df['total_weather_impact'] = df['origin_weather_severity'] + df['dest_weather_severity']
    
    # Time features
    df['is_weekend'] = df['day_of_week'].isin(['Saturday', 'Sunday']).astype(int)
    df['is_peak_hours'] = df['time_of_day'].isin(['morning', 'evening']).astype(int)
    
    # Route complexity
    df['route_complexity'] = (
        0.3 * df['distance_km'] / 100 +
        0.5 * df['border_crossings'] +
        0.2 * df['total_weather_impact']
    )
    
    # Carrier efficiency (experienced carriers have fewer delays)
    df['carrier_efficiency'] = np.log(df['carrier_experience'] + 1)
    
    return df

def train_delay_prediction_model():
    """Main function to train and evaluate the delay prediction model"""
    print("Generating synthetic training data...")
    df = generate_realistic_synthetic_data(20000)  # Generate 20,000 samples
    df = add_engineered_features(df)
    
    # Define features and target
    target = 'actual_delay_hours'
    features = [
        'distance_km', 'carrier_experience', 'border_crossings',
        'origin_weather_severity', 'dest_weather_severity', 'total_weather_impact',
        'traffic_level', 'road_conditions', 'vehicle_type', 'shipment_type',
        'is_weekend', 'is_peak_hours', 'route_complexity', 'carrier_efficiency'
    ]
    
    X = df[features]
    y = df[target]
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Define preprocessing
    numeric_features = [
        'distance_km', 'carrier_experience', 'border_crossings',
        'origin_weather_severity', 'dest_weather_severity', 'total_weather_impact',
        'route_complexity', 'carrier_efficiency'
    ]
    categorical_features = [
        'traffic_level', 'road_conditions', 'vehicle_type', 
        'shipment_type', 'is_weekend', 'is_peak_hours'
    ]
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), numeric_features),
            ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
        ])
    
    # Define model pipeline
    model = Pipeline([
        ('preprocessor', preprocessor),
        ('regressor', RandomForestRegressor(
            n_estimators=200,
            max_depth=15,
            min_samples_leaf=5,
            n_jobs=-1,
            random_state=42
        ))
    ])
    
    print("Training model...")
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    r2 = r2_score(y_test, y_pred)
    
    print("\nModel Evaluation:")
    print(f"- Mean Absolute Error: {mae:.2f} hours")
    print(f"- Root Mean Squared Error: {rmse:.2f} hours")
    print(f"- R² Score: {r2:.2f}")
    
    # Save model and metadata
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    model_path = f'delay_prediction_model_{timestamp}.pkl'
    metadata_path = f'model_metadata_{timestamp}.json'
    
    joblib.dump(model, model_path)
    
    metadata = {
        'training_date': timestamp,
        'features_used': features,
        'target_variable': target,
        'model_type': 'RandomForestRegressor',
        'performance_metrics': {
            'MAE': mae,
            'RMSE': rmse,
            'R2': r2
        },
        'data_description': {
            'samples': len(df),
            'average_delay': df[target].mean(),
            'max_delay': df[target].max()
        }
    }
    
    with open(metadata_path, 'w') as f:
        json.dump(metadata, f, indent=2)
    
    print(f"\nModel saved to {model_path}")
    print(f"Metadata saved to {metadata_path}")
    
    return model

if __name__ == '__main__':
    train_delay_prediction_model()