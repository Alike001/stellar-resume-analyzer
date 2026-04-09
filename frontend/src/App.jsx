import "./App.css";

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

function App() {
  return (
    <div className="container">
      <h1>CV Analyzer</h1>
      <p className="subtitle">
        Pay a small XLM fee on Stellar testnet. Get instant AI feedback on your CV.
      </p>
    </div>
  );
}

export default App
