import { format, parse } from "date-fns";

// Parse dd-MM-yyyy string to Date object
export const parseDDMMYYYY = (value) => {
  if (!value) return null;
  return parse(value, "dd-MM-yyyy", new Date());
};

// Format Date object to dd-MM-yyyy string
export const formatDDMMYYYY = (date) => {
  if (!date) return "";
  try {
    return format(date, "dd-MM-yyyy");
  } catch (e) {
    return "";
  }
};

// Convert dd-MM-yyyy display format to yyyy-MM-dd ISO format for backend
export const formatDDMMYYYYtoISO = (ddmmyy) => {
  const date = parseDDMMYYYY(ddmmyy);
  if (!date) return ddmmyy;
  return format(date, "yyyy-MM-dd");
};

// Format any date (string or Date object) to dd-MM-yyyy
export const formatAnyDateToDDMMYYYY = (dateInput) => {
  if (!dateInput) return "";
  
  try {
    let dateObj;
    
    // If it's a string that looks like ISO format (yyyy-MM-dd or ISO 8601)
    if (typeof dateInput === "string") {
      if (dateInput.includes("T")) {
        // ISO 8601 format (2024-01-15T12:30:00Z)
        dateObj = new Date(dateInput);
      } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        // yyyy-MM-dd format
        dateObj = new Date(dateInput + "T00:00:00");
      } else {
        // Try parsing as is
        dateObj = new Date(dateInput);
      }
    } else if (dateInput instanceof Date) {
      dateObj = dateInput;
    } else {
      return "";
    }

    // Check if valid date
    if (isNaN(dateObj.getTime())) return "";
    
    return format(dateObj, "dd-MM-yyyy");
  } catch (e) {
    return "";
  }
};
