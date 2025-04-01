import { IAllCasesItems } from "interfaces/all-cases.interface";
import moment from 'moment-timezone';
import { IJWTDecodedToken, ILoginResponse } from "../interfaces/user.interface";
import { jwtDecode } from "jwt-decode";
import { AOSStatusEnum, AttatchmentTypeEnum, DismissalReasonEnum, dismissalReasonToEnumMap, FilingType, OperationTypeEnum, ServiceMethod } from "./enum";
import { colors } from "./constants";
import * as yup from 'yup';

// Define regex patterns to match different file name structures
const regexTypeCaseVersionDate = /^(.*?)_(.*?)_(.*?)_(.*?)\.pdf$/;
const regexTypeCaseDateOrVersion = /^(.*?)_(.*?)_(.*?)\.pdf$/;
const regexTypeCaseOrDate = /^(.*?)_(.*?)\.pdf$/;
const regexTypeDate = /^(.*?)-(.*?)\.pdf$/;

/**
 * A reusable Yup validation helper for zip codes.
 * Supports optional country-specific validation.
 *
 * @param {string} country - Optional. Specify the country for validation (default is "US").
 * @returns {yup.StringSchema} - A yup validation schema for the zip code.
 */
export const zipCodeValidator = (country: string = 'US') => {
  switch (country.toUpperCase()) {
    case 'CA': // Canada postal code validation
      return yup.string()
        .matches(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, 'Invalid Canadian postal code format');
    // Add more countries if needed
    default: // Default to US 
      return yup.string()
        .matches(/^\d{5}(-\d{4})?$/, 'Invalid zip code format');
  }
};

// Regex patterns to identify version (number) and date (mm/dd/yyyy)
const regexVersion = /^\d+$/;
const regexDate1 = /^\d{2}\/\d{2}\/\d{4}$/;
const regexDate2 = /^\d{2}\.\d{2}\.\d{4}$/;

// used in home screen to show user name on the screen
export const getUserInfoFromToken = (): IJWTDecodedToken | null => {

  const storedUser = localStorage.getItem("user");

  if (storedUser) {
    try {
      const parsedUser: ILoginResponse = JSON.parse(storedUser);
      if (parsedUser.token != null) {
        const decodedToken: IJWTDecodedToken = jwtDecode(parsedUser.token);
        return decodedToken;
      }
      return null;
    } catch (error) {
      console.error("Error parsing or decoding token:", error);
    }
  }

  return null;
};

/**
 * This is being used in late Notice page for create notice section
 */
export const convertHtmlToBase64 = (htmlContent: string): string => {
  // Encode the HTML content to base64
  const base64String = btoa(unescape(encodeURIComponent(htmlContent)));
  return base64String;
};

/**
 * Returns the current date formatted as "DD.MM.YYYY".
 * @returns {string} Formatted date string.
 */
export const getFormattedTodayDate = (): string => {
  // Get today's date
  const today = new Date();

  // Extract day, month, and year
  const day = String(today.getDate()).padStart(2, "0"); // Ensure two digits for day
  const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are zero-based, so add 1
  const year = today.getFullYear();

  // Create the formatted date string
  return `${day}.${month}.${year}`;
};

/**
 * download pdf
 * @param pdfUrl pdf url
 */
