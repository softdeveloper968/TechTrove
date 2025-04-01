import React, { SetStateAction, useState, useEffect, ChangeEvent } from "react";
import { toast } from "react-toastify";
import { FaCheck, FaEdit, FaRegWindowClose, FaExclamationTriangle, FaFileExcel, FaPlus, FaSyncAlt } from "react-icons/fa";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import Spinner from "components/common/spinner/Spinner";
import DropdownPresentation from "components/common/dropdown/DropDown"
import { useAuth } from "context/AuthContext";
import { useEvictionAutomationContext } from "../EvictionAutomationContext";
import { HttpStatusCode, UserRole } from "utils/enum";
import EvictionAutomationBulkEdit from "./EvictionAutomationActions/EvictionAutomation_BulkEdit";
import EvicitonAutomationAddSetting from "./EvictionAutomationActions/EvictionAutomationSetting_AddForm";
import EvictionAutomation_FileDismissal from "./EvictionAutomationActions/EvictionAutomation_FileDismissal";
import EvictionAutomationNoticesImportCsv from "./EvictionAutomationActions/EvictionAutomation_NoticesImportCSV";
import { IEvictionAutomationButton, IEvictionAutomationQueueItem, ITransactionCodesItem } from "interfaces/eviction-automation.interface";
import { IFileEvictionsItems } from "interfaces/file-evictions.interface";
import { ISelectOptions } from "interfaces/all-cases.interface";
import EvictionAutomationService from "services/eviction-automation.service";
import AuthService from "services/auth.service";
import TransactionCodesFormPopup from "./EvictionAutomationActions/TransactionCodes_EditForm";
import { adjustDateSystemTimezone } from "utils/helper";
import EvictionAutomationSettingFormPopup from "./EvictionAutomationActions/EASettings_AddForm";
import EASettingFormPopup from "./EvictionAutomationActions/EvictionAutomationSetting_AddForm";

type ProcessServerButtonsProps = {
   activeTab: string;
   buttons: IEvictionAutomationButton[];
   handleClick: () => void;
   handleReviewSign: () => void;
   handleCreateNotice: () => void;
};
const initialSelectOption: ISelectOptions = { id: 0, value: '' };

