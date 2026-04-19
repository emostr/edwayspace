import styles from './Textarea.module.css';

interface TextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  error?: boolean;
}

export function Textarea({ value, onChange, placeholder, rows = 4, disabled, error }: TextareaProps) {
  return (
    <textarea
      className={`${styles.textarea} ${error ? styles.error : ''}`}
      value={value}
      rows={rows}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