export const downloadPDF = async (
  pdfUrl: string,
  customHeaders?: Record<string, string>
) => {
  try {
    // Extract the file name from the PDF URL
    const fileName = pdfUrl.substring(pdfUrl.lastIndexOf("/") + 1);

    const response = await fetch(pdfUrl, {
      headers: {
        "Content-Type": "application/pdf",
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = fileName; // Use the extracted file name
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up the URL object to release resources
    URL.revokeObjectURL(url);
  } catch (error: any) {
    console.error("Error downloading PDF:", error);
  }
};

function parseAsUTCWithZ(dateString: any) {

  // Check if the input is already a Date object
  if (dateString instanceof Date) {
    return dateString; // If it's already a Date, return it directly
  }

  // If the input is a string in the format "YYYY-MM-DD" (date only, no time)
  if (typeof dateString === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    // Parse the date string and create a new Date object
    const [year, month, day] = dateString.split('-').map(Number);

    // Set the time to 00:00:00 (midnight) in the local time zone
    const localDate = new Date(year, month - 1, day, 0, 0, 0, 0);

    // Return the Date object with the time set to 00:00:00
    return localDate;
  }

  // If it's a string and it doesn't include "Z", we append it to indicate UTC
  if (typeof dateString === 'string' && !dateString.includes("Z")) {
    dateString += "Z"; // Append "Z" for UTC
  }

  // Return the date as a Date object
  return new Date(dateString);
}

/**
 * @param number
 * @returns number formatted in currency format 
 */
export const formattedCurrency = (value: number | null, includeDollarSign: boolean = false) => {
  if (value == null) {
    return "";
  }
  const formatted: string = value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return includeDollarSign ? `$${formatted}` : formatted;
};


/**
 * @param date
 * @returns date in MM/DD/YYYY format
 */
export const formattedDateTime = (date: string | null) => {
  if (date == null) {
    return "";
  }
  if (date == "") {
    return date;
  }
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    // add time without leading zeros
    hour: "numeric",
    minute: "2-digit",
    // add AM/PM
    hour12: true
  };

  const dt = parseAsUTCWithZ(date);
  if (dt.getHours() == 0 && dt.getMinutes() == 0 && dt.getSeconds() == 0) {
    // Format the local date as MM/DD/YYYY
    return `${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}/${dt.getFullYear()}`;
  }

  return dt.toLocaleDateString(undefined, options);
};

/**
 * @param date
 * @returns date in MM/DD/YYYY format
 */
export const formattedDate = (date: string | null) => {
  if (date == null) {
    return "";
  }
  if (date == "") {
    return date;
  }
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  };

  const dt = parseAsUTCWithZ(date);
  if (dt.getHours() == 0 && dt.getMinutes() == 0 && dt.getSeconds() == 0) {
    // Format the local date as MM/DD/YYYY
    return `${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getDate()).padStart(2, '0')}/${dt.getFullYear()}`;
  }

  return dt.toLocaleDateString(undefined, options);
};

/**
 * @param price string
 * @returns  amount with decimal
 */
export const convertToPrice = (price: string) => {
  return parseFloat(price).toFixed(2);
};

/**
 *  used in import csv late notices screen
 * @param dateString
 * @returns date obj
 */
const parseDate = (dateString: string) => {
  const [day, month, year] = dateString.split("-");
  // Note: months in JavaScript are 0-indexed, so we subtract 1 from the month
  return new Date(Number(year), Number(month) - 1, Number(day));
};

/**
 * used in import csv late notices screem
 * convert date in YYYY-MM-DD format
 * @param dateString
 * @returns get date in YYYY-MM-DD format.
 */
export const convertDateToYYYYMMDD = (dateString: string): string => {
  // const date = new Date(dateString);
  // const year = date.getFullYear();
  // const month = (date.getMonth() + 1).toString().padStart(2, "0");
  // const day = date.getDate().toString().padStart(2, "0");
  // const formattedDate = `${year}-${month}-${day}`;

  // return formattedDate;
  const formattedDate = new Date(dateString).toLocaleDateString("en-US");
  return formattedDate;
};

export const getDate = (dateString: string): Date => {
  // const date = new Date(dateString);
  // const year = date.getFullYear();
  // const month = (date.getMonth() + 1).toString().padStart(2, "0");
  // const day = date.getDate().toString().padStart(2, "0");
  // const formattedDate = `${year}-${month}-${day}`;
  // const formattedDate = new Date(dateString).toLocaleDateString("en-US");
  const [day, month, year] = dateString.split("-").map(Number);
  const dateObject = new Date(year, month - 1, day);
  return dateObject;
};

export const copyText = async (link: string) => {
  try {
    // Use navigator.clipboard.writeText if available
    await navigator.clipboard.writeText(link);
  } catch (error) {
    console.error("Error copying text to clipboard:", error);
  }
};

// Function to format currency
export const formatCurrency = (value: number) => {

  // Assuming value is a number
  const formattedValue = parseFloat(value?.toString()).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
  return formattedValue;
};

const compareObjects = (obj1: any, obj2: any): boolean => {
  // Check if either object is undefined or null
  if (obj1 === null || obj2 === null || typeof obj1 !== 'object' || typeof obj2 !== 'object') {
    return obj1 === obj2; // If both are null or non-objects, consider them equal
  }

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (const key of keys1) {
    const val1 = obj1[key];
    const val2 = obj2[key];

    if ((val1 === null && val2 !== null) || (val1 !== null && val2 === null)) {
      return false; // If one is null and the other is not, consider them different
    }

    if (typeof val1 === 'object' && typeof val2 === 'object') {
      if (!compareObjects(val1, val2)) {
        return false;
      }
    } else if (val1 !== val2) {
      return false;
    }
  }

  return true;
}



export const compareChanges = (list1: IAllCasesItems[], list2: IAllCasesItems[]): boolean => {
  if (list1.length !== list2.length) {
    return true;
  }

  for (let i = 0; i < list1.length; i++) {
    if (!compareObjects(list1[i], list2[i])) {
      return true; // Return true on the first difference
    }
  }

  return false; // If no differences found, return false
}


export const handlePostalCodeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  // Allow only numbers (0-9) and special keys like Backspace, Delete, Arrow keys, etc.
  const allowedKeys = ["Tab", "Backspace", "Delete", "ArrowLeft", "ArrowRight", "End", "Home"];
  if (!/[\d\b]/.test(e.key) && !allowedKeys.includes(e.key)) {
    e.preventDefault();
  }
};

export const getEvictionServiceMethod = (method: string): ServiceMethod | undefined => {
  switch (method) {
    case 'Tack':
      return ServiceMethod.TACK_MAIL;
    case 'Notorious':
      return ServiceMethod.NOTORIOUSLY;
    case 'Personal':
      return ServiceMethod.PERSONALLY;
    case 'Non Est':
      return ServiceMethod.NON_EST;
    case 'Information Only':
      return ServiceMethod.INFORMATION_ONLY;
    default:
      return undefined;
  }
};

export const getFilingType = (method: string): FilingType | undefined => {
  switch (method) {
    case 'Eviction':
      return FilingType.Eviction;
    case 'Amendment':
      return FilingType.Amendment;
    default:
      return undefined;
  }
};

export const fileToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        resolve(result.split(',')[1]);
      } else {
        reject(new Error('Failed to read file as Base64.'));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export const getStatusClassName = (status: string): string => {
  let className = "";
  const baseClass = "w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";

  switch (status) {
    case "Filed":
      className = `bg-sky-200 ${baseClass}`;
      break;
    case "Amended":
      className = `bg-[#FF914D] ${baseClass}`;
      break;
    case "Amendment Ready":
      className = `bg-blue-400 ${baseClass}`;
      break;
    case "Writ Ready":
      className = `bg-[#fd4545] ${baseClass}`;
      break;
    case "Dismissal Applied for":
      className = `bg-[#4DB452] ${baseClass}`;
      break;
    case "Set-Out":
      className = `bg-yellow-300 ${baseClass}`;
      break;
    case "Submitted":
      className = `bg-[#54C1FF] ${baseClass}`;
      break;
    case "Writ Applied for":
      className = `bg-[#E61818] ${baseClass}`;
      break;
    case "Answered":
      className = `bg-[#6D37BB] ${baseClass}`;
      break;
    case "Check for Writ":
      className = `bg-[#F86565] ${baseClass}`;
      break;
    case "Served":
      className = `bg-[#427AC7] ${baseClass}`;
      break;
    case "Submission In Progress":
      className = `bg-yellow-300 ${baseClass}`;
      break;
    case "Dismissal Submission In Progress":
      className = `bg-yellow-300 ${baseClass}`;
      break;
    default:
      className = `bg-black-500 ${baseClass}`;
      break;
  }

  return className;
};

export const convertDateStringToUTCISOString = (dateString: string): string => {
  const parts = dateString.split('/');
  if (parts.length === 3) {
    const [month, day, year] = dateString.split("/");
    const isoDateString = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, parseInt(day), 0, 0, 0)).toISOString();

    return isoDateString;
  }
  throw new Error('Invalid date string format');
};

