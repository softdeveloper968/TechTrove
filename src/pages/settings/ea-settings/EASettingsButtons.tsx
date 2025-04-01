import React, { useState } from "react";
import { toast } from "react-toastify";
import { FaEdit, FaRegWindowClose, FaExclamationTriangle, FaSyncAlt } from "react-icons/fa";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import Spinner from "components/common/spinner/Spinner";
import { useAuth } from "context/AuthContext";
import { useEASettingsContext } from "./EASettingsContext";
import { HttpStatusCode, UserRole } from "utils/enum";
import { IEvictionAutomationButton } from "interfaces/eviction-automation.interface";
import { ISelectOptions } from "interfaces/all-cases.interface";
import EvictionAutomationService from "services/eviction-automation.service";
import AuthService from "services/auth.service";
import EASettings_BulkEdit from "./EASettings_BulkEdit";

type EASettingsButtonsProps = {
   buttons: IEvictionAutomationButton[];
   handleClick: () => void;
};
const initialSelectOption: ISelectOptions = { id: 0, value: '' };

const EASettingsButtons = (props: EASettingsButtonsProps) => {
   const { userRole, company, setUnsignedEvictionApprovalCount, setUnsignedEvictionDismissalCount } = useAuth();
   const {
    showSpinner,
    setShowSpinner,
    eaSettingsQueue,
    getEASettingsQueue,
    selectedEASettingsIds,
    setSelectedEASettingsIds,
 } = useEASettingsContext();
   const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
   const [showSelectionErrorModal, setShowSelectionErrorModal] = useState<boolean>(false);
   const [showBulkEditModal, setShowBulkEditModal] = useState<boolean>(false);
   const [modalType, setModalType] = useState<string | null>(null);
   const [showSyncConfirmationModal, setShowSyncConfirmationModal] = useState<boolean>(false);
   const handleShowDeleteEviction = () => {
      setModalType('delete');
      setShowConfirmationModal(true);
   };

   const handleCloseConfirmation = () => {
      setShowConfirmationModal(false);
      setModalType(null);
   };

   const handleConfirmation = () => {
       handleDeleteEviction();
    setShowConfirmationModal(false);
    setModalType(null);
 };


   const handleDeleteEviction = async () => {
      setShowSpinner(true);
      const response = await EvictionAutomationService.deleteEvictionAutomationQueues(
        selectedEASettingsIds
      );
      if (response.status === HttpStatusCode.OK) {
        getEASettingsQueue(1, 100, "");
         handleUnsignedCaseCount();
         toast.success("Record(s) removed successfully");
      }
      setShowSpinner(false);
      setSelectedEASettingsIds([]);
   };
   const handleUnsignedCaseCount = async () => {
      try {
         const response = await AuthService.getUnsignedCaseCount();
         if (response.status === HttpStatusCode.OK) {
            setUnsignedEvictionApprovalCount(response.data.unsignedEvictionApprovalCount);
            setUnsignedEvictionDismissalCount(response.data.unsignedEvictionDismissalCount);
         }
      } catch (error) {
         console.log(error);
      }
   };
   const SyncPropexo = async () => {
      setShowSyncConfirmationModal(false); 
      toast.success("Propexo sync process has started.");
      const ids = selectedEASettingsIds;
      const response = await EvictionAutomationService.syncPropexo(
         ids,eaSettingsQueue.searchParam,eaSettingsQueue.companyId,eaSettingsQueue.county
         ,eaSettingsQueue.isExpedited,eaSettingsQueue.isStateCourt
      );
      if (response.status === HttpStatusCode.OK) {           
         toast.success("Sync completed successfully.");
      }         
}
   const handleClick = (button: IEvictionAutomationButton) => {
      switch (button.title) {
         case "Edit":
            console.log('edit')
            if (!selectedEASettingsIds.length) {
               setShowSelectionErrorModal(true);
            } else {
               setShowBulkEditModal(true);
            }
            break;
         case "Delete":
            if (!selectedEASettingsIds.length) {
               setShowSelectionErrorModal(true);
            } else {
               handleShowDeleteEviction();
            }
            break;
         case "Sync":
               setShowSyncConfirmationModal(true);
               break;
         default:
            // Handle default case or unknown button types
            console.log(`Unknown button type: ${button.icon}`);
      }
   };

   return (
      <>
         {props.buttons.map((item: IEvictionAutomationButton, index: number) => {
            let iconComponent;
            // Switch statement to determine the icon based on the provided icon type
            switch (item.icon) {
               case "FaEdit":
                  iconComponent = (
                     <FaEdit className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               case "FaRegWindowClose":
                  iconComponent = (
                     <FaRegWindowClose className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               case "FaSyncAlt":
                     iconComponent = (
                        <FaSyncAlt className="fa-solid fa-plus  mr-1 text-xs" />
                     );
                     break;
               default:
                  // Provide a default case or handle unknown icon types
                  iconComponent = <></>;
            }

            return (
               <>
                  {(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin) || userRole.includes(UserRole.Admin) || userRole.includes(UserRole.PropertyManager) || userRole.includes(UserRole.Signer)) && (
                     <Button
                        title={item.title}
                        classes={item.classes}
                        type="button"
                        isRounded={false}
                        icon={iconComponent}
                        key={index}
                        handleClick={() => handleClick(item)}
                     />
                  )}
               </>
            );
         })}
         {/* Delete eviction confirmation modal */}
         {showConfirmationModal && (
            <Modal
               showModal={showConfirmationModal}
               onClose={handleCloseConfirmation}
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
                           {modalType === 'delete'
                              ? `Are you sure you want to delete ${selectedEASettingsIds.length} record(s)?`
                              : `Are you sure you want to confirm ${selectedEASettingsIds.length} record(s)?`}
                        </h3>
                     </div>
                  </div>
                  <div className="flex justify-end m-2">
                     <Button
                        type="button"
                        isRounded={false}
                        title="No"
                        handleClick={handleCloseConfirmation}
                        classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg "
                     ></Button>
                     <Button
                        handleClick={handleConfirmation}
                        title="Yes"
                        isRounded={false}
                        type={"button"}
                        classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                     ></Button>
                  </div>
               </div>
            </Modal>
         )}
         {/* No record selected modal  */}
         {showSelectionErrorModal && (
            <Modal
               showModal={showSelectionErrorModal}
               onClose={() => setShowSelectionErrorModal(false)}
               width="max-w-md"
            >
               <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
                  <div className="text-center py-8">
                     <div className="mx-auto flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-red-100 mx-auto">
                        <FaExclamationTriangle className="h-5 w-5 text-red-600" />
                     </div>
                     <div className="mt-2.5 text-center ">
                        <p className="text-xs text-gray-500 text-center font-medium text-gray-600 text-md">
                           Please select at least one record.
                        </p>
                     </div>
                  </div>
               </div>
            </Modal>
         )}
         {/* Bulk edit eviction modal */}
         {showBulkEditModal && (
            <EASettings_BulkEdit
               showFileEvictionPopup={showBulkEditModal}
               handleClose={() => setShowBulkEditModal(false)}
            />
         )}
         {showSyncConfirmationModal && (
            <Modal
               showModal={showSyncConfirmationModal}
               onClose={()=>setShowSyncConfirmationModal(false)}
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
                          Are you sure you want to sync the records?
                        </h3>
                     </div>
                  </div>
                  <div className="flex justify-end m-2">
                     <Button
                        type="button"
                        isRounded={false}
                        title="No"
                        handleClick={()=>setShowSyncConfirmationModal(false)}
                        classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg "
                     ></Button>
                     <Button
                        handleClick={SyncPropexo}
                        title="Yes"
                        isRounded={false}
                        type={"button"}
                        classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                     ></Button>
                  </div>
               </div>
            </Modal>
         )}
      </>
   );
};

export default EASettingsButtons;