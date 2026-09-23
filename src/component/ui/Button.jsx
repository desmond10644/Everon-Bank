import "./Button.css";

export default function Button({ children, variant = "primary", className = "", ...props }) {
  return (
    <button className={`ui-btn ui-btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}
