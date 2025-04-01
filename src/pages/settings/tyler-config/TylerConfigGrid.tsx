import React, { ChangeEvent, useEffect, useState } from "react";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { Menu } from "@headlessui/react";
import { FaPlus, FaTimes, FaTrash, FaUserEdit, FaEllipsisH, FaRegClone } from "react-icons/fa";
import { useTylerConfigContext } from "./TylerConfigContext";
import { ConfigStatusResource, ISelectOptions, ITylerConfig, ITylerConfigItems, TylerFormMode } from "interfaces/tyler.interface";
import { IGridHeader } from "interfaces/grid-interface";
import Button from "components/common/button/Button";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import ConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import DropdownPresentation from "components/common/dropdown/DropDown";
import ClearFilters from "components/common/button/ClearFilters";
import ToggleSwitch from "components/common/toggle/ToggleSwitch";
import TylerConfigModal from "./TylerConfigModal";
import TylerService from "services/tyler.service";
import { toCssClassName } from "utils/helper";

type TylerConfigGridProps = {};

const initialSelectOption: ISelectOptions = { id: '', value: '' };

const initialColumnMapping: IGridHeader[] = [
   { columnName: "actions", label: "Action", className: "action" },
   { columnName: "isActive", label: "IsActive" },
   { columnName: "locationName", label: "Location/Court", isSort: true },
   { columnName: "countyName", label: "County" },
   { columnName: "state", label: "State" },
   { columnName: "courtType", label: "CourtType", isSort: true },
   { columnName: "caseTypeName", label: "CaseType" },
   { columnName: "filingType", label: "FilingType", isSort: true },
   { columnName: "filingCodeName", label: "FilingCode" },
   { columnName: "filingDescription", label: "FilingDescription" },
   { columnName: "preliminaryCopyEmail", label: "PreliminaryCopyEmail", className: "gridHeaderEmail" }
];

