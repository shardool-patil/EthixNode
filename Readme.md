# EthixNode 🌍🤖
**AI-Powered Predictive Remittance Gateway**

[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.0+-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![OAuth2](https://img.shields.io/badge/OAuth2-GitHub-181717?style=for-the-badge&logo=github&logoColor=white)]()

---

## 📌 Overview
**EthixNode** is an intelligent, open-source global remittance platform designed to bring **radical transparency** and **predictive intelligence** to international money transfers.

Built for the **Global Fusion Hackathon 2026**, this project addresses hidden fees and currency volatility challenges faced by students, expats, and families worldwide.

---

## ✨ Key Features

- **Predictive AI Forecasting**  
  Analyzes historical currency trends to recommend optimal transfer timing  
  *(e.g., "Send Now" vs. "Wait 12 Hours")*

- **Radical Transparency**  
  Calculates exact savings compared to traditional banking markups (3–7%)

- **Frictionless Dual Authentication**  
  - GitHub OAuth (Just-In-Time provisioning)  
  - Local authentication using BCrypt hashing  

- **Live Analytics Dashboard**  
  Interactive React-based UI with dynamic charts visualizing global liquidity

---

## 🛠️ Tech Stack

| Layer        | Technologies |
|-------------|-------------|
| **Frontend** | React.js, Vite, Recharts, Custom CSS (Dark Mode UI) |
| **Backend**  | Java, Spring Boot, Spring Security, Spring Data JPA |
| **Database** | PostgreSQL |
| **AI/ML**    | Python, FastAPI, Pandas, Scikit-learn |
| **Auth**     | OAuth2 Client, BCrypt, Session Management |

---

## 🚀 Local Setup & Installation

### 🔧 Prerequisites

- Java 17+
- Node.js (v18+) & npm
- PostgreSQL (running on port 5432)
- Maven

---

### 1️⃣ Database Setup

```sql
CREATE DATABASE ethixnode_db;
CREATE USER ethix_admin WITH PASSWORD 'hackathon_password';
GRANT ALL PRIVILEGES ON DATABASE ethixnode_db TO ethix_admin;
```

---

### 2️⃣ Backend Configuration (Spring Boot)

```bash
cd ethixnode-backend
```

Create secrets file:

```bash
src/main/resources/application-secrets.yml
```

Add your GitHub OAuth credentials:

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          github:
            clientId: YOUR_GITHUB_CLIENT_ID
            clientSecret: YOUR_GITHUB_CLIENT_SECRET
```

Run backend:

```bash
mvn clean install
mvn spring-boot:run
```

Backend runs on: `http://localhost:8080`

---

### 3️⃣ Frontend Configuration (React)

```bash
cd ethixnode-frontend
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Frontend runs on: `http://localhost:5173`

---

## 🗺️ Roadmap

- [x] Phase 1: Core UI/UX, Interactive Engine, Database Initialization  
- [x] Phase 2: Dual Authentication (OAuth2 + Local)  
- [ ] Phase 3: WebSockets for real-time updates  
- [ ] Phase 4: Integration with live Forex APIs  
- [ ] Phase 5: Dockerization (`docker-compose`)  
- [ ] Phase 6: Email notification microservice  

---

## 🏗️ Project Structure

```plaintext
EthixNode/
├── ethixnode-backend/       # Spring Boot backend
│   └── src/main/resources/  # Config files
├── ethixnode-frontend/      # React frontend
│   ├── src/components/      # UI Components
│   └── src/pages/           # Views
└── ethixnode-ai/            # FastAPI ML service
```

---

## 🧑‍💻 Author

**Shardool Patil**  
Computer Engineering Student & Full-Stack Developer  
---

## 🌍 Tagline

> **EthixNode — Transfer like a global citizen.**
