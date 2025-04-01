// FileEvictionsButtons.tsx
import React, { SetStateAction, useState } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import {
   FaPlus,
   FaFileExcel,
   FaTrash,
   FaCheck,
   FaExclamationTriangle,
   FaFilePdf,
   FaFileSignature,
   FaEdit
} from "react-icons/fa";
import { toast } from "react-toastify";
import { Form, Formik } from "formik";
import { downloadPDF, toCssClassName } from "utils/helper";
import { UserRole } from "utils/enum";
import DeleteConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import Spinner from "components/common/spinner/Spinner";
import FormikControl from "components/formik/FormikControl";
import FileEvictionsImportCsv from "./FileEvictionsActions/FileEvictions_ImportCsv";
import ManualCreateFileEvictions from "./FileEvictionsActions/FileEvictions_ManualCreateFileEviction";
import FileEvictionBulkEdit from "./FileEvictionsActions/FileEviction_BulkEdit";
import {
   IFileEvictionsButton,
   IFileEvictionEmail,
   ISendFileEvictionEmail,
   IFileEvictionsItems,
} from "interfaces/file-evictions.interface";
import FileEvictionsService from "services/file-evictions.service";
import FileEvictionService from "services/file-evictions.service";
import { useFileEvictionsContext } from "../FileEvictionsContext";
import { useAuth } from "context/AuthContext";
import EvictionAutomationService from "services/eviction-automation.service";
import Papa from "papaparse";
import AuthService from "services/auth.service";
import FileEvictionEA_BulkEdit from "./FileEvictionsActions/FileEvictionEA_BulkEdit";

const classNames = (...classes: string[]) => {
   return classes.filter(Boolean).join(" ");
};

// Define the props type for FileEvictionsButton component
type FileEvictionsButtonsProps = {
   buttons: IFileEvictionsButton[];
   activeTab?:string;
   handleReviewSign: () => void;
};

// Validation schema for manual create eviction
const validationSchema: yup.ObjectSchema<any> = yup.object({
   email: yup
      .string()
      .required("Email is required.")
      .test("valid-emails", "Invalid email format", (value) => {
         if (!value) return true; // Allow empty value
         const emails = value.split(",").map((email) => email.trim());
         const isValid = emails.every((email) =>
            yup.string().email().isValidSync(email)
         );
         return isValid;
      }),
});

