import "./Charts.css";

const Charts = ({ data = [], loading = false }) => {
  const values = data.map((item) => Number(item.amount || 0));
  const maxValue = Math.max(...values, 1);

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3>Transaction Overview</h3>
          <p>Monthly transaction activity</p>
        </div>

        <select>
          <option>Last 7 months</option>
          <option>Last 30 days</option>
          <option>This year</option>
        </select>
      </div>

      <div className="chart">
        {data.map((item, index) => (
          <div className="chart-column" key={index}>
            <div
              className="chart-bar"
              style={{ height: `${(Number(item.amount || 0) / maxValue) * 100}%` }}
            ></div>

            <span>
              {item.month}
            </span>
          </div>
        ))}
        {loading && <p>Loading activity...</p>}
        {!loading && !data.length && <p>No transaction activity found.</p>}
      </div>
    </div>
  );
};

export default Charts;