export const convertToUTCISOString = (dateString: string): string => {
  const date = new Date(dateString);
  const utcISOString = date.toISOString();
  return utcISOString;
};

// export const convertToEasternISOString = (dateString: string): string => {
//   
//    // Parse the date using Moment.js
//    const date = moment(dateString, 'M/D/YYYY');

//    // Set the time zone to Eastern Time
//    date.tz('America/New_York');

//    // Format the date as ISO string
//    const isoString = date.toISOString();

//    return isoString;
// };

export const convertToEasternISOString = (dateString: string): string => {
  // Check if the input is an ISO date string
  const isIsoString = moment(dateString, moment.ISO_8601, true).isValid();

  let easternDate: moment.Moment;

  if (isIsoString) {
    // If it's an ISO string, parse it and convert to Eastern Time
    easternDate = moment(dateString).tz('America/New_York');
  } else {
    // If not, parse the date using the format 'M/D/YYYY'
    const date = moment(dateString, 'M/D/YYYY', true);

    if (!date.isValid()) {
      return ""; // Return empty string if the date cannot be parsed
    }

    // Convert to Eastern Time
    easternDate = date.tz('America/New_York');
  }

  // Return the date as an ISO string
  return easternDate.toISOString();
};

export const convertToEasternISOStringV2 = (dateString: string): string => {
  // Check if the input is an ISO date string
  const isIsoString = moment(dateString, moment.ISO_8601, true).isValid();

  let easternDate: moment.Moment;

  if (isIsoString) {
    // If it's an ISO string, parse it and convert to Eastern Time
    easternDate = moment(dateString).tz('America/New_York');
  } else {
    // Use a more flexible format for parsing
    const date = moment(dateString, ['M/D/YYYY', 'MM/DD/YYYY'], true);  // Added 'MM/DD/YYYY' format for leading zero cases

    if (!date.isValid()) {
      return ""; // Return empty string if the date cannot be parsed
    }

    // Convert to Eastern Time
    easternDate = date.tz('America/New_York');
  }

  // Return the date as an ISO string
  return easternDate.toISOString();
};


export const convertToEasternDate = (dateString: string): Date | undefined => {
  // Check if the input is an ISO date string
  const isIsoString = moment(dateString, moment.ISO_8601, true).isValid();

  if (isIsoString) {
    // If it's already an ISO string, return it as a Date object
    return new Date(dateString);
  }

  // If not, parse the date using the format 'M/D/YYYY'
  const date = moment(dateString, 'M/D/YYYY', true);

  if (!date.isValid()) {
    return undefined; // Return undefined if the date cannot be parsed
  }

  // Set the time zone to Eastern Time and return as Date
  return date.tz('America/New_York').toDate(); // Convert to Date object
};

// export const convertToEasternISOString = (dateString: string): string => {
//   // Check if the input is an ISO date string
//   const date = moment(dateString, moment.ISO_8601, true);

//   if (!date.isValid()) {
//     // Try parsing with the format 'M/D/YYYY' if it's not an ISO date
//     const parsedDate = moment(dateString, 'M/D/YYYY', true);
//     if (!parsedDate.isValid()) {
//       return ""; // Return empty string if the date cannot be parsed
//     }
//     parsedDate.tz('America/New_York');
//     return parsedDate.toISOString();
//   }

//   // If the date is in ISO format, adjust it to Eastern Time and return the ISO string
//   date.tz('America/New_York');
//   return date.toISOString();
// };

let colorIndex = 0;

export const getRandomColor = () => {
  const color = colors[colorIndex];
  colorIndex = (colorIndex + 1) % colors.length;
  return color;
};

export const centerTextPlugin = {
  id: 'centerText',
  beforeDraw: (chart: any) => {
    if (chart.config.type === 'doughnut') {
      const { width, height, ctx } = chart;
      ctx.restore();

      // Set a smaller font size for the middle text
      const fontSize = (height / 200).toFixed(2); // Adjust the denominator to control size
      ctx.font = `${fontSize}em Arial`;
      ctx.textBaseline = 'middle';

      const sum = chart.config.data.datasets[0].data.reduce((acc: number, val: number) => acc + val, 0);
      const text = sum === 0 ? "No Data Found" : `Total: ${sum}`;
      const textX = Math.round((width - ctx.measureText(text).width) / 2);
      const textY = height / 2;
      ctx.fillText(text, textX, textY);
      ctx.save();
    }
  }
};


export const GetChartConfiguration = (labels: string[], data: number[], title: string) => {
  const sum = data.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  const allZero = data.every(count => count === 0);
  const backgroundColors = data.map(() => getRandomColor());

  const config = {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [
        {
          label: title,
          data: data,
          backgroundColor: backgroundColors,
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
        }
      },
      cutout: 75,
    },
    plugins: [centerTextPlugin],
  };

  return config;
};

// Descriptions can be stored in a separate object for better readability and maintainability
const AOSStatusDescriptions: { [key in AOSStatusEnum]: string } = {
  [AOSStatusEnum.NeedToSend]: "NeedToSend",
  [AOSStatusEnum.EmailSent]: "EmailSent",
  [AOSStatusEnum.EmailResent]: "EmailResent",
  [AOSStatusEnum.Modified]: "Modified",
  [AOSStatusEnum.Signed]: "Signed"
};

