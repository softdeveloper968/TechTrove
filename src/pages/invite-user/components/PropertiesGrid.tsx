import React, { useState, useEffect } from "react";
import { useUserContext } from "../UserContext";
import { IGridHeader } from "interfaces/grid-interface";
import { IProperties, IPropertyItems, PropertyFormModeType } from "interfaces/user.interface";
import Button from "components/common/button/Button";
import { FaEdit, FaPlus, FaTrash, FaUserEdit } from "react-icons/fa";
import Spinner from "components/common/spinner/Spinner";
import Pagination from "components/common/pagination/Pagination";
import Grid from "components/common/grid/GridWithToolTip";
import ConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import AddNewPropertyModal from "./UserActions/AddNewPropertyModal";
import UserService from "services/all-users.service"
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import { useAuth } from "context/AuthContext";
import { UserRole } from "utils/enum";
import { toCssClassName } from "utils/helper";

type PropertiesGridProps = {};


const PropertiesGrid = (props: PropertiesGridProps) => {
   const {
      showSpinner,
      properties,
      setProperties,
      getProperties
   } = useUserContext();

   const [propertyList] = useState<IProperties>(properties);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(propertyList.currentPage > 1);
   const [canPaginateFront] = useState<boolean>(propertyList.totalPages > 1);

   const [formMode, setFormMode] = useState<PropertyFormModeType>('create');
   const [selectedProperty, setSelectedProperty] = useState<IPropertyItems | null>(null);

   const [openAddNewPropertyModal, setOpenAddNewPropertyModal] = useState<boolean>(false);
   const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
   const {userRole}=useAuth();
   
const initialColumnMapping: IGridHeader[] = [
   ...userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin) || userRole.includes(UserRole.Admin)?[{ columnName: "actions", label: "Action", className: "action" },]:[] ,   
   { columnName: "propertyName", label: "PropertyName" },
   { columnName: "propertyCode", label: "PropertyCode" },
   { columnName: "propertyAddress", label: "PropertyAddress" },
   { columnName: "propertyCity", label: "PropertyCity" },
   { columnName: "propertyState", label: "PropertyState" },
   { columnName: "propertyZip", label: "PropertyZip" },
   { columnName: "propertyPhone", label: "PropertyPhone" },
   { columnName: "propertyEmail", label: "PropertyEmail", className: "gridHeaderEmail" },
   { columnName: "numberOfUnits", label: "NumberOfUnits" },
   ...userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)?[{ columnName: "companyName", label: "Company" }]:[]   
];
const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   useEffect(() => {
      getProperties(1, 100, '');
   }, []);


   const deleteProperty = async() => {
      const response = await UserService.deleteCompanyProperty(selectedProperty?.id??"");

      // Check if the deletion was successful
      if (response.status === HttpStatusCode.Ok) {
         toast.success(response.data.message, {
            position: toast.POSITION.TOP_RIGHT,
         });
         setDeleteConfirmation(false);
         getProperties(1, 100,"");
      }
      else {
         toast.error(response.statusText, {
            position: toast.POSITION.TOP_RIGHT,
         });
      }      
   };

   const handleSorting = (columnName: string, order: string) => {
      const sortedRecords = [...propertyList.items];

      const compare = (a: any, b: any) => {
         const aValue = (columnName !== "name" ? a[columnName] : a["propertyName"]) || "";
         const bValue = (columnName !== "name" ? b[columnName] : b["propertyName"]) || "";

         if (order === 'asc') {
            return aValue.localeCompare(bValue);
         } else {
            return bValue.localeCompare(aValue);
         }
      };

      sortedRecords.sort(compare);
      setProperties((prev) => ({ ...prev, items: sortedRecords }));
   };

   const handleFrontButton = () => {
      if (propertyList.currentPage < propertyList.totalPages) {
         const updatedCurrentPage = propertyList.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getProperties(
            updatedCurrentPage,
            propertyList.pageSize
         );
      }
   };

   const handleBackButton = () => {
      if (
         propertyList.currentPage > 1 &&
         propertyList.currentPage <= propertyList.totalPages
      ) {
         const updatedCurrentPage = propertyList.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(propertyList.currentPage > 1);
         // back button get late notices
         getProperties(
            updatedCurrentPage,
            propertyList.pageSize
         );
      }
   };

   const handleCellRendered = (cellIndex: number, data: IPropertyItems, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         actions: () => (
            <>
               <div className="flex items-center gap-2">
                  <FaEdit
                     className="h-4 w-4 cursor-pointer fill-[#2472db]"
                     onClick={() => { 
                        setSelectedProperty(data);
								setFormMode('edit');
								setOpenAddNewPropertyModal(true);                        
                     }}
                  />
                  <FaTrash
                     className="h-4 w-4 cursor-pointer fill-[#E61818]"
                     onClick={() => { 
                        setSelectedProperty(data);
                        setDeleteConfirmation(true);
                     }}
                  ></FaTrash>
               </div></>
         ),
         propertyName:()=> <span><HighlightedText text={cellValue} query={properties.searchParam ?? ""} /></span>,
         propertyAddress:()=> <span><HighlightedText text={cellValue} query={properties.searchParam ?? ""} /></span>,
         propertyCity:()=> <span><HighlightedText text={cellValue} query={properties.searchParam ?? ""} /></span>,
         propertyState:()=> <span><HighlightedText text={cellValue} query={properties.searchParam ?? ""} /></span>,
         propertyZip:()=> <span><HighlightedText text={cellValue} query={properties.searchParam ?? ""} /></span>,
         propertyCode:()=> <span><HighlightedText text={cellValue} query={properties.searchParam ?? ""} /></span>,
         propertyEmail:()=> <span><HighlightedText text={cellValue} query={properties.searchParam ?? ""} /></span>,
         companyName:()=> <span><HighlightedText text={cellValue} query={properties.searchParam ?? ""} /></span>,
      };

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

   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );

   return (
      <>
         <div className="mt-2.5">
            <div className="flex items-center justify-between mb-2">
               <div className="flex items-center w-auto filterSec">
                  {/* <DropdownPresentation
                     heading=""
                     selectedOption={selectedCounty}
                     handleSelect={handleCountyChange}
                     options={countyOptions}
                     placeholder="Filter by county"
                  />
                  <ClearFilters
                     type="button"
                     isRounded={false}
                     title="Clear Filters"
                     handleClick={clearSearchFilters}
                     icon={<FaTimes />}
                  /> */}
               </div>
               {(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)|| userRole.includes(UserRole.Admin)) && <div>
                  <Button
                     title={"Add New Property"}
                     classes={
                        "bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 py-1.5 font-medium text-[11px] text-white rounded-md shadow-lg inline-flex items-center font-semibold"
                     }
                     type={"button"}
                     isRounded={false}
                     icon={<FaPlus className="fa-solid fa-plus  mr-1 text-xs" />}
                     key={0}
                     handleClick={() => { 
                        setFormMode('create');
                        setSelectedProperty(null);
                        setOpenAddNewPropertyModal(true);
                     }}
                  ></Button>
               </div>}
            </div>
            <div className="relative -mr-0.5">
               {showSpinner && <Spinner />}
               <Grid
                  columnHeading={visibleColumns}
                  rows={properties.items}
                  handleSorting={handleSorting}
                  cellRenderer={(data: IPropertyItems, rowIndex: number, cellIndex: number) => {
                     return handleCellRendered(cellIndex, data, rowIndex);
                  }}
               />
               {/* Render the Pagination component with relevant props */}
               <Pagination
                  numberOfItemsPerPage={properties.pageSize}
                  currentPage={properties.currentPage}
                  totalPages={properties.totalPages}
                  totalRecords={properties.totalCount}
                  handleFrontButton={handleFrontButton}
                  handleBackButton={handleBackButton}
                  canPaginateBack={canPaginateBack}
                  canPaginateFront={canPaginateFront}
               />
            </div>
         </div>

         {openAddNewPropertyModal && (
            <AddNewPropertyModal
               open={openAddNewPropertyModal}
               setOpen={(open: boolean) => setOpenAddNewPropertyModal(open)}
               mode={formMode}
               selectedProperty={selectedProperty}
               setSelectedProperty={(property: IPropertyItems | null) => setSelectedProperty(null)}
            />
         )}

         {deleteConfirmation && (
            <ConfirmationBox
               heading={"Confirmation"}
               message={`Are you sure you want to delete this property?`}
               showConfirmation={deleteConfirmation}
               confirmButtonTitle="OK"
               closePopup={() => setDeleteConfirmation(false)}
               handleSubmit={deleteProperty}
            />
         )}
      </>
   )
};

export default PropertiesGrid;