import React from "react";
import { SetStateAction, useState,Fragment } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { Form, Formik } from "formik";
import {
  FaPlus,
  FaFileExcel,
  FaTrash,
  FaLine,
  FaFileSignature,
  FaExclamationTriangle,
  FaFilePdf,
  FaFileExport,
} from "react-icons/fa";
import Papa from "papaparse";
import {
  ILateNoticeEmail,
  ILateNoticesButton,
  ISendNoticeEmail,
  ISendNoticeExportEmail,
} from "interfaces/late-notices.interface";
import { IFileEvictionsItems } from "interfaces/file-evictions.interface";
import ManualCreateNotice from "./LateNoticesActions/LateNotices_ManualCreateNotice";
import LateNoticesSignProofs from "./LateNoticesActions/LateNotices_SignProofs";
import ConfirmDelinquenciesNotices_ImportCsv from "./LateNoticesActions/ConfirmDelinquencies_NoticesImportCSV";
import { useLateNoticesContext } from "../LateNoticesContext";
import { useAuth } from "context/AuthContext";
import DeleteConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import FormikControl from "components/formik/FormikControl";
import Spinner from "components/common/spinner/Spinner";
import DownloadCsv from "components/common/downloadCsv/DownloadCsv";
import EvictionAutomationService from "services/eviction-automation.service";
import LateNoticesService from "services/late-notices.service";
import { downloadPDF } from "utils/helper";
import { UserRole } from "utils/enum";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ExportAllNoticesResource, UnsignedDispoResource } from "interfaces/export-late-notices.interface";

const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(" ");
};

// Define the props type for LateNoticesButtons component
type LateNoticesButtonsProps = {
  buttons: ILateNoticesButton[];
  tabName: string;
  handleReviewSend: () => void;
  handleSignProof: () => void;
};

// Utility function to format dates in MM/DD/YYYY format
// const formatDate = (dateString: string | Date | null): string => {
//   if (!dateString) return ""; // Return empty string for null or undefined dates

//   const date = new Date(dateString);

//   if (isNaN(date.getTime())) {
//     // If it's not a valid date, return the original value (to prevent wrongly formatting strings like "AWESOME APARTMENTS 172")
//     return String(dateString);
//   }

