import "./transactioncard.css";
import formatCurrency from "../utils/formatCurrency";

function TransactionCard({ title, date, amount, status }) {
  const formattedAmount = formatCurrency(amount).replace(/\s*/g, "");
  const displayDate = date ? new Date(date).toLocaleDateString() : "";
  const cls = status ? status.toLowerCase() : "unknown";

  return (
    <div className="transaction-card card" role="listitem">
      <div className="transaction-details">
        <h4 className="tx-title">{title}</h4>
        <div className="tx-date muted">{displayDate}</div>
      </div>

      <div className="transaction-info">
        <div className="tx-amount">{formattedAmount}</div>
        <span className={`status ${cls}`}>{status || "Unknown"}</span>
      </div>
    </div>
  );
}

export default TransactionCard;