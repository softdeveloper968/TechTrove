import React from "react";
import { SetStateAction, useState, Fragment } from "react";
import * as yup from "yup";
import { IFileEvictionNVButtons } from "interfaces/nv-file-eviction.interface";
import { FaExclamationTriangle, FaFileExcel, FaFilePdf, FaPlus } from "react-icons/fa";
import Button from "components/common/button/Button";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { useFileEvictionNVContext } from "../FileEvictionNVContext";
import Papa from "papaparse";
import LateNoticesService from "services/late-notices.service";
import { INVEvictionExportEmail } from "interfaces/late-notices.interface";
import FileEvictionNV_ImportCsv from "./FileEvictionNVActions/FileEvictionNV_ImportCSV";
import Modal from "components/common/popup/PopUp";
import { HttpStatusCode } from "axios";

const classNames = (...classes: string[]) => {
  return classes.filter(Boolean).join(" ");
};


type FileEvictionNVButtonsProps = {
  buttons: IFileEvictionNVButtons[];
  tabName: string;
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
export const FileEvictionNV_Buttons = (props: FileEvictionNVButtonsProps) => {
  const {
    selectedNVEvictionId,
    setSelectedNVEvictionId,
    counties,
    pendingEvictions,
    setShowSpinner,
    getNVEvictions,
    confirmedEvictions
  } = useFileEvictionNVContext();
  // to show import csv pop up
  const [importCsvPopUp, setImportCsvPopUp] = useState<boolean>(false);
  const setShowErrorMessageWhenNoRowIsSelected = (show: boolean, customMessage?: string) => {
    setMessage(customMessage || "Please select at least 1 record.");
    setShowErrorMessageWhenNoRowIsSelectedState(show);
  };
  const [showErrorMessageWhenNoRowIsSelected, setShowErrorMessageWhenNoRowIsSelectedState] = useState<boolean>(false);
  const [errorMessage, setMessage] = useState<string>("");
  const [showAllNoticeConfirmModal, setShowAllNoticeConfirmModal] = useState<boolean>(false);
  const [confirmFor, setConfirmFor] = useState<string>("");
  const getDataForCsv = async (): Promise<any> => {
    try {
      let request: INVEvictionExportEmail = {
        allSelectedIDs: selectedNVEvictionId,
        isConfirmed: props.tabName == "EA - Ready to Confirm" ? false : true
      };
      const searchParam = props.tabName == "EA - Ready to Confirm"?pendingEvictions.searchParam : confirmedEvictions.searchParam;
      const response = await LateNoticesService.exportNVEvictions(
        request,searchParam
      );
      return response.data;
    } catch (error) {
      // Handle error (e.g., display an error message)
      throw new Error("Error fetching evictions data:");
    }
  };
  const isISODateString = (value: unknown): boolean => {
    return (
      typeof value === "string" &&
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/.test(value)
    );
  };
  /** handle click of all buttons  */
  const handleClick = (button: IFileEvictionNVButtons) => {
    // Switch based on the button type or any other property that uniquely identifies the button
    switch (button.title) {
      case "Import Data":
        setImportCsvPopUp(true);
        break;
      case "Confirm for Eviction":
        if (selectedNVEvictionId.length === 0) {
          setShowErrorMessageWhenNoRowIsSelected(true);
        } else {
          setShowErrorMessageWhenNoRowIsSelected(false);
          const hasConfirmEvictionRecords = pendingEvictions.items.some(
            (record) =>
              (record.status === "Confirmed for Eviction") &&
              selectedNVEvictionId.includes(record.id ?? "")
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
            if (selectedNVEvictionId.length === 0) {
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
        break;
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
            // const stringValue =
            //    typeof value === "object" ? JSON.stringify(value) : String(value);
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
        link.setAttribute("download", "NVFileEviction.csv");
        document.body.appendChild(link);
        link.click();

        // Clean up by removing the link and revoking the URL
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        // setSelectedNVEvictionId([]);
        // setFileEvictions((prev) => ({
        //    ...prev,
        //    items: prev.items.map((item) => ({
        //       ...item,
        //       isChecked: false,
        //    })),
        // }));
      }
    } catch (error) {
      console.error("Error fetching or exporting data:", error);
      // Handle error (e.g., display an error message)
    } finally {
      // setSpinner(false);
    }
  };
  
  const handleConfirmEviction = async () => {      
    setShowSpinner(true);
    setConfirmFor("");
    try {
      const apiResponse = await LateNoticesService.confirmForEviction(selectedNVEvictionId);     
      if (apiResponse.status === HttpStatusCode.Ok) {
        setShowAllNoticeConfirmModal(false);
        setSelectedNVEvictionId([]);
        getNVEvictions(1,100,false,"");
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
      const apiResponse = await LateNoticesService.noticeDismiss(selectedNVEvictionId);     
      if (apiResponse.status === HttpStatusCode.Ok) {
        setShowAllNoticeConfirmModal(false);
        setSelectedNVEvictionId([]);
        getNVEvictions(1,100,props.tabName=="Ready to Sign","");
      }
    } catch (error) {
    } finally {
      setShowSpinner(false);
    }
  };
  return (
    <>
      {props.buttons.map((item: IFileEvictionNVButtons, index: number) => {
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
          default:
            // Provide a default case or handle unknown icon types
            iconComponent = <></>;
        }
        if (props.tabName != "Ready to Sign") {
          if (item.title == "Import Data") {
            return null; // Only show "Import Data" and "Create Notice" in Confirm_Delinquencies tab
          }
        }
        return (
          <Button
            title={item.title}
            // classes={
            //   props.tabName === "Confirmed Evictions" && item.title === "Confirm for Eviction"
            //     ? `hidden`
            //     : `${item.classes}`
            // }
            classes={
              props.tabName === "Ready to Sign" && item.title === "Confirm for Eviction"
                ? `hidden`
                : `${item.classes}`
            }
            type={"button"}
            isRounded={false}
            icon={iconComponent}
            key={index}
            handleClick={() => handleClick(item)}
          ></Button>
        );
      })}
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
                    //   onClick={() => { if (selectedLateNoticeId.length === 0) {
                    //     setShowErrorMessageWhenNoRowIsSelected(true);
                    //   } else {
                    //     setShowErrorMessageWhenNoRowIsSelected(false);
                    //     setShowSpinner(true);
                    //     getLink();
                    //   }}}
                    >
                      <FaFilePdf className="fa-solid fa-plus mr-1 text-[11px] md:text-xs" />{" "}
                      Documents
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
                    <FaFileExcel className="fa-solid fa-plus  mr-1 text-[13px] md:text-sm" />{" "}
                    Export CSV
                  </a>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

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
          <FileEvictionNV_ImportCsv
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
    </>
  )
}