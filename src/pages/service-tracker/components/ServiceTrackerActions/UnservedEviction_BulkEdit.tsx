import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css";
import Grid from "components/common/grid/GridWithToolTip";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import Spinner from "components/common/spinner/Spinner";
import GridCheckbox from "components/formik/GridCheckBox";
import { IGridHeader } from "interfaces/grid-interface";
import { IImportCsvFieldError, IImportCsvRowError } from "interfaces/common.interface";
import { formatZip, toCssClassName } from "utils/helper";
import FileEvictionService from "services/file-evictions.service";
import { useServiceTrackerContext } from "pages/service-tracker/ServiceTrackerContext";
import { IUnservedQueueItems } from "interfaces/service-tracker.interface";
import ServiceTrackerService from "services/service-tracker.service";
import { ITenant } from "interfaces/all-cases.interface";

type UnservedEvictionBulkEditProps = {
   showFileEvictionPopup: boolean;
   handleClose: () => void;
   activeTab?: string;
};

const initialColumnMapping: IGridHeader[] = [
   {
      columnName: "isChecked",
      label: "Bulk Edit",
      controlType: "checkbox",
      toolTipInfo: "This checkbox represents bulk update only",
   },
   // { columnName: "caseNo", label: "CaseNo" },
   { columnName: "county", label: "County" },
   { columnName: "propertyName", label: "PropertyName" },
   { columnName: "tenantOne", label: "TenantOne" },
   { columnName: "serverIssuesRemarks", label: "ServerIssuesRemarks" },
];

