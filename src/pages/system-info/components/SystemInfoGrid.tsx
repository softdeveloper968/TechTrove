import React, { useEffect, useRef, useState } from "react";
import Grid from "components/common/grid/GridWithToolTip";
import Spinner from "components/common/spinner/Spinner";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import { IGridHeader } from "interfaces/grid-interface";
import { convertUtcToEst, toCssClassName } from "utils/helper";
import { useSystemInfoContext } from "../SystemInfoContext";
import { ISystemInfoItems } from "interfaces/system-info.interface";
import { FaEdit, FaEye, FaRedo } from "react-icons/fa";
import Button from "components/common/button/Button";
import Drawer from "components/common/drawer/Drawer";
import IconButton from "components/common/button/IconButton";
import moment, { utc } from "moment";

type SystemInfoGridProps = {
  showSystemInfoPopup: boolean;
  handleClose: () => void;
};


const SystemInfoGrid = (props: SystemInfoGridProps) => {
  //   const { userRole } = useAuth();
  const isMounted = useRef(true);
  const { showSpinner, systemInfo, getSystemInformationRecords, setSystemInformationRecords } = useSystemInfoContext();
  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(systemInfo.currentPage > 1);
  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(systemInfo.totalPages > 1);
  const [allSystemInfoRecords, setAllSystemInfoRecords] = useState<ISystemInfoItems[]>([]);
  const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
    Array(systemInfo?.items.length).fill(false)
  );
  const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
  const initialColumnMapping: IGridHeader[] = [
    { columnName: "status", label: "STATUS" },
    { columnName: "lastSync", label: "LAST SYNC" },
    { columnName: "nextSync", label: "NEXT SYNC" },
    { columnName: "syncStatus", label: "SYNC STATUS" },
    // { columnName: "scheduler", label: "SCHEDULER" },
    { columnName: "actions", label: "ACTION", className: "action" },
    { columnName: "action", label: "", className: "action" },

  ];
  const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(initialColumnMapping);

  useEffect(() => {
    if (!systemInfo.totalCount) {
      if (isMounted.current) {
        getSystemInformationRecords(1, 100);
        isMounted.current = false;
      };
    };

  }, []);


  //   // useEffect to update pagination and grid data when 'rows' or 'numberOfItemsPerPage' changes
  useEffect(() => {
    const paymentsRecords = systemInfo.items.map((item: any) => {
      return {
        ...item, // Spread existing properties
      };
    });

    setAllSystemInfoRecords(paymentsRecords);
    // Enable/disable pagination buttons based on the number of total pages
    setCanPaginateBack(systemInfo.currentPage > 1);
    setCanPaginateFront(systemInfo.totalPages > 1);
    setSelectedRows(Array(systemInfo.items?.length).fill(false));
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setShiftKeyPressed(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        // Reset selected rows to the top (index 0)
        setShiftKeyPressed(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };

  }, [systemInfo]);

  // Event handler for the 'Back' button
  const handleBackButton = () => {
    if (
      systemInfo.currentPage > 1 &&
      systemInfo.currentPage <= systemInfo.totalPages
    ) {
      const updatedCurrentPage = systemInfo.currentPage - 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(systemInfo.currentPage > 1);
      // back button get dismissals
      getSystemInformationRecords(
        updatedCurrentPage,
        systemInfo.pageSize,
        systemInfo.searchParam
      );
    }
  };

  // // Event handler for the 'Next' button
  const handleFrontButton = () => {
    if (systemInfo.currentPage < systemInfo.totalPages) {
      const updatedCurrentPage = systemInfo.currentPage + 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(updatedCurrentPage > 1);
      // back button get dismissals
      getSystemInformationRecords(
        updatedCurrentPage,
        systemInfo.pageSize,
        systemInfo.searchParam
      );
    }
  };


  const handleCellRendered = (
    cellIndex: number,
    data: ISystemInfoItems,
    rowIndex: number
  ) => {
    const columnName = visibleColumns[cellIndex]?.label;
    //const propertyName = (initialColumnMapping as any)[columnName];
    const propertyName = visibleColumns[cellIndex]?.columnName;
    let cellValue = (data as any)[propertyName];
    let cellClass = "";
    if (propertyName === "status") {
      if (cellValue === "Active") {
        cellClass = "status-paid";
      } else if (cellValue === "InActive") {
        cellClass = "status-overdue";
      } else if (cellValue === "Completed") {
        cellClass = "status-due";
      }
    }
    if (propertyName == "lastSync" || propertyName == "nextSync") {
      cellValue = `${convertUtcToEst(cellValue).date} , ${convertUtcToEst(cellValue).time}`
    }
    const renderers: Record<string, () => JSX.Element> = {
      //   action: () => renderActionsCell(data.id ?? ""),
      // status: () => formattedCell(cellValue),
      //   linked: () => renderHighlightedCell(cellValue), 
      nextSync: () => formattedDateCell(cellValue, "") ?? formattedCell(cellValue),
      lastSync: () => formattedDateCell(cellValue, "") ?? formattedCell(cellValue),
      syncStatus: () => formattedSyncDateCell(cellValue, "Sync:") ?? formattedCell(cellValue),
      action: () => renderActionsCell(),
      actions: () => renderViewActionsCell(),
    };

    const renderer = renderers[propertyName] || (() => formattedCell(cellValue));

    if (visibleColumns.find(x => x.label === columnName)) {

      return (
        <td
          key={cellIndex}
          className={`px-1.5 py-2 md:py-2.5 font-normal text-[10.3px] md:text-[11px] text-[#2a2929] accounting_grid   ${toCssClassName(columnName)} ${cellClass}`}
        >
          {renderer()}
        </td>
      );
    }

    return <></>;
  };


  // const formattedDateCell = (value: any, title: string) => (
  //     // <span>{value !== null ? formattedDate(value) : ""}</span>
  //     <span>{value !== null ?  convertUtcToEst(value).date : ""}</span>
  //  );
  const formattedDateCell = (value: string | null, title: string) => {
    if (!value) return null; // Return null if value is undefined or null

    // Split the input string into date and time parts
    const [datePart, timePart] = value.split(' , '); // Split into date and time

    // Parse the date string (MM/DD/YY)
    const [month, day, year] = datePart.split('/').map(Number); // Convert string parts to numbers

    // Create a date object (using a full year, since the input uses a 2-digit year)
    const date = new Date(2000 + year, month - 1, day); // Adjusting month for 0-indexed

    // Format the month as abbreviated (e.g., 'Aug')
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-US', options); // e.g., 'Aug 10'

    // Return the formatted date and time
    return <span>{`${title} ${formattedDate} - ${timePart}`}</span>;
  };

  const formattedSyncDateCell = (value: string | null, title: string) => {
    if (!value) return null; // Return null if value is undefined or null

    // Parse the date string
    const date = moment(value, "MM/DD/YY hh:mm A"); // Adjust the format to match your input

    // Check if the date is valid
    if (!date.isValid()) return null;

    // Display relative time
    const relativeTime = date.fromNow(); // e.g., "a minute ago", "2 hours ago"

    // Return formatted string
    return <span>{`${title} ${relativeTime}`}</span>;
  };


  const renderActionsCell = () => {
    return (
      <>
        <div className="cursor-pointer flex flex-row items-center">
          <Button
            title={""}
            classes={
              "bg-violet-400 w-32 h-7 text-[10px] md:text-[11px] font-bold text-white rounded-md shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center justify-center whitespace-nowrap" // Changed to font-bold and rounded-md
            }
            type={"button"}
            isRounded={false}
            icon={<FaRedo className="h-3 w-4 mr-1" />}
            disabled={true}
          >
            Sync Now
          </Button>
        </div>
        {/* <IconButton
                type={"button"}
                className="cursor-pointer text-[#2472db] ml-1.5"
                disabled={true}
                icon={<FaRedo className="h-4 w-4" />}
                title={"Sync Now"}
                // handleClick={() => }
             /> */}
      </>
    );
  };

  const renderViewActionsCell = () => {
    return (
      <>
        <div
          className="cursor-pointer flex flex-row items-center"
        >
          <FaEdit
            style={{
              height: 14,
              width: 14,
              color: "#2472db",
              margin: 3,
            }}
          //  onClick={() => {
          //     setIsEditMode(true);
          //     setShowCountyForm(true);
          //     setSelectedRowData(rowData); // Set the selected row data
          //  }}
          ></FaEdit>
          <IconButton
            type={"button"}
            className="cursor-pointer text-[#2472db] ml-1.5"
            // disabled={!id.length}
            icon={<FaEye className="h-4 w-4" />}
          // handleClick={() => handleShowDetails(id)}
          />
        </div>
      </>
    );
  };

  // const formattedCell = (value: any) => (
  //   <span><HighlightedText text={value !== null ? value : ""} query={paymentRecords.searchParam ??''} /></span>
  // );

  const formattedCell = (value: any) => (
    <span>{value !== null ? value : ""}</span>
  );


  const renderHighlightedCell = (value: any) => (
    <HighlightedText text={value as string ?? ''} query={systemInfo.searchParam ?? ''} />
  );

  const formattedAmount = (value: any) => (
    <span>$<HighlightedText text={value !== null ? value : ""} query={systemInfo.searchParam ?? ''} /></span>
  );

  return (
    <div id="drawer-bottom-example" className="fixed bottom-0 left-0 right-0 z-40 w-full  overflow-y-auto transition-transform bg-[#8d8c8c85] dark:bg-gray-800 transform-none h-[100%] flex justify-end flex-col" tabIndex={-1} aria-labelledby="drawer-bottom-label">
      <div className="bottom-drawer bg-white p-4 relative">
      <button onClick={props.handleClose} type="button" data-drawer-hide="drawer-bottom-example" aria-controls="drawer-bottom-example" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 inline-flex items-center justify-center dark:hover:bg-gray-600 dark:hover:text-white" >
        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
        </svg>
      </button>
      {showSpinner && <Spinner />}
      {/* Container for the content */}
      <div id="fullPageContent" className="bg-white rounded-t-lg shadow-lg w-full">
          <div className="md:flex md:items-center justify-between text-center md:text-left mb-1.5 -mt-1.5">
            <h3 className="leading-5 text-gray-900 text-[16px] md:text-xl mb-0" id="modal-title">
              System Info
            </h3>
          </div>

          {/* Display the grid */}
            <div className="relative -mr-0.5 max-h-[80vh] overflow-y-auto	">
              {showSpinner === true ? (
                <Spinner />
              ) : (
                <>
                  <div className="flex flex-col bg-gray-100 p-2">
                    {systemInfo.items.map((item, index) => (
                      <div
                        key={index}
                        className="border border-gray-300 rounded-lg p-1 mb-1 w-full"
                      >
                        {/* Display the scheduler with the item value, aligned to the left */}
                        <h2 className="ml-1 text-xs">
                          <span className="font-bold">Scheduler:</span> {item.scheduler}
                        </h2>

                        <div className="grid grid-cols-1 gap-1"> {/* Adjusted grid layout */}
                          <Grid
                            columnHeading={visibleColumns}
                            rows={[item]} // Wrap each item in an array
                            cellRenderer={(
                              data: ISystemInfoItems,
                              rowIndex: number,
                              cellIndex: number
                            ) => {
                              return handleCellRendered(cellIndex, data, rowIndex);
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>

              )}
            </div>
      </div>
      </div>
    </div>
  );

};

export default SystemInfoGrid;


