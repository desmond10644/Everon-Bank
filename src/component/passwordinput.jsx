import { useState } from "react";

import "./passwordinput.css";

function PasswordInput({ id, name, value, onChange, placeholder, required = false }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="password-input-wrapper">
      <input
        id={id}
        type={visible ? "text" : "password"}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        required={required}
      />
      <button
        className="password-visibility-toggle"
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? "Hide" : "Show"}
      </button>
    </div>
  );
}

export default PasswordInput;