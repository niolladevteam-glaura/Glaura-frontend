export function formatDateDDMMYYYY(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.valueOf())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return `${day} ${month} ${year}`;
}

/**
 * Converts a date string in DD MM YYYY format to YYYY-MM-DD (ISO).
 * Returns empty string if invalid.
 */
export function parseDDMMYYYYToISO(ddmm: string): string {
  if (!ddmm) return "";
  const [day, month, year] = ddmm.trim().split(" ");
  if (!day || !month || !year) return "";
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}