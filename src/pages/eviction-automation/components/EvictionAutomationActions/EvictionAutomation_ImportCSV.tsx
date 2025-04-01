import React, { useState } from "react";
import * as yup from "yup";
import { Form, Formik } from "formik";
import { toast } from "react-toastify";
import { FaTrash } from "react-icons/fa";
import FormikControl from "components/formik/FormikControl";
import Grid from "components/common/grid/Grid";
import Button from "components/common/button/Button";
import Spinner from "components/common/spinner/Spinner";
import Modal from "components/common/popup/PopUp";
import DownloadButton from "components/common/button/DownloadButton";
import fileUpload from "assets/svg/file-upload.svg";
import { HttpStatusCode } from "utils/enum";
import { formatCurrency } from "utils/helper";
import { EvictionAutomationCSVHeader } from "utils/constants";
import { useEvictionAutomationContext } from "pages/eviction-automation/EvictionAutomationContext";
import EvictionAutomationService from "services/eviction-automation.service";
import { IImportCsvFieldError, IImportCsvRowError } from "interfaces/common.interface";
import { IEvictionAutomationQueueItemImportCsv } from "interfaces/eviction-automation.interface";

type EvictionAutomationImportCsvProps = {
   importCsvPopUp: boolean;
   setImportCsvPopUp: React.Dispatch<React.SetStateAction<boolean>>;
};

const validationSchema: yup.ObjectSchema<any> = yup.object({
   //    CaseNumber: yup
   //       .string()
   //       // .max(10, "Max 10 digits")
   //       .required("Case number is required"),
   //    ServiceType: yup
   //       .string()
   //       .required("Service Type is required"),
   //    PersonServed: yup.string().when('ServiceType', {
   //       is: (val: string) =>
   //          val === ServiceMethod.NOTORIOUSLY || val === ServiceMethod.PERSONALLY,
   //       then(schema) { return schema.required("This is a required field") },
   //       otherwise(schema) { return schema.optional() },
   //    }),
   //    Height: yup.string().when('ServiceType', {
   //       is: (val: string) =>
   //          val === ServiceMethod.NOTORIOUSLY || val === ServiceMethod.PERSONALLY,
   //       then(schema) { return schema.required("Height is required") },
   //       otherwise(schema) { return schema.optional() },
   //    }),
   //    Weight: yup.string().when('ServiceType', {
   //       is: (val: string) =>
   //          val === ServiceMethod.NOTORIOUSLY || val === ServiceMethod.PERSONALLY,
   //       then(schema) { return schema.required("Weight is required") },
   //       otherwise(schema) { return schema.optional() },
   //    }),
   //    Age: yup.string().when('ServiceType', {
   //       is: (val: string) =>
   //          val === ServiceMethod.NOTORIOUSLY || val === ServiceMethod.PERSONALLY,
   //       then(schema) { return schema.required("Age is required") },
   //       otherwise(schema) { return schema.optional() },
   //    }),
   //    ServiceNotes: yup.string().when('ServiceType', {
   //       is: ServiceMethod.NON_EST,
   //       then(schema) { return schema.required("Service notes is required") },
   //       otherwise(schema) { return schema.optional() },
   //    })
});


