import { useState } from "react";
import "./App.css";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

function App() {
  const [step, setStep] = useState("input");
  const [cvText, setCvText] = useState("");
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState("");
  const [loadingMessage, setLoadingMessage] = useState("");

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

      {error && <div className="error">⚠️ {error}</div>}
    </div>
  );
}

export default App
