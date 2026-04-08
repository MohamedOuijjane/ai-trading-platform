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

%% =========================
%% Client Layer
%% =========================
A[User Browser] --> B[React Frontend]

%% =========================
%% API Layer
%% =========================
B -->|HTTP / REST| C[Django Backend API]

%% =========================
%% Auth & Logic
%% =========================
C --> D[JWT Authentication]
C --> E[Business Logic Layer]

%% =========================
%% Async Processing
%% =========================
E -->|Async Task| F[Celery Worker]
F -->|Message Broker| G[Redis]

%% =========================
%% ML Service
%% =========================
F -->|REST API| H[FastAPI ML Service]
H --> I[ML Models (LSTM)]
H --> J[Market Data (yfinance)]

%% =========================
%% Database Layer
%% =========================
C --> K[(PostgreSQL Database)]

%% =========================
%% Realtime Layer
%% =========================
C -->|WebSockets| L[Django Channels]
L --> B

%% =========================
%% Gateway
%% =========================
N[Nginx Reverse Proxy] --> B
N --> C

%% =========================
%% Styling
%% =========================
classDef frontend fill:#f9f,stroke:#333,stroke-width:1px;
classDef backend fill:#bbf,stroke:#333,stroke-width:1px;
classDef ml fill:#bfb,stroke:#333,stroke-width:1px;
classDef infra fill:#fbb,stroke:#333,stroke-width:1px;

class B frontend;
class C,E,D backend;
class H,I,J ml;
class F,G,K,L,N infra;
```
### 📌 Notes

- Backend acts as the orchestration layer between services  
- ML service is isolated for scalability and independent deployment  
- Redis enables asynchronous processing via Celery  
- WebSockets ensure real-time UI updates without polling 

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

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository  
2. Create a new branch  
3. Submit a pull request  

---

## 📜 License

MIT License
