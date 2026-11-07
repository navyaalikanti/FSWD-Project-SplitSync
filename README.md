# 📌 SplitSync — Real-Time Group Expense Management & Debt-Simplification Platform

**SplitSync** is an elegant, full-stack collaborative expense-splitting platform engineered for friends, roommates, students, trips, and teams. Built with a modern, high-aesthetic **Pinterest Red visual identity**, SplitSync automates group expense tracking, provides live Socket.IO updates, visualizes spending trends with Recharts, and features a graph-based **Debt Simplification Engine** that drastically reduces multi-party transactions.

---

## 🎨 Visual Identity & Design System (Pinterest Aesthetic)

- **Primary Pinterest Red**: `#E60023`
- **Dark Pinterest Red**: `#C8001A` / `#AD081B`
- **Soft Light Red Tint**: `#FEE8EB` / `#FFF5F6`
- **Delicate Border Red**: `#FCD5DA`
- **Clean Off-White Canvas**: `#FAF9F8`
- **White Card Elements**: `#FFFFFF` with delicate borders
- **Dark Text**: `#111111`
- **Secondary Text**: `#767676`
- **Success Green**: `#16A34A`
- **Warning / Pending**: `#F59E0B`
- **Typography**: Inter & Plus Jakarta Sans

---

## 🚀 Key Features

### 1. ⚡ Real-Time Collaboration (Socket.IO)
- Instant group synchronization without manual page refreshes.
- Live in-app notifications with unread counts and sound/badge alerts when:
  - Any member adds, edits, or deletes an expense.
  - A new member joins via invite code.
  - A settlement payment is recorded.

### 2. 🧮 Smart Expense Splitting Engine
- Accurately splits expenses using **integer minor units (paise)** to eliminate floating-point arithmetic errors.
- Three split calculation methods:
  - **Equal Split (=)**: Distributes expense evenly, handling odd paise remainders seamlessly.
  - **Exact Amounts (₹)**: Strict validation ensuring the sum of participant shares equals the expense.
  - **Percentage Split (%)**: Validates sum to 100% and calculates individual amounts.

### 3. 🧠 Debt Simplification Engine (Min-Cash-Flow)
- Solves the classic "n-party debt entanglement" problem.
- Calculates each member's net position (`Total Paid - Total Owed + Received - Paid`).
- Greedily matches maximum debtors with maximum creditors.
- Transitive example: *If A owes B ₹300 and B owes C ₹300, SplitSync simplifies it to A paying C ₹300 directly*, eliminating an entire transaction!

### 4. 📊 Live Visual Analytics (Recharts)
- **Monthly Spending Trends**: Interactive bar charts comparing total group spend against individual personal share.
- **Category Breakdown**: Donut chart detailing distribution across Food, Accommodation, Travel, Utilities, Shopping, and Entertainment.

### 5. 👥 Collaborative Groups & Shareable Codes
- Create groups with custom category tags and theme colors.
- Shareable 6-digit alphanumeric invite codes (e.g. `GOA202`, `APT402`).
- 5 dedicated group views:
  - **Overview**: Group metrics, balance cards, suggested settlements.
  - **Expenses**: Filterable transaction ledger with inline delete/edit.
  - **Members & Balances**: Individual balances (+₹ or -₹).
  - **Debt Engine & Settlements**: Suggested settlement recommendations & recorded payment history.
  - **Activity Feed**: Real-time chronological audit trail.

### 6. ✨ 1-Click Demo Mode (Reviewer Ready)
- Evaluators and examiners can click **"1-Click Demo"** on the landing page or login screen to immediately explore pre-seeded, realistic demo data (Priya Sharma, Goa Beach Trip, Apartment 402 Roommates, College Fest) with live interactive charts and balances.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router 7, Axios, Lucide React, Recharts, Canvas-Confetti |
| **Backend** | Node.js, Express.js, Socket.IO, Mongoose |
| **Database** | MongoDB Atlas (with automatic fallback to local MongoDB `mongodb://127.0.0.1:27017/splitsync`) |
| **Auth & Security** | JWT (JSON Web Tokens), bcryptjs password hashing, protected route guards |

---

## 📁 Project Structure