//   // Format date as MM/DD/YYYY
//   const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based
//   const day = date.getDate().toString().padStart(2, "0");
//   const year = date.getFullYear();
//   return `${month}/${day}/${year}`;
// };

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
// Validation schema for manual create notice
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
// LateNoticesButtons component renders a list of buttons based on the provided data
export const LateNoticesButtons = (props: LateNoticesButtonsProps) => {
  // this is used when user click on plus icon i.e. manual create notice
  const [manualCreateNotice, setManualCreateNotice] = useState<boolean>(false);
  // when no row is selected then show error message based on this varible
  // const [
  //   showErrorMessageWhenNoRowIsSelected,
  //   setShowErrorMessageWhenNoRowIsSelected,
  // ] = useState<boolean>(false);
  const [showErrorMessageWhenNoRowIsSelected, setShowErrorMessageWhenNoRowIsSelectedState] = useState<boolean>(false);
  const [errorMessage, setMessage] = useState<string>("");
  const [type, setType] = useState<string>("");
  const setShowErrorMessageWhenNoRowIsSelected = (show: boolean, customMessage?: string) => {
    setMessage(customMessage || "Please select at least 1 record.");
    setShowErrorMessageWhenNoRowIsSelectedState(show);
  };
  // when no row is selected then show error message based on this varible
  const [showPopUpWhenDownloadNotice, setShowPopUpWhenDownloadNotice] =
    useState<boolean>(false);
    const [showPopUpWhenExportNotice, setShowPopUpWhenExportNotice] =
    useState<boolean>(false);
  // set pdf link
  const [pdfLink, setPdfLink] = useState<string>("");
  const [csvLink, setCSVLink] = useState<string>("");
  // to show confirmation when user select delete all
  const [showDeleteAllConfirmation, setShowDeleteAllConfirmation] =
    useState<boolean>(false);
  // to show confirmation when user select delete all
  const [
    showErrorMessageWhenNoDownloaUrlConfirmation,
    setShowErrorMessageWhenNoDownloaUrlConfirmation,
  ] = useState<boolean>(false);
  // to show import csv pop up
  const [importCsvPopUp, setImportCsvPopUp] = useState<boolean>(false);
  // to show spinner
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  // to show pop up when user click on sign proof
  const [showSignProofPopup, setShowSignProofPopup] = useState<boolean>(false);
  const [sendToAdditionalParties, setSendToAdditionalParties] =
    useState<boolean>(false);
  // this is to get selected late notices on the basis of checkbox
  const {
    selectedLateNoticeId,
    selectedSignedLateNoticeId,
    lateNotices,
    getLateNotices,
    setSelectedLateNoticeId,
    setSelectedSignedLateNoticeId,
    getSignedLateNotices,
    setLateNotices,
    setSignedLateNotices,
    activeTab,
    unsignedNotice,
    signedLateNotices,
    selectedConfirmDelinquenciesId,
    setSelectedConfirmDelinquenciesId,
    selectedEvictionNoticeId,
    evictionAutomationNoticesConfirmQueue,
    getEvictionAutomationNoticeQueue,
    setSelectedEvictionNoticeId,
    counties
  } = useLateNoticesContext();
  // set toggle
  // const [showAllLateNotice, setShowAllLateNotices] = useState<boolean>(
  //   lateNotices.latest || false
  // );
  const [showNoticeModal, setShowNoticeModal] = useState<boolean>(false);
  const [showAllNoticeConfirmModal, setShowAllNoticeConfirmModal] = useState<boolean>(false);
  const [confirmFor, setConfirmFor] = useState<string>("");
  const [pin, setPin] = useState('');
  const [isPinValid, setIsPinValid] = useState(true);
  /**
   * this is to remove selected tenant from the application
   * @returns show success message when user remove all tenants.
   */
  const handleDelete = async () => {
    const stringArray: string[] = selectedLateNoticeId.filter(
      (value): value is string => value !== null
    );
    const tenantNoticeIDsObject = {
      tenantNoticeIDs: stringArray.map((value) => value),
    };
    const apiResponse = await LateNoticesService.deleteLateNotice(
      tenantNoticeIDsObject
    );
    if (apiResponse.status === HttpStatusCode.Ok) {
      toast.success("Record removed successfully");
    }
    setShowDeleteAllConfirmation(false);
    setSelectedLateNoticeId([]);
    getLateNotices(1, 100, lateNotices.searchParam);
  };

  const { userRole } = useAuth();

  /** handle click of all buttons  */
  const handleClick = (button: ILateNoticesButton) => {
    // Switch based on the button type or any other property that uniquely identifies the button
    switch (button.title) {
      case "New":
        // Handle click for the "add" button
        setManualCreateNotice(true);
        break;
      case "Import Data":
        setImportCsvPopUp(true);
        break;
      case "Download Documents":

        const selectedIds =
          props.tabName === "All Notices"
            ? selectedLateNoticeId
            : selectedSignedLateNoticeId;
        if (selectedIds.length === 0) {
          setShowErrorMessageWhenNoRowIsSelected(true);
        } else {
          setShowErrorMessageWhenNoRowIsSelected(false);
          setShowSpinner(true);
          getLink(type);
        }
        break;
      case "Delete":
        if (selectedLateNoticeId.length === 0) {
          setShowErrorMessageWhenNoRowIsSelected(true);
        } else {
          setShowSpinner(true);
          // Filter notices based on selected IDs
          const selectedNotices = lateNotices.items.filter((notice) => {
            // Check if notice.id exists and is included in selectedLateNoticeId
            return notice.id && selectedLateNoticeId.includes(notice.id);
          });

          const hasPdf = selectedNotices.some(
            (notice) => notice.noticePDFs !== null
          );

          if (hasPdf) {
            setShowErrorMessageWhenNoDownloaUrlConfirmation(true);
            // To confirm from the user whether they want to delete all notices or not
          } else {
            setShowErrorMessageWhenNoDownloaUrlConfirmation(false);
            setShowDeleteAllConfirmation(true);
          }
          setShowSpinner(false);

          setShowErrorMessageWhenNoRowIsSelected(false);
        }
        break;

      case "Sign Proofs":
        // Handle click for the "Sign Proofs" button
        if (selectedLateNoticeId.length === 0) {
          setShowErrorMessageWhenNoRowIsSelected(true);
        } else {
          setShowErrorMessageWhenNoRowIsSelected(false);
          const hasPendingServiceRecords = lateNotices.items.some(
            (record) =>
              (record.status === "Served") &&
              selectedLateNoticeId.includes(record.id ?? "")
          );
          if (hasPendingServiceRecords) {
            setShowErrorMessageWhenNoRowIsSelected(true, "Ensure that the chosen notice has not already been Served.");
          } else {
            setShowSignProofPopup(true);
          }
        }
        break;
      case "Create Notices":
        // Handle click for the "Sign Proofs" button
        if (selectedConfirmDelinquenciesId.length === 0) {
          setShowErrorMessageWhenNoRowIsSelected(true);
        } else {
          setShowErrorMessageWhenNoRowIsSelected(false);
          toast.info("Your notices are generating. This may take a few moments. Please remain on this page until they are completed.");
          //to confirm from user whether user wants to sign all notices or not
          props.handleReviewSend();
        }
        break;
      case "Confirm Notices":
        if (selectedEvictionNoticeId.length === 0) {
          setShowErrorMessageWhenNoRowIsSelected(true);
        }
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
        break
        case "Confirm for Eviction":
          if (selectedLateNoticeId.length === 0) {
            setShowErrorMessageWhenNoRowIsSelected(true);
          } else {
            setShowErrorMessageWhenNoRowIsSelected(false);  
            const hasConfirmEvictionRecords = lateNotices.items.some(
              (record) =>
                (record.status === "Confirmed for Eviction") &&
                selectedLateNoticeId.includes(record.id ?? "")
            );
            if (hasConfirmEvictionRecords) {
              setShowErrorMessageWhenNoRowIsSelected(true, "Ensure that the selected notice(s) has not already been confirmed for eviction.");
            } else {
              setShowAllNoticeConfirmModal(true);
              setConfirmFor("eviction");  
            }      
          }
          break;
          case "Dismiss":
            if (selectedLateNoticeId.length === 0) {
              setShowErrorMessageWhenNoRowIsSelected(true);
            } else {
              setShowErrorMessageWhenNoRowIsSelected(false);  
              setShowAllNoticeConfirmModal(true);  
              setConfirmFor("dismissal");        
            }
            break;
      // Add more cases for other button types
      default:
        // Handle default case or unknown button types
        console.log(`Unknown button type: ${button.icon}`);
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


    return checkAllMatch(evictionAutomationNoticesConfirmQueue.items, selectedEvictionNoticeId);

  };
  /**
   * get link of selected late notices id
   */
  const getLink = async (type: string) => {
    try {
      let request: ILateNoticeEmail = {
        dispoIds:
          props.tabName === "All Notices"
            ? selectedLateNoticeId
            : selectedSignedLateNoticeId,
      };
      setType(type);
      // Download all late notices
      const apiResponse = await LateNoticesService.createNoticeLink(request, type);
      // api returns pdf link
      if (apiResponse.status === HttpStatusCode.Ok) {
        setPdfLink(apiResponse.data.combinedPDFUrl);
        setShowPopUpWhenDownloadNotice(true);
      }
    } catch (error) {
    } finally {
      setShowSpinner(false);
    }
  };

  /**
   *
   * @param formValues get those values from the email
   */
  const handleSignIn = async (formValues: any) => {

    try {
      setShowSpinner(true);
      // Download all late notices
      if (sendToAdditionalParties) {
        let request: ISendNoticeEmail = {
          combinedPdfUrl: pdfLink ?? "",
          unsignedNotice: unsignedNotice,
          propertyNames: unsignedNotice
            ? lateNotices.items
              .filter((notice) =>
                selectedLateNoticeId.includes(notice.id || "")
              )
              .map((notice) => notice.property)
            : signedLateNotices.items
              .filter((notice) =>
                selectedSignedLateNoticeId.includes(notice.id || "")
              )
              .map((notice) => notice.property),
          userEmails: formValues.email.split(","),
        };
        const apiResponse = await LateNoticesService.sendNoticesEmail(request);
        // api returns pdf link
        // if (apiResponse.status === HttpStatusCode.Ok) {
        //   setShowSpinner(false);
        //   setShowPopUpWhenDownloadNotice(false);
        // }
      }
      else
      {
        await downloadPDF(pdfLink);
      }
      setShowPopUpWhenDownloadNotice(false);
      // await downloadPDF(pdfLink);
      setShowSpinner(false);
      setSelectedLateNoticeId([]);
      setSelectedSignedLateNoticeId([]);
      // getLateNotices(1, 100, lateNotices.latest);
    } catch (error) { }
  };

  const isISODateString = (value: unknown): boolean => {
    return (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value)
    );
  };

  const handleDownloadCSV = async (formValues: any) => {
try
{
  setShowPopUpWhenExportNotice(false);
  if(!sendToAdditionalParties)
  {
    const response: ExportAllNoticesResource[] = await getDataForCsv();

    // Ensure that response is not null or undefined
    if (response) {
      // setShowPopUpWhenExportNotice(true);
       // Convert the single object to an array
       const dataArray: ExportAllNoticesResource[] = response as ExportAllNoticesResource[];
    
       // Convert objects to strings using JSON.stringify
       const stringifiedDataArray = dataArray.map((item) => {
        // Ensure that each item is of type Record<string, string>
        const typedItem = item as unknown as Record<string, string>;
      
        // Reduce to exclude specific keys based on tabName
        return Object.keys(typedItem).reduce((acc, key) => {
          // Exclude specific fields if tabName is not "All Notices"
          if (
            props.tabName !== "All Notices" &&
            ["status", "noticeConfirmationDate", "noticeDeliveryDate", "noticeDeliveryMethod", "noticeServerSignature"].includes(key)
          ) {
            return acc;
          }
      
          // Exclude 'Company' field if tabName is "All Notices"
          if (props.tabName === "All Notices" && key === "companyName") {
            return acc;
          }
      
          // const value = typedItem[key];
          const typedKey = key as keyof ExportAllNoticesResource;
                  const value = item[typedKey];
          // const stringValue =
          //   typeof value === "object" ? JSON.stringify(value) : String(value);
          // acc[key] = stringValue;
          // return acc;
          if (isISODateString(value) || value instanceof Date) {
            acc[key] = formatDate(value as string); // Format date
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
       const fileName = props.tabName == "EA - Ready to Confirm" ? "PendingNotice": props.tabName == "Ready to Sign" ? "ConfirmedNotices" :"AllNotices";
       link.setAttribute("download", fileName);
       document.body.appendChild(link);
       link.click();
      document.body.removeChild(link);
       URL.revokeObjectURL(url);
    }
  }
else
{
  if (sendToAdditionalParties) {
    // setShowSpinner(true);
    let request: ISendNoticeExportEmail = {
      userEmails: formValues.email.split(","),
      allSelectedIDs: props.tabName == "selectedEvictionNoticeId" ? selectedEvictionNoticeId 
      : props.tabName == "Ready to Sign" ? selectedConfirmDelinquenciesId : selectedLateNoticeId,
      tabName: props.tabName,
    };
    const apiResponse = await LateNoticesService.sendExportNoticesEmail(request);
    // api returns pdf link
    if (apiResponse.status === HttpStatusCode.Ok) {
      toast.success("Email sent successfully", {
        position: toast.POSITION.TOP_RIGHT,
     });
    }
  }
}
      setShowPopUpWhenExportNotice(false);
      // await downloadPDF(pdfLink);
      setShowSpinner(false);
      setShowPopUpWhenExportNotice(false);
      setSelectedLateNoticeId([]);
      setSelectedSignedLateNoticeId([]);
      // getLateNotices(1, 100, lateNotices.latest);
    } catch (error) { }
  };
 const setCSVModel = async () => {
    setShowPopUpWhenExportNotice(true);
};
  const getDataForCsv = async () => {
    try {
      const selectedIds = props.tabName == "EA - Ready to Confirm"?selectedEvictionNoticeId:props.tabName == "Ready to Sign" ? selectedConfirmDelinquenciesId:selectedLateNoticeId;
      const response = await LateNoticesService.exportAllLateNotices(selectedIds,props.tabName);
      return response.data;
    } catch (error) {
      // Handle error (e.g., display an error message)
      throw new Error("Error fetching late notices data:");
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
    if (response.status === HttpStatusCode.Ok) {
      getEvictionAutomationNoticeQueue(1, 100, false, false);
      setSelectedEvictionNoticeId([]);
      toast.success("Notices successfully confirmed.");
    }
    setShowNoticeModal(false);
  };

  const handleConfirmEviction = async () => {   
    
    setShowSpinner(true);
    setConfirmFor("");
    try {
      const apiResponse = await LateNoticesService.confirmForEviction(selectedLateNoticeId);     
      if (apiResponse.status === HttpStatusCode.Ok) {
        setShowAllNoticeConfirmModal(false);
        setSelectedLateNoticeId([]);
        getLateNotices(1,100,"",null,0);

      }
    } catch (error) {
    } finally {
      setShowSpinner(false);
    }
  };
  const handleConfirmDismissal = async () => {   
    
    setShowSpinner(true);
    setConfirmFor("");
    try {
      const apiResponse = await LateNoticesService.noticeDismiss(selectedLateNoticeId);     
      if (apiResponse.status === HttpStatusCode.Ok) {
        setShowAllNoticeConfirmModal(false);
        setSelectedLateNoticeId([]);
        getLateNotices(1,100,"",null,0);
      }
    } catch (error) {
    } finally {
      setShowSpinner(false);
    }
  };

  return (
    <>
      {/* Map through the buttons array to generate individual buttons */}
      {props.buttons.map((item: ILateNoticesButton, index: number) => {
        let iconComponent;
        // Switch statement to determine the icon based on the provided icon type
        switch (item.icon) {
          case "FaPlus":
            iconComponent = (
              <FaPlus className="fa-solid fa-plus  mr-0.5 text-xs " />
            );
            break;
          case "FaFileExcel":
            iconComponent = (
              <FaFileExcel className="fa-solid fa-plus  mr-0.5 text-xs" />
            );
            break;
          case "FaTrash":
            iconComponent = (
              <FaTrash className="fa-solid fa-plus  mr-0.5 text-xs " />
            );
            break;
          case "FaFilePdf":
            iconComponent = (
              <FaFilePdf className="fa-solid fa-plus  mr-0.5 text-xs " />
            );
            break;
          case "FaLine":
            iconComponent = (
              <FaLine className="fa-solid fa-plus  mr-0.5 text-xs " />
            );
            break;
          default:
            // Provide a default case or handle unknown icon types
            iconComponent = <FaFileSignature className="text-[13px] mr-0.5" />;
        }
        if (item.title === "Sign Proofs" && (userRole.includes(UserRole.NonSigner)|| userRole.includes(UserRole.PropertyManager))) {
          return null; // Hide the button for non-signers
        }
        if (item.title === "Dismiss" && (userRole.includes(UserRole.ProcessServer))){
          return null; // Hide the button for non-signers
        }
        if (item.title === "Sign Proofs" && props.tabName === "Signed Proofs") {
          return null; // Hide the button for non-signers
        }

        if (props.tabName === "EA - Ready to Confirm") {
          if (item.title !== "Confirm Notices") {
            return null;
          }
        } else {
          if (item.title === "Confirm Notices") {
            return null;
          }
        }
        if (
          (item.title === "New" || item.title === "Sign Proofs") &&
          userRole.includes(UserRole.Viewer)
        ) {
          return null; // Hide the button for viewers
        }
        if (props.tabName === "Ready to Sign") {
          if (item.title !== "Import Data" && item.title !== "Create Notices") {
            return null; // Only show "Import Data" and "Create Notice" in Confirm_Delinquencies tab
          }
          // else if(!userRole.includes(UserRole.Admin) && item.title === "Import Data"){
          //   return null;
          // }
          else if (userRole.includes(UserRole.PropertyManager)) {
            return null
          }
        }
        else {
          if (item.title === "Import Data" || item.title === "Create Notices") {
            return null; // Hide "Import Data" and "Create Notice" in other tabs
          }
        }

        // if ((props.tabName !== "Confirm_Delinquencies" ) && item.title =="Create Notice" && userRole.includes(UserRole.PropertyManager))
        // if ((item.title !== "Create Notice")  && props.tabName == "Confirm_Delinquencies") {
        //   return null; // Skip rendering this button
        // }
        // Render a Button component for each item in the array
        return (
          <Button
            title={item.title}
            classes={
                item.title === "Confirm for Eviction"
                ? `hidden `
                : `${item.classes}`
            }
            type={"button"}
            isRounded={false}
            icon={iconComponent}
            key={index}
            handleClick={() => handleClick(item)}
            disabled={
              props.tabName === "Signed Proofs" &&
                (item.title === "Sign Proofs" || item.title === "Delete")
                ? true
                : false
            }
          ></Button>
        );
      })}
      {/* {(props.tabName !== "Confirmed Notices" && props.tabName !== "Pending Notice Confirmations") && (
        <DownloadCsv fetchData={getDataForCsv} fileName="Notices.csv" />
      )} */}

      {(!userRole.includes(UserRole.Viewer) && !userRole.includes(UserRole.NonSigner)) && (
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
              <Menu.Items className="dropdown-menu absolute left-0 md:left-auto md:right-0 mt-2 w-60 md:w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="py-1 text-nowrap">
                  {props.tabName === "All Notices" ? <>
                    <Menu.Item>
                      {({ active }) => (
                        <a
                          className={classNames(
                            active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                            "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                          )}
                          onClick={() => { if (selectedLateNoticeId.length === 0) {
                            setShowErrorMessageWhenNoRowIsSelected(true);
                          } else {
                            setShowErrorMessageWhenNoRowIsSelected(false);
                            setShowSpinner(true);
                            getLink("");
                          }}}
                        >
                          <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                          All Documents
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
                          onClick={() => { if (selectedLateNoticeId.length === 0) {
                            setShowErrorMessageWhenNoRowIsSelected(true);
                          } else {
                            setShowErrorMessageWhenNoRowIsSelected(false);
                            setShowSpinner(true);
                            getLink("Notice");
                          }}}
                        >
                          <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                          Notice Documents
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
                          onClick={() => { if (selectedLateNoticeId.length === 0) {
                            setShowErrorMessageWhenNoRowIsSelected(true);
                          } else {
                            setShowErrorMessageWhenNoRowIsSelected(false);
                            setShowSpinner(true);
                            getLink("SignedProof");
                          }}}
                        >
                          <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                          Notice Proofs
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
                        onClick={setCSVModel}
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





      {/* <DownloadCsv fetchData={getDataForCsv} fileName="Notices.csv" /> */}
      {/* <ToggleSwitch
        value={showAllLateNotice}
        label={"Show Latest Notices"}
        handleChange={(event: ChangeEvent<HTMLInputElement>) => {
          setShowAllLateNotices(event.target.checked);
          getLateNotices(1, 100, event.target.checked, lateNotices.searchParam);
        }}
      ></ToggleSwitch> */}

      {/* This is used when user click on plus icon */}
      {manualCreateNotice && (
        <ManualCreateNotice
          manualCreateNotice={manualCreateNotice}
          handleManualCreateNotice={(value: boolean) => {
            setManualCreateNotice(value);
            // setSelectedLateNoticeId([]);
            // getLateNotices(1, 100, true);
            // getSignedLateNotices(1, 100, true);
          }
          }
        />
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
                    {errorMessage}
                  </p>
                </div>
              </div>
            </div>
          </Modal>
        </>
      )}
      {/* This is to show error message when no row is selected from grid */}
      {showErrorMessageWhenNoDownloaUrlConfirmation && (
        <>
          <Modal
            showModal={showErrorMessageWhenNoDownloaUrlConfirmation}
            onClose={() => {
              setShowErrorMessageWhenNoDownloaUrlConfirmation(false);
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
                    Downloaded notices cannot be deleted.
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
          message={`Are you sure you want to delete ${selectedLateNoticeId.length
            } ${selectedLateNoticeId.length > 1 ? "notices" : "notice"}?`}
          showConfirmation={showDeleteAllConfirmation}
          closePopup={() => {
            setShowDeleteAllConfirmation(false);
          }}
          handleSubmit={handleDelete}
        ></DeleteConfirmationBox>
      )}
      {/* show import csv pop up */}
      {importCsvPopUp && (
        <>
          {/* <LateNoticesImportCsv
            importCsvPopUp={importCsvPopUp}
            setImportCsvPopUp={(
              value: boolean,
              importedSuccessfully: string
            ) => {
              setImportCsvPopUp(value);
              if (importedSuccessfully !== "") {
                setShowAllLateNotices(true);
              }
            }}
          /> */}
          <ConfirmDelinquenciesNotices_ImportCsv
            importCsvPopUp={importCsvPopUp}
            setImportCsvPopUp={(
              value: SetStateAction<boolean>,
              resetGrid: boolean
            ) => {
              if (resetGrid) {
                // resetSelectedRows();
              }
              setImportCsvPopUp(value);
            }} counties={counties.map(c => c.countyName.toLowerCase())} />
        </>
      )}

      {showSignProofPopup && (
        <LateNoticesSignProofs
          showSignProofPopup={showSignProofPopup}
          handleClose={() => setShowSignProofPopup(false)}
          handleSignProof={() => {
            props.handleSignProof();
          }}
        ></LateNoticesSignProofs>
      )}
      {/* This is to show error message when no row is selected from grid */}
      {showPopUpWhenDownloadNotice && (
        <>
          <Modal
            showModal={showPopUpWhenDownloadNotice}
            onClose={() => {
              {
                if (props.tabName === "All Notices") {
                  setShowPopUpWhenDownloadNotice(false);
                  //setSelectedLateNoticeId([]);
                  setLateNotices((prev) => {
                    return {
                      ...prev,
                      items: prev.items.map((item) => ({
                        ...item,
                        isChecked: false,
                      })),
                    };
                  });
                }
                if (props.tabName === "Signed Proofs") {
                  setShowPopUpWhenDownloadNotice(false);
                  //setSelectedLateNoticeId([]);
                  setSignedLateNotices((prev) => {
                    return {
                      ...prev,
                      items: prev.items.map((item) => ({
                        ...item,
                        isChecked: false,
                      })),
                    };
                  });
                }
              }
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
                    Do you want to download the documents directly or send them to an email?
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
                {/* Display the grid with late notices */}
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
                              setShowPopUpWhenDownloadNotice(false);
                              // setSelectedLateNoticeId([]);
                              setLateNotices((prev) => {
                                return {
                                  ...prev,
                                  items: prev.items.map((item) => ({
                                    ...item,
                                    isChecked: false,
                                  })),
                                };
                              });
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

{showPopUpWhenExportNotice && (
        <>
          <Modal
            showModal={showPopUpWhenExportNotice}
            onClose={() => {
              {
                  setShowPopUpWhenExportNotice(false);
                  //setSelectedLateNoticeId([]);
                  setLateNotices((prev) => {
                    return {
                      ...prev,
                      items: prev.items.map((item) => ({
                        ...item,
                        isChecked: false,
                      })),
                    };
                  });
              }
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
                   Do you want to download the CSV directly or send it to an email?
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
                {/* Display the grid with late notices */}
                <div className="relative pt-2.5">
                  <Formik
                    initialValues={{
                      email: "",
                    }}
                    validationSchema={
                      sendToAdditionalParties ? validationSchema : undefined
                    }
                    onSubmit={handleDownloadCSV}
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
                              setShowPopUpWhenDownloadNotice(false);
                              // setSelectedLateNoticeId([]);
                              setLateNotices((prev) => {
                                return {
                                  ...prev,
                                  items: prev.items.map((item) => ({
                                    ...item,
                                    isChecked: false,
                                  })),
                                };
                              });
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
                              disabled={showSpinner}
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
                  Are you sure you want to confirm these notices?
                </p>
              </div>
              <div className="mt-3.5 flex justify-end space-x-0.5">
                <Button
                  type="button"
                  isRounded={false}
                  title="No"
                  handleClick={() => setShowNoticeModal(false)}
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
      {showAllNoticeConfirmModal && (
        <Modal
          showModal={showAllNoticeConfirmModal}
          onClose={() =>{ setShowAllNoticeConfirmModal(false);setConfirmFor("");}}
          width="max-w-sm"
        >
          <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
            <div className="text-center py-3.5 px-1">
              <div className="text-left mt-1.5">
                <p className="text-sm mb-3.5 text-gray-500 font-medium text-gray-900">
                Are you sure you want to confirm these notices for {confirmFor}?
                </p>
              </div>
              <div className="mt-3.5 flex justify-end space-x-0.5">
                <Button
                  type="button"
                  isRounded={false}
                  title="No"
                  handleClick={() => {setShowAllNoticeConfirmModal(false);setConfirmFor("");}}
                  classes="text-[11px] md:text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg"
                />
                <Button
                  type="button"
                  isRounded={false}
                  title="Yes"
                  handleClick={confirmFor=="eviction"?handleConfirmEviction:handleConfirmDismissal}
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
