import React from "react";
import "./StatCard.css";

const StatCard = ({
  title,
  value,
  icon,
  change,
  description,
}) => {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <div>
          <p>{title}</p>
          <h2>{value}</h2>
        </div>

        <div className="stat-card-icon">
          {icon}
        </div>
      </div>

      {change && (
        <div className="stat-card-bottom">
          <span className="stat-change">
            {change}
          </span>

          <span>
            {description || "from last month"}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;