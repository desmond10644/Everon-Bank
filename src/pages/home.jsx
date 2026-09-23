import { Link } from "react-router-dom";
import "./home.css";

function Home() {
  return (
    <section className="home">
      <div className="hero">
        <div className="hero-content">
          <span className="hero-tag">Built for modern banking</span>
          <h1>Banking that feels as smart as you are.</h1>
          <p>
            Manage your money with clarity, move funds instantly, and stay in control of every payment,
            savings goal, and investment decision from one elegant dashboard.
          </p>

          <div className="hero-buttons">
            <Link to="/login" className="btn-login">
              Login
            </Link>
            <Link to="/register" className="btn-register">
              Create account
            </Link>
          </div>
        </div>
      </div>

      <div className="metrics">
        <div className="metric-card">
          <span className="metric-label">Daily volume</span>
          <div className="metric-value">$2.4M</div>
        </div>

        <div className="metric-card">
          <span className="metric-label">Verified users</span>
          <div className="metric-value">120K+</div>
        </div>

        <div className="metric-card">
          <span className="metric-label">Approval rate</span>
          <div className="metric-value">99.2%</div>
        </div>
      </div>

      <div className="features">
        <div className="feature-card">
          <div className="feature-icon">💳</div>
          <h2>Smart accounts</h2>
          <p>Organize savings, checking, and spending with instant visibility across every balance.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">💸</div>
          <h2>Seamless transfers</h2>
          <p>Send money securely in seconds with transparent tracking and real-time confirmations.</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📈</div>
          <h2>Growth tools</h2>
          <p>Explore investment opportunities and build wealth through simple, guided planning.</p>
        </div>
      </div>
    </section>
  );
}

export default Home;