// DismissalsButtons.tsx
import React, { Fragment, useState } from "react";
import {
   FaPlus,
   FaRegWindowClose,
   FaExclamationTriangle,
   FaFileSignature,
   FaFileExport,
   FaFilePdf,
} from "react-icons/fa";
import Papa from "papaparse";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { toast } from "react-toastify";
import { HttpStatusCode } from "axios";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import DeleteConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import Spinner from "components/common/spinner/Spinner";
import { IDismissalsButton } from "interfaces/dismissals.interface";
import { DismissalsExportResource, DismissalsPendingExportResource } from "interfaces/export-late-notices.interface";
import { IExportCsv, IExportPendingCsv } from "interfaces/common.interface";
import DismissalsService from "services/dismissals.service";
import AuthService from "services/auth.service";
import AllCasesService from "services/all-cases.service";
import { useDissmissalsContext } from "../DismissalsContext";
import { useAuth } from "context/AuthContext";
import { UserRole } from "utils/enum";
import AddtoDismissals from "./DismissalsActions/File_Dismissal"
import { convertAndFormatDate } from "utils/helper";


const classNames = (...classes: string[]) => {
   return classes.filter(Boolean).join(" ");
};

// Define the props type for DismissalsButtons component
type DismissalsButtonsProps = {
   buttons: IDismissalsButton[];
   activeTab: string;
   handleReviewSign: () => void;
};
// Utility function to format dates in MM/DD/YYYY format
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