const EvictionAutomation_ImportCsv = (props: EvictionAutomationImportCsvProps) => {
   const {
      getEvictionAutomationQueue
   } = useEvictionAutomationContext();
   const initialValues = { UploadFile: "" };
   const [gridData, setGridData] = useState<IEvictionAutomationQueueItemImportCsv[]>([]);
   const [showUploadCsv, setShowUploadCsv] = useState<boolean>(true);
   const [showEmptyRecordMessage, setShowEmptyRecordMessage] = useState<boolean>(false);
   const [columnErrors, setColumnErrors] = useState<
      Record<string, { rowIndex: number; errorMessage: string }[]>[]
   >([]);
   const [rowErrors, setRowErrors] = useState<IImportCsvRowError[]>([]);
   const [showInvalidCSVMessage, setShowInvalidCSVMessage] = useState<boolean>(false);
   const [showMaxRecords, setShowMaxRecords] = useState<boolean>(false);
   const [toggleSpinner, setToggleSpinner] = useState<boolean>(false);
   const [totalRecord, setTotalRecord] = useState<number>(0);
   const [nameMismatchError, setNameMismatchError] = useState<string | null>("");

   const formatDataForServerCaseInfo = (gridData: IEvictionAutomationQueueItemImportCsv[]) => {
      const requestData: IEvictionAutomationQueueItemImportCsv[] = gridData.map((item) => ({
         ...item,
         Expedited: item.Expedited ? true : false,
         StateCourt: item.StateCourt ? true : false,
         MinimumFilingAmount: parseFloat(item.MinimumFilingAmount as string),
         FilingThresholdAdjustment: parseFloat(item.FilingThresholdAdjustment as string),
         DaysToFileAfterNoticeDelivery: parseInt(item.DaysToFileAfterNoticeDelivery as string),
         EvictionFilingDay: parseInt(item.EvictionFilingDay as string),
      }));

      return requestData;
   };

   const handleImportCaseInfo = async () => {
      const errors: Record<string, { rowIndex: number; errorMessage: string }[]>[] = [];
      const rowErrors: IImportCsvRowError[] = [];

      gridData.forEach((record, index: number) => {
         const recordErrors: Record<string, { rowIndex: number; errorMessage: string }[]> = {};
         const fields: IImportCsvFieldError[] = [];

         try {
            validationSchema.validateSync(record, { abortEarly: false });
         } catch (error: any) {
            if (error.inner) {
               error.inner.forEach((detailError: any) => {
                  const propertyName = detailError.path || "unknown";
                  const errorMessage = `${detailError.message}`;
                  // const rowIndex = detailError?.rowIndex ?? -1;
                  const rowIndex = index;

                  fields.push({
                     fieldName: propertyName,
                     message: errorMessage,
                  });

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

         rowErrors.push({
            rowIndex: index, // here index is rowIndex
            fields: fields,
         });

      });

      setRowErrors(rowErrors);
      setColumnErrors(errors);

      if (errors.length === 0) {
         await importCaseInformation();
      }
   };

   const importCaseInformation = async () => {

      try {
         setToggleSpinner(true);
         //  setGridData(prevGridData => (
         //     prevGridData.map(item => ({
         //       ...item,
         //       Expedited: item.Expedited?true:false,
         //       StateCourt:item.StateCourt?true:false,
         //       MinimumFilingAmount:parseFloat(item.MinimumFilingAmount as string),
         //       FilingThresholdAdjustment:parseFloat(item.FilingThresholdAdjustment as string),
         //       DaysToFileAfterNoticeDelivery:parseInt(item.DaysToFileAfterNoticeDelivery as string),
         //       EvictionFilingDay:parseInt(item.EvictionFilingDay as string),

         //     }))
         //   ));
         const formattedData = formatDataForServerCaseInfo(gridData);
         const response = await EvictionAutomationService.addEvictionAutomation(formattedData);

         if (response.status === HttpStatusCode.OK) {
            toast.success("Eviction automation imported successfully");
            props.setImportCsvPopUp(false);
            getEvictionAutomationQueue(1, 100);
         } else {
            console.error("Failed to add the eviction automation data.");
         }
      } catch (error) {
         console.error("An error occurred:", error);
      } finally {
         setToggleSpinner(false);
      }
   };

   /**
    *  handle cross click
    */
   const handleCrossClick = (rowIndex: number) => {
      let filteredRecords = gridData.filter((_, index) => index !== rowIndex);
      const newColumnErrors = [...columnErrors];
      newColumnErrors.splice(rowIndex, 1);
      setColumnErrors(newColumnErrors);
      // Set the updated array to the state or wherever you store the data
      setTotalRecord(filteredRecords.length);
      setGridData(filteredRecords);
   };

   /**
    *  * setting updated value in the editable grid
    * @param columnName editable column name
    * @param updatedBValue updated value in the text box
    * @param selectedRowIndex selected row
    */
   const handleInputChange = (
      columnName: string,
      updatedBValue: string | boolean,
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
      console.log(gridData);

      setNameMismatchError(null);
   };

   const validateRow = (row: IEvictionAutomationQueueItemImportCsv, rowIndex: number) => {
      const recordErrors: Record<string, { rowIndex: number; errorMessage: string }[]> = {};
      const fields: IImportCsvFieldError[] = [];
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

               fields.push({
                  fieldName: propertyName,
                  message: errorMessage,
               });

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

      // Update row errors for the specific row
      setRowErrors((prevErrors) => {
         const updatedRowErrors = [...prevErrors];
         updatedRowErrors[rowIndex] = { rowIndex, fields };
         return updatedRowErrors;
      });

      // If there are errors for the record, update the columnErrors state
      setColumnErrors((prevErrors) => [
         ...prevErrors.slice(0, rowIndex),
         recordErrors,
         ...prevErrors.slice(rowIndex + 1),
      ]);
   };



   /**
    *
    * @param data imported data from csv
    */
   const loadUserData = (data: IEvictionAutomationQueueItemImportCsv[]) => {
      try {
         if (data.length === 0) {
            setShowUploadCsv(true);
            setToggleSpinner(false);
            setShowEmptyRecordMessage(true);
            return;
         }
         setTotalRecord(data.length);
         setShowUploadCsv(false);
         setShowEmptyRecordMessage(false);
         setShowInvalidCSVMessage(false);

         const formattedData = data.map((item: IEvictionAutomationQueueItemImportCsv) => {

            return {
               Remove: "",
               ...item,
               //    ServiceFee: item.ServiceFee.replace(/\s/g, '').replace('$', ''),
               //    DateScanned: formatDate(item.DateScanned as string),
               //    ServiceDate: formatDate(item.ServiceDate as string),
               //    ServiceType: getEvictionServiceMethod(item.ServiceType) ?? ""
            };
         });

         setGridData(formattedData);
         setToggleSpinner(false);
      } catch (error) {
         setShowUploadCsv(true);
         setToggleSpinner(false);
         setShowInvalidCSVMessage(true);
      }
   };

   const getFieldsErrorMessages = (rowIndex: number, propertyName: string) => {
      const errorMessages: string[] = [];
      rowErrors.filter((error) => {
         if (!error.fields.length) return null;
         if (error.rowIndex === rowIndex && error.fields.length) {
            error.fields.forEach((f) => {
               if (f.fieldName === propertyName) {
                  errorMessages.push(f.message);
               }
            });
         }
      });

      return errorMessages;
   };

   const handleFileUpload = (data: IEvictionAutomationQueueItemImportCsv[]) => {
      if (data.length === 0) {
         setToggleSpinner(false);
         toast.error("The uploaded file is empty. Please make sure the file is not empty and try again.");
         return;
      }
      const keys = Object.keys(data[0]);
      const headerMatches = keys.every((key) =>
         EvictionAutomationCSVHeader.includes(key)
      );

      if (headerMatches && EvictionAutomationCSVHeader.length === keys?.length) {
         loadUserData(data);
      } else {
         setToggleSpinner(false);
         toast.error(
            "The uploaded file header does not match. Please download the template, and try uploading again."
         );
      }
   };

   const handleFileUploadError = (error: Error) => {
      if (error.message === "File size exceeds the maximum allowed size.") {
         setShowMaxRecords(true);
      } else {
         setShowMaxRecords(false);
      }
      setToggleSpinner(false);
   };

   const resetSelectedRows = () => {
      //setSelectedProcessServerId([]);
      //   setProcessServerCases((prev) => {
      //      return {
      //         ...prev,
      //         items: prev.items.map((item) => ({
      //            ...item,
      //            isChecked: false,
      //         })),
      //      };
      //   });
   };

   const handleCellRendered = (data: IEvictionAutomationQueueItemImportCsv, rowIndex: number, cellIndex: number) => {

      const columnNames = Object.keys(data);
      const columnName = columnNames[cellIndex];
      const cellValue = data[columnName as keyof IEvictionAutomationQueueItemImportCsv];
      //   const isServiceTypePersonalOrNotorious = data.ServiceType === ServiceMethod.PERSONALLY || data.ServiceType === ServiceMethod.NOTORIOUSLY;

      if (columnName === "Remove") {
         return (
            <td
               key={cellIndex}
               className="px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap "
            >
               <div
                  className="cursor-pointer trash-icon"
                  key={`${rowIndex}_cross`}
               >
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
      }
      else if (columnName === 'PrescreenSignEmail' || columnName === 'Disabled' || columnName === 'UnitsUsePropertyAddress' || columnName === 'NoticesRequired' || columnName === 'AllowMultipleImports') {
         return (
            <td
               key={cellIndex}
               className="px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap "
            >
               <div className="editRowCheckbox">
                  <input
                     type={"checkbox"}
                     name={columnName}
                     className="!w-3.5 !h-3.5 cursor-pointer"
                     onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handleInputChange(columnName, !(cellValue as boolean), rowIndex)
                     }
                     checked={cellValue as boolean ?? false}
                  /></div>
            </td>
         );
      }

      else {
         return (
            <td
               key={cellIndex}
               className="px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap "
            >
               <input
                  type={"text"}
                  value={
                     typeof cellValue === "number"
                        ? formatCurrency(cellValue)
                        : (cellValue as any)
                  }
                  className={
                     `peer outline-none p-2 py-1 block border w-full rounded-md text-[10.5px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px] ${columnName === "Expedited" ? "font-bold" : ""}`
                  }
                  onChange={(e) =>
                     handleInputChange?.(
                        columnName,
                        e.target.value,
                        rowIndex
                     )
                  }
               />
               {getFieldsErrorMessages(rowIndex, columnName).map(
                  (message, index) => (
                     <div
                        key={index}
                        className="text-red-500 whitespace-normal"
                     >
                        {message}
                     </div>
                  )
               )}
            </td>
         );
      }
   };

   return (
      <>
         <Modal
            showModal={props.importCsvPopUp}
            onClose={() => {
               props.setImportCsvPopUp(false);
               resetSelectedRows();
            }}
            width="max-w-5xl importCsv"
         >
            {toggleSpinner && <Spinner></Spinner>}

            <div className="rounded-md bg-white text-left transition-all w-full py-4 px-3.5 md:p-5 m-auto">
               {(showUploadCsv === true || totalRecord == 0) && (
                  <div className="flex w-full my-1.5 md:my-2 justify-center rounded-md border border-dashed border-gray-900/25 px-3.5 py-3.5 md:px-5 md:py-5">
                     <div className="text-center">
                        <img
                           src={fileUpload}
                           className="mx-auto h-10 w-10 text-gray-300"
                           color="red"
                        ></img>
                        <div className="mt-1.5 text-xs leading-5 text-[#2472db]">
                           <Formik initialValues={initialValues} onSubmit={() => { }}>
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
                                       onDataLoaded={handleFileUpload}
                                       onError={(error: Error) => handleFileUploadError(error)}
                                       className="sr-only"
                                    />
                                 </Form>
                              )}
                           </Formik>

                           <p className="w-full text-xs mt-3 text-[#2472db]">
                              <DownloadButton
                                 headers={EvictionAutomationCSVHeader}
                                 fileName={"EvictionAutomation"}
                                 title={"Click here to download a blank template"}
                              />
                           </p>
                        </div>
                     </div>
                  </div>
               )}
               {(gridData?.length > 0) ? (
                  <>
                     <div className="sm:flex sm:items-start">
                        <div className="mt-2.5 text-center sm:mt-0 sm:text-left">
                           <h3
                              className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                              id="modal-title"
                           >
                              Preview
                           </h3>
                        </div>
                     </div>
                     <div className="preview-data">
                        <Grid
                           columnHeading={[
                              "",
                              "Company",
                              "EvictionAffiantIs",
                              "AndAllOtherOccupants",
                              "AllowMultipleImports",
                              "AttorneyBarNo",
                              "AttorneyEmail",
                              "AttorneyName",
                              "BccEmails",
                              "CcEmails",
                              "TenantAddressConfig",
                              "ConfirmReportEmail",
                              "County",
                              "DaysToFileAfterNoticeDelivery",
                              "Disabled",
                              "DismissalNotificationDay",
                              "Expedited",
                              "FilerBusinessName",
                              "EvictionFilerEmail",
                              "EvictionFilingDay",
                              "FilingThresholdAdjustment",
                              "MinimumFilingAmount",
                              "Notes",
                              "NoticesRequired",
                              "OwnerId",
                              "OwnerName",
                              "PrescreenConfirmEmail",
                              "ProcessServer",
                              "PropertyAddress",
                              "PropertyCity",
                              "PropertyEmail",
                              "PropertyId",
                              "PropertyName",
                              "PropertyPhone",
                              "PropertyState",
                              "PropertyStreetNo",
                              "PropertyZip",
                              "PrescreenSignEmail",
                              "SignerEmail",
                              "StateCourt",
                              "UnitsUsePropertyAddress",
                              "ConfirmationPin",
                              "OwnerAddress",
                              "OwnerCity",
                              "OwnerState",
                              "OwnerZip",
                              "OwnerEmail",
                              "OwnerPhone",
                           ]}
                           rows={gridData}
                           showInPopUp={true}
                           cellRenderer={(
                              data: IEvictionAutomationQueueItemImportCsv,
                              rowIndex: number,
                              cellIndex: number
                           ) => handleCellRendered(data, rowIndex, cellIndex)}
                        ></Grid>
                     </div>
                     <div className="text-center mt-3">
                        <span className="text-[#E61818]">
                           {nameMismatchError}
                        </span>
                     </div>
                     <div className="flex items-center justify-between mt-3.5">
                        <div className="text-xs sm:text-sm font-semibold text-slate-900">
                           Total No. of Records : {totalRecord}
                        </div>
                        <div className="mt-1.5 flex justify-end">
                           <Button
                              type="button"
                              isRounded={false}
                              title="Cancel"
                              handleClick={() => props.setImportCsvPopUp(false)}
                              classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2.5 px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                           ></Button>
                           <Button
                              type="button"
                              isRounded={false}
                              handleClick={handleImportCaseInfo}
                              title="Confirm"
                              disabled={toggleSpinner}
                              classes="text-xs bg-[#2472db] hover:bg-[#0d5ecb] inline-flex justify-center items-center rounded-md font-semibold py-2.5 px-5 text-white"
                           ></Button>
                        </div>
                     </div>
                  </>
               ) : null}
               {showEmptyRecordMessage && (
                  <p className="text-center text-red-500	">No record found </p>
               )}
               {showInvalidCSVMessage && (
                  <p className="text-center text-red-500	">
                     Invalid format. Please download the template and re-upload your
                     records.
                  </p>
               )}
               {showMaxRecords && (
                  <p className="text-center text-red-500	">
                     File size exceeds the maximum allowed size.
                  </p>
               )}
               {columnErrors.some((errors) => Object.keys(errors).length > 0) && (
                  <p className="text-red-500 text-center">
                     Please validate your data
                  </p>
               )}
            </div>
         </Modal>
      </>
   );
};

export default EvictionAutomation_ImportCsv;