// Function to get the description
export const getAOSStatusDescription = (status: AOSStatusEnum): string => {
  return AOSStatusDescriptions[status];
};

export const formatCountyList = (counties: string[]): string => {
  if (counties.length === 0) return '';
  if (counties.length === 1) return counties[0];
  const lastCounty = counties.pop();
  return `${counties.join(', ')} and ${lastCounty}`;
};

export const mapDismissalReasonToEnum = (reason: string): DismissalReasonEnum | undefined => {
  return dismissalReasonToEnumMap[reason];
};

export const enumToDismissalReasonString = (reason: DismissalReasonEnum): string => {
  switch (reason) {
    case DismissalReasonEnum.Satisfied:
      return "Satisfied";
    case DismissalReasonEnum.WithPrejudice:
      return "With Prejudice";
    case DismissalReasonEnum.WithoutPrejudice:
      return "Without Prejudice";
    default:
      return "";  // Handle any unexpected values
  }
};

export const formatDateToDateTime = (dateStr: string): Date | null => {
  if (!dateStr) return null;

  // Assuming date is in "mm/dd/yyyy" format
  const [month, day, year] = dateStr.split("/");
  return new Date(`${year}-${month}-${day}`);
};

export const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(" ");
};

export const getDocumentNameByFilingType = (filingType: number | null): string => {
  switch (filingType) {
    case OperationTypeEnum.Eviction:
      return 'eviction.pdf';
    case OperationTypeEnum.Dismissal:
      return 'dismissal.pdf';
    case OperationTypeEnum.Writ:
      return 'writ.pdf';
    case OperationTypeEnum.Amendment:
      return 'amendment.pdf';
    case OperationTypeEnum.AOS:
      return 'aos.pdf';
    default:
      return ''; // Default fallback name
  }
};

// export const convertUtcToEst  = (utcDate: string) => {
//   // Parse the UTC date string into a Date object
//   const date = new Date(utcDate);

//   // Get the system's time zone offset in minutes (positive or negative)
//   let offsetInMinutes = date.getTimezoneOffset();

//   if (date.getHours() == 0 && date.getMinutes() == 0 && date.getSeconds() == 0) {
//     // Assume date only value and do not convert to EST
// 	    offsetInMinutes = 0;
//   }

//   // Calculate the local time by adjusting the UTC time with the system's offset
//   const localDate = new Date(date.getTime() - offsetInMinutes * 60 * 1000); // Convert minutes to milliseconds

//   // Format the local date as MM/DD/YYYY
//   const formattedDate = `${String(localDate.getMonth() + 1).padStart(2, '0')}/${String(localDate.getDate()).padStart(2, '0')}/${localDate.getFullYear()}`;

//   // Get the hours, minutes, and seconds in the local time zone
//   let hours = localDate.getHours();
//   const minutes = localDate.getMinutes();
//   const seconds = localDate.getSeconds();

//   // Determine AM/PM and convert 24-hour time to 12-hour format
//   const amPm = hours >= 12 ? 'PM' : 'AM';
//   hours = hours % 12 || 12; // Convert hour to 12-hour format (0 becomes 12)

//   // Format the time as HH:MM:SS AM/PM
//   const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${amPm}`;

//   // Return the date and time without showing the time zone name
//   return {
//     date: formattedDate,  // MM/DD/YYYY format
//     time: formattedTime,  // HH:MM:SS AM/PM format
//   };
// };


export const convertUtcToEst = (utcDate: string) => {
  // Check if the input is a date without a time component (e.g., "2024-11-19")
  // const isDateOnly = !utcDate.includes('T'); // "T" separates date from time, so if it's not there, it's just a date

  // if (isDateOnly) {
  //   // If it's just a date, return it formatted as MM/DD/YYYY
  //   const [year, month, day] = utcDate.split('-');
  //   const formattedDate = `${String(parseInt(month)).padStart(2, '0')}/${String(parseInt(day)).padStart(2, '0')}/${year}`;

  //   return {
  //     date: formattedDate,  // MM/DD/YYYY format
  //     time: '',  // No time needed
  //   };
  // }
  if (!utcDate) {
    return {
      date: "",  // No date provided
      time: "",  // No time provided
    };
  }
  if (typeof utcDate === 'string') {
    const datetimeRegex = /^(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2}) (AM|PM)$/;
    const match = utcDate.match(datetimeRegex);

    if (match) {
      // If input matches the "MM/DD/YYYY, hh:mm:ss AM/PM" format, parse the date and time
      const [_, month, day, year, hour, minute, second, period] = match;

      // Convert to 24-hour format
      let hours = parseInt(hour);
      if (period === "PM" && hours < 12) {
        hours += 12; // Convert PM hour to 24-hour format
      } else if (period === "AM" && hours === 12) {
        hours = 0; // Convert 12 AM to 00:00 hours
      }

      // Format the date
      const formattedDate = `${String(parseInt(month)).padStart(2, '0')}/${String(parseInt(day)).padStart(2, '0')}/${year}`;

      // Convert the time back to 12-hour format with AM/PM
      const amPm = period;  // Keep the AM/PM period as it was in the input
      let formattedTime = `${String(hours % 12 || 12).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')} ${amPm}`;

      return {
        date: formattedDate,  // MM/DD/YYYY format
        time: formattedTime,  // HH:MM:SS AM/PM format
      };
    }
  }
  if (typeof utcDate === 'string') {
    // Check if the string represents only a date (i.e., no time component, e.g., "2024-11-19")
    const isDateOnly = !utcDate.includes('T'); // "T" separates date from time, so if it's not there, it's just a date

    if (isDateOnly) {
      // If it's just a date, return it formatted as MM/DD/YYYY
      const [year, month, day] = utcDate.split('-');
      const formattedDate = `${String(parseInt(month)).padStart(2, '0')}/${String(parseInt(day)).padStart(2, '0')}/${year}`;

      return {
        date: formattedDate,  // MM/DD/YYYY format
        time: '',  // No time needed
      };
    }
  }

  // If the date has a time component, parse it and convert from UTC to EST
  const date = new Date(utcDate);

  // Get the system's time zone offset in minutes (positive or negative)
  let offsetInMinutes = date.getTimezoneOffset();

  // If the time is exactly midnight, assume it's a date-only value and do not adjust the time
  if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0) {
    offsetInMinutes = 0;
  }

  // Calculate the local time by adjusting the UTC time with the system's offset
  const localDate = new Date(date.getTime() - offsetInMinutes * 60 * 1000); // Convert minutes to milliseconds

  // Format the local date as MM/DD/YYYY
  const formattedDate = `${String(localDate.getMonth() + 1).padStart(2, '0')}/${String(localDate.getDate()).padStart(2, '0')}/${localDate.getFullYear()}`;

  // Get the hours, minutes, and seconds in the local time zone
  let hours = localDate.getHours();
  const minutes = localDate.getMinutes();
  const seconds = localDate.getSeconds();

  // Determine AM/PM and convert 24-hour time to 12-hour format
  const amPm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12; // Convert hour to 12-hour format (0 becomes 12)

  // Format the time as HH:MM:SS AM/PM
  const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')} ${amPm}`;

  // Return the date and time without showing the time zone name
  return {
    date: formattedDate,  // MM/DD/YYYY format
    time: formattedTime,  // HH:MM:SS AM/PM format
  };
};


