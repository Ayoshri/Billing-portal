# ⚡ ChargeUp: Role-Based SaaS Billing Portal

A modern, premium, role-based SaaS billing portal built in the **MERN** stack. Styled with a crisp, premium **white/light-mode** layout inspired by modern SaaS products (like Stripe and Linear). 

This portal features mock subscription management, role-based access control (RBAC), team limits, printable receipt views, and a floating simulation dashboard to test operations on the fly.

> [!TIP]
> **Zero Configuration Setup:** If local MongoDB is not running, the backend automatically falls back to an **In-Memory Mock Database** populated with pre-seeded test accounts, allowing you to run and evaluate the application instantly out-of-the-box!

---

## 🚀 Key Features

* **Authentication & Role-Based Access Control (RBAC):**
  * 👑 **Owner:** Full workspace controls, team member invitation, role changes, payment management, and subscription tier selection.
  * 💳 **Billing Admin:** Finance controls only. Access to invoices, print receipts, and subscription tier changes (cannot manage team).
  * 👥 **Member:** Read-only access. View plan quotas, storage capacity, and next billing date (cannot change plans, view invoices, or manage teams).
* **Resource Usage Quotas:** Visual dashboard gauges tracking seat usage, API calls, and storage limits. Warning banners trigger automatically when approaching limits.
* **Simulated Stripe Checkout:** Prefilled mock payment modal to complete plan upgrades/downgrades.
* **Printable Invoices:** Clean printable billing history receipt overlays showing itemized sub-totals. Supports native browser printing controls.
* **Interactive Demo Simulator:** A floating toggle widget in the bottom-right corner to test all application paths instantly (e.g. switch roles with one click, trigger payment declines, and increment storage usage).

---

## 🛠️ Tech Stack

* **Frontend:** React, Vite, Axios, React Icons, Vanilla CSS (clean, responsive grid tokens).
* **Backend:** Node.js, Express, Mongoose, JWT (JSON Web Tokens) Auth, Bcrypt.js.
* **Database:** MongoDB (with automatic, in-memory array fallback).

---

## 📁 Repository Structure

```text
saas-billing-portal/
├── backend/
│   ├── middleware/       # Auth & RBAC filters
│   ├── models/           # User, Org, & Invoice schemas (+ mock store)
│   ├── routes/           # Auth, Team & Billing controllers
│   ├── server.js         # API entry point & fallback detection
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # Sidebar, usage gauges, simulator console
│   │   ├── context/      # Global Authentication Context
│   │   ├── pages/        # Dashboard, Team, Billing, & Login screens
│   │   ├── utils/        # Axios API configurations
│   │   ├── App.jsx       # Tab routers
│   │   ├── index.css     # CSS Variables & theme tokens
│   │   └── main.jsx
│   ├── index.html
│   └── package.json
├── start.ps1             # Windows parallel server runner
└── README.md
```

---

## 🏃 Getting Started

### Prerequisites
You only need **Node.js** installed on your system. If you do not have MongoDB running locally, the project will automatically fallback to in-memory mode.

### Running the App
1. Clone the repository and navigate to the directory:
   ```bash
   cd saas-billing-portal
   ```
2. Start both the backend and frontend dev servers concurrently using the provided PowerShell startup script:
   ```powershell
   powershell -ExecutionPolicy Bypass -File .\start.ps1
   ```
3. Open your browser and navigate to:
   * **Application Frontend:** [http://localhost:5173](http://localhost:5173)
   * **API Backend Status:** [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## 🔑 Seeding & Test Credentials

On the login screen, click **"Quick Demo: Seed & Auto-Login as Owner"** to write test accounts and log in as Alice immediately. 

For manual login, use the password **`password123`** (Alice uses **`alice123`**):

| Account | System Role | Email |
| :--- | :--- | :--- |
| **Alice Smith** | Owner | `owner@acme.com` |
| **Bob Jones** | Billing Admin | `billing@acme.com` |
| **Charlie Brown** | Member | `member@acme.com` |

---

## 🔒 Downgrade Quota Filters
This billing portal replicates real-world business constraints. For example, if you have 8 active members in your workspace, trying to downgrade to the **Free** tier (5 seat limit) will prompt a safety check validation error warning: *"Remove team members first before downgrading."*
