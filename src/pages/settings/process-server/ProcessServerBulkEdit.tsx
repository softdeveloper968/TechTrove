import React, { useState, useEffect } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import Modal from "components/common/popup/PopUp";
import GridCheckbox from "components/formik/GridCheckBox";
import Grid from "components/common/grid/GridWithToolTip";
import Button from "components/common/button/Button";
import { useProcessServerContext } from "./ProcessServerContext";
import { IGridHeader } from "interfaces/grid-interface";
import { IProcessServerUpdateRequest, IProcessServerUserItem, ISelectOptions } from "interfaces/process-server.interface";
import { StateCode } from "utils/constants";
import ProcessServerService from "services/process-server.service";
import arrow from "assets/images/select_arrow.png";
import { toCssClassName } from "utils/helper";

type ProcessServerBulkEditProps = {
   open: boolean;
   setOpen: (open: boolean) => void;
   selectedIds: string[];
   setSelectedIds: (ids: string[]) => void;
};

const validationSchema = yup.object({
   county: yup
      .string()
      .required("Please enter county"),
   state: yup
      .string()
      .required("Please select state"),
   zip: yup
      .string()
      .required("Please enter Zip code.")
      .min(5, "Zip code must be 5 digits.")
      .max(5, "Zip code must be 5 digits."),
});

const initialColumnMapping: IGridHeader[] = [
   { columnName: "isChecked", label: "Bulk Edit", controlType: "checkbox", toolTipInfo: "This checkbox represents bulk update only" },
   { columnName: "email", label: "ProcessServerEmail", className: "gridHeaderEmail" },
   { columnName: "county", label: "County" },
   { columnName: "state", label: "State" },
   { columnName: "zip", label: "Zip" },
   { columnName: "city", label: "City" },
   { columnName: "alternateCity", label: "AlternateCity" },
];