export const parseToDecimal = (value: number | string | null | undefined): number => {
  if (value === null || value === undefined) {
    return 0; // Return 0 for null or undefined
  }
  const parsedValue = parseFloat(value as string);
  return isNaN(parsedValue) ? 0 : parsedValue; // Return 0 if parsing fails
}

export const convertToEST = (date: Date) => {
  var a = moment(date).tz("America/New_York").format();
  // Convert the selected date to EST
  return moment(date).tz("America/New_York").format(); // ISO format with EST
};

//Remove Special Character and Alphabets and pick only digits
// export const formatZip = (zip: string): string => {
//   // Remove any non-digit characters and limit to a max of 5 digits
//   const digitsOnly = zip.replace(/\D/g, ''); // Remove non-digit characters
//   return digitsOnly.substring(0, 5); // Return only the first 5 digits
// };

// Remove only special character trim the leading and trailing spaces
export const formatZip = (zip: string): string => {
  // remove non-visible characters
  zip = zip.replace(/[\u200B-\u200D\uFEFF]/g, '');
  // remove tabs and newlines
  zip = zip.replace(/[\t\n]/g, '');
  // trim leading and trailing spaces
  zip = zip.trim();
  return zip;
};


// export const normalizeDate = (dateStr: string | Date) => {
//   ;
//   dateStr = dateStr.toString();
//   // Split the date string by "/"
//   const parts = dateStr.split('/');

//   // Convert month and day to integers to remove leading zeros
//   const month = parseInt(parts[0], 10);  // Remove leading zero if present
//   const day = parseInt(parts[1], 10);    // Remove leading zero if present
//   const year = parts[2];

//   // Return the normalized date in mm/dd/yyyy format
//   return `${month}/${day}/${year}`;
// };
export const normalizeDate = (dateStr: string | Date) => {
  let date: Date;

  // If the input is a string in ISO format or a Date object
  if (typeof dateStr === 'string') {
    // Try to parse the ISO string if it looks like an ISO date
    if (dateStr.includes('T') || dateStr.includes('-')) {
      date = new Date(dateStr);
    } else {
      // If it's not an ISO string, assume it's in mm/dd/yyyy format
      const parts = dateStr.split('/');
      const month = parseInt(parts[0], 10); // Convert month to number
      const day = parseInt(parts[1], 10);   // Convert day to number
      const year = parseInt(parts[2], 10);  // Convert year to number
      // Create a date object from the parsed date
      date = new Date(year, month - 1, day); // Month is zero-indexed
    }
  } else {
    // If it's already a Date object
    date = dateStr;
  }

  // Extract month, day, and year
  const month = date.getMonth() + 1;  // Month is zero-indexed, so add 1
  const day = date.getDate();
  const year = date.getFullYear();

  // Return the normalized date in mm/dd/yyyy format
  return `${month}/${day}/${year}`;
};

// /**
//  * Adjusts the input date string to UTC midnight and then adjusts it based on the system's timezone.
//  * @param dateString - The date string in 'MM/dd/yyyy' format.
//  * @returns The adjusted Date object based on the system's timezone.
//  */
// export const adjustDateToSystemTimezone = (dateString: string): Date => {
//   // Split the input date string (MM/dd/yyyy)
//   const dateParts = dateString.split('/');
//   const date = new Date(
//      Number(dateParts[2]),  // Year
//      Number(dateParts[0]) - 1, // Month (0-based index)
//      Number(dateParts[1])  // Day
//   );

//   // Set time to midnight UTC
//   date.setUTCHours(0, 0, 0, 0);

//   // Get the system's timezone offset in minutes
//   const timezoneOffsetMinutes = date.getTimezoneOffset();

//   // Adjust the date based on the timezone offset
//   const adjustedDate = new Date(date.getTime() - timezoneOffsetMinutes * 60000);

//   return adjustedDate;
// };

/**
 * Adjusts the input date (either a string in 'MM/dd/yyyy' format or a Date object) 
 * to UTC midnight and then adjusts it based on the system's timezone.
 * @param input - The date input, either a string ('MM/dd/yyyy') or a Date object.
 * @returns The adjusted Date object based on the system's timezone.
 */

// export const adjustDateToSystemTimezone = (input: string | Date): string => {
//   
//   let date: Date;

//   // Check if input is a string and a valid ISO date string
//   const isIsoString = typeof input === 'string' && !isNaN(Date.parse(input));

