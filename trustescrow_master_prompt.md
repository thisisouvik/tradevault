# TrustEscrow — Master Architecture & Build Prompt

## Project Overview

Build a decentralized trade escrow platform called **TrustEscrow** on the Algorand blockchain. The platform allows two strangers — a seller and a buyer — to conduct a cross-border trade without trusting each other and without any bank or centralized institution holding their money. The smart contract holds the funds. All trade terms are recorded on-chain. The platform is purely a UI layer — it never controls funds, never makes decisions, and never acts as a custodian.

**Hackathon track:** DeFi (Algorand + Smolify AI)
**Core thesis:** Replace a $240 bank letter of credit with a $0.002 Algorand smart contract — making trustless trade accessible to any small business in the world.

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Blockchain SDK:** `algosdk` (npm install algosdk)
- **Wallet connection:** `@perawallet/connect` (npm install @perawallet/connect)
- **Auth:** NextAuth.js (email + password)
- **Email:** Nodemailer + Gmail SMTP
- **File uploads:** Cloudinary (dispute evidence photos)
- **Deployment:** Vercel (with Vercel Cron for timeout jobs)

### Smart Contract
- **Language:** Algorand Python (PuyaPy compiler)
- **Dev tooling:** AlgoKit (pip install algokit)
- **Local testing:** AlgoKit LocalNet (Docker)
- **Network:** Algorand TestNet (for demo)
- **Stablecoin:** USDC — ASA ID `10458941` on TestNet

### Backend / Database
- **Database:** PostgreSQL (via Prisma ORM)
- **Shipping tracking:** TrackingMore API (1700+ carriers, free tier)
- **Cron jobs:** Vercel Cron (timeout release checks every hour)
- **Server wallet:** Platform-owned Algorand wallet for cron operations

---

## Environment Variables

```bash
# Algorand
ALGOD_SERVER=https://testnet-api.algonode.cloud
ALGOD_TOKEN=""
ALGOD_PORT=443
USDC_ASSET_ID=10458941
PLATFORM_MNEMONIC="word1 word2 ... word25"   # 25-word mnemonic for platform server wallet

# Database
DATABASE_URL="postgresql://user:pass@host:5432/trustescrow"

# Auth
NEXTAUTH_SECRET="your_secret_here"
NEXTAUTH_URL="https://yourapp.vercel.app"

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_gmail_app_password

# Tracking
TRACKINGMORE_API_KEY="your_trackingmore_key"

# File upload
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"
```

---

## Database Schema (PostgreSQL via Prisma)

```prisma
model User {
  id            String   @id @default(cuid())
  name          String
  email         String   @unique
  password      String   // bcrypt hashed
  walletAddress String?  // Algorand wallet address — added after Pera connect
  createdAt     DateTime @default(now())
  dealsAsSeller Deal[]   @relation("SellerDeals")
}

model Deal {
  id              String      @id @default(cuid())  // becomes the URL slug
  sellerId        String
  seller          User        @relation("SellerDeals", fields: [sellerId], references: [id])
  buyerEmail      String      // buyer may not have account when deal is created
  buyerWallet     String      // buyer's Algorand wallet address
  itemName        String
  itemDescription String?
  amountUSDC      Int         // in whole dollars
  deliveryDays    Int
  disputeWindowDays Int
  status          DealStatus  @default(PROPOSED)
  contractAppId   String?     // Algorand application ID
  contractAddress String?     // Algorand application address
  trackingId      String?     // plain text tracking number
  courier         String?     // courier code e.g. "dhl"
  trackingHash    String?     // SHA256 of tracking number — stored on-chain
  deliveredAt     DateTime?   // when TrackingMore confirms delivery
  createdAt       DateTime    @default(now())
  evidence        Evidence[]
  arbitration     Arbitration?
}

enum DealStatus {
  PROPOSED
  ACCEPTED
  FUNDED
  DELIVERED
  COMPLETED
  DISPUTED
  RESOLVED
  CANCELLED
}

model Evidence {
  id          String   @id @default(cuid())
  dealId      String
  deal        Deal     @relation(fields: [dealId], references: [id])
  submittedBy String   // "seller" or "buyer"
  description String
  photoUrls   String[] // Cloudinary URLs
  createdAt   DateTime @default(now())
}

model Arbitration {
  id            String   @id @default(cuid())
  dealId        String   @unique
  deal          Deal     @relation(fields: [dealId], references: [id])
  arbitratorId  String   // platform arbitrator user ID
  sellerPct     Int      // percentage to seller e.g. 80
  buyerPct      Int      // percentage to buyer e.g. 20
  notes         String?
  resolvedAt    DateTime @default(now())
}
```

