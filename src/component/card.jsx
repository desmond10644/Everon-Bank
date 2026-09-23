import "./card.css";

function Card({
  cardNumber,
  cardHolder,
  expiryDate,
  balance,
  cardType = "Visa",
}) {
  return (
    <div className="bank-card">
      <div className="bank-card-header">
        <h3>{cardType}</h3>
        <span className="chip">💳</span>
      </div>

      <div className="bank-card-number">
        {cardNumber}
      </div>

      <div className="bank-card-footer">
        <div>
          <p className="label">Card Holder</p>
          <h4>{cardHolder}</h4>
        </div>

        <div>
          <p className="label">Expires</p>
          <h4>{expiryDate}</h4>
        </div>
      </div>

      <div className="bank-card-balance">
        <p>Available Balance</p>
        <h2>${balance}</h2>
      </div>

      <p className="bank-name">MyBank</p>
    </div>
  );
}

export default Card;