import React, { Fragment, useState } from "react";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import {
   FaEdit,
   FaEnvelope,
   FaExclamationTriangle,
   FaInfoCircle,
   FaRedo,
   FaSyncAlt,
   FaTrash,
   FaFilePdf,
} from "react-icons/fa";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import { useEmailQueueContext } from "../EmailQueueContext";
import EmailQueueService from "services/email-queue.service";
import EvictionQueuesService from "services/eviction-queue.service";
import { useAuth } from "context/AuthContext";
import { IEmailQueueButton } from "interfaces/email-queue.interface";
import Spinner from "components/common/spinner/Spinner";
import { DispoTaskId } from "interfaces/common.interface";

const EmailQueueBulkEdit = React.lazy(() => import("./EmailQueueActions/EmailQueue_BulkEdit"));
const ServerEmailLogBulkEdit = React.lazy(() => import("./EmailQueueActions/ServerEmailLog_BulkEdit"));
const MailManagementBulkEdit = React.lazy(() => import("./EmailQueueActions/MailManagement_BulkEdit"));

// Utility function for conditional class names
const classNames = (...classes: string[]) => classes.filter(Boolean).join(" ");

// Icon mapping for button rendering
const iconMap: Record<string, JSX.Element> = {
   FaFileExcel: <FaEnvelope className="fa-solid fa-plus mr-0.5 text-xs" />,
   FaEdit: <FaEdit className="fa-solid fa-plus mr-0.5 text-xs" />,
   FaTrash: <FaTrash className="fa-solid fa-plus mr-0.5 text-xs" />,
   FaRedo: <FaRedo className="fa-solid fa-plus mr-1 text-xs" />,
   FaSyncAlt: <FaSyncAlt className="fa-solid fa-plus mr-1 text-xs" />,
   default: <FaEnvelope className="text-[13px] mr-0.5" />,
};

// Props type for the EmailQueueButtons component
type EmailQueueButtonProps = {
   buttons: IEmailQueueButton[];
   activeTab: string;
};

