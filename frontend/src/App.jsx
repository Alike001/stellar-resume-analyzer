import { useState } from "react";
import "./App.css";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

function App() {
  const [step, setStep] = useState("input");
  const [cvText, setCvText] = useState("");
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [analysis, setAnalysis] = useState(null);
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

  async function handleVerifyAndAnalyze() {
    setError("");

    try {
      setLoadingMessage("Checking the Stellar blockchain...");
      setStep("loading");

      const verifyResponse = await fetch(`${BACKEND}/payment/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memo: paymentInfo.memo }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.verified) {
        setError(
          "Payment not found yet. Please wait 10-30 seconds after sending and try again."
        );
        setStep("payment");
        return;
      }

      setLoadingMessage("Payment confirmed! Analyzing your CV...");

      const analyzeResponse = await fetch(`${BACKEND}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cvText: cvText,
          memo: paymentInfo.memo,
        }),
      });

      const analyzeData = await analyzeResponse.json();

      if (!analyzeData.success) {
        throw new Error(analyzeData.error || "Analysis failed");
      }

      setAnalysis(analyzeData.analysis);
      setStep("results");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setStep("payment");
    }
  }

  function handleReset() {
    setStep("input");
    setCvText("");
    setPaymentInfo(null);
    setAnalysis(null);
    setError("");
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

          <button onClick={handleVerifyAndAnalyze}>I have Paid — Verify & Analyze</button>

          <button className="btn-secondary" onClick={() => setStep("input")}>
            ← Go Back
          </button>
        </div>
      )}

      {step === "results" && analysis && (
        <div className="results">
          <h2>Your CV Analysis</h2>
          <p style={{ color: "#4caf50", marginBottom: "16px", fontSize: "14px" }}>
            ✅ Payment verified on Stellar testnet
          </p>

          <div className="score">
            {analysis.score}
            <span style={{ fontSize: "20px" }}>/100</span>
          </div>
          <p className="score-label">Overall CV Score</p>

          <div className="summary">{analysis.summary}</div>

          <div className="result-section">
            <h3>Strengths</h3>
            <ul>
              {analysis.strengths.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="result-section">
            <h3>Areas to Improve</h3>
            <ul>
              {analysis.improvements.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="result-section">
            <h3>Suggested Keywords</h3>
            <div className="keywords">
              {analysis.keywords.map((kw, i) => (
                <span key={i} className="keyword-tag">{kw}</span>
              ))}
            </div>
          </div>

          <button onClick={handleReset} style={{ marginTop: "24px" }}>
            Analyze Another CV →
          </button>
        </div>
      )}
      {error && <div className="error">⚠️ {error}</div>}
    </div>
  );
}

export default App