const UnservedEviction_BulkEdit = (props: UnservedEvictionBulkEditProps) => {

   const { unservedQueue, getUnservedQueue,setShowSpinner,
    showSpinner, setSelectedServiceTrackerId, 
    unservedQueueBulkRecords,
    unservedQueueFilteredRecords,
    setUnservedQueueFilteredRecords,
    unservedAmendment,
    getAllUnservedAmendment,
    setUnservedQueueBulkRecords, selectedServiceTrackerId,setSelectedFilteredServiceTrackerId } =
     useServiceTrackerContext();

   const validationSchema = yup.object({
    //   Tenant1First: yup
    //      .string()
    //      .required("Please enter tenant1 first name.")
    //      .max(50, "Tenant1 first name must not exceed 50 characters."),
   });

   const [showConfirm, setShowConfirm] = useState<boolean>(false);
   const [visibleColumns] =
      useState<IGridHeader[]>(initialColumnMapping);
   const [selectAll, setSelectAll] = useState<boolean>(false);
   // const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
   //   Array(signedWrits.items?.length).fill(false)
   // );
   const [columnErrors, setColumnErrors] = useState<
      Record<string, { rowIndex: number; errorMessage: string }[]>[]
   >([]);

   const [rowErrors, setRowErrors] = useState<IImportCsvRowError[]>([]);
   // const [selectAll, setSelectAll] = useState<boolean>(false);
   const [selectFilteredAll, setSelectFilteredAll] = useState<boolean>(false);

   const [selectedFilteredRows, setSelectedFilteredRows] = useState<
      Array<boolean>
   >(Array(unservedQueueFilteredRecords?.length).fill(false));

   const [lastClickedFilteredRowIndex, setLastClickedFilteredRowIndex] =
      useState<number>(-1);
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);

   const [newSelectedRows] = useState<boolean[]>([]);

   useEffect(() => {
      const records = unservedQueueBulkRecords.filter((item) =>
        selectedServiceTrackerId.includes(item.taskId || "")
      );
      setUnservedQueueFilteredRecords(records);
      setSelectedFilteredRows(Array(unservedQueueFilteredRecords?.length).fill(false));
      setSelectFilteredAll(false);

      const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === "Shift") {
            setShiftKeyPressed(true);
         }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
         if (e.key === "Shift") {
            // Reset selected rows to the top (index 0)
            setShiftKeyPressed(false);
         }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      return () => {
         window.removeEventListener("keydown", handleKeyDown);
         window.removeEventListener("keyup", handleKeyUp);
      };
   }, []);


   // Update handleInputChange to use the validateField function
   const handleInputChange = async (
      columnName: string,
      updatedValue: string | boolean,
      selectedRowIndex: number
   ) => {
      // If any row is selected, perform bulk update
      if (selectedFilteredRows[selectedRowIndex]) {
        setUnservedQueueFilteredRecords((prevRows) =>
            prevRows.map((row, rowIndex) => {
               if (
                  selectedFilteredRows[rowIndex] ===
                  selectedFilteredRows[selectedRowIndex]
               ) {
                  // If the row is selected, update the specified column
                  const updatedRow = {
                     ...row,
                     [columnName]: updatedValue,
                  };
                  // Perform validation for the updated row
                  validateRow(updatedRow, rowIndex);
                  return updatedRow;
               } else {
                  // If the row is not selected, return the original row
                  return row;
               }
            })
         );
      } else {
         // If no row is selected, update only the selected row
         setUnservedQueueFilteredRecords((prevRows) =>
            prevRows.map((row, rowIndex) => {
               const updatedRow =
                  rowIndex === selectedRowIndex
                     ? {
                        ...row,
                        [columnName]: updatedValue,
                     }
                     : row;
               // Perform validation for the updated row
               validateRow(updatedRow, rowIndex);
               return updatedRow;
            })
         );
      }
   };

   const validateRow = (row: IUnservedQueueItems, rowIndex: number) => {
      const recordErrors: Record<
         string,
         { rowIndex: number; errorMessage: string }[]
      > = {};
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

   const handleCheckBoxChange = (index: number, checked: boolean) => {
      if (
         shiftKeyPressed &&
         lastClickedFilteredRowIndex !== -1 &&
         unservedQueueFilteredRecords
      ) {
         const start = Math.min(index, lastClickedFilteredRowIndex);
         const end = Math.max(index, lastClickedFilteredRowIndex);
         setSelectedFilteredRows(
            Array.from({ length: end + 1 }, (_, i) =>
               i >= start && i <= end
                  ? (selectedFilteredRows[i] = true)
                  : newSelectedRows[i]
            )
         );
         setSelectedFilteredRows(selectedFilteredRows);
         const selectedIds = (unservedQueueFilteredRecords || [])
            .filter((_, rowIndex) => selectedFilteredRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");
            setSelectedFilteredServiceTrackerId(selectedIds);
      } else {
         const updatedSelectedRows = [...selectedFilteredRows];
         updatedSelectedRows[index] = checked;
         setSelectedFilteredRows(updatedSelectedRows);
         if (
            unservedQueueFilteredRecords.length ===
            updatedSelectedRows.filter((item) => item).length
         ) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }
         const selectedIds = (unservedQueueFilteredRecords || [])
            .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

            setSelectedFilteredServiceTrackerId(selectedIds);
      }
      setLastClickedFilteredRowIndex(index);
   };

   const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectAll;
      const allIds: string[] = unservedQueueFilteredRecords
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
        setSelectedFilteredServiceTrackerId(allIds);
      } else {
        setSelectedFilteredServiceTrackerId([]);
      }

      setSelectAll((prevSelectAll) => {
         // Update selectedRows state
         setSelectedFilteredRows(Array(allIds.length).fill(newSelectAll));
         return newSelectAll;
      });
   };

   const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
      <span> `{tenant?.firstName ?? ''} {tenant?.middleName ?? ""} {tenant?.lastName ?? ''}` </span>
   );
   /**
    * Render each cell of a table
    * @param cellIndex  : cell of table
    * @param data  :data of cell
    * @param rowIndex : row index
    * @returns render cell
    */
   const handleCellRendered = (
      cellIndex: number,
      data: IUnservedQueueItems,
      rowIndex: number
   ) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         caseNo: () => <span>{cellValue ?? ""}</span>,
         county: () => <span>{cellValue ?? ""}</span>,
         propertyName: () => <span>{cellValue ?? ""}</span>,
         tenantOne: () => formattedTenantFullName(data?.tenantNames[0]),
        serverIssuesRemarks: () => (
            <>
               <input
                  type={"text"}
                  value={cellValue as string}
                  className={
                     "peer outline-none p-2 py-1 block border rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]"
                  }
                  onChange={(e) =>
                     handleInputChange?.(propertyName, e.target.value, rowIndex)
                  }
                  // maxLength={5}
                  // onKeyDown={handlePostalCodeKeyDown}
               />
               {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
                  <div key={index} className="text-red-500">
                     {error.errorMessage}
                  </div>
               ))}
            </>
         ),
         isChecked: () => (
            <div className="selectRowCheckbox">
               <GridCheckbox
                  checked={selectedFilteredRows[rowIndex]}
                  onChange={(checked: boolean) =>
                     handleCheckBoxChange(rowIndex, checked)
                  }
                  label=""
               />
            </div>
         ),
      };

      const renderer =
         renderers[propertyName] ||
         (() => formattedCell(cellValue, columnName, propertyName, rowIndex));

      if (visibleColumns.find((x) => x.label === columnName)) {
         return (
            <td
               key={cellIndex}
               className={`px-1.5 py-2 md:py-2.5 font-normal text-[10.3px] md:text-[11px] text-[#2a2929]  ${toCssClassName(columnName)}`}
            >
               {renderer()}
            </td>
         );
      }
      return <></>;
   };

   const handleSubmit = async () => {
      try {
         var data = unservedQueueFilteredRecords.map((item) => ({
            ...item,
            serverIssuesRemarks: item.serverIssuesRemarks,
         }));
         var status = props.activeTab == "Unserved Evictions"?"Eviction":props.activeTab == "Unserved Amendments" ? "Amendment":"";
         setShowSpinner(true);
         const response = await ServiceTrackerService.editUnservedEviction(data,status);
         if (response.status === HttpStatusCode.Ok) {
            // Display a success toast message
            if(props.activeTab == "Unserved Evictions")
            {
            toast.success("Unserved Eviction info successfully updated.");
            getUnservedQueue(1, 100,unservedQueue.searchParam);
            }
            else
            {
                toast.success("Unserved Amendment info successfully updated.");
                getAllUnservedAmendment(1, 100,unservedAmendment.searchParam);
            }

            setUnservedQueueFilteredRecords([]);
            setSelectAll(false);
            setSelectedServiceTrackerId([]);
            setUnservedQueueBulkRecords([]);

            // getUnservedQueue(1, 100,unservedQueue.searchParam);

            // Close the popup
            props.handleClose();
         } else {
            setShowConfirm(false);
         }
      } finally {
      }
   };

   const handleConfirmModalClose = () => {
      setShowConfirm(false);
   };

   const handleModalClose = () => {
      props.handleClose();
   };

   const getFieldsErrorMessages = (rowIndex: number, propertyName: string) => {
      const errorMessages: string[] = [];
      rowErrors.filter((error) => {
         if (!error.fields.length) return null;
         if (error.rowIndex === rowIndex && error.fields.length) {
            error.fields.forEach((f) => {
               if (f.fieldName.toLowerCase() === propertyName.toLowerCase()) {
                  errorMessages.push(f.message);
               }
            });
         }
      });

      return errorMessages;
   };

   const formattedCell = (
      value: any,
      columnName: any,
      propertyName: any,
      rowIndex: number
   ) => {
      //console.log(fieldName, " fieldname ");
      return (
         <>
            <input
               type={"text"}
               value={value as string}
               name={columnName}
               className={
                  "peer outline-none p-2.5 py-1.5 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
               }
               onChange={(e) =>
                  handleInputChange?.(propertyName, e.target.value, rowIndex)
               }
            />
            {/* {columnErrors[rowIndex]?.[fieldName]?.map((error, index) => (
               <div key={index} className="text-red-500">
                  {error.errorMessage}
               </div>
            ))} */}
             {getFieldsErrorMessages(rowIndex, propertyName).map(
                  (message, index) => (
                     <div
                        key={index}
                        className="text-red-500 whitespace-normal"
                     >
                        {message}
                     </div>
                  )
               )}
         </>
      );
   };

   return (
      <>
         <Modal
            showModal={props.showFileEvictionPopup}
            onClose={handleModalClose}
            width="max-w-5xl bulkEditModal"
         >
            {showSpinner && <Spinner />}
            {/* Container for the content */}
            <div id="fullPageContent">
               <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
                  <div className="sm:flex sm:items-start">
                     <div className="text-center sm:text-left">
                        <h3
                           className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                           id="modal-title"
                        >
                           Edit Unserved Queue
                        </h3>
                     </div>
                  </div>

                  {/* Display the grid*/}
                  <div className="relative pt-2 writlabor-writofpossession-grid">
                     <Grid 
                        columnHeading={visibleColumns}
                        rows={unservedQueueFilteredRecords}
                        handleSelectAllChange={handleSelectAllChange}
                        selectAll={selectAll}
                        showInPopUp={true}
                        cellRenderer={(
                           data: IUnservedQueueItems,
                           rowIndex: number,
                           cellIndex: number
                        ) => {
                           return handleCellRendered(cellIndex, data, rowIndex);
                        }}
                     ></Grid>
                     <div className="py-2.5 flex justify-between mt-1.5 items-center">
                        <p className="font-semibold text-[10px] md:text-xs">
                           Total records: {selectedServiceTrackerId.length}
                        </p>

                        <Button
                           handleClick={() => {
                              if (
                                 columnErrors.length === 0 ||
                                 columnErrors.every(
                                    (errors) => Object.keys(errors).length === 0
                                 )
                              )
                                 setShowConfirm(true);
                           }}
                           title="Save"
                           isRounded={false}
                           type={"button"}
                        ></Button>
                     </div>
                  </div>
                  {columnErrors.some((errors) => Object.keys(errors).length > 0) && (
                     <p className="text-red-500 text-center">
                        Please validate your data
                     </p>
                  )}
               </div>
            </div>
         </Modal>
         <div>
            <Modal
               showModal={showConfirm}
               onClose={handleConfirmModalClose}
               width="max-w-md"
            >
               {showSpinner && <Spinner />}
               {/* Container for the content */}
               <div id="fullPageContent">
                  <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
                     <div className="text-center pr-4 sm:text-left">
                        <h3
                           className="text-sm font-semibold leading-5 text-gray-900"
                           id="modal-title"
                        >
                           Are you sure you want to update the Unserved Queue ?
                        </h3>
                     </div>
                  </div>
                  <div className="flex justify-end m-2">
                     <Button
                        type="button"
                        isRounded={false}
                        title="No"
                        handleClick={handleConfirmModalClose}
                        classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg "
                     ></Button>
                     <Button
                        handleClick={() => handleSubmit()}
                        title="Yes"
                        isRounded={false}
                        type={"button"}
                        classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                     ></Button>
                  </div>
               </div>
            </Modal>
         </div>
      </>
   );
};

export default UnservedEviction_BulkEdit;
