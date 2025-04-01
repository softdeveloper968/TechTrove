// LateNotices.tsx
import React from "react";
import { useEffect, useState, useRef } from "react";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import GridCheckbox from "components/formik/GridCheckBox";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import HelperViewPdfService from "services/helperViewPdfService";
import { convertToPrice, formattedDate, toCssClassName } from "utils/helper";
import { ILateNoticesItems } from "interfaces/late-notices.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { ICaseDocument } from "interfaces/all-cases.interface";
import { useLateNoticesContext } from "./LateNoticesContext";

const initialColumnMapping:IGridHeader[] = [
  {columnName:"isChecked",label:"isChecked",controlType:"checkbox"},
  {columnName:"name",label:"TenantOne"},
  {columnName:"address",label:"TenantAddressCombined"},
  // {columnName:"noticePDFs",label:"Documents"},
  // { columnName: "documents", label: "AllPDFs" },
 // {columnName:"rentDue",label:"TotalRent"},
  {columnName:"property",label:"PropertyName"},
  // {columnName:"noticePeriod",label:"NoticePeriod"},
  // {columnName:"otherFees",label:"OtherFees"},
  // {columnName:"noticeTotalDemand",label:"TotalDemand"},
  // {columnName:"deliveredBy",label:"DeliveredBy"},
  {columnName:"serviceMethod",label:"ServiceMethod"},
  // {columnName:"lateFees",label:"LateFees"},
  // {columnName:"totalDue",label:"TotalDue"},
  {columnName:"noticeDeliveredToName",label:"DeliveredTo"},
  {columnName:"noticeAffiant",label:"Signature"},
  // {columnName:"noticeDate",label:"NoticeDate"},
  {columnName:"deliveryDate",label:"DeliveryDate"},
  // {columnName:"lateFeesDate",label:"LateFeesDate"},
  {columnName:"noticeTotalDue",label:"NoticeTotalDue"},
  {columnName:"noticeDefaultStartDate",label:"NoticeDefaultStartDate"},
  {columnName:"noticeDefaultEndDate",label:"NoticeDefaultEndDate"},
  {columnName:"noticeLastPaidDate",label:"NoticeLastPaidDate"},
  {columnName:"noticeLastPaidAmount",label:"NoticeLastPaidAmount"},
  {columnName:"noticeCurrentRentDue",label:"NoticeCurrentRentDue"},
  {columnName:"noticePastRentDue",label:"NoticePastRentDue"},
  {columnName:"noticeLateFees",label:"NoticeLateFees"},
  {columnName:"noticeDeliveryDate",label:"NoticeDeliveryDate"},
];