export const FileEvictionsButtons = (props: FileEvictionsButtonsProps) => {
   // this is to get selected file evictions on the basis of checkbox
   const {
      selectedFileEvictionId,
      fileEvictions,
      getFileEvictions,
      setSelectedFileEvictionId,
      setFilteredRecords,
      setFileEvictions,
      counties,
      selectedEvictionApprovalId,
      evictionAutomationApprovalsQueue,
      getEvictionAutomationApprovalsQueue,
      setSelectedEvictionApprovalId
   } = useFileEvictionsContext();
   // this is used when user click on plus icon i.e. manual create file evictions
   const [manualCreateFileEviction, setManualCreateFileEviction] =
      useState<boolean>(false);
   const { userRole,setUnsignedEvictionApprovalCount } = useAuth();
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [dropdownClass, setDropdownClass] = useState<boolean>(false);
   // when no row is selected then show error message based on this varible
   const [
      showErrorMessageWhenNoRowIsSelected,
      setShowErrorMessageWhenNoRowIsSelected,
   ] = useState<boolean>(false);
   // to show confirmation when user select delete all
   const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] =
      useState<boolean>(false);

   // to show import csv pop up
   const [importCsvPopUp, setImportCsvPopUp] = useState<boolean>(false);
   const [evictionFilteredRecords, setevictionFilteredRecords] = useState<IFileEvictionsItems[]>(
      []
   );
   const [pdfLink, setPdfLink] = useState<string>("");
   const [bulkEditPopUp, setBulkEditPopUp] = useState<boolean>(false);
   const [bulkEditEAPopUp, setBulkEditEAPopUp] = useState<boolean>(false);
   const [
      showPopUpWhenDownloadFileEviction,
      setShowPopUpWhenDownloadFileEviction,
   ] = useState<boolean>(false);
   const [sendToAdditionalParties, setSendToAdditionalParties] =
      useState<boolean>(false);

   /**
    * this is to remove selected tenant from the application
    * @returns show success message when user remove all tenants.
    */
   const handleDelete = async () => {
      setShowSpinner(true);
      const apiResponse = await FileEvictionsService.deleteFileEviction(
         selectedFileEvictionId
      );
      if (apiResponse.status === HttpStatusCode.Ok) {
         fileEvictions.items = fileEvictions.items.filter(
            (item) => !selectedFileEvictionId.includes(item.id ?? "")
         );

         getFileEvictions(1, 100,fileEvictions.isViewAll??true, fileEvictions.searchParam,fileEvictions.companyId);
         // setFileEvictions((prev) => ({
         //   ...prev,
         //   items: fileEvictions.items,
         //   isChecked: false,
         //   totalCount: prev.totalCount - selectedFileEvictionId.length
         // }));
         toast.success("Record(s) removed successfully");
      }
      setShowSpinner(false);
      setShowDeleteAllConfirmation(false);
      setSelectedFileEvictionId([]);
      setFilteredRecords([]);
   };

   const resetSelectedRows = () => {
      setevictionFilteredRecords([]);
      setSelectedFileEvictionId([]);
      setFileEvictions((prev) => {
         return {
            ...prev,
            items: prev.items.map((item) => ({
               ...item,
               isChecked: false,
            })),
         };
      });
   };

   const handleDropdownClick = () => {
      setDropdownClass((prev) => !prev);
   };

   const [firstApproval, setFirstApproval] = useState<IFileEvictionsItems>();
   const [pin, setPin] = useState('');
   const [confirmApprovalModal, setConfirmApprovalModal] = useState<boolean>(false);
   const [isSignValid, setIsSignValid] = useState(true);

   const handleConfirmApprovals = (): boolean => {
      
      const checkAllMatch = (queue: any[], selectedIds: string[]): boolean => {
         if (selectedIds.length === 0) return false;

         const firstApproval = queue.find(item => item.id === selectedIds[0]);
         setFirstApproval(firstApproval);
         if (!firstApproval) return false;

         const { ownerId, propertyId } = firstApproval;

         return selectedIds.every(id => {
            const approval = queue.find(item => item.id === id);
            return approval && approval.ownerId === ownerId && approval.propertyId === propertyId;
         });
      };

      if (selectedEvictionApprovalId.length) {
         return checkAllMatch(evictionAutomationApprovalsQueue.items, selectedEvictionApprovalId);
      } 
      return false;
   };
   const ConfirmApprovals = async () => {

      var batchPin = "";
      if (localStorage.getItem("confirmPin")) {
         batchPin = localStorage.getItem("confirmPin") ?? "";
      }
      else {
         batchPin = pin.trim()
      }
     
         const ids =selectedEvictionApprovalId;
         const response = await EvictionAutomationService.ConfirmApprovals(
            firstApproval?.ownerId ?? "",
            firstApproval?.propertyId ?? "",
            batchPin,
            firstApproval?.crmName??"",
            ids,
            false
         );
         if (response.status === HttpStatusCode.Ok) {
            
            getEvictionAutomationApprovalsQueue(1, 100, false, evictionAutomationApprovalsQueue.isViewAll);
            handleUnsignedCaseCount();
            setSelectedEvictionApprovalId([]);
            toast.success("Cases successfully approved.");
         }
         setConfirmApprovalModal(false);
   
   }
   const handleUnsignedCaseCount = async () => {
      try {
         const response = await AuthService.getUnsignedCaseCount();
         if (response.status === HttpStatusCode.Ok) {
            setUnsignedEvictionApprovalCount(response.data.unsignedEvictionApprovalCount);           
         }
      } catch (error) {
         console.log(error);
      }
   };
   

  

   /** handle click of all buttons  */
   const handleClick = (button: IFileEvictionsButton) => {
      // Switch based on the button type or any other property that uniquely identifies the button
      switch (button.title) {
         case "New":
            // Handle click for the "add" button
            setManualCreateFileEviction(true);
            break;
         case "Import Data":
            setImportCsvPopUp(true);
            break;
         case "Download Documents":
            const selectedIds = selectedFileEvictionId;
            if (selectedIds.length === 0) {
               setShowErrorMessageWhenNoRowIsSelected(true);
            } else {
               setShowErrorMessageWhenNoRowIsSelected(false);
               setShowSpinner(true);
               getLink();
            }
            break;
         case "Verify Address":
            // alert("This is in progress");
            break;
         case "Delete":
            // Handle click for the "delete" button
            if (selectedFileEvictionId.length === 0) {
               setShowErrorMessageWhenNoRowIsSelected(true);
            } else {
               setShowErrorMessageWhenNoRowIsSelected(false);
               //to confirm from user whether user wants to delete all notices or not
               setShowDeleteAllConfirmation(true);
            }
            break;
         case "Review & Sign":
            if (selectedFileEvictionId.length === 0) {
               setShowErrorMessageWhenNoRowIsSelected(true);
               return;
            } else {
               setShowErrorMessageWhenNoRowIsSelected(false);
            }
            props.handleReviewSign();
            break;
         case "Edit":
            if(props.activeTab == "EA - Ready to Confirm")
            {
               if (selectedEvictionApprovalId.length === 0) {
                  setShowErrorMessageWhenNoRowIsSelected(true);
                  return;
               } else {
                  setShowErrorMessageWhenNoRowIsSelected(false);
                  setBulkEditEAPopUp(true);
               }
            }
            else
            {
               if (selectedFileEvictionId.length === 0) {
                  setShowErrorMessageWhenNoRowIsSelected(true);
                  return;
               } else {
                  setShowErrorMessageWhenNoRowIsSelected(false);
                  setBulkEditPopUp(true);
               }
            }
            break;
         case "Confirm":
            if (selectedEvictionApprovalId.length) {
               // setShowApprovalModal(true);
               var result = handleConfirmApprovals();
               if (result) {
                  setPin("");
                  setConfirmApprovalModal(true);
               }
               else {
                  toast.error("Plese select cases who has same OwnerId and PropertyId");
               }
            }else {
               setShowErrorMessageWhenNoRowIsSelected(true);
            }
               break
         // Add more cases for other button types
         default:
            // Handle default case or unknown button types
            console.log(`Unknown button type: ${button.icon}`);
      }
   };

   /**
    * get link of selected file evictions id
    */
   const getLink = async () => {
      
      try {
         let request: IFileEvictionEmail = {
            dispoIds: selectedFileEvictionId,
         };
         // Download all file evictions
         const apiResponse =
            await FileEvictionService.getFileEvictionDocumentForSign(
               selectedFileEvictionId
            );
         // api returns pdf link
         if (apiResponse.status === HttpStatusCode.Ok) {
            setPdfLink(apiResponse.data.combinedPDFUrl);
            if(!userRole.includes(UserRole.Viewer))
               setShowPopUpWhenDownloadFileEviction(true);
            else
               await downloadPDF(apiResponse.data.combinedPDFUrl);
         }
      } catch (error) {
      } finally {
         setShowSpinner(false);
      }
   };

   const getDataForCsv = async (): Promise<any> => {
      try {
         const response = await FileEvictionService.exportAllFileEvictions(
            selectedFileEvictionId
         );
         return response.data;
      } catch (error) {
         // Handle error (e.g., display an error message)
         throw new Error("Error fetching evictions data:");
      }
   };

   const downloadCSV = async () => {
      try {
         // setSpinner(true);
         // Fetch data from the API
         const response = await getDataForCsv();

         // Ensure that response.data is an array of objects
         const dataArray: any[] = response as any[];

         if (dataArray && Array.isArray(dataArray)) {
            // Convert objects to strings using JSON.stringify
            const stringifiedDataArray = dataArray.map((item) => {
               // Ensure that each item is of type T
               const typedItem = item as Record<string, unknown>;

               // Convert each object property to a string
               return Object.keys(typedItem).reduce((acc, key) => {
                  const value = typedItem[key];
                  const stringValue =
                     typeof value === "object" ? JSON.stringify(value) : String(value);
                  acc[key] = stringValue;
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
            link.setAttribute("download", "FileEviction.csv");
            document.body.appendChild(link);
            link.click();

            // Clean up by removing the link and revoking the URL
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            setSelectedFileEvictionId([]);
            setFileEvictions((prev) => ({
               ...prev,
               items: prev.items.map((item) => ({
                  ...item,
                  isChecked: false,
               })),
            }));
         }
      } catch (error) {
         console.error("Error fetching or exporting data:", error);
         // Handle error (e.g., display an error message)
      } finally {
         // setSpinner(false);
      }
   };

   /**
    *
    * @param formValues get those values from the email
    */
   const handleSignIn = async (formValues: any) => {
      
      try {
         setShowSpinner(true);
         // Download all file evictions
         if (sendToAdditionalParties) {
            let request: ISendFileEvictionEmail = {
               combinedPdfUrl: pdfLink,
               dispoIds: selectedFileEvictionId,
               userEmails: formValues.email.split(","),
            };
            const apiResponse = await FileEvictionService.sendFileEvictionEmail(
               request
            );
         }
         setShowPopUpWhenDownloadFileEviction(false);
         await downloadPDF(pdfLink);
         setShowSpinner(false);
         getFileEvictions(1, 100,fileEvictions.isViewAll??true);
         setSelectedFileEvictionId([]);
      } catch (error) { }
   };

   const handleDownloadDocument = () => {
      
      const selectedIds = selectedFileEvictionId;
      if (selectedIds.length === 0) {
         setShowErrorMessageWhenNoRowIsSelected(true);
      } else {
         setShowErrorMessageWhenNoRowIsSelected(false);
         setShowSpinner(true);
         getLink();
      }
   };

   return (
      <>
         {/* Map through the buttons array to generate individual buttons */}
         {props.buttons.map((item: IFileEvictionsButton, index: number) => {
            let iconComponent;
            // Switch statement to determine the icon based on the provided icon type
            switch (item.icon) {
               case "FaPlus":
                  iconComponent = (
                     <FaPlus className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               case "FaFileExcel":
                  iconComponent = (
                     <FaFileExcel className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               case "FaCheck":
                  iconComponent = (
                     <FaCheck className="fa-solid fa-plus mr-1 text-xs" />
                  );
                  break;
               case "FaTrash":
                  iconComponent = (
                     <FaTrash className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               case "FaFilePdf":
                  iconComponent = (
                     <FaFilePdf className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               case "FaFileSignature":
                  iconComponent = (
                     <FaFileSignature className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               case "FaEdit":
                  iconComponent = (
                     <FaEdit className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               default:
                  // Provide a default case or handle unknown icon types
                  iconComponent = <></>;
            }
            if (
               item.title === "Review & Sign" &&
               userRole.includes(UserRole.NonSigner)
            ) {
               return null; // Hide the button for non-signers
            }

            // Conditionally check userRole and skip rendering buttons accordingly
            // if (
            //    (item.title === "New" ||
            //       item.title === "Import Data" ||
            //       item.title === "Verify Address" ||
            //       item.title === "Delete" ||
            //       item.title === "Review & Sign" ||
            //    item.title==="Edit") &&
            //   ( userRole.includes(UserRole.Viewer)|| props.activeTab=="EA - Ready to Confirm")
            // ) {
            //    return null; // Hide the button for viewers
            // }
            if (
               (item.title === "New" ||
                  item.title === "Import Data" ||
                  item.title === "Verify Address" ||
                  item.title === "Delete" ||
                  item.title === "Review & Sign") &&
              ( userRole.includes(UserRole.Viewer)|| props.activeTab=="EA - Ready to Confirm")
            ) {
               return null; // Hide the button for viewers
            }
            if(item.title=="Confirm" && props.activeTab=="Ready to Sign"){
               return null;
            }
            if(userRole.includes(UserRole.PropertyManager) && item.title!="Confirm" && (item.title!="Edit" || (props.activeTab=="Ready to Sign" && item.title=="Edit"))){
               return null;
            }
            return (
               <Button
                  title={item.title}
                  classes={item.classes}
                  type={"button"}
                  isRounded={false}
                  icon={iconComponent}
                  key={index}
                  handleClick={() => handleClick(item)}
                  disabled={item.title === "Verify Address" ? true : false}
               ></Button>
            );
         })}

         {/* <DownloadCsv fetchData={getDataForCsv} fileName="FileEviction.csv" /> */}

          {/* <Menu
            as="div"
            className="relative inline-block text-left z-[11] mb-1 ml-1 md:ml-1.5"
         >
            <div>
               <Menu.Button className="inline-flex w-full justify-center gap-x-1 rounded-md bg-white px-2.5 py-1.5 text-[11px] md:text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
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
               <Menu.Items className="dropdown-menu absolute left-0 md:left-auto md:right-0 mt-2 w-52 md:w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                     <Menu.Item>
                        {({ active }) => (
                           <a
                              className={classNames(
                                 active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                 "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                              )}
                              onClick={handleDownloadDocument}
                           >
                              <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                              Download Documents
                           </a>
                        )}
                     </Menu.Item>
                     <Menu.Item>
                        {({ active }) => (
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
         </Menu>  */}

         {showSpinner && <Spinner></Spinner>}
         {/* This is used when user click on plus icon */}
         {manualCreateFileEviction && (
            <ManualCreateFileEvictions
               manualFileEvictions={manualCreateFileEviction}
               handleManualFileEvictions={(value: boolean) =>
                  setManualCreateFileEviction(value)
               }
            />
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
                              Please select at least 1 record
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
               message={`Are you sure you want to delete ${selectedFileEvictionId.length
                  } ${selectedFileEvictionId.length > 1 ? "evictions" : "eviction"}?`}
               showConfirmation={showDeleteAllConfirmation}
               closePopup={() => {
                  setShowDeleteAllConfirmation(false);
                  // resetSelectedRows();
                  // getFileEvictions(1, 100);
               }}
               handleSubmit={handleDelete}
            ></DeleteConfirmationBox>
         )}
         {/* show import csv pop up */}
         {importCsvPopUp && (
            <>
               <FileEvictionsImportCsv
                  importCsvPopUp={importCsvPopUp}
                  setImportCsvPopUp={(
                     value: SetStateAction<boolean>,
                     resetGrid: boolean
                  ) => {
                     if (resetGrid) {
                        resetSelectedRows();
                     }
                     setImportCsvPopUp(value);
                  }}
                  counties={counties.map(c => c.countyName.toLowerCase())}
               />
            </>
         )}
         {bulkEditPopUp && (
            <>
               <FileEvictionBulkEdit
                  showFileEvictionPopup={bulkEditPopUp}
                  handleClose={() => {
                     setBulkEditPopUp(false);
                     //    resetSelectedRows();
                  }}
                  counties={counties.map(c => c.countyName.toLowerCase())}
               />
            </>
         )}
         {bulkEditEAPopUp && (
            <>
               <FileEvictionEA_BulkEdit
                  showFileEvictionPopup={bulkEditEAPopUp}
                  handleClose={() => {
                     setBulkEditEAPopUp(false);
                     //    resetSelectedRows();
                  }}
                  counties={counties.map(c => c.countyName.toLowerCase())}
               />
            </>
         )}
         {/* This is to show error message when no row is selected from grid */}
         {showPopUpWhenDownloadFileEviction && (
            <>
               <Modal
                  showModal={showPopUpWhenDownloadFileEviction}
                  onClose={() => {
                     setShowPopUpWhenDownloadFileEviction(false);
                     resetSelectedRows();
                  }}
                  width="max-w-md"
               >
                  {/* Container for the content */}
                  <div id="fullPageContent">
                     <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                        <div className="text-center pr-4 sm:text-left">
                           <h3
                              className="text-sm font-semibold leading-5 text-gray-900"
                              id="modal-title"
                           >
                              Would you like to send these documents to additional
                              parties?
                           </h3>
                           <div className="mt-3.5">
                              <label className="inline-flex items-center text-xs">
                                 <input
                                    type="radio"
                                    className="form-radio"
                                    checked={!sendToAdditionalParties}
                                    onChange={() => setSendToAdditionalParties(false)}
                                 />
                                 <span className="ml-1">No, I just want to download.</span>
                              </label>
                              <label className="inline-flex items-center mt-1.5 text-xs">
                                 <input
                                    type="radio"
                                    className="form-radio"
                                    checked={sendToAdditionalParties}
                                    onChange={() => setSendToAdditionalParties(true)}
                                 />
                                 <span className="ml-1.5">
                                    Yes, please send to the following email(s):
                                 </span>
                              </label>
                           </div>
                        </div>
                        {/* Display the grid with file eviction */}
                        <div className="relative pt-2.5">
                           <Formik
                              initialValues={{
                                 email: "",
                              }}
                              validationSchema={
                                 sendToAdditionalParties ? validationSchema : undefined
                              }
                              onSubmit={handleSignIn}
                           >
                              {(formik) => (
                                 <Form className="flex flex-col">
                                    <div className="grid grid-cols-1 gap-3.5">
                                       <div className="relative mt-2.5 text-left">
                                          {sendToAdditionalParties && (
                                             <>
                                                <FormikControl
                                                   control="input"
                                                   type="text"
                                                   label={"Email"}
                                                   name={"email"}
                                                   placeholder={
                                                      "johndoe@gmail.com, sarahjane@yahoo.com, etc"
                                                   }
                                                />
                                                <span className="text-[11px]">
                                                   {" "}
                                                   To input multiple emails, separate by comma.
                                                </span>
                                             </>
                                          )}
                                       </div>
                                    </div>
                                    <div className="pt-2.5 flex justify-end mt-1.5">
                                       <Button
                                          type="button"
                                          isRounded={false}
                                          title="Cancel"
                                          handleClick={() => {
                                             setShowPopUpWhenDownloadFileEviction(false);
                                          }}
                                          classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2.5 px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                                       ></Button>
                                       <Button
                                          type="submit"
                                          isRounded={false}
                                          title={`${sendToAdditionalParties
                                             ? "Send with Email"
                                             : "Download"
                                             }`}
                                          classes="text-xs bg-[#2472db] hover:bg-[#0d5ecb] inline-flex justify-center items-center rounded-md font-semibold py-2.5 px-5 text-white"
                                       ></Button>
                                    </div>
                                 </Form>
                              )}
                           </Formik>
                        </div>
                     </div>
                  </div>
               </Modal>
            </>
         )}
         {confirmApprovalModal && (
      <Modal
         showModal={confirmApprovalModal}
         onClose={() => setConfirmApprovalModal(false)}
         width="max-w-sm"
      >
         <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
            <div className="text-center py-3.5 px-1">
               <div className="text-left mt-1.5">
                  <p className="text-sm mb-3.5 text-gray-500 font-medium text-gray-900">
                        Are you sure you want to confirm these cases?
                  </p>               
               </div>
               <div className="mt-3.5 flex justify-end space-x-0.5">
                  <Button
                     type="button"
                     isRounded={false}
                     title="No"
                     handleClick={() => setConfirmApprovalModal(false)}
                     classes="text-[11px] md:text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg"
                  />
                  <Button
                     type="button"
                     isRounded={false}
                     title="Yes"
                     handleClick={ConfirmApprovals}
                     classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                  />
               </div>
            </div>
         </div>
      </Modal>
   )}
      </>
   );
};