```text
Real Time Collab/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, Footer, Modals, Dropdowns)
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── pages/              # Landing, Login, Register, Dashboard, GroupDetails, GroupsList
│   │   ├── services/           # Axios client instance (api.js)
│   │   ├── App.jsx             # Main router & layout
│   │   ├── index.css           # Tailwind CSS directives & pink theme tokens
│   │   └── main.jsx
│   ├── index.html              # Custom fonts & metadata
│   ├── package.json
│   └── vite.config.js          # Vite + Tailwind v4 plugin
│
├── server/                     # Backend Application (Node + Express + Socket.IO)
│   ├── config/                 # Resilient MongoDB connection handler
│   ├── controllers/            # Auth, Groups, Expenses, Settlements, Analytics, Notifications
│   ├── middleware/             # JWT auth route protection
│   ├── models/                 # User, Group, Expense, Settlement, Notification, Activity
│   ├── routes/                 # Express REST API routes
│   ├── sockets/                # Socket.IO connection & room broadcast handlers
│   ├── tests/                  # Engine unit tests (engines.test.js)
│   ├── utils/                  # splitEngine.js, debtSimplifier.js, seedDemoData.js
│   ├── app.js                  # Express middleware & route setup
│   ├── server.js               # HTTP & Socket.IO server entry
│   ├── package.json
│   └── .env.example
├── .gitignore
└── README.md
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account or local MongoDB

### 1. Backend Setup
```bash
cd server
npm install
```

Configure your `server/.env`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=supersecretjwtkey123
```
*(If `MONGODB_URI` is left unconfigured, the server automatically connects to `mongodb://127.0.0.1:27017/splitsync`)*.

### 2. Frontend Setup
```bash
cd ../client
npm install
```

Configure your `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🧪 Running Unit Tests

To run the automated tests for the **Split Calculation Engine** and the **Debt Simplification Algorithm**:

```bash
cd server
npm test
```

Expected output:
```text
=== Running: SplitSync Engines Test Suite ===
Test 1: Equal Split with paise remainder distribution...
Test 2: Odd remainder 100/3 paise distribution...
Test 3: Exact Split validation...
Test 4: Percentage Split (60% / 40%)...
Test 5: Transitive Debt Simplification...

[PASS] All SplitSync Engine and Calculation Tests Passed Successfully!
```

---

## 🏃 Running the Application

### Start Backend:
```bash
cd server
npm start
# Server and Socket.IO will listen on http://localhost:5000
```

### Start Frontend:
```bash
cd client
npm run dev
# Frontend Vite dev server will run on http://localhost:5173
```

Open your browser to `http://localhost:5173`.

---

## 📡 REST API Endpoints

### Authentication
- `POST /api/auth/register` — Create a new account
- `POST /api/auth/login` — Sign in and receive JWT
- `POST /api/auth/demo-login` — 1-Click instant login into demo account with pre-seeded data
- `GET /api/auth/me` — Retrieve current user profile (Protected)

### Groups
- `POST /api/groups` — Create a group with name, category, and theme color
- `GET /api/groups` — Get all groups for the logged-in user with balance summaries
- `GET /api/groups/:id` — Get full group details (members, expenses, settlements, net balances, simplified debts)
- `POST /api/groups/join` — Join a group using an invitation code
- `POST /api/groups/:id/leave` — Leave a group (validates zero balance)

### Expenses
- `POST /api/expenses` — Add a new expense (runs split engine, notifies participants via sockets)
- `PUT /api/expenses/:id` — Update expense and recalculate splits
- `DELETE /api/expenses/:id` — Delete expense and adjust balances

### Settlements
- `POST /api/settlements` — Record repayment between two members
- `GET /api/settlements/group/:groupId` — Get settlement history for a group

### Analytics & Notifications
- `GET /api/analytics/dashboard` — Complete user analytics (overall balance, recent expenses, charts data)
- `GET /api/notifications` — Retrieve live in-app notifications
- `PUT /api/notifications/:id/read` — Mark notification as read
- `PUT /api/notifications/read-all` — Mark all notifications as read

---

## 🔮 Upcoming Innovations (SplitSync 2.0)

- **Direct UPI & Gateway Integration**: Instant in-app settlement via Razorpay & Google Pay deep links.
- **Itemized Receipt OCR Scanning**: Camera upload to parse bill line items and assign them to members.
- **Predictive Spending Insights**: AI-assisted budget forecasting.
- **Export to CSV & PDF**: Formal expense audit reports.

---

## 👩‍💻 Authors & Academic Attribution
Developed as a comprehensive **Full Stack Web Development (FSWD)** Capstone Project demonstrating modern React architecture, RESTful API design, database modeling, real-time WebSockets, and algorithmic optimization.
