import React from 'react';
import {
  PhoneInput as ReactPhoneInput,
  type PhoneInputProps as ReactPhoneInputProps,
} from 'react-international-phone';
import 'react-international-phone/style.css';
import './PhoneInput.css';

interface PhoneInputProps extends Omit<ReactPhoneInputProps, 'onChange'> {
  label?: string;
  error?: string;
  required?: boolean;
  onChange?: (value: string) => void;
}

const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  error,
  required = false,
  onChange,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="mb-2 block text-start text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="phone-input-wrapper">
        <ReactPhoneInput
          {...props}
          defaultCountry="sa"
          onChange={(phone) => {
            if (onChange) {
              onChange(phone);
            }
          }}
          inputClassName={`phone-input-field ${error ? 'phone-input-error' : ''}`}
          countrySelectorStyleProps={{
            buttonClassName: `phone-country-selector ${error ? 'phone-country-selector-error' : ''}`,
          }}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default PhoneInput;