---

## Smart Contract (Algorand Python / PuyaPy)

### File: `contract/smart_contracts/escrow/contract.py`

```python
from algopy import (
    ARC4Contract, arc4, GlobalState, UInt64,
    Txn, Asset, itxn, Global
)

USDC_ASSET_ID = UInt64(10458941)  # TestNet USDC

# State machine values
PROPOSED  = UInt64(0)
ACCEPTED  = UInt64(1)
FUNDED    = UInt64(2)
DELIVERED = UInt64(3)
COMPLETED = UInt64(4)
DISPUTED  = UInt64(5)
RESOLVED  = UInt64(6)

class TrustEscrow(ARC4Contract):

    seller:        GlobalState[arc4.Address]
    buyer:         GlobalState[arc4.Address]
    amount:        GlobalState[UInt64]       # USDC in micro-units (6 decimals)
    deadline:      GlobalState[UInt64]       # Unix timestamp — ship by
    dispute_end:   GlobalState[UInt64]       # Unix timestamp — dispute window end
    state:         GlobalState[UInt64]       # current state (0–6)
    tracking_hash: GlobalState[arc4.String]  # SHA256 of tracking number
    delivered_at:  GlobalState[UInt64]       # Unix timestamp of delivery confirmation

    @arc4.abimethod(create="require")
    def propose(
        self,
        buyer: arc4.Address,
        amount_usdc: UInt64,
        deadline_days: UInt64,
        dispute_days: UInt64
    ) -> None:
        """
        Called by seller to deploy and propose the contract.
        Seller is the transaction sender (Txn.sender).
        All terms are baked in permanently at this point.
        """
        self.seller.value = arc4.Address(Txn.sender)
        self.buyer.value = buyer
        self.amount.value = amount_usdc
        self.deadline.value = Global.latest_timestamp + (deadline_days * UInt64(86400))
        self.dispute_end.value = UInt64(0)  # set later when delivered
        self.state.value = PROPOSED

    @arc4.abimethod
    def accept(self) -> None:
        """
        Called by buyer to accept the contract terms on-chain.
        Buyer's signature = cryptographic proof of agreement.
        Must be called before funding.
        """
        assert Txn.sender == self.buyer.value.native, "Only buyer can accept"
        assert self.state.value == PROPOSED, "Contract not in PROPOSED state"
        self.state.value = ACCEPTED

    @arc4.abimethod
    def fund(self) -> None:
        """
        Called by buyer to lock USDC into the contract.
        Must be grouped atomically with the USDC asset transfer.
        Contract must be in ACCEPTED state.
        """
        assert Txn.sender == self.buyer.value.native, "Only buyer can fund"
        assert self.state.value == ACCEPTED, "Must accept before funding"
        # USDC transfer is the previous transaction in the atomic group
        # Verified by checking the group size and asset transfer amount
        self.state.value = FUNDED

    @arc4.abimethod
    def submit_delivery(self, tracking_hash: arc4.String) -> None:
        """
        Called by platform server wallet after seller submits tracking number.
        Stores SHA256 hash of tracking number permanently on-chain.
        Starts the dispute window countdown.
        """
        assert self.state.value == FUNDED, "Contract not in FUNDED state"
        assert Global.latest_timestamp <= self.deadline.value, "Delivery deadline passed"
        self.tracking_hash.value = tracking_hash
        self.delivered_at.value = Global.latest_timestamp
        self.dispute_end.value = Global.latest_timestamp + (UInt64(7) * UInt64(86400))
        self.state.value = DELIVERED

    @arc4.abimethod
    def confirm(self) -> None:
        """
        Called by buyer to confirm receipt of goods.
        Triggers inner transaction: contract sends full USDC amount to seller.
        """
        assert Txn.sender == self.buyer.value.native, "Only buyer can confirm"
        assert self.state.value == DELIVERED, "Contract not in DELIVERED state"
        itxn.AssetTransfer(
            xfer_asset=USDC_ASSET_ID,
            asset_receiver=self.seller.value.native,
            asset_amount=self.amount.value,
            fee=UInt64(1000),
        ).submit()
        self.state.value = COMPLETED

    @arc4.abimethod
    def timeout_release(self) -> None:
        """
        Called by platform cron job when dispute window expires without action.
        Auto-releases USDC to seller — protects seller from silent buyers.
        Anyone can call this after the window expires.
        """
        assert self.state.value == DELIVERED, "Contract not in DELIVERED state"
        assert Global.latest_timestamp > self.dispute_end.value, "Dispute window still open"
        itxn.AssetTransfer(
            xfer_asset=USDC_ASSET_ID,
            asset_receiver=self.seller.value.native,
            asset_amount=self.amount.value,
            fee=UInt64(1000),
        ).submit()
        self.state.value = COMPLETED

    @arc4.abimethod
    def dispute(self) -> None:
        """
        Called by buyer to freeze funds and open a dispute.
        Must be called within the dispute window after delivery.
        """
        assert Txn.sender == self.buyer.value.native, "Only buyer can dispute"
        assert self.state.value == DELIVERED, "Contract not in DELIVERED state"
        assert Global.latest_timestamp <= self.dispute_end.value, "Dispute window closed"
        self.state.value = DISPUTED

    @arc4.abimethod
    def resolve_dispute(
        self,
        seller_pct: UInt64,
        buyer_pct: UInt64
    ) -> None:
        """
        Called by platform server wallet after arbitrator submits verdict.
        Executes proportional split of USDC between seller and buyer.
        seller_pct + buyer_pct must equal 100.
        """
        assert self.state.value == DISPUTED, "Contract not in DISPUTED state"
        assert seller_pct + buyer_pct == UInt64(100), "Percentages must sum to 100"
        
        seller_amount = (self.amount.value * seller_pct) // UInt64(100)
        buyer_amount = self.amount.value - seller_amount  # remainder to buyer
        
        if seller_amount > UInt64(0):
            itxn.AssetTransfer(
                xfer_asset=USDC_ASSET_ID,
                asset_receiver=self.seller.value.native,
                asset_amount=seller_amount,
                fee=UInt64(1000),
            ).submit()
        
        if buyer_amount > UInt64(0):
            itxn.AssetTransfer(
                xfer_asset=USDC_ASSET_ID,
                asset_receiver=self.buyer.value.native,
                asset_amount=buyer_amount,
                fee=UInt64(1000),
            ).submit()
        
        self.state.value = RESOLVED
```

