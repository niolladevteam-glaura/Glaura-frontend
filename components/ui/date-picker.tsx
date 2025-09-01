"use client";

import React from "react";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { parse, format } from "date-fns";
import "../../styles/date-picker.css";

interface DatePickerProps {
  value?: string; // in "yyyy-MM-dd" or ""
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  className = "",
  placeholder = "dd.mm.yyyy",
  disabled = false,
  id,
  name,
}) => {
  // Parse the incoming value (from form state) to Date
  const dateValue =
    value && value.length === 10
      ? parse(value, "yyyy-MM-dd", new Date())
      : null;

  return (
    <ReactDatePicker
      id={id}
      name={name}
      selected={dateValue}
      onChange={(date: Date | null) => {
        onChange(date ? format(date, "yyyy-MM-dd") : "");
      }}
      dateFormat="dd.MM.yyyy"
      placeholderText={placeholder}
      disabled={disabled}
      className={`form-input ${className}`}
      showMonthDropdown
      showYearDropdown
      dropdownMode="select"
      autoComplete="off"
      isClearable
      calendarStartDay={1}
    />
  );
};

export default DatePicker;
