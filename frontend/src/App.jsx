import { useState } from "react";
import "./App.css";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

function App() {
  const [step, setStep] = useState("input");
  const [cvText, setCvText] = useState("");
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");
  const [copied, setCopied] = useState("");

  function copyToClipboard(text, field) {
  navigator.clipboard.writeText(text);
  setCopied(field);
  setTimeout(() => setCopied(""), 2000);
}

  async function handleAnalyzeClick() {
    setError("");

    if (cvText.trim().length < 50) {
      setError("Please paste your full CV (at least 50 characters).");
      return;
    }

    try {
      setLoadingMessage("Creating payment request...");
      setStep("loading");

      const response = await fetch(`${BACKEND}/payment/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create payment request");
      }

      setPaymentInfo(data);
      setStep("payment");
    } catch {
      setError("Could not reach the backend. Is it running on port 3001?");
      setStep("input");
    }
  }

  return (
    <div className="container">
      <h1>CV Analyzer</h1>
      <p className="subtitle">
        Pay a small XLM fee on Stellar testnet. Get instant AI feedback on your CV.
      </p>

       {step === "input" && (
        <div>
          <label>Paste your CV text below:</label>
          <textarea
            placeholder="Paste your full CV here..."
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
          />
          <button onClick={handleAnalyzeClick}>Analyze My CV</button>
        </div>
      )}

      {step === "loading" && (
        <div className="loading">
          <p>⏳ {loadingMessage}</p>
          <p style={{ fontSize: "13px", marginTop: "8px", color: "#999" }}>
            This usually takes 5–15 seconds
          </p>
        </div>
      )}

      {step === "payment" && paymentInfo && (
        <div>
          <div className="payment-box">
            <h2>Send Payment on Stellar Testnet</h2>

            <div className="payment-detail">
              <label>Send To (Receiver Address)</label>
              <div className="copy-row">
                <span className="copy-value">{paymentInfo.receiverAddress}</span>
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard(paymentInfo.receiverAddress, "address")}
                >
                  {copied === "address" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="payment-detail">
              <label>Amount</label>
              <div className="copy-row">
                <span className="copy-value">{paymentInfo.amount} XLM</span>
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard(paymentInfo.amount, "amount")}
                >
                  {copied === "amount" ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>

            <div className="payment-detail">
              <label>Memo (REQUIRED — must be exact!)</label>
              <div className="copy-row">
                <span className="copy-value">{paymentInfo.memo}</span>
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard(paymentInfo.memo, "memo")}
                >
                  {copied === "memo" ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="warning">
                ⚠️ If you forget the memo, we cannot find your payment!
              </p>
            </div>

            <div className="instructions">
              <strong>How to pay:</strong>
              <br />
              1. Go to{" "}
              <a
                href="https://laboratory.stellar.org/#txbuilder?network=test"
                target="_blank"
                rel="noreferrer"
              >
                laboratory.stellar.org
              </a>{" "}
              (make sure it says Test Network top-right)
              <br />
              2. Go to Account and find create account keypair → Click "Generate keypair" → save the public key and secret key.
              <br />
              3. Click "Fund account with Friendbot" to get test XLM
              <br />
              4. Go to Transaction → Build Transaction
              <br />
              5. Source Account = your SENDER public key → Click "Fetch next sequence number".
              <br />
              6. Memo Type = Text → Memo Content = the memo above
              <br />
              7. Add Operation → Payment → Destination = receiver address above
              <br />
              8. Asset = XLM (Native) → Amount = {paymentInfo.amount} → Click "Sign in Transaction Signer"
              <br />
              9. Sign with your SENDER secret key → Submit
              <br />
              10. Come back here and click the button below
            </div>
          </div>

          <button>I have Paid — Verify & Analyze</button>

          <button className="btn-secondary" onClick={() => setStep("input")}>
            ← Go Back
          </button>
        </div>
      )}
      {error && <div className="error">⚠️ {error}</div>}
    </div>
  );
}

export default App
