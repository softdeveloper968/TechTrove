import React from "react";
import { useEffect, useState, useRef } from "react";
import { IGridHeader } from "interfaces/grid-interface";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import { ILateNoticesItems } from "interfaces/late-notices.interface";
import Pagination from "components/common/pagination/Pagination";
import {useDismissalNVContext} from "../DismissalNVContext"
import { convertToPrice, formattedDate, toCssClassName } from "utils/helper";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import GridCheckbox from "components/formik/GridCheckBox";
import HelperViewPdfService from "services/helperViewPdfService";
import { toast } from "react-toastify";
import { ICaseDocument } from "interfaces/all-cases.interface";
import { FaCopy } from "react-icons/fa";

type PendingEvictionGridProps = {};
const initialColumnMapping: IGridHeader[]= [
  {columnName:"isChecked",label:"isChecked",controlType:"checkbox"},
  //{columnName: "documents", label: "AllPDFs" },
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
];

const PendingDismissalNVGrid = (props: PendingEvictionGridProps) => {
    const { 
        pendingDismissals, 
        getNVDismissals, 
        showSpinner,
      } = useDismissalNVContext();

    const [visibleColumns] = useState<IGridHeader[]>(
        initialColumnMapping
   );
   const [confirmedEvictionRecords, setConfirmedEvictionRecords] = useState<
   ILateNoticesItems[]
 >([]);
 const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
  const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
  useEffect(()=>{
    getNVDismissals(1,100,false,"",null,0);
  },[]);

 useEffect(() => {    
    const lateNoticesRecords = pendingDismissals.items.map((item: any) => {
      return {
        isChecked: false, // Add the new property
        ...item, // Spread existing properties
      };
    });
    setConfirmedEvictionRecords(lateNoticesRecords);
    // Enable/disable pagination buttons based on the number of total pages
    setCanPaginateBack(pendingDismissals.currentPage > 1);
    setCanPaginateFront(pendingDismissals.totalPages > 1);
    setSelectedRows(Array(pendingDismissals.items?.length).fill(false));
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
  }, [pendingDismissals]);

 const checkIfAllIdsExist = (
    lateNoticesRecords: ILateNoticesItems[],
    selectedLateNoticeId: string[]
): boolean | undefined => {
  if (lateNoticesRecords.length === 0) {
      return false;
  }
      return lateNoticesRecords.every(record =>
      selectedLateNoticeId.includes(record.id as string)
    );
};
const [selectAll, setSelectAll] = useState<boolean>(false);
const handleSelectAllChange = (checked: boolean) => {
    const newSelectAll = !selectAll;
    const allIds: string[] = confirmedEvictionRecords
      .map((item) => item.id)
      .filter((id): id is string => typeof id === "string");
    if (checked) {
    //     confirmedEvictionRecords
    //   .map((item) => // setBulkRecords((prev)=>[...prev,item]));
    //   setSelectedLateNoticeId(prevIds => [...new Set([...prevIds, ...allIds])]);    
    } else {
        confirmedEvictionRecords.forEach((item) => {
       // setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
      //  setSelectedLateNoticeId(prevIds => prevIds.filter(id => id !== item.id));
  });
    }

    setSelectAll((prevSelectAll) => {
      // Update selectedRows state
     // setSelectedRows(Array(allIds.length).fill(newSelectAll));
      return newSelectAll;
    });
  };
  const [hoveredDocumentId, setHoveredDocumentId] = useState<string | null>(null);
  const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
    Array(pendingDismissals.items?.length).fill(false)
  );
  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
    pendingDismissals.currentPage > 1
  );
  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
    pendingDismissals.totalPages > 1
  );
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
      county: () => <HighlightedText text={cellValue ?? ""} query={pendingDismissals.searchParam ?? ''} />,
      isChecked: () => (
        <GridCheckbox
          //checked={selectedRows[rowIndex]}
          checked={false}
          onChange={(checked: boolean) =>{}
            //handleCheckBoxChange(rowIndex,data.id as string, checked)
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
      monthlyRent:() => formattedCurrencyCell(cellValue),
      noticeTotalDue: () => formattedCurrencyCell(cellValue),
      fullName: () => formattedFullNameCell(data.tenantNames),
      //saddress: () => formattedAddressCell(data),
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
     // status:()=>renderStatusCell(cellValue),
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
  const formattedDateCell = (value: any) => (
    <span>{value !== null ? formattedDate(value) : ""}</span>
  );
  const openPdf = async (url: string) => {
    HelperViewPdfService.GetPdfView(url);
  }
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
 const formattedCell = (value: any) => (
    <span>{value !== null ? value : ""}</span>
  );
const formattedCurrencyCell = (value: any) => (
    <span>$ {value !== null ? convertToPrice(value) : ""}</span>
  );
  const formattedAddressCell = (value: ILateNoticesItems) => (
    <span>
      <HighlightedText text={value !== null ? `${value.address ?? ''} ${value.unit ?? ''} ${value.city ?? ''} ${value.zip ?? ''}` : ''}
        query={pendingDismissals.searchParam ?? ''} /> </span>
  );
  const formattedFullNameCell = (tenantNames: any) => (
    <span>
      <HighlightedText text=
        {tenantNames && tenantNames.length > 0
          ? tenantNames[0].middleName
            ? `${tenantNames[0].firstName} ${tenantNames[0].middleName} ${tenantNames[0].lastName}`
            : `${tenantNames[0].firstName} ${tenantNames[0].lastName}`
          : ""} query={pendingDismissals.searchParam ?? ''} />
    </span>
  );
  const formattedPropertyCell = (value: any) => (
    <span><HighlightedText text={value !== null ? value : ""} query={pendingDismissals.searchParam ?? ''} /></span>
  );
  const handleRowClick = (rowIndex: number, scrolledRows: number) => {
    const updatedSelectedRows = [...selectedRows];
    //updatedSelectedRows[index] = checked;
    setSelectedRows(updatedSelectedRows);

    // Perform actions with the clicked row index if needed
  };

  const handleFrontButton = () => {
    if (pendingDismissals.currentPage < pendingDismissals.totalPages) {
      const updatedCurrentPage = pendingDismissals.currentPage + 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(updatedCurrentPage > 1);
      // back button get late notices
      getNVDismissals(
        updatedCurrentPage,
        pendingDismissals.pageSize,
        pendingDismissals.isConfirmed??false,
        pendingDismissals.searchParam
      );
    }
  };
  const handleBackButton = () => {
    if (
        pendingDismissals.currentPage > 1 &&
        pendingDismissals.currentPage <= pendingDismissals.totalPages
    ) {
      const updatedCurrentPage = pendingDismissals.currentPage - 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(pendingDismissals.currentPage > 1);
      // back button get late notices
      getNVDismissals(
        updatedCurrentPage,
        pendingDismissals.pageSize,
        pendingDismissals.isConfirmed??false,
        pendingDismissals.searchParam
      );
    }
  };

   return (<div className="relative -mr-0.5">
    {/* Render the Grid component with column headings and grid data */}
    {showSpinner === true ? (
      <Spinner />
    ) : (
      <>
        <Grid
          columnHeading={visibleColumns}
          rows={confirmedEvictionRecords}
          handleSelectAllChange={handleSelectAllChange}
         // selectAll={selectAll}
          selectAll={checkIfAllIdsExist(confirmedEvictionRecords,[])}
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
        />
        {/* Render the Pagination component with relevant props */}
        <Pagination
          numberOfItemsPerPage={pendingDismissals.pageSize}
          currentPage={pendingDismissals.currentPage}
          totalPages={pendingDismissals.totalPages}
          totalRecords={pendingDismissals.totalCount}
          handleFrontButton={handleFrontButton}
          handleBackButton={handleBackButton}
          canPaginateBack={canPaginateBack}
          canPaginateFront={canPaginateFront}
        />
      </>
    )}
  </div>);
    
}

export default PendingDismissalNVGrid;