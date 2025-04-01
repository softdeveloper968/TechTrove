import React from "react";
import { useState } from "react";
import * as yup from "yup";
import { toast } from "react-toastify";
import { Form, Formik } from "formik";
import DatePicker from "react-datepicker";
import { FaTrash } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";

import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import FormikControl from "components/formik/FormikControl";
import DownloadButton from "components/common/button/DownloadButton";
import Grid from "components/common/grid/Grid";
import Spinner from "components/common/spinner/Spinner";

import LateNoticesService from "services/late-notices.service";
import { useLateNoticesContext } from "pages/late-notices/LateNoticesContext";
import fileUpload from "assets/svg/file-upload.svg";
import {
  ICreateLateNotice, ISendNoticeEmail
} from "interfaces/late-notices.interface";

import {
  downloadPDF,
  getDate,
  handlePostalCodeKeyDown
} from "utils/helper";
import { HttpStatusCode } from "utils/enum";
import { StateCode } from "utils/constants";

// Define the props interface with a  type 'ILateNotices'
type LateNoticesImportCsvProps = {
  importCsvPopUp: boolean;
  setImportCsvPopUp: (popup: boolean, importedSuccessfully: string) => void;
};
// Define the Yup schema for each column
// Validation schema for manual create notice
//   "tenant1LastName",
//"tenant1FirstName",
//"tenant1MiddleName",
const validationSchema: yup.ObjectSchema<any> = yup.object({
  tenant1FirstName: yup
    .string()
    .max(50, "Tenant1 first name must not exceed 50 characters.")
    .required("Please enter tenant1 first name."),
  tenant1MiddleName: yup
    .string()
    .max(50, "Tenant1 middle name must not exceed 50 characters."),
  tenant1LastName: yup
    .string()
    .max(50, "Tenant1 last name must not exceed 50 characters.")
    .required("Please enter tenant1 last name."),
  tenant2FirstName: yup
    .string()
    .max(50, "Tenant2 first name must not exceed 50 characters."),
  tenant2MiddleName: yup
    .string()
    .max(50, "Tenant2 middle name must not exceed 50 characters."),
  tenant2LastName: yup
    .string()
    .max(50, "Tenant2 last name must not exceed 50 characters."),
  tenant3FirstName: yup
    .string()
    .max(50, "Tenant3 first name must not exceed 50 characters."),
  tenant3MiddleName: yup
    .string()
    .max(50, "Tenant3 middle name must not exceed 50 characters."),
  tenant3LastName: yup
    .string()
    .max(50, "Tenant3 last name must not exceed 50 characters."),
  tenant4FirstName: yup
    .string()
    .max(50, "Tenant4 first name must not exceed 50 characters."),
  tenant4MiddleName: yup
    .string()
    .max(50, "Tenant4 middle name must not exceed 50 characters."),
  tenant4LastName: yup
    .string()
    .max(50, "Tenant4 last name must not exceed 50 characters."),
  tenant5FirstName: yup
    .string()
    .max(50, "Tenant5 first name must not exceed 50 characters."),
  tenant5MiddleName: yup
    .string()
    .max(50, "Tenant5 middle name must not exceed 50 characters."),
  tenant5LastName: yup
    .string()
    .max(50, "Tenant5 last name must not exceed 50 characters."),
  address: yup
    .string()
    .required("Please enter address")
    .min(3, "Address must be at least 3 characters")
    .max(300, "Address must not exceed 300 characters"),
  unit: yup.string().required("Please enter unit."),
  city: yup
    .string()
    .max(50, "City must not exceed 50 characters.")
    .required("Please enter city."),
  state: yup
    .string()
    .max(2, "State Code must be of 2 characters.")
    .required("Please enter state code."),
  zip: yup
    .string()
    .min(5, "Zip code must be 5 digits.")
    .max(5, "Zip code must be 5 digits.")
    .required("Please enter Zip code."),
  rentDue: yup
    .number()
    .typeError("Rent due must be a valid amount.")
    .transform((value) => (isNaN(value) ? undefined : value)) // Transform to undefined if it's not a number
    .test("maxDigits", "Rent due must have at most 20 digits", (value) => {
      if (!value) return true; // Skip if undefined
      const stringValue = value.toString();
      return stringValue.length <= 20;
    })
    .required("Please enter due rent ."),
  property: yup
    .string()
    .max(100, "Property must not exceed 100 characters.")
    .required("Please enter property."),
  noticePeriod: yup
    .number()
    .typeError("Notice period must be a valid number.")
    .transform((value) => (isNaN(value) ? undefined : value)) // Transform to undefined if it's not a number
    .test("maxDigits", "Notice period must have at most 20 digits", (value) => {
      if (!value) return true; // Skip if undefined
      const stringValue = value.toString();
      return stringValue.length <= 20;
    })
    .required("Please enter notice period."),
  otherFees: yup
    .number()
    .typeError("Fees due must be a valid amount.")
    .transform((value) => (isNaN(value) ? undefined : value)) // Transform to undefined if it's not a number
    .test("maxDigits", "Fees due must have at most 20 digits", (value) => {
      if (!value) return true; // Skip if undefined
      const stringValue = value.toString();
      return stringValue.length <= 20;
    })
    .required("Please enter fees."),

  lateFees: yup
    .number()
    .typeError("Late fees must be a valid amount.")
    .transform((value) => (isNaN(value) ? undefined : value)) // Transform to undefined if it's not a number
    .test("maxDigits", "Late fees must have at most 20 digits", (value) => {
      if (!value) return true; // Skip if undefined
      const stringValue = value.toString();
      return stringValue.length <= 20;
    })
    .required("Please enter late fees."),
  lateFeesDate: yup
    .date()
    .required("Please enter late fees date.")
    .typeError("Please enter a valid date in DD-MM-YYYY format."),
  noticeAffiantSignature: yup
    .string()
    .max(50, "Affiant  must not exceed 50 characters.")
    .required("Please enter Affiant"),
});
// React functional component 'LateNoticesGrid' with a generic type 'ILateNotices'
const LateNotices_ImportCsv = (props: LateNoticesImportCsvProps) => {
  // show uploaded csv data in editable form
  const [gridData, setGridData] = useState<ICreateLateNotice[]>([]);
  // show validation error on the columns
  // const [columnErrors, setColumnErrors] = useState<Record<string, string[]>[]>(
  //   []
  // );
  const [columnErrors, setColumnErrors] = useState<
    Record<string, { rowIndex: number; errorMessage: string }[]>[]
  >([]);
  // this is used to show upload csv button on the pop up
  const [showUploadCsv, setShowUploadCsv] = useState<boolean>(true);
  // this is used to set button title text
  const [btnTitleText, setBtnTitleText] = useState<string>("Create Notice");
  // this is used to show error when csv is invalid
  const [showInvalidCSVMessage, setShowInvalidCSVMessage] =
    useState<boolean>(false);
  // this is to show message when user upload empty csv
  const [showEmptyRecordMessage, setShowEmptyRecordMessage] =
    useState<boolean>(false);
  // this is to show message when user upload large csv
  const [showLargeCsvErrorMessage, setShowLargeCsvErrorMessage] =
    useState<string>("");
  // set spinner
  const [toggleSpinner, setToggleSpinner] = useState<boolean>(false);
  // notice link returned from api
  const [noticeLink, setNoticeLink] = useState<string>("");
  // to show import csv pop up
  const initialValues = {
    UploadFile: "",
  };
  const {
    getLateNotices,
    lateNotices,
    setSelectedLateNoticeId,
    setLateNotices,
  } = useLateNoticesContext();

  const handleLateNotices = async () => {
    const errors: Record<
      string,
      { rowIndex: number; errorMessage: string }[]
    >[] = [];
    gridData.forEach((record) => {
      const recordErrors: Record<
        string,
        { rowIndex: number; errorMessage: string }[]
      > = {};

      try {
        validationSchema.validateSync(record, { abortEarly: false });
      } catch (error: any) {
        if (error.inner) {
          error.inner.forEach((detailError: any) => {
            const propertyName = detailError.path || "unknown";
            const errorMessage = `${detailError.message}`;
            const rowIndex = detailError?.rowIndex ?? -1;

            if (!recordErrors[propertyName]) {
              recordErrors[propertyName] = [];
            }

            recordErrors[propertyName].push({
              rowIndex,
              errorMessage,
            });
          });
        }
      }

      if (Object.keys(recordErrors).length > 0) {
        errors.push(recordErrors);
      }
    });

    setColumnErrors(errors);

    if (errors.length === 0) {
      try {
        setToggleSpinner(true);
        const formattedData = gridData.map((item: ICreateLateNotice) => ({
          ...item,
        }));

        const response = await LateNoticesService.createLateNotice(
          formattedData
        );

        if (response.status === HttpStatusCode.OK) {
          setNoticeLink(response.data?.data);
          // Display a success toast message
          toast.success("Successfully Created Notice");
          setBtnTitleText("Download Notices");
          props.setImportCsvPopUp(false, "importedSuccessfully");
        } else {
          toast.error("Failed to create late notice");
        }
      } catch (error) {
        console.error("An error occurred:", error);
      } finally {
        setToggleSpinner(false);
      }
    }
    getLateNotices(1, 100, lateNotices.searchParam);
  };
  // const handleLateNotices = async () => {

  //   // const errors: Record<string, string[]>[] = [];
  //   const errors: Record<
  //     string,
  //     { rowIndex: number; errorMessage: string }[]
  //   >[] = [];
  //   gridData.forEach((record, rowIndex) => {
  //     // const recordErrors: Record<string, string[]> = {};
  //     const recordErrors: Record<
  //       string,
  //       { rowIndex: number; errorMessage: string }[]
  //     > = {};
  //     try {
  //       // Validate each record against the schema
  //       validationSchema.validateSync(record, { abortEarly: false });
  //     } catch (error: any) {
  //       if (error.inner) {
  //         // Collect validation errors for each property
  //         error.inner.forEach((detailError: any) => {
  //           const propertyName = detailError.path || "unknown";
  //           const errorMessage = `${detailError.message}`;

  //           // Check if the property already has errors, if not, initialize an array
  //           if (!recordErrors[propertyName]) {
  //             recordErrors[propertyName] = [];
  //           }
  //           recordErrors[propertyName].push({
  //             rowIndex,
  //             errorMessage,
  //           });
  //           // Push the error message to the array
  //           // recordErrors[propertyName].push(errorMessage);
  //         });
  //       }
  //     }

  //     // If there are errors for the record, add them to the array
  //     if (Object.keys(recordErrors).length > 0) {
  //       errors.push(recordErrors);
  //     }
  //   });
  //   setColumnErrors(errors);
  //   if (errors.length === 0) {
  //     try {
  //       setToggleSpinner(true);
  //       // Call the LateNoticesService to create a late notice
  //       const response = await LateNoticesService.createLateNotice(gridData);
  //       // Check if the request was successful (status code 200)
  //       if (response.status === HttpStatusCode.OK) {
  //         setNoticeLink(response.data?.data);
  //         // Display a success toast message
  //         toast.success("Successfully Created Notice");
  //         setBtnTitleText("Download Notices");
  //         props.setImportCsvPopUp(false, "importedSuccessfully");
  //         // Close the popup
  //         //props.setImportCsvPopUp(false, "importedSuccessfully");
  //         // getLateNotices(1, 100, !lateNotices., lateNotices.searchParam);
  //       } else {
  //         // Handle other status codes if needed
  //         // For example, display an error message toast
  //         toast.error("Failed to create late notice");
  //       }
  //     } catch (error) {
  //     } finally {
  //       setToggleSpinner(false);
  //     }
  //   }
  // };

  /**
   * download notice
   */
  const downLoadNotice = async () => {
    try {
      setToggleSpinner(true);

      let request: ISendNoticeEmail = {
        combinedPdfUrl: noticeLink,
      };
      // Call the LateNoticesService to create a late notice
      const response = await LateNoticesService.sendNoticesEmail(request);
      // response from api
      if (response.status === HttpStatusCode.OK) {
        await downloadPDF(noticeLink);
        toast.success(response.data.message);
        props.setImportCsvPopUp(false, "");
        getLateNotices(1, 100,lateNotices.searchParam);
      }
    } finally {
      setToggleSpinner(false);
    }
  };

  const handleInputChange = (
    columnName: string,
    updatedBValue: string,
    selectedRowIndex: number
  ) => {
    // Update the state based on the column index and row index
    setGridData((prevRows) =>
      prevRows.map((row, rowIndex) => {
        const updatedRow =
          rowIndex === selectedRowIndex
            ? { ...row, [columnName]: updatedBValue }
            : row;

        // Perform validation for the updated row
        validateRow(updatedRow, rowIndex);

        return updatedRow;
      })
    );
  };

  const validateRow = (row: ICreateLateNotice, rowIndex: number) => {
    const recordErrors: Record<
      string,
      { rowIndex: number; errorMessage: string }[]
    > = {};

    try {
      // Validate the updated row against the schema
      validationSchema.validateSync(row, { abortEarly: false });
    } catch (error: any) {
      if (error.inner) {
        // Collect validation errors for each property
        error.inner.forEach((detailError: any) => {
          const propertyName = detailError.path || "unknown";
          const errorMessage = `${detailError.message}`;

          // Get the row index from your record, adjust this based on your data structure
          const rowIndex = detailError.rowIndex || -1;

          // Check if the property already has errors, if not, initialize an array
          if (!recordErrors[propertyName]) {
            recordErrors[propertyName] = [];
          }

          // Push the error object with rowIndex to the array
          recordErrors[propertyName].push({
            rowIndex,
            errorMessage,
          });
        });
      }
    }

    // If there are errors for the record, update the columnErrors state
    setColumnErrors((prevErrors) => [
      ...prevErrors.slice(0, rowIndex),
      recordErrors,
      ...prevErrors.slice(rowIndex + 1),
    ]);
  };

  /**
   *  handle cross click
   */
  const handleCrossClick = (rowIndex: number) => {
    let filteredRecords = gridData.filter((_, index) => index !== rowIndex);
    // Set the updated array to the state or wherever you store the data
    const newColumnErrors = [...columnErrors];
    newColumnErrors.splice(rowIndex, 1);
    setColumnErrors(newColumnErrors);

    setGridData(filteredRecords);
  };

  /**
   * @param data row of table
   * @param rowIndex index of each row
   * @param cellIndex index of each cell
   * @returns
   */
  const cellRenderer = (
    data: ICreateLateNotice,
    rowIndex: number,
    cellIndex: number
  ) => {
    const columnNames = Object.keys(data);
    const columnName = columnNames[cellIndex];
    const cellValue = data[columnName as keyof ICreateLateNotice];
    const cellErrors = columnErrors[rowIndex]?.[columnName] || [];

    if (columnName === "state") {
      return (
        <td
          key={cellIndex}
          className="px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap "
        >
          {/* Use a regular HTML select element */}
          <div className="relative text-left max-w-[120px]">
            <select
              className={
                "peer outline-none p-2.5 py-1.5 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none     h-[38px]"
              }
              name="PropertyState"
              value={(cellValue ?? "").toString()}
              onChange={(e) =>
                handleInputChange?.(columnName, e.target.value, rowIndex)
              }
            >
              {!StateCode.some((state) => state.value === cellValue) && (
                <option value="" disabled hidden>
                  Select an option
                </option>
              )}
              {/* Set the default selected option from the cellValue */}
              <option value={(cellValue ?? "").toString()}>
                {(cellValue ?? "").toString()}
              </option>

              {/* Populate other options with the values from StateCode array */}
              {StateCode.map(
                (state) =>
                  // Exclude the default selected option
                  state.value !== cellValue && (
                    <option key={state.id} value={state.value}>
                      {state.value}
                    </option>
                  )
              )}
            </select>
          </div>
        </td>
      );
    }

    if (columnName === "Remove") {
      return (
        <td
          key={cellIndex}
          className="px-2 py-2 font-normal text-xs text-gray-900 whitespace-nowrap "
        >
          <div className="cursor-pointer trash-icon" key={`${rowIndex}_cross`}>
            <FaTrash
              style={{
                height: 14,
                width: 14,
                color: "#E61818",
              }}
              onClick={() => handleCrossClick(rowIndex)}
            ></FaTrash>
          </div>
        </td>
      );
    } else if (columnName === "lateFeesDate") {
      return (
        <td
          key={cellIndex}
          className="px-2 py-4 font-normal text-xs text-gray-900 whitespace-nowrap "
        >
          <DatePicker
            selected={
              cellValue && Date.parse(cellValue as string)
                ? new Date(cellValue as string)
                : new Date()
            }
            onChange={(date: any) =>
              handleInputChange?.(columnName, date, rowIndex)
            }
            minDate={new Date("2000-12-12")}
            dateFormat="MM/dd/yyyy"
            className="peer placeholder-gray-500 outline-none p-3 block border w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
          />
        </td>
      );
    } else if (columnName === "zip") {
      return (
        <td
          key={cellIndex}
          className="px-2 py-4 font-normal text-xs text-gray-900 whitespace-nowrap "
        >
          <input
            type={"text"}
            value={cellValue as string}
            className={
              "peer outline-none p-2.5 py-1.5 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
            }
            onChange={(e) =>
              handleInputChange?.(columnName, e.target.value, rowIndex)
            }
            maxLength={5}
            onKeyDown={handlePostalCodeKeyDown}
          />
          {columnErrors[rowIndex]?.[columnName]?.map((error, index) => (
            <div key={index} className="text-red-500">
              {error.errorMessage}
            </div>
          ))}
        </td>
      );
    } else {
      return (
        <td
          key={cellIndex}
          className="px-2 py-4 font-normal text-xs text-gray-900 whitespace-nowrap "
        >
          <input
            type={"text"}
            value={cellValue as string}
            className={
              "peer outline-none p-2.5 py-1.5 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
            }
            onChange={(e) =>
              handleInputChange?.(columnName, e.target.value, rowIndex)
            }
          />
          {columnErrors[rowIndex]?.[columnName]?.map((error, index) => (
            <div key={index} className="text-red-500">
              {error.errorMessage}
            </div>
          ))}
        </td>

        // <td
        //   key={cellIndex}
        //   className="px-2 py-4 font-normal text-xs text-gray-900 whitespace-nowrap "
        // >
        //   <input
        //     type={"text"}
        //     value={cellValue as string}
        //     className="peer outline-none p-3 py-2 block border w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
        //     onChange={(e) =>
        //       handleInputChange?.(columnName, e.target.value, rowIndex)
        //     }
        //   />
        //   {cellErrors.length > 0 && (
        //     <ul className="text-red-500">
        //       {cellErrors.map((error, index) => (
        //         <li key={index}>{error}</li>
        //       ))}
        //     </ul>
        //   )}
        // </td>
      );
    }
  };
  // JSX structure for rendering the component
  return (
    <>
      <Modal
        showModal={props.importCsvPopUp}
        onClose={() => {
          props.setImportCsvPopUp(false, "");
          setSelectedLateNoticeId([]);
          setLateNotices((prev) => {
            return {
              ...prev,
              items: prev.items.map((item) => ({
                ...item,
                isChecked: false,
              })),
            };
          });
        }}
        width="max-w-5xl importCsv"
      >
        {toggleSpinner && <Spinner></Spinner>}
        <div className=" rounded-md bg-white text-left transition-all w-full py-4 px-3.5 md:p-5 m-auto">
          {showUploadCsv === true && (
            <div className="mt-2 flex w-full mb-2 md:mb-3 justify-center rounded-lg border border-dashed border-gray-900/25 p-4 md:p-6">
              <div className="text-center">
                <img
                  src={fileUpload}
                  className="mx-auto h-10 w-10 text-gray-300"
                  color="red"
                  alt="pic"
                ></img>
                <div className="mt-2 text-sm sm:text-md leading-6 text-[#2472db]">
                  <Formik initialValues={initialValues} onSubmit={() => {}}>
                    {(formik) => (
                      <Form>
                        <FormikControl
                          control="fileUpload"
                          type="file"
                          label={"Click here to upload .csv or .xlsx file"}
                          name={"UploadFile"}
                          accept={
                            ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                          }
                          showSpinner={(value: boolean) =>
                            setToggleSpinner(value)
                          }
                          onDataLoaded={(data: ICreateLateNotice[]) => {
                            try {
                              if (data.length > 0) {
                                setShowUploadCsv(false);
                                setShowEmptyRecordMessage(false);
                                setShowInvalidCSVMessage(false);
                              } else {
                                setShowUploadCsv(true);
                                setShowEmptyRecordMessage(true);
                              }
                              const formattedData = data.map(
                                (item: ICreateLateNotice) => {
                                  return {
                                    Remove: "",
                                    ...item,
                                    lateFeesDate: getDate(
                                      item.lateFeesDate.toString()
                                    ),
                                  };
                                }
                              );
                              setGridData(formattedData);
                              setToggleSpinner(false);
                            } catch (error) {
                              setShowUploadCsv(true);
                              setToggleSpinner(false);
                              setShowInvalidCSVMessage(true);
                            }
                          }}
                          onError={(error: Error) => {
                            setShowLargeCsvErrorMessage(error.message);
                          }}
                          className="sr-only"
                          filingType={"LN"}
                        />
                      </Form>
                    )}
                  </Formik>

                  <p className="w-full text-xs mt-3 text-[#2472db]">
                    <DownloadButton
                      headers={[
                        "tenant1FirstName",
                        "tenant1MiddleName",
                        "tenant1LastName",
                        "tenant2FirstName",
                        "tenant2MiddleName",
                        "tenant2LastName",
                        "tenant3FirstName",
                        "tenant3MiddleName",
                        "tenant3LastName",
                        "tenant4FirstName",
                        "tenant4MiddleName",
                        "tenant4LastName",
                        "tenant5FirstName",
                        "tenant5MiddleName",
                        "tenant5LastName",
                        "address",
                        "Unit",
                        "city",
                        "zip",
                        "state",
                        "rentDue",
                        "property",
                        "noticePeriod",
                        "otherFees",
                        "lateFees",
                        "lateFeesDate",
                        "noticeAffiantSignature",
                      ]}
                      fileName={"lateNotices"}
                      title={"Click here to download a blank template"}
                    />
                  </p>
                </div>
              </div>
            </div>
          )}
          {gridData?.length > 0 ? (
            <>
              <div className="sm:flex sm:items-start">
                <div className="my-2.5 text-center md:my-0 sm:text-left">
                  <h3
                    className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                    id="modal-title"
                  >
                    {btnTitleText}
                  </h3>
                </div>
              </div>
              <div className="preview-data">
                <Grid
                  columnHeading={[
                    "",
                    "Tenant1 First Name",
                    "Tenant1 Middle Name",
                    "Tenant1 Last Name",
                    "Tenant2 First Name",
                    "Tenant2 Middle Name",
                    "Tenant2 Last Name",
                    "Tenant3 First Name",
                    "Tenant3 Middle Name",
                    "Tenant3 Last Name",
                    "Tenant4 First Name",
                    "Tenant4 Middle Name",
                    "Tenant4 Last Name",
                    "Tenant5 First Name",
                    "Tenant5 Middle Name",
                    "Tenant5 Last Name",
                    "Address",
                    "Unit",
                    "City",
                    "Zip",
                    "State",
                    "Rent Due",
                    "Property Name",
                    "Notice Period",
                    "Other Fees",
                    "Late Fees",
                    "Late Fees Date",
                    "Notice Affiant Signature",
                  ]}
                  rows={gridData}
                  showInPopUp={true}
                  cellRenderer={(
                    data: ICreateLateNotice,
                    rowIndex: number,
                    cellIndex: number
                  ) => {
                    return cellRenderer(data, rowIndex, cellIndex);
                  }}
                ></Grid>
              </div>

              <div className="mt-1.5 flex justify-end">
                <Button
                  type="button"
                  isRounded={false}
                  title="Cancel"
                  handleClick={() => props.setImportCsvPopUp(false, "")}
                  classes="text-[13px] md:text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg "
                ></Button>
                <Button
                  type="button"
                  isRounded={false}
                  handleClick={() => {
                    if (btnTitleText === "Create Notice") {
                      handleLateNotices();
                    } else {
                      downLoadNotice();
                    }
                  }}
                  title={btnTitleText}
                  classes="text-[11px] md:text-xs bg-[#2472db] hover:bg-[#0d5ecb] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                ></Button>
              </div>
            </>
          ) : null}
          {showEmptyRecordMessage && (
            <p className="text-center text-red-500 text-sm md:text-base">
              No record found{" "}
            </p>
          )}
          {showInvalidCSVMessage && (
            <p className="text-center text-red-500 text-sm md:text-base">
              Invalid format. Please download the template and re-upload your
              records.
            </p>
          )}
          {showLargeCsvErrorMessage && (
            <p className="text-center text-red-500 text-sm md:text-base">
              {showLargeCsvErrorMessage}
            </p>
          )}

          {columnErrors.some((errors) => Object.keys(errors).length > 0) && (
            <p className="text-red-500 text-center text-sm md:text-base">
              Please validate your data
            </p>
          )}
        </div>
      </Modal>
    </>
  );
};

// Export the component as the default export
export default LateNotices_ImportCsv;
