# SafeKazi

> **M-Pesa Micro-Escrow Platform for African Freelancers & SME Clients**

SafeKazi is a financial utility platform designed to reduce payment risk between **East African freelancers** and **local small-to-medium enterprise (SME) clients**.

Instead of requiring freelancers and clients to use international freelance marketplaces, SafeKazi provides a localized workflow built around **Kenyan Shillings (KES), M-Pesa, and milestone-based project payments**.

Freelancers can create a project, define its scope and price, generate a shareable payment link, and request payment from their client. The client pays through an M-Pesa-powered flow, after which the project progresses through defined financial states until the funds are released, refunded, or placed under dispute.

> **SafeKazi is currently an MVP/prototype. Production payment handling, escrow operations, regulatory compliance, and dispute resolution must be validated before handling real customer funds.**

---

##  The Problem

Freelancers and SMEs in local markets often rely on informal payment arrangements.

This creates a **trust deficit on both sides**.

### Freelancer perspective

Freelancers may face:

* Clients delaying payment after delivery
* Clients refusing to pay the final balance
* Unclear project scope
* Excessive revision requests
* Ghosting after work has been completed

### Client perspective

Clients may hesitate to pay upfront because they worry that:

* The freelancer may disappear
* The delivered work may not match the agreed scope
* The freelancer may not complete the project
* They may have limited recourse when something goes wrong

### Limitations of existing alternatives

International freelance marketplaces can introduce additional barriers for local users, including:

* International payment requirements
* Foreign-currency workflows
* Platform fees
* Dependence on cards or international transfers
* Workflows that are not optimized around M-Pesa

Direct M-Pesa transfers solve the payment-transfer problem but do not, by themselves, provide a structured project-payment workflow or an application-level dispute state.

---

#  The SafeKazi Solution

SafeKazi acts as a **payment coordination layer between a freelancer and their client**.

The freelancer does not need to find the client through SafeKazi.

Instead, they can continue finding clients through channels they already use:

* WhatsApp
* Instagram
* X
* Referrals
* Direct outreach
* Existing business relationships

SafeKazi handles the project payment workflow.

### Core workflow

```text
Freelancer
    │
    │ Creates project
    ▼
SafeKazi
    │
    │ Generates payment link
    ▼
Client
    │
    │ Opens link
    ▼
M-Pesa Payment
    │
    │ STK Push
    ▼
SafeKazi Payment Layer
    │
    │ Payment confirmed
    ▼
Project → LOCKED
    │
    │ Freelancer delivers work
    ▼
Client reviews work
    │
    ├───────────────┐
    │               │
 Approves        Disputes
    │               │
    ▼               ▼
Released        Disputed
    │
    ▼
Freelancer payout
```

---

#  Core Features

##  Instant Payment Links

Freelancers can create lightweight project links containing information such as:

* Project title
* Project description
* Agreed amount
* Client payment instructions
* Project status
* Approval/dispute actions

The generated link can be shared through:

* WhatsApp
* Email
* Social media
* Direct messages

No marketplace profile is required for the client.

---

##  M-Pesa Integration

SafeKazi is designed around the **Safaricom Daraja API**.

The payment architecture supports:

### C2B / STK Push

The client receives an M-Pesa payment prompt on their phone.

```text
Client
   ↓
Payment Link
   ↓
STK Push
   ↓
M-Pesa PIN
   ↓
Payment Confirmation
   ↓
SafeKazi
```

### B2C Payout

After the project reaches the appropriate release state, the system can initiate a B2C payout to the freelancer.

---

##  Real-Time Project Status

Projects use explicit financial states rather than relying on informal communication.

| Status      | Meaning                                            |
| ----------- | -------------------------------------------------- |
| `Pending`   | Project created but payment has not been confirmed |
| `Locked`    | Client payment has been confirmed                  |
| `Released`  | Funds have been released for payout                |
| `Disputed`  | Project has entered a dispute state                |
| `Cancelled` | Project has been cancelled                         |

