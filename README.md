# Expense Tracker – Mini Full Stack Web Application

A full stack expense tracking app built for the Full Stack Technologies Portfolio-Driven Assessment.

**Stack:** HTML/CSS/JavaScript (frontend) · Node.js + Express.js (backend) · MongoDB + Mongoose (database) · REST API · Git & GitHub

## Features
- **Create** an expense (title, amount, category, date, note)
- **Read** all expenses, with search, category filter and month filter
- **Update** an expense (edit in place)
- **Delete** an expense (with confirmation)
- Summary cards (total spent, transaction count, top category) and a category-wise spending chart
- Validation on both the frontend and the backend (Mongoose schema)

## Project Structure
```
expense-tracker/
├── server.js              # Express app + MongoDB connection
├── models/Expense.js      # Mongoose schema
├── routes/expenses.js     # REST API routes (CRUD + summary)
├── scripts/seed.js        # Optional sample data
├── public/                # Frontend (served by Express)
│   ├── index.html
│   ├── style.css
│   └── app.js
├── .env.example
└── package.json
```

## Run Locally
1. Install [Node.js](https://nodejs.org) (v18+) and [MongoDB Community Server](https://www.mongodb.com/try/download/community) (or use a free MongoDB Atlas cluster).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` (already included) and set `MONGO_URI` if needed.
4. (Optional) Add sample data: `npm run seed`
5. Start the server: `npm start` (or `npm run dev` for auto-reload)
6. Open **http://localhost:5000**

## REST API
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/expenses`          | Create an expense |
| GET    | `/api/expenses`          | List expenses (`?category=Food&month=2026-09&search=tea`) |
| GET    | `/api/expenses/summary`  | Total, count and per-category totals |
| GET    | `/api/expenses/:id`      | Get one expense |
| PUT    | `/api/expenses/:id`      | Update an expense |
| DELETE | `/api/expenses/:id`      | Delete an expense |

Sample request body:
```json
{ "title": "Lunch", "amount": 120, "category": "Food", "date": "2026-09-24", "note": "Canteen" }
```

## Deployment (optional)
Create a MongoDB Atlas cluster, deploy to Render/Railway, and set `MONGO_URI` and `PORT` as environment variables.

## Push to GitHub
```bash
git init
git add .
git commit -m "Expense Tracker full stack project"
git branch -M main
git remote add origin https://github.com/<your-username>/expense-tracker.git
git push -u origin main
```
