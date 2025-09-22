"use client";

import React, { useState, useEffect, useMemo } from "react";

interface TimePickerProps {
  value?: string; // format "HH:mm"
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
}

const generateHours = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push(i.toString().padStart(2, "0"));
  }
  return hours;
};

const generateMinutes = () => {
  const minutes = [];
  for (let i = 0; i < 60; i++) {
    minutes.push(i.toString().padStart(2, "0"));
  }
  return minutes;
};

export const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  className = "",
  disabled = false,
  id,
  name,
  placeholder,
}) => {
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");

  const hoursList = useMemo(() => generateHours(), []);
  const minutesList = useMemo(() => generateMinutes(), []);

  useEffect(() => {
    if (value && value.match(/^([01]\d|2[0-3]):([0-5]\d)$/)) {
      const [h, m] = value.split(":");
      setHour(h);
      setMinute(m);
    } else {
      setHour("");
      setMinute("");
    }
  }, [value]);

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newHour = e.target.value;
    setHour(newHour);
    if (minute !== "") {
      onChange(`${newHour}:${minute}`);
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMinute = e.target.value;
    setMinute(newMinute);
    if (hour !== "") {
      onChange(`${hour}:${newMinute}`);
    }
  };

  return (
    <div className={`flex gap-2 w-full ${className}`}>
      <select
        id={id ? `${id}-hour` : undefined}
        name={name ? `${name}-hour` : undefined}
        value={hour}
        onChange={handleHourChange}
        disabled={disabled}
        aria-label="Hour"
        className="form-input w-24"
        style={{
          WebkitAppearance: "none",
          MozAppearance: "none",
        }}
      >
        <option value="" disabled>
          HH
        </option>
        {hoursList.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span className="flex items-center text-gray-400 dark:text-gray-500 select-none">
        :
      </span>
      <select
        id={id ? `${id}-minute` : undefined}
        name={name ? `${name}-minute` : undefined}
        value={minute}
        onChange={handleMinuteChange}
        disabled={disabled}
        aria-label="Minute"
        className="form-input w-24"
        style={{
          WebkitAppearance: "none",
          MozAppearance: "none",
        }}
      >
        <option value="" disabled>
          MM
        </option>
        {minutesList.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimePicker;