This state machine provides a clear representation of the project's financial workflow.

---

#  Transaction Fee

SafeKazi's proposed MVP pricing model uses a:

> **3% flat transaction/service fee**

For example:

```text
Project value:       KES 10,000
SafeKazi fee (3%):   KES    300
Net payout:          KES  9,700
```

The final commercial and regulatory treatment of this fee must be validated before production launch.

---

#  Dispute Protection

If a client marks a project as non-compliant with the agreed scope, the project can enter:

```text
DISPUTED
```

While disputed, the payout workflow should not proceed automatically.

The MVP models this using a hold/state mechanism:

```text
LOCKED
   │
   ├── Client approves ──→ RELEASED
   │
   └── Client disputes ──→ DISPUTED
```

Future versions can introduce a formal dispute-resolution workflow involving evidence submission, review, deadlines, and administrator decisions.

---

#  System Architecture

```text
                                  ┌─────────────────────────┐
                                  │     Freelancer / SME    │
                                  │       React Web App     │
                                  └────────────┬────────────┘
                                               │
                                               │ HTTPS / JWT
                                               ▼
                                  ┌─────────────────────────┐
                                  │    Express Backend API  │
                                  │      Node.js Service     │
                                  └────────────┬────────────┘
                                               │
                          ┌────────────────────┼────────────────────┐
                          │                    │                    │
                          ▼                    ▼                    ▼
                ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
                │   PostgreSQL     │  │  Daraja Service  │  │ Authentication   │
                │                  │  │                  │  │                  │
                │ ACID Transactions│  │ STK / B2C / Query│  │ JWT + bcrypt     │
                └──────────────────┘  └────────┬─────────┘  └──────────────────┘
                                               │
                                               │ HTTPS
                                               ▼
                                  ┌─────────────────────────┐
                                  │  Safaricom Daraja API   │
                                  │                         │
                                  │ C2B / STK Push / B2C   │
                                  └─────────────────────────┘
```

---

#  Technology Stack

## Frontend

* **React 18**
* **Tailwind CSS**
* **Axios**
* **Lucide Icons**

## Backend

* **Node.js**
* **Express.js**

## Database

* **PostgreSQL**
* Transactional database operations
* Foreign-key constraints
* Enumerated project and transaction states
* ACID-oriented financial ledger design

## Authentication

* **JWT**
* **bcrypt**
* Protected API routes

## Payments

* **Safaricom Daraja API**
* STK Push / C2B
* B2C
* Transaction/query functionality
* Mock Daraja adapter for development

---

#  Project Structure

```text
safekazi/
│
├── client/                         # React frontend
│   ├── public/
│   └── src/
│       ├── components/             # Reusable UI components
│       ├── context/                # Authentication & application state
│       ├── pages/                  # Application pages
│       ├── services/               # API clients
│       └── App.jsx
│
├── server/                         # Express backend
│   ├── config/                     # Database & environment configuration
│   ├── controllers/                # Auth, project & payment controllers
│   ├── middleware/                 # Authentication & validation
│   ├── routes/                     # REST API routes
│   ├── services/                   # Daraja & payment services
│   └── index.js
│
├── database/
│   └── schema.sql                  # Database schema
│
├── .env.example                    # Environment template
├── .gitignore
├── README.md
└── package.json
```

---

#  Mock Daraja Service

SafeKazi includes a mock Daraja service so development does not depend on live Safaricom payment infrastructure.

Enable it with:

```env
USE_MOCK_DARAJA=true
```

The mock service simulates:

### 1. STK Push

The system accepts a valid Kenyan phone number in the expected format:

```text
2547XXXXXXXX
```

### 2. Processing Delay

The mock service simulates a short network/payment-processing delay.

### 3. Callback

A simulated M-Pesa receipt is generated and the project transitions from:

```text
PENDING
   ↓
LOCKED
```

