import { useEffect, useMemo, useState } from "react";
import { createInvestment, getUserInvestments, sellInvestment } from "../api/api";
import useAuth from "../hooks/useAuth";
import "./investment.css";

const money = (value) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function PerformanceChart({ points = [] }) {
  if (!points.length) return <div className="empty-chart">Performance data will appear after your first investment.</div>;
  const max = Math.max(...points.map((point) => Number(point.value)), 1);
  const min = Math.min(...points.map((point) => Number(point.value)), 0);
  const range = max - min || 1;
  const coordinates = points.map((point, index) => `${(index / Math.max(points.length - 1, 1)) * 100},${100 - ((Number(point.value) - min) / range) * 76 - 10}`).join(" ");
  return <div className="chart-wrap"><svg viewBox="0 0 100 100" preserveAspectRatio="none" role="img" aria-label="Portfolio performance chart"><defs><linearGradient id="chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#0b927b" stopOpacity=".28" /><stop offset="100%" stopColor="#0b927b" stopOpacity="0" /></linearGradient></defs><polygon points={`0,100 ${coordinates} 100,100`} fill="url(#chart-fill)" /><polyline points={coordinates} fill="none" stroke="#087f70" strokeWidth="1.8" vectorEffect="non-scaling-stroke" /></svg><div className="chart-labels">{points.map((point) => <span key={point.label}>{point.label}</span>)}</div></div>;
}