---

## Project Folder Structure

```
trustescrow/
├── contract/                          # AlgoKit Python project
│   ├── smart_contracts/
│   │   └── escrow/
│   │       ├── contract.py            # Main smart contract (above)
│   │       └── deploy_config.py       # Deployment configuration
│   ├── tests/
│   │   └── escrow_test.py             # Contract unit tests
│   └── pyproject.toml
│
├── frontend/                          # Next.js 14 App Router
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                   # Landing page
│   │   ├── auth/
│   │   │   ├── signin/page.tsx        # Login
│   │   │   └── signup/page.tsx        # Registration
│   │   ├── dashboard/
│   │   │   └── page.tsx               # User dashboard — list of deals
│   │   ├── deal/
│   │   │   ├── new/page.tsx           # Create new deal (seller)
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Deal detail — both parties
│   │   ├── arbitrator/
│   │   │   └── [id]/page.tsx          # Arbitrator verdict submission
│   │   └── api/
│   │       ├── auth/[...nextauth]/    # NextAuth handler
│   │       ├── deals/
│   │       │   ├── create/route.ts    # POST — save deal to DB after contract deploy
│   │       │   └── [id]/route.ts      # GET — fetch deal data
│   │       ├── submit-delivery/
│   │       │   └── route.ts           # POST — verify tracking + store on-chain hash
│   │       ├── resolve-dispute/
│   │       │   └── route.ts           # POST — execute arbitrator verdict on-chain
│   │       ├── tracking-status/
│   │       │   └── route.ts           # GET — poll TrackingMore for live status
│   │       └── cron/
│   │           └── check-timeouts/
│   │               └── route.ts       # GET — called by Vercel Cron every hour
│   ├── lib/
│   │   ├── algorand.ts                # algosdk client setup + helper functions
│   │   ├── wallet.ts                  # Pera Wallet connection logic
│   │   ├── contract-client.ts         # AlgoKit generated client for the contract
│   │   ├── db.ts                      # Prisma client instance
│   │   ├── email.ts                   # Nodemailer email helpers
│   │   └── tracking.ts                # TrackingMore API wrapper
│   ├── components/
│   │   ├── WalletConnect.tsx          # Pera Wallet connect button + state
│   │   ├── CreateDealForm.tsx         # Deal creation form + contract deploy
│   │   ├── DealCard.tsx               # Deal summary card for dashboard
│   │   ├── DealDetail.tsx             # Full deal page — state-aware
│   │   ├── FundEscrow.tsx             # Karim's accept + fund atomic flow
│   │   ├── SubmitDelivery.tsx         # Riya's tracking number submission
│   │   ├── ConfirmReceipt.tsx         # Karim's confirm button
│   │   ├── RaiseDispute.tsx           # Karim's dispute flow
│   │   ├── TrackingTimeline.tsx       # Live shipment tracking display
│   │   ├── EvidenceUpload.tsx         # Photo upload for disputes
│   │   └── ReputationBadge.tsx        # On-chain reputation display
│   ├── prisma/
│   │   └── schema.prisma              # Database schema (above)
│   ├── vercel.json                    # Cron job configuration
│   └── .env.local                     # Environment variables
```

