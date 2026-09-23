import "./help.css";

function Help() {
  return (
      <div className="help-page">
        <main className="help-content">
          <h1>Help Center</h1>

          <p className="subtitle">
            Find answers to common banking questions.
          </p>

          <div className="faq-container">
            <div className="faq-card">
              <h3>How do I transfer money?</h3>
              <p>
                Navigate to the <strong>Transfer</strong> page, enter the
                recipient's details, specify the amount, and click
                <strong> Send Money</strong>.
              </p>
            </div>

            <div className="faq-card">
              <h3>How do I reset my password?</h3>
              <p>
                Go to the Login page and click
                <strong> Forgot Password</strong> to reset your password.
              </p>
            </div>

            <div className="faq-card">
              <h3>How do I contact support?</h3>
              <p>Email: support@mybank.com</p>
              <p>Phone: +1 (234) 567-8900</p>
            </div>

            <div className="faq-card">
              <h3>Banking Hours</h3>
              <p>Monday – Friday</p>
              <p>8:00 AM – 5:00 PM</p>
            </div>
          </div>
        </main>
      </div>
  );
}

export default Help;