//   if (isIsoString) {
//     // Parse as an ISO date string
//     date = new Date(input);
//   } else if (typeof input === 'string') {
//     // Handle MM/dd/yyyy formatted string
//     const dateParts = input.split('/');

//     // Ensure dateParts contains exactly 3 elements (MM, dd, yyyy)
//     if (dateParts.length === 3) {
//       // Convert string parts to numbers and create a Date object
//       const month = Number(dateParts[0]);
//       const day = Number(dateParts[1]);
//       const year = Number(dateParts[2]);

//       // Basic validation to check if the numbers are valid
//       if (month && day && year) {
//         // Create the Date object (month is zero-based in JavaScript)
//         date = new Date(year, month - 1, day);
//       } else {
//         return 'Invalid date components'; // Handle invalid date parts gracefully
//       }
//     } else {
//       return 'Invalid date format, expected MM/dd/yyyy'; // Handle incorrect format gracefully
//     }
//   } else if (input instanceof Date) {
//     date = new Date(input);
//   } else {
//     return 'Invalid date input, must be a string (MM/dd/yyyy) or Date object'; // Handle invalid input types
//   }

//   // Set the time to UTC midnight
//   date.setUTCHours(0, 0, 0, 0);

//   // Get the timezone offset in minutes for the system's timezone
//   const timezoneOffsetMinutes = new Date().getTimezoneOffset();

//   // Adjust the date by subtracting the timezone offset (in minutes)
//   const adjustedDate = new Date(date.getTime() + timezoneOffsetMinutes * 60000);

//   // Return the adjusted date in ISO string format (which will reflect UTC time)
//   return adjustedDate.toISOString();
// };

export const adjustDateToSystemTimezone = (input: string | Date): string => {

  let date: Date;

  // Check if input is a string and a valid ISO date string
  const isIsoString = typeof input === 'string' && !isNaN(Date.parse(input));

  if (isIsoString) {
    // Parse as an ISO date string
    date = new Date(input);
  } else if (typeof input === 'string') {
    // Handle MM/dd/yyyy formatted string
    const dateParts = input.split('/');

    // Ensure dateParts contains exactly 3 elements (MM, dd, yyyy)
    if (dateParts.length === 3) {
      // Convert string parts to numbers and create a Date object
      const month = Number(dateParts[0]);
      const day = Number(dateParts[1]);
      const year = Number(dateParts[2]);

      // Basic validation to check if the numbers are valid
      if (month && day && year) {
        // Create the Date object (month is zero-based in JavaScript)
        date = new Date(year, month - 1, day);
      } else {
        return 'Invalid date components'; // Handle invalid date parts gracefully
      }
    } else {
      return 'Invalid date format, expected MM/dd/yyyy'; // Handle incorrect format gracefully
    }
  } else if (input instanceof Date) {
    date = new Date(input);
  } else {
    return 'Invalid date input, must be a string (MM/dd/yyyy) or Date object'; // Handle invalid input types
  }

  // Set the time to UTC midnight
  date.setUTCHours(0, 0, 0, 0);

  // Get the timezone offset in minutes for the system's timezone and make sure it's always positive
  const timezoneOffsetMinutes = Math.abs(new Date().getTimezoneOffset());

  // Adjust the date by adding the timezone offset (in minutes)
  const adjustedDate = new Date(date.getTime() + timezoneOffsetMinutes * 60000);

  // Return the adjusted date in ISO string format (which will reflect UTC time)
  return adjustedDate.toISOString();
};

export const courtTimeToUtc = (input: string | Date, state: string | null): string => {
  if (state === 'GA'){
    return internalAdjustDateSystemTimezone(input, 'America/New_York');
  }
  if (state == 'TX'){
    return internalAdjustDateSystemTimezone(input, 'America/Chicago');
  }
  return internalAdjustDateSystemTimezone(input, null);
}
export const adjustDateSystemTimezone = (input: string | Date): string => {
  return internalAdjustDateSystemTimezone(input, null);
}

const internalAdjustDateSystemTimezone = (input: string | Date, tz: string | null): string => {
  let date: Date;

  // Check if input is a string and a valid ISO date string
  const isIsoString = typeof input === 'string' && !isNaN(Date.parse(input));

  if (isIsoString) {
    // Parse as an ISO date string
    date = new Date(input);
  } else if (typeof input === 'string') {
    // Handle MM/dd/yyyy formatted string
    const dateParts = input.split('/');

    // Ensure dateParts contains exactly 3 elements (MM, dd, yyyy)
    if (dateParts.length === 3) {
      const month = Number(dateParts[0]);
      const day = Number(dateParts[1]);
      const year = Number(dateParts[2]);

      if (month && day && year) {
        // Create the Date object with the system's local time
        date = new Date(year, month - 1, day);
      } else {
        // return 'Invalid date components';
        return '';

      }
    } else {
      // return 'Invalid date format, expected MM/dd/yyyy';
      return '';

    }
  } else if (input instanceof Date) {
    date = new Date(input);
  } else {
    // return 'Invalid date input, must be a string (MM/dd/yyyy) or Date object';
    return '';

  }

  if (tz) {
    const eventTimeUtc = moment.tz(date, tz).utc();
    return eventTimeUtc.toISOString();
  }
  else
  {
    // Get the timezone offset in minutes for the system's local timezone
    const timezoneOffsetMinutes = new Date().getTimezoneOffset();

    // Adjust the date by adding the timezone offset (in minutes)
    const adjustedDate = new Date(date.getTime() + timezoneOffsetMinutes * 60000);

    // Return the adjusted date in ISO string format (which will reflect UTC time)
    return adjustedDate.toISOString();
  }
};


