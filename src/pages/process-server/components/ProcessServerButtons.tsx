import React, { SetStateAction, useState } from "react";
import { toast } from "react-toastify";
import { FaExclamationTriangle, FaFileExport, FaTrash } from "react-icons/fa";
import { FaFileExcel, FaEdit, FaFileSignature } from "react-icons/fa";
import Papa from "papaparse";
import { useAuth } from "context/AuthContext";
import { useProcessServerContext } from "../ProcessServerContext";
import { AOSStatusEnum, HttpStatusCode, UserRole } from "utils/enum";
import { IProcessServerButton, IReviewSignAOS, ISendAOSForSign, ProcessServerExportItem } from "interfaces/process-server.interface";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import DeleteConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import ProcessServerImportCsv from "./ProcessServerActions/ProcessServer_ImportCsv";
import ProcessServerBulkEdit from "./ProcessServerActions/ProcessServer_BulkEdit";
import ProcessServerService from "services/process-server.service";
import { convertAndFormatDate } from "utils/helper";

type ProcessServerButtonsProps = {
   buttons: IProcessServerButton[];
   handleClick: () => void;
   handleReviewSign: (dispoIds: string[], isSignInput: boolean) => void;
   // handleReviewSign: (reviewSignAOSArray: IReviewSignAOS[], isSignInput: boolean) => void;
};
// const formatDate = (dateString: string | Date | null): string => {
//    if (!dateString) return ""; // Return empty string for null or undefined dates

//    const date = new Date(dateString);

//    if (isNaN(date.getTime())) {
//      // If it's not a valid date, return the original value (to prevent wrongly formatting strings like "AWESOME APARTMENTS 172")
//      return String(dateString);
//    }

//    // Format date as MM/DD/YYYY
//    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
//    const day = date.getDate().toString().padStart(2, "0");
//    const year = date.getFullYear();
//    return `${month}/${day}/${year}`;
//  };
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