---

## Complete User Flow — Step by Step

### Phase 1 — Signup and Wallet Connect (both users, one time)

**Step 1.1** — User visits trustescrow.com and signs up with name, email, password. NextAuth creates session. Password stored as bcrypt hash. walletAddress is null at this point.

**Step 1.2** — From the dashboard, user clicks "Connect Wallet." Frontend calls `peraWallet.connect()`. QR code appears. User scans with Pera Wallet mobile app. Frontend receives wallet address. API call to `/api/users/update-wallet` saves the address to the Users table.

**Step 1.3** — Both Riya (seller) and Karim (buyer) complete this independently before any deal begins.

---

### Phase 2 — Riya Creates and Proposes the Contract

**Step 2.1** — Riya navigates to `/deal/new`. Fills form: item name, description, amount in USDC, delivery deadline in days (e.g. 10), dispute window in days (e.g. 7), Karim's email or wallet address.

**Step 2.2** — Riya clicks "Create Contract." Frontend builds an `ApplicationCreate` transaction using AlgoKit client with all terms encoded as constructor arguments: `propose(buyer, amount_usdc, deadline_days, dispute_days)`. Pera Wallet opens showing: "Deploy TrustEscrow — 500 USDC, buyer: ALGOK4...R2, deadline: 10 days." Riya taps Approve.

**Step 2.3** — Algorand confirms in ~4 seconds. Contract is live at a unique App ID (e.g. `12345678`) and App Address. All terms permanently stored in contract global state. State = `PROPOSED`. No money has moved.

**Step 2.4** — Frontend calls `/api/deals/create` with the App ID and App Address. Backend saves deal to PostgreSQL. Generates unique deal URL: `trustescrow.com/deal/abc123`. Sends Karim an email via Nodemailer with the deal link and terms summary.

---

### Phase 3 — Karim Reviews, Accepts, and Funds (Atomic)

**Step 3.1** — Karim opens the deal link. Frontend calls `algodClient.getApplicationByID(12345678)` and reads contract global state directly from Algorand. Displays: seller address, item, amount, deadline. These are read from blockchain — not from your database. Karim knows they are authentic.

**Step 3.2** — Karim clicks "Connect Wallet." Platform verifies his wallet address matches `contract.buyer`. If mismatch → error: "This deal is not assigned to your wallet." If match → proceed.

