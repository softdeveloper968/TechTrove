import React, { useState, Fragment } from "react";
import { toast } from "react-toastify";
import { FaExclamationTriangle, FaFileExport, FaFilePdf, FaSyncAlt } from "react-icons/fa";
import { FaTrash, FaEdit, FaRedo, FaBan } from "react-icons/fa";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import Papa from "papaparse";
import { IDeleteTaskCase, IEvictionQueueButton, IManualFilingCaseExportModel } from "interfaces/eviction-queue.intreface";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import { useAuth } from "context/AuthContext";
import { useEvictionQueueContext } from "../EvictionQueueContext";
import { UserRole, HttpStatusCode } from "utils/enum";
import CasesQueueBulkEdit from "./EvictionQueueTask_BulkEdit";
import EvictionQueuesService from "services/eviction-queue.service";
import EvictionQueueTaskBulkEditManual from "./EvictionQueueTask_BulkEditManual";
import { classNames, convertAndFormatDate, toCssClassName } from "utils/helper";
import AllCasesService from "services/all-cases.service";

type EvictionQueueButtons = {
   buttons: IEvictionQueueButton[];
   handleClick: () => void;
};

export enum EvictionQueueType
{
   eFlex = 1,
   eFileGA = 2,
   eFileNV = 3,
   Manual = 4,
   eFileTX = 5
};

