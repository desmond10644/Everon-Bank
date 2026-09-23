import { Link } from "react-router-dom";
import "./footer.css";

function Footer() {
  const quickLinks = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Accounts", to: "/accounts" },
    { label: "Transfer", to: "/transfer" },
    { label: "Profile", to: "/profile" },
  ];

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="brand-block">
          <div className="brand-mark">M</div>
          <div>
            <h3>MyBank</h3>
            <p>Your trusted banking partner.</p>
          </div>
        </div>

        <div className="footer-links">
          <h4>Quick links</h4>
          <ul>
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <p>Email: support@mybank.com</p>
          <p>Phone: +1 234 567 890</p>
        </div>
      </div>

      <div className="footer-bottom">
        <span>Secure • Reliable • Modern</span>
        <p className="copyright">© {new Date().getFullYear()} MyBank. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;