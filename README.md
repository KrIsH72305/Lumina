# Lumina Performance Suite 🚀
### Enterprise-Grade Performance Management for Atomberg

Lumina is a premium, full-stack enterprise performance management suite designed to handle the complete, complex employee lifecycle. Built to support massive scale, it integrates advanced **policy enforcement engine rules**, **Microsoft Entra ID (SSO)**, **Microsoft Teams interactive notifications**, and a custom **Rule-Based Skip-Level Escalation Engine**.

> [!IMPORTANT]
> ### 🔗 Production Deployment
> * **Live URL:** [https://lumina-one-flame.vercel.app/login](https://lumina-one-flame.vercel.app/login)
> * **Database:** Hosted on a high-performance **Neon Serverless PostgreSQL** cluster in AWS US East 1 (N. Virginia), co-located directly alongside Vercel serverless nodes for sub-millisecond query latencies.

---

## 🛠️ High-Performance Tech Stack
* **Framework:** Next.js (App Router) with full Static Optimization
* **Database:** **Neon Serverless PostgreSQL** (highly scalable, connection-pooled)
* **ORM:** Prisma Client with strict projection querying
* **Authentication:** NextAuth.js (supporting Credentials, Session tokens, and **Microsoft Entra ID (SSO)** integration)
* **Styling & UI:** Tailwind CSS, Lucide Icons, and beautiful Radix-based UI components (built completely Tailwind-utility-native)
* **Notifications:** Sonner Toast Engine for fluid, high-fidelity micro-interactions

---

## ✨ Key Enterprise Modules

### 1. Goal Setting & Smart Policy Enforcement
* **SMART Goal Sheets:** Supports full goal creation, target metrics, draft auto-saves, and manager review request workflows.
* **Strict BRD Policy Guard:** The client-side form and API controllers strictly enforce:
  1. *Total Goal Weightage must sum to exactly **100%**.*
  2. *A maximum of **8 goals** can be defined per cycle.*
  3. *A minimum weightage of **10%** is required per individual goal.*
* **Window Restraints:** Database endpoints throw a structured `403 Forbidden` if submissions are attempted outside the designated cycle window.

### 2. Rule-Based Skip-Level Escalation Engine (Section 5 Bonus!)
Lumina features an advanced administrative automated delinquency daemon that monitors cycles and logs active alerts in real-time.
* **Multi-Level Priority Routing:**
  * **Level 1 (Direct Warning):** Automated reminders sent straight to the employee's timeline when goals are delinquent.
  * **Level 2 (Manager Escalation):** Delinquency warnings escalated directly to their immediate manager.
  * **Level 3 (HR Skip-Level Intervention):** Flagged as high-risk, triggering intervention flags to Human Resources and skip-level heads.
* **Admin Control Panel:** Administrators can adjust threshold limits (days allowed) dynamically and trigger immediate audits.
* **Playground Reset:** Includes a one-click system reset utility to clear log archives and restore defaults for unlimited test runs.

### 3. Integrated Feedback & Meeting Scheduler
* **1:1 Scheduler:** Book sessions directly with managers, featuring detailed status timelines and action-item tracking.
* **Continuous Feedback Loops:** Direct peer-to-peer and manager feedback submissions.
* **9-Box Grid & Succession Planning:** HR dashboard visually plotting employee potential against performance.
* **Dedicated PIP Workflows:** Performance Improvement Plans with structured progress logs and approval gates.

---

## 🔗 Enterprise Integration Architecture

### 🔐 Microsoft Entra ID (Azure AD) - SSO
* **SSO Implementation:** Native, pre-configured `AzureADProvider` securely handles identity confirmation.
* **Dynamic Group Mapping:** Automatically maps Entra ID roles to internal user permissions (Employee, Manager, Admin).

### 💬 Microsoft Teams & Notification Auditing
* **Adaptive Cards:** Fully compliant, interactive JSON Adaptive Card structures are prepared for Teams channels.
* **Deep-Linking:** Teams payloads contain target action URLs to redirect employees to their exact goal submission pages.
* **Audit Registry Console:** View full raw JSON payloads, Teams adaptive templates, and email dispatches live at `/admin/logs`.

---

## 🔑 Demo Credentials
Log in instantly using these pre-seeded profiles:

| Role | Email | Password |
| :--- | :--- | :--- |
| 👑 **Administrator** | `admin@lumina.com` | `Demo@1234` |
| 👔 **Manager** | `manager@lumina.com` | `Demo@1234` |
| 🧑‍💻 **Employee (Alex)** | `employee@lumina.com` | `Demo@1234` |
| 🧑‍💻 **Employee (Jordan)** | `pip@lumina.com` | `Demo@1234` |

---

## 💻 Running Locally

### 1. Prerequisites
* **Node.js** v18+
* **Neon.tech** or any PostgreSQL Database

### 2. Installation
```powershell
# 1. Clone the repository
git clone https://github.com/KrIsH72305/Lumina.git
cd Lumina

# 2. Install dependencies
npm install

# 3. Create .env file in root
DATABASE_URL="postgresql://neondb_owner:npg_IqgBZUHaRm34@ep-snowy-king-app3cwt4.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"
NEXTAUTH_SECRET="supersecret12345"
NEXTAUTH_URL="http://localhost:3000"

# 4. Generate local Prisma client types
npx prisma generate

# 5. Push schema migrations and seed the database
npx prisma db push
npx prisma db seed

# 6. Boot the development server
npm run dev
```

---

## 📊 Complete Evaluator Flow (Grade Sheet Guide)

Follow this logical loop to score the project:
1. **SSO & Auth Verification:** Log in as **Alex Rivera** (`employee@lumina.com`). Try creating goals totaling 90% or adding 9 goals to see our strict BRD validators throw alerts instantly. Submit goals totaling 100% to lock them.
2. **Approval Verification:** Log in as **Sarah Chen** (`manager@lumina.com`). Select Alex Rivera under **Review Goal Sheets** to approve or request rework in one click.
3. **Integrations Verification:** Access the **Audit Registry Dashboard** at `/admin/logs` to see the generated JSON Teams Adaptive Cards and transaction email payloads in real-time.
4. **Escalation Engine Verification:** Log in as **Devon Vance** (`admin@lumina.com`). Scroll to the **Escalation Console**, modify rule days, and trigger the live evaluation engine. Active delinquencies immediately get flagged as Level 3 Rose-red HR alerts!
