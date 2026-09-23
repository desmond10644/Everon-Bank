import "./accountcard.css";
import formatCurrency from "../utils/formatCurrency";

function AccountCard({ accountName, accountNumber, balance, accountType }) {
  const masked = accountNumber
    ? String(accountNumber).slice(-4).padStart(4, "*")
    : "----";

  return (
    <div className="account-card card" role="group" aria-label={`Account ${accountName}`}>
      <div className="account-header">
        <div>
          <h4 className="account-name">{accountName}</h4>
          <div className="account-number">•••• {masked}</div>
        </div>

        <span className="account-type">{accountType || "Primary"}</span>
      </div>

      <div className="account-details">
        <div className="balance-label">Available balance</div>
        <div className="balance-value">{formatCurrency(balance)}</div>
      </div>
    </div>
  );
}

export default AccountCard;