const TylerConfigGrid = (props: TylerConfigGridProps) => {
   const {
      showSpinner,
      tylerConfigs,
      setTylerConfigs,
      counties,
      getCounties,
      getTylerConfigs,
      getFilingTypeList,
      updateConfigStatus
   } = useTylerConfigContext();
   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   const [tylerConfigList, setTylerConfigList] = useState<ITylerConfig>(tylerConfigs);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(tylerConfigList.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(tylerConfigList.totalPages > 1);
   const [confirmation, setConfirmation] = useState<boolean>(false);
   const [openTylerModal, setOpenTylerModal] = useState<boolean>(false);
   const [formMode, setFormMode] = useState<TylerFormMode>('create');
   const [selectedConfig, setSelectedConfig] = useState<ITylerConfigItems | null>(null);
   const [selectedCounty, setSelectedCounty] = useState<ISelectOptions>(initialSelectOption);
   const [countyOptions, setCountyOptions] = useState<ISelectOptions[]>([]);
   const [statusConfirmation, setstatusConfirmation] = useState<boolean>(false);
   const [pendingConfigChange, setPendingConfigChange] = useState<{ id: string | undefined, isActive: boolean } | null>(null);
   useEffect(() => {
      getTylerConfigs(1, 100, '', '');
      getFilingTypeList();
      getCounties();

   }, []);

   useEffect(() => {
      const countyOptions: ISelectOptions[] = counties.map(item => ({
         id: item.countyName,
         value: item.countyName
      }));

      setCountyOptions(countyOptions);

   }, [counties]);

   const deleteTylerConfig = async () => {
      if (selectedConfig && selectedConfig.id) {
         const response = await TylerService.deleteTylerConfig(selectedConfig.id);
         if (response.status === HttpStatusCode.Ok) {
            getTylerConfigs(1, 100, '', selectedCounty.value);
            setSelectedConfig(null);
            toast.success(response.data.message);
         } else {
            toast.error(response.data.message);
         }
         setConfirmation(false);
      }
   };

   const handleCountyChange = (event: ChangeEvent<HTMLSelectElement>) => {
      const county = event.target.value as string;
      setSelectedCounty({ id: county, value: county });
      getTylerConfigs(1, 100, '', county);
   };

   const clearSearchFilters = () => {
      getTylerConfigs(1, 100, '', '');
      setSelectedCounty(initialSelectOption);
   };
   const handleDisableChange = async (
      tylerConfigId: string | undefined,
      isActive: boolean
   ) => {
      const payload: ConfigStatusResource = { id: tylerConfigId ?? "", isActive };
      updateConfigStatus(payload);
      setTylerConfigs(prev => ({
         ...prev,
         items: prev.items.map(item =>
            item.id === payload.id ? { ...item, isActive } : item
         )
      }));
      //getTylerConfigs(1, 100, '', selectedCounty.value);
      setstatusConfirmation(false);
      setPendingConfigChange(null);
   };
   const handleSorting = (columnName: string, order: string) => {
      const sortedRecords = [...tylerConfigs.items];
   
      const compare = (a: any, b: any) => {
         const aValue = (columnName !== "name" ? a[columnName] : a["locationName"]) || "";
         const bValue = (columnName !== "name" ? b[columnName] : b["locationName"]) || "";
   
         if (order === 'asc') {
            return aValue.localeCompare(bValue);
         } else {
            return bValue.localeCompare(aValue);
         }
      };
   
      sortedRecords.sort(compare);
      setTylerConfigs((prev) => ({ ...prev, items: sortedRecords }));
   };

   const handleFrontButton = () => {
      if (tylerConfigList.currentPage < tylerConfigList.totalPages) {
         const updatedCurrentPage = tylerConfigList.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getTylerConfigs(
            updatedCurrentPage,
            tylerConfigList.pageSize
         );
      }
   };

   const handleBackButton = () => {
      if (
         tylerConfigList.currentPage > 1 &&
         tylerConfigList.currentPage <= tylerConfigList.totalPages
      ) {
         const updatedCurrentPage = tylerConfigList.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(tylerConfigList.currentPage > 1);
         // back button get late notices
         getTylerConfigs(
            updatedCurrentPage,
            tylerConfigList.pageSize
         );
      }
   };
   const renderDisabledCell = (cellValue: any, data: ITylerConfigItems, rowIndex: number) => (
      <ToggleSwitch
         value={cellValue}
         label={""}
         handleChange={(event: ChangeEvent<HTMLInputElement>) => {
            setstatusConfirmation(true);
            setPendingConfigChange({ id: data.id, isActive: event.target.checked });
         }}
      ></ToggleSwitch>
   );
   const handleCellRendered = (cellIndex: number, data: ITylerConfigItems, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         feeCalcOnly: () => (<>{data.feeCalcOnly ? "Yes" : "No"}</>),
         actions: () => (
            <>
               <div className="flex items-center gap-2">
                  <FaUserEdit
                     className="h-4 w-4 cursor-pointer fill-[#2472db]"
                     title="Edit"
                     onClick={() => {
                        setSelectedConfig(data);
                        setFormMode('edit');
                        setOpenTylerModal(true);
                     }}
                  />
                  <Menu as="div">
                     <Menu.Button>
                        <FaEllipsisH
                           className="h-4 w-4 cursor-pointer fill-gray-500"
                        />
                     </Menu.Button>
                     <Menu.Items unmount>
                        <Menu.Item as="button" className="my-2">
                           <FaTrash
                              className="h-4 w-4 cursor-pointer fill-[#E61818]"
                              title="Delete"
                              onClick={() => {
                                 setSelectedConfig(data);
                                 setConfirmation(true);
                              }}
                           />
                        </Menu.Item>
                        <Menu.Item as="button" className="my-2">
                           <FaRegClone
                              className="h-4 w-4 cursor-pointer fill-blue-600"
                              title="Clone"
                              onClick={() => {
                                 setSelectedConfig(data);
                                 setFormMode('clone');
                                 setOpenTylerModal(true);
                              }}
                           />
                        </Menu.Item>
                     </Menu.Items>
                  </Menu>
                  
               </div></>
         ),
         isActive: () => renderDisabledCell(cellValue, data, rowIndex),
      };

      const renderer = renderers[propertyName] || (() => formattedCell(cellValue));

      if (visibleColumns.find(x => x.label === columnName)) {

         return (
            <td
               key={propertyName}
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
                  <DropdownPresentation
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
                  />
               </div>
               <div>
                  <Button
                     title={"Add New Tyler Config"}
                     classes={
                        "bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 py-1.5 font-medium text-[11px] text-white rounded-md shadow-lg inline-flex items-center font-semibold"
                     }
                     type={"button"}
                     isRounded={false}
                     icon={<FaPlus className="fa-solid fa-plus  mr-1 text-xs" />}
                     key={0}
                     handleClick={() => {
                        setFormMode('create');
                        setOpenTylerModal(true);
                        setSelectedConfig(null);
                     }}
                  ></Button>
               </div>
            </div>
            <div className="relative -mr-0.5">
               {showSpinner && <Spinner />}
               <Grid
                  columnHeading={visibleColumns}
                  rows={tylerConfigs.items}
                  handleSorting={handleSorting}
                  cellRenderer={(data: ITylerConfigItems, rowIndex: number, cellIndex: number) => {
                     return handleCellRendered(cellIndex, data, rowIndex);
                  }}
               />
               {/* Render the Pagination component with relevant props */}
               <Pagination
                  numberOfItemsPerPage={tylerConfigList.pageSize}
                  currentPage={tylerConfigList.currentPage}
                  totalPages={tylerConfigList.totalPages}
                  totalRecords={tylerConfigs.totalCount}
                  handleFrontButton={handleFrontButton}
                  handleBackButton={handleBackButton}
                  canPaginateBack={canPaginateBack}
                  canPaginateFront={canPaginateFront}
               />
            </div>
         </div>
         {openTylerModal &&
            <TylerConfigModal
               open={openTylerModal}
               setOpen={(open) => setOpenTylerModal(open)}
               mode={formMode}
               selectedConfig={selectedConfig}
               setSelectedConfig={() => setSelectedConfig(null)}
               selectedCounty={selectedCounty.value}
            />
         }
         {confirmation &&
            <ConfirmationBox
               heading={"Confirmation"}
               message={`Are you sure you want to delete this Tyler Config?`}
               showConfirmation={confirmation}
               confirmButtonTitle="OK"
               closePopup={() => setConfirmation(false)}
               handleSubmit={deleteTylerConfig}
            />
         }
         {statusConfirmation && <ConfirmationBox
            heading="Confirmation"
            message={`Are you sure you want to ${pendingConfigChange?.isActive ? "activate" : "deactivate"} this configuration?`}
            showConfirmation={statusConfirmation}
            confirmButtonTitle="OK"
            closePopup={() => {
               setstatusConfirmation(false);
               setPendingConfigChange(null);
            }}
            handleSubmit={() => {
               if (pendingConfigChange) {
                  handleDisableChange(pendingConfigChange.id, pendingConfigChange.isActive);
               }
            }}
         />}
      </>
   );
};

export default TylerConfigGrid;