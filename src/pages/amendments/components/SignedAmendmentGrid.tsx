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
import { convertUtcToEst, formattedDate, toCssClassName } from "utils/helper";
import HelperViewPdfService from "services/helperViewPdfService";
import { useAmendmentsContext } from "../AmendmentsContext";
import { useAuth } from "context/AuthContext";
import { IAmendmentsItems } from "interfaces/amendments.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { ITenant } from "interfaces/all-cases.interface";

// Define the props interface with a  type 'Dismissals'
type SignedDismissalsGridProps = {};

// React functional component 'DismissalsGrid' with a generic type 'IDismissals'
const SignedAmendmentGrid = (props: SignedDismissalsGridProps) => {
   //  integrated dismissals here
   // const { signedDismissals, getAllDismissals, showSpinner, unsignedDismissals } =
   //   useDissmissalsContext();
   const { userRole } = useAuth();
   const isMounted = useRef(true);
   const { signedAmendment, getAllAmendments, unsignedAmendment, showSpinner, setSelectedAmendmentsId } =
      useAmendmentsContext();
   // State variables for pagination for next and previous button
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
      signedAmendment.currentPage > 1
   );
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
      signedAmendment.totalPages > 1
   );
   const [selectAll, setSelectAll] = useState<boolean>(false);
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
      Array(signedAmendment.items?.length).fill(false)
   );
   const [amendmentRecords, setAmendmentRecords] = useState<
      IAmendmentsItems[]
   >([]);
   const [showDetails, setShowDetails] = useState<boolean>(false);
   const [currentCaseId, setCurrentCaseId] = useState<string>("");
   const initialColumnMapping: IGridHeader[] = [
      { columnName: "action", label: "Action", className: "action" },
      { columnName: "county", label: "County" },
      { columnName:"caseNo",label:"CaseNo",toolTipInfo:"The unique number or code associated with your case, as assigned by the court."},
      { columnName:"documents",label:"AllPDFs"},
      { columnName:"propertyVsTenants",label:"PropertyName Vs. Tenants" },
      // { columnName: "tenantOne", label: "TenantOne" },
      // { columnName: "tenantTwo", label: "TenantTwo" },
      // { columnName: "tenantThree", label: "TenantThree" },
      // { columnName: "tenantFour", label: "TenantFour" },
      // { columnName: "tenantFive", label: "TenantFive" },
      { columnName: "address", label: "TenantAddressCombined" },
      { columnName: "propertyName", label: "PropertyName" },
      { columnName: "amendedDate", label: "AmendmentFiledDate", toolTipInfo: "The date the amendment was signed & submitted to the court." },
      { columnName: "signedBy", label: "AmendmentAffiantSignature", toolTipInfo: "The name that was used to sign the Amended case document(s)." },
      { columnName: "evictionAffiantSignature", label: "EvictionAffiantSignature", toolTipInfo: "The name that was used to sign the Eviction case document(s)." },
      // ...(userRole.includes(UserRole.C2CAdmin)
      //    ? [{
      //       columnName: "companyName",
      //       label: "CompanyName"
      //    }]
      //    : []
      // )
   ];
   const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(
      initialColumnMapping
   );
   // useEffect(() => {
   //    if (userRole.includes(UserRole.C2CAdmin) && !visibleColumns.some(x => x.columnName === "companyName")) {
   //       setVisibleColumns((prev) => (
   //          [
   //             ...prev,
   //             {
   //                columnName: "companyName",
   //                label: "CompanyName"
   //             }
   //          ]
   //       )
   //       )
   //    }
   // }, [userRole]);

   useEffect(() => {
         if (isMounted.current) {
            setSelectedAmendmentsId([]);
            getAllAmendments(1, 100, true, '');
            isMounted.current = false;
         };

   }, []);

   // useEffect to update pagination and grid data when 'rows' or 'numberOfItemsPerPage' changes
   useEffect(() => {

      const amendmentRecords = signedAmendment.items.map((item: any) => {
         return {
            isChecked: false, // Add the new property
            ...item, // Spread existing properties
         };
      });
      setAmendmentRecords(amendmentRecords);
      // Enable/disable pagination buttons based on the number of total pages
      setCanPaginateBack(signedAmendment.currentPage > 1);
      setCanPaginateFront(signedAmendment.totalPages > 1);
      setSelectedRows(Array(signedAmendment.items?.length).fill(false));
   }, [signedAmendment]);

   // Event handler for the 'Back' button
   const handleBackButton = () => {
      if (
         signedAmendment.currentPage > 1 &&
         signedAmendment.currentPage <= signedAmendment.totalPages
      ) {
         const updatedCurrentPage = signedAmendment.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(signedAmendment.currentPage > 1);
         // back button get dismissals
         getAllAmendments(
            updatedCurrentPage,
            signedAmendment.pageSize,
            false
         );
      }
   };

   // // Event handler for the 'Next' button
   const handleFrontButton = () => {
      if (signedAmendment.currentPage < signedAmendment.totalPages) {
         const updatedCurrentPage = signedAmendment.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get dismissals
         getAllAmendments(
            updatedCurrentPage,
            signedAmendment.pageSize,
            true
         );
      }
   };
   const openPdf = async (url: string) => {

      HelperViewPdfService.GetPdfView(url);
   }

   const handleCheckBoxChange = (index: number, checked: boolean) => {
      const updatedSelectedRows = [...selectedRows];
      updatedSelectedRows[index] = checked;
      setSelectedRows(updatedSelectedRows);
      const selectedIds = (signedAmendment.items || [])
         .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      setSelectedAmendmentsId(selectedIds);
   };

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
      // const propertyName = (initialColumnMapping as any)[columnName];
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         action: () => renderActionsCell(data.id ?? ""),
         documents: () => formattedDocumentCell(cellValue,data.id??"", data?.versionNumber),
         propertyName: () => renderHighlightedCell(cellValue),
         county: () => renderHighlightedCell(cellValue),
         caseNo: () => renderHighlightedCell(cellValue),
         propertyVsTenants: () => renderPropertyVsTenants(data),
         // tenantOne: () => formattedTenantFullName(data && data.tenantNames ? data?.tenantNames?.[0] : null),
         // tenantTwo: () => formattedTenantFullName(data && data.tenantNames ? data?.tenantNames?.[1] : null),
         // tenantThree: () => formattedTenantFullName(data && data.tenantNames ? data?.tenantNames?.[2] : null),
         // tenantFour: () => formattedTenantFullName(data && data.tenantNames ? data?.tenantNames?.[3] : null),
         // tenantFive: () => formattedTenantFullName(data && data.tenantNames ? data?.tenantNames?.[4] : null),
         address: () => (
            <span>
               <HighlightedText text={`${data.address ?? ''} ${data.unit ?? ''} ${data.city ?? ''} ${data.state ?? ''} ${data.zip ?? ''}`} query={signedAmendment.searchParam ?? ''} />
            </span>
         ),
         amendedDate: () => formattedDateCell(data.amendedDate),
         writFileDate: () => formattedDateCell(data.writFileDate),
         signedBy: () => formattedCell(cellValue),
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

   // const renderPropertyVsTenants = (data: IAmendmentsItems) => (
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
        <HighlightedText text={data.propertyName ?? ''} query={signedAmendment.searchParam ?? ''} />
        <strong className="font-semibold text-gray-900">
          {data.propertyName && data.tenantNames?.length ? " Vs. " : ""}
        </strong>
        <br />
        {data.tenantNames.map((tenant, index) => (
          <span key={index}>
            <HighlightedText
              text={`${tenant.firstName} ${tenant.middleName ? tenant.middleName + ' ' : ''}${tenant.lastName}`}
              query={signedAmendment.searchParam ?? ''}
            />
            {index !== data.tenantNames.length - 1 ? ',' : data.andAllOtherOccupants?.length ? ',' : ''}
            <br />
          </span>
        ))}
        <HighlightedText
          text={`${data.andAllOtherOccupants?.length ? "and " : ""}${data.andAllOtherOccupants ?? ""}`}
          query={signedAmendment.searchParam ?? ''}
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
   //    <span><HighlightedText text={value ?? ''} query={signedAmendment.searchParam ?? ''} /></span>
   // );

   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );
   
  
   const renderHighlightedCell = (value: any) => (
      <HighlightedText text={value as string ?? ''} query={signedAmendment.searchParam ?? ''} />
   );

   const [hoveredDocumentId, setHoveredDocumentId] = useState<string | null>(null);

   const formattedDocumentCell = (cellValue: any,id:string, versionNumber: number) => {
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
            {versionNumber == 0 ? "Amendment.pdf" : `Amendment_${versionNumber}.pdf`}
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
   }

   const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
      <HighlightedText text={`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`} query={signedAmendment.searchParam ?? ''} />
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

   return (
      <div className="mt-3">
         <div className="relative -mr-0.5">
            {showSpinner === true ? (
               <Spinner />
            ) : (
               <>
                  <Grid
                     columnHeading={visibleColumns}
                     rows={amendmentRecords}
                     cellRenderer={(
                        data: IAmendmentsItems,
                        rowIndex: number,
                        cellIndex: number
                     ) => {
                        return handleCellRendered(cellIndex, data, rowIndex);
                     }}
                  />
                  {/* Render the Pagination component with relevant props */}
                  <Pagination
                     numberOfItemsPerPage={signedAmendment.pageSize}
                     currentPage={signedAmendment.currentPage}
                     totalPages={signedAmendment.totalPages}
                     totalRecords={signedAmendment.totalCount}
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
export default SignedAmendmentGrid;
