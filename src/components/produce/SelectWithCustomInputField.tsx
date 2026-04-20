import type { ChangeEvent, ReactNode } from 'react';
import { Form } from 'react-bootstrap';

type SelectWithCustomInputFieldProps = {
  label: string;
  required?: boolean;
  selectValue: string;
  selectPlaceholder: string;
  options: string[];
  onSelectChange: (event: ChangeEvent<HTMLSelectElement>) => void | Promise<void>;
  isInvalid?: boolean;
  errorMessage?: string;
  extraOptionLabel?: string;
  extraOptionValue?: string;
  customTriggerValue: string;
  renderCustomInput?: () => ReactNode;
};

export default function SelectWithCustomInputField({
  label,
  required,
  selectValue,
  selectPlaceholder,
  options,
  onSelectChange,
  isInvalid,
  errorMessage,
  extraOptionLabel,
  extraOptionValue,
  customTriggerValue,
  renderCustomInput,
}: SelectWithCustomInputFieldProps) {
  return (
    <Form.Group>
      <Form.Label className={required ? 'mb-0 required-field' : 'mb-0'}>{label}</Form.Label>
      <Form.Select
        value={selectValue}
        required={required}
        className={isInvalid ? 'is-invalid' : ''}
        onChange={onSelectChange}
      >
        <option value="" disabled>
          {selectPlaceholder}
        </option>

        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}

        {extraOptionLabel && (
          <option value={extraOptionValue ?? extraOptionLabel}>{extraOptionLabel}</option>
        )}
      </Form.Select>

      {selectValue === customTriggerValue && renderCustomInput?.()}

      {errorMessage && <div className="invalid-feedback d-block">{errorMessage}</div>}
    </Form.Group>
  );
}

SelectWithCustomInputField.defaultProps = {
  required: false,
  isInvalid: false,
  errorMessage: undefined,
  extraOptionLabel: undefined,
  extraOptionValue: undefined,
  renderCustomInput: undefined,
};
