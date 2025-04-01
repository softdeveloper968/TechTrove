import React, { ChangeEvent, useRef } from "react";
import { useEffect, useState } from "react";
import { FaEye } from "react-icons/fa";
import Grid from "components/common/grid/GridWithToolTip";
import GridCheckbox from "components/formik/GridCheckBox";
import Spinner from "components/common/spinner/Spinner";
import Pagination from "components/common/pagination/Pagination";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import IconButton from "components/common/button/IconButton";
import AllCasesDetails from "pages/all-cases/components/AllCasesDetails";
import { useDissmissalsContext } from "../DismissalsContext";
import { useAuth } from "context/AuthContext";
import { IDismissalsItems } from "interfaces/dismissals.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { ITenant } from "interfaces/all-cases.interface";
import { formattedDate, toCssClassName } from "utils/helper";
import { UserRole } from "utils/enum";
import HelperViewPdfService from "services/helperViewPdfService";
import { useLocation } from "react-router-dom";
import ToggleSwitch from "components/common/toggle/ToggleSwitch";

// Define the props interface with a  type 'Dismissals'
type DismissalsGridProps = { activeTab: string; };
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
const UnSignedWritsGrid = (props: DismissalsGridProps) => {
  const { userRole } = useAuth();
  const isMounted = useRef(true);
  const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
  const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
  const [newSelectedRows] = useState<boolean[]>([]);
  const initialColumnMapping: IGridHeader[] = [
    ...((userRole.includes(UserRole.NonSigner) && props.activeTab !== "Unsigned") ||
      (userRole.includes(UserRole.Viewer) && props.activeTab === "Unsigned")
      ? []
      : [{
        columnName: "isChecked",
        label: "isChecked",
        controlType: "checkbox"
      }]
    ),
    { columnName: "action", label: "Action", className: "action" },
    { columnName: "county", label: "County" },
    { columnName: "caseNo", label: "CaseNo", toolTipInfo: "The unique number or code associated with your case, as assigned by the court. " },
    { columnName: "propertyVsTenants", label: "PropertyName Vs. Tenants" },
    //  { columnName: "tenantOne", label: "TenantOne" },
    //  { columnName: "tenantTwo", label: "TenantTwo" },
    //  { columnName: "tenantThree", label: "TenantThree" },
    //  { columnName: "tenantFour", label: "TenantFour" },
    //  { columnName: "tenantFive", label: "TenantFive" },
    { columnName: "address", label: "TenantAddressCombined" },
    { columnName: "propertyName", label: "PropertyName" },
   //  { columnName: "filed", label: "DismissalFileDate" },
   //  ...(userRole.includes(UserRole.C2CAdmin)
   //    ? [{
   //      columnName: "companyName",
   //      label: "CompanyName"
   //    }]
   //    : []
   //  ),
  ];
  //  integrated dismissals here
  const {
    unsignedDismissals,
    getAllDismissals,
    showSpinner,
    unsignedDismissalCount,
    setSelectedUnSignedDismissalsId,
    selectedUnSignedDismissalsId,
    setBulkRecords,
  } = useDissmissalsContext();

  // State variables for pagination for next and previous button
  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
    unsignedDismissals.currentPage > 1
  );

  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
    unsignedDismissals.totalPages > 1
  );

  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
    Array(unsignedDismissals.items?.length).fill(false)
  );

  const [dismissalsRecords, setDismissalsRecords] = useState<
    IDismissalsItems[]
  >([]);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [currentCaseId, setCurrentCaseId] = useState<string>("");
  const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(
    initialColumnMapping
  );
  const [showAllEvictions, setShowAllEvictions] = useState<boolean>(
    false
 );
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const casesList = queryParams.get("cases");
  const isDismissal=queryParams.get("isDismissal")=="true";
  useEffect(()=>{
      
    if (casesList && !localStorage.getItem("casesList")) {
       localStorage.setItem("casesList", casesList ?? "");
    }
 },[])
