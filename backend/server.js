require("dotenv").config();

const express = require("express");
const cors = require("cors");
const StellarSdk = require("stellar-sdk");

const app = express();
app.use(cors());
app.use(express.json());

const stellarServer = new StellarSdk.Horizon.Server(
  "https://horizon-testnet.stellar.org"
);

async function checkPaymentOnBlockchain(memo) {
  const receiverPublicKey = process.env.STELLAR_RECEIVER_PUBLIC_KEY;
  const requiredAmount = parseFloat(process.env.PAYMENT_AMOUNT);

  const payments = await stellarServer
    .payments()
    .forAccount(receiverPublicKey)
    .order("desc")
    .limit(50)
    .call();

  for (const payment of payments.records) {
   
    if (payment.type !== "payment") continue;
    if (payment.asset_type !== "native") continue;

   
    const paidAmount = parseFloat(payment.amount);
    if (paidAmount < requiredAmount) continue;

    const transaction = await payment.transaction();

    if (transaction.memo === memo) {
      return true;
    }
  }

  return false;
}

function analyzeCVWithMockAI(cvText) {
 
  const wordCount = cvText.trim().split(/\s+/).length;
  const hasEmail = cvText.includes("@");
  const hasPhone = /\d{3,}/.test(cvText);
  const hasLinkedIn = cvText.toLowerCase().includes("linkedin");

  const score = Math.min(95, 40 + Math.floor(wordCount / 8));

  return {
    score: score,
    summary: `Your CV has ${wordCount} words. ${
      wordCount > 200
        ? "Good length and detail."
        : "Consider adding more detail."
    }`,
    strengths: [
      wordCount > 150
        ? "Good amount of detail in your CV"
        : "CV is concise and easy to read",
      hasEmail
        ? "Email address is present"
        : "Consider adding your email address",
      hasLinkedIn
        ? "LinkedIn profile included — great!"
        : "Professional structure detected",
    ],
    improvements: [
      "Add numbers to show impact (e.g. 'increased sales by 30%')",
      hasLinkedIn
        ? "Consider adding a portfolio or GitHub link"
        : "Add your LinkedIn profile URL",
      wordCount < 300
        ? "Expand your experience descriptions with more detail"
        : "Make sure each point starts with a strong action verb",
    ],
    keywords: [
      "Leadership",
      "Problem-solving",
      "Collaboration",
      "Communication",
      "Results-driven",
    ],
    note: "This is a mock AI analysis. Add OPENAI_API_KEY to .env for real feedback.",
  };
}

app.get("/", (req, res) => {
  res.json({ message: "Server is working!" });
});

app.get("/check-env", (req, res) => {
  res.json({
    publicKeyLoaded: process.env.STELLAR_RECEIVER_PUBLIC_KEY
      ? process.env.STELLAR_RECEIVER_PUBLIC_KEY.slice(0, 5) + "..."
      : "NOT LOADED",
    paymentAmount: process.env.PAYMENT_AMOUNT,
  });
});

app.post("/payment/create", (req, res) => {
  
  const randomPart = require("crypto")
    .randomBytes(4)
    .toString("hex")
    .toUpperCase();
  const memo = `RES-${randomPart}`;

  res.json({
    success: true,
    memo: memo,
    receiverAddress: process.env.STELLAR_RECEIVER_PUBLIC_KEY,
    amount: process.env.PAYMENT_AMOUNT,
    message: "Send XLM to the receiver address with this exact memo",
  });

  console.log(`Payment request created. Memo: ${memo}`);
});

app.post("/payment/verify", async (req, res) => {
  const { memo } = req.body;

  if (!memo) {
    return res.status(400).json({
      success: false,
      error: "Memo is required",
    });
  }

  try {
    console.log(`Verifying payment for memo: ${memo}`);
    const verified = await checkPaymentOnBlockchain(memo);

    if (verified) {
      return res.json({
        success: true,
        verified: true,
        message: "Payment confirmed on Stellar testnet!",
      });
    } else {
      return res.json({
        success: true,
        verified: false,
        message: "Payment not found yet. Please wait and try again.",
      });
    }
  } catch (error) {
    console.error("Verify error:", error.message);
    res.status(500).json({
      success: false,
      error: "Something went wrong checking the blockchain.",
    });
  }
});

app.post("/analyze", async (req, res) => {
 
  const { cvText, memo } = req.body;

  if (!cvText || cvText.trim().length < 50) {
    return res.status(400).json({
      success: false,
      error: "Please provide your CV text (at least 50 characters).",
    });
  }

  if (!memo) {
    return res.status(400).json({
      success: false,
      error: "Payment memo is required.",
    });
  }

  try {
    console.log(`Analyze request received. Memo: ${memo}`);
    const isPaid = await checkPaymentOnBlockchain(memo);

    if (!isPaid) {
      return res.status(402).json({
        success: false,
        error:
          "Payment not verified. Please send the correct amount with the correct memo and try again.",
      });
    }

    console.log("Payment confirmed. Running analysis...");
    const analysis = analyzeCVWithMockAI(cvText);

    res.json({
      success: true,
      analysis: analysis,
      message: "Analysis complete!",
    });

    console.log("Analysis complete!");
  } catch (error) {
    console.error("Analyze error:", error.message);
    res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again.",
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});