type ISignedLateNotices = {
  items: ILateNoticesItems[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};
// LateNotices component serves as the main entry point for the Late Notices page
const SignProofs = () => {
  const {
    getSignedLateNotices,
    signedLateNotices,
    lateNotices,
    showSpinnerSignedLateNotices,
    setSignedLateNotices,
    setSelectedSignedLateNoticeId,
    setUnsignedNotice,
    setBulkRecords,
    selectedSignedLateNoticeId
  } = useLateNoticesContext();
  const isMounted = useRef(true);
  // State variables for pagination for next and previous button
  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
    signedLateNotices.currentPage > 1
  );
  const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
    Array(signedLateNotices.items?.length).fill(false)
  );

  // const [signedLateNoticesRecords, setSignedLateNoticesRecords] = useState<
  //   ILateNoticesItems[]
  // >([]);

  // state to select all late notices
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [scrolledRows, setScrolledRows] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
  const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);

  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
    signedLateNotices.totalPages > 1
  );
  const [visibleColumns] = useState<IGridHeader[]>(
    initialColumnMapping
  );
  // Event handler for the 'Back' button
  const handleBackButton = () => {
    if (
      signedLateNotices.currentPage > 1 &&
      signedLateNotices.currentPage <= signedLateNotices.totalPages
    ) {
      const updatedCurrentPage = signedLateNotices.currentPage - 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(signedLateNotices.currentPage > 1);
      // back button get late notices
      getSignedLateNotices(updatedCurrentPage, signedLateNotices.pageSize);
    }
  };

  useEffect(() => {
    getSignedLateNotices(1, 100,"");  
    setSelectedSignedLateNoticeId([]);  
  }, []);

  // useEffect(() => {
  //   const signedLateNoticesRecords = signedLateNotices.items.map((item: any) => {
  //     return {
  //       isChecked: false, // Add the new property
  //       ...item, // Spread existing properties
  //     };
  //   });
  //   setSignedLateNoticesRecords(signedLateNoticesRecords);
  // }, []);

  useEffect(() => {
    setUnsignedNotice(false);
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
  }, []);

  // useEffect(() => {
  //   setSelectedRows(Array(signedLateNotices.items?.length).fill(false));
  // }, [signedLateNotices]);

  // // Event handler for the 'Next' button
  const handleFrontButton = () => {
    if (signedLateNotices.currentPage < signedLateNotices.totalPages) {
      const updatedCurrentPage = signedLateNotices.currentPage + 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(updatedCurrentPage > 1);
      // back button get late notices
      getSignedLateNotices(updatedCurrentPage, signedLateNotices.pageSize);
    }
  };

  const [newSelectedRows, setNewSelectedRows] = useState<boolean[]>([]);
  /**
   * handle checkbox change when row is selected
   * @param index
   * @param checked
   */
  // const handleCheckBoxChange = (index: number, checked: boolean) => {
  //   if (
  //     shiftKeyPressed &&
  //     lastClickedRowIndex !== -1 &&
  //     signedLateNotices.items
  //   ) {
  //     const start = Math.min(index, lastClickedRowIndex);
  //     const end = Math.max(index, lastClickedRowIndex);

  //     setSelectedRows(
  //       Array.from({ length: selectedRows.length }, (_, i) =>
  //         i >= start && i <= end ? (selectedRows[i] = true) : newSelectedRows[i]
  //       )
  //     );
  //     setSelectedRows(selectedRows);
  //     const selectedIds = (signedLateNotices.items || [])
  //       .filter((_, rowIndex) => selectedRows[rowIndex])
  //       .map((item) => item.id)
  //       .filter((id): id is string => typeof id === "string");
  //     setSelectedSignedLateNoticeId(selectedIds);
  //   } else {
  //     const updatedSelectedRows = [...selectedRows];
  //     updatedSelectedRows[index] = checked;
  //     setSelectedRows(updatedSelectedRows);

  //     if (signedLateNotices.items.length === updatedSelectedRows.filter(item => item).length) {
  //       setSelectAll(true);
  //     } else {
  //       setSelectAll(false);
  //     }

  //     const selectedIds = (signedLateNotices.items || [])
  //       .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
  //       .map((item) => item.id)
  //       .filter((id): id is string => typeof id === "string");

  //     setSelectedSignedLateNoticeId(selectedIds);
  //   }

  //   setLastClickedRowIndex(index);
  // };

  const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {
    
    if (shiftKeyPressed && lastClickedRowIndex !== -1 && signedLateNotices.items) {
      const start = Math.min(index, lastClickedRowIndex);
      const end = Math.max(index, lastClickedRowIndex);
      setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
        i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
      ));
      setSelectedRows(selectedRows);
      const selectedIds = (signedLateNotices.items || [])
        .filter((_, rowIndex) => selectedRows[rowIndex])
        .map((item) => item.id)
        .filter((id): id is string => typeof id === "string");

        signedLateNotices.items.filter((_, rowIndex) => selectedRows[rowIndex]).map((item)=>{  
          setBulkRecords(prevItems => {
            const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
            uniqueItems.add(JSON.stringify(item)); // Add the new item
            return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
          });      
          //  setBulkRecords((prev)=>[...prev,item]);
        }) 
        setSelectedSignedLateNoticeId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
    } else {
      const updatedSelectedRows = [...selectedRows];
      updatedSelectedRows[index] = checked;
      setSelectedRows(updatedSelectedRows);
  
      if (signedLateNotices.items.length === updatedSelectedRows.filter(item => item).length) {
        setSelectAll(true);
      } else {
        setSelectAll(false);
      }
      
      var selectedIds=signedLateNotices.items.filter(item=>item.id==id).map((item) => item.id)
      .filter((id): id is string => typeof id === "string"); 
      // const selectedIds = (fileEvictions.items || [])
      //   .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
      //   .map((item) => item.id)
      //   .filter((id): id is string => typeof id === "string");
  
      if (!checked) {
        // Remove the item from filteredRecords if unchecked        
        setBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
        setSelectedSignedLateNoticeId(prevIds => prevIds.filter(item => item !== id));
      } else {
        
        setBulkRecords(prevItems => {
          const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
          uniqueItems.add(JSON.stringify(signedLateNotices.items.filter(x=>x.id===id)[0])); // Add the new item
          return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
        });   
        //setBulkRecords((prev)=>[...prev,allCasesRecords.filter(x=>x.id===id)[0]]);
        // if (selectedItem)
        //   settingData(selectedItem);
        setSelectedSignedLateNoticeId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
      }     
    }  
    setLastClickedRowIndex(index);
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
      noticeLastPaidDate: () => formattedDateCell(cellValue),
      noticeDefaultEndDate: () => formattedDateCell(cellValue),
      noticeDefaultStartDate: () => formattedDateCell(cellValue),
      isChecked: () => (
        <GridCheckbox
          checked={selectedSignedLateNoticeId.includes(data.id as string)}
          onChange={(checked: boolean) => {
            handleCheckBoxChange(rowIndex,data.id as string, checked);
          }}
          label=""
        />
      ),
      // noticePDFs: () =>
      //   cellValue ? (
      //     <Link to={cellValue} className="underline text-[#2472db]">
      //       Download
      //     </Link>
      //   ) : (
      //     <></>
      //   ),
      // noticePDFs: () => {
      //   const linkText = `Notice.{${data.id}}.PDF`;
      //   return cellValue ? (
      //     <a
      //       href={cellValue}
      //       download={linkText}
      //       className="underline text-[#2472db]"
      //     >
      //       {linkText}
      //     </a>
      //   ) : (
      //     <></>
      //   );
      // },
      // noticePDFs: () =>
      //   cellValue ? (
      //     <h2 onClick={() => {
      //       openPdf(cellValue)
      //     }} className="underline text-[#2472db]" style={{ cursor: 'pointer' }}>
      //       Notice.pdf
      //     </h2>
      //   ) : (
      //     <></>
      //   ),
      documents: () => renderDocumentsCell(cellValue),
      noticeTotalDue: () => formattedCurrencyCell(cellValue),
      name: () => formattedFullNameCell(data.tenantNames),
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
  const renderDocumentsCell = (cellValue: ICaseDocument[]) => {    
    return (
       <div className="flex flex-wrap">
          {cellValue && cellValue.map((item: ICaseDocument) => (
             <h1
                key={item.id}
                onClick={() => openPdf(item.url)}
                className="underline text-[#2472db] mr-1.5"
                style={{ cursor: 'pointer' }}
             >
                {item.type}
             </h1>
          ))}
       </div>
    );
 };
  const formattedDateCell = (value: any) => (
    <span>{value !== null ? formattedDate(value) : ""}</span>
  );

  const formattedCurrencyCell = (value: any) => (
    <span>$ {value !== null ? convertToPrice(value) : ""}</span>
  );

  const formattedFullNameCell = (tenantNames: any) => (
    <span>
      <HighlightedText text=
        {tenantNames && tenantNames.length > 0
          ? tenantNames[0].middleName
            ? `${tenantNames[0].firstName} ${tenantNames[0].middleName} ${tenantNames[0].lastName}`
            : `${tenantNames[0].firstName} ${tenantNames[0].lastName}`
          : ""} query={lateNotices.searchParam ?? ''} />
    </span>
  );

  const formattedPropertyCell = (value: any) => (
    <span> <HighlightedText text={value !== null ? value : ""} query={lateNotices.searchParam ?? ''} /> </span>
  );

  const formattedCell = (value: any) => (
    <span>{value !== null ? value : ""}</span>
  );
  const formattedAddressCell = (value: ILateNoticesItems) => (
    <span>
      <HighlightedText text={value !== null ? `${value.address ?? ''} ${value.unit ?? ''} ${value.city ?? ''} ${value.state ?? ''} ${value.zip ?? ''}` : ''}
        query={lateNotices.searchParam ?? ''} />
    </span>
  );

  /**
   * select all change
   * @param checked
   */
  // const handleSelectAllChange = (checked: boolean) => {
  //   const newSelectAll = !selectAll;
  //   const allIds: string[] = signedLateNotices.items
  //     .map((item) => item.id)
  //     .filter((id): id is string => typeof id === "string");

  //   if (checked) {
  //     setSelectedSignedLateNoticeId(allIds);
  //   } else {
  //     setSelectedSignedLateNoticeId([]);
  //   }

  //   setSelectAll((prevSelectAll) => {
  //     // Update selectedRows state
  //     setSelectedRows(Array(allIds.length).fill(newSelectAll));
  //     return newSelectAll;
  //   });
  // };

  const handleSelectAllChange = (checked: boolean) => {
    const newSelectAll = !selectAll;
    const allIds: string[] = signedLateNotices.items
      .map((item) => item.id)
      .filter((id): id is string => typeof id === "string");
    if (checked) {
      signedLateNotices.items
      .map((item) =>  setBulkRecords((prev)=>[...prev,item]));
      setSelectedSignedLateNoticeId(prevIds => [...new Set([...prevIds, ...allIds])]);    
    } else {
      signedLateNotices.items.forEach((item) => {
        setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
        setSelectedSignedLateNoticeId(prevIds => prevIds.filter(id => id !== item.id));
  });
    }

    setSelectAll((prevSelectAll) => {
      // Update selectedRows state
      setSelectedRows(Array(allIds.length).fill(newSelectAll));
      return newSelectAll;
    });
  };

  const checkIfAllIdsExist = (
    signedLateNoticesItems: ILateNoticesItems[],
    selectedSignedLateNoticeId: string[]
  ): boolean|undefined => {
    return signedLateNoticesItems.every(record =>
      selectedSignedLateNoticeId.includes(record.id as string)
    );
  };

  return (
    <div className="mt-3">
      <div className="relative -mr-0.5">
        {/* Render the Grid component with column headings and grid data */}
        {showSpinnerSignedLateNotices === true ? (
          <Spinner />
        ) : (
          <Grid
            columnHeading={visibleColumns}
            rows={signedLateNotices.items}
            cellRenderer={(
              data: ILateNoticesItems,
              rowIndex: number,
              cellIndex: number
            ) => {
              return handleCellRendered(cellIndex, data, rowIndex);
            }}
            handleSelectAllChange={handleSelectAllChange}
            selectAll={checkIfAllIdsExist(signedLateNotices.items,selectedSignedLateNoticeId)}
          />
        )}
        {/* Render the Pagination component with relevant props */}
        <Pagination
          numberOfItemsPerPage={signedLateNotices.pageSize}
          currentPage={signedLateNotices.currentPage}
          totalPages={signedLateNotices.totalPages}
          totalRecords={signedLateNotices.totalCount}
          handleFrontButton={handleFrontButton}
          handleBackButton={handleBackButton}
          canPaginateBack={canPaginateBack}
          canPaginateFront={canPaginateFront}
        />
      </div>
    </div>
  );
};

export default SignProofs;
