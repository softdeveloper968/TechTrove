import React, { useCallback, useState } from "react";
import Papa from "papaparse";
import { FaFileExport } from "react-icons/fa";
import Button from "../button/Button";
import Spinner from "../spinner/Spinner";
import { useAuth } from "context/AuthContext";
import { UserRole } from "utils/enum";

// Utility function to format dates in MM/DD/YYYY format
// const formatDate = (dateString: string | Date | null): string => {
//   if (!dateString) return ""; // Return empty string for null or undefined dates

//   const date = new Date(dateString);

//   if (isNaN(date.getTime())) {
//     // If it's not a valid date, return the original value (to prevent wrongly formatting strings like "AWESOME APARTMENTS 172")
//     return String(dateString);
//   }

//   // Format date as MM/DD/YYYY
//   const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
//   const day = date.getDate().toString().padStart(2, "0");
//   const year = date.getFullYear();
//   return `${month}/${day}/${year}`;
// };
const formatDate = (dateString: string | Date | null): string => {
  if (!dateString) return ""; // Return empty string for null or undefined dates

  // Check if dateString is an ISO format
  if (typeof dateString === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(dateString)) {
    // Extract the date parts from the string directly
    const [datePart] = dateString.split('T'); // Get the date part before 'T'
    const [year, month, day] = datePart.split('-'); // Split by '-'

    // Return the formatted date as MM/DD/YYYY
    return `${month}/${day}/${year}`;
  }

  // Fallback for other formats (if needed)
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return String(dateString); // Return original value if invalid date
  }

  // Format date as MM/DD/YYYY using UTC methods
  const formattedMonth = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const formattedDay = date.getUTCDate().toString().padStart(2, "0");
  const formattedYear = date.getUTCFullYear();

  return `${formattedMonth}/${formattedDay}/${formattedYear}`;
};
type Props<T> = {
  fetchData: () => Promise<T>;
  fileName: string;
  isEviction?: boolean;
};

// CsvExport component: Wraps the Button component, provides export to CSV functionality
const CsvExport = <T,>(props: Props<T>) => {
  const [spinner, setSpinner] = useState<boolean>(false);
  const { userRole } = useAuth();

  // Check if a string is an ISO date string
  const isISODateString = (value: unknown): boolean => {
    return (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value)
    );
  };

  // download csv
  const downloadCSV = useCallback(async () => {
    try {
      setSpinner(true);
      // Fetch data from the API
      const response = await props.fetchData();

      // Ensure that response.data is an array of objects
      const dataArray: T[] = response as T[];

      if (dataArray && Array.isArray(dataArray)) {
        // Convert objects to strings using JSON.stringify and format dates
        const stringifiedDataArray = dataArray.map((item) => {
          // Ensure that each item is of type T
          const typedItem = item as Record<string, unknown>;

          // Convert each object property to a string, format dates as MM/DD/YYYY
          return Object.keys(typedItem).reduce((acc, key) => {
            const value = typedItem[key];

            // Check if value is an ISO date string or a Date object
            if (isISODateString(value) || value instanceof Date) {
              acc[key] = formatDate(value as string); // Format date
            } else if (typeof value === "object" && value !== null) {
              // If the value is an object (but not null), stringify it
              acc[key] = JSON.stringify(value);
            } else {
              // Otherwise, just convert it to a string
              acc[key] = String(value);
            }
            return acc;
          }, {} as Record<string, string>);
        });

        // Convert the data array to CSV format
        const csv = Papa.unparse(stringifiedDataArray as object[]);

        // Create a Blob with the CSV data
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

        // Create a temporary link element and trigger the download
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.href = url;
        link.setAttribute("download", props.fileName);
        document.body.appendChild(link);
        link.click();

        // Clean up by removing the link and revoking the URL
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Error fetching or exporting data:", error);
      // Handle error (e.g., display an error message)
    } finally {
      setSpinner(false);
    }
  }, [props]);

  return (
    <>
      {!userRole.includes(UserRole.Viewer) && (
        <>
          {spinner && <Spinner></Spinner>}
          {props.isEviction ? (
            <span
              onClick={downloadCSV}
              className="flex items-center font-semibold"
            >
              <FaFileExport className="fa-solid fa-plus mr-1 text-xs" /> Export
              CSV
            </span>
          ) : (
            <Button
              title={"Export CSV"}
              classes={
                "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold"
              }
              type={"button"}
              icon={<FaFileExport className="fa-solid fa-plus mr-0.5 text-xs" />}
              isRounded={false}
              handleClick={downloadCSV}
            />
          )}
        </>
      )}
    </>
  );
};

export default CsvExport;