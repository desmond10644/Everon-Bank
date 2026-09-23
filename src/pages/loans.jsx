import { useEffect, useState } from "react";
import { getUserLoans } from "../api/api";
import useAuth from "../hooks/useAuth";
import { applyLoan } from "../services/loanservice";
import "./loans.css";

function Loans() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loanType, setLoanType] = useState("Personal Loan");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const loadLoans = async () => {
      try {
        setLoading(true);
        setError("");

        if (!user?.id) {
          throw new Error("You must be logged in to view loans");
        }

        const result = await getUserLoans(user.id);
        setLoans(result.data || []);
      } catch (err) {
        console.error("Loans error:", err);
        setError(err.message || "Failed to load loans");
      } finally {
        setLoading(false);
      }
    };

    loadLoans();
  }, [user?.id]);

  const handleApply = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const result = await applyLoan({ loanType, amount: Number(amount) });
      setLoans((currentLoans) => [result.data, ...currentLoans]);
      setAmount("");
      setSuccess("Loan application submitted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit loan application");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="loans-page">
      <main className="loans-content">
        <h1>My Loans</h1>

        <p className="subtitle">Manage your active and completed loans.</p>

        <form className="loan-application" onSubmit={handleApply}>
          <h2>Apply for a loan</h2>
          <label>
            Loan type
            <select value={loanType} onChange={(event) => setLoanType(event.target.value)}>
              <option>Personal Loan</option>
              <option>Home Improvement Loan</option>
              <option>Education Loan</option>
            </select>
          </label>
          <label>
            Amount
            <input
              type="number"
              min="1"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
              required
            />
          </label>
          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Apply now"}
          </button>
        </form>

        {success && <div className="loan-success">{success}</div>}

        {loading && <p>Loading loans...</p>}

        {error && <div className="loan-error">{error}</div>}

        {!loading && !error && loans.length === 0 && (
          <div className="no-loans">
            <h2>No Loans</h2>
            <p>You currently have no loans.</p>
          </div>
        )}

        {!loading && !error && loans.length > 0 && (
          <div className="loan-list">
            {loans.map((loan) => (
              <div className="loan-card" key={loan.id}>
                <h2>{loan.loan_type}</h2>

                <p>
                  <strong>Loan Amount:</strong> $
                  {Number(loan.amount).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>

                <p>
                  <strong>Outstanding Balance:</strong> $
                  {Number(loan.outstanding_balance).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>

                <span className={`loan-status ${loan.status.toLowerCase()}`}>{loan.status}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default Loans;
