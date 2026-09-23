import { useEffect, useMemo, useState } from "react";
import { getAccountDetails, getUserAccounts } from "../api/api";
import useAuth from "../hooks/useAuth";
import "./accounts.css";

const money = (value) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const mask = (value) => `••••  ${String(value || "").slice(-4)}`;
const accountInfo = {
  Savings: { icon: "◒", accent: "green", description: "Build your balance with flexible access." },
  Current: { icon: "↗", accent: "blue", description: "Everyday banking for regular spending." },
  "Fixed Deposit": { icon: "▣", accent: "gold", description: "Lock away funds and earn a fixed return." },
  Student: { icon: "✦", accent: "purple", description: "Simple banking designed for student life." },
  Business: { icon: "◈", accent: "orange", description: "Flexible banking for your growing business." },
};

function Accounts() {
  const { user, token } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAccounts = async () => {
      if (!user?.id || !token) return;
      try {
        setLoading(true);
        const result = await getUserAccounts(user.id);
        setAccounts(result.data || []);
      } catch (err) { setError(err.message || "Unable to load accounts"); }
      finally { setLoading(false); }
    };
    loadAccounts();
  }, [token, user?.id]);

  const totalBalance = useMemo(() => accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0), [accounts]);
  const openDetails = async (account) => {
    try {
      const result = await getAccountDetails(account.id);
      setSelected(result.data || account);
    } catch { setSelected(account); }
  };

  if (loading) return <div className="accounts-page"><div className="accounts-loading">Loading your accounts...</div></div>;

  return (
    <div className="accounts-page">
      <header className="accounts-heading"><div><p className="eyebrow">Your portfolio</p><h1>Accounts</h1><p>Track balances, interest, and activity across your accounts.</p></div><div className="total-balance"><span>Total balance</span><strong>{money(totalBalance)}</strong><small>{accounts.length} account{accounts.length === 1 ? "" : "s"} connected</small></div></header>
      {error && <div className="accounts-error">{error}</div>}
      {!accounts.length ? <section className="accounts-empty"><div>◒</div><h2>No accounts found</h2><p>Your accounts will appear here once they are connected.</p></section> : <section className="accounts-grid">{accounts.map((account) => { const info = accountInfo[account.account_type] || accountInfo.Current; return <article className="account-tile" key={account.id}><div className={`account-tile-top ${info.accent}`}><span className="account-icon">{info.icon}</span><span className="account-status">{account.status || "Active"}</span></div><div className="account-tile-body"><div className="account-title"><div><h2>{account.account_name}</h2><span>{account.account_type} account</span></div><button className="detail-link" onClick={() => openDetails(account)}>View details <b>→</b></button></div><div className="balance-block"><span>Available balance</span><strong>{money(account.balance)}</strong></div><div className="account-meta"><div><span>Account number</span><strong>{mask(account.account_number)}</strong></div><div><span>Interest</span><strong>{account.interest?.rate || "0.00% APY"}</strong><small>{account.interest?.label || "Standard rate"}</small></div></div><div className="activity-block"><div className="activity-heading"><strong>Recent activity</strong><span>{(account.recent_activity || []).length} items</span></div>{account.recent_activity?.length ? account.recent_activity.slice(0, 2).map((item) => <div className="activity-row" key={item.id}><span><b>{item.title || item.transaction_type}</b><small>{new Date(item.transaction_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</small></span><strong className={Number(item.amount) < 0 ? "debit" : "credit"}>{Number(item.amount) < 0 ? "-" : "+"}{money(Math.abs(item.amount))}</strong></div>) : <p className="no-activity">No recent activity.</p>}</div></div></article>; })}</section>}
      {selected && <div className="details-backdrop" onClick={() => setSelected(null)}><section className="details-modal" onClick={(event) => event.stopPropagation()}><button className="close-details" onClick={() => setSelected(null)} aria-label="Close account details">×</button><p className="eyebrow">Account details</p><h2>{selected.account_name}</h2><p className="details-subtitle">{selected.account_type} account · {selected.status || "Active"}</p><div className="details-balance"><span>Available balance</span><strong>{money(selected.balance)}</strong></div><div className="details-list"><div><span>Account number</span><strong>{mask(selected.account_number)}</strong></div><div><span>Interest</span><strong>{selected.interest?.rate || "0.00% APY"}</strong></div><div><span>Currency</span><strong>{selected.currency || "USD"}</strong></div><div><span>Interest terms</span><strong>{selected.interest?.label || "Standard rate"}</strong></div></div><h3>Recent activity</h3>{selected.recent_activity?.length ? selected.recent_activity.map((item) => <div className="modal-activity" key={item.id}><span>{item.title || item.transaction_type}<small>{new Date(item.transaction_date).toLocaleDateString()}</small></span><strong className={Number(item.amount) < 0 ? "debit" : "credit"}>{Number(item.amount) < 0 ? "-" : "+"}{money(Math.abs(item.amount))}</strong></div>) : <p className="no-activity">No recent activity.</p>}</section></div>}
    </div>
  );
}

export default Accounts;