export const DismissalsButtons = (props: DismissalsButtonsProps) => {
   const { userRole, setUnsignedDismissalCount } = useAuth();
   const {
      showSpinner,
      setShowSpinner,
      signedDismissals,
      getAllDismissals,
      unsignedDismissals,
      setAllUnsignedDismissals,
      unsignedDismissalCount,
      selectedUnSignedDismissalsId,
      setSelectedUnSignedDismissalsId,
      evictionAutomationDismissalApprovalsQueue,
      selectedEvictionDismissalApprovalId,
      setSelectedEvictionDismissalApprovalId,
   } = useDissmissalsContext();

   const [showExportSpinner, setShowExportSpinner] = useState<boolean>(false);
   // when no row is selected then show error message based on this varible
   const [
      showErrorMessageWhenNoRowIsSelected,
      setShowErrorMessageWhenNoRowIsSelected,
   ] = useState<boolean>(false);
   // to show confirmation when user select delete all
   const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] =
      useState<boolean>(false);
   const [showAddtoDismissalsPopup, setShowAddtoDismissalsPopup] = useState<boolean>(false);
   /**
    * this is to remove selected tenant from the application
    * @returns show success message when user remove all tenants.
    */
   const handleRemove = async () => {
      setShowSpinner(true);
      const apiResponse = await DismissalsService.deleteDissmissals(
         selectedUnSignedDismissalsId
      );
      if (apiResponse.status === HttpStatusCode.Ok) {
         unsignedDismissals.items = unsignedDismissals.items.filter((item) =>
            !selectedUnSignedDismissalsId.includes(item.id ?? "")
         );
         // setAllUnsignedDismissals((prev) => ({
         //   ...prev,
         //   items: unsignedDismissals.items,
         //   totalCount: prev.totalCount - selectedUnSignedDismissalsId.length
         // }));

         getAllDismissals(1, 100, false, unsignedDismissals.searchParam);

         // set dismissal unsigned count
         handleUnsignedCaseCount();
         toast.success("Dismissal(s) removed successfully");
      }
      setShowSpinner(false);
      setShowDeleteAllConfirmation(false);
      setSelectedUnSignedDismissalsId([]);
   };

   const getDataForCsv = async () => {
      try {
         setShowExportSpinner(true);
         const request: IExportCsv = {
            dispoIds: selectedUnSignedDismissalsId, // unsigned dismissals because no option to select signed dismissals
            isSigned: props.activeTab === "Signed Dismissals" ? true : false
         };
         const response = await DismissalsService.exportDismissals(request,unsignedDismissals.searchParam);
         return response.data;
      } catch (error) {
         throw new Error("Error fetching cases data:");
      } finally {
         setShowExportSpinner(false);
      }
   };

   const getDataForPendingCsv = async () => {
      try {
         setShowExportSpinner(true);
         const request: IExportPendingCsv = {
            dispoIds: selectedEvictionDismissalApprovalId, // unsigned dismissals because no option to select signed dismissals
         };
         const response = await DismissalsService.exportPendingDismissals(request, unsignedDismissals.searchParam);
         return response.data;
      } catch (error) {
         throw new Error("Error fetching cases data:");
      } finally {
         setShowExportSpinner(false);
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
         if(props.activeTab != "EA - Ready to Confirm"){
            // Fetch data from the API
         const response: DismissalsExportResource[] = await getDataForCsv();

         // Ensure that response is not null or undefined
         if (response) {
            // Convert the single object to an array
            const dataArray: DismissalsExportResource[] = response as DismissalsExportResource[];

            const formattedData = dataArray.map((entry) => ({
               ...entry,
               dismissalFiledDate: convertAndFormatDate(entry.dismissalFiledDate),
             }));
            // Convert objects to strings using JSON.stringify
            const stringifiedDataArray = formattedData.map((item) => {
               // Ensure that each item is of type Record<string, string>
               const typedItem = item as unknown as Record<string, string>;

               // Convert each object property to a string
               return Object.keys(typedItem).reduce((acc, key) => {
                  const typedKey = key as keyof DismissalsExportResource;
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
            link.setAttribute("download", "Dismissals.csv");
            document.body.appendChild(link);
            link.click();

            // Clean up by removing the link and revoking the URL
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
         }
         }
         else
         {
         // Fetch data from the API
         const response: DismissalsPendingExportResource[] = await getDataForPendingCsv();

         // Ensure that response is not null or undefined
         if (response) {
            // Convert the single object to an array
            const dataArray: DismissalsPendingExportResource[] = response as DismissalsPendingExportResource[];

            const formattedData = dataArray.map((entry) => ({
               ...entry,
               balanceDate: convertAndFormatDate(entry.balanceDate ?? null),
             }));
            // Convert objects to strings using JSON.stringify
               const stringifiedDataArray = formattedData.map((item) => {
                  // Ensure that each item is of type Record<string, string>
                  const typedItem = item as unknown as Record<string, string>;
                
                  // Convert each object property to a string
                  return Object.keys(typedItem).reduce((acc, key) => {
                    const typedKey = key as keyof DismissalsPendingExportResource;
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
            link.setAttribute("download", "PendingDismissals.csv");
            document.body.appendChild(link);
            link.click();

            // Clean up by removing the link and revoking the URL
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
         }
      }
      } catch (error) {
         console.error("Error fetching or exporting data:", error);
         // Handle error (e.g., display an error message)
      }
   };

   const disableDownloadCsv = (): boolean => {
      if (showSpinner) {
         return true;
      }

      if (props.activeTab === "Signed Dismissals" && signedDismissals.totalCount) {
         return false;
      }

      if (props.activeTab === "Ready to Sign" && unsignedDismissals.totalCount) {
         return false;
      }
      if (props.activeTab === "EA - Ready to Confirm" && evictionAutomationDismissalApprovalsQueue.totalCount) {
         return false;
      }
      return true;
   };

   const resetSelectedRows = () => {
      // setSelectedUnSignedDismissalsId([]);
      setAllUnsignedDismissals((prev) => {
         return {
            ...prev,
            items: prev.items.map((item) => ({
               ...item,
               isChecked: false,
            })),
         };
      });
   };

   const handleUnsignedCaseCount = async () => {
      try {
         const response = await AuthService.getUnsignedCaseCount();
         if (response.status === HttpStatusCode.Ok) {
            setUnsignedDismissalCount(response.data.unsignedDismissal);
         }
      } catch (error) {
         console.log(error);
      }
   };
   const fetchPDFBlob = async (pdfUrl: string) => {
      try {
         const response = await fetch(pdfUrl, {
            headers: {
               "Content-Type": "application/pdf",
            },
         });

         if (!response.ok) {
            throw new Error(`Failed to fetch PDF: ${response.statusText}`);
         }

         return await response.blob();
      } catch (error) {
         console.error("Error fetching PDF:", error);
         throw error;
      }
   };
   const handleDownloadDocument = (type: string) => {

      const selectedIds = selectedUnSignedDismissalsId;
      setShowErrorMessageWhenNoRowIsSelected(false);
      // setShowSpinner(true);
      getLink(type);
   };
   const getLink = async (type: string) => {
      try {
         // Download all dismissals
         const apiResponse = await AllCasesService.getAllCasesDocuments([], type);

         // Log the API response to inspect its structure
         console.log('API Response:', apiResponse);

         if (apiResponse.status === HttpStatusCode.Ok) {
            // Ensure the data is an array of objects containing pdfUrls
            if (Array.isArray(apiResponse.data) && apiResponse.data.length > 0 && 'pdfUrls' in apiResponse.data[0]) {
               toast.info("File downloading has been started");
               const pdfUrls = apiResponse.data.map(x => x.pdfUrls);

               // Initialize JSZip
               const zip = new JSZip();
               const existingFileNames = new Set();

               // Fetch all PDFs and add them to the zip
               const fetchAndAddPDFsToZip = async () => {
                  for (const data of apiResponse.data) {
                     try {
                        const pdfBlob = await fetchPDFBlob(data.pdfUrls);
                        const pathParts = data.pdfUrls.split('/');
                        const uniquePart = pathParts.slice(-2).join('_');
                        const fileName = data.pdfUrls.substring(data.pdfUrls.lastIndexOf("/") + 1);

                        let zipFileName = fileName;

                        if (existingFileNames.has(fileName)) {
                           zipFileName = uniquePart;
                        } else {
                           existingFileNames.add(fileName);
                        }

                        zip.file(zipFileName, pdfBlob);
                     } catch (error) {
                        console.error(`Failed to fetch and add PDF from ${data.pdfUrls}:`, error);
                     }
                  }
               };

               fetchAndAddPDFsToZip().then(() => {
                  // Generate the zip file and trigger the download
                  zip.generateAsync({ type: "blob" }).then((zipBlob) => {
                     saveAs(zipBlob, "C2C_PDF_Export.zip");
                     toast.success("File has been successfully downloaded");
                     // setShowSpinner(false);
                  });
               });
            } else {
               toast.error("Not found any file for the selected records");
            }
         }
      } catch (error) {
         console.error('Error fetching and downloading PDFs:', error);
         toast.error("Error fetching and downloading PDFs");
      } finally {
         setShowSpinner(false);
      }
   };


   /** handle click of all buttons  */
   const handleClick = (button: IDismissalsButton) => {
      // Switch based on the button type or any other property that uniquely identifies the button
      switch (button.title) {

         case "Remove from List":
            // Handle click for the "remove" button
            // if (props.activeTab === "Unsigned") {
            //    if (selectedUnSignedDismissalsId.length === 0) {
            //       setShowErrorMessageWhenNoRowIsSelected(true);
            //    } else {
            //       setShowErrorMessageWhenNoRowIsSelected(false);
            //       //to confirm from user whether user wants to delete all notices or not
            //       setShowDeleteAllConfirmation(true);
            //    }
            // }
            if (props.activeTab === "Ready to Sign") {
               if (selectedUnSignedDismissalsId.length === 0) {
                  setShowErrorMessageWhenNoRowIsSelected(true);
               } else {
                  setShowErrorMessageWhenNoRowIsSelected(false);
                  //to confirm from user whether user wants to delete all notices or not
                  setShowDeleteAllConfirmation(true);
               }
            }
            break;
         case "Review & Sign":
            if (selectedUnSignedDismissalsId.length !== 0) {
               props.handleReviewSign();
               setShowErrorMessageWhenNoRowIsSelected(false);
            } else {
               setShowErrorMessageWhenNoRowIsSelected(true);
            }
            break;
         case "Confirm":
            if (selectedEvictionDismissalApprovalId.length !== 0) {
               setShowAddtoDismissalsPopup(true);
               setShowErrorMessageWhenNoRowIsSelected(false);
            } else {
               setShowErrorMessageWhenNoRowIsSelected(true);
            }
            break;
         // Add more cases for other button types
         default:
            // Handle default case or unknown button types
            console.log(`Unknown button type: ${button.icon}`);
      }
   };

   return (
      <>
         {/* Map through the buttons array to generate individual buttons */}
         {props.buttons.map((item: IDismissalsButton, index: number) => {
            let iconComponent;
            // Switch statement to determine the icon based on the provided icon type
            switch (item.icon) {
               case "FaPlus":
                  iconComponent = (
                     <FaPlus className="fa-solid fa-plus mr-1 text-xs" />
                  );
                  break;
               case "FaRegWindowClose":
                  iconComponent = (
                     <FaRegWindowClose className="fa-solid fa-plus mr-1 text-xs" />
                  );
                  break;
               case "FaFileSignature":
                  iconComponent = (
                     <FaFileSignature className="fa-solid fa-plus mr-1 text-xs" />
                  )
                  break;
               default:
                  // Provide a default case or handle unknown icon types
                  iconComponent = <></>;
            }

            // for hide the buttons based on conditions:
            if (userRole.includes(UserRole.Viewer) || props.activeTab == "Signed Dismissals") {
               return null;
            }
            else if (props.activeTab == "EA - Ready to Confirm" && item.title != "Confirm") {
               return null;
            }
            else if ((userRole.includes(UserRole.NonSigner)) && item.title == "Review & Sign") {
               return null;
            }
            else if (item.title == "Confirm" && props.activeTab != "EA - Ready to Confirm") {
               return null;
            }
            else if(userRole.includes(UserRole.PropertyManager) && item.title!="Confirm"){
               return null;
            }

            //view button
            return (
               <>
                  <Button
                     title={item.title}
                     classes={
                        ((unsignedDismissalCount === 0 && props.activeTab=="Ready to Sign") || (evictionAutomationDismissalApprovalsQueue.totalCount===0 && props.activeTab=="EA - Ready to Confirm")) ? `${item.classes} opacity-55` : item.classes
                     }
                     type={"button"}
                     isRounded={false}
                     icon={iconComponent}
                     key={index}
                     handleClick={() => handleClick(item)}
                     disabled={
                        ((unsignedDismissalCount === 0 && props.activeTab=="Ready to Sign") || (evictionAutomationDismissalApprovalsQueue.totalCount===0 && props.activeTab=="EA - Ready to Confirm"))  && true
                     }
                  ></Button>
                  {/* {!userRole.includes(UserRole.Viewer) ?
                     <>
                        {userRole.includes(UserRole.NonSigner) ?
                           <>
                              {props.activeTab === "Unsigned" ? <>
                                 <Button
                                    title={item.title}
                                    classes={
                                       (item.title === "Review & Sign")
                                          ? `hidden`
                                          : (unsignedDismissalCount === 0) ? `${item.classes} opacity-55` : item.classes
                                    }
                                    type={"button"}
                                    isRounded={false}
                                    icon={iconComponent}
                                    key={index}
                                    handleClick={() => handleClick(item)}
                                    disabled={
                                       (unsignedDismissalCount === 0) && true
                                    }
                                 ></Button>
                              </> : <>
                              </>}
                           </>
                           : <></>}

                        {!userRole.includes(UserRole.NonSigner) ?
                           <>
                              {props.activeTab === "Unsigned" && unsignedDismissalCount === 0 ? <>
                                 <Button
                                    title={item.title}
                                    classes={
                                       (item.title === "Remove from List" || item.title === "Review & Sign")
                                          ? `${item.classes} opacity-55`
                                          : item.classes
                                    }
                                    type={"button"}
                                    isRounded={false}
                                    icon={iconComponent}
                                    key={index}
                                    handleClick={() => handleClick(item)}
                                    disabled={
                                       (item.title === "Remove from List" || item.title === "Review & Sign") && true
                                    }
                                 ></Button>
                              </> : <>

                                 <Button
                                    title={item.title}
                                    classes={
                                       (item.title === "Remove from List" || item.title === "Review & Sign") &&
                                          (props.activeTab === "Signed")
                                          ? `${item.classes} hidden`
                                          : item.classes
                                    }
                                    type={"button"}
                                    isRounded={false}
                                    icon={iconComponent}
                                    key={index}
                                    handleClick={() => handleClick(item)}
                                    disabled={
                                       (item.title === "Remove from List" || item.title === "Review & Sign") &&
                                          (props.activeTab === "Signed") ? true : false
                                    }
                                 ></Button>
                              </>}
                           </>
                           : <></>}

                     </>
                     : <></>} */}
               </>
            );
         })}

         {showExportSpinner && (<Spinner />)}
         {(!userRole.includes(UserRole.Viewer) && !userRole.includes(UserRole.NonSigner)) && (
            <>
               <Menu
                  as="div"
                  className="relative inline-block text-left z-[11] mb-1 ml-1 md:ml-1.5"
               >
                  <div>
                     <Menu.Button disabled={disableDownloadCsv()} className="inline-flex w-full justify-center gap-x-1 rounded-md bg-white px-2.5 py-1.5 text-[11px] md:text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        Download
                        <ChevronDownIcon
                           className="-mr-0.5 h-4 w-4 text-gray-400"
                           aria-hidden="true"
                        />
                     </Menu.Button>
                  </div>

                  <Transition
                     as={Fragment}
                     enter="transition ease-out duration-100"
                     enterFrom="transform opacity-0 scale-95"
                     enterTo="transform opacity-100 scale-100"
                     leave="transition ease-in duration-75"
                     leaveFrom="transform opacity-100 scale-100"
                     leaveTo="transform opacity-0 scale-95"
                  >
                     <Menu.Items className="dropdown-menu absolute left-0 md:left-auto md:right-0 mt-2 w-60 md:w-60 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1 text-nowrap">
                           {props.activeTab === "Signed" ? <>
                              <Menu.Item>
                                 {({ active }) => (
                                    <a
                                       className={classNames(
                                          active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                          "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                       )}
                                       onClick={() => handleDownloadDocument("Dismissal")}
                                    >
                                       <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                       Download Dismissals
                                    </a>
                                 )}
                              </Menu.Item>
                           </> : <>
                           </>}
                           <Menu.Item>
                              {({ active }) => (
                                 // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                 <a
                                    className={classNames(
                                       active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                       "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                    )}
                                    onClick={downloadCSV}
                                 >
                                    <FaFileExport className="fa-solid fa-plus  mr-1 text-[13px] md:text-sm" />{" "}
                                    Export CSV
                                 </a>
                              )}
                           </Menu.Item>
                        </div>
                     </Menu.Items>
                  </Transition>
               </Menu>
            </>
         )}

         {showSpinner && <Spinner></Spinner>}
         {/* This is to show error message when no row is selected from grid */}
         {showErrorMessageWhenNoRowIsSelected && (
            <>
               <Modal
                  showModal={showErrorMessageWhenNoRowIsSelected}
                  onClose={() => {
                     setShowErrorMessageWhenNoRowIsSelected(false);
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
                              Please select at least 1 record.
                           </p>
                        </div>
                     </div>
                  </div>
               </Modal>
            </>
         )}

         {/* Show confirmation box when user select tenant and press delete button */}
         {showDeleteAllConfirmation && (
            <DeleteConfirmationBox
               heading={"Confirmation"}
               message={`Are you sure you want to delete ${selectedUnSignedDismissalsId.length
                  } ${selectedUnSignedDismissalsId.length > 1 ? "rocords" : "record"
                  } ?`}
               showConfirmation={showDeleteAllConfirmation}
               closePopup={() => {
                  setShowDeleteAllConfirmation(false);
                  resetSelectedRows();
               }}
               handleSubmit={handleRemove}
            ></DeleteConfirmationBox>
         )}

         {/* This is to show Add to Dismissals popup */}
         {showAddtoDismissalsPopup && (
            <AddtoDismissals
               showAddtoDismissalPopup={showAddtoDismissalsPopup}
               handleClose={() => {
                  setShowAddtoDismissalsPopup(false);
               }}
               handleReviewSign={() => {
                  props.handleReviewSign()
               }}
            />
         )}
      </>
   );
};
