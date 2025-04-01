import React from "react";
import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useLocation } from "react-router-dom";

import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import Spinner from "components/common/spinner/Spinner";
import GridCheckbox from "components/formik/GridCheckBox";
import ToggleSwitch from 'components/common/toggle/ToggleSwitch';
import HighlightedText from "components/common/highlightedText/HighlightedText";
import { convertToPrice, formatCurrency, formattedDate, toCssClassName } from "utils/helper";
import { UserRole } from "utils/enum";
import { useLateNoticesContext } from "../LateNoticesContext";
import { useAuth } from "context/AuthContext";
import { ILateNoticesItems } from "interfaces/late-notices.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { IFileEvictionsItems, ITenant } from "interfaces/file-evictions.interface";
import HelperViewPdfService from "services/helperViewPdfService";
import LateNotice_SearchFilter from "./LateNotices_SearchFilter";

// Define the props interface with a  type 'ConfirmDelinquencies'
type ConfirmDelinquenciesGridProps = {};
// React functional component 'LateNoticesGrid' with a generic type 'ILateNotices'
const ConfirmDelinquenciesGrid = (props: ConfirmDelinquenciesGridProps) => {
    const { userRole } = useAuth();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const isConfirmed = queryParams.get("isConfirmed") === "true";
    const casesList=queryParams.get("cases");    

    const initialColumnMapping: IGridHeader[] = [
      ...(!userRole.includes(UserRole.PropertyManager)
      ?[ { columnName: "isChecked", label: "isChecked", controlType: "checkbox" }]
      : []
    ),
     // { columnName: "isChecked", label: "isChecked", controlType: "checkbox" },
      { columnName: "propertyName", label: "PropertyName" },
      { columnName: "county", label: "County" },
      { columnName: "tenantOne", label: "TenantOne" },
      {columnName:"tenantAddressCombined",label:"TenantAddressCombined"},
      { columnName: "monthlyRent", label: "MonthlyRent", className:'text-right' },
      { columnName: "noticeTotalDue", label: "NoticeTotalDue", className:'text-right' },
      { columnName: "noticeDefaultStartDate", label: "NoticeDefaultStartDate" },
      { columnName: "noticeDefaultEndDate", label: "NoticeDefaultEndDate" },
      { columnName: "noticeLastPaidDate", label: "NoticeLastPaidDate" },
      { columnName: "noticeLastPaidAmount", label: "NoticeLastPaidAmount", className:'text-right' },
      { columnName: "noticeCurrentRentDue", label: "NoticeCurrentRentDue", className:'text-right' },
      { columnName: "noticePastRentDue", label: "NoticePastRentDue", className:'text-right' },
      {columnName:"noticeServerID",label:"NoticeServerId", className:'text-right'},
      {columnName:"noticeCount",label:"NoticeCount", className:'text-right'},
      {columnName:"previousNotices",label:"PreviousNotices"},
      ...(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)
      ?[ { columnName: "companyName", label: "CompanyName" }]
      : []
    ),
    //   { columnName: "crmName", label: "CrmName" },
    //   { columnName: "ownerId", label: "OwnerId" },
    //   { columnName: "propertyId", label: "PropertyId" },
    //   { columnName: "unitId", label: "UnitId" },
    //   { columnName: "pullTime", label: "PullTime" },
    //   { columnName: "batchId", label: "BatchId" },    
     // { columnName: "companyName", label: "Company" },  
    //   { columnName: "tenant1Last", label: "Tenant1Last" },
    //   { columnName: "tenant1First", label: "Tenant1First" },
    //   { columnName: "tenant1MI", label: "Tenant1MI" },
    //   { columnName: "andAllOtherTenants", label: "AndAllOtherOccupants" },      
    //   { columnName: "tenantAddress", label: "TenantAddress", className: "TenantAddress", },
    //   { columnName: "tenantUnit", label: "TenantUnit" },
    //   { columnName: "tenantCity", label: "TenantCity" },
    //   { columnName: "tenantState", label: "TenantState" },
    //   { columnName: "tenantZip", label: "TenantZip" },
    //   { columnName: "tenant2Last", label: "Tenant2Last" },
    //   { columnName: "tenant2First", label: "Tenant2First" },
    //   { columnName: "tenant2MI", label: "Tenant2MI" },
    //   { columnName: "tenant3Last", label: "Tenant3Last" },
    //   { columnName: "tenant3First", label: "Tenant3First" },
    //   { columnName: "tenant3MI", label: "Tenant3MI" },
    //   { columnName: "tenant4Last", label: "Tenant4Last" },
    //   { columnName: "tenant4First", label: "Tenant4First" },
    //   { columnName: "tenant4MI", label: "Tenant4MI" },
    //   { columnName: "tenant5Last", label: "Tenant5Last" },
    //   { columnName: "tenant5First", label: "Tenant5First" },
    //   { columnName: "tenant5MI", label: "Tenant5MI" },
    //   { columnName: "reason", label: "EvictionReason", className: "EvictionReason", },
    //   { columnName: "evictionTotalRentDue", label: "EvictionTotalRentDue" },   
    //   { columnName: "allMonths", label: "AllMonths" },
    //   { columnName: "evictionOtherFees", label: "EvictionOtherFees" },
    //   { columnName: "ownerName", label: "OwnerName" },      
    //   { columnName: "propertyPhone", label: "PropertyPhone" },
    //   { columnName: "propertyEmail", label: "PropertyEmail", className: "PropertyEmail", },
    //   { columnName: "propertyAddress", label: "PropertyAddress", className: "PropertyAddress", },
    //   { columnName: "propertyCity", label: "PropertyCity" },
    //   { columnName: "propertyState", label: "PropertyState" },
    //   { columnName: "propertyZip", label: "PropertyZip" },
    //   { columnName: "attorneyName", label: "AttorneyName" },
    //   { columnName: "attorneyBarNo", label: "AttorneyBarNo" },
    //   { columnName: "attorneyEmail", label: "AttorneyEmail", className: "AttorneyEmail", },
    //   { columnName: "filerBusinessName", label: "FilerBusinessName" },
    //   { columnName: "evictionAffiantIs", label: "EvictionAffiantIs" },
    //   { columnName: "filerPhone", label: "EvictionFilerPhone" },
    //   { columnName: "filerEmail", label: "EvictionFilerEmail" },
    //   { columnName: "expedited", label: "Expedited" },
    //   { columnName: "stateCourt", label: "StateCourt" },
    //   { columnName: "clientReferenceId", label: "ClientReferenceId" },
    //   { columnName: "processServerCompany", label: "ProcessServerCompany" },
    //   { columnName: "noticeDeliveryDate", label: "NoticeDeliveryDate" },
    //   { columnName: "noticeLateFees", label: "NoticeLateFees" },
    //  { columnName: "noticeServerID", label: "NoticeServerID" },
   ];
  //  integrated late notices here
  const { 
    confirmDelinquenciesQueue,
    // lateNotices, 
    getConfirmDelinquenciesQueue,
    setConfirmDelinquenciesQueue,
    // getLateNotices, 
    // setSelectedLateNoticeId, 
    setSelectedConfirmDelinquenciesId,
    showSpinner,
    setBulkRecords,
    // selectedLateNoticeId ,
    selectedConfirmDelinquenciesId,
    allCompanies,
   // getAllCompanies,
   setSelectedTab,
    getCounties,
  } = useLateNoticesContext();
  const isMounted = useRef(true);
  const [visibleColumns] = useState<IGridHeader[]>(
       initialColumnMapping
  );
  // State variables for pagination for next and previous button
  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
    confirmDelinquenciesQueue.currentPage > 1
  );
  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
    confirmDelinquenciesQueue.totalPages > 1
  );
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
    Array(confirmDelinquenciesQueue.items?.length).fill(false)
  );

  const [lateNoticesRecords, setLateNoticesRecords] = useState<
    ILateNoticesItems[]
  >([]);

  // scrolled rows
  const [scrolledRows, setScrolledRows] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
  const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
  const [showAllAutomation, setShowAllAutomation] = useState<boolean>(
    false
 );
  useEffect(()=>{
    if (casesList && !localStorage.getItem("casesList")) {
       localStorage.setItem("casesList", casesList ?? "");
    }
 },[])
  useEffect(() => {
    //confirmDelinquenciesQueue.searchParam="";
    // if(confirmDelinquenciesQueue.totalCount === 1){
      // if(isMounted.current){
    //     getEvictionAutomationNoticeQueue(updatedCurrentPage,
    //         evictionAutomationNoticesConfirmQueue.pageSize, false, evictionAutomationNoticesConfirmQueue.isViewAll);
    //   }
    if (localStorage.getItem("casesList") && isConfirmed) {        
      getConfirmDelinquenciesQueue(1, 100, true, false);
   }
   else
    getConfirmDelinquenciesQueue(1, 100, true, true);
      //  getConfirmDelinquenciesQueue(1, 100, false, confirmDelinquenciesQueue.isViewAll);
        setSelectedConfirmDelinquenciesId([]);
        //getAllCompanies();
        getCounties();
        isMounted.current = false;
        setSelectedTab("Ready to Sign");
      // };
    // };
    
  }, []);

  // useEffect to update pagination and grid data when 'rows' or 'numberOfItemsPerPage' changes
  useEffect(() => {
    const confirmDelinquenciesRecords = confirmDelinquenciesQueue.items.map((item: any) => {
      return {
        isChecked: false, // Add the new property
        ...item, // Spread existing properties
      };
    });
    setLateNoticesRecords(confirmDelinquenciesRecords);
    // Enable/disable pagination buttons based on the number of total pages
    setCanPaginateBack(confirmDelinquenciesQueue.currentPage > 1);
    setCanPaginateFront(confirmDelinquenciesQueue.totalPages > 1);
    setSelectedRows(Array(confirmDelinquenciesQueue.items?.length).fill(false));
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
  }, [confirmDelinquenciesQueue]);

  // Event handler for the 'Back' button
  const handleBackButton = () => {
    if (
        confirmDelinquenciesQueue.currentPage > 1 &&
        confirmDelinquenciesQueue.currentPage <= confirmDelinquenciesQueue.totalPages
    ) {
      const updatedCurrentPage = confirmDelinquenciesQueue.currentPage - 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(confirmDelinquenciesQueue.currentPage > 1);
      // back button get late notices
//       getEvictionAutomationNoticeQueue(updatedCurrentPage,
//         evictionAutomationNoticesConfirmQueue.pageSize, false, evictionAutomationNoticesConfirmQueue.isViewAll);
//   }
      getConfirmDelinquenciesQueue(
        updatedCurrentPage,
        confirmDelinquenciesQueue.pageSize,
        false,
        confirmDelinquenciesQueue.isViewAll
      );
    }
  };

  // // Event handler for the 'Next' button
  const handleFrontButton = () => {
    if (confirmDelinquenciesQueue.currentPage < confirmDelinquenciesQueue.totalPages) {
      const updatedCurrentPage = confirmDelinquenciesQueue.currentPage + 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(updatedCurrentPage > 1);
      // back button get late notices
//       getEvictionAutomationNoticeQueue(updatedCurrentPage,
//         evictionAutomationNoticesConfirmQueue.pageSize, false, evictionAutomationNoticesConfirmQueue.isViewAll);
//   }
      getConfirmDelinquenciesQueue(
        updatedCurrentPage,
        confirmDelinquenciesQueue.pageSize,
        false,
        confirmDelinquenciesQueue.isViewAll
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
    
    if (shiftKeyPressed && lastClickedRowIndex !== -1 && lateNoticesRecords) {
      const start = Math.min(index, lastClickedRowIndex);
      const end = Math.max(index, lastClickedRowIndex);
      setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
        i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
      ));
      setSelectedRows(selectedRows);
      const selectedIds = (lateNoticesRecords || [])
        .filter((_, rowIndex) => selectedRows[rowIndex])
        .map((item) => item.id)
        .filter((id): id is string => typeof id === "string");

        lateNoticesRecords.filter((_, rowIndex) => selectedRows[rowIndex]).map((item)=>{  
          setBulkRecords(prevItems => {
            const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
            uniqueItems.add(JSON.stringify(item)); // Add the new item
            return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
          });      
          //  setBulkRecords((prev)=>[...prev,item]);
        }) 
        setSelectedConfirmDelinquenciesId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
    } else {
      const updatedSelectedRows = [...selectedRows];
      updatedSelectedRows[index] = checked;
      setSelectedRows(updatedSelectedRows);
  
      if (lateNoticesRecords.length === updatedSelectedRows.filter(item => item).length) {
        setSelectAll(true);
      } else {
        setSelectAll(false);
      }
      
      var selectedIds=lateNoticesRecords.filter(item=>item.id==id).map((item) => item.id)
      .filter((id): id is string => typeof id === "string"); 
      // const selectedIds = (fileEvictions.items || [])
      //   .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
      //   .map((item) => item.id)
      //   .filter((id): id is string => typeof id === "string");
  
      if (!checked) {
        // Remove the item from filteredRecords if unchecked        
        setBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
        setSelectedConfirmDelinquenciesId(prevIds => prevIds.filter(item => item !== id));
      } else {
        
        setBulkRecords(prevItems => {
          const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
          uniqueItems.add(JSON.stringify(lateNoticesRecords.filter(x=>x.id===id)[0])); // Add the new item
          return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
        });   
        //setBulkRecords((prev)=>[...prev,allCasesRecords.filter(x=>x.id===id)[0]]);
        // if (selectedItem)
        //   settingData(selectedItem);
        setSelectedConfirmDelinquenciesId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
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
    const allIds: string[] = lateNoticesRecords
      .map((item) => item.id)
      .filter((id): id is string => typeof id === "string");
    if (checked) {
      lateNoticesRecords
      .map((item) =>  setBulkRecords((prev)=>[...prev,item]));
      setSelectedConfirmDelinquenciesId(prevIds => [...new Set([...prevIds, ...allIds])]);    
    } else {
      lateNoticesRecords.forEach((item) => {
        setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
        setSelectedConfirmDelinquenciesId(prevIds => prevIds.filter(id => id !== item.id));
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
  const handleCellRendered = (cellIndex: number, data: IFileEvictionsItems, rowIndex: number) => {
    const columnName = visibleColumns[cellIndex]?.label;
    const propertyName = visibleColumns[cellIndex]?.columnName;
    const cellValue = (data as any)[propertyName];
    
    const renderers: Record<string, () => JSX.Element> = {
       isChecked: () => (
          <GridCheckbox
             // checked={selectedRows.some(row => row.id === data.id && row.selected)}
             checked={
                selectedConfirmDelinquenciesId.includes(data.id as string)
             }
             onChange={(checked: boolean) =>
                handleCheckBoxChange(rowIndex, data.id as string, checked)
             }
             label=""
          />
       ),
       tenantOne:()=>formattedTenantFullName(data?.tenantNames[0]),
       tenantAddressCombined:()=>formattedAddressCell(data),
       tenant1Last: () => formattedCell(data?.tenantNames[0]?.lastName),
       tenant1First: () => formattedCell(data?.tenantNames[0]?.firstName),
       tenant1MI: () => formattedCell(data?.tenantNames[0]?.middleName),
       tenant2Last: () => formattedCell(data?.tenantNames[1]?.lastName),
       tenant2First: () => formattedCell(data?.tenantNames[1]?.firstName),
       tenant2MI: () => formattedCell(data?.tenantNames[1]?.middleName),
       tenant3Last: () => formattedCell(data?.tenantNames[2]?.lastName),
       tenant3First: () => formattedCell(data?.tenantNames[2]?.firstName),
       tenant3MI: () => formattedCell(data?.tenantNames[2]?.middleName),
       tenant4Last: () => formattedCell(data?.tenantNames[3]?.lastName),
       tenant4First: () => formattedCell(data?.tenantNames[3]?.firstName),
       tenant4MI: () => formattedCell(data?.tenantNames[3]?.middleName),
       tenant5Last: () => formattedCell(data?.tenantNames[4]?.lastName),
       tenant5First: () => formattedCell(data?.tenantNames[4]?.firstName),
       tenant5MI: () => formattedCell(data?.tenantNames[4]?.middleName),
       andAllOtherTenants: () => <HighlightedText text={cellValue ?? ""} query={confirmDelinquenciesQueue.searchParam ?? ''} />,
       ownerName: () => <HighlightedText text={cellValue ?? ""} query={confirmDelinquenciesQueue.searchParam ?? ''} />,
       propertyAddress: () => <HighlightedText text={cellValue ?? ""} query={confirmDelinquenciesQueue.searchParam ?? ''} />,
       propertyCity: () => <HighlightedText text={cellValue ?? ""} query={confirmDelinquenciesQueue.searchParam ?? ''} />,
       county: () => <HighlightedText text={cellValue ?? ""} query={confirmDelinquenciesQueue.searchParam ?? ''} />,
      // propertyEmail: () => <HighlightedText text={cellValue ?? ""} query={evictionAutomationNoticesConfirmQueue.searchParam ?? ''} />,
       propertyName: () => <HighlightedText text={cellValue ?? ""} query={confirmDelinquenciesQueue.searchParam ?? ''} />,
       propertyPhone: () => <HighlightedText text={cellValue ?? ""} query={confirmDelinquenciesQueue.searchParam ?? ''} />,
       propertyState: () => <HighlightedText text={cellValue ?? ""} query={confirmDelinquenciesQueue.searchParam ?? ''} />,
       propertyZip: () => <HighlightedText text={cellValue ?? ""} query={confirmDelinquenciesQueue.searchParam ?? ''} />,
      noticeDeliveryDate:() => formattedDateCell(cellValue),
       noticeDefaultStartDate:() => formattedDateCell(cellValue),
      noticeDefaultEndDate:() => formattedDateCell(cellValue),
       noticeLastPaidDate:() => formattedDateCell(cellValue),
       noticePastRentDue:() => formatCurrencyCell(cellValue),
       noticeCurrentRentDue:() => formatCurrencyCell(cellValue),
       noticeLastPaidAmount:() => formatCurrencyCell(cellValue),
       noticeTotalDue:() => formatCurrencyCell(cellValue),
       monthlyRent:() => formatCurrencyCell(cellValue),
       previousNotices:()=>formattedPreviousNoticeCell(cellValue),
    };
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
    
    const formattedDateCell = (value: any) => (
       <span>{value !== null ? formattedDate(value) : ""}</span>
    );
    const formatCurrencyCell = (value: number) => (
       <span>{value !== null ? formatCurrency(value) : ""}</span>
    );
    const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
      <HighlightedText text={`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} query={confirmDelinquenciesQueue.searchParam ?? ''} />
   );
   const formattedAddressCell = (value: IFileEvictionsItems) => (
      <>
         {
            value !== null
               ? <HighlightedText text={`${value.tenantAddress ?? ''} ${value.tenantUnit ?? ''} ${value.tenantCity ?? ''} ${value.tenantState ?? ''} ${value.tenantZip ?? ''}`} query={confirmDelinquenciesQueue.searchParam ?? ''} />
               : ''
         }
      </>
   );
 
    const renderer = renderers[propertyName] || (() => formattedCell(cellValue));

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
          : ""} query={confirmDelinquenciesQueue.searchParam ?? ''} />
    </span>
  );

  const formattedPropertyCell = (value: any) => (
    <span><HighlightedText text={value !== null ? value : ""} query={confirmDelinquenciesQueue.searchParam ?? ''} /></span>
  );

  const formattedCell = (value: any) => (
    <span>{value !== null ? value : ""}</span>
  );

  const formattedAddressCell = (value: ILateNoticesItems) => (
    <span>
      <HighlightedText text={value !== null ? `${value.address ?? ''} ${value.unit ?? ''} ${value.city ?? ''} ${value.zip ?? ''}` : ''}
        query={confirmDelinquenciesQueue.searchParam ?? ''} /> </span>
  );

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
    const sortedRecords = [...lateNoticesRecords];

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
    setLateNoticesRecords(sortedRecords);
  };

  const checkIfAllIdsExist = (
      confirmDelinquenciesRecords: IFileEvictionsItems[],
    selectedConfirmDelinquenciesId: string[]
): boolean | undefined => {
  if (confirmDelinquenciesRecords.length === 0) {
      return false;
  }
    return confirmDelinquenciesRecords.every(record =>
        selectedConfirmDelinquenciesId.includes(record.id as string)
    );
};
//   const checkIfAllIdsExist = (
//     confirmDelinquenciesRecords: IFileEvictionsItems[],
//     selectedConfirmDelinquenciesId: string[]
//   ): boolean|undefined => {
//     return confirmDelinquenciesRecords.every(record =>
//         selectedConfirmDelinquenciesId.includes(record.id as string)
//     );
//   };

  // JSX structure for rendering the component
  return (  
    <div className="mt-2.5">
        <LateNotice_SearchFilter/>
      <div className="relative -mr-0.5">
      <div className="mb-2 text-sm text-gray-600">
            {selectedConfirmDelinquenciesId.length} of {confirmDelinquenciesQueue.totalCount} records selected
         </div>
      <div className="mb-2.5">{localStorage.getItem("casesList") && userRole.includes(UserRole.Signer) && isConfirmed && <ToggleSwitch
                     value={showAllAutomation}
                     label={"View All"}
                     handleChange={(event: ChangeEvent<HTMLInputElement>) => {

                        setShowAllAutomation(event.target.checked);
                        getConfirmDelinquenciesQueue(1, 100, true, event.target.checked,confirmDelinquenciesQueue.searchParam);
                        setSelectedConfirmDelinquenciesId([]);
                     }}
                  ></ToggleSwitch>}</div>
        {/* Render the Grid component with column headings and grid data */}
        {showSpinner === true ? (
          <Spinner />
        ) : (
          <>
          <Grid
                  columnHeading={visibleColumns}
                  rows={confirmDelinquenciesQueue.items}
                  handleSelectAllChange={handleSelectAllChange}
                  selectAll={checkIfAllIdsExist(confirmDelinquenciesQueue.items, selectedConfirmDelinquenciesId)}
                  cellRenderer={(data: IFileEvictionsItems, rowIndex: number, cellIndex: number) => {
                     return handleCellRendered(cellIndex, data, rowIndex);
                  }}
               />
            {/* <Grid
              columnHeading={visibleColumns}
              rows={lateNoticesRecords}
              handleSelectAllChange={handleSelectAllChange}
             // selectAll={selectAll}
              selectAll={checkIfAllIdsExist(lateNoticesRecords,selectedLateNoticeId)}
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
            /> */}
            {/* Render the Pagination component with relevant props */}
            <Pagination
              numberOfItemsPerPage={confirmDelinquenciesQueue.pageSize}
              currentPage={confirmDelinquenciesQueue.currentPage}
              totalPages={confirmDelinquenciesQueue.totalPages}
              totalRecords={confirmDelinquenciesQueue.totalCount}
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
export default ConfirmDelinquenciesGrid;
