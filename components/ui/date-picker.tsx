"use client";

import React, { useState, useRef } from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse, format } from "date-fns";
import "../../styles/date-picker.css";

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  label?: string;
  error?: string;
  required?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  className = "",
  placeholder = "DD.MM.YYYY",
  disabled = false,
  id,
  name,
  label,
  error,
  required = false,
  minDate,
  maxDate,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const datePickerRef = useRef<any>(null);

  const dateValue =
    value && value.length === 10
      ? parse(value, "yyyy-MM-dd", new Date())
      : null;

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => setIsFocused(false);

  const handleClear = () => {
    onChange("");
    if (datePickerRef.current) {
      datePickerRef.current.setFocus();
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <ReactDatePicker
          ref={datePickerRef}
          id={id}
          name={name}
          selected={dateValue}
          onChange={(date: Date | null) => {
            onChange(date ? format(date, "yyyy-MM-dd") : "");
          }}
          onFocus={handleFocus}
          onBlur={handleBlur}
          dateFormat="dd.MM.yyyy"
          placeholderText={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 
            bg-white dark:bg-gray-800
            border border-gray-300 dark:border-gray-600
            rounded-lg
            text-gray-900 dark:text-white
            placeholder-gray-500 dark:placeholder-gray-400
            text-sm
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:dark:bg-gray-700 disabled:cursor-not-allowed
            ${error ? "border-red-500 focus:ring-red-500" : ""}
            ${
              isFocused
                ? "ring-2 ring-blue-500 ring-opacity-20 border-blue-500"
                : ""
            }
            ${className}
          `}
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          autoComplete="off"
          isClearable
          calendarStartDay={1}
          minDate={minDate}
          maxDate={maxDate}
          clearButtonTitle="Clear date"
          showPopperArrow={false}
          popperModifiers={
            [
              {
                name: "offset",
                options: {
                  offset: [0, 8],
                },
              },
            ] as any
          }
        />

        {error && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="h-5 w-5 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export default DatePicker;