const EvictionQueueButtons = (props: EvictionQueueButtons) => {
   const { userRole } = useAuth();
   const {
      selectedEvictionId,
      setSelectedEvictionId,
      getEvictionQueueTasks,
      setEvictionQueue1Tasks,
      evictionQueue1Tasks,
      setEvictionQueue2Tasks,
      evictionQueue2Tasks,
      setEvictionQueue3Tasks,
      evictionQueue3Tasks,
      setEvictionQueue4Tasks,
      evictionQueue4Tasks,
      selectEvictionQueueId,
      bulkRecords,
      setFilteredRecords,
      setBulkRecords,
      showSpinner,
      setShowSpinner
   } = useEvictionQueueContext();
   const [errorMessage, setMessage] = useState<string>("");
   const [bulkEditPopUp, setBulkEditPopUp] = useState<boolean>(false);
   const [showErrorMessageWhenNoRowIsSelected, setShowErrorMessageWhenNoRowIsSelectedState] = useState<boolean>(false);

   const setShowErrorMessageWhenNoRowIsSelected = (show: boolean, customMessage?: string) => {
      setMessage(customMessage || "Please select at least 1 record.");
      setShowErrorMessageWhenNoRowIsSelectedState(show);
   };

   const [showCancelPopup, setShowCancelPopup] = useState<boolean>(false);
   const [showSyncPopup, setShowSyncPopup] = useState<boolean>(false);
   const [showResubmitPopup, setShowResubmitPopup] = useState<boolean>(false);
   const [showDeletePopup, setShowDeletePopup] = useState<boolean>(false);
   const [showRegenerateAOSPopup, setShowRegenerateAOSPopup] = useState<boolean>(false);
   const [regenerateAOSTaskIds, setRegenerateAOSTaskIds] = useState<string[]>([]);
   const [envelopIds, setEnvelopIds] = useState<string[]>();
   const [caseNumbersForAOSRegenerate, setCaseNumbersForAOSRegenerate] = useState<string[]>([]);
   const [resubmitPopupMsg, setResubmitPopupMsg] = useState<string>("");
   const [isDeleteFromAllCases, setIsDeleteFromAllCases] = useState<boolean>(false);

   const handleClick = (button: IEvictionQueueButton) => {
      switch (button.title) {
         case "Edit":
            if (selectedEvictionId.length === 0) {
               setShowErrorMessageWhenNoRowIsSelected(
                  true,
                  "Please select at least one record."
               );
            } else {
               setShowErrorMessageWhenNoRowIsSelected(false);
               setBulkEditPopUp(true);
            }
            break;
         case "Resubmit":
            if (selectedEvictionId.length === 0) {
               setShowErrorMessageWhenNoRowIsSelected(
                  true,
                  "Please select at least one record."
               );
            } else {
               // const records = bulkRecords.filter((item) =>
               //    selectedEvictionId.includes(item.id || "") && (item.status !== "System Error" && item.status!=="Tyler Error" && item.status!=="Rejected" && item.status!=="API Off")
               // );
               // if(records.length>0){
               //    setShowErrorMessageWhenNoRowIsSelected(
               //       true,
               //       "Please select only records with an 'Error', 'Rejected' or 'API Off' status for resubmission."
               //    );                              
               // }else{
                  const records = bulkRecords.filter((item) =>
                 selectedEvictionId.includes(item.id || "") && (item.status == "Accepted"))
                  setResubmitPopupMsg(records.length>0?records.length+" case(s) have already been accepted. Are you sure you want to resubmit the selected case(s)?":"Are you sure you want to resubmit the selected case(s)?");
                  setShowResubmitPopup(true);
                  setShowErrorMessageWhenNoRowIsSelected(false);                   
               //}   
            }
            break;
         case "Delete":
            if (selectedEvictionId.length === 0) {
               setShowErrorMessageWhenNoRowIsSelected(
                  true,
                  "Please select at least one record."
               );
            } else {
               const records = bulkRecords.filter((item) =>
                  selectedEvictionId.includes(item.id || "") && (item.status !== "System Error" && item.status !== "Tyler Error")
               );
               // if(records.length>0){
               //    setShowErrorMessageWhenNoRowIsSelected(
               //       true,
               //       "Please select only records with an 'System Error' or 'Tyler Error' status for deletion."
               //    );                              
               // }else{
               setShowDeletePopup(true);
               setIsDeleteFromAllCases(false);
               setShowErrorMessageWhenNoRowIsSelected(false);
               // }               
            }
            break;
         case "Cancel":
            if (selectedEvictionId.length === 0) {
               setShowErrorMessageWhenNoRowIsSelected(
                  true,
                  "Please select at least one record."
               );
            } else {
               setShowErrorMessageWhenNoRowIsSelected(false);
               const records = bulkRecords.filter((item) =>
                  selectedEvictionId.includes(item.id || "") && item.status === "Submitted"
               );
               // if(records.length>0){
               const envelopeIds = records.map((x) => x.envelopeID).filter((id): id is string => id !== undefined);
               setEnvelopIds(envelopeIds);
               setShowCancelPopup(true);
               //    }
               //  else{
               //    setShowErrorMessageWhenNoRowIsSelected(
               //       true,
               //       "Please select only records with an 'Submitted' status for cancelation."
               //    );
               //  }
            }
            break;
         case "Sync":
            if (selectedEvictionId.length === 0) {
               setShowErrorMessageWhenNoRowIsSelected(
                  true,
                  "Please select at least one record."
               );
            } else {
               setShowErrorMessageWhenNoRowIsSelected(false);
               const records = bulkRecords.filter((item) =>
                  selectedEvictionId.includes(item.id || "") && item.status !== "Accepted"
               );
               // if(records.length>0){
               const envelopeIds = records.map((x) => x.envelopeID).filter((id): id is string => id !== undefined);
               setEnvelopIds(envelopeIds);
               setShowSyncPopup(true);
               // }
               // else{
               //    setShowErrorMessageWhenNoRowIsSelected(
               //       true,
               //       "Please select only records not with  'Accepted' status for sync."
               //    );
               // }

            }
            break;
         case "Regenerate AOS":
            if (selectedEvictionId.length === 0) {
               setShowErrorMessageWhenNoRowIsSelected(
                  true,
                  "Please select at least one record."
               );
            } else {
               const records = bulkRecords.filter(
                  (item) =>
                      selectedEvictionId.includes(item.id || "") &&
                      item.status !== "Accepted" &&
                      item.actionType === 5
              );
      
              const caseNumbers = records.map((x) => x.caseNumber); // Keeps case numbers as an array of strings
              const queueId = records.map((x) => x.id); // Keeps case numbers as an array of strings
              setCaseNumbersForAOSRegenerate(caseNumbers); // Passes array instead of a single string
              setRegenerateAOSTaskIds(queueId);
              setShowRegenerateAOSPopup(true);
            }
            break;
         default:
            // Handle default case or unknown button types
            console.log(`Unknown button type: ${button.icon}`);
      }
   };

   const resetSelectedRows = () => {
      switch (selectEvictionQueueId) {
         case 1:
            setEvictionQueue1Tasks((prev) => {
               return {
                  ...prev,
                  items: prev.items.map((item) => ({
                     ...item,
                     isChecked: false,
                  })),
               };
            });
            break;
         case 2:
            setEvictionQueue2Tasks((prev) => {
               return {
                  ...prev,
                  items: prev.items.map((item) => ({
                     ...item,
                     isChecked: false,
                  })),
               };
            });
            break;
         case 3:
            setEvictionQueue3Tasks((prev) => {
               return {
                  ...prev,
                  items: prev.items.map((item) => ({
                     ...item,
                     isChecked: false,
                  })),
               };
            });
            break;
         case 4:
            setEvictionQueue4Tasks((prev) => {
               return {
                  ...prev,
                  items: prev.items.map((item) => ({
                     ...item,
                     isChecked: false,
                  })),
               };
            });
            break;
      }

   };

   // const handleManualCrawling = async () => {
   //    const response = await EvictionQueuesService.runManualCrawling();
   //    ;
   //    if (response.status === HttpStatusCode.OK) {
   //       // toast.success("Crawling Service started Successfully.");
   //       toast.success(response.data.message);
   //    } else {
   //       toast.error("Failed to Crawl Data.");
   //    }
   // };
   const getEvictionQueue = () => {
      switch (selectEvictionQueueId) {
         case 1:
            return evictionQueue1Tasks;
         case 2:
            return evictionQueue2Tasks;
         case 3:
            return evictionQueue3Tasks;
         case 4:
            return evictionQueue4Tasks;
         default:
            return {
               items: [],
               currentPage: 0,
               pageSize: 0,
               totalCount: 0,
               totalPages: 0,
               actiontype: 0,
               status: 0,
               searchParam: "",
               county: "",
               company: ""
            };
      }
   }

   const resubmitCases = async () => {
      const evictionQueueTasks = getEvictionQueue();
      setShowResubmitPopup(false);
      toast.success("Case(s) resubmission has started.");
      const response = selectEvictionQueueId == EvictionQueueType.eFlex ? 
               await EvictionQueuesService.resubmitCobbCases(selectedEvictionId) : 
               await EvictionQueuesService.resubmitCases(selectedEvictionId);
      if (response.status === HttpStatusCode.OK) {
         getEvictionQueueTasks(
            1,
            100,
            selectEvictionQueueId,
            evictionQueueTasks.actiontype ?? 0,
            evictionQueueTasks.status ?? 0,
            evictionQueueTasks.searchParam,
            evictionQueueTasks.county,
            evictionQueueTasks.company
         );
         setSelectedEvictionId([]);
         setFilteredRecords([]);
         setBulkRecords([]);
         toast.success("Case(s) resubmit successfully.");
      } else {
         toast.error("Failed to resubmit case.");
      }
   };

   const deleteCases = async () => {
      const evictionQueueTasks = getEvictionQueue();
      setShowDeletePopup(false);

      const deleteTaskRequest: IDeleteTaskCase = {
         taskIds: selectedEvictionId,
         deleteFromAllCases: isDeleteFromAllCases
      };

      const response = await EvictionQueuesService.deleteCases(deleteTaskRequest);
      if (response.status === HttpStatusCode.OK) {
         getEvictionQueueTasks(
            1,
            100,
            selectEvictionQueueId,
            evictionQueueTasks.actiontype ?? 0,
            evictionQueueTasks.status ?? 0,
            evictionQueueTasks.searchParam,
            evictionQueueTasks.county,
            evictionQueueTasks.company
         );
         setSelectedEvictionId([]);
         toast.success(response.data.message);
      }
   };

   const cancelCases = async () => {
      const evictionQueueTasks = getEvictionQueue();
      setShowCancelPopup(false);
      const response = await EvictionQueuesService.cancelCases(selectedEvictionId);
      if (response.status === HttpStatusCode.OK) {
         getEvictionQueueTasks(
            1,
            100,
            selectEvictionQueueId,
            evictionQueueTasks.actiontype ?? 0,
            evictionQueueTasks.status ?? 0,
            evictionQueueTasks.searchParam,
            evictionQueueTasks.county,
            evictionQueueTasks.company
         );
         setSelectedEvictionId([]);
         setEnvelopIds([]);
         toast.success(response.data.message);
      } else {
         toast.error("No record found for canceling");
      }
   };

   const syncCasesStatus = async () => {
      const evictionQueueTasks = getEvictionQueue();
      try {
         setShowSyncPopup(false)
         const response = await EvictionQueuesService.syncManualCaseStatus(selectedEvictionId);
         if (response.status === HttpStatusCode.OK) {
            getEvictionQueueTasks(
               1,
               100,
               selectEvictionQueueId,
               evictionQueueTasks.actiontype ?? 0,
               evictionQueueTasks.status ?? 0,
               evictionQueueTasks.searchParam,
               evictionQueueTasks.county,
               evictionQueueTasks.company
            );
            setSelectedEvictionId([]);
            setEnvelopIds([]);
            toast.success(response.data.message);
         }
      } catch (error) {
         console.error(error);
      } finally {

      }
   };

   const handleDownloadDocument = (type: string) => {
      const selectedIds = selectedEvictionId;
      if (selectedIds.length === 0) {
         setShowErrorMessageWhenNoRowIsSelected(true);
      } else {
         setShowErrorMessageWhenNoRowIsSelected(false);
         // setShowSpinner(true);
         getLink(type);
      }
   };

   const getLink = async (type: string) => {
      try {
         // Download all cases
         const apiResponse = await AllCasesService.getAllCasesDocuments(selectedEvictionId, type);
         // Log the API response to inspect its structure
         console.log('API Response:', apiResponse);
         if (apiResponse.status === HttpStatusCode.OK) {
            // Ensure the data is an array of objects containing pdfUrls
            if (Array.isArray(apiResponse.data) && apiResponse.data.length > 0 && 'pdfUrls' in apiResponse.data[0]) {
               toast.info("File downloading has been started");

               // Initialize JSZip
               const zip = new JSZip();
               const existingFileNames = new Set();

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

               await fetchAndAddPDFsToZip();

               // Generate the zip file and trigger the download
               zip.generateAsync({ type: "blob" }).then((zipBlob) => {
                  saveAs(zipBlob, "C2C_PDF_Export.zip");
                  toast.success("File has been successfully downloaded");
               });
            } else {
               toast.error("Not found any file for the selected records");
            }
         }
      } catch (error) {
         console.error('Error fetching and downloading PDFs:', error);
         toast.error("Error fetching and downloading PDFs");
      } finally {
         // setShowSpinner(false);
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

   const downloadCSV = async () => {
      try {
         const response = await getDataForCsv();
         // if (!response || !response.length) {
         //    toast.error("No data available for export.");
         //    return;
         // }
         const keysToInclude = Object.keys(response[0]); // Include all fields
         const csvData = response.map((item) => {
            const filteredItem: Record<string, string> = {};

            keysToInclude.forEach((key) => {
               const value = item[key as keyof IManualFilingCaseExportModel];
               filteredItem[key] = formatValue(value);
            });

            return filteredItem;
         });

         const csv = Papa.unparse(csvData);
         downloadBlob(csv, "ManualFilingCases.csv", "text/csv");
      } catch (error) {
         console.error("Error fetching or exporting data:", error);
      }
   };

   const getDataForCsv = async (): Promise<IManualFilingCaseExportModel[]> => {
      try {
         // Check if any records are selected
         // if (!selectedEvictionId.length) {
         //    toast.error("Please select at least 1 record");
         //    return []; // Return an empty array to avoid errors
         // }
         const evictionQueueTasks = getEvictionQueue();
         const queryParams: Record<string, string> = {
            searchParam: evictionQueueTasks.searchParam ?? '',
            company: evictionQueueTasks.company ?? '',
            status: evictionQueueTasks.status.toString() ?? '',
            county: evictionQueueTasks.county ?? '',
            actionType: evictionQueueTasks.actiontype.toString() ?? '',
            queueId: selectEvictionQueueId.toString() ?? '',
         };

         // Fetch the data
         const response = await EvictionQueuesService.exportManualFilingCases(selectedEvictionId, queryParams);

         // Handle cases where no data is returned
         if (!response?.data?.data) {
            toast.error("No data available for export.");
            return [];
         }

         // Return the data array
         return response.data.data;
      } catch (error) {
         console.error("Error fetching cases data:", error);
         throw new Error("Error fetching cases data");
      }
   };

   const formatValue = (value: unknown): string => {
      if (isISODateString(value) || value instanceof Date) {
         return formatDate(value as string); // Format date
      }
      if (typeof value === "object" && value !== null) {
         return JSON.stringify(value); // Stringify objects
      }
      return String(value); // Convert other types to string
   };

   const isISODateString = (value: unknown): boolean => {
      return (
         typeof value === "string" &&
         /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value)
      );
   };

   // const formatDate = (dateString: string | Date | null): string => {
   //    if (!dateString) return "";

   //    const date = new Date(dateString);
   //    if (isNaN(date.getTime())) {
   //       return String(dateString); // Return original if not a valid date
   //    }

   //    const month = (date.getMonth() + 1).toString().padStart(2, "0");
   //    const day = date.getDate().toString().padStart(2, "0");
   //    const year = date.getFullYear();
   //    return `${month}/${day}/${year}`;
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

   const downloadBlob = (content: string, fileName: string, mimeType: string) => {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
   };

   /* This function previously returned true to hide and false to show
   *  updated to return true for showing, false for hiding to reduce confusion
   */
   const isShowButton = (title: string) => {

      switch (selectEvictionQueueId) {

         case EvictionQueueType.eFileGA:
            return (["Edit", "Cancel", "Resubmit", "Sync", "Delete", "Regenerate AOS"].includes(title));

         case EvictionQueueType.Manual:
            return (["Edit", "Delete", "Regenerate AOS"].includes(title));
         
         case EvictionQueueType.eFlex:
            return (["Edit", "Resubmit", "Regenerate AOS", "Delete"].includes(title));

         case EvictionQueueType.eFileNV:
            return (["Edit", "Delete"].includes(title));
         
         case EvictionQueueType.eFileTX:
            return (["Edit", "Resubmit", "Delete"].includes(title));
      }
      return false;
   };

   const handleRegenerateAOS = async () => {
      try {
         setShowSpinner(true);
         const response = await EvictionQueuesService.regenerateSignedAOS(regenerateAOSTaskIds);
         if (response.status === HttpStatusCode.OK) {
            setShowSpinner(false);
            toast.success("AOS generated successfully");
            if (selectEvictionQueueId !== 0) {
               switch(selectEvictionQueueId){
                  case 1:
                     getEvictionQueueTasks(
                        evictionQueue1Tasks.currentPage, // pageNumber
                        evictionQueue1Tasks.pageSize, // pageSize
                        selectEvictionQueueId,
                        evictionQueue1Tasks.actiontype ?? 0,
                        evictionQueue1Tasks.status ?? 0,
                        evictionQueue1Tasks.searchParam,
                        evictionQueue1Tasks.county,
                        evictionQueue1Tasks.company
                     );
                     break;
                     case 2:
                        getEvictionQueueTasks(
                           evictionQueue2Tasks.currentPage, // pageNumber
                           evictionQueue2Tasks.pageSize, // pageSize
                           selectEvictionQueueId,
                           evictionQueue2Tasks.actiontype ?? 0,
                           evictionQueue2Tasks.status ?? 0,
                           evictionQueue2Tasks.searchParam,
                           evictionQueue2Tasks.county,
                           evictionQueue2Tasks.company
                        );
                        break;
                        case 3:
                           getEvictionQueueTasks(
                              evictionQueue3Tasks.currentPage, // pageNumber
                              evictionQueue3Tasks.pageSize, // pageSize
                              selectEvictionQueueId,
                              evictionQueue3Tasks.actiontype ?? 0,
                              evictionQueue3Tasks.status ?? 0,
                              evictionQueue3Tasks.searchParam,
                              evictionQueue3Tasks.county,
                              evictionQueue3Tasks.company
                           );
                           break;
                           case 4:
                              getEvictionQueueTasks(
                                 evictionQueue4Tasks.currentPage, // pageNumber
                                 evictionQueue4Tasks.pageSize, // pageSize
                                 selectEvictionQueueId,
                                 evictionQueue4Tasks.actiontype ?? 0,
                                 evictionQueue4Tasks.status ?? 0,
                                 evictionQueue4Tasks.searchParam,
                                 evictionQueue4Tasks.county,
                                 evictionQueue4Tasks.company
                              );
                              break;
               }
            }
            setShowRegenerateAOSPopup(false);
         } else {
            console.error("handleRegenerateAOS", response);
         }
      } catch (error) {
         console.error("handleRegenerateAOS", error);
      }
      finally{
         setSelectedEvictionId([]);
         setBulkRecords([]);
         setFilteredRecords([]);
      }
   };

   return (
      <>
         {props.buttons.map((item: IEvictionQueueButton, index: number) => {
            let iconComponent;
            // Switch statement to determine the icon based on the provided icon type
            switch (item.icon) {
               case "FaEdit":
                  iconComponent = (
                     <FaEdit className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               case "FaRedo":
                  iconComponent = (
                     <FaRedo className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               case "FaTrash":
                  iconComponent = (
                     <FaTrash className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               case "FaBan":
                  iconComponent = (
                     <FaBan className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               case "FaSyncAlt":
                  iconComponent = (
                     <FaSyncAlt className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               case "FaFilePdf":
                  iconComponent = (
                     <FaFilePdf className="fa-solid fa-plus  mr-1 text-xs" />
                  );
                  break;
               default:
                  // Provide a default case or handle unknown icon types
                  iconComponent = <></>;
            }

            if (userRole.includes(UserRole.ProcessServer) && item.title === "Import Data") {
               return null;
            }

            if(!userRole.includes(UserRole.C2CAdmin) && item.title === "Delete"){
               return null;
            }

            return (<>
               {
                  userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin)
                     ? <Button
                        title={item.title}
                        classes={isShowButton(item.title) ? item.classes : "hidden"}
                        type={"button"}
                        isRounded={false}
                        icon={iconComponent}
                        key={index}
                        handleClick={() => handleClick(item)}
                     ></Button>
                     : <></>
               }
            </>
            );
         })}
         {selectEvictionQueueId === EvictionQueueType.Manual && (
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
                     <Menu.Items className="dropdown-menu absolute left-0 md:left-auto md:right-0 mt-2 w-60 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="py-1 text-nowrap">
                           {/* <Menu.Item>
                              {({ active }) => (
                                 // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                 <a
                                    className={classNames(
                                       active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                       "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                    )}
                                    onClick={() => handleDownloadDocument("")}
                                 >
                                    <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                    Download All
                                 </a>
                              )}
                           </Menu.Item> */}
                           {/* <Menu.Item>
                              {({ active }) => (
                                 // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                 <a
                                    className={classNames(
                                       active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                       "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                    )}
                                    onClick={() => handleDownloadDocument("Eviction")}
                                 >
                                    <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                    Download Evictions
                                 </a>
                              )}
                           </Menu.Item> */}
                           {/* <Menu.Item>
                              {({ active }) => (
                                 // eslint-disable-next-line jsx-a11y/anchor-is-valid
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
                           </Menu.Item> */}
                           {/* <Menu.Item>
                              {({ active }) => (
                                 // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                 <a
                                    className={classNames(
                                       active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                       "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                    )}
                                    onClick={() => handleDownloadDocument("Amendment")}
                                 >
                                    <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                    Download Amendments
                                 </a>
                              )}
                           </Menu.Item> */}
                           {/* <Menu.Item>
                              {({ active }) => (
                                 // eslint-disable-next-line jsx-a11y/anchor-is-valid
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
                           </Menu.Item> */}
                           {/* <Menu.Item>
                              {({ active }) => (
                                 // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                 <a
                                    className={classNames(
                                       active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                       "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                    )}
                                    onClick={() => handleDownloadDocument("AOS")}
                                 >
                                    <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                    Download AOS
                                 </a>
                              )}
                           </Menu.Item> */}
                           {/* <Menu.Item>
                              {({ active }) => (
                                 // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                 <a
                                    className={classNames(
                                       active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                                       "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                                    )}
                                    onClick={() => handleDownloadDocument("Answer")}
                                 >
                                    <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                                    Download Answers
                                 </a>
                              )}
                           </Menu.Item> */}
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
         {bulkEditPopUp && (
            <>
               {selectEvictionQueueId === EvictionQueueType.Manual
                  ?
                  <EvictionQueueTaskBulkEditManual
                     showProcessServerPopup={bulkEditPopUp}
                     handleClose={() => {
                        setBulkEditPopUp(false);
                        resetSelectedRows();
                     }}
                     handleCloseConfirm={() => {
                        setBulkEditPopUp(false);
                     }}
                  />
                  :
                  <CasesQueueBulkEdit
                     showProcessServerPopup={bulkEditPopUp}
                     handleClose={() => {
                        setBulkEditPopUp(false);
                        resetSelectedRows();
                     }}
                     handleCloseConfirm={() => {
                        setBulkEditPopUp(false);
                     }}
                  />
               }
            </>
         )}
         {showErrorMessageWhenNoRowIsSelected && (
            <Modal
               showModal={showErrorMessageWhenNoRowIsSelected}
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
         {showCancelPopup && (
            <Modal showModal={showCancelPopup} onClose={() => setShowCancelPopup(false)} width="max-w-xl">
               <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
                  <div className="sm:flex sm:items-start">
                     <div className="text-center sm:text-left">
                        <h4
                           className="leading-5 text-gray-900 text-[15.2px] mb-1.5 font-medium"
                           id="modal-title"
                        >
                           Are you sure you want to cancel the following case(s)?
                        </h4>
                     </div>
                  </div>
                  <div>
                     <div className="md:grid-cols-2 gap-2.5 sm:gap-3.5 mb-2.5 mt-2">
                        <div className="relative p-2.5 shadow-md rounded border">
                           <p className="text-xs">
                              {envelopIds && envelopIds.length > 0 ? envelopIds.join(",") : "No envelope IDs are available for canceling."}
                           </p>
                        </div>
                     </div>
                     <div className="mt-1.5 md:mt-0 py-2.5 flex justify-end items-center">
                        <Button
                           type="button"
                           isRounded={false}
                           title="Cancel"
                           handleClick={() => setShowCancelPopup(false)}
                           classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                        ></Button>
                        <Button
                           title="Ok"
                           type="button"
                           isRounded={false}
                           handleClick={cancelCases}
                           disabled={(envelopIds && envelopIds.length === 0)}
                           classes="py-2 md:py-2.5 px-4 inline-flex justify-center items-center gap-x-1.5 text-xs font-semibold rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                        ></Button>
                     </div>
                  </div>
               </div>
            </Modal>
         )}
         {showSyncPopup && (
            <Modal showModal={showSyncPopup} onClose={() => setShowSyncPopup(false)} width="max-w-xl">
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
                           handleClick={() => setShowSyncPopup(false)}
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
         )}
         {showResubmitPopup && (
            <div>
               <Modal
                  showModal={showResubmitPopup}
                  onClose={() => setShowResubmitPopup(false)}
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
                              {resubmitPopupMsg}
                           </h3>
                        </div>
                     </div>
                     <div className="flex justify-end m-2">
                        <Button
                           type="button"
                           isRounded={false}
                           title="No"
                           handleClick={() => setShowResubmitPopup(false)}
                           classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg "
                        ></Button>
                        <Button
                           handleClick={() => resubmitCases()}
                           title="Yes"
                           isRounded={false}
                           type={"button"}
                           classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                        ></Button>
                     </div>
                  </div>
               </Modal>
            </div>
         )}
         {showDeletePopup && (
            <div>
               <Modal
                  showModal={showDeletePopup}
                  onClose={() => setShowDeletePopup(false)}
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
                              Are you sure you want to delete the selected case(s)?
                           </h3>
                        </div>
                     </div>
                     {/* <div className="px-3.5 sm:px-5 py-2 flex">
                        <label className="text-gray-600 text-[11px] md:text-xs font-medium me-1.5 flex gap-1 cursor-pointer"><input
                        type="checkbox"
                        checked={isDeleteFromAllCases}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                           setIsDeleteFromAllCases(event.target.checked)
                        }
                        />Also delete from All Cases</label>
                     </div> */}
                     <div className="flex justify-end m-2">
                        <Button
                           type="button"
                           isRounded={false}
                           title="No"
                           handleClick={() => setShowDeletePopup(false)}
                           classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg "
                        ></Button>
                        <Button
                           handleClick={() => deleteCases()}
                           title="Yes"
                           isRounded={false}
                           type={"button"}
                           classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                        ></Button>
                     </div>
                  </div>
               </Modal>
            </div>
         )}
         {showRegenerateAOSPopup && (
            <div>
               <Modal
                  showModal={showRegenerateAOSPopup}
                  onClose={() => setShowRegenerateAOSPopup(false)}
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
                              Are you sure you want to regenerate AOS for the following case(s)?
                           </h3>
                           <p>
                           {caseNumbersForAOSRegenerate.length > 0 
                              ? `#${caseNumbersForAOSRegenerate.join(", #")}` 
                              : "No cases found for regenerating AOS. Please select cases with the action type 'Affidavit of Service'."
                           }
                           </p>
                        </div>
                     </div>
                     <div className="flex justify-end m-2">
                        <Button
                           type="button"
                           isRounded={false}
                           title="No"
                           handleClick={() => setShowRegenerateAOSPopup(false)}
                           classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg "
                        ></Button>
                        <Button
                           handleClick={() => handleRegenerateAOS()}
                           title="Yes"
                           isRounded={false}
                           type={"button"}
                           classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                        ></Button>
                     </div>
                  </div>
               </Modal>
            </div>
         )}
      </>
   );
};

export default EvictionQueueButtons;