const ProcessServerButtons = (props: ProcessServerButtonsProps) => {
   const { userRole } = useAuth();
   const {
      processServerCases,
      setProcessServerCases,
      getProcessServerCases,
      selectedProcessServerId,
      setSelectedProcessServerId,
      setFilteredRecords,
      bulkRecords
   } = useProcessServerContext();
   const [importCsvPopUp, setImportCsvPopUp] = useState<boolean>(false);
   const [bulkEditPopUp, setBulkEditPopUp] = useState<boolean>(false);
   const [sendForSignatureModal, setSendForSignatureModal] = useState<boolean>(false);
   const [isNoRowSelectedError, setIsNoRowSelectedError] = useState<boolean>(false);
   const [errorMessage, setMessage] = useState<string>("");
   const [caseNumbers, setCaseNumbers] = useState<string[]>([]);
   const [serverCaseIds, setServerCaseIds] = useState<string[]>([]);

   const [sendSignAOSCases, setSendSignAOSCases] = useState<ISendAOSForSign[]>([]);
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] =
      useState<boolean>(false);

   const setShowErrorMessageWhenNoRowIsSelected = (show: boolean, customMessage?: string) => {
      setMessage(customMessage || "Please select at least 1 record.");
      setIsNoRowSelectedError(show);
   };

   const setShowErrorMessageWhenServerNameNotFound = (show: boolean, customMessage?: string) => {
      setMessage(customMessage || "Please select at least 1 record.");
      setIsNoRowSelectedError(show);
   };

   const handleConfirmSignature = async () => {
      try {
         setShowSpinner(true);
         // Send the list of case numbers to the ProcessServerService
         // const response = await ProcessServerService.sendForSignature(caseNumbers);
         // const response = await ProcessServerService.sendForSignature(sendSignAOSCases);
         const response = await ProcessServerService.sendForSignature(serverCaseIds);



         // Check if the response status is OK
         if (response.status === HttpStatusCode.OK) {
            if(response.data.isSuccess === false) {
               if( response.data.message != null && response.data.message != "")
               {
                  toast.error(response.data.message);
               }
            }
            else
            {
            toast.success(response.data.message);
            }

            getProcessServerCases(1, 100);
         } else {
            //toast.error("Failed to send cases for signature");
            // Handle non-OK response
         }

      } catch (error) {
         console.log(error)
      } finally {
         setShowSpinner(false);
         setSendForSignatureModal(false);
      }
   };

   const getDataForCsv = async () => {
      try {
         const response = await ProcessServerService.exportProcessServer(selectedProcessServerId
            , processServerCases.searchParam, processServerCases.serverName
            , processServerCases.serviceMethod, processServerCases.dateRange);
         return response.data;
      } catch (error) {
         throw new Error("Error fetching process server data:");
      } finally {
         // setShowExportSpinner(false);
      }
   };

   const isISODateString = (value: unknown): boolean => {
      return (
         typeof value === "string" &&
         /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value)
      );
   };

   const downloadCSV = async () => {
      try {
         const response: ProcessServerExportItem[] = await getDataForCsv();

         // Ensure that response is not null or undefined
         if (response) {
            // Convert the single object to an array
            const dataArray: ProcessServerExportItem[] = response as ProcessServerExportItem[];

            const formattedData = dataArray.map((entry) => ({
               ...entry,
               evictionServiceDate: convertAndFormatDate(entry.evictionServiceDate),
               dateScanned: convertAndFormatDate(entry.dateScanned),
            }));
            // Convert objects to strings using JSON.stringify
            const stringifiedDataArray = formattedData.map((item) => {
               // Ensure that each item is of type Record<string, string>
               const typedItem = item as unknown as Record<string, string>;

               // Convert each object property to a string
               return Object.keys(typedItem).reduce((acc, key) => {
                  const typedKey = key as keyof ProcessServerExportItem;
                  const value = item[typedKey];

                  if (isISODateString(value)) {
                     acc[key] = formatDate(value); // Format date string
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
            link.setAttribute("download", `ProcessServer.csv`);
            document.body.appendChild(link);
            link.click();

            // Clean up by removing the link and revoking the URL
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
         }
      } catch (error) {
         console.error("Error fetching or exporting data:", error);
         // Handle error (e.g., display an error message)
      }
   };

   const handleDelete = async () => {
      setShowSpinner(true);
      const apiResponse = await ProcessServerService.deleteProcessServer(
         selectedProcessServerId
      );
      if (apiResponse.status === HttpStatusCode.OK) {
         processServerCases.items = processServerCases.items.filter(
            (item) => !selectedProcessServerId.includes(item.id ?? "")
         );

         getProcessServerCases(1, 100, processServerCases.searchParam);
         toast.success("Record(s) removed successfully");
      }
      setShowSpinner(false);
      setShowDeleteAllConfirmation(false);
      setSelectedProcessServerId([]);
      setFilteredRecords([]);
   };
   const handleClick = (button: IProcessServerButton) => {
      switch (button.title) {
         case "Import Data":
            setImportCsvPopUp(true);
            break;
         case "Send for Signature":
            if (selectedProcessServerId.length === 0) {
               setShowErrorMessageWhenNoRowIsSelected(
                  true,
                  "Please select at least one record."
               );
            } else {
               setShowErrorMessageWhenNoRowIsSelected(false);
               // Filter the cases based on the selected process server IDs
               const selectedCases = processServerCases.items.filter((item) => selectedProcessServerId.includes(item.id) && item.serviceMethod !== "INFORMATION ONLY");

               if (selectedCases.length === 0) {
                  setShowErrorMessageWhenNoRowIsSelected(
                     true,
                     "Please select a record that does not have the service type INFORMATION ONLY."
                  );
               } else {

                     if (selectedCases.some(item => !item.filingType)) {
                        const emptyCases = selectedCases
                           .filter(item => !item.filingType)  // Filter cases with empty filingType
                           .map(item => item.caseNumber);        // Extract dispoId (case number)
      
                        // Join the case numbers with commas if there are multiple
                        if (emptyCases.length > 0) {
                           const caseNumbers = emptyCases.join(", ");  // Get the case numbers
                           setShowErrorMessageWhenNoRowIsSelected(true, `Filing type must be set before sending for following case(s): ${caseNumbers}`);
                        } else {
                           setShowErrorMessageWhenNoRowIsSelected(false);
                        }
                     }
                  else {
                     const reviewSignAOSArray: ISendAOSForSign[] = selectedCases
                        .map(x => ({
                           caseNumber: x.caseNumber,
                           filingType: x.filingType as string, // Now we know filingType is not undefined, so cast to string
                           serviceMethod: x.serviceMethod,
                           serviceDate: x.serviceDate,
                           serverName: x.serverName
                        }));
                     setSendSignAOSCases(reviewSignAOSArray);
                     // Extract the case numbers from the selected cases
                     const caseNumbers = selectedCases.map((item) => item.caseNumber);
                     setServerCaseIds(selectedProcessServerId);

                     // Ensure there are case numbers to send
                     if (caseNumbers.length > 0) {
                        setCaseNumbers(caseNumbers);
                        setSendForSignatureModal(true);
                     }
                  }
               }
            }
            break;
         case "Edit":
            if (selectedProcessServerId.length === 0) {
               setShowErrorMessageWhenNoRowIsSelected(
                  true,
                  "Please select at least one record."
               );
            } else {
               setShowErrorMessageWhenNoRowIsSelected(false);
               setBulkEditPopUp(true);
            }
            break;
         case "Export CSV":
            // if (selectedProcessServerId.length === 0) {
            //    setShowErrorMessageWhenNoRowIsSelected(true);
            //    return;
            // } else {
            setShowErrorMessageWhenNoRowIsSelected(false);
            downloadCSV();
            // }
            break;
         case "Delete":
            // Handle click for the "delete" button
            if (selectedProcessServerId.length === 0) {
               setShowErrorMessageWhenNoRowIsSelected(true);
            } else {
               const selectedRecords = bulkRecords.filter((record) =>
                  selectedProcessServerId.includes(record.id ?? "")
               );

               // per Jessica - 11/25/24 - remove NeedToSend validation on delete
               //if (selectedRecords.every(x => x.status !== AOSStatusEnum.NeedToSend)) {
               //   setShowErrorMessageWhenNoRowIsSelected(true, `Only cases with a NeedToSend status can be deleted.`);
               //} else 
               {
                  setShowErrorMessageWhenNoRowIsSelected(false);
                  //to confirm from user whether user wants to delete all process servers or not
                  setShowDeleteAllConfirmation(true);
               }
            }
            break;
         case "Review & File AOS":
            if (selectedProcessServerId.length === 0) {
               setShowErrorMessageWhenNoRowIsSelected(true);
               return;
            } else {
               setShowErrorMessageWhenNoRowIsSelected(false);
            }
            const selectedCases = processServerCases.items
               .filter(x => selectedProcessServerId.includes(x.id))  // Filter based on selectedProcessServerId
               .map(x => ({ id: x.id, serverName: x.serverName, caseNumber: x.caseNumber, filingType: x.filingType }));  // Extract the necessary info

            // Find cases where the serverName is empty or null
            const casesWithEmptyServerName = selectedCases
               .filter(x => !x.serverName);  // Check for null or empty serverName

            if (casesWithEmptyServerName.length > 0) {
               // If there are cases with missing serverName, show a Toastr error
               const caseNumbers = casesWithEmptyServerName.map(x => x.caseNumber).join(", ");  // Get the case numbers
               setShowErrorMessageWhenNoRowIsSelected(true, `No server name found for the following case(s): ${caseNumbers}`);
               // toast.error(`No server name found for the following cases: ${caseNumbers}`, {
               //    position: toast.POSITION.TOP_RIGHT,
               // });
            }
            else {
               if (selectedCases.some(item => !item.filingType)) {
                  const emptyCases = selectedCases
                     .filter(item => !item.filingType)  // Filter cases with empty filingType
                     .map(item => item.caseNumber);        // Extract dispoId (case number)

                  // Join the case numbers with commas if there are multiple
                  if (emptyCases.length > 0) {
                     const caseNumbers = emptyCases.join(", ");  // Get the case numbers
                     setShowErrorMessageWhenNoRowIsSelected(true, `Filing type must be set before signing for following case(s): ${caseNumbers}`);
                  } else {
                     setShowErrorMessageWhenNoRowIsSelected(false);
                  }
               }
               else {
                  const ids = processServerCases.items
                     .filter(x => selectedProcessServerId.includes(x.id))  // Check if x.id is in the selectedProcessServerIds array
                     .map(x => x.id);
                  // const reviewSignAOSArray: IReviewSignAOS[] = processServerCases.items
                  //    .filter(x => selectedProcessServerId.includes(x.id))  // Check for filingType !== undefined
                  //    .map(x => ({
                  //       dispoId: x.dispoId,
                  //       caseNumber: x.caseNumber,
                  //       filingType: x.filingType as string, // Now we know filingType is not undefined, so cast to string
                  //       serviceMethod: x.serviceMethod,
                  //       serviceDate: x.serviceDate,
                  //       serverName: x.serverName
                  //    }));
                  props.handleReviewSign(ids, true);
                  // props.handleReviewSign(reviewSignAOSArray, true);
               }
            }
            break;
         default:
            // Handle default case or unknown button types
            console.log(`Unknown button type: ${button.icon}`);
      }
   };

   const resetSelectedRows = () => {
      setProcessServerCases((prev) => {
         return {
            ...prev,
            items: prev.items.map((item) => ({
               ...item,
               isChecked: false,
            })),
         };
      });
   };

   return (
      <>
         {props.buttons.map((item: IProcessServerButton, index: number) => {
            let iconComponent;
            // Switch statement to determine the icon based on the provided icon type
            switch (item.icon) {
               case "FaFileExcel":
                  iconComponent = (
                     <FaFileExcel className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               case "FaEdit":
                  iconComponent = (
                     <FaEdit className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               case "FaFileSignature":
                  iconComponent = (
                     <FaFileSignature className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               case "FaFileExport":
                  iconComponent = (
                     <FaFileExport className="fa-solid fa-plus mr-1 text-xs" />
                  );
                  break;
               case "FaTrash":
                  iconComponent = (
                     <FaTrash className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               case "FaFileSignature":
                  iconComponent = (
                     <FaFileSignature className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               default:
                  // Provide a default case or handle unknown icon types
                  iconComponent = <></>;
            }

            if (userRole.includes(UserRole.ProcessServer) && item.title === "Import Data") {
               return null;
            }
            if (
               item.title === "Review & File AOS" && (
               !userRole.includes(UserRole.C2CAdmin) && !userRole.includes(UserRole.ChiefAdmin))
            ) {
               return null; // Hide the button for non-signers
            }

            return (<>
               {
                  userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin) ? <> <Button
                     title={item.title}
                     classes={item.classes}
                     type={"button"}
                     isRounded={false}
                     icon={iconComponent}
                     key={index}
                     handleClick={() => handleClick(item)}
                  ></Button></> : <></>
               }
            </>

            );
         })}
         {/* show import csv pop up */}
         {importCsvPopUp && (
            <>
               <ProcessServerImportCsv
                  importCsvPopUp={importCsvPopUp}
                  setImportCsvPopUp={(value: SetStateAction<boolean>) => {
                     setImportCsvPopUp(value);
                  }}
               />
            </>
         )}
         {bulkEditPopUp && (
            <>
               <ProcessServerBulkEdit
                  showProcessServerPopup={bulkEditPopUp}
                  handleClose={() => {
                     setBulkEditPopUp(false);
                     resetSelectedRows();
                  }}
                  handleCloseConfirm={() => {
                     setBulkEditPopUp(false);
                  }}
               />
            </>
         )}
         {isNoRowSelectedError && (
            <Modal
               showModal={isNoRowSelectedError}
               onClose={() => {
                  setShowErrorMessageWhenNoRowIsSelected(false);
                  resetSelectedRows();
               }}
               width="max-w-md"
            >
               <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                  <div className="text-center py-8">
                     <div className="mx-auto flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-red-100 mx-auto">
                        <FaExclamationTriangle className="h-5 w-5 text-red-600" />
                     </div>
                     <div className="mt-2.5 text-center ">
                        <p className="text-xs text-gray-500 text-center font-medium text-gray-600 text-md">
                           {errorMessage}
                        </p>
                     </div>
                  </div>
               </div>
            </Modal>
         )}
         {sendForSignatureModal && (
            <Modal
               showModal={sendForSignatureModal}
               onClose={() => setSendForSignatureModal(false)}
               width="max-w-md"
            >
               <div id="fullPageContent">
                  <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
                     <div className="text-center pr-4 sm:text-left">
                        <h3
                           className="text-sm font-semibold leading-5 text-gray-900"
                           id="modal-title"
                        >
                           Are you sure you want to send the following cases for signature?
                        </h3>
                     </div>
                     <div className="mt-2">
                        <p>{caseNumbers.map(caseNumber => `#${caseNumber}`).join(', ')}</p>
                     </div>
                  </div>
                  <div className="flex justify-end m-2">
                     <Button
                        type="button"
                        isRounded={false}
                        title="No"
                        handleClick={() => {setSendForSignatureModal(false)
                           setServerCaseIds([]);
                           setSendSignAOSCases([]);
                           setCaseNumbers([]);
                        }}
                        classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg "
                     ></Button>
                     <Button
                        handleClick={handleConfirmSignature}
                        disabled={showSpinner}
                        title="Yes"
                        isRounded={false}
                        type={"button"}
                        classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                     ></Button>
                  </div>
               </div>
            </Modal>
         )}
         {showDeleteAllConfirmation && (
            <DeleteConfirmationBox
               heading={"Confirmation"}
               message={`Are you sure you want to delete ${selectedProcessServerId.length
                  } ${selectedProcessServerId.length > 1 ? "process servers" : "process server"}?`}
               showConfirmation={showDeleteAllConfirmation}
               closePopup={() => {
                  setShowDeleteAllConfirmation(false);
               }}
               handleSubmit={handleDelete}
            ></DeleteConfirmationBox>
         )}
      </>
   );
};

export default ProcessServerButtons;