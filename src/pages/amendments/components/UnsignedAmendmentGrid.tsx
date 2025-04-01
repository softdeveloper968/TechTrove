import React, { useRef } from "react";
import { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import Grid from "components/common/grid/GridWithToolTip";
import GridCheckbox from "components/formik/GridCheckBox";
import Spinner from "components/common/spinner/Spinner";
import Pagination from "components/common/pagination/Pagination";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import IconButton from "components/common/button/IconButton";
import AllCasesDetails from "pages/all-cases/components/AllCasesDetails";
import { formatCurrency, formattedDate, toCssClassName } from "utils/helper";
import { UserRole } from "utils/enum";
import HelperViewPdfService from "services/helperViewPdfService";
import { useAuth } from "context/AuthContext";
import { useAmendmentsContext } from "../AmendmentsContext";
import { IAmendmentsItems } from "interfaces/amendments.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { ITenant } from "interfaces/all-cases.interface";

// Define the props interface with a  type 'Dismissals'
type AmendmentGridProps = {activeTab: string;};
// const initialColumnMapping = {
//   isChecked: "isChecked",
//   "Case No": "caseNo",
//   "All PDF's": "documents",
//   Property: "property",
//   County: "county",
//   Name: "name",
//   Address: "address",
//   "Dismissal File Date": "filed",
//   "Eviction Affiant Signature":"evictionAffiantSignature"
// };
// React functional component 'DismissalsGrid' with a generic type 'IDismissals'
const UnsignedAmendmentGrid = (props: AmendmentGridProps) => {
  const isMounted = useRef(true);
  const { userRole } = useAuth();
  const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
  const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
  const [newSelectedRows] = useState<boolean[]>([]);
  const initialColumnMapping:IGridHeader[]  =[
    ...( (userRole.includes(UserRole.NonSigner) && props.activeTab !== "Unsigned") ||
    (userRole.includes(UserRole.Viewer) && props.activeTab === "Unsigned")
    ? []
    : [{
        columnName: "isChecked",
        label: "isChecked",
        controlType: "checkbox"
      }]
  ),
  { columnName: "action", label: "Action", className: "action" },
  // {columnName:"county",label:"County"},
  // { columnName:"caseNo",label:"CaseNo",toolTipInfo:"The unique number or code associated with your case, as assigned by the court."},
  // { columnName:"propertyVsTenants",label:"PropertyName Vs. Tenants" },
  // {columnName:"address",label:"TenantAddressCombined"},
  // {columnName:"propertyName",label:"PropertyName"},
  // {columnName:"evictionAffiantSignature",label:"EvictionAffiantSignature"},
  { columnName: "county", label: "County" },
  { columnName: "tenant1Last", label: "Tenant1Last" },
  { columnName: "tenant1First", label: "Tenant1First" },
  { columnName: "tenant1MI", label: "Tenant1MI" },
  { columnName: "andAllOtherOccupants", label: "AndAllOtherOccupants" },
  { columnName: "address", label: "TenantAddress", className: "TenantAddress" },
  { columnName: "unit", label: "TenantUnit" },
  { columnName: "city", label: "TenantCity" },
  { columnName: "state", label: "TenantState" },
  { columnName: "zip", label: "TenantZip", className:'text-right' },
  { columnName: "tenant2Last", label: "Tenant2Last" },
  { columnName: "tenant2First", label: "Tenant2First" },
  { columnName: "tenant2MI", label: "Tenant2MI" },
  { columnName: "tenant3Last", label: "Tenant3Last" },
  { columnName: "tenant3First", label: "Tenant3First" },
  { columnName: "tenant3MI", label: "Tenant3MI" },
  { columnName: "tenant4Last", label: "Tenant4Last" },
  { columnName: "tenant4First", label: "Tenant4First" },
  { columnName: "tenant4MI", label: "Tenant4MI" },
  { columnName: "tenant5Last", label: "Tenant5Last" },
  { columnName: "tenant5First", label: "Tenant5First" },
  { columnName: "tenant5MI", label: "Tenant5MI" },
  { columnName: "reason", label: "EvictionReason", className: "EvictionReason", },
  { columnName: "evictionTotalRentDue", label: "EvictionTotalRentDue", className:'text-right' },
  { columnName: "monthlyRent", label: "MonthlyRent", className:'text-right' },
  { columnName: "allMonths", label: "AllMonths" },
  { columnName: "evictionOtherFees", label: "EvictionOtherFees" },
  { columnName: "ownerName", label: "OwnerName" },
  { columnName: "propertyName", label: "PropertyName" },
  { columnName: "propertyPhone", label: "PropertyPhone" },
  { columnName: "propertyEmail", label: "PropertyEmail", className: "PropertyEmail", },
  { columnName: "propertyAddress", label: "PropertyAddress", className: "PropertyAddress", },
  { columnName: "propertyCity", label: "PropertyCity" },
  { columnName: "propertyState", label: "PropertyState" },
  { columnName: "propertyZip", label: "PropertyZip", className:'text-right' },
  { columnName: "attorneyName", label: "AttorneyName" },
  { columnName: "attorneyBarNo", label: "AttorneyBarNo", className:'text-right' },
  { columnName: "attorneyEmail", label: "AttorneyEmail", className: "AttorneyEmail", },
  { columnName: "filerBusinessName", label: "FilerBusinessName" },
  { columnName: "evictionAffiantIs", label: "EvictionAffiantIs" },
  { columnName: "filerPhone", label: "EvictionFilerPhone" },
  { columnName: "filerEmail", label: "EvictionFilerEmail" },
  { columnName: "expedited", label: "Expedited" },
  { columnName: "stateCourt", label: "StateCourt" },

    ];
  //  integrated amendment here
  const { signedAmendment, getAllAmendments,unsignedAmendment, showSpinner, setSelectedAmendmentsId, unsignedAmendmentCount,setBulkRecords ,selectedAmendmentsId} =
  useAmendmentsContext();

  // State variables for pagination for next and previous button
  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
    unsignedAmendment.currentPage > 1
  );

  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
    unsignedAmendment.totalPages > 1
  );

  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
    Array(unsignedAmendment.items?.length).fill(false)
  );

  const [amendmentRecords, setAmendmentRecords] = useState<
    IAmendmentsItems[]
  >([]);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [currentCaseId, setCurrentCaseId] = useState<string>("");
  const [visibleColumns,setVisibleColumns] = useState<IGridHeader[]>(
    initialColumnMapping
  );
