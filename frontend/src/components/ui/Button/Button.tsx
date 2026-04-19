import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'outline';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit';
  onClick?: () => void;
}

export function Button({
  children,
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={[
        styles.button,
        styles[variant],
        fullWidth ? styles.fullWidth : '',
      ].join(' ')}
    >
      {loading ? '...' : children}
    </button>
  );
}
