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
4. The backend will be available at `https://vinehealth-software.onrender.com`.

### 3. Testing the Backend with cURL

Server base: `https://vinehealth-software.onrender.com`

Use the following commands to test the new endpoints. Note: `users` (profile) must exist before creating a device; `devices` must exist before sending data.

#### Create profile (`/api/profile/create`)
```bash
curl -X POST https://vinehealth-software.onrender.com/api/profile/create \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user@example.com",
    "username": "vinefarmer",
    "password": "securepassword",
    "profile_avatar": "default_01"
  }'
```

#### Update profile (`/api/profile/update`)
```bash
curl -X POST https://vinehealth-software.onrender.com/api/profile/update \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user@example.com",
    "username": "vinefarmer2",
    "profile_avatar": "default_02"
  }'
```

#### Create device (`/api/device/create`) — requires existing `user_id`
```bash
curl -X POST https://vinehealth-software.onrender.com/api/device/create \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "12345",
    "user_id": "user@example.com",
    "device_name": "Vinehealth Sensor #1",
    "location": "Plot A"
  }'
```

#### Update device (`/api/device/update`)
```bash
curl -X POST https://vinehealth-software.onrender.com/api/device/update \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "12345",
    "device_name": "Vinehealth Sensor #1 (North)",
    "location": "Plot B"
  }'
```

#### Send data (`/api/data`)
```bash
curl -X POST https://vinehealth-software.onrender.com/api/data/ \
  -H "Content-Type: application/json" \
  -d '{
    "device_id": "12345",
    "timestamp": "2026-03-29T12:00:00Z",
    "health_indexes": {"NDVI": 0.85, "GNDVI": 0.78},
    "environment_data": {"temperature": 25.3, "relative_humidity": 60.5}
  }'
```

#### Query data by device and date (`/api/data?device_id=...&date=YYYY-MM-DD`)
```bash
curl -G 'https://vinehealth-software.onrender.com/api/data' \
  --data-urlencode "device_id=12345" \
  --data-urlencode "date=2026-03-29"
```

#### ~~Send alert (`/api/alerts`)~~ *(disabled — alerts are auto-generated on data ingestion)*
```bash
curl -X POST https://vinehealth-software.onrender.com/api/alerts/ \
  -H "Content-Type: application/json" \
  -d '{
    "alert_id": "alert_9887",
    "device_id": "12345",
    "user_id": "user@example.com",
    "resolved": false,
    "timestamp": "2026-03-29T12:00:00Z",
    "title": "High Temperature Alert",
    "details": "The temperature has exceeded the threshold of 35°C. Current temperature: 38°C."
  }'
```

If you get foreign-key errors when inserting into `data` or `devices`, verify your Supabase tables and column names with:
```sql
SELECT column_name FROM information_schema.columns WHERE table_name='data';
SELECT column_name FROM information_schema.columns WHERE table_name='devices';
SELECT column_name FROM information_schema.columns WHERE table_name='users';
```
