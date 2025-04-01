import React, { ChangeEvent } from "react";
import { Field } from "formik";
import Pap from "papaparse";
import * as XLSX from "xlsx";
import { fileToBase64 } from "utils/helper";
import CommonService from "services/common.service";
import { IUploadFile } from "interfaces/common.interface";

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

// Props for the CustomInputComponent
type CustomInputProps = {
  field: {
    name: string;
    accept: string;
    value: any; // Adjust the type according to the actual data type
    onBlur: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  filingType?: string;
};

// Props for the TextInput component
type Props<T> = {
  label: string;
  name: string;
  accept: string;
  placeholder?: string;
  errorMessage?: string;
  value: string;
  onDataLoaded: (data: T[]) => void;
  onError: (error: Error) => void;
  showSpinner: (showSpinner: Boolean) => void;
  filingType: string;
};

// CustomInputComponent: A reusable input component for use with Formik
const CustomInputComponent = ({
  field,
  filingType,
  ...props
}: CustomInputProps) => (
  <div>
    <input {...field} {...props} type="file" />
  </div>
);

// FileUpload component: Wraps the Formik Field component, provides label, placeholder, and error handling
const FileUpload = <T,>(props: Props<T>) => {
  const {
    label,
    name,
    placeholder,
    errorMessage,
    value,
    accept,
    showSpinner,
    onDataLoaded,
    onError,
    filingType,
    ...rest
  } = props;

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        let error = new Error("File size exceeds the maximum allowed size.");
        onError(error);
        return;
      }
      showSpinner(true);
      const fileType = file.type;

      const payload: IUploadFile = {
        type: props.filingType,
        base64String: await fileToBase64(file),
        fileName: file.name,
      };
      await CommonService.saveUploadedFile(payload);
      if (
        fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      ) {
        handleXLSFile(file);
      } else handleCSVImport(file);
    }
  };

  const handleCSVImport = (file: File) => {
    Pap.parse<T>(file, {
      complete: (result) => {
        // if (result.data && result.data.length > 0) {
        //   const records = result.data.slice(0, -1);

        //   onDataLoaded(records);
        // }
        if (result.data && result.data.length > 0) {
          let records = result.data;
          
          // Ensure that lastRow is treated as an object
          const lastRow = records[records.length - 1];
          
          // Type guard to ensure `lastRow` is an object with string keys
          if (lastRow && typeof lastRow === 'object' && !Array.isArray(lastRow)) {
            console.log("Last row before check:", lastRow);
  
            // Check if the last row is empty or contains only null/empty values
            if (Object.values(lastRow).every(value => value === null || value === "")) {
              records = records.slice(0, -1); // Remove the last row if it's empty
              console.log("Last row was empty, removing it. Updated records:", records);
            }
          }
  
          // Proceed with the cleaned records
          onDataLoaded(records);
        }
         else {
          console.error("Invalid CSV file structure.");
        }
      },
      error: (error) => {
        onError(error);
      },
      header: true,
    });
  };

  const handleXLSFile = (file: File) => {
    if (file) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        if (e.target) {
          const data = await file.arrayBuffer();
          const workbook = XLSX.read(data);
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];

          const jsonData: T[] = XLSX.utils.sheet_to_json(worksheet, {
            defval: "",
          });

          const filteredData = jsonData.map((obj: any) => {
            const trimmedObj: any = {}; // Create an empty object to store trimmed key-value pairs
            Object.entries(obj).forEach(([key, value]) => {
              const trimmedKey = key.trim(); // Trim the key
              if (!trimmedKey.includes("__EMPTY")) {
                trimmedObj[trimmedKey] = value; // Assign trimmed key-value pairs
              }
            });
            return trimmedObj as T; // Return the trimmed object
          });
          onDataLoaded(filteredData);
        }
      };

      reader.readAsBinaryString(file);
    }
  };

  return (
    <div>
      <label
        htmlFor={name}
        className="relative cursor-pointer rounded-md bg-white font-semibold focus-within:outline-none text-blue-600 hover:underline"
      >
        {label}
      </label>
      <Field
        id={name}
        name={name}
        type="file"
        value={value}
        accept={accept}
        placeholder={placeholder}
        {...rest}
        component={CustomInputComponent}
        onChange={handleFileChange}
      ></Field>
    </div>
  );
};

export default FileUpload;
