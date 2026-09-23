import { useEffect, useState } from "react";
import { getUserTransactions } from "../api/api";
import Notification from "../component/notification";
import "./transaction.css";

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // --- CSV EXPORT LOGIC ---
  const exportToCSV = () => {
    if (transactions.length === 0) return;
    const headers = ["Description,Date,Status,Amount\n"];
    const rows = transactions.map(t => {
      const date = new Date(t.created_at || t.transaction_date).toLocaleDateString();
      return `${t.description || t.title},${date},${t.status},${t.amount}\n`;
    });
    const blob = new Blob([headers, ...rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("href", url);
    a.setAttribute("download", "activity_history.csv");
    a.click();
  };

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const savedUser = localStorage.getItem("user");
      const user = savedUser ? JSON.parse(savedUser) : null;
      if (!user?.id) return;

      const result = await getUserTransactions(user.id);
      const data = Array.isArray(result) ? result : (result.data || []);
      setTransactions(data);
    } catch {
      setError("Failed to load activity history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <div className="transactions-page">
      <main className="transactions-content">
        <header className="activity-header">
          <div className="title-group">
            <h1>Activity History</h1>
            <p className="subtitle">Real-time log of your account activity</p>
          </div>
          <button className="csv-btn" onClick={exportToCSV}>
            📥 Export CSV
          </button>
        </header>

        {error && <div className="transaction-error">{error}</div>}

        <div className="table-container">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>DESCRIPTION</th>
                <th>DATE</th>
                <th>STATUS</th>
                <th className="text-right">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="table-status">Loading activity...</td></tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="no-data">
                    <div className="empty-state">
                      <span className="icon">📄</span>
                      <p>No recent activity found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="desc-cell">{t.description || t.title}</td>
                    <td className="date-cell">
                      {new Date(t.created_at || t.transaction_date).toLocaleDateString(undefined, {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>
                    <td>
                      <span className={`status-badge ${t.status?.toLowerCase() || 'completed'}`}>
                        {t.status || 'Completed'}
                      </span>
                    </td>
                    <td className={`amount-cell text-right ${Number(t.amount) < 0 ? 'negative' : 'positive'}`}>
                      {Number(t.amount) < 0 ? '-' : ''}${Math.abs(Number(t.amount)).toLocaleString(undefined, {
                        minimumFractionDigits: 2
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default Transactions;