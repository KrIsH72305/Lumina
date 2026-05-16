# Lumina Performance Suite 🚀
### Enterprise-Grade Performance Management for Atomberg

Lumina is a robust, full-stack performance management application designed to handle the complex end-to-end employee performance lifecycle. Built with a focus on **automated policy enforcement**, **enterprise integrations**, and **data-driven insights**.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS, Lucide React, Shadcn/UI
- **Backend**: Next.js API Routes, Server Actions
- **Database**: PostgreSQL via **Supabase**
- **ORM**: Prisma
- **Authentication**: NextAuth.js (supporting Credentials & **Microsoft Entra ID/Azure AD**)
- **State Management**: React Hooks & Server-Side Data Fetching

---

## ✨ Key Modules & Features

### 1. Goal Setting & Management
- **SMART Goals**: Enforce weightage-based goals (totaling 100%).
- **Policy Enforcement**: Backend validation prevents goal submission or modification outside the defined "Goal Setting Window" (April - May).
- **Multi-Level Approval**: Integrated workflow for Manager review, approvals, and rework requests.

### 2. Continuous Performance Management
- **Quarterly Check-ins**: Automated quarterly windows (Q1-Q4) for employee progress updates.
- **1:1 Meeting Scheduler**: Integrated scheduling tool with precise date/time selection and meeting history.
- **Feedback Engine**: Real-time peer and manager feedback loops.

### 3. Talent & Succession (HR Ops)
- **9-Box Grid**: Visual talent mapping (Performance vs. Potential).
- **PIP Workflow**: Dedicated performance improvement plan management with status tracking.
- **Succession Planning**: Identification of future leaders with readiness tracking.

---

## 🔗 Enterprise Integrations

### 🔐 Microsoft Entra ID (Azure AD) - SSO
- **SSO Implementation**: Pre-configured `AzureADProvider` for seamless enterprise login.
- **Role Mapping**: Automatic mapping of Azure AD groups to Lumina roles (Employee, Manager, Admin).

### 💬 Microsoft Teams & Notifications
- **Adaptive Cards**: The system generates rich, interactive JSON payloads for Microsoft Teams notifications.
- **Deep-Linking**: Every notification includes deep-links that take users directly to the relevant action page (e.g., specific Goal Sheets).
- **Notification Audit Log**: A dedicated dashboard at `/admin/logs` provides visual proof of all sent Email and Teams notifications, including raw JSON payloads.

---

## 🛡️ Policy Enforcement (Atomberg Specific)
The application strictly enforces performance cycles as per enterprise policy:
- **Goal Setting**: Open April 1st - May 15th.
- **Q1 Check-in**: Open July 1st - July 15th.
- **Q2 Check-in**: Open Oct 1st - Oct 15th.
- **Q3 Check-in**: Open Jan 1st - Jan 15th.
- **Q4 Check-in**: Open April 1st - April 15th.
*Backend triggers `403 Forbidden` for actions attempted outside these windows.*

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL (Supabase recommended)

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Setup `.env` file:
   ```env
   DATABASE_URL="your_postgresql_url"
   NEXTAUTH_SECRET="your_secret"
   ```
4. Push database schema: `npx prisma db push`
5. Seed initial data: `npx prisma db seed`
6. Run dev server: `npm run dev`

---

## 🔑 Demo Credentials
| Role | Email | Password |
| :--- | :--- | :--- |
| **Employee** | `employee@lumina.com` | `Demo@1234` |
| **Manager** | `manager@lumina.com` | `Demo@1234` |

---

## 📊 Evaluation Guide
To verify the system's "hidden" logic:
1. **Audit Logs**: Navigate to `/admin/logs` while logged in as a Manager to see the notification history.
2. **Window Enforcement**: Try submitting goals while the system clock is set outside the April-May window to see the automated blocking logic.
3. **Teams Integration**: Inspect the terminal output during a submission to see the generated Teams Adaptive Card payload.