export const adjustDateToSystemTimezoneDate = (input: string | Date): Date => {
  let date: Date;

  // Parse the input as a string or use a Date object directly
  if (typeof input === 'string') {
    const dateParts = input.split('/');
    date = new Date(
      Number(dateParts[2]),  // Year
      Number(dateParts[0]) - 1, // Month (0-based index)
      Number(dateParts[1])  // Day
    );
  } else if (input instanceof Date) {
    date = new Date(input);
  } else {
    throw new Error('Invalid date input, must be a string (MM/dd/yyyy) or Date object.');
  }

  // Set the time to UTC midnight
  date.setUTCHours(0, 0, 0, 0);

  // Get the timezone offset in minutes for the system's timezone
  const timezoneOffsetMinutes = new Date().getTimezoneOffset();

  // Adjust the date by subtracting the timezone offset (in minutes)
  const adjustedDate = new Date(date.getTime() + timezoneOffsetMinutes * 60000);

  // Return the adjusted date in ISO string format (which will reflect UTC time)
  return adjustedDate;
};
export const adjustDateSystemTimezoneDate = (input: string | Date): Date | null => {

  let date: Date;

  // Check if input is a string and a valid ISO date string
  const isIsoString = typeof input === 'string' && !isNaN(Date.parse(input));

  if (isIsoString) {
    // Parse as an ISO date string
    date = new Date(input);
  } else if (typeof input === 'string') {
    // Handle MM/dd/yyyy formatted string
    const dateParts = input.split('/');

    // Ensure dateParts contains exactly 3 elements (MM, dd, yyyy)
    if (dateParts.length === 3) {
      const month = Number(dateParts[0]);
      const day = Number(dateParts[1]);
      const year = Number(dateParts[2]);

      if (month && day && year) {
        // Create the Date object with the system's local time
        date = new Date(year, month - 1, day);
      } else {
        return null;
      }
    } else {
      return null;
    }
  } else if (input instanceof Date) {
    date = new Date(input);
  } else {
    return null;
  }

  // Get the timezone offset in minutes for the system's local timezone
  const timezoneOffsetMinutes = new Date().getTimezoneOffset();

  // Adjust the date by adding the timezone offset (in minutes)
  const adjustedDate = new Date(date.getTime() + timezoneOffsetMinutes * 60000);

  // Return the adjusted date in ISO string format (which will reflect UTC time)
  return adjustedDate;
};
export const adjustDateSystemTimezoneDateString = (input: string | Date): Date | string => {

  let date: Date;

  // Check if input is a string and a valid ISO date string
  const isIsoString = typeof input === 'string' && !isNaN(Date.parse(input));

  if (isIsoString) {
    // Parse as an ISO date string
    date = new Date(input);
  } else if (typeof input === 'string') {
    // Handle MM/dd/yyyy formatted string
    const dateParts = input.split('/');

    // Ensure dateParts contains exactly 3 elements (MM, dd, yyyy)
    if (dateParts.length === 3) {
      const month = Number(dateParts[0]);
      const day = Number(dateParts[1]);
      const year = Number(dateParts[2]);

      if (month && day && year) {
        // Create the Date object with the system's local time
        date = new Date(year, month - 1, day);
      } else {
        return 'Invalid date components';
      }
    } else {
      return 'Invalid date format, expected MM/dd/yyyy';
    }
  } else if (input instanceof Date) {
    date = new Date(input);
  } else {
    return 'Invalid date input, must be a string (MM/dd/yyyy) or Date object';
  }

  // Get the timezone offset in minutes for the system's local timezone
  const timezoneOffsetMinutes = new Date().getTimezoneOffset();

  // Adjust the date by adding the timezone offset (in minutes)
  const adjustedDate = new Date(date.getTime() + timezoneOffsetMinutes * 60000);

  // Return the adjusted date in ISO string format (which will reflect UTC time)
  return adjustedDate;
};

// Helper function to combine date and time into ISO 8601 format
export const convertToISOString = (date: string, time: string): string => {
  // Parse the date and time
  const [month, day, year] = date.split('/').map(Number);
  const [hour, minute, second] = time.split(/:| /).map(Number);
  const amPm = time.split(' ')[2];

  // Adjust hour for 12-hour format
  let adjustedHour = amPm === 'PM' && hour < 12 ? hour + 12 : hour;
  adjustedHour = amPm === 'AM' && hour === 12 ? 0 : adjustedHour;

  // Create a date object in UTC
  const utcDate = new Date(Date.UTC(year, month - 1, day, adjustedHour, minute, second));

  // Return ISO string format
  return utcDate.toISOString();
};

export const convertAndFormatDate = (dateField: Date | string | null) => {
  if (!dateField) return "";

  // Convert dateField to a Date object if it's a string
  const dateObj = new Date(dateField.toString());

  // Check if the time part is "00:00:00"
  if (dateObj.getHours() === 0 && dateObj.getMinutes() === 0 && dateObj.getSeconds() === 0) {
    // Set the time to "12:00 AM" (midnight in 12-hour format)
    dateObj.setHours(0, 0, 0);
  }

  const value = dateObj.toString();
  // Convert the date to EST using your existing method
  const convertedDate = convertUtcToEst(dateObj.toString());

  // Return the formatted ISO string
  return convertedDate
    ? convertToISOString(convertedDate.date, convertedDate.time)
    : "";
};

export const convertAndFormatDateForCSV = (dateField: Date | string | null) => {
  if (!dateField) return "";

  // If the dateField is a string in the format "YYYY-MM-DD" (date-only), handle it separately
  if (typeof dateField === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateField)) {
    // Directly format the date as MM/DD/YYYY without conversion to EST or adding time
    const [year, month, day] = dateField.split('-');
    return `${String(parseInt(month)).padStart(2, '0')}/${String(parseInt(day)).padStart(2, '0')}/${year}`;
  }

  // Convert dateField to a Date object if it's a string
  const dateObj = new Date(dateField.toString());

  // Convert the date to EST using your existing method
  const convertedDate = convertUtcToEst(dateObj.toString());

  // Extract date components and return in mm/dd/yyyy format
  if (convertedDate) {
    const date = new Date(convertedDate.date);
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Get month and pad with 0
    const day = date.getDate().toString().padStart(2, '0'); // Get day and pad with 0
    const year = date.getFullYear(); // Get full year

    return `${month}/${day}/${year}`;
  }

  return "";
};

