import styles from './Select.module.css';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
}

export function Select({ options, value, onChange, placeholder, disabled, error }: SelectProps) {
  return (
    <div className={styles.wrapper}>
      <select
        className={`${styles.select} ${error ? styles.error : ''}`}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <svg className={styles.chevron} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4 6l4 4 4-4" />
      </svg>
    </div>
  );
}
