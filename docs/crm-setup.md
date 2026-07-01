# Valeris CRM — Setup Guide

This document is the single source of truth for setting up and deploying the Valeris internal CRM.

## Architecture

```
Website contact form ──→ Google Apps Script API ──→ Google Sheets (database)
                                    ↑
                          Next.js CRM frontend
                          (via /api/crm proxy)
```

**The CRM never communicates directly with Google Sheets.** Every request from the Next.js frontend goes through the Apps Script API. Google Sheets is the database. Apps Script is the backend. The Apps Script Web App URL is a server-side environment variable — it never appears in browser code or the client bundle.

## What Gets Deployed

| Layer | What it is | Where it lives |
|-------|-----------|----------------|
| Database | Google Sheets workbook (9 entity sheets + meta) | Google Drive (client account) |
| Backend API | Apps Script Web App | Bound to the Google Sheet |
| Website contact form | `crmEndpoint` in `assets/js/config.js` | Part of the marketing website |
| CRM frontend | Next.js app at `valeris-crm/` | Vercel (or any Node host) |

Both the website contact form and the CRM frontend call the **same Apps Script URL** — one backend serves both.

---

## Part 1 — Google Sheets and Apps Script

### 1.1 Create the spreadsheet

1. Sign in to the client's Google account.
2. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.
3. Name it: **Valeris CRM**.

### 1.2 Install the backend code

1. Inside the spreadsheet: **Extensions → Apps Script**.
2. Delete the default `function myFunction() {}` placeholder.
3. Paste the entire contents of `apps-script/Code.gs` from this repository.
4. Optional: set `NOTIFY_EMAIL` near the top to receive an email for each new website lead.
5. Save (Ctrl+S / ⌘+S).

### 1.3 Run one-time sheet setup

1. In the Apps Script editor, select **`setupCrm`** from the function dropdown.
2. Click **Run** and approve any permission prompts.
3. Verify the spreadsheet now has these sheets:

| Sheet | Purpose |
|-------|---------|
| `Leads` | Inbound website inquiries |
| `Companies` | B2B organizations |
| `Contacts` | Individuals at companies |
| `Projects` | Active service engagements |
| `Tasks` | Action items linked to any entity |
| `Notes` | Free-text notes on any entity |
| `Activities` | Immutable timestamped event log |
| `Users` | CRM team members, roles, hashed passwords |
| `Settings` | Configurable lookup values (statuses, service lines, etc.) |
| `_Meta` | Schema version tracking |
| `Dashboard` | Lead count summaries (read-only formulas) |
| `README` | Operational notes |

> **`setupCrm()` is safe to re-run at any time.** It is idempotent and additive — missing columns are added, existing data is never removed.

> **Remove any `onEdit` trigger** from prior versions of this file. Go to Apps Script editor → Triggers (clock icon on left sidebar) → delete any `onEdit` trigger. The `updated_at` column is now written explicitly by every API action; the trigger is no longer needed.

### 1.4 Create the first Owner user

Run this once from the Apps Script editor — not callable from the web:

1. In the Apps Script editor, temporarily add and run this function:

```javascript
function runSeedOwner() {
  var result = seedOwner(
    'agata@valeris.com.in',
    'your-secure-password',
    'Agata Mielczarek-Korzeniowska'
  );
  Logger.log(result);
}
```

2. Select `runSeedOwner` from the function dropdown and click **Run**.
3. Check the **Execution log** for a confirmation message.
4. Verify a new row appears in the `Users` sheet.
5. Delete `runSeedOwner()` from the editor after use.

> `seedOwner()` is intentionally not accessible via HTTP.

### 1.5 Deploy as Web App

1. In the Apps Script editor: **Deploy → New deployment**.
2. Click the gear icon beside "Select type" → **Web app**.
3. Configure:
   - **Description**: Valeris CRM v1
   - **Execute as**: Me
   - **Who has access**: Anyone
4. Click **Deploy** and copy the **Web App URL**.

> **For future code updates**: use **Deploy → Manage deployments → edit the existing deployment**. Do not create a new deployment — a new deployment generates a new URL, which breaks both the website form and the CRM frontend.

### 1.6 Wire the URL into both clients

**Website contact form** — paste into `assets/js/config.js`:
```javascript
window.VALERIS_CONFIG = {
  crmEndpoint: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
};
```

