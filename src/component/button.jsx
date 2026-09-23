import "./button.css";


function Button({
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  onClick,
}) {

  return (
    <button
      type={type}
      className={`button ${variant}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );

}


export default Button;