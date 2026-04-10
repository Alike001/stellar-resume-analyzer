# CV Analyzer — Pay-per-use AI Resume Feedback
### Powered by Stellar Testnet Payments

> A beginner-built hackathon project that lets users paste their CV, pay a small XLM fee on the Stellar blockchain, and receive instant AI-powered feedback — payment verified on-chain before analysis runs.

## 🔗 Live Demo
 
| | URL |
|---|---|
| **Frontend (Live)** | https://stellar-resume-analyzer.vercel.app/ |
| **Backend (Live)** | https://stellar-resume-analyzer.onrender.com |
 
> The backend is hosted on Render's free tier. If it has been inactive for a while, the first request may take 30–60 seconds to wake up. This is normal — just wait and try again.

## Summary

CV Analyzer is a full-stack web application that demonstrates a **pay-per-use model** using blockchain micropayments. Instead of a subscription, users pay only when they need a CV review. The payment is verified on the Stellar testnet before any analysis is returned.

## Problem It Solves

Most CV review tools charge a monthly subscription — even if you only need one review. This project explores a fairer model: **pay once, get one analysis.** No account needed, no recurring charges.

## Why Stellar?

Stellar is used because:
- It supports **fast, low-cost micropayments** (transactions settle in ~5 seconds)
- It has a free **testnet** environment — perfect for hackathon prototyping
- The **memo field** on Stellar transactions allows unique payment tracking without a database
- It is beginner-accessible with good documentation and free tools

> This project uses **Stellar testnet only**. No real money is involved.


## Features

- Paste your CV text and request an analysis
- Unique payment memo generated per request
- Payment verified directly on the Stellar blockchain
- AI feedback includes: overall score, summary, strengths, areas to improve, and suggested keywords
- Copy-to-clipboard buttons for all payment details
- Simple, clean UI with clear step-by-step instructions
- Mock AI analysis (no external AI API required)


## Payment Flow

Here is exactly how the pay-per-use flow works:

```
1. User pastes CV → clicks "Analyze My CV"
          ↓
2. Backend generates a unique memo (e.g. RES-A1B2C3D4)
   and returns payment instructions
          ↓
3. User sends 0.5 XLM to the receiver address
   on Stellar testnet — with the exact memo included
          ↓
4. User clicks "Verify & Analyze"
          ↓
5. Backend scans the last 50 transactions on the blockchain
   looking for a payment with the matching memo and amount
          ↓
6. If found → AI analysis runs and results are returned
   If not found → user is asked to wait and try again
```

The memo acts as a unique reference ID that links each payment to the correct analysis request — without needing a login or database.


## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Node.js + Express |
| Payments | Stellar Testnet (Horizon API) |
| Stellar SDK | stellar-sdk (npm) |
| AI Analysis | Mock AI (rule-based logic) |
| Styling | Plain CSS |
| Environment | dotenv |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |
 
## Project Structure

```
resume-analyzer/
├── backend/
│   ├── server.js        ← All backend logic.
│   ├── package.json
│   ├── .env             ← Secret keys
│   └── .env.example     ← Safe template showing required variables
│
└── frontend/
    ├── src/
    │   ├── main.jsx 
    |   ├── App.css
    │   ├── App.jsx 
    │   └── index.css 
    ├── index.html
    ├── package.json
    └── .env             ← Frontend environment variables
```

## Setup Instructions

### Prerequisites

Make sure you have these installed:
- **Node.js** (v18 or higher) — download at https://nodejs.org
- **npm** — comes with Node.js
- A free **Stellar testnet wallet** — create one at https://laboratory.stellar.org/#account-creator?network=test


### 1. Clone the Repository

```bash
git clone https://github.com/Alike001/stellar-resume-analyzer.git
cd resume-analyzer
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create your `.env` file by copying the example:

```bash
cp .env.example .env
```

Open `backend/.env` and fill in your values:

```
PORT=3001
STELLAR_RECEIVER_PUBLIC_KEY=G...your public key
STELLAR_RECEIVER_SECRET_KEY=S...your secret key
PAYMENT_AMOUNT=0.5
```

> To get free testnet keys:
> 1. Go to https://laboratory.stellar.org/#account-creator?network=test
> 2. Click "Generate Keypair" — save both keys
> 3. Click "Fund account with Friendbot"

Start the backend:

```bash
npm run dev
```

You should see:
```
Server running on http://localhost:3001
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app opens at `http://localhost:5173`


## How to Test

### Test the backend alone (using hoppscotch.io or Postman):

**Create a payment request:**
```
POST https://stellar-resume-analyzer.onrender.com/payment/create
```
Expected: `{ success: true, memo: "RES-XXXXXXXX", receiverAddress: "G...", amount: "0.5" }`

**Verify a payment:**
```
POST https://stellar-resume-analyzer.onrender.com/payment/verify
Body: { "memo": "RES-XXXXXXXX" }
```

**Run analysis:**
```
POST https://stellar-resume-analyzer.onrender.com/analyze
Body: { "cvText": "Your CV text here...", "memo": "RES-XXXXXXXX" }
```

### Test the full flow in the browser:

1. Go to `http://localhost:5173`
2. Paste CV text (minimum 50 characters) → click **Analyze My CV**
3. Note the memo shown (e.g. `RES-A1B2C3D4`)
4. Go to https://laboratory.stellar.org/#txbuilder?network=test
5. Send 0.5 XLM to the receiver address **with the exact memo**
6. Come back to the app → click **Verify & Analyze**
7. View your results

## Stellar Testnet Explanation

The **Stellar testnet** is a safe, free version of the Stellar blockchain used for development and testing. It works exactly like the real Stellar network but uses fake XLM that has no real-world value.

Key facts:
- Transactions settle in ~5 seconds
- Testnet XLM is free — get some via Friendbot
- Testnet data is occasionally reset by the Stellar Foundation
- **This project will never charge real money**


## Demo Walkthrough

1. Open the live Vercel URL in your browser
2. Paste a sample CV into the text box
3. Click **"Analyze My CV →"** — the payment screen appears
4. Show the unique memo, receiver address, and amount
5. Open Stellar Laboratory and send 0.5 XLM with the exact memo
6. Return to the app — click **"Verify & Analyze"**
7. Show the results: score, strengths, improvements, keywords
8. Click **"Analyze Another CV"** to reset

## Limitations

- Uses **mock AI** — feedback is rule-based, not from a real AI model
- **No database** — memos are not stored, so the same payment could theoretically be reused
- **Testnet only** — not connected to real Stellar mainnet
- No user accounts or payment history
- No PDF upload — CV must be pasted as text
- Backend on Render free tier may take 30–60 seconds to wake up after inactivity

## Future Improvements

- Add real AI feedback using OpenAI or Claude API
- Store used memos in a database to prevent reuse
- Support PDF CV uploads
- Add Stellar mainnet support for real payments
- Show a link to the Stellar transaction after verification
- Add email delivery of results
- Upgrade to Render paid tier to remove cold start delay

## License

MIT License

*Built for hackathon purposes. Uses Stellar testnet only — no real money involved.*