**CRM frontend** — paste into `valeris-crm/.env.local`:
```
APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Both point to the **same URL**.

### 1.7 Protect all sheets except Leads

1. In Google Sheets: **Data → Protect sheets and ranges**.
2. Protect every sheet **except `Leads`** from direct editing.
3. The `Leads` sheet intentionally allows manual edits (status, owner, next action, notes).
4. All other sheets must only be modified through the CRM API.

### 1.8 Verify the setup

Open the Web App URL in a browser. You should see:
```json
{ "ok": true, "version": "1" }
```

If you see a Google login page, confirm **Who has access: Anyone** is set in the deployment.

---

## Part 2 — Next.js CRM Frontend

### 2.1 Prerequisites

- Node.js 20 or later
- npm 10 or later

### 2.2 Install dependencies

```bash
cd valeris-crm
npm install
```

### 2.3 Environment variables

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|----------|-------------|
| `APPS_SCRIPT_URL` | The Web App URL from Part 1.5. **Server-side only. Do NOT prefix with `NEXT_PUBLIC_`.** |

### 2.4 Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with the Owner credentials from Part 1.4.

If `APPS_SCRIPT_URL` is not set, the login page shows a configuration error rather than crashing.

### 2.5 Verify before deploying

```bash
npm run build
npm run lint
npm run typecheck
```

All three must pass with zero errors.

### 2.6 Deploy to Vercel

1. Push `valeris-crm/` to a **private** GitHub repository (separate from the marketing website repo).
2. Connect it to Vercel.
3. Add `APPS_SCRIPT_URL` as a server-side environment variable in the Vercel dashboard.
4. Deploy.

---

## Part 3 — Adding Team Members

After the first Owner is created:

1. Sign in to the CRM as Owner or Administrator.
2. Go to **Team** in the sidebar.
3. Click **Add team member** — enter name, email, role, and a temporary password.
4. Share the credentials with the new team member.

Alternatively, call `seedUser(email, password, fullName, role)` directly from the Apps Script editor.

> **Password reset (M0):** Owner or Administrator resets a password by running `changePassword_(userId, newPlainPassword)` in the Apps Script editor. A self-service reset flow is planned for a future milestone.

---

## Part 4 — Schema Migrations

When a future version of `Code.gs` adds new columns or sheets:

1. Paste the new `Code.gs` into the Apps Script editor and save.
2. Run `setupCrm()` again — it adds missing columns and sheets without touching existing data.
3. Redeploy: **Deploy → Manage deployments → edit existing → Deploy**.
4. Check `_Meta` sheet: `schema_version` should show the new version number.

---

## Environment Variables Reference

### `valeris-crm/.env.local`

```env
# Apps Script Web App URL — single backend for the website form and the CRM frontend.
# Server-side only. Do NOT prefix with NEXT_PUBLIC_.
APPS_SCRIPT_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### `assets/js/config.js` (website)

```javascript
window.VALERIS_CONFIG = {
  crmEndpoint: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
};
```

---

## Roles

| Role | Capabilities |
|------|-------------|
| **Owner** | Full access — team management, settings, all data |
| **Administrator** | Same as Owner except cannot demote the Owner |
| **Sales** | Read all Leads, Companies, Contacts. Edit records they own or are assigned to. |
| **Operations** | Read access same as Sales. Full CRUD on Projects and Tasks they are assigned to. |

---

## Google Sheets Schema

All column positions are defined in `COLS` constants in `Code.gs`. Column positions never shift — new columns are always appended at the end of each sheet. Never manually reorder columns in the sheet without updating `Code.gs`.

### Entity ID format

`PREFIX-YYYYMMDDHHmmssSSS-XXXXXX` (timestamp in script timezone + 6-char random hex suffix).

| Sheet | ID column | Prefix |
|-------|----------|--------|
| Leads | `lead_id` | `VAL-` |
| Users | `user_id` | `USR-` |
| Companies | `company_id` | `CMP-` |
| Contacts | `contact_id` | `CON-` |
| Projects | `project_id` | `PRJ-` |
| Tasks | `task_id` | `TSK-` |
| Notes | `note_id` | `NOT-` |
| Activities | `activity_id` | `ACT-` |

### Polymorphic relationships

`Notes`, `Activities`, and `Tasks` each have an `entity_type` column (`Lead`, `Company`, `Contact`, `Project`) and an `entity_id` column referencing any entity. This keeps one Notes sheet instead of one per entity type, and powers the unified Timeline view on every detail page.

### Soft deletes

`Leads`, `Companies`, `Contacts`, `Projects`, `Tasks`, and `Notes` have a `deleted_at` column. Deletion sets this timestamp — rows are never removed. The API filters `deleted_at = ''` on all list queries. Activities are immutable and never deleted.

### Audit fields

Every business entity has: `created_at`, `created_by`, `updated_at`, `updated_by`. Website-sourced leads use `"website"` as `created_by`. The bootstrap Owner uses `"bootstrap"`.

---

## Troubleshooting

**Website form not reaching the sheet**
- Check `crmEndpoint` in `assets/js/config.js`.
- Open the URL in a browser — should return `{ "ok": true, "version": "1" }`.
- Confirm deployment: Who has access = **Anyone**.

**CRM login fails with "CRM not configured"**
- `APPS_SCRIPT_URL` is missing from `.env.local` or the Vercel environment.

**CRM login fails with "Incorrect email or password"**
- Check the `Users` sheet: `status` column must be `Active`.
- Confirm the credentials match what was set in `seedOwner()`.

**Session expires unexpectedly**
- Sessions use a 24-hour sliding window. Closing the browser does not end the session.
- If the session cookie is missing, check browser dev tools → Application → Cookies for `valeris_session`.

**"Unknown action" error from Apps Script**
- The Apps Script code is outdated relative to what the frontend expects.
- Paste the latest `Code.gs`, save, and redeploy the existing deployment.
