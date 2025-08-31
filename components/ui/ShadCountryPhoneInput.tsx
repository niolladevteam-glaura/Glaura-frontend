"use client";

import React, { useMemo, useState } from "react";
import PhoneInput, { PhoneInputProps } from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "@/styles/phone-input.css";

interface CustomPhoneInputProps extends PhoneInputProps {
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  placeholderText?: string;
}

export default function ShadCountryPhoneInput(props: CustomPhoneInputProps) {
  const {
    country = "lk",
    value,
    onChange,
    placeholderText = "Select code",
    ...rest
  } = props;
  const [label, setLabel] = useState<string>("");

  const coercedValue = useMemo(
    () => (value != null ? String(value) : ""),
    [value]
  );

  return (
    <div className="pi-wrap" style={{ overflow: "visible" }}>
      <PhoneInput
        {...rest}
        country={country as any}
        value={coercedValue}
        enableSearch
        disableSearchIcon
        inputClass="!hidden"
        buttonClass="!bg-background !border !border-input !rounded-md !px-3 !h-10 !flex !items-center !gap-2 !w-full"
        dropdownClass="!bg-popover !text-foreground !rounded-md !shadow-lg !border !border-input !max-h-72 overflow-y-auto"
        searchPlaceholder="Search country or code"
        searchNotFound="No matches"
        buttonStyle={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          width: "100%",
          overflow: "hidden",
          whiteSpace: "nowrap",
        }}
        onChange={(val, data: any, event, formattedValue) => {
          const name = data?.name || "";
          const code = data?.dialCode ? `+${data.dialCode}` : "";
          setLabel(name && code ? `${name}  ${code}` : code || name || "");
          onChange?.(val, data, event, formattedValue);
        }}
      />

      {/* Overlay label inside the trigger (click-through) */}
      <div className="pi-overlay">
        <div className="pi-overlay-text truncate">
          {label || placeholderText}
        </div>
      </div>
    </div>
  );
}
