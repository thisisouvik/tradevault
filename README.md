# TrustEscrow

> **Algorand DeFi Track Hackathon** — Replace a $240 bank letter of credit with a $0.002 Algorand smart contract.

TrustEscrow is a non-custodial escrow platform for cross-border trade. It empowers businesses and individuals to trade goods globally without relying on banks, expensive letters of credit, or centralized middlemen. A completely immutable Algorand smart contract acts as the escrow agent, ensuring zero-trust execution.

---

## 🏗 Architecture & Tech Stack

Our system is structured into three discrete layers: **Frontend**, **Backend/BaaS**, and **Blockchain Layer**.

### 1. Frontend Operations
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Design System:** Custom Light SaaS Theme (DM Sans font, #111827 text, #2563EB primary accent, clean #FFFFFF cards on #F0F2F5 backgrounds).

### 2. Backend & Infrastructure (Supabase)
- **Authentication:** Supabase Auth (Email & Password, JWTs passed securely to the frontend).
- **Database:** Supabase PostgreSQL (Stores off-chain metadata like names, tracking IDs, and item descriptions).
- **Storage:** Supabase Storage (Secure bucket for uploading dispute evidence photos).
- **Real-time / API:** Supabase JS Client for ultra-fast, direct data fetching with Row Level Security (RLS) policies.

### 3. Blockchain Layer (Algorand)
- **Smart Contract Language:** Python (using PuyaPy for Algorand smart contracts).
- **Network:** Algorand TestNet
- **Payment Token:** USDC (TestNet ASA ID: `10458941`)
- **Wallet Connection:** Pera Wallet (`@perawallet/connect`) via `algosdk`.

### 4. External Integrations
- **Email:** Resend API (For transactional emails to buyer/seller).
- **Shipping Validation:** TrackingMore API (Validates package delivery status to trigger smart contract).
- **Automation:** Vercel Cron (Checks for dormant contracts to automatically release funds via Timeout conditions).

---

## ⚙️ System Workflow & Contract Lifecycle

1. **PROPOSED:** Seller drafts the contract details (price, item, buyer wallet address, dispute window). The contract is compiled and deployed to the Algorand blockchain.
2. **FUNDED:** Buyer reviews the on-chain contract and calls the `fund` method. This is grouped atomically with a USDC transfer. The contract now securely holds the funds.
3. **DELIVERED:** Seller ships the item and submits the tracking number. We verify it via TrackingMore API, and store a **SHA256 hash** of the tracking on-chain permanently.
4. **COMPLETED:** Buyer receives the item and calls the `confirm` method. An inner transaction executes, sending the locked USDC directly to the Seller.
5. **DISPUTED (Edge Case):** If the buyer flags an issue, funds are locked pending arbitration. Both parties upload photo evidence to Supabase Storage. An arbitrator reviews the evidence and sends a split payout ratio to the contract, which distributes the funds accordingly.

---

## 🗄️ Data Storage Strategy

We maintain a strict separation of concerns between on-chain data and off-chain data for cost-efficiency.

**On-chain (`algosdk`):**
- Contract State (`status`)
- Token balances (USDC custody)
- Cryptographic proof (Buyer/Seller public keys, Tracking SHA256 hashes)

**Off-chain (Supabase):**
- `profiles`: User information (auto-linked to Auth UUIDs).
- `deals`: Human-readable deal data (title, description, raw tracking numbers).
- `evidence`: URLs to dispute photos.
- `arbitration`: Off-chain reasoning logs for rulings.

---

## 🚀 Local Development Setup

Follow these steps to run the platform locally.

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd tradevault
npm install
```

### 2. Configure Supabase (Database & Auth)
1. Create a free project at [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard and run the entire script found in `supabase/schema.sql` to generate your tables, triggers, and RLS policies.
3. Go to **Storage**, click "New Bucket", and create a public bucket named `evidence`.

### 3. Setup Environment Variables
We have committed an example `.env.local.example` file that lists all necessary variables. **Duplicate this file and remove `.example`:**

```bash
cp .env.local.example .env.local
```

Inside `.env.local`, fill in your project-specific details:
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Get these from Supabase -> Settings -> API.
- `SUPABASE_SERVICE_ROLE_KEY`: Required for server-side trusted operations.
- `PLATFORM_MNEMONIC`: A 25-word Algorand TestNet mnemonic for the server wallet that pays for automated/cron transaction fees.

### 4. Smart Contract Compilation (Optional)
If you wish to modify the smart contract, you need the Python `algokit`:
```bash
pip install algokit
algokit compile contract/smart_contracts/escrow/contract.py
```

### 5. Start the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:3000` to view the application.

---

## 🎨 UI & Design System

The application uses an enterprise SaaS design approach.
- Dark Sidebar (`#1A1D23`) combined with a Light Content layer (`#F0F2F5`).
- Clean white cards (`#FFFFFF`) with 12px border radius.
- Standardized status badges mapped to exact colors (e.g., `FUNDED` = Orange, `COMPLETED` = Green, `DISPUTED` = Red).

---

## 🤝 Open Source Note

TrustEscrow was built for the **Algorand DeFi Track Hackathon**. It aims to solve real-world trade finance issues using the immutability of AVM (Algorand Virtual Machine) state validation. No middlemen required—just math.
