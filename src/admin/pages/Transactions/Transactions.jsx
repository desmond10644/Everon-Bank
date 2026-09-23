import useAdminData from "../../hooks/useAdminData";
import "./Transactions.css";

export default function Transactions() {
	const { data: transactions, loading, error } = useAdminData("transactions");
	const formatCurrency = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(value || 0));

	return (
		<section className="admin-page">
			<div className="admin-page-header">
				<div>
					<p className="admin-eyebrow">Operations</p>
					<h1>Transactions</h1>
					<p>Review recent banking activity.</p>
				</div>
			</div>
			{error && <p className="admin-error">{error}</p>}
			<div className="admin-table-wrapper transactions-table-wrapper">
				<table className="admin-table">
					<thead>
						<tr><th>Description</th><th>Type</th><th className="amount-column">Amount</th><th>Status</th><th>Date</th></tr>
					</thead>
					<tbody>
						{transactions.map((transaction) => (
							<tr key={transaction.id}>
								<td>{transaction.title || transaction.description || "Transaction"}</td>
								<td>{transaction.transaction_type || "Activity"}</td>
								<td className="amount-column">{formatCurrency(transaction.amount)}</td>
								<td><span className={`transaction-status ${String(transaction.status || "Pending").toLowerCase()}`}>{transaction.status || "Pending"}</span></td>
								<td className="date-column">{transaction.transaction_date ? new Date(transaction.transaction_date).toLocaleDateString() : "-"}</td>
							</tr>
						))}
					</tbody>
				</table>
				{loading && <p className="admin-empty">Loading transactions...</p>}
				{!loading && !transactions.length && !error && <p className="admin-empty">No transactions found.</p>}
			</div>
		</section>
	);
}
