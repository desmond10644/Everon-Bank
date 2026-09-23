import { useEffect, useMemo, useState } from "react";
import { getTransferData, getUserAccounts, saveBeneficiary, submitTransfer } from "../api/api";
import useAuth from "../hooks/useAuth";
import "./transfer.css";

const money = (value) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const initialForm = { transfer_type: "own", sender_account_id: "", recipient_name: "", account_number: "", bank_name: "", amount: "", description: "", scheduled_for: "" };

function Transfer() {
  const { user, token } = useAuth();
  const [mode, setMode] = useState("send");
  const [step, setStep] = useState("form");
  const [form, setForm] = useState(initialForm);
  const [accounts, setAccounts] = useState([]);
  const [transferData, setTransferData] = useState({ beneficiaries: [], scheduled: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saveRecipient, setSaveRecipient] = useState(false);

  const selectedAccount = accounts.find((account) => Number(account.id) === Number(form.sender_account_id));
  const recentRecipients = useMemo(() => {
    const historyRecipients = transferData.history.map((item) => item.title?.replace(/^Transfer to /, "")).filter(Boolean);
    return [...new Set([...transferData.beneficiaries.map((item) => item.name), ...historyRecipients])].slice(0, 5);
  }, [transferData]);

  const loadData = async () => {
    if (!user?.id || !token) return;
    try {
      setLoading(true);
      const [accountResult, transferResult] = await Promise.all([getUserAccounts(user.id), getTransferData()]);
      const nextAccounts = accountResult.data || [];
      setAccounts(nextAccounts);
      setForm((current) => ({ ...current, sender_account_id: current.sender_account_id || nextAccounts[0]?.id || "" }));
      setTransferData(transferResult.data || { beneficiaries: [], scheduled: [], history: [] });
    } catch (err) { setError(err.message || "Unable to load transfer data"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, [token, user?.id]);

  const updateForm = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const chooseMode = (nextMode) => {
    setMode(nextMode);
    setStep("form");
    setError("");
    setForm((current) => ({ ...current, transfer_type: nextMode === "send" ? "bank" : nextMode }));
  };
  const useRecipient = (name) => setForm((current) => ({ ...current, recipient_name: name }));

  const continueToReview = (event) => {
    event.preventDefault();
    setError("");
    if (!selectedAccount) return setError("Choose an account to transfer from.");
    if (Number(form.amount) <= 0) return setError("Enter an amount greater than zero.");
    if (Number(form.amount) > Number(selectedAccount.balance)) return setError("The amount is greater than your available balance.");
    setStep("confirm");
  };

  const completeTransfer = async () => {
    try {
      setBusy(true);
      setError("");
      const result = await submitTransfer(form);
      if (saveRecipient && !form.scheduled_for) await saveBeneficiary({ name: form.recipient_name, account_number: form.account_number, bank_name: form.bank_name, transfer_type: form.transfer_type });
      setMessage(result.message || (form.scheduled_for ? "Transfer scheduled successfully" : "Transfer completed successfully"));
      setStep("success");
      await loadData();
    } catch (err) { setError(err.message || "Transfer failed"); }
    finally { setBusy(false); }
  };

  const reset = () => { setForm({ ...initialForm, sender_account_id: accounts[0]?.id || "" }); setStep("form"); setMessage(""); setSaveRecipient(false); };

  if (loading) return <div className="transfer-page"><div className="transfer-loading">Loading your transfer centre...</div></div>;

  return (
    <div className="transfer-page">
      <header className="transfer-heading"><div><p className="eyebrow">Payments</p><h1>Transfer money</h1><p>Move money between your accounts or send it securely to someone else.</p></div><div className="transfer-balance"><span>Available balance</span><strong>{money(accounts.reduce((sum, account) => sum + Number(account.balance || 0), 0))}</strong></div></header>
      <nav className="transfer-nav" aria-label="Transfer type"><button className={mode === "send" ? "active" : ""} onClick={() => chooseMode("send")}>↗ <span>Send money</span></button><button className={mode === "own" ? "active" : ""} onClick={() => chooseMode("own")}>⇄ <span>Between my accounts</span></button><button className={mode === "bank" ? "active" : ""} onClick={() => chooseMode("bank")}>▣ <span>Bank transfer</span></button></nav>
      {message && <div className="transfer-message">{message}<button onClick={() => setMessage("")} aria-label="Dismiss message">×</button></div>}
      {error && <div className="transfer-error">{error}</div>}

      <div className="transfer-layout">
        <section className="transfer-main">
          {step === "success" ? <div className="transfer-success"><div className="success-mark">✓</div><p className="eyebrow">All set</p><h2>{form.scheduled_for ? "Transfer scheduled" : "Transfer complete"}</h2><p>{message}</p><div className="success-summary"><span>Amount<strong>{money(form.amount)}</strong></span><span>Recipient<strong>{form.recipient_name}</strong></span><span>From<strong>{selectedAccount?.account_name}</strong></span></div><button className="primary-transfer-button" onClick={reset}>Make another transfer</button></div> : step === "confirm" ? <div className="confirmation-screen"><div className="step-label">Step 2 of 2</div><h2>Review transfer</h2><p className="muted-copy">Check these details carefully before completing the transaction.</p><div className="review-box"><div><span>Transfer type</span><strong>{form.transfer_type === "own" ? "Between own accounts" : form.transfer_type === "send" ? "Send money" : "Bank transfer"}</strong></div><div><span>From</span><strong>{selectedAccount?.account_name} · {money(selectedAccount?.balance)} available</strong></div><div><span>Recipient</span><strong>{form.recipient_name}</strong></div><div><span>Account number</span><strong>{form.account_number}</strong></div><div><span>Bank</span><strong>{form.bank_name}</strong></div><div><span>Description</span><strong>{form.description || "No description"}</strong></div><div className="review-total"><span>{form.scheduled_for ? "Scheduled amount" : "You'll send"}</span><strong>{money(form.amount)}</strong></div></div><div className="confirmation-actions"><button className="secondary-transfer-button" onClick={() => setStep("form")} disabled={busy}>Back to edit</button><button className="primary-transfer-button" onClick={completeTransfer} disabled={busy}>{busy ? "Processing..." : form.scheduled_for ? "Confirm schedule" : "Confirm transfer"}</button></div></div> : <form className="transfer-form" onSubmit={continueToReview}><div className="step-label">Step 1 of 2</div><div className="form-title"><div><h2>{mode === "own" ? "Transfer between accounts" : "Send money"}</h2><p>{mode === "own" ? "Move money instantly between your own accounts." : "Enter the recipient and payment details below."}</p></div><span className="secure-pill">● Secure</span></div><label>Pay from<select name="sender_account_id" value={form.sender_account_id} onChange={updateForm} required><option value="">Select an account</option>{accounts.map((account) => <option value={account.id} key={account.id}>{account.account_name} · {money(account.balance)}</option>)}</select></label><div className="form-grid"><label>Recipient name<input name="recipient_name" value={form.recipient_name} onChange={updateForm} placeholder="Full name" required /></label><label>Account number<input name="account_number" value={form.account_number} onChange={updateForm} placeholder="Account number" required /></label><label>Bank<input name="bank_name" value={form.bank_name} onChange={updateForm} placeholder={mode === "own" ? "Your bank" : "Bank name"} required /></label><label>Amount<input type="number" min="0.01" step="0.01" name="amount" value={form.amount} onChange={updateForm} placeholder="0.00" required /></label></div><label>Description <span className="optional">Optional</span><textarea name="description" value={form.description} onChange={updateForm} placeholder="What is this transfer for?" rows="3" /></label><label className="schedule-field">Schedule for <span className="optional">Optional</span><input type="datetime-local" name="scheduled_for" value={form.scheduled_for} onChange={updateForm} min={new Date().toISOString().slice(0, 16)} /></label>{mode !== "own" && <label className="check-row"><input type="checkbox" checked={saveRecipient} onChange={(event) => setSaveRecipient(event.target.checked)} /> Save recipient to beneficiaries</label>}<button className="primary-transfer-button continue-button" type="submit">Continue to review <span>→</span></button></form>}
        </section>

        <aside className="transfer-sidebar"><section className="sidebar-panel"><div className="sidebar-heading"><h2>Beneficiaries</h2><span>{transferData.beneficiaries.length}</span></div>{transferData.beneficiaries.length ? transferData.beneficiaries.slice(0, 4).map((item) => <button className="recipient-row" key={item.id} onClick={() => { useRecipient(item.name); setMode(item.transfer_type === "own" ? "own" : "bank"); }}><span className="recipient-avatar">{item.name.slice(0, 1).toUpperCase()}</span><span><strong>{item.name}</strong><small>{item.bank_name} · •••• {item.account_number.slice(-4)}</small></span><b>›</b></button>) : <p className="sidebar-empty">Saved recipients will appear here.</p>}</section><section className="sidebar-panel"><div className="sidebar-heading"><h2>Recent recipients</h2></div>{recentRecipients.length ? recentRecipients.map((name) => <button className="recent-name" key={name} onClick={() => useRecipient(name)}>↗ <span>{name}</span></button>) : <p className="sidebar-empty">Your recent recipients will appear here.</p>}</section></aside>
      </div>

      <section className="transfer-lower"><div className="data-panel"><div className="panel-heading"><div><p className="eyebrow">Upcoming</p><h2>Scheduled transfers</h2></div><span>{transferData.scheduled.length}</span></div>{transferData.scheduled.length ? <div className="data-table">{transferData.scheduled.map((item) => <div className="data-row" key={item.id}><span><strong>{item.recipient_name}</strong><small>{new Date(item.scheduled_for).toLocaleString()} · {item.bank_name}</small></span><b>{money(item.amount)}</b><em>{item.status}</em></div>)}</div> : <p className="empty-table">No scheduled transfers.</p>}</div><div className="data-panel"><div className="panel-heading"><div><p className="eyebrow">Activity</p><h2>Transfer history</h2></div><span>{transferData.history.length}</span></div>{transferData.history.length ? <div className="data-table">{transferData.history.slice(0, 5).map((item) => <div className="data-row" key={item.id}><span><strong>{item.title}</strong><small>{new Date(item.transaction_date).toLocaleDateString()} · {item.reference}</small></span><b className="history-amount">{money(item.amount)}</b><em className="completed-status">{item.status}</em></div>)}</div> : <p className="empty-table">No transfer history yet.</p>}</div></section>
    </div>
  );
}

export default Transfer;
