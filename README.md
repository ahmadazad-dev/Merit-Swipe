# Merit-Swipe 💳

Merit-Swipe is a comprehensive web application designed to aggregate, filter, and display credit card discount deals from various bank websites. It provides users with a centralized platform to discover the best restaurant and retail discounts available for their specific credit or debit cards.

## 📑 Table of Contents
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Database Setup](#1-database-setup)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Scraper Setup](#4-scraper-setup)
- [Collaborating & Seed Data](#collaborating--seed-data)
- [License](#license)

## 🛠 Tech Stack
- **Frontend:** React.js (Vite)
- **Backend:** Node.js, Express.js
- **Database:** Microsoft SQL Server (2025)
- **Data Engineering:** Python (Scraping & ETL Pipeline)
- **Drivers:** `mssql/msnodesqlv8` (Node), `pyodbc` (Python)

## 🏗 Project Architecture
The repository is divided into four main services:
- `/frontend`: The React user interface where users search and filter deals.
- `/backend`: The REST API that serves deal data to the frontend.
- `/database`: SQL scripts for schema creation and mock data sharing.
- `/scrapper`: Python scripts (`extractor.py`, `transformer.py`, `loader.py`) that fetch live deals from bank websites and load them into the database.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing.

### Prerequisites
Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/downloads/) (3.10 or higher)
- Microsoft SQL Server (Developer or Express Edition)
- SQL Server Management Studio (SSMS)
- ODBC Driver 17 (for Python) and ODBC Driver 18 (for Node.js) for SQL Server

### 1. Database Setup
1. Open SSMS and connect to your local server (using `.` or `localhost`).
2. Open the `database/schema.sql` file.
3. **Important:** Ensure the database creation commands at the top of the file are uncommented, or manually run `CREATE DATABASE merit_swipe;` first.
4. Execute the script to generate all required tables (`users`, `banks`, `deals`, `restaurants`, etc.).

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   npm start
   # or node app.js
   ```
   *The server should now be running on port 5000 and connected to your local SQL Server.*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will be accessible at http://localhost:5173.*

### 4. Scraper Setup
1. Open a new terminal and navigate to the scrapper directory:
   ```bash
   cd scrapper
   ```
2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install the required Python packages:
   ```bash
   pip install pyodbc requests beautifulsoup4
   ```
4. Run the data pipeline to fetch new deals:
   ```bash
   python pipeline.py
   ```

---

## 🤝 Collaborating & Seed Data

Since we are a team of three working on local databases, it is critical that we share the same test data.

**How to sync data:**
1. If you add new test users, banks, or manually scraped deals, do **not** just leave them in your local SSMS.
2. Script the `INSERT` statements into the `database/test.sql` file.
3. Push the updated `test.sql` to GitHub.
4. When pulling new code, always re-run `test.sql` in SSMS to ensure your local database matches the team's current state.

## 📄 License
Distributed under the ISC License.