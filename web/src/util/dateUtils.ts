export const formatDate = (dateString, options = {}) => {
  if(!dateString) return "";

  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;

    const defaultOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
    };

    return new Intl.DateTimeFormat(navigator.language, defaultOptions as Intl.DateTimeFormatOptions).format(
      date,
    );
  }catch(error) {
    console.error("Error formatting date:", error);
    return dateString;
  }
};

export const formatDateTime = (dateString, options = {}) => {
  if(!dateString) return "";

  try {
    const date =
      typeof dateString === "string" ? new Date(dateString) : dateString;

    const defaultOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    };

    return new Intl.DateTimeFormat(navigator.language, defaultOptions as Intl.DateTimeFormatOptions).format(
      date,
    );
  }catch(error) {
    console.error("Error formatting datetime:", error);
    return dateString;
  }
};

export const formatTime = (timeString, options = {}) => {
  if(!timeString) return "";

  try {
    const [hours, minutes, seconds = "00"] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    date.setSeconds(parseInt(seconds, 10));

    const defaultOptions = {
      hour: "2-digit",
      minute: "2-digit",
      ...options,
    };

    return new Intl.DateTimeFormat(navigator.language, defaultOptions as Intl.DateTimeFormatOptions).format(
      date,
    );
  }catch(error) {
    console.error("Error formatting time:", error);
    return timeString;
  }
};

export const formatTimeSimple = (date: Date): string => {
  if(!date) return "";
  
  try {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes.toString().padStart(2, '0')}`;
  }catch(error) {
    console.error("Error formatting time simply:", error);
    return "";
  }
};

export const formatTimeRangeSimple = (startDate: Date, endDate: Date): string => {
  if(!startDate || !endDate) return "";
  
  try {
    return `${formatTimeSimple(startDate)} - ${formatTimeSimple(endDate)}`;
  }catch(error) {
    console.error("Error formatting time range simply:", error);
    return "";
  }
};