//   useEffect(()=>{
//     if(userRole.includes(UserRole.C2CAdmin) && !visibleColumns.some(x=>x.columnName==="companyName")){
//       setVisibleColumns((prev) => (
//         [
//           ...prev,
//           {
//             columnName: "companyName",
//             label: "CompanyName"
//           }
//         ]
//       )
//       )
//     }
//   }, [userRole]);

  useEffect(() => {
      if(isMounted.current){
        setSelectedAmendmentsId([]);
        getAllAmendments(1, 100, false, '');
        isMounted.current = false;
      };

  }, []);
  

  // useEffect to update pagination and grid data when 'rows' or 'numberOfItemsPerPage' changes
  useEffect(() => {
    setSelectAll(false);
    const amendmemntRecords = unsignedAmendment.items.map((item: any) => {
      return {
        ...(userRole.includes(UserRole.NonSigner) && props.activeTab !== "Unsigned" ? {} : { isChecked: false }),
        ...item, // Spread existing properties
      };
    });
    
    setAmendmentRecords(amendmemntRecords);
    // Enable/disable pagination buttons based on the number of total pages
    setCanPaginateBack(unsignedAmendment.currentPage > 1);
    setCanPaginateFront(unsignedAmendment.totalPages > 1);
    setSelectedRows(Array(unsignedAmendment.items?.length).fill(false));
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
  }, [unsignedAmendment,userRole, props.activeTab]);

  // Event handler for the 'Back' button
  const handleBackButton = () => {
    if (
      unsignedAmendment.currentPage > 1 &&
      unsignedAmendment.currentPage <= unsignedAmendment.totalPages
    ) {
      const updatedCurrentPage = unsignedAmendment.currentPage - 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(unsignedAmendment.currentPage > 1);
      // back button get dismissals
      getAllAmendments(updatedCurrentPage, unsignedAmendment.pageSize, false);
    }
  };

  // // Event handler for the 'Next' button
  const handleFrontButton = () => {
    if (unsignedAmendment.currentPage < unsignedAmendment.totalPages) {
      const updatedCurrentPage = unsignedAmendment.currentPage + 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(updatedCurrentPage > 1);
      // back button get dismissals
      getAllAmendments(updatedCurrentPage, unsignedAmendment.pageSize, false);
    }
  };

  // const handleCheckBoxChange = (index: number, checked: boolean) => {
  //   const updatedSelectedRows = [...selectedRows];
  //   updatedSelectedRows[index] = checked;
  //   setSelectedRows(updatedSelectedRows);
  //   const selectedIds = (unsignedAmendment.items || [])
  //     .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
  //     .map((item) => item.id)
  //     .filter((id): id is string => typeof id === "string");
  //     if (unsignedAmendment.items.length === updatedSelectedRows.filter(item => item).length) {
  //       setSelectAll(true);
  //     } else {
  //       setSelectAll(false);
  //     }
  //     setSelectedAmendmentsId(selectedIds);
  // };

  const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {
    
    if (shiftKeyPressed && lastClickedRowIndex !== -1 && amendmentRecords) {
      const start = Math.min(index, lastClickedRowIndex);
      const end = Math.max(index, lastClickedRowIndex);
      setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
        i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
      ));
      setSelectedRows(selectedRows);
      const selectedIds = (amendmentRecords || [])
        .filter((_, rowIndex) => selectedRows[rowIndex])
        .map((item) => item.id)
        .filter((id): id is string => typeof id === "string");

        amendmentRecords.filter((_, rowIndex) => selectedRows[rowIndex]).map((item)=>{  
          setBulkRecords(prevItems => {
            const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
            uniqueItems.add(JSON.stringify(item)); // Add the new item
            return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
          });      
          //  setBulkRecords((prev)=>[...prev,item]);
        }) 
        setSelectedAmendmentsId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
    } else {
      const updatedSelectedRows = [...selectedRows];
      updatedSelectedRows[index] = checked;
      setSelectedRows(updatedSelectedRows);
  
      if (amendmentRecords.length === updatedSelectedRows.filter(item => item).length) {
        setSelectAll(true);
      } else {
        setSelectAll(false);
      }
      
      var selectedIds=amendmentRecords.filter(item=>item.id==id).map((item) => item.id)
      .filter((id): id is string => typeof id === "string"); 
      // const selectedIds = (fileEvictions.items || [])
      //   .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
      //   .map((item) => item.id)
      //   .filter((id): id is string => typeof id === "string");
  
      if (!checked) {
        // Remove the item from filteredRecords if unchecked        
        setBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
        setSelectedAmendmentsId(prevIds => prevIds.filter(item => item !== id));
      } else {
        
        setBulkRecords(prevItems => {
          const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
          uniqueItems.add(JSON.stringify(amendmentRecords.filter(x=>x.id===id)[0])); // Add the new item
          return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
        });   
        //setBulkRecords((prev)=>[...prev,allCasesRecords.filter(x=>x.id===id)[0]]);
        // if (selectedItem)
        //   settingData(selectedItem);
        setSelectedAmendmentsId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
      }
     
    }
  
    setLastClickedRowIndex(index);
  };

  const formattedDocumentCell = (cellValue: any) => {
    return cellValue ?
      <h1
        onClick={() => openPdf(cellValue)}
        className="underline text-[#2472db]"
        style={{ cursor: 'pointer' }}
      >
        Amendment.pdf
      </h1> : <></>;
  }
  
  const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
   <HighlightedText text={`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} query={unsignedAmendment.searchParam ?? ''} />
  );

  // const handleSelectAllChange = (checked: boolean) => {
  //   const newSelectAll = !selectAll;
  //   const allIds: string[] = unsignedAmendment.items
  //     .map((item) => item.id)
  //     .filter((id): id is string => typeof id === "string");
  //   if (checked) {
  //     setSelectedAmendmentsId(allIds);
  //   } else {
  //     setSelectedAmendmentsId([]);
  //   }

  //   setSelectAll((prevSelectAll) => {
  //     // Update selectedRows state
  //     setSelectedRows(Array(allIds.length).fill(newSelectAll));
  //     return newSelectAll;
  //   });
  // };
  const handleSelectAllChange = (checked: boolean) => {
    
    const newSelectAll = !selectAll;
    const allIds: string[] = amendmentRecords
      .map((item) => item.id)
      .filter((id): id is string => typeof id === "string");
    if (checked) {
      amendmentRecords
      .map((item) =>  setBulkRecords((prev)=>[...prev,item]));
          setSelectedAmendmentsId(prevIds => [...new Set([...prevIds, ...allIds])]);    
    } else {
      amendmentRecords.forEach((item) => {
        setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
        setSelectedAmendmentsId(prevIds => prevIds.filter(id => id !== item.id));
  });
    }

    setSelectAll((prevSelectAll) => {
      // Update selectedRows state
      setSelectedRows(Array(allIds.length).fill(newSelectAll));
      return newSelectAll;
    });
  };
  const openPdf = async(url:string) =>{
    HelperViewPdfService.GetPdfView(url);
}

const handleShowDetails = (id: string) => {
   setCurrentCaseId(id);
   setShowDetails(true);
};

  const handleCellRendered = (
    cellIndex: number,
    data: IAmendmentsItems,
    rowIndex: number
  ) => {
    const columnName = visibleColumns[cellIndex]?.label;
    //const propertyName = (initialColumnMapping as any)[columnName];
    const propertyName =visibleColumns[cellIndex]?.columnName;
    const cellValue = (data as any)[propertyName];
     // Check if the user is a non-signer and the column is 'isChecked' and the active tab is not "Unsigned"
     if (userRole.includes(UserRole.NonSigner) && columnName === 'isChecked' && props.activeTab !== 'Unsigned') {
      return null; // Skip rendering the checkbox
    }
    const renderers: Record<string, () => JSX.Element> = {
      isChecked: () => (
        <GridCheckbox
          // checked={selectedRows[rowIndex]}
          checked={selectedAmendmentsId.includes(data.id as string)}
          onChange={(checked: boolean) =>
            handleCheckBoxChange(rowIndex,data.id as string, checked)
          }
          label=""
        />
      ),
      action: () => renderActionsCell(data.id ?? ""),
        // documents: () => formattedDocumentCell(cellValue),
        propertyName: () => renderHighlightedCell(cellValue),
        propertyVsTenants: () => renderPropertyVsTenants(data),
        county: () => renderHighlightedCell(cellValue),
        tenant1Last: () => renderHighlightedCell(cellValue),
        tenant1First: () => renderHighlightedCell(cellValue),
        unit: () => renderHighlightedCell(cellValue),
        city: () => renderHighlightedCell(cellValue),
        state: () => renderHighlightedCell(cellValue),
        zip: () => renderHighlightedCell(cellValue),
        expedited: () => <span>{cellValue != "" && cellValue != null ? "Expedited" : ""}</span>,
        attorneyName: () => renderHighlightedCell(cellValue),
        attorneyBarNo: () => renderHighlightedCell(cellValue),
        filerEmail: () => renderHighlightedCell(cellValue),
        // evictionTotalRentDue: () => (
        //   <span>
        //     {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(cellValue))}
        //   </span>
        // ),
        evictionTotalRentDue: () => {
          let formattedValue = cellValue;
    
          // Try to parse the cellValue as a number
          const numericValue = parseFloat(cellValue);
          
          // Check if the parsed value is a valid number
          if (!isNaN(numericValue)) {
            // Format as currency if it's a valid number
            formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericValue);
          }
          
          return <span>{formattedValue}</span>;
        },
        // monthlyRent: () => (
        //   <span>
        //     {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(cellValue))}
        //   </span>
        // ),
        monthlyRent:() => formatCurrencyCell(cellValue),
        evictionOtherFees: () => {
          let formattedValue = cellValue;
    
          // Try to parse the cellValue as a number
          const numericValue = parseFloat(cellValue);
          
          // Check if the parsed value is a valid number
          if (!isNaN(numericValue)) {
            // Format as currency if it's a valid number
            formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericValue);
          }
          
          return <span>{formattedValue}</span>;
        },
        // tenant1Last:()=>formattedCell(data?.tenantNames[0]?.lastName),
        // tenant1First:()=>formattedCell(data?.tenantNames[0]?.firstName),
        // tenant1MI:()=>formattedCell(data?.tenantNames[0]?.middleName),
        // tenant2Last:()=>formattedCell(data?.tenantNames[1]?.lastName),
        // tenant2First:()=>formattedCell(data?.tenantNames[1]?.firstName),
        // tenant2MI:()=>formattedCell(data?.tenantNames[1]?.middleName),
        // tenant3Last:()=>formattedCell(data?.tenantNames[2]?.lastName),
        // tenant3First:()=>formattedCell(data?.tenantNames[2]?.firstName),
        // tenant3MI:()=>formattedCell(data?.tenantNames[2]?.middleName),
        // tenant4Last:()=>formattedCell(data?.tenantNames[3]?.lastName),
        // tenant4First:()=>formattedCell(data?.tenantNames[3]?.firstName),
        // tenant4MI:()=>formattedCell(data?.tenantNames[3]?.middleName),
        // tenant5Last:()=>formattedCell(data?.tenantNames[4]?.lastName),
        // tenant5First:()=>formattedCell(data?.tenantNames[4]?.firstName),
        // tenant5MI:()=>formattedCell(data?.tenantNames[4]?.middleName),
        // address: () => (
        //   <span>
        //   <HighlightedText text= {`${data.address ?? ''} ${data.unit ?? ''} ${data.city ?? ''} ${data.state ?? ''} ${data.zip ?? ''}`}  query={unsignedAmendment.searchParam ?? ''}/>
        //   </span>
        // ),
        address: () => renderHighlightedCell(cellValue),
        // writFileDate: () => formattedDateCell(data.writFileDate),
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
  
  const formatCurrencyCell = (value: number) => (
    <span>{value !== null ? formatCurrency(value) : ""}</span>
 );
//   const renderPropertyVsTenants = (data: IAmendmentsItems) => (
//    <>
//      {data.propertyName ?? ''}
//      <strong className="font-semibold text-gray-900">
//         {data.propertyName && data.tenantNames?.length ? " Vs. " : ""}
//      </strong>
//      <br />
//      {data.tenantNames.map((tenant, index) => (
//         <span key={index}>
//         {`${tenant.firstName} ${tenant.middleName ? tenant.middleName + ' ' : ''}${tenant.lastName}${index !== data.tenantNames.length - 1 ? ',' : data.andAllOtherOccupants?.length ? ',' : ''}`}
//         <br />
//         </span>
//      ))}
//      {`${data.andAllOtherOccupants?.length ? "and " : ""}${data.andAllOtherOccupants ?? ""}`}
//    </>
//  );

 const renderPropertyVsTenants = (data: IAmendmentsItems) => (
  <>
    <HighlightedText text={data.propertyName ?? ''} query={unsignedAmendment.searchParam ?? ''} />
    <strong className="font-semibold text-gray-900">
      {data.propertyName && data.tenantNames?.length ? " Vs. " : ""}
    </strong>
    <br />
    {data.tenantNames.map((tenant, index) => (
      <span key={index}>
        <HighlightedText
          text={`${tenant.firstName} ${tenant.middleName ? tenant.middleName + ' ' : ''}${tenant.lastName}`}
          query={unsignedAmendment.searchParam ?? ''}
        />
        {index !== data.tenantNames.length - 1 ? ',' : data.andAllOtherOccupants?.length ? ',' : ''}
        <br />
      </span>
    ))}
    <HighlightedText
      text={`${data.andAllOtherOccupants?.length ? "and " : ""}${data.andAllOtherOccupants ?? ""}`}
      query={unsignedAmendment.searchParam ?? ''}
    />
  </>
);

  const formattedDateCell = (value: any) => (
    <span>{value !== null ? formattedDate(value) : ""}</span>
  );

  // const formattedCell = (value: any) => (
  //  <span><HighlightedText text={value ?? ''} query={unsignedAmendment.searchParam ?? ''} /></span> 
  // );

  const formattedCell = (value: any) => (
    <span>{value !== null ? value : ""}</span>
 );
 

 const renderHighlightedCell = (value: any) => (
    <HighlightedText text={value as string ?? ''} query={unsignedAmendment.searchParam ?? ''} />
 );

  const checkIfAllIdsExist = (
  amendmentRecords: IAmendmentsItems[],
    selectedAmendmentsId: string[]
): boolean | undefined => {
   if (amendmentRecords.length === 0) {
	   return false;
   }
	      return amendmentRecords.every(record =>
      selectedAmendmentsId.includes(record.id as string)
    );
};
  // const checkIfAllIdsExist = (
  //   amendmentRecords: IAmendmentsItems[],
  //   selectedAmendmentsId: string[]
  // ): boolean|undefined => {
  //   return amendmentRecords.every(record =>
  //     selectedAmendmentsId.includes(record.id as string)
  //   );
  // };

  const renderActionsCell = (id: string) => {
   return (
      <>
         <IconButton
            type={"button"}
            className="cursor-pointer text-[#2472db]"
            disabled={!id.length}
            icon={<FaEye className="h-4 w-4" />}
            handleClick={() => handleShowDetails(id)}
         />
      </>
   );
};

  return (
    <div className="mt-3">
      <div className="relative -mr-0.5">
      <div className="mb-2 text-sm text-gray-600">
            {selectedAmendmentsId.length} of {unsignedAmendment.totalCount} records selected
         </div>
        {/* Render the Grid component with column headings and grid data */}
        {showSpinner === true ? (
          <Spinner />
        ) : (
          <>
            <Grid
              columnHeading={visibleColumns}
              rows={amendmentRecords}
              handleSelectAllChange={handleSelectAllChange}
              selectAll={checkIfAllIdsExist(amendmentRecords,selectedAmendmentsId)}
              cellRenderer={(
                data: IAmendmentsItems,
                rowIndex: number,
                cellIndex: number
              ) => {
                return handleCellRendered(cellIndex, data, rowIndex);
              }}

              selectedIds={selectedAmendmentsId}
            />
            {/* Render the Pagination component with relevant props */}
            <Pagination
              numberOfItemsPerPage={unsignedAmendment.pageSize}
              currentPage={unsignedAmendment.currentPage}
              totalPages={unsignedAmendment.totalPages}
              totalRecords={unsignedAmendment.totalCount}
              handleFrontButton={handleFrontButton}
              handleBackButton={handleBackButton}
              canPaginateBack={canPaginateBack}
              canPaginateFront={canPaginateFront}
            />
          </>
        )}
      </div>
      {showDetails && (
            <AllCasesDetails
               title="Amendments Case Details"
               caseId={currentCaseId}
               showDetails={showDetails}
               setShowDetails={(show: boolean) => setShowDetails(show)}
            />
         )}
    </div>
  );
};

// Export the component as the default export
export default UnsignedAmendmentGrid;