//   useEffect(() => {
//     if (userRole.includes(UserRole.C2CAdmin) && !visibleColumns.some(x => x.columnName === "companyName")) {
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

  // useEffect(() => {
  //   if(unsignedDismissals.totalCount === 1){
  //     if (isMounted.current) {
  //       getAllDismissals(1, 100, false, unsignedDismissals.searchParam);
  //       isMounted.current = false;
  //     };
  //   };
    
  // }, []);

  useEffect(() => {
      if (isMounted.current) {
        setSelectedUnSignedDismissalsId([]);
        if (localStorage.getItem("casesList") && isDismissal)  
          getAllDismissals(1, 100, false, '',"",false);       
       else      
          getAllDismissals(1, 100, false, '',"",true);
        isMounted.current = false;
      };
    
  }, []);


  // useEffect to update pagination and grid data when 'rows' or 'numberOfItemsPerPage' changes
  useEffect(() => {
    setSelectedUnSignedDismissalsId([]);
    setSelectAll(false);
    const dismissalsRecords = unsignedDismissals.items.map((item: any) => {
      return {
        ...(userRole.includes(UserRole.NonSigner) && props.activeTab !== "Unsigned" ? {} : { isChecked: false }),
        ...item, // Spread existing properties
      };
    });
    setDismissalsRecords(dismissalsRecords);
    // Enable/disable pagination buttons based on the number of total pages
    setCanPaginateBack(unsignedDismissals.currentPage > 1);
    setCanPaginateFront(unsignedDismissals.totalPages > 1);
    setSelectedRows(Array(unsignedDismissals.items?.length).fill(false));

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
  }, [unsignedDismissals, userRole, props.activeTab]);

  // Event handler for the 'Back' button
  const handleBackButton = () => {
    if (
      unsignedDismissals.currentPage > 1 &&
      unsignedDismissals.currentPage <= unsignedDismissals.totalPages
    ) {
      const updatedCurrentPage = unsignedDismissals.currentPage - 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(unsignedDismissals.currentPage > 1);
      // back button get dismissals
      getAllDismissals(updatedCurrentPage, unsignedDismissals.pageSize, false,unsignedDismissals.searchParam,"",unsignedDismissals.isViewAll);
    }
  };

  // // Event handler for the 'Next' button
  const handleFrontButton = () => {
    if (unsignedDismissals.currentPage < unsignedDismissals.totalPages) {
      const updatedCurrentPage = unsignedDismissals.currentPage + 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(updatedCurrentPage > 1);
      // back button get dismissals
      getAllDismissals(updatedCurrentPage, unsignedDismissals.pageSize, false,unsignedDismissals.searchParam,"",unsignedDismissals.isViewAll);
    }
  };

  // const handleCheckBoxChange = (index: number, checked: boolean) => {
  //   const updatedSelectedRows = [...selectedRows];
  //   updatedSelectedRows[index] = checked;
  //   setSelectedRows(updatedSelectedRows);
  //   if (unsignedDismissals.items.length === updatedSelectedRows.filter(item => item).length) {
  //     setSelectAll(true);
  //   } else {
  //     setSelectAll(false);
  //   }

  //   const selectedIds = (unsignedDismissals.items || [])
  //     .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
  //     .map((item) => item.id)
  //     .filter((id): id is string => typeof id === "string");
  //   if (unsignedDismissals.items.length === updatedSelectedRows.filter(item => item).length) {
  //     setSelectAll(true);
  //   } else {
  //     setSelectAll(false);
  //   }
  //   setSelectedUnSignedDismissalsId(selectedIds);
  // };

  const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {
    
    if (shiftKeyPressed && lastClickedRowIndex !== -1 && dismissalsRecords) {
      const start = Math.min(index, lastClickedRowIndex);
      const end = Math.max(index, lastClickedRowIndex);
      setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
        i >= start && i <= end ? selectedRows[i] = true : newSelectedRows[i]
      ));
      setSelectedRows(selectedRows);
      const selectedIds = (dismissalsRecords || [])
        .filter((_, rowIndex) => selectedRows[rowIndex])
        .map((item) => item.id)
        .filter((id): id is string => typeof id === "string");

        dismissalsRecords.filter((_, rowIndex) => selectedRows[rowIndex]).map((item)=>{  
          setBulkRecords(prevItems => {
            const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
            uniqueItems.add(JSON.stringify(item)); // Add the new item
            return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
          });      
          //  setBulkRecords((prev)=>[...prev,item]);
        }) 
        setSelectedUnSignedDismissalsId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
    } else {
      const updatedSelectedRows = [...selectedRows];
      updatedSelectedRows[index] = checked;
      setSelectedRows(updatedSelectedRows);
  
      if (dismissalsRecords.length === updatedSelectedRows.filter(item => item).length) {
        setSelectAll(true);
      } else {
        setSelectAll(false);
      }
      
      var selectedIds=dismissalsRecords.filter(item=>item.id==id).map((item) => item.id)
      .filter((id): id is string => typeof id === "string"); 
      // const selectedIds = (fileEvictions.items || [])
      //   .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
      //   .map((item) => item.id)
      //   .filter((id): id is string => typeof id === "string");
  
      if (!checked) {
        // Remove the item from filteredRecords if unchecked        
        setBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
        setSelectedUnSignedDismissalsId(prevIds => prevIds.filter(item => item !== id));
      } else {
        
        setBulkRecords(prevItems => {
          const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
          uniqueItems.add(JSON.stringify(dismissalsRecords.filter(x=>x.id===id)[0])); // Add the new item
          return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
        });   
        //setBulkRecords((prev)=>[...prev,allCasesRecords.filter(x=>x.id===id)[0]]);
        // if (selectedItem)
        //   settingData(selectedItem);
        setSelectedUnSignedDismissalsId(prevIds => [...new Set([...prevIds, ...selectedIds])]);
      }
     
    }
  
    setLastClickedRowIndex(index);
  };

  // const handleSelectAllChange = (checked: boolean) => {
  //   const newSelectAll = !selectAll;
  //   const allIds: string[] = unsignedDismissals.items
  //     .map((item) => item.id)
  //     .filter((id): id is string => typeof id === "string");
  //   if (checked) {
  //     setSelectedUnSignedDismissalsId(allIds);
  //   } else {
  //     setSelectedUnSignedDismissalsId([]);
  //   }

  //   setSelectAll((prevSelectAll) => {
  //     // Update selectedRows state
  //     setSelectedRows(Array(allIds.length).fill(newSelectAll));
  //     return newSelectAll;
  //   });
  // };

  const handleSelectAllChange = (checked: boolean) => {
    
    const newSelectAll = !selectAll;
    const allIds: string[] = dismissalsRecords
      .map((item) => item.id)
      .filter((id): id is string => typeof id === "string");
    if (checked) {
      dismissalsRecords
      .map((item) =>  setBulkRecords((prev)=>[...prev,item]));
          setSelectedUnSignedDismissalsId(prevIds => [...new Set([...prevIds, ...allIds])]);    
    } else {
      dismissalsRecords.forEach((item) => {
        setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
        setSelectedUnSignedDismissalsId(prevIds => prevIds.filter(id => id !== item.id));
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

  const handleShowDetails = (id: string) => {
   setCurrentCaseId(id);
   setShowDetails(true);
};

  const handleCellRendered = (
    cellIndex: number,
    data: IDismissalsItems,
    rowIndex: number
  ) => {
    const columnName = visibleColumns[cellIndex]?.label;
    //const propertyName = (initialColumnMapping as any)[columnName];
    const propertyName = visibleColumns[cellIndex]?.columnName;
    const cellValue = (data as any)[propertyName];
    // Check if the user is a non-signer and the column is 'isChecked' and the active tab is not "Unsigned"
    if (userRole.includes(UserRole.NonSigner) && columnName === 'isChecked' && props.activeTab !== 'Unsigned') {
      return null; // Skip rendering the checkbox
    }
    const renderers: Record<string, () => JSX.Element> = {
      isChecked: () => (
        <GridCheckbox
          // checked={selectedRows[rowIndex]}
          checked={selectedUnSignedDismissalsId.includes(data.id as string)}
          onChange={(checked: boolean) =>
            handleCheckBoxChange(rowIndex,data.id as string, checked)
          }
          label=""
        />
      ),
      action: () => renderActionsCell(data.id ?? ""),
      caseNo: () => renderHighlightedCell(cellValue),
      propertyName: () => renderHighlightedCell(cellValue),
      propertyVsTenants: () => renderPropertyVsTenants(data),
      county: () => renderHighlightedCell(cellValue),
      evictionAffiantSignature: () => formattedCell(cellValue),
      // tenantOne: () => formattedTenantFullName(data?.tenantNames[0]),
      // tenantTwo: () => formattedTenantFullName(data?.tenantNames[1]),
      // tenantThree: () => formattedTenantFullName(data?.tenantNames[2]),
      // tenantFour: () => formattedTenantFullName(data?.tenantNames[3]),
      // tenantFive: () => formattedTenantFullName(data?.tenantNames[4]),
      filed: () => formattedDateCell(data.filed),
      dismissalAffiantSignature: () => formattedCell(cellValue),
      address: () => (
        <span>
          <HighlightedText text={`${data.address ?? ''} ${data.unit ?? ''} ${data.city ?? ''} ${data.state ?? ''} ${data.zip ?? ''}`} query={unsignedDismissals.searchParam ?? ''} />
        </span>
      ),
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

//   const renderPropertyVsTenants = (data: IDismissalsItems) => (
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

 const renderPropertyVsTenants = (data: IDismissalsItems) => (
  <>
    <HighlightedText text={data.propertyName ?? ''} query={unsignedDismissals.searchParam ?? ''} />
    <strong className="font-semibold text-gray-900">
      {data.propertyName && data.tenantNames?.length ? " Vs. " : ""}
    </strong>
    <br />
    {data.tenantNames.map((tenant, index) => (
      <span key={index}>
        <HighlightedText
          text={`${tenant.firstName} ${tenant.middleName ? tenant.middleName + ' ' : ''}${tenant.lastName}`}
          query={unsignedDismissals.searchParam ?? ''}
        />
        {index !== data.tenantNames.length - 1 ? ',' : data.andAllOtherOccupants?.length ? ',' : ''}
        <br />
      </span>
    ))}
    <HighlightedText
      text={`${data.andAllOtherOccupants?.length ? "and " : ""}${data.andAllOtherOccupants ?? ""}`}
      query={unsignedDismissals.searchParam ?? ''}
    />
  </>
);

  const formattedDateCell = (value: any) => (
    <span>{value !== null ? formattedDate(value) : ""}</span>
  );

  // const formattedCell = (value: any) => (
  //   <span><HighlightedText text={value ?? ''} query={unsignedDismissals.searchParam ?? ''} /></span>
  // );

  const formattedCell = (value: any) => (
    <span>{value !== null ? value : ""}</span>
 );
 

 const renderHighlightedCell = (value: any) => (
    <HighlightedText text={value as string ?? ''} query={unsignedDismissals.searchParam ?? ''} />
 );
  const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
   <HighlightedText text={`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} query={unsignedDismissals.searchParam ?? ''} />
  );

  const checkIfAllIdsExist = (
		    dismissalsRecords: IDismissalsItems[],
    selectedUnSignedDismissalsId: string[]
): boolean | undefined => {
   if (dismissalsRecords.length === 0) {
	   return false;
   }
	   return dismissalsRecords.every(record =>
      selectedUnSignedDismissalsId.includes(record.id as string)
    );
};

  // const checkIfAllIdsExist = (
  //   dismissalsRecords: IDismissalsItems[],
  //   selectedUnSignedDismissalsId: string[]
  // ): boolean|undefined => {
  //   return dismissalsRecords.every(record =>
  //     selectedUnSignedDismissalsId.includes(record.id as string)
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


  // JSX structure for rendering the component
  return (
    <div className="mt-3">
      <div className="relative -mr-0.5">
      <div className="mb-2 text-sm text-gray-600">
            {selectedUnSignedDismissalsId.length} of {unsignedDismissals.totalCount} records selected
         </div>
        {/* Render the Grid component with column headings and grid data */}
        {showSpinner === true ? (
          <Spinner />
        ) : (
          <>
          <div className="relative flex flex-wrap items-center mb-1.5 mt-2.5 justify-end">
                  {localStorage.getItem("casesList") && userRole.includes(UserRole.Signer) && <ToggleSwitch
                     value={showAllEvictions}
                     label={"View All"}
                     handleChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setShowAllEvictions(event.target.checked);
                        getAllDismissals(1, 100,false,unsignedDismissals.searchParam,"", event.target.checked);
                        setSelectedUnSignedDismissalsId([]);
                     }}
                  ></ToggleSwitch>}
               </div>
            <Grid
              columnHeading={visibleColumns}
              rows={dismissalsRecords}
              handleSelectAllChange={handleSelectAllChange}
              selectAll={checkIfAllIdsExist(dismissalsRecords,selectedUnSignedDismissalsId)}
              cellRenderer={(
                data: IDismissalsItems,
                rowIndex: number,
                cellIndex: number
              ) => {
                return handleCellRendered(cellIndex, data, rowIndex);
              }}
              selectedIds={selectedUnSignedDismissalsId}
            />
            {/* Render the Pagination component with relevant props */}
            <Pagination
              numberOfItemsPerPage={unsignedDismissals.pageSize}
              currentPage={unsignedDismissals.currentPage}
              totalPages={unsignedDismissals.totalPages}
              totalRecords={unsignedDismissals.totalCount}
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
               title="Dismissals Case Details"
               caseId={currentCaseId}
               showDetails={showDetails}
               setShowDetails={(show: boolean) => setShowDetails(show)}
            />
         )}
    </div>
  );
};

// Export the component as the default export
export default UnSignedWritsGrid;
