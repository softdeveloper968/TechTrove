import React, { useState } from "react";
import DownloadCsv from "components/common/downloadCsv/DownloadCsv";
import ServiceTrackerService from "services/service-tracker.service";
import { useServiceTrackerContext } from "../../ServiceTrackerContext";
import { ExportServiceTrackerItems, ExportUnservedQueueItems } from "interfaces/service-tracker.interface";
import { convertAndFormatDate } from "utils/helper";
import Button from "components/common/button/Button";
import { FaEdit, FaExclamationTriangle } from "react-icons/fa";
import UnservedEviction_BulkEdit from "./UnservedEviction_BulkEdit";
import Modal from "components/common/popup/PopUp";

type ServiceTracker_ButtonProps = {
  activeTab?: string;
};
export const ServiceTrackerButtons = (props: ServiceTracker_ButtonProps) => {
const {selectedServiceTrackerId, serviceTracker, unservedQueue,unservedAmendment} = useServiceTrackerContext();
const [bulkEditPopUp, setBulkEditPopUp] = useState<boolean>(false);
const [
  showErrorMessageWhenNoRowIsSelected,
  setShowErrorMessageWhenNoRowIsSelected,
] = useState<boolean>(false);
  const getDataForCsv = async () => {    
    try {
      if(props.activeTab == "Tracker")
      {
      // const response = await ServiceTrackerService.exportServiceTracker(selectedServiceTrackerId,serviceTracker.searchParam);
      // return response.data;

      const response = await ServiceTrackerService.exportServiceTracker(
        selectedServiceTrackerId,
        serviceTracker.searchParam
      );
      
      // Ensure that the response.data is an array
      const responseDataArray: ExportServiceTrackerItems[] = Array.isArray(response.data) ? response.data : [response.data];
      
      // Map through the array to format the date fields
      const formattedResponseData = responseDataArray.map((item: ExportServiceTrackerItems) => ({
        ...item,
        evictionDateFiled: convertAndFormatDate(item.evictionDateFiled),  // Format evictionDateFiled
        serverReceived: convertAndFormatDate(item.serverReceived),        // Format serverReceived
        evictionServiceDate: convertAndFormatDate(item.evictionServiceDate),  // Format evictionServiceDate
        evictionLastDayToAnswer: convertAndFormatDate(item.evictionLastDayToAnswer),  // Format evictionLastDayToAnswer
      }));
      
      return formattedResponseData;
      }
      else if(props.activeTab == "Unserved Evictions")
      {
      //   const response = await ServiceTrackerService.exportUnservedQueue(selectedServiceTrackerId,unservedQueue.searchParam);
      // return response.data;

      const response = await ServiceTrackerService.exportUnservedQueue(selectedServiceTrackerId,unservedQueue.searchParam);
      
      // Ensure that the response.data is an array
      const responseDataArray: ExportUnservedQueueItems[] = Array.isArray(response.data) ? response.data : [response.data];
      
      // Map through the array to format the date fields
      const formattedResponseData = responseDataArray.map((item: ExportUnservedQueueItems) => ({
        ...item,
        serverReceived: convertAndFormatDate(item.serverReceived),  // Format serverReceived
      }));
      
      return formattedResponseData;
      } else if(props.activeTab == "Unserved Amendments")
        {
        //   const response = await ServiceTrackerService.exportUnservedQueue(selectedServiceTrackerId,unservedQueue.searchParam);
        // return response.data;
  
        const response = await ServiceTrackerService.exportUnservedAmendments(selectedServiceTrackerId,unservedAmendment.searchParam);
        
        // Ensure that the response.data is an array
        const responseDataArray: ExportUnservedQueueItems[] = Array.isArray(response.data) ? response.data : [response.data];
        
        // Map through the array to format the date fields
        const formattedResponseData = responseDataArray.map((item: ExportUnservedQueueItems) => ({
          ...item,
          serverReceived: convertAndFormatDate(item.serverReceived),  // Format serverReceived
        }));
        
        return formattedResponseData;
        } 
    } catch (error) {
      throw new Error("Error fetching cases data:");
    }
  };
  const handleClick = () => {
             if (selectedServiceTrackerId.length === 0) {
                setShowErrorMessageWhenNoRowIsSelected(true);
                return;
             } else {
                setShowErrorMessageWhenNoRowIsSelected(false);
                setBulkEditPopUp(true);
             }
 };
    return (
       <>
        <DownloadCsv fetchData={getDataForCsv} fileName={props.activeTab == "Tracker" ? "ServiceTracker.csv" : props.activeTab == "Unserved Evictions" ? "UnservedEvictions.csv": "UnservedAmendments.csv"} />
        {
          (props.activeTab == "Unserved Evictions" || props.activeTab == "Unserved Amendments") &&
        
        <Button
                  title={"Edit"}
                  classes={"bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold"}
                  type={"button"}
                  isRounded={false}
                  icon={<FaEdit className="fa-solid fa-plus  mr-1 text-xs" />}
                  handleClick={() => handleClick()}
               ></Button>
        }

{bulkEditPopUp && (
            <>
               <UnservedEviction_BulkEdit
                  showFileEvictionPopup={bulkEditPopUp}
                  handleClose={() => {
                    setBulkEditPopUp(false);
                     //    resetSelectedRows();
                  }}
                  activeTab={props.activeTab}
               />
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
                              Please select at least 1 record
                           </p>
                        </div>
                     </div>
                  </div>
               </Modal>
            </>
         )}
         
       </>
       
    );
}

export default ServiceTrackerButtons;