This allows developers to test the payment workflow without sending real money.

---

# 🔌 API

Base URL:

```text
/api/v1
```

## Authentication

| Method | Endpoint         | Description                 | Authentication |
| ------ | ---------------- | --------------------------- | -------------- |
| `POST` | `/auth/register` | Register freelancer account | No             |
| `POST` | `/auth/login`    | Authenticate user           | No             |

## Projects

| Method | Endpoint                | Description                      | Authentication |
| ------ | ----------------------- | -------------------------------- | -------------- |
| `POST` | `/projects`             | Create project and payment link  | Yes            |
| `GET`  | `/projects`             | Retrieve user's projects         | Yes            |
| `GET`  | `/projects/public/:id`  | View public project/payment page | No             |
| `POST` | `/projects/:id/approve` | Approve completed work           | No             |

## Payments

| Method | Endpoint            | Description             | Authentication |
| ------ | ------------------- | ----------------------- | -------------- |
| `POST` | `/payments/stkpush` | Trigger M-Pesa STK Push | No             |

---

#  Core User Journey

### 1. Freelancer Creates Project

The freelancer enters:

```text
Project Title
Project Description
Agreed Amount
Client Phone Number
```

SafeKazi creates a project with:

```text
PENDING
```

### 2. Payment Link Is Generated

The freelancer receives a shareable project URL.

Example:

```text
https://safekazi.com/project/PROJECT_ID
```

The freelancer sends the link to the client.

### 3. Client Pays

The client opens the link and initiates payment.

SafeKazi triggers:

```text
STK PUSH
```

The client enters their M-Pesa PIN.

### 4. Payment Is Confirmed

After successful confirmation:

```text
PENDING → LOCKED
```

The transaction is recorded in the database.

### 5. Freelancer Delivers

The freelancer completes and delivers the agreed work.

### 6. Client Approves

The client reviews the work.

If the client approves:

```text
LOCKED → RELEASED
```

The payout process can then be initiated.

### 7. Dispute

If the client believes the delivered work does not meet the agreed scope:

```text
LOCKED → DISPUTED
```

The automatic payout workflow should stop until the dispute is resolved.

---

#  Security Considerations

Because SafeKazi handles authentication and payment-related information, security is a core requirement.

The application should implement:

* Password hashing with bcrypt
* JWT authentication
* Protected API routes
* Input validation
* Server-side authorization
* Parameterized database queries
* Environment-based secrets
* HTTPS in production
* API rate limiting
* Secure callback validation
* Transaction idempotency
* Audit logging
* Protection against replayed payment callbacks
* Protection against duplicate payouts

Financial state transitions should be performed **server-side**, never trusted from client-side requests.

---

# ⚖️ Compliance & Production Readiness

SafeKazi is currently an MVP/prototype.

Before production use involving real customer funds, the platform will require appropriate review of:

* Kenyan payment-services requirements
* CBK regulatory considerations
* Safaricom Daraja onboarding requirements
* Escrow/custodial-funds implications
* KYC requirements
* AML/CFT obligations where applicable
* Data protection requirements
* Consumer protection
* Dispute-resolution procedures
* Payment reconciliation
* Refund procedures

The application should not be presented as a regulated escrow service until the relevant legal and regulatory requirements have been established and satisfied.

---

#  Contributing

Contributions are welcome as the project develops.

---

#  License

This project is currently under development.

A formal open-source or proprietary license should be selected before public distribution.

---

#  Project

**SafeKazi**

> **Trust the work. Secure the payment.**

Built as a localized financial utility for freelancers and SMEs operating in M-Pesa-driven markets.

---

##  Disclaimer

SafeKazi is an experimental software project and MVP concept.

Nothing in this repository constitutes financial, legal, regulatory, or investment advice.

The payment and escrow mechanisms described in this README are architectural/product concepts until they have been properly implemented, tested, and reviewed for applicable regulatory requirements.

