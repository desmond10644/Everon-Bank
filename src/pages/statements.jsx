import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./platform.css";

const statementRows = [
  ["Salary deposit", "Aug 18, 2026", "Income", 3200],
  ["Groceries", "Aug 20, 2026", "Expense", -145.75],
  ["Netflix", "Aug 22, 2026", "Expense", -18.99],
  ["Freelance payout", "Aug 24, 2026", "Income", 1250],
  ["Rent payment", "Aug 25, 2026", "Expense", -950],
];

function Statements() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const rows = useMemo(() => statementRows.filter((row) => (filter === "All" || row[2] === filter) && row[0].toLowerCase().includes(search.toLowerCase())), [filter, search]);
  const exportStatement = () => { const csv = ["Description,Date,Type,Amount", ...rows.map((row) => row.join(","))].join("\n"); const link = document.createElement("a"); link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); link.download = "mybank-statement.csv"; link.click(); URL.revokeObjectURL(link.href); };
  return <main className="platform-page"><header className="platform-hero"><div><p className="eyebrow">Documents</p><h1>Statements</h1><p>Review and download a demo statement for your accounts.</p></div><button className="primary-action" onClick={() => window.print()}>Print statement</button></header><section className="platform-card statement-tools"><select aria-label="Account selector"><option>Personal Account •••• 6543</option><option>Main Checking •••• 5678</option></select><select aria-label="Date range"><option>Last 30 days</option><option>Last 90 days</option><option>This year</option></select><input placeholder="Search transactions" value={search} onChange={(event) => setSearch(event.target.value)} /><div className="segmented"><button className={filter === "All" ? "active" : ""} onClick={() => setFilter("All")}>All</button><button className={filter === "Income" ? "active" : ""} onClick={() => setFilter("Income")}>Income</button><button className={filter === "Expense" ? "active" : ""} onClick={() => setFilter("Expense")}>Expenses</button></div></section><section className="platform-card statement-table"><div className="card-heading"><div><h2>August 2026 statement</h2><p>{rows.length} matching transactions</p></div><button className="outline-action" onClick={exportStatement}>Download statement</button></div><div className="responsive-table"><table><thead><tr><th>Description</th><th>Date</th><th>Type</th><th>Amount</th></tr></thead><tbody>{rows.map((row) => <tr key={`${row[0]}-${row[1]}`}><td>{row[0]}</td><td>{row[1]}</td><td><span className="pill">{row[2]}</span></td><td className={row[3] < 0 ? "negative" : "positive"}>{row[3] < 0 ? "-" : "+"}${Math.abs(row[3]).toFixed(2)}</td></tr>)}</tbody></table></div></section><button className="text-action" onClick={() => navigate("/transactions")}>View full transaction history</button></main>;
}

export default Statements;
