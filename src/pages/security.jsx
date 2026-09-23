import { useState } from "react";
import Notification from "../component/notification";
import PasswordInput from "../component/passwordinput";
import "./platform.css";

function Security() {
  const [twoFactor, setTwoFactor] = useState(true);
  const [saved, setSaved] = useState("");
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });

  const savePassword = (event) => {
    event.preventDefault();
    if (!password.current || password.next.length < 8 || password.next !== password.confirm) {
      setSaved("Use a new password of at least 8 characters and matching confirmation.");
      return;
    }
    setPassword({ current: "", next: "", confirm: "" });
    setSaved("Password updated successfully.");
  };

  return (
    <main className="platform-page">
      <header className="platform-hero"><div><p className="eyebrow">Protection</p><h1>Security Center</h1><p>Manage the controls that keep your demo account protected.</p></div><span className="security-score">Strong</span></header>
      {saved && <Notification type={saved.includes("successfully") ? "success" : "error"} message={saved} />}
      <section className="security-status"><span className="status-check">✓</span><div><strong>Your account security: Strong</strong><p>Two-factor authentication is enabled and no urgent risks were detected.</p></div></section>
      <div className="platform-grid two-columns">
        <section className="platform-card"><div className="card-heading"><div><h2>Security controls</h2><p>Change these settings any time.</p></div></div><div className="control-row"><div><strong>Two-factor authentication</strong><small>Require a verification code at sign in</small></div><input type="checkbox" checked={twoFactor} onChange={(event) => setTwoFactor(event.target.checked)} /></div><div className="control-row"><div><strong>Login alerts</strong><small>Notify me about new devices</small></div><input type="checkbox" defaultChecked /></div><div className="control-row"><div><strong>Transaction limits</strong><small>Daily transfer limit: $5,000</small></div><button className="text-action" type="button" onClick={() => setSaved("Transaction limits opened for review.")}>Review</button></div></section>
        <section className="platform-card"><div className="card-heading"><div><h2>Change password</h2><p>Use a unique password you do not reuse elsewhere.</p></div></div><form className="stack-form" onSubmit={savePassword}><PasswordInput placeholder="Current password" value={password.current} onChange={(event) => setPassword({ ...password, current: event.target.value })} required /><PasswordInput placeholder="New password" value={password.next} onChange={(event) => setPassword({ ...password, next: event.target.value })} required /><PasswordInput placeholder="Confirm new password" value={password.confirm} onChange={(event) => setPassword({ ...password, confirm: event.target.value })} required /><button className="primary-action" type="submit">Update password</button></form></section>
      </div>
      <div className="platform-grid three-columns"><section className="platform-card"><h2>Recent login history</h2><p>Chrome on Windows <span className="muted">Today, 12:16 PM</span></p><p>Edge on Windows <span className="muted">Yesterday, 8:42 AM</span></p></section><section className="platform-card"><h2>Trusted devices</h2><p>Windows desktop <span className="pill success">Trusted</span></p><p>Manage devices from this account.</p></section><section className="platform-card"><h2>Security alerts</h2><p className="alert-copy">No unresolved security alerts.</p><button className="outline-action" type="button" onClick={() => setSaved("Support report started.")}>Report suspicious activity</button></section></div>
    </main>
  );
}

export default Security;
