# VineHealth
Capstone Github - Vine Health

## How to Run the Project

### 1. Running the Frontend
1. Navigate to the `frontend` directory:
   ```bash
   cd software/frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. The frontend will be available at `http://localhost:3000`.

### 2. Running the Backend
1. Navigate to the `backend` directory:
   ```bash
   cd software/backend
   ```
2. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the backend server:
   ```bash
   python app.py
   ```
4. The backend will be available at `http://localhost:5000`.

### 3. Testing the Backend with cURL
Use the following cURL commands to test the backend endpoints:

#### Test `/api/data`
```bash
curl -X POST http://localhost:5000/api/data/ \
-H "Content-Type: application/json" \
-d '{
  "device_id": "12345",
  "timestamp": "2026-03-29T12:00:00Z",
  "health_indexes": {
    "NDVI": 0.85,
    "GNDVI": 0.78
  },
  "environment_data": {
    "temperature": 25.3,
    "relative_humidity": 60.5
  }
}'
```

#### Test `/api/alerts`
```bash
curl -X POST http://localhost:5000/api/alerts/ \
-H "Content-Type: application/json" \
-d '{
  "alert_id": "alert_9876",
  "device_id": "12345",
  "timestamp": "2026-03-29T12:00:00Z",
  "title": "High Temperature Alert",
  "details": "The temperature has exceeded the threshold of 35°C. Current temperature: 38°C."
}'
```

#### Test `/api/account/create`
```bash
curl -X POST http://localhost:5000/api/account/create \
-H "Content-Type: application/json" \
-d '{
  "device_id": "12345",
  "plant_species": "Cabernet Sauvignon",
  "crop_area": 250,
  "crop_area_unit": "sqm"
}'
```

#### Test `/api/account/update`
```bash
curl -X POST http://localhost:5000/api/account/update \
-H "Content-Type: application/json" \
-d '{
  "device_id": "12345",
  "plant_species": "Merlot",
  "crop_area": 300,
  "crop_area_unit": "sqm",
  "profile_avatar": "default_01"
}'
```
