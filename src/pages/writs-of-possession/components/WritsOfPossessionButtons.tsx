import React, { Fragment, useState } from "react";
import {
   FaPlus,
   FaRegWindowClose,
   FaExclamationTriangle,
   FaFileSignature,
   FaFileExport,
   FaFilePdf,
} from "react-icons/fa";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import Papa from "papaparse";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import DeleteConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import Spinner from "components/common/spinner/Spinner";
import { IWritsOfPossessionButton } from "interfaces/writs-of-possession.interface";
import { IExportCsv } from "interfaces/common.interface";
import { WritsExportResource } from "interfaces/export-late-notices.interface";
import WritsOfPossessionService from "services/writs-of-possesson.service";
import AuthService from "services/auth.service";
import AllCasesService from "services/all-cases.service";
import { useWritsOfPossessionContext } from "../WritsOfPossessionContext";
import { useAuth } from "context/AuthContext";
import { UserRole } from "utils/enum";
import { convertAndFormatDate } from "utils/helper";

const classNames = (...classes: string[]) => {
   return classes.filter(Boolean).join(" ");
};

// Define the props type for WritsOfPossessionButton component
type WritOfPossessionButtonsProps = {
   buttons: IWritsOfPossessionButton[];
   handleReviewSign: () => void;
   handleWritLaborModal: () => void;
   activeTab: string;
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
export const WriteOfPossessionButtons = (
   props: WritOfPossessionButtonsProps
) => {
   const { userRole, setUnsignedWritCount, unsignedWritCount } = useAuth();
   // this is to get selected writs of possession on the basis of checkbox
   const {
      showSpinner,
      setShowSpinner,
      signedWrits,
      unsignedWrits,
      setAllUnsignedWrits,
      writsOfPossession,
      getAllWritsOfPossession,
      selectedWritsOfPossessionId,
      setSelectedWritsOfPossessionId,
   } = useWritsOfPossessionContext();
   

   const [showExportSpinner, setShowExportSpinner] = useState<boolean>(false);
   // when no row is selected then show error message based on this variable
   const [
      showErrorMessageWhenNoRowIsSelected,
      setShowErrorMessageWhenNoRowIsSelected,
   ] = useState<boolean>(false);
   // to show confirmation when user select delete all
   const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] =
      useState<boolean>(false);

   /**
    * this is to remove selected tenant from the application
    * @returns show success message when user remove all tenants.
    */
   const handleRemove = async () => {
      setShowSpinner(true);
      const apiResponse = await WritsOfPossessionService.deleteWritsOfPossession(
         selectedWritsOfPossessionId
      );
      if (apiResponse.status === HttpStatusCode.Ok) {
         unsignedWrits.items = unsignedWrits.items.filter((item) =>
            !selectedWritsOfPossessionId.includes(item.id ?? "")
         );

         getAllWritsOfPossession(1, 100, false, writsOfPossession.sortings, writsOfPossession.searchParam);

         // set the writ unsigned count
         handleUnsignedCaseCount();
         toast.success("Record(s) removed successfully");
      }
      setShowSpinner(false);
      setShowDeleteAllConfirmation(false);
      setSelectedWritsOfPossessionId([]);

      setAllUnsignedWrits((prev) => ({
         ...prev,
         items: unsignedWrits.items,
         totalCount: prev.totalCount - selectedWritsOfPossessionId.length
      }));
   };

   const handleUnsignedCaseCount = async () => {
      try {
         const response = await AuthService.getUnsignedCaseCount();
         if (response.status === HttpStatusCode.Ok) {
            setUnsignedWritCount(response.data.unsignedWrit);
         }
      } catch (error) {
         console.log(error);
      }
   };

   const getDataForCsv = async () => {
      try {
         setShowExportSpinner(true);
         const request: IExportCsv = {
            dispoIds: selectedWritsOfPossessionId,
            isSigned: props.activeTab === "Signed" ? true : false
         };
         const response = await WritsOfPossessionService.exportWrits(request,unsignedWrits.searchParam);
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
         // Fetch data from the API
         const response: WritsExportResource[] = await getDataForCsv();
         // Ensure that response is not null or undefined
         if (response) {
            // Convert the single object to an array
            const dataArray: WritsExportResource[] = response as WritsExportResource[];

            const formattedData = dataArray.map((entry) => ({
               ...entry,
               writFiledDate: convertAndFormatDate(entry.writFiledDate),
             }));
            // Convert objects to strings using JSON.stringify
const stringifiedDataArray = formattedData.map((item) => {
   // Ensure that each item is of type Record<string, string>
   const typedItem = item as unknown as Record<string, string>;
 
   // Convert each object property to a string
   return Object.keys(typedItem).reduce((acc, key) => {
     const typedKey = key as keyof WritsExportResource;
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
            link.setAttribute("download", "Writs.csv");
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

   const disableDownloadCsv = (): boolean => {
      if (showSpinner) {
         return true;
      }
      
      if ((props.activeTab === "Signed" || userRole.includes(UserRole.WritLabor)) && signedWrits.totalCount) {
         return false;
      }

      // if (props.activeTab === "Unsigned" && unsignedWrits.totalCount) {
      //    return false;
      // }
      if (props.activeTab === "Ready to Sign" && unsignedWrits.totalCount) {
         return false;
      }

      return true;
   };

   const disableButtons = (buttonText: string): boolean => {
      if (showSpinner) {
         return true;
      }

      if (buttonText === "Edit Writs") {
         if (userRole.includes(UserRole.WritLabor) && !signedWrits.totalCount) return true;
      } else if (buttonText === "Remove from List" || buttonText === "Review & Sign") {
         // if (props.activeTab === "Unsigned" && !unsignedWrits.totalCount) return true;
         if (props.activeTab === "Ready to Sign" && !unsignedWrits.totalCount) return true;

      }

      return false;
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

      const selectedIds = selectedWritsOfPossessionId;
      setShowErrorMessageWhenNoRowIsSelected(false);
      // setShowSpinner(true);
      getLink(type);
   };

   const getLink = async (type: string) => {
      try {
         // Download all writs
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
                  // for (const pdfUrl of pdfUrls) {
                  //    try {
                  //       const pdfBlob = await fetchPDFBlob(pdfUrl);
                  //       const pathParts = pdfUrl.split('/');
                  //       const uniquePart = pathParts.slice(-2).join('_');
                  //       zip.file(uniquePart, pdfBlob);
                  //       // setShowSpinner(false);
                  //    } catch (error) {
                  //       console.error(`Failed to fetch and add PDF from ${pdfUrl}:`, error);
                  //    }
                  // }
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

   const resetSelectedRows = () => {
      //setSelectedWritsOfPossessionId([]);
      setAllUnsignedWrits((prev) => {
         return {
            ...prev,
            items: prev.items.map((item) => ({
               ...item,
               isChecked: false,
            })),
         };
      });
   };

   /** handle click of all buttons  */
   const handleClick = (button: IWritsOfPossessionButton) => {
      // Switch based on the button type or any other property that uniquely identifies the button
      switch (button.title) {
         case "Remove from List":
            // Handle click for the "remove" button
            if (selectedWritsOfPossessionId.length === 0) {
               setShowErrorMessageWhenNoRowIsSelected(true);
            } else {
               setShowErrorMessageWhenNoRowIsSelected(false);
               //to confirm from user whether user wants to delete all notices or not
               setShowDeleteAllConfirmation(true);
            }
            break;
         case "Review & Sign":
            if (selectedWritsOfPossessionId.length === 0) {
               setShowErrorMessageWhenNoRowIsSelected(true);
               return;
            } else {
               setShowErrorMessageWhenNoRowIsSelected(false);
            }
            props.handleReviewSign();
            break;
         case "Edit Writs":
            if (selectedWritsOfPossessionId.length === 0) {
               setShowErrorMessageWhenNoRowIsSelected(true);
               return;
            } else {
               setShowErrorMessageWhenNoRowIsSelected(false);
            }
            props.handleWritLaborModal();
            break;
         // Add more cases for other button types
         default:
            // Handle default case or unknown button types
            console.log(`Unknown button type: ${button.icon}`);
      }
   };

   const shouldHideButton = (itemTitle: string, activeTab: string, userRoles: string[]) => {
      // return (
      //   userRoles.includes(UserRole.Viewer) ||
      //   (itemTitle === "Remove from List" || itemTitle === "Review & Sign") && userRoles.includes(UserRole.WritLabor) ||
      //   (itemTitle === "Remove from List" || itemTitle === "Review & Sign") && userRoles.includes(UserRole.NonSigner) ||
      //   (itemTitle === "Edit Writs" && (!userRoles.includes(UserRole.WritLabor) || activeTab === "Signed")) ||
      //   (userRoles.includes(UserRole.NonSigner) && activeTab === "Unsigned" && itemTitle === "Review & Sign") ||
      //   (userRoles.includes(UserRole.C2CAdmin) && activeTab === "Signed") ||
      //   (userRoles.includes(UserRole.Admin) && activeTab === "Signed") ||
      //   activeTab === "Signed"
      // );
      return (
         userRoles.includes(UserRole.Viewer) ||
         (itemTitle === "Remove from List" || itemTitle === "Review & Sign") && userRoles.includes(UserRole.WritLabor) ||
         (itemTitle === "Remove from List" || itemTitle === "Review & Sign") && userRoles.includes(UserRole.NonSigner) ||
         (itemTitle === "Edit Writs" && (!userRoles.includes(UserRole.WritLabor) || activeTab === "Signed")) ||
         (userRoles.includes(UserRole.NonSigner) && activeTab === "Ready to Sign" && itemTitle === "Review & Sign") ||
         ((userRoles.includes(UserRole.C2CAdmin)|| userRole.includes(UserRole.ChiefAdmin)) && activeTab === "Signed") ||
         (userRoles.includes(UserRole.Admin) && activeTab === "Signed") ||
         activeTab === "Signed"
       );
    };
    
    const buttonClasses = (itemTitle: string, activeTab: string, userRoles: string[], unsignedWritCount: number, itemClasses: string) => {
      if (shouldHideButton(itemTitle, activeTab, userRoles)) {
        return "hidden";
      }
      // return (activeTab === "Unsigned" && unsignedWritCount === 0 && !userRoles.includes(UserRole.WritLabor))
      //   ? `${itemClasses} opacity-55`
      //   : itemClasses;
        return (activeTab === "Ready to Sign" && unsignedWritCount === 0 && !userRoles.includes(UserRole.WritLabor))
        ? `${itemClasses} opacity-55`
        : itemClasses;
    };

   return (
      <>
         <>
            {showSpinner && <Spinner />}
            {!userRole.includes(UserRole.Viewer) && <>

               {/* Map through the buttons array to generate individual buttons */}
               {props.buttons.map((item: IWritsOfPossessionButton, index: number) => {
                  let iconComponent;
                  // Switch statement to determine the icon based on the provided icon type
                  switch (item.icon) {
                     case "FaPlus":
                        iconComponent = (
                           <FaPlus className="fa-solid fa-plus mr-1 text-xs " />
                        );
                        break;
                     case "FaRegWindowClose":
                        iconComponent = (
                           <FaRegWindowClose className="fa-solid fa-plus mr-1 text-xs " />
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
                  return (
                     <>
                        {!userRole.includes(UserRole.Viewer) ?
                           <Button
                              title={item.title}
                              // classes={item.classes}
                              classes={buttonClasses(item.title, props.activeTab, userRole, unsignedWritCount, item.classes)}

                              type={"button"}
                              isRounded={false}
                              icon={iconComponent}
                              key={index}
                              handleClick={() => handleClick(item)}
                              disabled={disableButtons(item.title)}
                           ></Button>
                           : <></>
                        }
                     </>
                  );
               })}
            </>}


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
                        <Menu.Items className="dropdown-menu absolute left-0 md:left-auto md:right-0 mt-2 w-60 md:w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                           <div className="py-1 text-nowrap">
                              {props.activeTab === "Signed" ? <>
                                 <Menu.Item>
                                    {({ active }) => (
                                       <a
                                          className={classNames(
                                             active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                             "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                          )}
                                          onClick={() => handleDownloadDocument("Writ")}
                                       >
                                          <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                          Download Writs
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
                  message={`Are you sure you want to delete ${selectedWritsOfPossessionId.length
                     } ${selectedWritsOfPossessionId.length > 1 ? "rocords" : "record"} ?`}
                  showConfirmation={showDeleteAllConfirmation}
                  closePopup={() => {
                     setShowDeleteAllConfirmation(false);
                     resetSelectedRows();
                  }}
                  handleSubmit={handleRemove}
               ></DeleteConfirmationBox>
            )}
         </>
      </>
   );
};
