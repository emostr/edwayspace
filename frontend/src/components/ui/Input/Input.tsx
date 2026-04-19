import styles from './Input.module.css';

interface InputProps {
  type?: 'text' | 'password' | 'email';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  disabled?: boolean;
  autoComplete?: string;
}

export function Input({
  type = 'text',
  placeholder,
  value,
  onChange,
  error = false,
  disabled = false,
  autoComplete,
}: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      disabled={disabled}
      autoComplete={autoComplete}
      onChange={(e) => onChange(e.target.value)}
      className={[styles.input, error ? styles.error : ''].join(' ')}
    />
  );
}