const EvictionAutomationButtons = (props: ProcessServerButtonsProps) => {
   const { userRole, company, setUnsignedEvictionApprovalCount, setUnsignedEvictionDismissalCount } = useAuth();
   const {
      showSpinner,
      setShowSpinner,
      evictionAutomationQueue,
      getEvictionAutomationQueue,
      selectedEvictionAutomationQueueIds,
      setSelectedEvictionAutomationQueueIds,
      selectedEvictionApprovalId,
      selectedEvictionApprovedId,
      selectedEvictionDismissalApprovalId,
      selectedEvictionDismissalApprovedId,
      evictionAutomationApprovalsQueue,
      evictionAutomationApprovedQueue,
      evictionAutomationDismissalApprovalsQueue,
      evictionAutomationDismissalApprovedQueue,
      selectedEvictionAutomationStatusIds,
      setSelectedEvictionStatusId,
      getEvictionAutomationApprovalsQueue,
      getEvictionAutomationDismissalApprovalsQueue,
      setSelectedEvictionApprovalId,
      setSelectedEvictionApprovedId,
      setSelectedEvictionDismissalApprovalId,
      selectedEvictionNoticeId,
      selectedEvictionNoticeConfirmedId,
      evictionAutomationNoticesConfirmQueue,
      evictionAutomationNoticesConfirmedQueue,
      setSelectedEvictionNoticeId,
      getEvictionAutomationNoticeQueue,
      getTransactionCodes,
      transactionCodes
   } = useEvictionAutomationContext();
   const [showConfirmationModal, setShowConfirmationModal] = useState<boolean>(false);
   const [showSelectionErrorModal, setShowSelectionErrorModal] = useState<boolean>(false);
   const [showBulkEditModal, setShowBulkEditModal] = useState<boolean>(false);
   const [modalType, setModalType] = useState<string | null>(null);
   const [importCsvPopUp, setImportCsvPopUp] = useState<boolean>(false);
   const [addSetting, setAddSetting] = useState<boolean>(false);
   const [addCRMSetting, setAddCRMSetting] = useState<boolean>(false);
   const [showAddTransactionCode, setShowAddTransactionCode] = useState<boolean>(false);
   const [isEditSettingMode, setIsEditSettingMode] = useState<boolean>(false);
   const [showApprovalModal, setShowApprovalModal] = useState<boolean>(false);
   const [showNoticeModal, setShowNoticeModal] = useState<boolean>(false);
   const [confirmApprovalModal, setConfirmApprovalModal] = useState<boolean>(false);
   const [sign, setSign] = useState('');
   const [pin, setPin] = useState('');
   const [isPinValid, setIsPinValid] = useState(true);
   const [isSignValid, setIsSignValid] = useState(true);
   const [showAddtoDismissalsPopup, setShowAddtoDismissalsPopup] = useState<boolean>(false);
   const [showReprocessDropdown, setShowReprocessDropdown] = useState<boolean>(false);
   const [showSyncConfirmationModal, setShowSyncConfirmationModal] = useState<boolean>(false);

   const [reprocessingOptionList, setReprocessingOptionList] = useState<ISelectOptions[]>(
      [
         {
            id: 1,
            value: "All Default"
         },
         {
            id: 5,
            value: "All Today"
         },
         {
            id: 2,
            value: "Dismissal Default"
         },
         {
            id: 6,
            value: "Dismissal Today"
         },
         {
            id: 3,
            value: "Filing Default"
         },
         {
            id: 7,
            value: "Filing Today"
         },
         {
            id: 4,
            value: "Notice Default"
         },
         {
            id: 8,
            value: "Notice Today"
         },
         {
            id: 0,
            value: "Reprocess"
         }
      ]
   );
   const [selectedReprocessingOption, setSelectedReprocessingOption] = useState<ISelectOptions>();

   useEffect(() => {
      setSign('');
      setIsSignValid(true);
      setSelectedReprocessingOption({ id: 0, value: "Reprocess" });
      // setSelectedEvictionStatusId([]);
   }, [props.activeTab]);

   const [selectedRowData, setSelectedRowData] = useState<ITransactionCodesItem>({
      id: "",
      companyName: "",
      clientId: "",
      integrationId: "",
      propertyId: "",
      propertyName: "",
      transactionCodes: "",
      ownerId:"",
      ownerName:"",
      propexoTransactionCodes: [
         {
            id: "",
            transactionCodeId: "",
            transactionCodeName: "",
            transactionCodeDescription: "",
            isRent: false,
            CompanyPropertyTransactionCodeId: "",
            isSubsidy: false,
            transactionCodeShortDescription: ""
         }
      ],
   });
   const handleReprocessingOptionChange = async (event: ChangeEvent<HTMLSelectElement>) => {
      setSelectedReprocessingOption({ id: event.target.value, value: reprocessingOptionList.find(x => x.id === event.target.value)?.value || '' });
      if (event.target.value != "0") {
         setShowSpinner(true);
         const apiResponse = await EvictionAutomationService.statusReprocessing(selectedEvictionAutomationStatusIds, parseInt(event.target.value));
         if (apiResponse.status === HttpStatusCode.OK) {
            if (apiResponse.data.statusCode != HttpStatusCode.OK) {
               toast.error(apiResponse.data.message, {
                  position: toast.POSITION.TOP_RIGHT,
               });
            }
            else {
               // setAllCompanies(apiResponse.data);
               toast.success(apiResponse.data.message, {
                  position: toast.POSITION.TOP_RIGHT,
               });
            }
            setSelectedReprocessingOption({ id: 0, value: "Reprocess" });
            setSelectedEvictionStatusId([]);
         }
         else {
            toast.error(apiResponse.data.message, {
               position: toast.POSITION.TOP_RIGHT,
            });
            setSelectedReprocessingOption({ id: 0, value: "Reprocess" });
            setSelectedEvictionStatusId([]);
         }

         setShowSpinner(false);
      }

      // getFileEvictions(1,100,"",event.target.value.toString());
   };
   const handleInputChange = (e: any) => {
      setSign(e.target.value);
      if (!isSignValid) {
         setIsSignValid(true);
      }
   };
   const handleConfirmInputChange = (e: any) => {
      setPin(e.target.value);
      if (!isPinValid) {
         setIsPinValid(true);
      }
   };
   const [firstApproval, setFirstApproval] = useState<IFileEvictionsItems>();

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
      } else if (selectedEvictionDismissalApprovalId.length) {
         return checkAllMatch(evictionAutomationDismissalApprovalsQueue.items, selectedEvictionDismissalApprovalId);
      }
      else {
         return checkAllMatch(evictionAutomationNoticesConfirmQueue.items, selectedEvictionNoticeId);
      }
   };


   const ConfirmApprovals = async () => {

      var batchPin = "";
      if (localStorage.getItem("confirmPin")) {
         batchPin = localStorage.getItem("confirmPin") ?? "";
      }
      else {
         batchPin = pin.trim()
      }
      if (batchPin.trim() === '') {
         setIsPinValid(false);
      }

      else {
         const ids = selectedEvictionDismissalApprovalId.length ? selectedEvictionDismissalApprovalId : selectedEvictionApprovalId;
         const response = await EvictionAutomationService.ConfirmApprovals(
            firstApproval?.ownerId ?? "",
            firstApproval?.propertyId ?? "",
            batchPin,
            firstApproval?.crmName ?? "",
            ids,
            selectedEvictionDismissalApprovalId.length > 0
         );
         if (response.status === HttpStatusCode.OK) {
            if (selectedEvictionDismissalApprovalId.length)
               getEvictionAutomationDismissalApprovalsQueue(1, 100, false, evictionAutomationDismissalApprovalsQueue.isViewAll)
            else
               getEvictionAutomationApprovalsQueue(1, 100, false, evictionAutomationApprovalsQueue.isViewAll);
            handleUnsignedCaseCount();
            setSelectedEvictionApprovalId([]);
            toast.success("Cases successfully approved.");
         }
         setConfirmApprovalModal(false);
      }
   }

   const handleApproval = async () => {
      if (sign.trim() === '') {
         setIsSignValid(false);
      } else {
         var selectedIds = props.activeTab == "Sign Evictions" ? selectedEvictionApprovedId : selectedEvictionApprovalId;
         const response = await EvictionAutomationService.SignApproveCases(
            sign.trim(), selectedIds
         );
         if (response.status === HttpStatusCode.OK) {
            if (props.activeTab == "Sign Evictions")
               getEvictionAutomationApprovalsQueue(1, 100, true, evictionAutomationApprovedQueue.isViewAll);
            else
               getEvictionAutomationApprovalsQueue(1, 100, false, evictionAutomationApprovalsQueue.isViewAll);
            handleUnsignedCaseCount();
            setSelectedEvictionApprovalId([]);
            setSelectedEvictionApprovedId([]);
            toast.success("Cases successfully approved.");
         }
         setShowApprovalModal(false);
      }
   };
   const handleNotice = async () => {
      var batchPin = "";
      if (localStorage.getItem("confirmPin")) {
         batchPin = localStorage.getItem("confirmPin") ?? "";
      }
      else {
         batchPin = pin.trim()
      }
      if (batchPin.trim() === '') {
         setIsPinValid(false);
      }
      //var selectedIds = props.activeTab === "Confirm Notices" ? selectedEvictionNoticeId : selectedEvictionNoticeId;
      const response = await EvictionAutomationService.ConfirmEvictionNotices(firstApproval?.ownerId ?? "",
         firstApproval?.propertyId ?? "",
         batchPin,
         firstApproval?.crmName ?? "",
         selectedEvictionNoticeId,
      );
      if (response.status === HttpStatusCode.OK) {
         getEvictionAutomationNoticeQueue(1, 100, false, false);
         setSelectedEvictionNoticeId([]);
         toast.success("Notices successfully confirmed.");
      }
      setShowNoticeModal(false);
   };
   const handleShowDeleteEviction = () => {
      setModalType('delete');
      setShowConfirmationModal(true);
   };

   // const handleShowConfirmEviction = () => {
   //    setModalType('confirm');
   //    setShowConfirmationModal(true);
   // };

   const handleConfirmation = () => {
      if (modalType === 'delete') {
         handleDeleteEviction();
      } else if (modalType === 'confirm') {
         handleConfirmEviction();
      }
      setShowConfirmationModal(false);
      setModalType(null);
   };

   const handleCloseConfirmation = () => {
      setShowConfirmationModal(false);
      setModalType(null);
   };

   const handleConfirmEviction = () => {
      setShowSpinner(true);

      setShowSpinner(false);
   };

   const handleDeleteEviction = async () => {
      setShowSpinner(true);
      const response = await EvictionAutomationService.deleteEvictionAutomationQueues(
         selectedEvictionAutomationQueueIds
      );
      if (response.status === HttpStatusCode.OK) {
         getEvictionAutomationQueue(1, 100, "");
         handleUnsignedCaseCount();
         toast.success("Record(s) removed successfully");
      }
      setShowSpinner(false);
      setSelectedEvictionAutomationQueueIds([]);
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

   const handleCreateTransactionCode = async (formValues: ITransactionCodesItem) => {
      try {
         // Display spinner while processing
         setShowSpinner(true);

         const payload: ITransactionCodesItem = {
            companyName: formValues.companyName,
            clientId: formValues.clientId,
            integrationId: formValues.integrationId,
            propertyId: formValues.propertyId,
            propertyName: formValues.propertyName,
            ownerId: formValues.ownerId,
            ownerName:formValues.ownerName,
            transactionCodes: formValues.transactionCodes,
            propexoTransactionCodes: formValues.propexoTransactionCodes
               .map((item) => ({
                  transactionCodeId: item.transactionCodeId,
                  transactionCodeName: item.transactionCodeName,
                  transactionCodeDescription: item.transactionCodeDescription,
                  isRent: item.isRent,
                  isSubsidy: item.isSubsidy,
                  transactionCodeShortDescription: item.transactionCodeShortDescription
               })),
         }
         // Attempt to delete the county
         const response = await EvictionAutomationService.createTransactionCode(payload);

         // Check if the deletion was successful
         if (response.status === HttpStatusCode.OK) {
            // Show success message
            toast.success("Record added successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });
            setShowAddTransactionCode(false);
            // Close the confirmation pop-up and refresh the list
            getTransactionCodes(transactionCodes.currentPage, transactionCodes.pageSize);
         }
      } catch (error) {
         // Handle errors if needed
         console.error("Error deleting transactionCodes:", error);
      } finally {
         // Hide the spinner regardless of the outcome
         setShowSpinner(false);
      }
   };
   const handleClick = (button: IEvictionAutomationButton) => {
      switch (button.title) {
         case "Add":
            setAddSetting(true);
            break;
         case "Add ":
               setAddCRMSetting(true);
               break;
         case "Edit":
            console.log('edit')
            if (!selectedEvictionAutomationQueueIds.length) {
               setShowSelectionErrorModal(true);
            } else {
               setShowBulkEditModal(true);
            }
            break;
         case "Delete":
            if (!selectedEvictionAutomationQueueIds.length) {
               setShowSelectionErrorModal(true);
            } else {
               handleShowDeleteEviction();
            }
            break;
         case "Import Data":
            if (props.activeTab == "Confirm Notices") {
               setImportCsvPopUp(true);
            }
            break;
         // case "Confirm":
         //    if (!selectedEvictionAutomationQueueIds.length) {
         //       setShowSelectionErrorModal(true);
         //    } else {
         //       handleShowConfirmEviction();
         //    }
         //    break;
         case "Approve/Sign":

            if (selectedEvictionApprovalId.length) {

               props.handleReviewSign();


            }
            else if (selectedEvictionDismissalApprovalId.length) {
               setShowAddtoDismissalsPopup(true);
            }
            else {
               //setShowApprovalModal(true);
               setShowSelectionErrorModal(true);
            }
            break;
         case "Confirm":
            if (props.activeTab == "Confirm Notices") {
               if (!selectedEvictionNoticeId.length)
                  setShowSelectionErrorModal(true);
               else {
                  var result = handleConfirmApprovals();
                  if (result) {
                     setPin("");
                     setShowNoticeModal(true);
                  }
                  else {
                     toast.error("Plese select cases who has same OwnerId and PropertyId");
                  }
               }
            } else if (selectedEvictionApprovalId.length || selectedEvictionDismissalApprovalId.length) {
               // setShowApprovalModal(true);
               var result = handleConfirmApprovals();
               if (result) {
                  setPin("");
                  setConfirmApprovalModal(true);
               }
               else {
                  toast.error("Plese select cases who has same OwnerId and PropertyId");
               }
            }

            else {
               if (!selectedEvictionDismissalApprovalId.length)
                  setShowSelectionErrorModal(true);
            }
            break;
         case "Sign":

            if (selectedEvictionApprovedId.length) {
               //setShowSelectionErrorModal(true);
               props.handleReviewSign();
            }
            else if (selectedEvictionDismissalApprovedId.length) {
               setShowAddtoDismissalsPopup(true);
            }
            else {
               setShowSelectionErrorModal(true);

            }
            break;
         case "Create Notice":
            if (selectedEvictionNoticeConfirmedId.length) {
               props.handleCreateNotice();
            }
            else {
               setShowSelectionErrorModal(true);
            }
            break;
         case "Confirm/Create Notice":
            if (selectedEvictionNoticeId.length) {
               props.handleCreateNotice();
            }
            else {
               setShowSelectionErrorModal(true);
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

   const handleCreateEASetting = async (formValues: IEvictionAutomationQueueItem) => {
      try {
         
         // Display spinner while processing
         setShowSpinner(true);
         const noticeDelinquencyDate = formValues.noticeDelinquencyDate != null? new Date(formValues.noticeDelinquencyDate ?? ""): null;
         const noticeDismissalDate = formValues.noticeDismissalDate != null? new Date(formValues.noticeDismissalDate ?? ""): null;
         // formValues.evictionFilingDays = formValues.evictionFilingDate;
         // const evictionDeliquencyDate = new Date(formValues.evictionFilingDate ?? "");
         // Adjust to local timezone offset
         formValues.noticeConfirmEmail = formValues.noticeConfirmEmail ?? "";
         formValues.noticeSignerEmail = formValues.noticeSignerEmail?? "" ;
         // formValues.noticeDelinquencyDate=formValues.noticeDelinquencyDate != null? adjustDateSystemTimezone(formValues.noticeDelinquencyDate as string):null,
         // formValues.noticeDismissalDate=formValues.noticeDismissalDate != null? adjustDateSystemTimezone(formValues.noticeDelinquencyDate as string):null,
         formValues.noticeDelinquencyDate = noticeDelinquencyDate != null? new Date(noticeDelinquencyDate.getTime() + (noticeDelinquencyDate.getTimezoneOffset() * 60000)):null;
         formValues.noticeDismissalDate = noticeDismissalDate != null? new Date(noticeDismissalDate.getTime() + (noticeDismissalDate.getTimezoneOffset() * 60000)):null;
        // formValues.evictionFilingDate = new Date(evictionDeliquencyDate.getTime() - (evictionDeliquencyDate.getTimezoneOffset() * 60000));
         // Attempt to delete the county
         // if (formValues.dismissalNotificationDay && Array.isArray(formValues.dismissalNotificationDay)) {
         //    formValues.dismissalNotificationDay = formValues.dismissalNotificationDay.join(','); // Join with a comma or any other delimiter
         //  }
         const response = await EvictionAutomationService.addEvictionAutomationSetting(formValues);

         // Check if the deletion was successful
         if (response.status === HttpStatusCode.OK) {
            // Show success message
            toast.success("Record added successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });
            getEvictionAutomationQueue(1, 100);
            setAddSetting(false);
            setAddCRMSetting(false);
         }
         else {
            toast.error(response.statusText, {
               position: toast.POSITION.TOP_RIGHT,
            });
         }
      } catch (error) {
         // Handle errors if needed
         console.error("Error deleting county:", error);
      } finally {
         // Hide the spinner regardless of the outcome
         setSelectedEvictionAutomationQueueIds([]);
         setShowSpinner(false);
      }
   };

   const SyncPropexo = async () => {
         setShowSyncConfirmationModal(false); 
         toast.success("Propexo sync process has started.");
         const ids = selectedEvictionAutomationQueueIds;
         const response = await EvictionAutomationService.syncPropexo(
            ids,evictionAutomationQueue.searchParam,evictionAutomationQueue.companyId,evictionAutomationQueue.county
            ,evictionAutomationQueue.isExpedited,evictionAutomationQueue.isStateCourt
         );
         if (response.status === HttpStatusCode.OK) {           
            toast.success("Sync completed successfully");
         }         
   }

   const SyncCRM = async () => {
      setShowSyncConfirmationModal(false); 
      toast.success("CRM sync process has started.");
      const ids = selectedEvictionAutomationQueueIds;
      const response = await EvictionAutomationService.syncCRM(
         ids,evictionAutomationQueue.searchParam,evictionAutomationQueue.companyId,evictionAutomationQueue.county
         ,evictionAutomationQueue.isExpedited,evictionAutomationQueue.isStateCourt
      ); 
      if (response.status === HttpStatusCode.OK) {           
         toast.success("Sync completed successfully");
      }         
}

   const isShowButton = (title: string) => {
      if (props.activeTab == "Hott Settings" && ((title == "Add" && (userRole.includes(UserRole.C2CAdmin)|| userRole.includes(UserRole.ChiefAdmin))) || title == "Edit" || title == "Delete"))
         return false;
      // else if (props.activeTab == "Settings" && ((title == "AddEASetting" && (userRole.includes(UserRole.C2CAdmin)|| userRole.includes(UserRole.ChiefAdmin))) || title == "Edit" || title == "Delete"))
      //    return false;
      else if ((props.activeTab == "Confirm Delinquencies" || props.activeTab == "Confirm Dismissals" || props.activeTab == "Confirm Notices") && title == "Confirm" && userRole.includes(UserRole.PropertyManager))
         return false;
      else if ((props.activeTab == "Confirm Delinquencies" || props.activeTab == "Confirm Dismissals") && !userRole.includes(UserRole.PropertyManager) && title == "Approve/Sign")
         return false;
      else if ((props.activeTab == "Sign Evictions" || props.activeTab == "Sign Dismissals") && !userRole.includes(UserRole.PropertyManager) && title == "Sign")
         return false;
      // else if ((props.activeTab == "Confirm Notices")  &&[UserRole.PropertyManager, UserRole.Admin, UserRole.Signer].some(role => userRole.includes(role)) && title == "Confirm")
      //    return false;
      // else if ((props.activeTab ==="Confirm Notices") && userRole.includes(UserRole.Admin) && title == "Import Data")
      //    return false;
      else if ((props.activeTab == "Confirm Notices") && title == "Confirm/Create Notice" && !userRole.includes(UserRole.PropertyManager))
         return false;
      else if ((props.activeTab == "Ready to Sign") && title == "Create Notice" && !userRole.includes(UserRole.PropertyManager))
         return false;
      else if(title=="Sync" && (props.activeTab == "CRM Settings"))
         return false;
      else if (props.activeTab == "CRM Settings" && ((title == "Add " && (userRole.includes(UserRole.C2CAdmin)|| userRole.includes(UserRole.ChiefAdmin))) || title == "Edit" || title == "Delete"))
         return false;
      // else if( props.activeTab == "Confirm Notices" && title == "Confirm" && !userRole.includes(UserRole.PropertyManager)){
      //    
      //    return true
      // }
      return true;
   }

   return (
      <>
         {props.buttons.map((item: IEvictionAutomationButton, index: number) => {
            let iconComponent;
            // Switch statement to determine the icon based on the provided icon type
            switch (item.icon) {
               case "FaPlus":
                  iconComponent = (
                     <FaPlus className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
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
               case "FaFileExcel":
                  iconComponent = (
                     <FaFileExcel className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               case "FaCheck":
                  iconComponent = (
                     <FaCheck className="fa-solid fa-plus  mr-1 text-xs" />
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
                        classes={isShowButton(item.title) ? "hidden" : item.classes}
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
         {(props.activeTab === "Status") && (
            <div className="flex items-end filterSec logsFilter">
               <div className="relative ml-2">
                  <DropdownPresentation
                     heading=""
                     selectedOption={selectedReprocessingOption}
                     handleSelect={handleReprocessingOptionChange}
                     options={reprocessingOptionList.sort()}
                     disabled={selectedEvictionAutomationStatusIds.length < 1}
                  // placeholder="Select Company"
                  />
               </div>
            </div>
         )}

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
                              ? `Are you sure you want to delete ${selectedEvictionAutomationQueueIds.length} record(s)?`
                              : `Are you sure you want to confirm ${selectedEvictionAutomationQueueIds.length} record(s)?`}
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
            <EvictionAutomationBulkEdit
               showFileEvictionPopup={showBulkEditModal}
               handleClose={() => setShowBulkEditModal(false)}
            />
         )}
         {/* Add Transaction Codes modal */}
         {/* {showAddTransactionCode && (
            <TransactionCodesFormPopup
            showPopup={showAddTransactionCode}
            closePopup={(shouldRefresh: string) => {
               if (shouldRefresh === "refresh") {
                  getTransactionCodes(transactionCodes.currentPage, transactionCodes.totalPages);
               }
               setShowAddTransactionCode(false);
            }}
            isEditMode={false}
            initialValues={selectedRowData}
            onSubmit={(formValues: ITransactionCodesItem) => {   
               handleCreateTransactionCode(formValues);
            }}
         ></TransactionCodesFormPopup>
         )} */}
         {/* {importCsvPopUp && (
            <>
               <EvictionImportCsv
                  importCsvPopUp={importCsvPopUp}
                  setImportCsvPopUp={(value: SetStateAction<boolean>) => {
                     setImportCsvPopUp(value);
                  }}
               />
            </>
         )} */}
         {/* show import csv pop up */}
         {importCsvPopUp && (
            <>
               <EvictionAutomationNoticesImportCsv
                  importCsvPopUp={importCsvPopUp}
                  setImportCsvPopUp={(
                     value: SetStateAction<boolean>,
                     resetGrid: boolean
                  ) => {
                     if (resetGrid) {
                        // resetSelectedRows();
                     }
                     setImportCsvPopUp(value);
                  }} counties={[]} />
            </>
         )}
         {addSetting && (
            <EvictionAutomationSettingFormPopup
               showPopup={addSetting}
               closePopup={(shouldRefresh: string) => {
                  if (shouldRefresh === "refresh") {
                     // getCourts(courts.currentPage, courts.totalPages);
                  }
                  setAddSetting(false);
               }}
               isEditMode={isEditSettingMode}
               onSubmit={(formValues: IEvictionAutomationQueueItem) => {
                  
                  handleCreateEASetting(formValues)
               }}
            />
         )}
           {addCRMSetting && (
            <EASettingFormPopup
               showPopup={addCRMSetting}
               closePopup={(shouldRefresh: string) => {
                  if (shouldRefresh === "refresh") {
                     // getCourts(courts.currentPage, courts.totalPages);
                  }
                  setAddCRMSetting(false);
               }}
               isEditMode={isEditSettingMode}
               onSubmit={(formValues: IEvictionAutomationQueueItem) => {
                  handleCreateEASetting(formValues)
               }}
            />
         )}
         {/* {addEASetting && (
            <EvictionAutomationSettingFormPopup
               showPopup={addEASetting}
               closePopup={(shouldRefresh: string) => {
                  if (shouldRefresh === "refresh") {
                     // getCourts(courts.currentPage, courts.totalPages);
                  }
                  setAddEASetting(false);
               }}
               isEditMode={isEditSettingMode}
               onSubmit={(formValues: IEvictionAutomationQueueItem) => {
                  handleCreateEASetting(formValues)
               }}
            />
         )} */}
         {showApprovalModal && (
            <Modal
               showModal={showApprovalModal}
               onClose={() => setShowApprovalModal(false)}
               width="max-w-sm"
            >
               <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
                  <div className="text-center py-3.5 px-1">
                     <div className="text-left mt-1.5">
                        <p className="text-sm mb-3.5 text-gray-500 font-medium text-gray-900">
                           Are you sure you want to approve these cases?
                        </p>
                        <label className="text-gray-600 text-[11px] md:text-xs font-medium">Sign</label>
                        <input
                           type="text"
                           value={sign}
                           onChange={handleInputChange}
                           className={`peer outline-none p-2 md:p-2.5 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none ${!isSignValid ? 'border-red-500' : ''}`}
                        />
                        {!isSignValid && (
                           <p className="text-red-500 text-xs mt-1.5">Sign field is required</p>
                        )}
                     </div>
                     <div className="mt-3.5 flex justify-end space-x-0.5">
                        <Button
                           type="button"
                           isRounded={false}
                           title="No"
                           handleClick={() => setShowApprovalModal(false)}
                           classes="text-[11px] md:text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg"
                        />
                        <Button
                           type="button"
                           isRounded={false}
                           title="Yes"
                           handleClick={handleApproval}
                           classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                        />
                     </div>
                  </div>
               </div>
            </Modal>
         )}
         {showNoticeModal && (
            <Modal
               showModal={showNoticeModal}
               onClose={() => setShowNoticeModal(false)}
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
                           handleClick={() => setShowApprovalModal(false)}
                           classes="text-[11px] md:text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg"
                        />
                        <Button
                           type="button"
                           isRounded={false}
                           title="Yes"
                           handleClick={handleNotice}
                           classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                        />
                     </div>
                  </div>
               </div>
            </Modal>
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
                        {
                           localStorage.getItem("confirmPin") ? (<p className="text-sm mb-3.5 text-gray-500 font-medium text-gray-900">
                              Are you sure you want to confirm these cases?
                           </p>) : (
                              <>
                                 <p className="text-sm mb-3.5 text-gray-500 font-medium text-gray-900">
                                    Please enter your batch pin to confirm cases.
                                 </p>
                                 <label className="text-gray-600 text-[11px] md:text-xs font-medium">Pin</label>
                                 <input
                                    type="text"
                                    value={pin}
                                    onChange={handleConfirmInputChange}
                                    className={`peer outline-none p-2 md:p-2.5 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none ${!isSignValid ? 'border-red-500' : ''}`}
                                 />
                                 {!isPinValid && (
                                    <p className="text-red-500 text-xs mt-1.5">Pin is required</p>
                                 )}
                              </>

                           )
                        }

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
         {showAddtoDismissalsPopup && (
            <EvictionAutomation_FileDismissal
               showAddtoDismissalPopup={showAddtoDismissalsPopup}
               handleClose={() => {
                  setShowAddtoDismissalsPopup(false);
               }}
               handleReviewSign={() => {
                  props.handleReviewSign()
               }}
               activeTab={props.activeTab}
            />
         )}
         {/* Sync confirmation modal */}
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
                        handleClick={SyncCRM}
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

export default EvictionAutomationButtons;