# 🚀 End-Term Project Submission

**Course:** Building Web Applications with React
**Batch:** 2029
**Author:** Rizwan
**Project Name:** Titan Fund - Investment LLP Portal

---

## 🧠 1. Problem Statement

**Target User:** Fund Managers (Admins) and Private Investors (LPs).

**The Problem:** Private investment funds and Limited Liability Partnerships (LLPs) traditionally manage capital contributions, withdrawal requests, and portfolio allocations via fragmented spreadsheets and email chains. This creates opacity, delays in transaction approvals, and manual calculation errors in tracking Global Assets Under Management (AUM) and individual investor capital.

**The Solution:** Titan Fund provides a centralized, secure, real-time portal where investors can transparently request deposits/withdrawals and track their approved capital. Admins gain a comprehensive dashboard to securely approve/reject liquidity requests, view attached transaction reference notes, and automatically track the firm's true Global AUM.

---

## ⚛️ 2. React Architecture & Core Fundamentals

* **Core Concepts:** Extensive use of Functional Components, Props for data passing, and List rendering with unique keys for the transaction tables.
* **State Management:** `useState` manages local component states (modals, form inputs), while the **Context API** (`PortfolioContext`) handles global state management for user authentication status, role verification, and transaction history.
* **Side Effects:** `useEffect` is utilized for mounting real-time Firebase database listeners and synchronizing the authentication state across the application lifecycle.
* **Routing:** React Router (`react-router-dom`) handles navigation with protected route wrappers, strictly segregating the `/dashboard` (Investor View) and `/admin` (Fund Manager View).
* **Data Flow:** Implementation of lifting state up and controlled components for the transaction and withdrawal request forms.

---

## 🔐 3. Authentication & Database Integration

**Backend Provider:** Firebase

* **Authentication:** Email/Password authentication. Role-Based Access Control (RBAC) securely identifies whether a logged-in user is an Investor or the Admin.
* **Cloud Firestore (Database):**
    * `users` collection: Stores user profiles, roles, and real-time aggregated `totalApprovedCapital`.
    * `transactions` collection: Stores all lifecycle events (deposits and withdrawals) linked to specific user IDs, complete with timestamps, monetary amounts, current statuses, and optional custom `note` fields for bank references.
* **CRUD Implementation:**
    * **Create:** Investors create new deposit or withdrawal request documents.
    * **Read:** Real-time fetching and filtering of transaction history and global AUM.
    * **Update:** Admins execute status updates on transactions (changing from 'PENDING' to 'APPROVED' or 'REJECTED'), triggering mathematically accurate `increment`/`decrement` operations on the user's capital.
    * **Delete:** Soft deletion logic utilized (status updating to rejected) to maintain a permanent financial audit trail, rather than hard-deleting records.

---

## 🎨 4. UI/UX Design

* **Design System:** Built entirely with **Tailwind CSS**.
* **Visual Language:** Professional dark mode interface utilizing glassmorphism styling, distinct status badging (Green for Approved, Red for Rejected, Gray for Pending), and responsive grid layouts for metric cards.
* **UX Features:** Modal-based transaction requests, interactive status indicators, dynamic error handling, and dedicated UI triggers for viewing investor transaction notes without cluttering the main table view.

---

## 📦 5. Core Features Checklist

* ✅ **Authentication System:** Secure login/signup via Firebase Auth.
* ✅ **Dual Dashboards:** Specific, conditionally rendered interfaces for Admins vs. Investors.
* ✅ **Capital Flow Engine:** Full deposit and withdrawal lifecycle management.
* ✅ **Global AUM Tracking:** Real-time aggregation of firm-wide approved capital directly tied to the database.
* ✅ **Audit Trail & Notes:** Non-destructive transaction rejection and custom reference notes for UTR numbers.
* ✅ **Persistent Storage:** Live Firestore integration.
* ✅ **Routing:** React Router DOM integration with protected route logic.
* ✅ **State Management:** Context API implementation.

---

## ⚙️ 6. Setup Instructions

1. Clone the repository: 
   ```bash
   git clone [https://github.com/rizwan-1-618/titan-fund-portal.git](https://github.com/rizwan-1-618/titan-fund-portal.git)