# Library Management System (LMS)
> **Practical Virtual Internship Project — Full Stack Development**

A production-grade, full-stack Library Management System built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Node.js / Express**. The application features a persistent database, comprehensive CRUD workflows, input validation, live search, automated overdue fee calculations, and an in-app automated integration test suite with PDF report export.

---

## 🌟 Key Features

### 1. Responsive & High-Density Interface
- Clean, accessible multi-viewport layout with responsive sidebar/top navigation and mobile sheet support.
- Live operational dashboard with real-time KPI metrics (Total Titles, Total Holdings, Active Patrons, Loans, Overdue Items, Unpaid Fines).
- High-circulation showcase and persistent audit trail stream.

### 2. Database Integration & Relational Persistence
- Node.js Express backend serving RESTful JSON endpoints.
- Persistent file-backed storage (`data/library_db.json`) modeling relational entities:
  - **Books**: Bibliographic metadata, ISBN-10/13 identifiers, shelf coordinates, total & available stock copies.
  - **Patrons**: Role-based access (Students, Faculty, Researchers, General) with automated borrow quota limits.
  - **Circulation Records**: Borrowing transactions, timestamps, automated due dates, return timestamps, and late fine accounts.
  - **Audit Logs**: Persistent event trail tracking every catalog update and checkout.
- Full backup export and one-click database reset for reproducible grading.

### 3. Complete CRUD Operations
- **Books Catalog**: Add new titles, update metadata/stock, inspect loan history, filter by category/availability, and safely delete books (with active loan cascade guards).
- **Patron Management**: Register members, update contact info, adjust borrowing quotas, track active checkouts.
- **Circulation Desk**: Issue books, return loans with instant stock replenishment, renew loan terms, and collect fine receipts.

### 4. Search & Multi-Tier Validation
- Real-time debounced search by Title, Author, ISBN, or Physical Shelf coordinates.
- Checksum and format validation for **ISBN-10** and **ISBN-13**.
- Strict inventory bounds validation (`availableCopies <= totalCopies`).
- Email regex validation and patron quota checks (Student: 4, Faculty: 8, Researcher: 6, General: 3).
- Automated late fee calculations ($0.50 per day past due date).

### 5. Automated Testing & Project Submission
- **Automated Integration Test Runner**: 10-point server-side contract test suite covering CRUD invariants, validation checks, stock decrements, and fine math.
- **Interactive REST API Explorer**: Built-in HTTP console to execute live API queries and inspect JSON responses.
- **Official Project PDF Generator**: Vector A4 PDF export using `jsPDF` for formal virtual internship project submission.

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Installation & Local Setup

1. **Clone the repository:**
   ```bash
   git clone <your-github-repo-url>
   cd <repo-name>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application and backend API will run on **http://localhost:3000**.

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Start production server:**
   ```bash
   npm start
   ```

---

## 📁 Project Structure

```
├── data/
│   └── library_db.json         # Persistent JSON database store
├── server/
│   ├── api.ts                  # Express REST API route handlers
│   ├── db.ts                   # Database manager, validations & queries
│   ├── seeds.ts                # Initial seed dataset generator
│   ├── testRunner.ts           # Automated integration test suite
│   └── types.ts                # Server TypeScript schemas
├── src/
│   ├── components/
│   │   ├── BookModal.tsx       # Add / Edit book modal with validation
│   │   ├── BooksCatalogView.tsx# Catalog grid & table views with filters
│   │   ├── CirculationView.tsx # Loan issue, return desk & fines
│   │   ├── DashboardView.tsx   # Operational KPIs & audit stream
│   │   ├── DetailsModal.tsx    # Book & Patron history inspector
│   │   ├── IssueModal.tsx      # Circulation issue workflow modal
│   │   ├── MemberModal.tsx     # Patron enrollment modal
│   │   ├── Navbar.tsx          # Top bar navigation & actions
│   │   ├── ReturnModal.tsx     # Book check-in & fine collection modal
│   │   ├── SubmissionReportView.tsx # Internship dossier & PDF generator
│   │   ├── TestingSuiteView.tsx# Automated test runner & API explorer
│   │   └── Toast.tsx           # Accessible notification toasts
│   ├── services/
│   │   ├── api.ts              # Frontend REST API client
│   │   └── pdfGenerator.ts     # Client-side jsPDF document generator
│   ├── types/
│   │   └── library.ts          # Frontend domain interfaces
│   ├── App.tsx                 # Application root & view router
│   ├── index.css               # Tailwind CSS configuration
│   └── main.tsx                # Client entry point
├── index.html                  # HTML entry point
├── metadata.json               # App metadata
├── package.json                # Dependencies and project scripts
├── server.ts                   # Express server with Vite middleware integration
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite configuration
```

---

## 🔌 RESTful API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/stats` | System KPI statistics & financial telemetry |
| `GET` | `/api/books` | Query catalog with search, category & status filters |
| `POST` | `/api/books` | Catalog a new book (validates ISBN & copy counts) |
| `PUT` | `/api/books/:id` | Update bibliographic data or total copies |
| `DELETE` | `/api/books/:id` | Remove book (guarded against active loans) |
| `GET` | `/api/members` | Patron directory and quota status |
| `POST` | `/api/members` | Register new patron with email format check |
| `GET` | `/api/loans` | Filter loans by status (`borrowed`, `overdue`, `returned`) |
| `POST` | `/api/loans/issue` | Checkout book to patron, decrementing available copies |
| `POST` | `/api/loans/:id/return` | Process return, restore inventory & compute fines |
| `POST` | `/api/loans/:id/renew` | Extend loan duration by 14 days |
| `POST` | `/api/loans/:id/pay-fine`| Settle outstanding late fine balance |
| `POST` | `/api/test-runner/run-all`| Execute 10-point automated integration test suite |
| `POST` | `/api/system/reset` | Restore standardized seed dataset |

---

## 🧪 Automated Testing Suite

The application includes an in-app automated integration test runner executing 10 server-side contract assertions:
1. **TC-01:** Catalog Query & Schema Compliance
2. **TC-02:** ISBN Validation: Reject Malformed ISBN
3. **TC-03:** Inventory Invariant: `availableCopies <= totalCopies`
4. **TC-04:** Book Cataloging (CRUD Create)
5. **TC-05:** Member Onboarding & Email Format Validation
6. **TC-06:** Circulation Workflow: Issue Book & Decrement Stock
7. **TC-07:** Referential Integrity: Reject Deletion of Active Borrowed Book
8. **TC-08:** Circulation Workflow: Return Book & Restore Stock
9. **TC-09:** Financial Logic: Automated Overdue Fine Calculation ($0.50/day)
10. **TC-10:** Lifecycle Cleanup & State Restoration

---

## 📄 License & Credits
Developed as a practical virtual internship full-stack development project.
MIT License.
