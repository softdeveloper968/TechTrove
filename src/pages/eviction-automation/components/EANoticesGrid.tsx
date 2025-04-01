import React from "react";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { FaCopy } from "react-icons/fa";
import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import Spinner from "components/common/spinner/Spinner";
import GridCheckbox from "components/formik/GridCheckBox";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import { convertToPrice, formattedDate, toCssClassName } from "utils/helper";
import { ILateNoticesItems } from "interfaces/late-notices.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { ICaseDocument } from "interfaces/all-cases.interface";
import HelperViewPdfService from "services/helperViewPdfService";
import { useEvictionAutomationContext } from "../EvictionAutomationContext";

// Define the props interface with a  type 'ILateNotices'
type EvictionAutomationNoticesGridProps = {};
const initialColumnMapping: IGridHeader[]= [
  {columnName:"isChecked",label:"isChecked",controlType:"checkbox"},
  {columnName:"status",label:"Status"},
  {columnName: "documents", label: "AllPDFs" },
  {columnName:"property",label:"PropertyName",isSort:true},
  {columnName:"county",label:"County"},
  {columnName:"fullName",label:"TenantOne"},
  {columnName:"address",label:"TenantAddressCombined"},
  {columnName:"noticeConfirmationDate",label:"NoticeConfirmationDate"},
  {columnName:"noticeDeliveryDate",label:"NoticeDeliveryDate"},
  {columnName:"serviceMethod",label:"NoticeDeliveryMethod"},
  {columnName:"noticeServerSignature",label:"NoticeServerSignature"},
  {columnName:"monthlyRent",label:"MonthlyRent", className:'text-right'},
  {columnName:"noticeTotalDue",label:"NoticeTotalDue", className:'text-right'},
  {columnName:"noticeDefaultStartDate",label:"NoticeDefaultStartDate"},
  {columnName:"noticeDefaultEndDate",label:"NoticeDefaultEndDate"},
  {columnName:"noticeLastPaidDate",label:"NoticeLastPaidDate"},
  {columnName:"noticeLastPaidAmount",label:"NoticeLastPaidAmount", className:'text-right'},
  {columnName:"noticeCurrentRentDue",label:"NoticeCurrentRentDue", className:'text-right'},
  {columnName:"noticePastRentDue",label:"NoticePastRentDue", className:'text-right'},
  {columnName:"noticeServerId",label:"NoticeServerID", className:'text-right'},
  {columnName:"noticeCount",label:"NoticeCount", className:'text-right'},
  {columnName:"previousNotices",label:"PreviousNotices"},

  // {columnName:"fullName",label:"TenantOne"},
  // {columnName:"address",label:"TenantAddressCombined",isSort:true},
  // {columnName:"noticePDFs",label:"Documents"}, 
 // {columnName:"rentDue",label:"TotalRent"},
  // {columnName:"noticePeriod",label:"NoticePeriod"},
  // {columnName:"otherFees",label:"OtherFees"},
  // {columnName:"noticeTotalDemand",label:"NoticeTotalDemand"},
  // {columnName:"lateFees",label:"LateFees"},
  // {columnName:"totalDue",label:"TotalDue"},
  // {columnName:"noticeAffiant",label:"NoticeAffiantSignature"},
  // {columnName:"noticeDate",label:"NoticeDate"},
  // {columnName:"lateFeesDate",label:"LateFeesDate"},
  //{columnName:"noticeLateFees",label:"NoticeLateFees"},  
  // isChecked: "isChecked",
  // "Tenant Name": "fullName", // Add this line for the new column
  // Address: "address",
  // "All PDF's": "noticePDFs",
  // "Total Rent": "rentDue",
  // Property: "property",
  // "Notice Period": "noticePeriod",
  // "Other Fees": "otherFees",
  // "Total Demands": "noticeTotalDemand",
  // "Late Fees": "lateFees",
  // "Total Due": "totalDue",
  // "Notice Affiant Signature": "noticeAffiant",
  // "Notice Date": "noticeDate",
  // "Late Fees Date": "lateFeesDate",
];
// React functional component 'LateNoticesGrid' with a generic type 'ILateNotices'
const EANoticesGrid = (props: EvictionAutomationNoticesGridProps) => {
  //  integrated late notices here
  const {
    showSpinner,
    evictionAutomationNotices,
    setEvictionAutomationNotices,
    getEvictionAutomationNotices,
    selectedEvictionAutomationNoticeId,
    setselectedEvictionAutomationNoticeId,
    bulkRecordsNotices,
    setBulkRecordsNotices
 } = useEvictionAutomationContext();
  const isMounted = useRef(true);
  const [visibleColumns] = useState<IGridHeader[]>(
       initialColumnMapping
  );
  // State variables for pagination for next and previous button
  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
    evictionAutomationNotices.currentPage > 1
  );
  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
    evictionAutomationNotices.totalPages > 1
  );
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
    Array(evictionAutomationNotices.items?.length).fill(false)
  );

  const [evictionAutomationNoticesRecords, setEvictionAutomationNoticesRecords] = useState<
    ILateNoticesItems[]
  >([]);

  // scrolled rows
  const [scrolledRows, setScrolledRows] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
  const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
 
  useEffect(() => {
    //lateNotices.searchParam="";
    getEvictionAutomationNotices(1, 100);    
    setselectedEvictionAutomationNoticeId([]);
  }, []);

  // useEffect to update pagination and grid data when 'rows' or 'numberOfItemsPerPage' changes
  useEffect(() => {
    const evictionAutomationNoticesRecords = evictionAutomationNotices.items.map((item: any) => {
      return {
        isChecked: false, // Add the new property
        ...item, // Spread existing properties
      };
    });
    setEvictionAutomationNoticesRecords(evictionAutomationNoticesRecords);
    // Enable/disable pagination buttons based on the number of total pages
    setCanPaginateBack(evictionAutomationNotices.currentPage > 1);
    setCanPaginateFront(evictionAutomationNotices.totalPages > 1);
    setSelectedRows(Array(evictionAutomationNotices.items?.length).fill(false));
    setSelectAll(false);
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
  }, [evictionAutomationNotices]);

  // Event handler for the 'Back' button
  const handleBackButton = () => {
    if (
        evictionAutomationNotices.currentPage > 1 &&
        evictionAutomationNotices.currentPage <= evictionAutomationNotices.totalPages
    ) {
      const updatedCurrentPage = evictionAutomationNotices.currentPage - 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(evictionAutomationNotices.currentPage > 1);
      // back button get late notices
      getEvictionAutomationNotices(
        updatedCurrentPage,
        evictionAutomationNotices.pageSize,
        evictionAutomationNotices.searchParam
      );
    }
  };

  // // Event handler for the 'Next' button
  const handleFrontButton = () => {
    if (evictionAutomationNotices.currentPage < evictionAutomationNotices.totalPages) {
      const updatedCurrentPage = evictionAutomationNotices.currentPage + 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(updatedCurrentPage > 1);
      // back button get late notices
      getEvictionAutomationNotices(
        updatedCurrentPage,
        evictionAutomationNotices.pageSize,
        evictionAutomationNotices.searchParam
      );
    }
  };

  const [newSelectedRows, setNewSelectedRows] = useState<boolean[]>([]);
  /**
   * handle checkbox change when row is selected
   * @param index
   * @param checked
   */
  // const handleCheckBoxChange = (index: number, checked: boolean) => {
  //   if (shiftKeyPressed && lastClickedRowIndex !== -1 && lateNotices.items) {
  //     const start = Math.min(index, lastClickedRowIndex);
  //     const end = Math.max(index, lastClickedRowIndex);
  //     setSelectedRows(
  //       Array.from({ length: selectedRows.length }, (_, i) =>
  //         i >= start && i <= end ? (selectedRows[i] = true) : newSelectedRows[i]
  //       )
  //     );
  //     setSelectedRows(selectedRows);
  //     const selectedIds = (lateNotices.items || [])
  //       .filter((_, rowIndex) => selectedRows[rowIndex])
  //       .map((item) => item.id)
  //       .filter((id): id is string => typeof id === "string");
  //     setSelectedLateNoticeId(selectedIds);
  //   } else {
  //     const updatedSelectedRows = [...selectedRows];
  //     updatedSelectedRows[index] = checked;
  //     setSelectedRows(updatedSelectedRows);
  //     if (lateNotices.items.length === updatedSelectedRows.filter(item => item).length) {
  //       setSelectAll(true);
  //     } else {
  //       setSelectAll(false);
  //     }
  //     const selectedIds = (lateNotices.items || [])
  //       .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
  //       .map((item) => item.id)
  //       .filter((id): id is string => typeof id === "string");

  //     setSelectedLateNoticeId(selectedIds);
  //   }
  //   setLastClickedRowIndex(index);
  // };


  
  const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {
    
    if (shiftKeyPressed && lastClickedRowIndex !== -1 && evictionAutomationNoticesRecords) {
      const start = Math.min(index, lastClickedRowIndex);
      const end = Math.max(index, lastClickedRowIndex);
      setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
        i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
      ));
      setSelectedRows(selectedRows);
      const selectedIds = (evictionAutomationNoticesRecords || [])
        .filter((_, rowIndex) => selectedRows[rowIndex])
        .map((item) => item.id)
        .filter((id): id is string => typeof id === "string");

        evictionAutomationNoticesRecords.filter((_, rowIndex) => selectedRows[rowIndex]).map((item)=>{  
          setBulkRecordsNotices(prevItems => {
            const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
            uniqueItems.add(JSON.stringify(item)); // Add the new item
            return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
          });      
          //  setBulkRecords((prev)=>[...prev,item]);
        }) 
        setselectedEvictionAutomationNoticeId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
    } else {
      const updatedSelectedRows = [...selectedRows];
      updatedSelectedRows[index] = checked;
      setSelectedRows(updatedSelectedRows);
  
      if (evictionAutomationNoticesRecords.length === updatedSelectedRows.filter(item => item).length) {
        setSelectAll(true);
      } else {
        setSelectAll(false);
      }
      
      var selectedIds=evictionAutomationNoticesRecords.filter(item=>item.id==id).map((item) => item.id)
      .filter((id): id is string => typeof id === "string"); 
      // const selectedIds = (fileEvictions.items || [])
      //   .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
      //   .map((item) => item.id)
      //   .filter((id): id is string => typeof id === "string");
  
      if (!checked) {
        // Remove the item from filteredRecords if unchecked        
        setBulkRecordsNotices(prevItems => prevItems.filter(item => item.id !== id));
        setselectedEvictionAutomationNoticeId(prevIds => prevIds.filter(item => item !== id));
      } else {
        
        setBulkRecordsNotices(prevItems => {
          const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
          uniqueItems.add(JSON.stringify(evictionAutomationNoticesRecords.filter(x=>x.id===id)[0])); // Add the new item
          return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
        });   
        //setBulkRecords((prev)=>[...prev,allCasesRecords.filter(x=>x.id===id)[0]]);
        // if (selectedItem)
        //   settingData(selectedItem);
        setselectedEvictionAutomationNoticeId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
      }     
    }  
    setLastClickedRowIndex(index);
  };

  /**
   * select all change
   * @param checked
   */
  // const handleSelectAllChange = (checked: boolean) => {
  //   const newSelectAll = !selectAll;
  //   const allIds: string[] = lateNotices.items
  //     .map((item) => item.id)
  //     .filter((id): id is string => typeof id === "string");

  //   if (checked) {
  //     setSelectedLateNoticeId(allIds);
  //   } else {
  //     setSelectedLateNoticeId([]);
  //   }

  //   setSelectAll((prevSelectAll) => {
  //     // Update selectedRows state
  //     setSelectedRows(Array(allIds.length).fill(newSelectAll));
  //     return newSelectAll;
  //   });
  // };

  const handleSelectAllChange = (checked: boolean) => {
    const newSelectAll = !selectAll;
    const allIds: string[] = evictionAutomationNoticesRecords
      .map((item) => item.id)
      .filter((id): id is string => typeof id === "string");
    if (checked) {
        evictionAutomationNoticesRecords
      .map((item) =>  setBulkRecordsNotices((prev)=>[...prev,item]));
      setselectedEvictionAutomationNoticeId(prevIds => [...new Set([...prevIds, ...allIds])]);    
    } else {
        evictionAutomationNoticesRecords.forEach((item) => {
          setBulkRecordsNotices(prevItems => prevItems.filter(record => record.id !== item.id));
        setselectedEvictionAutomationNoticeId(prevIds => prevIds.filter(id => id !== item.id));
  });
    }

    setSelectAll((prevSelectAll) => {
      // Update selectedRows state
      setSelectedRows(Array(allIds.length).fill(newSelectAll));
      return newSelectAll;
    });
  };

  const openPdf = async (url: string) => {
    HelperViewPdfService.GetPdfView(url);
  }
  /**
   * Render each cell of a table
   * @param cellIndex  : cell of table
   * @param data  :data of cell
   * @param rowIndex : row index
   * @returns render cell
   */
  const handleCellRendered = (
    cellIndex: number,
    data: ILateNoticesItems,
    rowIndex: number
  ) => {
    const columnName = visibleColumns[cellIndex]?.label;
    //const propertyName = (initialColumnMapping as any)[columnName];
    const propertyName = visibleColumns[cellIndex]?.columnName;
    const cellValue = (data as any)[propertyName];

    const renderers: Record<string, () => JSX.Element> = {
      noticeDate: () => formattedDateCell(cellValue),
      deliveryDate: () => formattedDateCell(cellValue),
      lateFeesDate: () => formattedDateCell(cellValue),
      noticeDeliveryDate: () => formattedDateCell(cellValue),
      noticeConfirmationDate: () => formattedDateCell(cellValue),
      noticeLastPaidDate: () => formattedDateCell(cellValue),
      noticeDefaultEndDate: () => formattedDateCell(cellValue),
      noticeDefaultStartDate: () => formattedDateCell(cellValue),
      county: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNotices.searchParam ?? ''} />,
      isChecked: () => (
        <GridCheckbox
          //checked={selectedRows[rowIndex]}
          checked={selectedEvictionAutomationNoticeId.includes(data.id as string)}
          onChange={(checked: boolean) =>
            handleCheckBoxChange(rowIndex,data.id as string, checked)
          }
          label=""
        />
      ),
      noticePDFs: () =>
        cellValue ? (
          <h2 onClick={() => {
            openPdf(cellValue)
          }} className="underline text-[#2472db]" style={{ cursor: 'pointer' }}>
            Notice.pdf
          </h2>
        ) : (
          <></>
        ),
      documents: () => renderDocumentsCell(cellValue),
      // noticePDFs: () => {
      //   const linkText = `Notice.{${data.id}}.PDF`;
      //   return cellValue ? (
      //    <a
      //     href={cellValue}
      //     target='_blank' rel='noopener noreferrer'
      //     onClick={(e) => {
      //       e.preventDefault();
      //       openPdfInNewTab(cellValue);
      //     //  handlePdfDownload(cellValue, linkText);
      //     }}
      //     className="underline text-[#2472db] bg-transparent border-none cursor-pointer"
      //   >
      //     {linkText}
      //   </a>
      //   ) : (
      //     <></>
      //   );
      // },
      monthlyRent:() => formattedCurrencyCell(cellValue),
      noticeTotalDue: () => formattedCurrencyCell(cellValue),
      fullName: () => formattedFullNameCell(data.tenantNames),
      address: () => formattedAddressCell(data),
      property: () => formattedPropertyCell(data.property),
      deliveredBy: () => formattedCell(data.noticeDeliveredToName),
      serviceMethod: () => formattedCell(data.serviceMethod),
      noticePeriod: () => formattedCell(data.noticePeriod),
      noticeAffiant: () => formattedCell(data.noticeAffiant),
      deliveredTo: () => formattedCell(data.noticeAffiant),
      otherFees: () => formattedCurrencyCell(cellValue),
      totalDue: () => formattedCurrencyCell(cellValue),
      lateFees: () => formattedCurrencyCell(cellValue),
      totalRent: () => formattedCurrencyCell(cellValue),
      noticeTotalDemand: () => formattedCurrencyCell(cellValue),
      rentDue: () => formattedCurrencyCell(cellValue),
      noticeLateFees: () => formattedCurrencyCell(cellValue),
      noticePastRentDue: () => formattedCurrencyCell(cellValue),
      noticeCurrentRentDue: () => formattedCurrencyCell(cellValue),
      noticeLastPaidAmount: () => formattedCurrencyCell(cellValue),
      status:()=>renderStatusCell(cellValue),
      previousNotices:()=>formattedPreviousNoticeCell(cellValue),
    };

    const renderer =
      renderers[propertyName] || (() => formattedCell(cellValue));

      if (visibleColumns.find(x=>x.label===columnName)){
        
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
  const renderStatusCell = (status: string) => {
    let colorClass = "";

    switch (status) {
       case "Notice Created":
          colorClass = "bg-[#FF914D] w-28 min-h-5 leading-[11px] text-center py-0.5 px-1.5 text-white inline-flex items-center justify-center rounded-sm";
          break;      
       case "Served":
          colorClass = "bg-[#4DB452] w-28 min-h-5 leading-[11px] text-center py-0.5 px-1.5 text-white inline-flex items-center justify-center rounded-sm";
          break;   
       case "Confirmed for Eviction":
            colorClass = "bg-blue-400 w-28 min-h-5 leading-[11px] text-center py-[3px] px-1.5 text-white inline-flex items-center justify-center rounded-sm";
            break;   
       default:
          colorClass = "bg-black-500 w-28 min-h-5 leading-[11px] text-center py-0.5 px-1.5 text-white inline-flex items-center justify-center rounded-sm";
    }

    return <div className={colorClass}>{status}</div>;
 };
  const formattedDateCell = (value: any) => (
    <span>{value !== null ? formattedDate(value) : ""}</span>
  );

  const formattedCurrencyCell = (value: any) => (
    <span>$ {value !== null ? convertToPrice(value) : ""}</span>
  );
  const formattedPreviousNoticeCell = (value: string) => {
    // Split the value by commas to get individual dates
    const dates = value ? value.split(",") : [];
  
    return (
      <span>
        {dates.map((date, index) => (
          <span key={index}>
            {date ? formattedDate(date) : ""}
            {index < dates.length - 1 && <br />} {/* Add breakline between dates */}
          </span>
        ))}
      </span>
    );
  };
  const formattedFullNameCell = (tenantNames: any) => (
    <span>
      <HighlightedText text=
        {tenantNames && tenantNames.length > 0
          ? tenantNames[0].middleName
            ? `${tenantNames[0].firstName} ${tenantNames[0].middleName} ${tenantNames[0].lastName}`
            : `${tenantNames[0].firstName} ${tenantNames[0].lastName}`
          : ""} query={evictionAutomationNotices.searchParam ?? ''} />
    </span>
  );

  const formattedPropertyCell = (value: any) => (
    <span><HighlightedText text={value !== null ? value : ""} query={evictionAutomationNotices.searchParam ?? ''} /></span>
  );

  const formattedCell = (value: any) => (
    <span>{value !== null ? value : ""}</span>
  );

  const formattedAddressCell = (value: ILateNoticesItems) => (
    <span>
      <HighlightedText text={value !== null ? `${value.address ?? ''} ${value.unit ?? ''} ${value.city ?? ''} ${value.zip ?? ''}` : ''}
        query={evictionAutomationNotices.searchParam ?? ''} /> </span>
  );
  const [hoveredDocumentId, setHoveredDocumentId] = useState<string | null>(null);
  const renderDocumentsCell = (cellValue: ICaseDocument[]) => {    
    const handleCopyClick = (url: string) => {
      
      navigator.clipboard.writeText(url);
      toast.success("Document URL copied to clipboard!");
   };
    return (
       <div className="flex flex-wrap">
          {cellValue && cellValue.map((item: ICaseDocument) => (
            //  <h1
            //     key={item.id}
            //     onClick={() => openPdf(item.url)}
            //     className="underline text-[#2472db] mr-1.5"
            //     style={{ cursor: 'pointer' }}
            //  >
            //     {item.type}
            //  </h1>
            <div
            key={item.id}
            className="relative"
            onMouseEnter={() => setHoveredDocumentId(item.id)}
            onMouseLeave={() => setHoveredDocumentId(null)}
          >
            <h1
              onClick={() => openPdf(item.url)}
              className="underline text-[#2472db] mr-3"
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

  /**
   *
   * @param rowIndex  selected row index
   * @param scrolledRows scrolled rows index
   */
  const handleRowClick = (rowIndex: number, scrolledRows: number) => {
    const updatedSelectedRows = [...selectedRows];
    //updatedSelectedRows[index] = checked;
    setSelectedRows(updatedSelectedRows);

    // Perform actions with the clicked row index if needed
  };
  const handleSorting = (columnName: string, order: string) => {

    // Copy the current fileEvictionRecords array to avoid mutating the state directly
    const sortedRecords = [...evictionAutomationNoticesRecords];

    // Define a compare function based on the column name and order
    const compare = (a: any, b: any) => {
      // Extract values for comparison
      const aValue1 = columnName !== "Name" ? a[columnName] :  a.tenantNames[0]["firstName"];
      const bValue1 = columnName != "Name" ? b[columnName]  : b.tenantNames[0]["firstName"];

      // Implement sorting logic based on the order (ascending or descending)
      if (order === 'asc') {
        if (aValue1 < bValue1) return -1;
        if (aValue1 > bValue1) return 1;
        return 0;
      } else {
        if (aValue1 > bValue1) return -1;
        if (aValue1 < bValue1) return 1;
        return 0;
      }
    };

    // Sort the records array using the compare function
    sortedRecords.sort(compare);

    // Update the state with sorted recordss
    setEvictionAutomationNoticesRecords(sortedRecords);
  };


  const checkIfAllIdsExist = (
    evictionAutomationNoticesRecords: ILateNoticesItems[],
    selectedEvictionAutomationNoticeId: string[]
): boolean | undefined => {
  if (evictionAutomationNoticesRecords.length === 0) {
      return false;
  }
      return evictionAutomationNoticesRecords.every(record =>
        selectedEvictionAutomationNoticeId.includes(record.id as string)
    );
};
  // const checkIfAllIdsExist = (
  //   lateNoticesRecords: ILateNoticesItems[],
  //   selectedLateNoticeId: string[]
  // ): boolean|undefined => {
  //   return lateNoticesRecords.every(record =>
  //     selectedLateNoticeId.includes(record.id as string)
  //   );
  // };

  // JSX structure for rendering the component
  return (
    <div className="mt-2.5">
      {/* <LateNotice_SearchFilter/> */}
      <div className="relative -mr-0.5">
        {/* Render the Grid component with column headings and grid data */}
        {showSpinner === true ? (
          <Spinner />
        ) : (
          <>
            <Grid
              columnHeading={visibleColumns}
              rows={evictionAutomationNoticesRecords}
              handleSelectAllChange={handleSelectAllChange}
             // selectAll={selectAll}
              selectAll={checkIfAllIdsExist(evictionAutomationNoticesRecords,selectedEvictionAutomationNoticeId)}
              cellRenderer={(
                data: ILateNoticesItems,
                rowIndex: number,
                cellIndex: number
              ) => {
                return handleCellRendered(cellIndex, data, rowIndex);
              }}
              onRowClick={(rowIndex: number, scrolledRows: number) =>
                handleRowClick(rowIndex, scrolledRows)
              }             
              handleSorting={handleSorting}
              selectedIds={selectedEvictionAutomationNoticeId}
            />
            {/* Render the Pagination component with relevant props */}
            <Pagination
              numberOfItemsPerPage={evictionAutomationNotices.pageSize}
              currentPage={evictionAutomationNotices.currentPage}
              totalPages={evictionAutomationNotices.totalPages}
              totalRecords={evictionAutomationNotices.totalCount}
              handleFrontButton={handleFrontButton}
              handleBackButton={handleBackButton}
              canPaginateBack={canPaginateBack}
              canPaginateFront={canPaginateFront}
            />
          </>
        )}
      </div>
    </div>
  );
};

// Export the component as the default export
export default EANoticesGrid;