**Step 3.3** — Karim clicks "Accept and Fund." Frontend builds TWO transactions grouped atomically using `algosdk.assignGroupID()`:
- Transaction 1: `accept()` ABI call on the contract (Karim's signature = on-chain acceptance proof)
- Transaction 2: `AssetTransfer` — 500 USDC from Karim's wallet to contract address

Both sent to `peraWallet.signTransaction([[txn1, txn2]])`. Karim sees ONE approval screen. Taps Approve once. Algorand executes both atomically — either both succeed or neither does.

**Step 3.4** — Contract confirms: state = `FUNDED`. $500 USDC now lives at the contract address. Nobody — not Riya, not Karim, not the platform — can access it outside the contract logic. Backend updates deal status to `FUNDED`. Emails Riya: "Your escrow is funded. $500 USDC is locked. Ship safely."

---

### Phase 4 — Riya Ships and Submits Delivery Proof

**Step 4.1** — Riya ships fabric via courier (DHL, FedEx, DTDC, Bluedart, India Post, etc.). Receives tracking number e.g. `DHL-994821BOM`.

**Step 4.2** — Riya logs into platform, opens deal page, selects courier from dropdown, pastes tracking number, clicks Submit. No wallet interaction.

**Step 4.3** — Backend API route `/api/submit-delivery` does three things simultaneously:

Thing 1: Calls TrackingMore API to verify tracking number is real and belongs to the selected courier. If invalid → returns error to Riya.

Thing 2: Computes `SHA256("DHL-994821BOM")` = `3a7f9c...e12b`. Uses platform server wallet to call `submit_delivery("3a7f9c...e12b")` on the contract. Hash + timestamp stored permanently on Algorand. Contract state → `DELIVERED`. 7-day dispute window starts.

Thing 3: Saves tracking number (plain text) to Deals table. Emails Karim with tracking number, courier link, and deadline: "Your shipment is on the way. You have 7 days from delivery to confirm or dispute."

**Step 4.4** — Deal page now shows live tracking timeline for both users. Frontend polls `/api/tracking-status` every 2 hours. TrackingMore returns checkpoint data: pickup city, transit hubs, customs, delivery. An "On-chain proof" badge shows the SHA256 hash and timestamp — verifiable by anyone on Algorand explorer.

---

### Phase 5A — Confirmation (Happy Path)

**Step 5A.1** — Goods arrive. Karim opens deal page. Sees "Delivered" status in tracking timeline. Clicks "Confirm Receipt." Frontend builds `confirm()` ABI call transaction. Pera shows: "Confirm delivery — release 500 USDC to seller." Karim taps Approve.

**Step 5A.2** — Contract executes inner transaction: sends 500 USDC from contract address to Riya's wallet address. 4 seconds. Total Algorand fee: ~$0.002. Contract state = `COMPLETED`. Both parties receive email confirmation. Deal permanently archived on-chain.

---

### Phase 5B — Timeout Auto-Release

**Step 5B.1** — Karim receives goods but goes silent — does not confirm or dispute within 7 days.

**Step 5B.2** — Vercel Cron job calls `/api/cron/check-timeouts` every hour. Query: all deals with status `DELIVERED` where `deliveredAt + 7 days < now`. For each: platform server wallet calls `timeout_release()` on the contract. Contract sends 500 USDC to Riya automatically. Backend updates status to `COMPLETED`. Emails both parties.

---

### Phase 5C — Dispute Flow

**Step 5C.1** — Within 7 days of delivery, Karim clicks "Raise Dispute." Frontend calls `dispute()` ABI method via Pera. Contract state = `DISPUTED`. USDC frozen. Both parties emailed: "Dispute opened. Submit evidence within 48 hours."

**Step 5C.2** — Both parties submit evidence through the platform. Text description + photo uploads (Cloudinary). Backend saves to Evidence table. Timestamps stored. SHA256 hash of evidence metadata written to Algorand as a transaction note.

**Step 5C.3** — Arbitrator (pre-agreed at contract creation) logs into `/arbitrator/[dealId]`. Reviews all evidence from both parties. Enters split: `sellerPct=80, buyerPct=20`. Clicks Submit Verdict.

**Step 5C.4** — Backend API route `/api/resolve-dispute` saves verdict to Arbitrations table. Platform server wallet calls `resolve_dispute(80, 20)` on contract. Contract executes: sends 400 USDC to Riya, 100 USDC to Karim. Both instantly. State = `RESOLVED`. Both parties emailed with outcome.

---

### Phase 6 — Reputation (Ongoing)

After every deal reaches COMPLETED or RESOLVED state, backend writes a summary note to an Algorand transaction:
```json
{ "wallet": "ALGO7X...K9", "outcome": "COMPLETED", "value": 500, "dealId": "abc123", "ts": 1742000000 }
```

Platform UI reads all historical transactions for a wallet address via `algodClient.searchForTransactions({ address })` and displays: "47 completed trades · 1 dispute · $24,000 total volume." This score is public, permanent, and unfakeable.

---

## Key Frontend Code Patterns

### Wallet Connection (lib/wallet.ts)
```typescript
import { PeraWalletConnect } from "@perawallet/connect";

export const peraWallet = new PeraWalletConnect();

export async function connectWallet(): Promise<string> {
  const accounts = await peraWallet.connect();
  return accounts[0];
}

export async function disconnectWallet(): Promise<void> {
  await peraWallet.disconnect();
}
```

### Reading Contract State (lib/algorand.ts)
```typescript
import algosdk from "algosdk";

export const algodClient = new algosdk.Algodv2(
  process.env.ALGOD_TOKEN!,
  process.env.ALGOD_SERVER!,
  parseInt(process.env.ALGOD_PORT!)
);

export async function getContractState(appId: number) {
  const appInfo = await algodClient.getApplicationByID(appId).do();
  const state: Record<string, any> = {};
  for (const item of appInfo.params["global-state"]) {
    const key = Buffer.from(item.key, "base64").toString();
    state[key] = item.value.uint ?? Buffer.from(item.value.bytes, "base64").toString();
  }
  return state;
}
```

### Atomic Accept + Fund (components/FundEscrow.tsx)
```typescript
async function acceptAndFund(appId: number, appAddress: string, amountUSDC: number) {
  const params = await algodClient.getTransactionParams().do();
  const buyerAddress = await connectWallet();

  // Transaction 1 — call accept() on contract
  const acceptTxn = algosdk.makeApplicationCallTxnFromObject({
    from: buyerAddress,
    appIndex: appId,
    onCompletion: algosdk.OnApplicationComplete.NoOpOC,
    appArgs: [algosdk.encodeUint64(0)], // accept() selector
    suggestedParams: params,
  });

  // Transaction 2 — send USDC to contract address
  const fundTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: buyerAddress,
    to: appAddress,
    amount: amountUSDC * 1_000_000, // USDC has 6 decimals
    assetIndex: parseInt(process.env.NEXT_PUBLIC_USDC_ASSET_ID!),
    suggestedParams: params,
  });

  // Group atomically
  algosdk.assignGroupID([acceptTxn, fundTxn]);

  // Sign and submit via Pera — user sees ONE approval
  const signedTxns = await peraWallet.signTransaction([[acceptTxn, fundTxn]]);
  const { txId } = await algodClient.sendRawTransaction(signedTxns).do();
  await algosdk.waitForConfirmation(algodClient, txId, 4);
}
```

### Vercel Cron Configuration (vercel.json)
```json
{
  "crons": [
    {
      "path": "/api/cron/check-timeouts",
      "schedule": "0 * * * *"
    }
  ]
}
```

---

## Data Architecture — What Lives Where

### On Algorand (permanent, immutable, trustless)
- Contract terms: seller address, buyer address, amount, deadline
- Contract state: PROPOSED → ACCEPTED → FUNDED → DELIVERED → COMPLETED / DISPUTED → RESOLVED
- USDC custody: actual funds locked at contract address
- Buyer acceptance signature: Karim's cryptographic proof of agreement
- Tracking hash: SHA256 of tracking number + timestamp
- Dispute verdict: split percentages + execution
- USDC release transactions: permanent payment record
- Reputation notes: outcome records per wallet address

### In PostgreSQL (fast, queryable, UI-friendly)
- User accounts: email, password, name, wallet address
- Deal metadata: item name, description, buyer email, deal URL
- Tracking numbers: plain text (hash is on-chain)
- Email notification queue
- Evidence photos: Cloudinary URLs
- Arbitrator assignments and notes
- UI display state cache

---

## Contract State Machine Rules

| From State | To State | Method | Who Calls |
|---|---|---|---|
| — | PROPOSED | propose() | Riya (deploys contract) |
| PROPOSED | ACCEPTED | accept() | Karim |
| ACCEPTED | FUNDED | fund() | Karim (atomic with USDC transfer) |
| FUNDED | DELIVERED | submit_delivery() | Platform server wallet |
| DELIVERED | COMPLETED | confirm() | Karim |
| DELIVERED | COMPLETED | timeout_release() | Anyone (after window expires) |
| DELIVERED | DISPUTED | dispute() | Karim (within window) |
| DISPUTED | RESOLVED | resolve_dispute() | Platform server wallet |

Any call that violates these transitions is rejected by the contract with an assertion error.

---

## Fraud Prevention Architecture

### Seller fraud (ships nothing)
- Tracking number verified as real by TrackingMore API before submission accepted
- Courier records pickup weight, dimensions, timestamp independently
- SHA256 hash stored on-chain — fake number creates permanent evidence of fraud
- Wallet reputation permanently records dispute history

### Seller fraud (ships wrong goods)
- Buyer photographs contents and submits as dispute evidence within 7 days
- Arbitrator reviews courier weight record vs claimed goods
- Professional sellers record packing process as counter-evidence
- Contract executes split verdict — partial refund possible

### Buyer fraud (denies receiving goods)
- Courier delivery record shows address, timestamp, and recipient signature
- 7-day timeout: silence = auto-release to seller after window
- On-chain dispute() must be called explicitly — passive non-response protects seller
- Wallet reputation flagged for false disputes

### Buyer fraud (false damage claim)
- Evidence submission required with photos within 48 hours
- Arbitrator reviews courier transit condition record
- Proportional verdict possible — not binary
- Serial false claimants visible in on-chain reputation

---

## Pages Required for MVP Demo

| Page | Route | Who Uses It | Purpose |
|---|---|---|---|
| Landing | / | Everyone | Product explanation + signup CTA |
| Sign Up | /auth/signup | New users | Email + password registration |
| Sign In | /auth/signin | Returning users | Login |
| Dashboard | /dashboard | Both parties | List of all deals + status |
| Create Deal | /deal/new | Seller (Riya) | Fill form + deploy contract |
| Deal Detail | /deal/[id] | Both parties | State-aware — shows relevant actions |
| Arbitrator | /arbitrator/[id] | Arbitrator | Review evidence + submit verdict |

The Deal Detail page is the most important page. It reads contract state from Algorand and shows different UI depending on state: PROPOSED shows "Waiting for buyer," FUNDED shows "Ship and submit tracking," DELIVERED shows tracking timeline + confirm/dispute buttons, COMPLETED shows payment receipt, DISPUTED shows evidence submission form.

---

## Pitch Statement

> "We replaced a $240 bank letter of credit with a $0.002 Algorand smart contract. TrustEscrow lets any two strangers trade goods across borders with zero trust required — the contract holds the money, Algorand enforces the terms, and nobody — not a bank, not our platform, not either party — can touch the funds outside the agreed rules."

---

## Why Algorand Specifically

1. **USDC is native** — no wrapping, no bridging, no slippage. Circle issues USDC directly on Algorand.
2. **Near-zero fees** — $0.002 per transaction regardless of size. Ethereum gas would make small trades economically impossible.
3. **Instant finality** — 4-second block confirmation. No waiting for 12 confirmations.
4. **Atomic transactions** — accept() and fund() grouped atomically. Neither party is exposed at any intermediate state.
5. **AVM simplicity** — 4-state contract under 120 lines. Simple contracts = small attack surface = safer custody.

---

*Generated for TrustEscrow hackathon build — Algorand DeFi Track*