function Investment() {
  const { user } = useAuth();
  const [investments, setInvestments] = useState([]);
  const [dashboard, setDashboard] = useState({ summary: {}, categories: {}, performance: [], history: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [trade, setTrade] = useState(null);
  const [tradeName, setTradeName] = useState("Balanced Growth Fund");
  const [tradeAmount, setTradeAmount] = useState("");

  const loadInvestments = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const result = await getUserInvestments(user.id);
      setInvestments(result.data || []);
      setDashboard(result.dashboard || { summary: {}, categories: {}, performance: [], history: [] });
      setError("");
    } catch (err) { setError(err.message || "Failed to load investments"); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadInvestments(); }, [user?.id]);

  const risk = useMemo(() => {
    if (!investments.length) return { label: "Not rated", className: "neutral", detail: "Add an investment to see your portfolio risk." };
    const hasGrowth = investments.some((item) => item.risk === "Growth");
    const hasFixed = investments.some((item) => item.risk === "Low");
    if (hasGrowth && hasFixed) return { label: "Moderate", className: "moderate", detail: "Balanced across growth and fixed-income assets." };
    if (hasGrowth) return { label: "Growth", className: "growth", detail: "Higher potential returns with more market movement." };
    return { label: "Low", className: "low", detail: "Primarily invested in more stable assets." };
  }, [investments]);

  const submitTrade = async (event) => {
    event.preventDefault();
    try {
      setBusy(true);
      if (trade === "buy") {
        await createInvestment({ name: tradeName, amount: Number(tradeAmount) });
        setNotice("Investment purchased successfully.");
      } else {
        await sellInvestment(trade.id, Number(tradeAmount));
        setNotice("Investment sold successfully.");
      }
      setTrade(null);
      setTradeAmount("");
      await loadInvestments();
    } catch (err) { setError(err.message || "Trade could not be completed"); }
    finally { setBusy(false); }
  };

  if (loading) return <div className="investments-page"><div className="investments-loading">Loading your investment portfolio...</div></div>;
  const summary = dashboard.summary || {};

  return <div className="investments-page"><header className="investments-heading"><div><p className="eyebrow">Wealth centre</p><h1>Investments</h1><p>Track your portfolio and make informed moves with your money.</p></div><button className="primary-investment-button" onClick={() => { setTrade("buy"); setTradeName("Balanced Growth Fund"); }}>＋ Buy investment</button></header>
    {notice && <div className="investment-notice">{notice}<button onClick={() => setNotice("")}>×</button></div>}{error && <div className="investment-error">{error}</div>}
    <section className="investment-metrics"><div><span>Portfolio value</span><strong>{money(summary.portfolioValue)}</strong><small>Current estimated value</small></div><div><span>Total invested</span><strong>{money(summary.totalInvested)}</strong><small>Principal invested</small></div><div><span>Total returns</span><strong className="positive-value">{money(summary.totalReturns)}</strong><small>Across your portfolio</small></div><div><span>Profit / loss</span><strong className={Number(summary.profitLoss) >= 0 ? "positive-value" : "negative-value"}>{Number(summary.profitLoss) >= 0 ? "+" : ""}{money(summary.profitLoss)}</strong><small>Unrealised estimate</small></div></section>
    <section className="investment-dashboard"><div className="performance-panel"><div className="panel-heading"><div><p className="eyebrow">Performance</p><h2>Portfolio performance</h2></div><span className="period-pill">6 months</span></div><PerformanceChart points={dashboard.performance} /></div><div className="risk-panel"><div className="panel-heading"><div><p className="eyebrow">Portfolio health</p><h2>Risk level</h2></div><span className={`risk-dot ${risk.className}`} /></div><div className={`risk-score ${risk.className}`}>{risk.label}</div><div className="risk-meter"><i className={risk.className} /></div><p>{risk.detail}</p><div className="risk-legend"><span>Low</span><span>Moderate</span><span>Growth</span></div></div></section>
    <section className="investment-content-grid"><div className="holdings-panel"><div className="panel-heading"><div><p className="eyebrow">Your holdings</p><h2>Investment categories</h2></div><span>{investments.length} holdings</span></div><div className="category-list">{Object.entries(dashboard.categories || {}).map(([category, value]) => <div className="category-row" key={category}><span className={`category-mark ${category.toLowerCase().replace(" ", "-")}`} /><span><strong>{category}</strong><small>{money(value)} invested</small></span><b>{summary.totalInvested ? `${Math.round((Number(value) / Number(summary.totalInvested)) * 100)}%` : "0%"}</b></div>)}</div>{investments.length ? <div className="holding-list">{investments.map((investment) => <div className="holding-row" key={investment.id}><span><strong>{investment.name}</strong><small>{investment.category} · {investment.risk} risk</small></span><span><b>{money(investment.current_value)}</b><small>{investment.returns}% return</small></span><button onClick={() => { setTrade(investment); setTradeAmount(""); }}>Sell</button></div>)}</div> : <div className="empty-investments">No holdings yet. Start with a demo investment.</div>}</div><div className="history-panel"><div className="panel-heading"><div><p className="eyebrow">Activity</p><h2>Investment history</h2></div><span>{dashboard.history?.length || 0}</span></div>{dashboard.history?.length ? <div className="history-list">{dashboard.history.map((item) => <div className="history-row" key={item.id}><span className={`history-icon ${item.activity_type.toLowerCase()}`}>{item.activity_type === "Buy" ? "↗" : "↘"}</span><span><strong>{item.activity_type} · {item.investment_type}</strong><small>{new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</small></span><b className={item.activity_type === "Buy" ? "buy-value" : "sell-value"}>{item.activity_type === "Buy" ? "-" : "+"}{money(item.amount)}</b></div>)}</div> : <div className="empty-investments">No investment activity yet.</div>}</div></section>
    {trade && <div className="trade-backdrop"><form className="trade-modal" onSubmit={submitTrade}><button type="button" className="close-trade" onClick={() => setTrade(null)}>×</button><p className="eyebrow">Demo trading</p><h2>{trade === "buy" ? "Buy investment" : `Sell ${trade.name}`}</h2><p className="trade-copy">{trade === "buy" ? "Choose a demo asset and enter the amount to invest." : `You currently hold ${money(trade.amount)} in this investment.`}</p>{trade === "buy" && <label>Investment<select value={tradeName} onChange={(event) => setTradeName(event.target.value)}><option>Balanced Growth Fund</option><option>Treasury Bills</option><option>Fixed Income Fund</option><option>Global Equity Fund</option></select></label>}<label>{trade === "buy" ? "Amount to invest" : "Amount to sell"}<input type="number" min="0.01" max={trade === "buy" ? undefined : trade.amount} step="0.01" value={tradeAmount} onChange={(event) => setTradeAmount(event.target.value)} placeholder="0.00" required /></label><button className="primary-investment-button" disabled={busy}>{busy ? "Processing..." : trade === "buy" ? "Confirm buy" : "Confirm sell"}</button></form></div>}
  </div>;
}

export default Investment;
