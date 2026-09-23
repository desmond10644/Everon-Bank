import { useEffect, useMemo, useState } from "react";
import { changeCardPin, createCard, getUserCards, getUserTransactions, requestCardReplacement, updateCard } from "../api/api";
import useAuth from "../hooks/useAuth";
import "./cards.css";

const money = (value) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const maskNumber = (value) => `••••  ••••  ••••  ${String(value || "").slice(-4)}`;

function Cards() {
  const { user, token } = useAuth();
  const [cards, setCards] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");

  const selectedCard = cards.find((card) => card.id === selectedId) || cards[0];
  const cardTransactions = useMemo(() => {
    if (!selectedCard) return [];
    return transactions.filter((item) => Number(item.account_id) === Number(selectedCard.account_id)).slice(0, 5);
  }, [selectedCard, transactions]);

  const loadData = async () => {
    if (!user?.id || !token) return;
    try {
      setLoading(true);
      const [cardResult, transactionResult] = await Promise.all([getUserCards(user.id, token), getUserTransactions(user.id)]);
      const nextCards = cardResult.data || [];
      setCards(nextCards);
      setSelectedId((current) => current || nextCards[0]?.id);
      setTransactions(transactionResult.data || []);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load your cards");
    } finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [token, user?.id]);

  const runCardAction = async (action, successMessage) => {
    if (!selectedCard) return;
    try {
      setBusy(true);
      const result = await action();
      if (result.data) setCards((current) => current.map((card) => card.id === selectedCard.id ? result.data : card));
      setNotice(successMessage);
      setError("");
    } catch (err) { setError(err.message || "The card update failed"); }
    finally { setBusy(false); }
  };

  const handlePin = async (event) => {
    event.preventDefault();
    await runCardAction(() => changeCardPin(selectedCard.id, pin), "PIN updated securely");
    setPin("");
    setShowPin(false);
  };

  const handleAdd = async (kind) => {
    try {
      setBusy(true);
      const result = await createCard(kind);
      setCards((current) => [...current, result.data]);
      setSelectedId(result.data.id);
      setShowAdd(false);
      setNotice(`${kind === "virtual" ? "Virtual" : "Physical"} card created`);
    } catch (err) { setError(err.message || "Unable to add card"); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="cards-page"><div className="cards-loading">Loading your card wallet...</div></div>;

  return (
    <div className="cards-page">
      <header className="cards-heading"><div><p className="eyebrow">Card centre</p><h1>Cards</h1><p>Manage your physical and virtual cards in one place.</p></div><button className="primary-card-button" onClick={() => setShowAdd((current) => !current)}>＋ Add new card</button></header>
      {showAdd && <div className="add-card-menu"><strong>Choose a card</strong><button onClick={() => handleAdd("physical")} disabled={busy}>Physical card</button><button onClick={() => handleAdd("virtual")} disabled={busy}>Virtual card</button></div>}
      {notice && <div className="cards-notice">{notice}<button onClick={() => setNotice("")} aria-label="Dismiss notification">×</button></div>}
      {error && <div className="cards-error">{error}</div>}

      {!cards.length ? <section className="empty-cards"><span>▣</span><h2>No cards yet</h2><p>Create a physical or virtual card to get started.</p><button className="primary-card-button" onClick={() => setShowAdd(true)}>＋ Add new card</button></section> : <>
        <section className="card-overview"><div className="card-list-panel"><div className="section-title"><h2>Your cards</h2><span>{cards.length} active</span></div><div className="card-list">{cards.map((card) => <button className={`card-list-item ${selectedCard?.id === card.id ? "selected" : ""}`} key={card.id} onClick={() => setSelectedId(card.id)}><span className={`card-dot ${card.card_kind === "virtual" ? "virtual" : "physical"}`}>▣</span><span><strong>{card.card_kind === "virtual" ? "Virtual" : "Physical"} {card.card_type}</strong><small>{maskNumber(card.card_number)}</small></span><span className="list-arrow">›</span></button>)}</div></div><div className={`card-hero ${selectedCard.card_kind === "virtual" ? "virtual-card" : ""}`}><div className="card-hero-top"><span>{selectedCard.card_kind === "virtual" ? "VIRTUAL" : "PHYSICAL"}</span><strong>{selectedCard.card_type}</strong></div><div className="card-chip">▦</div><div className="hero-number">{maskNumber(selectedCard.card_number)}</div><div className="hero-meta"><span><small>Card holder</small><strong>{selectedCard.card_holder}</strong></span><span><small>Expires</small><strong>{selectedCard.expiry_date}</strong></span><span><small>Status</small><strong>{selectedCard.is_frozen ? "Frozen" : selectedCard.status}</strong></span></div><div className="hero-brand">VECTOR<span>◆</span></div></div></section>
        <section className="card-stats"><div><span>Card balance</span><strong>{money(selectedCard.balance)}</strong><small>Available to spend</small></div><div><span>Monthly spending limit</span><strong>{money(selectedCard.spending_limit)}</strong><small>Resets on the 1st of every month</small></div><div><span>Card status</span><strong className={selectedCard.is_frozen ? "status-frozen" : "status-live"}>{selectedCard.is_frozen ? "Frozen" : "Active"}</strong><small>{selectedCard.is_frozen ? "Payments are paused" : "Ready for payments"}</small></div></section>
        <section className="card-columns"><div className="settings-panel"><div className="section-title"><div><h2>Card controls</h2><p>Adjust how this card works.</p></div><span className="secure-label">● Secure</span></div><div className="control-row"><span><strong>{selectedCard.is_frozen ? "Unfreeze card" : "Freeze card"}</strong><small>Temporarily pause all card payments</small></span><button className={`toggle ${selectedCard.is_frozen ? "on" : ""}`} onClick={() => runCardAction(() => updateCard(selectedCard.id, { is_frozen: !selectedCard.is_frozen }), selectedCard.is_frozen ? "Card unfrozen" : "Card frozen")} aria-label="Toggle card freeze"><i /></button></div><div className="control-row"><span><strong>Online payments</strong><small>Use this card for online purchases</small></span><button className={`toggle ${selectedCard.online_payments ? "on" : ""}`} onClick={() => runCardAction(() => updateCard(selectedCard.id, { online_payments: !selectedCard.online_payments }), "Online payment setting updated")} aria-label="Toggle online payments"><i /></button></div><div className="control-row"><span><strong>International payments</strong><small>Allow payments outside your home country</small></span><button className={`toggle ${selectedCard.international_payments ? "on" : ""}`} onClick={() => runCardAction(() => updateCard(selectedCard.id, { international_payments: !selectedCard.international_payments }), "International payment setting updated")} aria-label="Toggle international payments"><i /></button></div><div className="limit-row"><span><strong>Spending limit</strong><small>Daily card spending allowance</small></span><label>$ <input type="number" min="0" defaultValue={selectedCard.spending_limit} onBlur={(event) => runCardAction(() => updateCard(selectedCard.id, { spending_limit: event.target.value }), "Spending limit updated")} /></label></div><div className="action-buttons"><button onClick={() => setShowPin(true)}>⌘ Change PIN</button><button onClick={() => runCardAction(() => requestCardReplacement(selectedCard.id), "Replacement request submitted")} disabled={Boolean(selectedCard.replacement_requested)}>{selectedCard.replacement_requested ? "Replacement requested" : "▱ Request replacement"}</button></div></div><div className="transactions-panel"><div className="section-title"><div><h2>Recent card transactions</h2><p>Latest activity linked to this card.</p></div><span className="activity-count">{cardTransactions.length}</span></div>{cardTransactions.length ? <div className="card-transactions">{cardTransactions.map((transaction) => <div className="card-transaction" key={transaction.id}><span className="transaction-icon">↗</span><span><strong>{transaction.title || transaction.description}</strong><small>{new Date(transaction.transaction_date || transaction.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</small></span><strong className={Number(transaction.amount) < 0 ? "spent" : "received"}>{Number(transaction.amount) < 0 ? "-" : "+"}{money(Math.abs(transaction.amount))}</strong></div>)}</div> : <div className="no-activity">No recent activity for this card.</div>}</div></section>
      </>}

      {showPin && <div className="pin-backdrop"><form className="pin-modal" onSubmit={handlePin}><button type="button" className="close-modal" onClick={() => setShowPin(false)}>×</button><p className="eyebrow">Security</p><h2>Change card PIN</h2><p>Choose a new 4-digit PIN for your {selectedCard.card_kind} card.</p><input autoFocus inputMode="numeric" maxLength="4" pattern="[0-9]{4}" value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))} placeholder="••••" required /><button className="primary-card-button" disabled={busy}>Update PIN</button></form></div>}
    </div>
  );
}

export default Cards;