export const parseDateOnly = (dateString: string): Date | null => {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

export const formatToDateOnlyString = (date: Date | null): string | null => {
  if (!date) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`; // Format as "yyyy-MM-dd"
};

/**
 * Extracts the prefix before the first underscore from a filename in the URL.
 * 
 * @param {string} url - The full URL containing the file.
 * @returns {string} - The part before the first underscore in the filename.
 */
export const extractFilePrefix = (url: string): string => {
  // Ensure the URL is not undefined or empty
  if (!url) {
    return ''; // Return empty string if the URL is falsy (undefined, null, empty)
  }

  // Extract the filename from the URL by splitting on the last '/'
  const fileName = url.split('/').pop();

  // If fileName is undefined or empty, return an empty string
  if (!fileName) {
    return '';
  }

  // Use a regular expression to match the part before the first underscore
  const fileNamePrefix = fileName.match(/^([^_]+)/); // Match everything before the first underscore

  // Extract the number after the last underscore and before the .pdf extension
  const fileNameSuffix = fileName.match(/_(\d+)\.pdf$/);  // Match last number after last underscore before .pdf

  // Start with the prefix (before the first underscore)
  let displayName = fileNamePrefix ? fileNamePrefix[1] : '';

  // If a numeric suffix is found, append it to the displayName
  if (fileNameSuffix) {
    displayName += `_${fileNameSuffix[1]}`; // Append the matched number after the last underscore
  }

  // Return the final displayName
  return displayName;
};


export const toCssClassName = (columnname: string): string | null => {
  return columnname
    .replace(/\s+/g, "") // Replace spaces with hyphens
    .replace(/[^a-zA-Z0-9_-]/g, ""); // Remove unsupported characters
};

export const parseFileName = (fileName: string, docType: AttatchmentTypeEnum): string => {
  // Attempt to match the most detailed structure first
  const matchTypeCaseVersionDate = fileName.match(regexTypeCaseVersionDate);
  if (matchTypeCaseVersionDate) {
    // Destructure and return the relevant parts if the detailed match is found
    const [_, type, caseNumber, version, date] = matchTypeCaseVersionDate;
    return `${type}${version}_${date}`;
  }

  // Fallback to the less detailed match for version or date
  const matchTypeCaseDateOrVersion = fileName.match(regexTypeCaseDateOrVersion);
  if (matchTypeCaseDateOrVersion) {
    const [_, type, caseOrVersion, versionOrDate] = matchTypeCaseDateOrVersion;

    switch (docType) {
      case AttatchmentTypeEnum.Writ:
        {
          if (regexVersion.test(versionOrDate) || regexDate1.test(versionOrDate))
            return `${type}${versionOrDate}`;
          return fileName;
        }

      case AttatchmentTypeEnum.Amendment:
        {
          return `${type}${caseOrVersion}_${versionOrDate}`;
        }
      default:
        return fileName;
    }
  }

  // Fallback to the simplest match if no other match is found
  const matchTypeCaseOrDate = fileName.match(regexTypeCaseOrDate) || fileName.match(regexTypeDate);
  if (matchTypeCaseOrDate) {
    const [_, type, caseOrDate] = matchTypeCaseOrDate;
    switch (docType) {
      case AttatchmentTypeEnum.Writ:
        return `${type}`; // Return only the type

      case AttatchmentTypeEnum.Amendment:
        {
          if (fileName.match(regexTypeDate))
            return `${type}`; // Return only the type
          return `${type}_${caseOrDate}`;
        }
      default:
        return fileName;
    }
  }

  // Return the original file name if no match is found
  return fileName;
};

export const getFileNameFromWritsDocURL = (url: string): string => {

  const type = AttatchmentTypeEnum.Writ
  const regex = /^(https:\/\/[^\/]+\/[^\/]+\/[^\/]+\/[^\/]+\/)/;

  const pdfExtensionString = ".pdf";
  const writFileNameString = `Writ${pdfExtensionString}`;

  const match = url.match(regex);

  // If a match is found (i.e., the URL structure is valid)
  if (match) {
    // Extract the base path from the matched URL (this is the part before the actual file name)
    const fileBasePath = match[1];

    // Get the part of the URL after the base path (this should be the actual file name)
    var fileName: string = url.split(fileBasePath)[1];

    // Parse the file name (assumed to be some function that processes the file name)
    var parsedFileName = parseFileName(fileName, type);

    // Check if the parsed file name already contains the ".pdf" extension
    // If yes, return the parsed file name as it is
    // If no ".pdf" extension is found, append it and return the full file name
    // If the URL does not match the expected structure, return the default Writ filename

    if (parsedFileName.includes(pdfExtensionString))
      return parsedFileName;
    return `${parsedFileName}${pdfExtensionString}`;
  } else {
    return writFileNameString;
  }
}

export const checkDatePart = (str: string): boolean => {
  const regex1 = /\d{2}\/\d{2}\/\d{4}/; // Regex to match date in dd/mm/yyyy format
  const regex2 = /\d{4}\.\d{2}\.\d{2}/; // Regex to match date in dd/mm/yyyy format

  const match = str.match(regex1) || str.match(regex2); // Use the regex to search for the date part

  if (match)
    return true;
  return false;

}

export const getEnumFromValue = (value: string): AttatchmentTypeEnum | undefined => {
  switch (value) {
    case "Writ":
      return AttatchmentTypeEnum.Writ
    case "Amendment":
      return AttatchmentTypeEnum.Amendment
    case "AOS":
      return AttatchmentTypeEnum.AOS
  }
}