const ProcessServerBulkEdit = (props: ProcessServerBulkEditProps) => {
   const { open, setOpen, selectedIds, setSelectedIds } = props;
   const {
      showSpinner,
      setShowSpinner,
      processServerUsers,
      getProcessServerUsers,
      processServers,
      setProcessServers,
      getProcessServers,
      selectedProcessServerIds,
      setSelectedProcessServerIds,
      bulkRecords,
      setBulkRecords,
      filteredRecords,
      setFilteredRecords
   } = useProcessServerContext();
   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   // const [filteredRecords, setFilteredRecords] = useState<IProcessServerUserItem[]>(
   //    processServers.items.filter((item) => selectedIds.includes(item.id))
   // );
   const [selectAll, setSelectAll] = useState<boolean>(false);
   // const [selectedProcessServerIds, setSelectedProcessServerIds] = useState<string[]>([]);
   const [newRowsSelected] = useState<boolean[]>([]);
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
      Array(processServers.items.length).fill(false)
   );
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [lastClickedFilteredRowIndex, setLastClickedFilteredRowIndex] = useState<number>(-1);

   const [showErrors, setShowErrors] = useState(false);
   const [columnErrors, setColumnErrors] = useState<Record<string, { rowIndex: number; errorMessage: string }[]>[]>([]);
   const [processServerUserOptions, setProcessServerUserOptions] = useState<ISelectOptions[]>([]);

   useEffect(() => {
      const processServerUserOptions = processServerUsers.map((item) => {
         return {
            id: item.id,
            value: item.email
         } as ISelectOptions
      });

      setProcessServerUserOptions(processServerUserOptions);

   }, [processServerUsers]);

   useEffect(() => {
      console.log(bulkRecords);
      let uniqueRecords: { [key: string]: any } = {};
      let records = bulkRecords.filter((item) => {
         const id = item.id || "";
         if (!selectedIds.includes(id) || uniqueRecords[id]) {
            return false;
         }
         uniqueRecords[id] = true;
         return true;
      });
      setFilteredRecords(records);
      setSelectAll(false);
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

   const handleSelectAllChange = (checked: boolean) => {
      const selectedAll = !selectAll;
      const allIds: string[] = processServers.items
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         setSelectedProcessServerIds(allIds);
      } else {
         setSelectedProcessServerIds([]);
      }

      setSelectAll((prev) => {
         // Update selectedRows state
         setSelectedRows(Array(allIds.length).fill(selectedAll));
         return selectedAll;
      });
   };

   const handleCheckboxChange = (index: number, checked: boolean) => {
      if (shiftKeyPressed && lastClickedFilteredRowIndex !== -1 && processServers.items) {
         const start = Math.min(index, lastClickedFilteredRowIndex);
         const end = Math.max(index, lastClickedFilteredRowIndex);
         setSelectedRows(Array.from({ length: end + 1 }, (_, i) =>
            i >= start && i <= end ? selectedRows[i] = true : newRowsSelected[i]
         ));
         setSelectedRows(selectedRows);
         const selectedIds = (processServers.items || [])
            .filter((_, rowIndex) => selectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         setSelectedProcessServerIds(selectedIds);
      }
      else {
         const updatedSelectedRows = [...selectedRows];
         updatedSelectedRows[index] = checked;
         setSelectedRows(updatedSelectedRows);

         if (processServers.items.length === updatedSelectedRows.filter(item => item).length) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         };

         const selectedIds = (processServers.items || [])
            .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         setSelectedProcessServerIds(selectedIds);
      }
      setLastClickedFilteredRowIndex(index);
   };

   const handleModalClose = () => {
      //setSelectedIds([]);
      setOpen(false)
   };

   const validateRow = (row: IProcessServerUserItem, rowIndex: number) => {
      const recordErrors: Record<string, { rowIndex: number; errorMessage: string }[]> = {};

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

   const handleInputChange = async (
      columnName: string,
      updatedValue: string,
      selectedRowIndex: number
   ) => {
      const updateRow = (row: IProcessServerUserItem, index: number) => {
         const updatedRow = { ...row, [columnName]: updatedValue };
         validateRow(updatedRow, index);
         return updatedRow;
      };

      setFilteredRecords((prevRows) =>
         prevRows.map((row, rowIndex) => {
            if (selectedRows[rowIndex] && selectedRows[rowIndex] === selectedRows[selectedRowIndex]) {
               return updateRow(row, rowIndex);
            } else if (!selectedRows[rowIndex] && rowIndex === selectedRowIndex) {
               return updateRow(row, rowIndex);
            } else {
               return row;
            }
         })
      );
   };

   const handleDropdownChange = (
      event: React.ChangeEvent<HTMLSelectElement>,
      rowId: string | undefined | null,
      selectedRowIndex: number,
      dropdownType: string  // Add dropdownType as a parameter
   ) => {
      try {
         
         setShowSpinner(true);
         const selectedOption = event.target.value as string;

         let emailAddress = '';

         if (dropdownType === "userId") {
            // Get the selected option element
            const selectedOptionElement = event.target.selectedOptions[0];
            // Extract the email address from the innerText of the option element
            emailAddress = selectedOptionElement.innerText;
         }

         const updateRow = (row: IProcessServerUserItem, index: number) => {
            const updatedRow = { ...row, [dropdownType]: selectedOption };
            if (dropdownType === "userId") {
               updatedRow.email = emailAddress; // Set the email address if dropdownType is "userId"
            }
            validateRow(updatedRow, index);
            return updatedRow;
         };

         setFilteredRecords((prevRows) =>
            prevRows.map((row, rowIndex) => {
               if (selectedRows[rowIndex] && selectedRows[rowIndex] === selectedRows[selectedRowIndex]) {
                  return updateRow(row, rowIndex);
               } else if (!selectedRows[rowIndex] && rowIndex === selectedRowIndex) {
                  return updateRow(row, rowIndex);
               } else {
                  return row;
               }
            })
         );

         // Perform validation for the updated row
         // validateRow(updatedGridData[rowIndex], rowIndex);

      } catch (error) {
         toast.error("Something went wrong");
      } finally {
         setShowSpinner(false);
      }
   };

   const handleAssignProcessServer = async () => {
      setShowErrors(true);

      // Validate all records against the schema
      const recordsWithErrors = filteredRecords.filter((record, rowIndex) => {
         try {
            validationSchema.validateSync(record, { abortEarly: false });
            return false; // No errors for this record
         } catch (error) {
            validateRow(record, rowIndex); // Update columnErrors state with errors
            return true; // Errors for this record
         }
      });

      if (recordsWithErrors.length > 0) {
         return;
      };

      // Proceed with AssignProcessServer if all records are valid
      assignProcessServer(filteredRecords);

   };

   const assignProcessServer = async (filteredRecords: IProcessServerUserItem[]) => {
      const requestPayload: IProcessServerUpdateRequest[] = filteredRecords.map((item) => {
         return {
            id: item.id,
            userId: item.userId,
            email: item.email,
            county: item.county,
            state: item.state,
            zip: item.zip,
            city: item.city,
            alternateCity: item.alternateCity
         } as IProcessServerUpdateRequest;
      })
      setShowSpinner(true);
      const response = await ProcessServerService.editProcessServerUser(requestPayload);

      if (response.status === HttpStatusCode.Ok) {
         setOpen(false); // close the modal pop-up
         // getProcessServers(processServers.currentPage, processServers.pageSize);
         getProcessServers(1, 100, '', processServers.sortings);

         // setSelectedIds([]);
         toast.success(response.data.message);
      } else {
         if (response && response.data && response.data.message)
            toast.error(response.data.message);
      }
      setShowSpinner(false);
      // setSelectedProcessServerIds([]);
   }

   const handleCellRendered = (cellIndex: number, data: IProcessServerUserItem, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         isChecked: () => (
            <GridCheckbox
               checked={selectedRows[rowIndex]}
               onChange={(checked: boolean) =>
                  handleCheckboxChange(rowIndex, checked)
               }
               label=""
            />
         )
      };

      const renderer = renderers[propertyName] || (() => formattedCell(cellValue, columnName, propertyName, rowIndex, data));

      if (visibleColumns.find(x => x.label === columnName)) {
         return (
            <td
               key={cellIndex}
               className={`px-1.5 py-3.5 font-normal text-[11px] text-[#2a2929]  ${toCssClassName(columnName)}`}
            >
               {renderer()}
            </td>
         );
      }

      return <></>;
   };

   const formattedCell = (value: any, columnName: any, fieldName: any, rowIndex: number, data: any) => {
      if (fieldName === "email") {
         return (
            <>
               <select style={{
                  backgroundImage: `url(${arrow})`,
               }} className={`peer outline-none p-1.5 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none disabled:bg-[#fcfcfc] disabled:text-[#a8aeb8] bg-no-repeat bg-[center_right_10px] appearance-none !pr-6`}
                  key={rowIndex}
                  value={data.userId}
                  onChange={(event) => handleDropdownChange(event, data.id ?? "", rowIndex, "userId")}
               >
                  <option value="" disabled>Select</option>
                  {processServerUserOptions.map((item) =>
                     <option value={item.id}>{item.value}</option>
                  )}
               </select>
            </>
         )
      }
      if (fieldName === "state") {
         return (
            <>
               <select style={{
                  backgroundImage: `url(${arrow})`,
               }} className={`peer outline-none p-1.5 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none disabled:bg-[#fcfcfc] disabled:text-[#a8aeb8] bg-no-repeat bg-[center_right_10px] appearance-none !pr-6`}
                  key={rowIndex}
                  value={value}
                  disabled={true}
                  onChange={(event) => handleDropdownChange(event, data.id ?? "", rowIndex, "state")}
               >
                  <option value="" disabled>Select</option>
                  {StateCode.map((item) =>
                     <option value={item.value} label={item.value}>{item.value}</option>
                  )}
               </select>
            </>
         )
      };
      return (
         <>
            <input
               type={"text"}
               value={value as string}
               className={
                  "peer outline-none p-2.5 py-1.5 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
               }
               onChange={(e) =>
                  handleInputChange?.(fieldName, e.target.value, rowIndex)
               }
               disabled={fieldName === "county" || fieldName === "zip"}
            />
            {showErrors && columnErrors[rowIndex] && columnErrors[rowIndex][fieldName] && (
               <div className="text-red-500 mb-1">
                  {columnErrors[rowIndex][fieldName].map((error, index) => (
                     <div key={index}>
                        {error.errorMessage}
                     </div>
                  ))}
               </div>
            )}
         </>
      )
   };

   return (
      <Modal
         showModal={open}
         onClose={handleModalClose}
         width="max-w-4xl"
      >
         <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
            <div className="sm:flex sm:items-start">
               <div className="text-center sm:text-left">
                  <h3
                     className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                     id="modal-title"
                  >
                     Assign Process Server
                  </h3>
               </div>
            </div>
            <div className="text-center py-1.5 process-server-grid">
               <Grid
                  columnHeading={visibleColumns}
                  rows={filteredRecords}
                  handleSelectAllChange={handleSelectAllChange}
                  selectAll={selectAll}
                  cellRenderer={(data: IProcessServerUserItem, rowIndex: number, cellIndex: number) => {
                     return handleCellRendered(cellIndex, data, rowIndex);
                  }}
               />
            </div>
            <div className="text-right pt-2.5">
               <Button
                  type="button"
                  isRounded={false}
                  title="Cancel"
                  handleClick={handleModalClose}
                  classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
               ></Button>
               <Button
                  title={"Assign"}
                  type={"submit"}
                  isRounded={false}
                  disabled={showSpinner}
                  handleClick={handleAssignProcessServer}
                  classes="mt-2.5 py-2 md:py-2.5 px-4 inline-flex justify-center items-center gap-x-1.5 text-xs font-semibold rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none   "
               ></Button>
            </div>
         </div>
      </Modal>
   );
};

export default ProcessServerBulkEdit;