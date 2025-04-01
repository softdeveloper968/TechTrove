import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaCopy } from "react-icons/fa";
import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import Spinner from "components/common/spinner/Spinner";
import { ICheckCaseStatusItems } from "interfaces/case.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { ICaseDocument } from "interfaces/all-cases.interface";
import { useAllCheckCasesContext } from "./CheckCasesContext";
import { useAuth } from "context/AuthContext";
import { convertUtcToEst, formattedDate, toCssClassName } from "utils/helper";
import { UserRole } from "utils/enum";
import HelperViewPdfService from "services/helperViewPdfService";
// Define the props interface with a generic type 'T'
interface CheckCaseStatusGridProps {
  //   rows: ICheckCaseStatusItems[] | undefined;
}

// React functional component 'CaseStatusGrid' with a generic type 'T'
const CheckCaseStatusGrid = (props: CheckCaseStatusGridProps) => {
  const { userRole,selectedStateValue } = useAuth();
  const initialColumnMapping: IGridHeader[] = [
    { columnName: "status", label: "Status" },
    { columnName: "caseNo", label: "CaseNo", toolTipInfo: "The unique number or code associated with your case, as assigned by the court. " },
    { columnName: "documents", label: "AllPDFs" },
    { columnName: "propertyName", label: "PropertyName", isSort: true },
    { columnName: "county", label: "County", isSort: true },
    ...(selectedStateValue === "TX" ? [{ columnName: "stateCourt", label: "Court" }] : []),
    { columnName: "name", label: "TenantOne", isSort: true },
    { columnName: "address", label: "TenantAddressCombined", isSort: true, toolTipInfo: "TenantAddressCombined" },
    { columnName: "evictionDateFiled", label: "EvictionDateFiled", isSort: true, toolTipInfo: "The day the eviction case was accepted by the court." },
    { columnName: "evictionServiceDate", label: "EvictionServiceDate", isSort: true, toolTipInfo: "The date the case documents were delivered to the tenant by sheriff or private process server." },
    { columnName: "answerBy", label: "EvictionLastDayToAnswer", isSort: true, toolTipInfo: "The last day that the tenant is allowed to answer with the court before it is considered 'Late'." },
    { columnName: "evictionServiceMethod", label: "EvictionServiceMethod", toolTipInfo: "EvictionServiceMethod" },
    { columnName: "courtDate", label: "CourtDate", isSort: true },
    { columnName: "dismissalFileDate", label: "DismissalFiledDate", toolTipInfo: "The date the dismissal filing was accepted by the court." },
    { columnName: "writFiledDate", label: "WritFiledDate", toolTipInfo: "The date the writ application was accepted by the court." },
    { columnName: "attorneyName", label: "AttorneyName", isSort: true },
    { columnName: "attorneyBarNo", label: "AttorneyBarNo", toolTipInfo: "AttorneyBarNo" },
    { columnName: "evictionAffiantSignature", label: "EvictionAffiantSignature", toolTipInfo: "The name that was used to sign the Eviction case document(s)." },
    { columnName: "answerDate", label: "AnswerDate", toolTipInfo: "The date a tenant filed their answer with the court." },
    { columnName: "writSignDate", label: "WritSignDate", },
    { columnName: "noticeCount", label: "NoticeCount", toolTipInfo: "The number of notices that have been created for a tenant in the past 12 months." },
    { columnName: "evictionCount", label: "EvictionCount", toolTipInfo: "The number of evictions that have been filed for a tenant in the past 12 months." },
    ...(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)
      ? [{
        columnName: "companyName",
        label: "CompanyName"
      }]
      : []
    ),
  ];

  const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(
    initialColumnMapping
  );
 
  useEffect(() => {
    if ((userRole.includes(UserRole.C2CAdmin)|| userRole.includes(UserRole.ChiefAdmin)) && !visibleColumns.some(x => x.columnName === "companyName")) {
      setVisibleColumns((prev) => (
        [
          ...prev,
          {
            columnName: "companyName",
            label: "CompanyName"
          }
        ]
      )
      )
    }
  }, [userRole]);
  const { allCheckCases, getAllCheckCases, showSpinner } =
    useAllCheckCasesContext();

  // State variables for pagination
  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(false);
  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(false);
  // State variable for displaying data in the grid
  //   const [gridData, setGridData] = useState<ICheckCaseStatusItems[] | undefined>(
  //     props.rows
  //   );

  useEffect(() => {
    setCanPaginateBack(allCheckCases.currentPage > 1);
    setCanPaginateFront(allCheckCases.totalPages > 1);
  });
  // useEffect to update pagination and grid data when 'rows' or 'numberOfItemsPerPage' changes
  //   useEffect(() => {
  //     // Calculate total pages based on the number of items and items per page
  //     const totalPages = props.rows
  //       ? Math.ceil(props.rows.length / numberOfItemsPerPage)
  //       : 0;
  //     setTotalPages(totalPages);

  //     // Reset to the first page
  //     setCurrentPage(1);

  //     // Enable/disable pagination buttons based on the number of total pages
  //     setCanPaginateBack(false);
  //     setCanPaginateFront(totalPages > 1);

  //     // Calculate the range of items to display for the current page
  //     const indexOfLastItem = currentPage * numberOfItemsPerPage;
  //     const indexOfFirstItem = indexOfLastItem - numberOfItemsPerPage;

  //     // Slice the 'rows' array to get the data for the current page
  //     const records =
  //       props.rows && props.rows.slice(indexOfFirstItem, indexOfLastItem);

  //     // Update the grid data with the sliced records
  //     setGridData(records);
  //   }, [props.rows, numberOfItemsPerPage]);

  // Event handler for the 'Back' button
  const handleBackButton = () => {
    if (
      allCheckCases.currentPage > 1 &&
      allCheckCases.currentPage <= allCheckCases.totalPages
    ) {
      const updatedCurrentPage = allCheckCases.currentPage - 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(allCheckCases.currentPage > 1);
      // back button get late notices
      getAllCheckCases(updatedCurrentPage, allCheckCases.pageSize, allCheckCases.searchParam);
    }
  };

  // Event handler for the 'Next' button
  const handleFrontButton = () => {

    if (allCheckCases.currentPage < allCheckCases.totalPages) {
      const updatedCurrentPage = allCheckCases.currentPage + 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(updatedCurrentPage > 1);
      // back button get late notices
      getAllCheckCases(updatedCurrentPage, allCheckCases.pageSize, allCheckCases.searchParam);
    }
  };
  const openPdf = async (url: string) => {
    HelperViewPdfService.GetPdfView(url);
  }
  const renderStatusCell = (status: string) => {
    let colorClass = "";

    switch (status) {
      case "Filed":
        colorClass = "bg-sky-200 w-28 min-h-5 leading-[11px] text-center py-0.5 px-1.5 text-white inline-flex items-center justify-center rounded";
        break;
      case "Amended":
        colorClass = "bg-[#FF914D] w-28 min-h-5 leading-[11px] text-center py-0.5 px-1.5 text-white inline-flex items-center justify-center rounded";
        break;
      case "Amendment Ready":
        colorClass = "bg-blue-400 w-28 min-h-5 leading-[11px] text-center py-0.5 px-1.5 text-white inline-flex items-center justify-center rounded";
        break;
      case "Writ Ready":
        colorClass = "bg-[#fd4545] w-28 min-h-5 leading-[11px] text-center py-0.5 px-1.5 text-white inline-flex items-center justify-center rounded";
        break;
      case "Dismissal Applied for":
        colorClass = "bg-[#4DB452] w-28 min-h-5 leading-[11px] text-center py-0.5 px-1.5 text-white inline-flex items-center justify-center rounded";
        break;
      case "Set-Out":
        colorClass = "bg-yellow-300 w-28 min-h-5 leading-[11px] text-center py-0.5 px-1.5 text-white inline-flex items-center justify-center rounded";
        break;
      case "Submitted":
        colorClass = "bg-[#54C1FF] w-28 min-h-5 leading-[11px] text-center py-0.5 px-1.5 text-white inline-flex items-center justify-center rounded";
        break;
      case "Writ Applied for":
        colorClass = "bg-[#E61818] w-28 min-h-5 leading-[11px] text-center py-0.5 px-1.5 text-white inline-flex items-center justify-center rounded";
        break;
      case "Answered":
        colorClass = "bg-[#6D37BB] w-28 min-h-5 leading-[11px] text-center py-0.5 px-1.5 text-white inline-flex items-center justify-center rounded";
        break;
      case "Check for Writ":
        colorClass = "bg-[#F86565] w-28 min-h-5 leading-[11px] text-center py-0.5 px-1.5 text-white inline-flex items-center justify-center rounded";
        break;
      case "Served":
        colorClass = "bg-[#427AC7] w-28 min-h-5 leading-[11px] text-center py-0.5 px-1.5 text-white inline-flex items-center justify-center rounded";
        break;
      case "Submission In Progress":
        colorClass = "bg-yellow-300 w-28 min-h-5 leading-[11px] text-center py-0.5 px-1.5 text-white inline-flex items-center justify-center rounded";
        break;
      case "Dismissal Submission In Progress":
        colorClass = "bg-yellow-300 w-28 min-h-5 leading-[11px] text-center py-0.5 px-1.5 text-white inline-flex items-center justify-center rounded";
        break;
      case "Court Rejected":
        colorClass = "bg-[#E61818] w-28 min-h-5 leading-[11px] text-center py-0.5 px-1.5 text-white inline-flex items-center justify-center rounded";
        break;
      default:
        colorClass = "bg-black-500 w-28 min-h-5 leading-[11px] text-center py-0.5 px-1.5 text-white inline-flex items-center justify-center rounded";
    }

    return <div className={colorClass}>{status}</div>;
  };
  const handleCellRendered = (
    cellIndex: number,
    data: ICheckCaseStatusItems,
    rowIndex: number
  ) => {

    const columnName = visibleColumns[cellIndex]?.label;
    //const propertyName = (initialColumnMapping as any)[columnName];
    const propertyName = visibleColumns[cellIndex]?.columnName;
    const cellValue = (data as any)[propertyName];

    const renderers: Record<string, () => JSX.Element> = {
      evictionDateFiled: () => formattedDateCell(cellValue),
      evictionServiceDate: () => formattedDateCell(cellValue),
      answerBy: () => formattedDateCell(cellValue),
      courtDate: () => formattedDateCell(cellValue),
      dismissalFileDate: () => formattedDateCell(cellValue),
      writFiledDate: () => formattedDateCell(cellValue),
      answerDate: () => formattedDateCell(cellValue),
      attorneyBarNo: () => <HighlightedText text={cellValue ?? ""} query={allCheckCases.searchParam ?? ''} />,
      attorneyName: () => <HighlightedText text={cellValue ?? ""} query={allCheckCases.searchParam ?? ''} />,
      writSignDate: () => formattedDateCell(cellValue),
      status: () => renderStatusCell(cellValue),
      documents: () => renderDocumentsCell(cellValue),
      //   {
      //   if (cellValue.length > 0) {
      //     return (
      //       <>
      //         {cellValue.map((item: any, index: any) => (
      //           <h1
      //             key={index}
      //             onClick={() => openPdf(item.url)}
      //             className="underline text-[#2472db]"
      //             style={{ cursor: 'pointer' }}
      //           >
      //             {item.type} {cellValue.length > index + 1 ? '|' : ''}
      //           </h1>
      //         ))}
      //       </>
      //     );
      //   } else {
      //     return <></>;
      //   }
      // },
      caseNo:()=> <HighlightedText text={cellValue ?? ""} query={allCheckCases.searchParam ?? ''} />,
      name: () => formattedFullNameCell(data.tenantFirstName, data.tenantLastName),
      address: () => formattedAddressCell(data),
      propertyName: () => <HighlightedText text={data.propertyName ?? ''} query={allCheckCases.searchParam ?? ''} />,
      county: () => <HighlightedText text={cellValue ?? ""} query={allCheckCases.searchParam ?? ''} />
    };

    const renderer =
      renderers[propertyName] || (() => formattedCell(cellValue));

    if (visibleColumns.find(x => x.label === columnName)) {

      return (
        <td
          key={cellIndex}
          className={`px-1.5 py-2 md:py-2.5 font-normal text-[10.3px] md:text-[11px] text-[#2a2929]  ${toCssClassName(columnName)}`}
        >
          {renderer()}
        </td>
      );
    }

    return <></>;
  };
  const [hoveredDocumentId, setHoveredDocumentId] = useState<string | null>(null);

  const renderDocumentsCell = (cellValue: ICaseDocument[]) => {
     const handleCopyClick = (url: string) => {
        
        navigator.clipboard.writeText(url);
        toast.success("Document URL copied to clipboard!");
     };

     return (
        <div className="flex flex-wrap">
           {cellValue.map((item: ICaseDocument) => (
              <div
              key={item.id}
              className="relative"
              onMouseEnter={() => setHoveredDocumentId(item.id)}
              onMouseLeave={() => setHoveredDocumentId(null)}
            >
              <h1
                onClick={() => openPdf(item.url)}
                className="underline text-[#2472db] mr-4"
                style={{ cursor: 'pointer' }}
              >
                {item.type}
              </h1>
              {hoveredDocumentId === item.id && (
                <FaCopy
                  className="w-3.5 h-3.5 text-gray-500 absolute right-0 top-0 cursor-pointer ml-8"
                  onClick={() => handleCopyClick(item.url)}
                />
              )}
            </div>
           ))}
        </div>
     );
  };
  const formattedDateCell = (value: any) => (
    // <span>{value !== null ? formattedDate(value) : ""}</span>
    <span>{value !== null ? convertUtcToEst(value).date : ""}</span>
  );

  const formattedFullNameCell = (firstName: string, lastName: string) => (
    <HighlightedText text={`${firstName ?? ''} ${lastName ?? ''}`} query={allCheckCases.searchParam ?? ''} />
  );

  const formattedCell = (value: any) => (
    <span>{value !== null ? value : ""}</span>
  );

  const formattedAddressCell = (value: ICheckCaseStatusItems) => (
    <>
      {
        value !== null
          ? <HighlightedText text={`${value.address ?? ''} ${value.unit ?? ''} ${value.city ?? ''} ${value.state ?? ''} ${value.zip ?? ''}`} query={allCheckCases.searchParam ?? ''} />
          : ''
      }
    </>
  );
  // JSX structure for rendering the component
  return (
    <div className="pt-1">
      {showSpinner && <Spinner />}
      <div className="relative -mr-0.5">
        {allCheckCases.searchParam === "" ? (<><h1 className="text-center text-gray-700 p-1.5 md:p-3.5 mb-0 text-sm md:text-base w-full m-auto">
          Please <b>search</b> cases on the basis of case name in the search
          box to get cases
        </h1></>) : (<>
          <Grid
            columnHeading={visibleColumns}
            rows={allCheckCases.items}
            cellRenderer={(data: any, rowIndex: number, cellIndex: number) => {
              return handleCellRendered(cellIndex, data, rowIndex);
            }}
          />
          {/* Render the Pagination component with relevant props */}
          <Pagination
            numberOfItemsPerPage={allCheckCases.pageSize}
            currentPage={allCheckCases.currentPage}
            totalPages={allCheckCases.totalPages}
            totalRecords={allCheckCases.totalCount}
            handleFrontButton={handleFrontButton}
            handleBackButton={handleBackButton}
            canPaginateBack={canPaginateBack}
            canPaginateFront={canPaginateFront}
          />
        </>)}
        {/* Render the Grid component with column headings and grid data */}
      </div>
    </div>
  );
};

// Export the component as the default export
export default CheckCaseStatusGrid;
