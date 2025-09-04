# URL Shortener with Logging Middleware

## 📌 Overview
This project is a **URL Shortener service** built with **Node.js, Express, and MongoDB (Atlas)**.  
It allows users to:
- Create shortened URLs with customizable validity periods.
- Redirect users to the original URL using the shortcode.
- Track click statistics (timestamp, referrer, location).

Additionally, the project integrates a **custom Logging Middleware** package that sends structured logs to an external evaluation server for observability and debugging.

---

## 🚀 Features

### 🔗 URL Shortener
- Create short URLs with optional custom shortcode.
- Expiration support (default 30 minutes, configurable).
- Redirect to the original URL when shortcode is accessed.
- Expired links return HTTP `410 Gone`.

### 📊 Statistics
- Retrieve total clicks for a short URL.
- View detailed click logs:
  - Timestamp of access
  - Referrer (source of the request)
  - Coarse-grained location (country, via IP geolocation)

### 📜 Logging Middleware
A reusable package that provides a `Log()` function to send structured logs to the evaluation service.
- Logs critical lifecycle events:
  - Database connection success/failure
  - API handler errors
  - URL creation success
  - Expired/invalid link access
  - Server startup events
- Ensures consistent logging format across backend and frontend (if extended).

---

## 🛠️ Tech Stack
- **Backend**: Node.js, Express  
- **Database**: MongoDB Atlas + Mongoose  
- **Logging**: Axios-based reusable middleware  
- **Other Utilities**:  
  - `dayjs` → date/time handling  
  - `geoip-lite` → IP-based geolocation  
  - `dotenv` → environment variable management  
  - `crypto` → shortcode generation  

---

## 📂 Project Structure
project-root/
│── backend/
  |── package.json
  |── .env
│ ├── server.js
│ ├── routes/
│ │ └── urlRoutes.js
│ ├── models/
│ │ ├── Url.js
│ │ └── Click.js
│
│── logging-middleware/
│ ├── index.js
│ └── package.json
│── README.md


---

## ⚙️ Environment Variables

`.env` file in project root:

```env
PORT=8080
MONGO=mongodb+srv://<username>:<password>@cluster0.g6agmqd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
BASE_URL=http://localhost:8080
LOG_TOKEN=your_api_token_here


📦 Logging Middleware
Usage

Import and use Log() anywhere in your backend:

import { Log } from "../logging-middleware/index.js";

// Log database connection
mongoose.connect(process.env.MONGO)
  .then(() => Log("backend", "info", "db", "MongoDB connection established."))
  .catch(() => Log("backend", "fatal", "db", "Critical database connection failure."));

// Log handler validation error
if (!req.body.url) {
  await Log("backend", "error", "handler", "URL is required but not provided");
}

Allowed Fields

Stack: backend | frontend

Level: debug | info | warn | error | fatal

Package:

Backend only: cache, controller, cron_job, db, domain, handler, repository

Frontend only: component, hook, page, state, style

Both: auth, config, middleware, utils

🔗 API Endpoints
1. Create Short URL

POST /shorturls

Request

{
  "url": "https://example.com",
  "validity": 15,
  "shortcode": "abcd1"
}


Response

{
  "shortLink": "http://localhost:8080/abcd1",
  "expiry": "2025-09-04T10:45:00.000Z"
}

2. Redirect to Original URL

GET /:shortcode

Redirects to original URL if valid.

Returns 410 Gone if expired.

Returns 404 Not Found if shortcode doesn’t exist.

3. Get Statistics

GET /shorturls/:shortcode

Response

{
  "shortcode": "abcd1",
  "originalUrl": "https://example.com",
  "createdAt": "2025-09-04T10:15:00.000Z",
  "expiry": "2025-09-04T10:45:00.000Z",
  "totalClicks": 1,
  "clickDetails": [
    {
      "timestamp": "2025-09-04T10:20:00.000Z",
      "referrer": "direct",
      "location": "US"
    }
  ]
}

🧪 Testing
Start server
node backend/server.js

Create a short URL (cURL example)
curl -X POST http://localhost:8080/shorturls \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","validity":10}'

Visit short URL
http://localhost:8080/<shortcode>

Check statistics
curl http://localhost:8080/shorturls/<shortcode>

📜 License

MIT License. Free to use and modify.


---

✅ This should now format correctly on GitHub — headings, code blocks, and sections will render properly.  

Want me to also include a **“Logs Example Output”** section showing what log messages look like in the terminal?
