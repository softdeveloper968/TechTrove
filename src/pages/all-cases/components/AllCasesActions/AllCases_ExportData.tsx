import React from "react";
import { useEffect, useState } from "react";
import Pap from "papaparse";
import { useAllCasesContext } from "../../AllCasesContext";
import { IAllCasesItems, Document, ITenant, ICrmInfo } from "interfaces/all-cases.interface";
import Grid from "components/common/grid/Grid";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import Spinner from "components/common/spinner/Spinner";

type ExportDataProps = {
  showExportDataPopup: boolean;
  handleClose: () => void;
};

const AllCases_ExportData = (props: ExportDataProps) => {
  const { selectedAllCasesId, allCases, getAllCases } = useAllCasesContext();
  const [filteredRecords, setFilteredRecords] = useState<IAllCasesItems[]>([]);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  useEffect(() => {
    // Filter records based on selectedLateNoticeId
    let records = allCases.items.filter((item) =>
      selectedAllCasesId.includes(item.id || "")
    );
    setFilteredRecords(records);
  }, [allCases.items, selectedAllCasesId]);

  // const formatCellValue = (
  //   columnName: string,
  //   cellValue: string | boolean | number | Date | undefined | Document[] | ITenant[] | Date | null ): any => {
  //   switch (columnName) {
  //     case "EvictionPDFs":
  //       return null; // or any other value or component for this column
  //     case "Eviction Date Filed":
  //     case "Writ Sign Date":
  //     case "Answer Date":
  //     case "Dismissal File Date":
  //     case "Writ File Date":
  //     case "Court Date":
  //     case "Last Day to Answer":
  //     case "Eviction Service Date":
  //       return (
  //         <span>
  //           {cellValue !== null
  //             ? new Date(cellValue as string).toLocaleDateString()
  //             : ""}
  //         </span>
  //       );

  //     // Add more cases for other columns if needed
  //     default:
  //       // Default case: return the cell value as is
  //       return cellValue;
  //   }
  // };

  const formatCellValue = (
    columnName: string,
    cellValue: string | boolean | number | Date | undefined | Document[] | ITenant[] | Date | null | ICrmInfo
  ): any => {
    switch (columnName) {
      case "EvictionPDFs":
        return null; // or any other value or component for this column
      case "Eviction Date Filed":
      case "Writ Sign Date":
      case "Answer Date":
      case "Dismissal File Date":
      case "Writ File Date":
      case "Court Date":
      case "Last Day to Answer":
      case "Eviction Service Date":
        return (
          <span>
            {cellValue !== null
              ? new Date(cellValue as Date).toLocaleDateString()
              : ""}
          </span>
        );
      // Handle ICrmInfo type
      case "crmInfo":
        return cellValue !== null && typeof cellValue === 'object'
          ? (cellValue as ICrmInfo).crmName
          : "";

      // Add more cases for other columns if needed
      default:
        // Default case: return the cell value as is
        return cellValue;
    }
  };

  const initialColumnMapping = {
    id: "id",
    Reason: "reason",
    Status: "status",
    CaseNo: "caseNo",
    "Eviction PDFs": "document",
    "Property Name": "propertyName",
    County: "county",
    "First Name": "firstName",
    "Last Name": "lastName",
    Unit: "unit",
    StreetNo: "streetNo",
    Address: "address",
    City: "city",
    State: "state",
    Zip: "zip",
    "Eviction Date Filed": "evictionDateFiled",
    "Eviction Service Date": "evictionServiceDate",
    EvictionLastDayToAnswer : "lastDaytoAnswer",
    "Eviction Service Method": "evictionServiceMethod",
    "Court Date": "courtDate",
    "Dismissal File Date": "dismissalFileDate",
    "Writ File Date": "writFileDate",
    "Attorney Name": "attorneyName",
    "Eviction Affiant Signature": "evictionAffiantSignature",
    "Answer Date": "answerDate",
    "Writ Sign Date": "writSignDate",
    "Notice Count": "noticeCount",
    "Eviction Count": "evictionCount",
    "Amendment Affiant Signature": "amendmentAffiantSignature",
    "Amended By": "amendedBy",
    //"Case Count": "caseCount",
  };

  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    Object.keys(initialColumnMapping)
  );

  const handleExportData = () => {
    // Create CSV content
    const csvContent = Pap.unparse(filteredRecords);

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Generate a timestamp for the filename
    const timestamp = new Date().toISOString().split("T")[0];

    // Create a temporary anchor element to trigger the download
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `C2C_Export_${timestamp}.csv`;
    link.click();
    props.handleClose();
  };

  return (
    <>
      <Modal
        showModal={props.showExportDataPopup}
        onClose={() => props.handleClose()}
        width="max-w-3xl"
      >
        {showSpinner === true && <Spinner></Spinner>}
        {/* Container for the content */}
        <div id="fullPageContent">
          <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
            <div className="sm:flex sm:items-start">
              <div className="text-center sm:text-left">
                <h3
                  className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                  id="modal-title"
                >
                  Add to Export
                </h3>
              </div>
            </div>

            {/* Display the grid*/}
            <div className="relative p-6 pb-0  ">
              <Grid
                columnHeading={visibleColumns}
                rows={filteredRecords}
                showInPopUp={true}
                cellRenderer={(
                  data: IAllCasesItems,
                  rowIndex: number,
                  cellIndex: number
                ) => {
                  const columnName = visibleColumns[cellIndex];
                  const dataKey =
                    initialColumnMapping[
                      columnName as keyof typeof initialColumnMapping
                    ];
                  const cellValue = data[dataKey as keyof IAllCasesItems];
                  return formatCellValue(columnName, cellValue);
                }}
              ></Grid>
              <div className="py-2.5 flex justify-end mt-1.5">
                {/* Button to trigger Finish */}
                <Button
                  handleClick={handleExportData}
                  title="Export Data"
                  isRounded={false}
                  type={"button"}
                  classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                ></Button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AllCases_ExportData;
