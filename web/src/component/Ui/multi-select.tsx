import React, { useState } from "react";
import { X } from "lucide-react";

interface MultiSelectProps<T> {
  options: T[];
  value: T[];
  onChange: (value: T[]) => void;
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string;
  className?: string;
}

const MultiSelect = <T extends unknown>({
  options,
  value,
  onChange,
  getOptionLabel,
  getOptionValue,
  className = "",
}: MultiSelectProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (option: T) => {
    const optionValue = getOptionValue(option);
    const isSelected = value.some((v) => getOptionValue(v) === optionValue);

    if(isSelected) {
      onChange(value.filter((v) => getOptionValue(v) !== optionValue));
    }else {
      onChange([...value, option]);
    }
    setIsOpen(false);
  };

  const handleRemove = (option: T) => {
    const optionValue = getOptionValue(option);
    onChange(value.filter((v) => getOptionValue(v) !== optionValue));
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`}>
      <div
        className="min-h-[2.5rem] p-2 border rounded-md bg-white cursor-pointer"
        onClick={toggleDropdown}
      >
        <div className="flex flex-wrap gap-1">
          {value.map((option) => (
            <div
              key={getOptionValue(option)}
              className="flex items-center gap-1 bg-primary-light text-primary px-2 py-1 rounded-md text-sm"
              onClick={(e) => e.stopPropagation()}
            >
              <span>{getOptionLabel(option)}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(option);
                }}
                className="hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {options
            .filter(
              (option) =>
                !value.some(
                  (v) => getOptionValue(v) === getOptionValue(option),
                ),
            )
            .map((option) => {
              const optionValue = getOptionValue(option);

              return (
                <div
                  key={optionValue}
                  className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSelect(option)}
                >
                  {getOptionLabel(option)}
                </div>
              );
            })}
          {options.length === value.length && (
            <div className="px-3 py-2 text-gray-500 text-sm">
              No more options available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
