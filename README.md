# 🚀 AI Trading Platform

<p align="center">
  <b>Production-grade AI-powered trading platform</b><br/>
  Real-time market analysis • Machine learning predictions • Trading simulation
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Architecture-Microservices-blue" />
  <img src="https://img.shields.io/badge/Backend-Django%20%7C%20FastAPI-green" />
  <img src="https://img.shields.io/badge/Frontend-React-orange" />
  <img src="https://img.shields.io/badge/ML-LSTM-purple" />
  <img src="https://img.shields.io/badge/License-MIT-lightgrey" />
</p>

---

## 🧠 Overview

This project is a **distributed, microservices-based trading platform** designed to bridge the gap between advanced machine learning models and real-world trading workflows.

It enables users to:

- 📊 Analyze financial markets (stocks & crypto)
- 🤖 Generate AI-driven trading signals
- 🧪 Simulate trades in a risk-free environment
- 📈 Track portfolio performance in real-time

---

## 🏗️ System Architecture

The system follows a **scalable microservices architecture**:

## 🧩 Architecture Diagram

```mermaid
flowchart LR

A[User Browser] --> B[React Frontend]

B -->|REST API| C[Django Backend]

C -->|Auth| D[JWT System]
C -->|Business Logic| E[Core Services]

E -->|Async Tasks| F[Celery Worker]
F --> G[Redis Broker]

F -->|Prediction Request| H[FastAPI ML Service]
H --> I[LSTM Model]
H --> J[Market Data API]

C --> K[(PostgreSQL Database)]

C -->|WebSockets| L[Realtime Server]
L --> B

N[Nginx] --> B
N --> C
```
### 📌 Notes

- Backend acts as the orchestration layer between services  
- ML service is isolated for scalability and independent deployment  
- Redis enables asynchronous processing via Celery  
- WebSockets ensure real-time UI updates without polling 

## ⚙️ How It Works

```mermaid
sequenceDiagram

participant User
participant Frontend as React Frontend
participant Backend as Django Backend
participant Auth as JWT Auth
participant Celery as Celery Worker
participant Redis as Redis Broker
participant ML as FastAPI ML Service
participant Model as LSTM Model
participant DB as PostgreSQL
participant WS as WebSocket Server

%% Step 1 - User interaction
User->>Frontend: Request prediction (ticker)

%% Step 2 - API request
Frontend->>Backend: HTTP Request /predict

%% Step 3 - Authentication
Backend->>Auth: Validate JWT
Auth-->>Backend: Valid user

%% Step 4 - Async task
Backend->>Celery: Send prediction task
Celery->>Redis: Queue task

%% Step 5 - ML processing
Celery->>ML: Call /predict endpoint
ML->>Model: Load model & run inference
ML->>ML: Fetch market data (yfinance)
ML-->>Celery: Return prediction (BUY/SELL)

%% Step 6 - Store result
Celery->>Backend: Send result
Backend->>DB: Save prediction

%% Step 7 - Realtime update
Backend->>WS: Broadcast prediction
WS-->>Frontend: Push update

%% Step 8 - UI update
Frontend-->>User: Display result
```
### 📌 Workflow Highlights

- Requests are processed asynchronously using Celery to avoid blocking the API  
- ML inference is isolated in a dedicated FastAPI service for scalability  
- Predictions are broadcast in real-time using WebSockets  
- PostgreSQL ensures persistence and historical tracking of predictions 

### 🔹 Core Components

| Layer        | Technology                     | Responsibility                          |
|-------------|------------------------------|----------------------------------------|
| Frontend     | React + Redux                | UI & State Management                  |
| Backend API  | Django REST Framework        | Business Logic & Authentication        |
| ML Service   | FastAPI                      | Model Inference & Data Processing      |
| Task Queue   | Celery + Redis               | Async Job Processing                   |
| Realtime     | Django Channels (WebSockets) | Live Updates                           |
| Database     | PostgreSQL                   | Persistent Storage                     |
| Gateway      | Nginx                        | Reverse Proxy & Routing                |

---

## 🔄 Data Flow

User → Frontend → Backend → Celery → ML Service → Backend → WebSocket → Frontend

1. User requests prediction via frontend  
2. Backend validates request (JWT authentication)  
3. Celery task is triggered  
4. ML service processes market data (LSTM model)  
5. Prediction returned (BUY / SELL)  
6. Backend stores result and broadcasts via WebSockets  
7. Frontend updates UI in real-time  

---

## ⚙️ Features

- 📊 Real-time market analysis
- 🤖 AI-based trading signals (LSTM models)
- 📈 Portfolio tracking & performance metrics
- 🔄 Live updates via WebSockets
- 🧪 Trading simulation engine
- 🔐 Secure authentication (JWT)
- ⚡ Asynchronous ML processing (Celery)

---

## 🛠️ Tech Stack

### 🎨 Frontend
- React
- Redux Toolkit
- Axios

### ⚙️ Backend
- Django
- Django REST Framework
- Django Channels

### 🤖 Machine Learning
- FastAPI
- TensorFlow / Keras (LSTM)
- Pandas / NumPy / Scikit-learn

### 🚀 Infrastructure
- Docker & Docker Compose
- Redis (task broker)
- PostgreSQL
- Nginx (reverse proxy)
- Gunicorn / Uvicorn

---

## 📂 Project Structure

frontend/        # React application (UI & state management)  
backend/         # Django API & business logic  
ml_service/      # FastAPI ML inference service  
infrastructure/  # Nginx & deployment configuration  

---

## 🚀 Getting Started

### 🐳 Run with Docker (Recommended)

docker-compose up --build

### 🌐 Access

Frontend → http://localhost  
Admin Panel → http://localhost/admin  

---

### 💻 Local Development

#### 🔹 ML Service
cd ml_service  
pip install -r requirements.txt  
uvicorn main:app --reload  

#### 🔹 Backend
cd backend  
pip install -r requirements.txt  
python manage.py migrate  
python manage.py runserver  

#### 🔹 Frontend
cd frontend  
npm install  
npm start  

---

## 📊 Current Status

### ✅ Implemented
- Authentication (JWT)
- Portfolio & trading logic
- ML prediction pipeline
- Real-time WebSocket updates

### 🚧 In Progress
- Advanced trading strategies
- Analytics dashboard (charts & indicators)
- Automated trading execution

---

## ⚡ Strengths

- 🧩 Modular and scalable microservices architecture
- ⚡ Real-time reactive system (WebSockets + Redux)
- 🧠 Clear separation of concerns (ML / Backend / Frontend)
- 🔄 Asynchronous processing for ML workloads

---

## ⚠️ Limitations

- ⏱️ Latency between backend and ML service (HTTP communication)
- 📉 Single-model prediction (no ensemble yet)
- 🧪 Simulation-only (no live trading integration)

---

## 🔮 Roadmap

- 🤖 Automated trading bots
- 📊 Advanced charting (technical indicators)
- 📩 Notification system (Telegram / Email)
- ☁️ Cloud deployment (AWS / GCP)
- 🧠 Multi-model ensemble learning

---

## 👥 Contributors

- **Moumen Mariam**  
  🔗 https://github.com/MariamMoumen1  

- **Yassine Meskaoui**  
  🔗 https://github.com/Azepuo  


  
---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository  
2. Create a new branch  
3. Submit a pull request  

---

## 📜 License

MIT License