const EmailQueueButtons = (props: EmailQueueButtonProps) => {
   // Consolidated state for modals and messages
   const [modals, setModals] = useState({
      sendEmailConfirmation: false,
      showInfo: false,
      bulkEditPopUp: false,
      bulkEditServerLogPopUp: false,
      bulkEditMailManagementPopUp: false,
      deleteConfirmation: false,
      showSyncPopup: false,
      showErrorMessage: false,
      showErrorMessageWhenNoRowIsSelected: false
   });

   const [errorMessage, setMessage] = useState<string>("");
   const [envelopIds, setEnvelopIds] = useState<string[]>([]);
   const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
   const { selectedStateValue } = useAuth();

   // Context for managing email queues
   const {
      getEmailQueues,
      setShowSpinner,
      setEmailQueues,
      setServerEmailLogs,
      setSelectedEmailQueueIds,
      selectedEmailTaskIds,
      setSelectedEmailTaskIds,
      selectedEmailQueueIds,
      selectedServerLogIds,
      allCounties,
      bulkRecords,
      emailQueues,
   } = useEmailQueueContext();

   // Utility function to toggle modals
   const toggleModal = (modalName: keyof typeof modals, isVisible: boolean, customMessage = "") => {
      setModals((prev) => ({ ...prev, [modalName]: isVisible }));
      if (customMessage) setMessage(customMessage);
   };
   const defaultPageSize = 300;

   const syncCasesStatus = async () => {
      try {
         toggleModal("showSyncPopup", false)
         const response = await EvictionQueuesService.syncManualCaseStatus(selectedEmailTaskIds);
         if (response.status === HttpStatusCode.Ok) {
            setEnvelopIds([]);
            toggleModal("showSyncPopup", false);
            getEmailQueues(1, defaultPageSize, emailQueues.searchParam, emailQueues.companyId, emailQueues.county, emailQueues.serverId, emailQueues.isExpedited, emailQueues.isStateCourt, emailQueues.status, emailQueues.taskStatus, emailQueues.court ?? "");
            toast.success(response.data.message);
         }
      } catch (error) {
         console.error(error);
      } finally {

      }
   };

   // Reset selected rows in the table
   const resetSelectedRows = () => {
      setEmailQueues((prev) => ({
         ...prev,
         items: prev.items.map((item) => ({ ...item, isChecked: false })),
      }));
      setServerEmailLogs((prev) => ({
         ...prev,
         items: prev.items.map((item) => ({ ...item, isChecked: false })),
      }));
   };

   // Send email functionality
   const handleSendEmail = async () => {
      setShowSpinner(true);
      // var taskIds = bulkRecords.filter(
      //    (item) => selectedEmailQueueIds.includes(item.id || ""))
      //    .map((x) => x.taskId)
      //    .filter((taskId): taskId is string => Boolean(taskId));
      // setSelectedTaskIds(taskIds);
      var data: DispoTaskId = { taskIds: [], selectedIds: [] };
      for (let i = 0; i < selectedEmailTaskIds.length; i++) {
         data.taskIds.push(selectedEmailTaskIds[i]);
         data.selectedIds.push(emailQueues.items.find((x) => x.taskId === selectedEmailTaskIds[i])?.id || "");
      };
      console.log("ids", selectedTaskIds, "dispo", selectedEmailQueueIds)
      const response = await EmailQueueService.sendEmailToServer(selectedEmailQueueIds, selectedTaskIds, data, emailQueues.searchParam, emailQueues.companyId, emailQueues.county, emailQueues.serverId, emailQueues.isExpedited, emailQueues.isStateCourt, emailQueues.status, emailQueues.taskStatus, selectedStateValue, emailQueues.court ?? "");
      if (response.status === HttpStatusCode.Ok) {
         if (response.data.isSuccess) {
            toast.success("Email sent successfully to the server and filer.");
         } else {
            toggleModal("showInfo", true, response.data.message);
         }
         setEmailQueues((prev) => ({ ...prev, searchParam: '' }));
         getEmailQueues(1, defaultPageSize, emailQueues.searchParam, emailQueues.companyId, emailQueues.county, emailQueues.serverId, emailQueues.isExpedited, emailQueues.isStateCourt, emailQueues.status, emailQueues.taskStatus, emailQueues.court ?? "");
         setSelectedEmailQueueIds([]);
         setSelectedEmailTaskIds([]);
      }
      setShowSpinner(false);
      toggleModal("sendEmailConfirmation", false);
   }

   // Delete cases functionality
   const handleDeleteCases = async () => {
      setShowSpinner(true);
      const response = await EmailQueueService.deleteCases(selectedEmailQueueIds);
      if (response.status === HttpStatusCode.Ok) {
         if (response.data.isSuccess) {
            toast.success(response.data.message);
         } else {
            toast.error(response.data.message);
         }
         setEmailQueues((prev) => ({ ...prev, searchParam: '' }));
         getEmailQueues(1, defaultPageSize, emailQueues.searchParam, emailQueues.companyId, emailQueues.county, emailQueues.serverId, emailQueues.isExpedited, emailQueues.isStateCourt, emailQueues.status, emailQueues.taskStatus, emailQueues.court ?? "");
         setSelectedEmailQueueIds([]);
         setSelectedEmailTaskIds([]);
      }
      setShowSpinner(false);
      toggleModal("deleteConfirmation", false);
   };

   // Sync cases functionality
   const handleSyncCases = () => {
      const records = bulkRecords.filter(
         (item) => selectedEmailQueueIds.includes(item.id || "") && item.status !== "Accepted"
      );

      const envelopeIds = records
         .map((x) => x.evictionEnvelopeID)
         .filter((id): id is string => id !== undefined && id !== null);

      const taskIds = records
         .filter((x) => Boolean(x.evictionEnvelopeID))
         .map((x) => x.taskId)
         .filter((taskId): taskId is string => Boolean(taskId));

      if (!envelopeIds.length) {
         toggleModal("showErrorMessage", true, "Envelope ID is not present for the selected case.");
      } else {
         setEnvelopIds(envelopeIds);
         setSelectedTaskIds(taskIds);
         toggleModal("showSyncPopup", true);
      }
   };

   // Manual crawling functionality
   const handleManualCrawling = async () => {
      toast.info("Manual Crawling process has started.");
      const response = await EmailQueueService.runManualCrawling();
      if (response.status === HttpStatusCode.Ok) {
         toast.success(response.data.message);
      } else {
         toast.error("Failed to Crawl Data.");
      }
   };

   // Handle document download
   const handleDownloadDocument = async () => {
      setShowSpinner(true);
      const response = await EmailQueueService.getManualCasesDocuments(selectedEmailQueueIds);
      if (response.status === HttpStatusCode.Ok) {
         const pdfUrls: string[] = response.data;
         if (pdfUrls.length > 0) {
            const zip = new JSZip();
            for (const url of pdfUrls) {
               const pdfBlob = await fetch(url).then((res) => res.blob());
               const fileName = url.split("/").pop()!;
               zip.file(fileName, pdfBlob);
            }
            const zipBlob = await zip.generateAsync({ type: "blob" });
            saveAs(zipBlob, "Documents.zip");
            toast.success("Documents downloaded successfully!");
         } else {
            toast.error("No documents found for the selected records.");
         }
      }
      setShowSpinner(false);
   };

   // Render modal dynamically
   const renderModal = (
      show: boolean,
      onClose: () => void,
      title: string,
      content: string,
      actions: JSX.Element
   ) => (
      show && (<>
         <Modal showModal={show} onClose={onClose} width="max-w-md">
            <div id="fullPageContent">
               <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                  <div className="text-center pr-4 sm:text-left">
                     <h3
                        className="text-sm font-semibold leading-5 text-gray-900"
                        id="modal-title"
                     >
                        {content}
                     </h3>
                  </div>
               </div>
               <div className="flex justify-end m-2">
                  {actions}
               </div>
            </div>
         </Modal>
      </>)
   );

   const renderMailManagementButtons = () => (
      <>
         <Menu
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
               <Menu.Items className="dropdown-menu absolute left-0 md:left-auto md:right-0 mt-2 w-60 md:w-60 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1 text-nowrap">
                     <Menu.Item>
                        {({ active }) => (
                           <a
                              className={classNames(
                                 active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                 "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                              )}
                              onClick={() => handleDownloadDocument}
                           >
                              <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                              Download Documents
                           </a>
                        )}
                     </Menu.Item>
                  </div>
               </Menu.Items>
            </Transition>
         </Menu>
      </>
   )

   const handleEdit = () => {
      if (props.activeTab === "Process Server Eviction") {
         // Check if selectedServerLogIds is empty for Process Server Eviction tab
         if (selectedServerLogIds.length === 0) {
            toggleModal("showErrorMessageWhenNoRowIsSelected", true, "Please select at least one record.")
         } else {
            toggleModal("showErrorMessageWhenNoRowIsSelected", false, "");
            toggleModal("bulkEditServerLogPopUp", true);
         }
      } else if (props.activeTab === "Mail Management") {
         // Check if selectedEmailQueueIds is empty for Mail Management tab
         if (selectedEmailQueueIds.length === 0) {
            toggleModal("showErrorMessageWhenNoRowIsSelected", true, "Please select at least one record.")
         } else {
            toggleModal("showErrorMessageWhenNoRowIsSelected", false, "");
            toggleModal("bulkEditMailManagementPopUp", true);
         }
      } else {
         // General case: check selectedEmailQueueIds for other tabs
         if (selectedEmailQueueIds.length === 0) {
            toggleModal("showErrorMessageWhenNoRowIsSelected", true, "Please select at least one record.")
         } else {
            toggleModal("showErrorMessageWhenNoRowIsSelected", false, "");
            toggleModal("bulkEditPopUp", true);
         }
      }
   }

   const renderErrorMessageWhenNoRowIsSelected = () => (
      modals.showErrorMessageWhenNoRowIsSelected && (<>
         <Modal
            showModal={modals.showErrorMessageWhenNoRowIsSelected}
            onClose={() => {
               toggleModal("showErrorMessageWhenNoRowIsSelected", false, "");
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
      </>)
   )

   const renderShowInfoModal = () => (
      <Modal
         showModal={modals.showInfo}
         onClose={() => {
            toggleModal("showInfo", false);
         }}
         width="max-w-md"
      >
         <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
            <div className="text-center py-8">
               <div className="mx-auto flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-blue-100  sm:h-16 sm:w-16 mx-auto">
                  <FaInfoCircle className="h-6 w-6 text-blue-600" />
               </div>
               <div className="mt-2.5 text-center ">
                  <p className="text-xs text-gray-500 text-center font-medium text-gray-600 text-md">
                     {errorMessage}
                  </p>
               </div>
            </div>
         </div>
      </Modal>
   )

   const renderEmailQueueBulkEdit = () => (
      modals.bulkEditPopUp && (
         <>
            <React.Suspense fallback={<Spinner />}>
               <EmailQueueBulkEdit
                  showEmailQueuePopup={modals.bulkEditPopUp}
                  handleClose={() => {
                     toggleModal("bulkEditPopUp", false);
                     resetSelectedRows();
                  }}
                  handleCloseConfirm={() => {
                     toggleModal("bulkEditPopUp", false);
                  }}
                  counties={allCounties.map((c) => c.countyName.toLowerCase())}
               />
            </React.Suspense>
         </>
      )
   )

   const renderBulkEditServerLogPopUp = () => (
      modals.bulkEditServerLogPopUp && (
         <>
            <React.Suspense fallback={<Spinner />}>
               <ServerEmailLogBulkEdit
                  showPopup={modals.bulkEditServerLogPopUp}
                  handleClose={() => {
                     toggleModal("bulkEditServerLogPopUp", false);
                     resetSelectedRows();
                  }}
                  handleCloseConfirm={() => {
                     toggleModal("bulkEditServerLogPopUp", false);
                  }}
               />
            </React.Suspense>
         </>
      )
   )

   const renderBulkEditMailManagementPopUp = () => (
      modals.bulkEditMailManagementPopUp && (<>
         <React.Suspense fallback={<Spinner />}>
            <MailManagementBulkEdit
               showPopup={modals.bulkEditMailManagementPopUp}
               handleClose={() => {
                  toggleModal("bulkEditMailManagementPopUp", false)
                  resetSelectedRows();
               }}
               handleCloseConfirm={() => {
                  toggleModal("bulkEditMailManagementPopUp", false)
               }}
            />
         </React.Suspense>
      </>)
   )

   const renderSyncPopup = () => (
      modals.showSyncPopup && (<>
         <Modal showModal={modals.showSyncPopup} onClose={() => toggleModal("showSyncPopup", false)} width="max-w-xl">
            <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
               <div className="sm:flex sm:items-start">
                  <div className="text-center sm:text-left">
                     <h4
                        className="leading-5 text-gray-900 text-[15.2px] mb-1.5 font-medium"
                        id="modal-title"
                     >
                        Are you sure you want to sync status for the following case(s)?
                     </h4>
                  </div>
               </div>
               <div>
                  <div className="md:grid-cols-2 gap-2.5 sm:gap-3.5 mb-2.5 mt-2">
                     <div className="relative p-2.5 shadow-md rounded border">
                        <p className="text-xs">
                           {envelopIds && envelopIds.length > 0 ? envelopIds.join(",") : "No envelope IDs are available for syncing the status."}
                        </p>
                     </div>
                  </div>
                  <div className="mt-1.5 md:mt-0 py-2.5 flex justify-end items-center">
                     <Button
                        type="button"
                        isRounded={false}
                        title="Cancel"
                        handleClick={() => toggleModal("showSyncPopup", false)}
                        classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                     ></Button>
                     <Button
                        title="Ok"
                        type="button"
                        isRounded={false}
                        handleClick={syncCasesStatus}
                        disabled={(envelopIds && envelopIds.length === 0)}
                        classes="py-2 md:py-2.5 px-4 inline-flex justify-center items-center gap-x-1.5 text-xs font-semibold rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                     ></Button>
                  </div>
               </div>
            </div>
         </Modal>
      </>)
   )

   const handleClick = (button: IEmailQueueButton) => {
      switch (button.title) {
         case "Send Email":
            if (selectedEmailQueueIds.length === 0) {
               toggleModal("showErrorMessageWhenNoRowIsSelected", true, "Please select at least one record.")
            }
            toggleModal("sendEmailConfirmation", true);
            break;
         case "Delete":
            if (selectedEmailQueueIds.length === 0) {
               toggleModal("showErrorMessageWhenNoRowIsSelected", true, "Please select at least one record.")
            }
            toggleModal("deleteConfirmation", true);
            break;
         case "Sync":
            handleSyncCases();
            break;
         case "Manual Crawl":
            handleManualCrawling();
            break;
         case "Edit":
            handleEdit();
            break;
         default:
            console.log(`Unhandled button: ${button.title}`);
      }
   }

   return (
      <>
         {/* Render buttons dynamically */}
         {props.buttons.map((button, index) => (
            <Button
               key={index}
               title={button.title}
               classes={(selectedStateValue.trim().toLowerCase() == "tx" && (button.title == "Manual Crawl" || button.title == "Sync")) || ((props.activeTab === "Process Server Eviction" ||
                  props.activeTab === "Mail Management") &&
                  (button.title === "Send Email" ||
                     button.title === "Manual Crawl" ||
                     button.title === "Sync" ||
                     button.title === "Delete"))
                  ? "hidden"
                  : button.classes
               } icon={iconMap[button.icon] || iconMap.default}
               handleClick={() => handleClick(button)}
               type={"button"}
               isRounded={false}
            />
         ))}

         {props.activeTab === "Mail Management" && (
            renderMailManagementButtons()
         )}

         {renderShowInfoModal()}

         {/* Modals */}
         {renderModal(
            modals.sendEmailConfirmation,
            () => toggleModal("sendEmailConfirmation", false),
            "Send Email Confirmation",
            "Are you sure you want to send email to the process server(s)?",
            <>
               <Button title="No" handleClick={() => toggleModal("sendEmailConfirmation", false)} type="button" isRounded={false}
                  classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg "
               />
               <Button title="Yes" handleClick={handleSendEmail} type="button" isRounded={false}
                  classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
               />
            </>
         )}

         {renderModal(
            modals.deleteConfirmation,
            () => toggleModal("deleteConfirmation", false),
            "Delete Confirmation",
            "Are you sure you want to delete the selected cases?",
            <>
               <Button title="No" handleClick={() => toggleModal("deleteConfirmation", false)} type="button" isRounded={false}
                  classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg "
               />
               <Button title="Yes" handleClick={handleDeleteCases} type="button" isRounded={false}
                  classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
               />
            </>
         )}

         {renderEmailQueueBulkEdit()}

         {renderBulkEditServerLogPopUp()}

         {renderBulkEditMailManagementPopUp()}

         {renderErrorMessageWhenNoRowIsSelected()}

         {renderSyncPopup()}
      </>
   );
};

export default EmailQueueButtons;