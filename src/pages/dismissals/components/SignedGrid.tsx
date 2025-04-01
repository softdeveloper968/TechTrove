import React, { useRef } from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FaCopy, FaEye } from "react-icons/fa";
import Grid from "components/common/grid/GridWithToolTip";
import Spinner from "components/common/spinner/Spinner";
import Pagination from "components/common/pagination/Pagination";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import IconButton from "components/common/button/IconButton";
import AllCasesDetails from "pages/all-cases/components/AllCasesDetails";
import { useDissmissalsContext } from "../DismissalsContext";
import { IDismissalsItems } from "interfaces/dismissals.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { convertUtcToEst, formattedDate, toCssClassName } from "utils/helper";
import HelperViewPdfService from "services/helperViewPdfService";
// Define the props interface with a  type 'Dismissals'
type SignedDismissalsGridProps = {};



// React functional component 'DismissalsGrid' with a generic type 'IDismissals'
const SignedDismissalsGrid = (props: SignedDismissalsGridProps) => {
   const isMounted = useRef(true);
   //  integrated dismissals here
   const { signedDismissals, getAllDismissals, showSpinner, unsignedDismissals, setSelectedUnSignedDismissalsId} =
      useDissmissalsContext();

   // State variables for pagination for next and previous button
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
      signedDismissals.currentPage > 1
   );
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
      signedDismissals.totalPages > 1
   );
   const [selectAll, setSelectAll] = useState<boolean>(false);
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
      Array(signedDismissals.items?.length).fill(false)
   );
   const [dismissalsRecords, setDismissalsRecords] = useState<
      IDismissalsItems[]
   >([]);
   const [showDetails, setShowDetails] = useState<boolean>(false);
   const [currentCaseId, setCurrentCaseId] = useState<string>("");
   const initialColumnMapping: IGridHeader[] = [
      { columnName: "action", label: "Action", className: "action" },
      { columnName: "county", label: "County" },
      { columnName: "caseNo", label: "CaseNo", toolTipInfo: "The unique number or code associated with your case, as assigned by the court." },
      { columnName: "documents", label: "AllPDFs" },
      { columnName: "propertyVsTenants", label: "PropertyName Vs. Tenants" },
      //  { columnName: "tenantOne", label: "TenantOne" },
      //  { columnName: "tenantTwo", label: "TenantTwo" },
      //  { columnName: "tenantThree", label: "TenantThree" },
      //  { columnName: "tenantFour", label: "TenantFour" },
      //  { columnName: "tenantFive", label: "TenantFive" },
      { columnName: "address", label: "TenantAddressCombined" },
      { columnName: "propertyName", label: "PropertyName" },
      { columnName: "filed", label: "DismissalFiledDate", toolTipInfo: "The date the dismissal filing was accepted by the court." },
      { columnName: "signedBy", label: "DismissalAffiantSignature", toolTipInfo: "The name that was used to sign the Dismissal."},
      { columnName: "evictionAffiantSignature", label: "EvictionAffiantSignature", toolTipInfo: "The name that was used to sign the Eviction case document(s)." },
      {columnName:"reason",label:"DismissalReason"},
      { columnName: "evictionAutomation", label: "EvictionAutomation" },
      //     ...(userRole.includes(UserRole.C2CAdmin)
      //     ? [{
      //       columnName: "companyName",
      //       label: "CompanyName"  
      //     }]
      //     : []
      //   ),
   ];
   const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(
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
      if (signedDismissals.totalCount === 1) {
         if (isMounted.current) {
            setSelectedUnSignedDismissalsId([]);
            getAllDismissals(1, 100, true, signedDismissals.searchParam);
            isMounted.current = false;
         };
      };

   }, []);

   // useEffect to update pagination and grid data when 'rows' or 'numberOfItemsPerPage' changes
   useEffect(() => {
      setSelectedUnSignedDismissalsId([]);
      const dismissalsRecords = signedDismissals.items.map((item: any) => {
         return {
            isChecked: false, // Add the new property
            ...item, // Spread existing properties
         };
      });
      setDismissalsRecords(dismissalsRecords);
      // Enable/disable pagination buttons based on the number of total pages
      setCanPaginateBack(signedDismissals.currentPage > 1);
      setCanPaginateFront(signedDismissals.totalPages > 1);
      setSelectedRows(Array(signedDismissals.items?.length).fill(false));
   }, [signedDismissals]);

   // Event handler for the 'Back' button
   const handleBackButton = () => {
      if (
         signedDismissals.currentPage > 1 &&
         signedDismissals.currentPage <= signedDismissals.totalPages
      ) {
         const updatedCurrentPage = signedDismissals.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(signedDismissals.currentPage > 1);
         // back button get dismissals
         getAllDismissals(
            updatedCurrentPage,
            signedDismissals.pageSize,
            false
         );
      }
   };

   // // Event handler for the 'Next' button
   const handleFrontButton = () => {
      if (signedDismissals.currentPage < signedDismissals.totalPages) {
         const updatedCurrentPage = signedDismissals.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get dismissals
         getAllDismissals(
            updatedCurrentPage,
            signedDismissals.pageSize,
            true
         );
      }
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
      const renderers: Record<string, () => JSX.Element> = {
         action: () => renderActionsCell(data.id ?? ""),
         caseNo: () => renderHighlightedCell(cellValue),
         // documents: () => {
         //   const linkText = `Dismissal.{${data.id}}.PDF`;
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

         documents: () =>renderPDFsCell(cellValue,data.id??""),
            // cellValue ? (
            //    <h2 onClick={() => {
            //       openPdf(cellValue)
            //    }} className="underline text-[#2472db]" style={{ cursor: 'pointer' }}>
            //       Dismissal.pdf
            //    </h2>
            // ) : (
            //    <></>
            // ),
         propertyName: () => renderHighlightedCell(cellValue),
         propertyVsTenants: () => renderPropertyVsTenants(data),
         county: () => renderHighlightedCell(cellValue),
         // tenantOne: () => formattedTenantFullName(data?.tenantNames[0]),
         // tenantTwo: () => formattedTenantFullName(data?.tenantNames[1]),
         // tenantThree: () => formattedTenantFullName(data?.tenantNames[2]),
         // tenantFour: () => formattedTenantFullName(data?.tenantNames[3]),
         // tenantFive: () => formattedTenantFullName(data?.tenantNames[4]),
         filed: () => formattedDateCell(data.filed),
         dismissalAffiantSignature: () => formattedCell(cellValue),
         address: () => (

            <span>
               <HighlightedText text={`${data.address ?? ''} ${data.unit ?? ''} ${data.city ?? ''} ${data.state ?? ''} ${data.zip ?? ''}`} query={signedDismissals.searchParam ?? ''} />
            </span>
         ),
         evictionAutomation: () => {
            if (data && data.crmInfo && data.crmInfo.crmName && data.crmInfo.crmName.length) {
              return <span>Yes</span>;
            } else {
              return <span>No</span>;
            }
          }                   
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
      // const columnNames = Object.keys(data);
      // const columnName = columnNames[cellIndex];
      // const propertyName =
      //   (initialColumnMapping as Record<string, keyof IDismissalsItems>)[
      //     columnName
      //   ] || (columnName as keyof IDismissalsItems);
      // const cellValue = data[propertyName];
      // if (columnName === "isChecked") {
      //   return (
      //     <GridCheckbox
      //       checked={selectedRows[rowIndex]}
      //       onChange={(checked: boolean) =>
      //         handleCheckBoxChange(rowIndex, checked)
      //       }
      //       label={""}
      //     />
      //   );
      // } else if (columnName === "dismissalFileDate") {
      //   return (
      //     <span>
      //       {cellValue !== null ? formattedDate(cellValue as string) : ""}
      //     </span>
      //   );
      // } else {
      //   return cellValue;
      // }
   };
   const [hoveredDocumentId, setHoveredDocumentId] = useState<string | null>(null);
   const renderPDFsCell = (cellValue: string | undefined,id:string) => {  
     const handleCopyClick = (url: string) => {
       navigator.clipboard.writeText(url);
       toast.success("Document URL copied to clipboard!");
     };
   
     return cellValue ? (
       <div
         className="relative flex items-center"
         onMouseEnter={() => setHoveredDocumentId(id)}
         onMouseLeave={() => setHoveredDocumentId(null)}
       >
         <h2
           onClick={() => openPdf(cellValue)}
           className="underline text-[#2472db] mr-1"
           style={{ cursor: 'pointer' }}
         >
           Dismissal.pdf
         </h2>
         {hoveredDocumentId === id  && (
           <FaCopy
             className="w-4 h-4 text-gray-500 cursor-pointer"
             onClick={() => handleCopyClick(cellValue)}
           />
         )}
       </div>
     ) : (
       <></>
     );
   };
   const renderPropertyVsTenants = (data: IDismissalsItems) => (
      <>
        <HighlightedText text={data.propertyName ?? ''} query={signedDismissals.searchParam ?? ''} />
        <strong className="font-semibold text-gray-900">
          {data.propertyName && data.tenantNames?.length ? " Vs. " : ""}
        </strong>
        <br />
        {data.tenantNames.map((tenant, index) => (
          <span key={index}>
            <HighlightedText
              text={`${tenant.firstName} ${tenant.middleName ? tenant.middleName + ' ' : ''}${tenant.lastName}`}
              query={signedDismissals.searchParam ?? ''}
            />
            {index !== data.tenantNames.length - 1 ? ',' : data.andAllOtherOccupants?.length ? ',' : ''}
            <br />
          </span>
        ))}
        <HighlightedText
          text={`${data.andAllOtherOccupants?.length ? "and " : ""}${data.andAllOtherOccupants ?? ""}`}
          query={signedDismissals.searchParam ?? ''}
        />
      </>
    );

   // const formattedDateCell = (value: any) => (
   //    <span>{value !== null ? formattedDate(value) : ""}</span>
   // );
   const formattedDateCell = (value: any) => (
      <span>{value !== null ? convertUtcToEst(value).date : ""}</span>
   //   <span>{value !== null ? formattedDate(value) : ""}</span>
   );

   // const formattedCell = (value: any) => (
   //    <HighlightedText text={value ?? ''} query={signedDismissals.searchParam ?? ''} />
   // );

   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );
   
  
   const renderHighlightedCell = (value: any) => (
      <HighlightedText text={value as string ?? ''} query={signedDismissals.searchParam ?? ''} />
   );

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
            {/* Render the Grid component with column headings and grid data */}
            {showSpinner === true ? (
               <Spinner />
            ) : (
               <>
                  <Grid
                     columnHeading={visibleColumns}
                     rows={dismissalsRecords}
                     cellRenderer={(
                        data: IDismissalsItems,
                        rowIndex: number,
                        cellIndex: number
                     ) => {
                        return handleCellRendered(cellIndex, data, rowIndex);
                     }}
                  />
                  {/* Render the Pagination component with relevant props */}
                  <Pagination
                     numberOfItemsPerPage={signedDismissals.pageSize}
                     currentPage={signedDismissals.currentPage}
                     totalPages={signedDismissals.totalPages}
                     totalRecords={signedDismissals.totalCount}
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
export default SignedDismissalsGrid;
