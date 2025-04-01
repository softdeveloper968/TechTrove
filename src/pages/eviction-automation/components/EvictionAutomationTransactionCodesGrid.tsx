import React, { ChangeEvent, useRef } from "react";
import { useEffect, useState } from "react";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaPlus, FaTimes, FaTrash } from "react-icons/fa";

import ConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import Button from "components/common/button/Button";
import Pagination from "components/common/pagination/Pagination";

import { ICountyFormValues, ICountyItems } from "interfaces/county.interface";
import { IGridHeader } from "interfaces/grid-interface";
import CountyService from "services/county.service";
import { useAuth } from "context/AuthContext";
import { useEvictionAutomationContext } from "../EvictionAutomationContext";
import { ICRMTransactionCode, ICRMTransactionCodesItem, IEvictionAutomationPropexoGridItem, IPropexoTransactionCode, ITransactionCodesItem } from "interfaces/eviction-automation.interface";
import EvictionAutomationService from "services/eviction-automation.service";
import TransactionCodesFormPopup from "./EvictionAutomationActions/TransactionCodes_EditForm";
import DropdownPresentation from "components/common/dropdown/DropDown";
import { ISelectOptions } from "interfaces/all-cases.interface";
import ClearFilters from "components/common/button/ClearFilters";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import { string } from "yup";
import CRMImporterTransactionCodesFormPopup from "./EvictionAutomationActions/CRMImporterTransactionCodes_EditForm";


const EvictionAutomationTransactionCodesGrid = () => {
   const { userRole } = useAuth();
   const isMounted = useRef(true);
   const initialSelectOption: ISelectOptions = { id: '', value: '' };

   const initialColumnMapping: IGridHeader[] = [
      { columnName: "action", label: "Action", className: "action" },
      { columnName: "companyName", label: "Company Name" },
      { columnName: "ownerName", label: "Owner Name" },
      { columnName: "propertyName", label: "Property Name" },
      { columnName: "transactionCodes", label: "Transaction Codes" },
   ];
   const {
      showSpinner,
      crmTransactionCodes,
      getCRMTransactionCodes,
      setCRMTransactionCodes,
      setShowSpinner,
      //getAllProperties,
      getAllCompanies,
      allCompanies,
      //allProperties,
      getAllPMS,
      allPMS,
   } = useEvictionAutomationContext();
   const [showTransactionCodeForm, setShowTransactionCodeForm] = useState<Boolean>(false);
   // delete confirmation
   const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
   const [isEditMode, setIsEditMode] = useState<boolean>(false);
   const [isshowButton, setIsshowButton] = useState<boolean>(false);
   const [companyOptions, setCompanyOptions] = useState<ISelectOptions[]>([]);
   const [selectedCompany, setSelectedCompany] = useState<ISelectOptions>(initialSelectOption);

   const [propertyOptions, setPropertyOptions] = useState<ISelectOptions[]>([]);
   const [selectedProperty, setSelectedProperty] = useState<ISelectOptions>(initialSelectOption);
   const [selectedIntegration, setSelectedIntegration] = useState<ISelectOptions>(initialSelectOption);
   const [integrationOptions, setIntegrationOptions] = useState<ISelectOptions[]>([]);
   const [propertyList, setPropertyList] = useState<ISelectOptions[]>([]);
   const [ownerList, setOwnerList] = useState<ISelectOptions[]>([]);
   const [selectedOwner, setSelectedOwner] = useState<ISelectOptions>(initialSelectOption);
   const [propertyListDetails, setPropertyListDetails] = useState<IEvictionAutomationPropexoGridItem[]>([]);

   // State variables for pagination for next and previous button
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
      crmTransactionCodes.currentPage > 1
   );
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
      crmTransactionCodes.totalPages > 1
   );
   // State variable to store the selected row data
   const [selectedRowData, setSelectedRowData] = useState<ICRMTransactionCodesItem>({
      id: "",
      companyName: "",
      clientId: "",
      integrationId: "",
      propertyId: "",
      propertyName: "",
      transactionCodes: "",
      ownerId: "",
      ownerName: "",
      crmTransactionCodes: [
         {
            id: "",
            transactionCodeId: "",
            transactionCodeName: "",
            transactionCodeDescription: "",
            isRent: false,
            CompanyPropertyTransactionCodeId: "",
            isSubsidy: false,
            transactionCodeShortDescription: ""
         }
      ],
   });
   //visible columns
   const [visibleColumns] = useState<IGridHeader[]>(
      initialColumnMapping
   );

   useEffect(() => {
      if (isMounted.current) {
         getAllCompanies();
         //getAllProperties();
         getAllPMS();
         getCRMTransactionCodes(1, 100, '','','','','');
         isMounted.current = false;
      }
   }, []);

   useEffect(() => {
      const companyOptions: ISelectOptions[] = allCompanies.map(item => ({
         id: item.id,
         value: item.companyName
      }));

      setCompanyOptions(companyOptions);

   }, [allCompanies]);

   // useEffect(() => {
   //    const propertyOptions: ISelectOptions[] = allProperties.map(item => ({
   //       id: item.propertyId ?? "",
   //       value: `${item.pmsName}-${item.propertyName}`
   //    }));
   //    setPropertyOptions(propertyOptions);

   // }, [allProperties]);

   useEffect(() => {
      const integrationOptiions: ISelectOptions[] = allPMS.map(item => ({
         id: item.id ?? "",
         value: `${item.pmsName}`
      }));
      setIntegrationOptions(integrationOptiions);
   }, [allPMS]);

   useEffect(() => {
      
      if (selectedCompany.id != "" && selectedProperty.id != "" &&selectedIntegration.id != ""&&selectedOwner.id != "") {
         if (crmTransactionCodes.items.length == 0) {
            
            setIsshowButton(true);
            // Update selectedRowData with new values
            setSelectedRowData((prevData) => ({
               ...prevData,
               clientId: String(selectedCompany.id), // Ensure clientId is a string
               companyName: selectedCompany.value,
               integrationId: String(selectedIntegration.id),
               propertyId: String(selectedProperty.id), // Ensure propertyId is also a string
               ownerId:String(selectedOwner.id),
            }));
         }
         else {
            setIsshowButton(false);
         }
      }

   }, [crmTransactionCodes, selectedProperty.id, selectedCompany.id,selectedOwner.id,selectedIntegration.id]);

   // on press ok from delete confirmation
   const handleDeleteTransactionCode = async () => {
      try {
         // Check if countyId is available
         if (!selectedRowData.id) {
            // If not available, exit early
            return;
         }

         // Display spinner while processing
         setShowSpinner(true);

         // Attempt to delete the county
         const response = await EvictionAutomationService.removeCRMTransactionCodes(
            selectedRowData.id
         );

         // Check if the deletion was successful
         if (response.status === HttpStatusCode.Ok) {
            // Show success message
            toast.success("Record removed successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });

            // Close the confirmation pop-up and refresh the list
            setDeleteConfirmation(false);
            getCRMTransactionCodes(crmTransactionCodes.currentPage, crmTransactionCodes.pageSize);
         }
      } catch (error) {
         // Handle errors if needed
         console.error("Error deleting transactionCodes:", error);
      } finally {
         // Hide the spinner regardless of the outcome
         setShowSpinner(false);
         clearSearchFilters();
      }
   };
   // on press ok from edit pop up
   const handleEditTransactionCode = async (formValues: ICRMTransactionCodesItem) => {
      try {
         // Display spinner while processing
         setShowSpinner(true);

         const payload: ICRMTransactionCodesItem = {
            id: formValues.id,
            companyName: formValues.companyName,
            clientId: formValues.clientId,
            integrationId: formValues.integrationId,
            propertyId: formValues.propertyId,
            ownerId: formValues.ownerId,
            ownerName: formValues.ownerName,
            propertyName: formValues.propertyName,
            transactionCodes: formValues.transactionCodes,
            crmTransactionCodes: formValues.crmTransactionCodes
               .map((item) => ({
                  id: item.id,
                  transactionCodeId: item.transactionCodeId,
                  transactionCodeName: item.transactionCodeName,
                  transactionCodeDescription: item.transactionCodeDescription,
                  isRent: item.isRent,
                  isSubsidy: item.isSubsidy,
                  transactionCodeShortDescription: item.transactionCodeShortDescription,
                  CompanyPropertyTransactionCodeId: item.CompanyPropertyTransactionCodeId,
               })),
         }
         // Attempt to delete the county

         const response = await EvictionAutomationService.updateCRMTransactionCode(payload);

         // Check if the deletion was successful
         if (response.status === HttpStatusCode.Ok) {
            // Show success message
            toast.success("Record updated successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });

            // Close the confirmation pop-up and refresh the list
            setShowTransactionCodeForm(false);
            setIsEditMode(false);
            getCRMTransactionCodes(crmTransactionCodes.currentPage, crmTransactionCodes.pageSize);
            console.log("geeting after update", crmTransactionCodes)
         }
      } catch (error) {
         // Handle errors if needed
         console.error("Error deleting county:", error);
      } finally {
         // Hide the spinner regardless of the outcome
         setShowSpinner(false);
         clearSearchFilters();
      }
   };

   const handleCreateTransactionCode = async (formValues: ICRMTransactionCodesItem) => {
      try {
         // Display spinner while processing
         setShowSpinner(true);

         const payload: ICRMTransactionCodesItem = {
            companyName: formValues.companyName,
            clientId: formValues.clientId,
            integrationId: formValues.integrationId,
            propertyId: formValues.propertyId,
            ownerId: formValues.ownerId,
            ownerName: formValues.ownerName,
            propertyName: formValues.propertyName,
            transactionCodes: formValues.transactionCodes,
            crmTransactionCodes: formValues.crmTransactionCodes
               .map((item) => ({
                  id: item.id || '',
                  transactionCodeId: item.id || '',
                  transactionCodeName: item.transactionCodeName,
                  transactionCodeDescription: item.transactionCodeDescription,
                  isRent: item.isRent,
                  isSubsidy: item.isSubsidy,
                  transactionCodeShortDescription: item.transactionCodeShortDescription
               })),
         }
         // Attempt to delete the county
         const response = await EvictionAutomationService.createCRMTransactionCode(payload);

         // Check if the deletion was successful
         if (response.status === HttpStatusCode.Ok) {
            // Show success message
            toast.success("Record added successfully", {
               position: toast.POSITION.TOP_RIGHT,
            });
            setShowTransactionCodeForm(false);
            setIsEditMode(false);
            // Close the confirmation pop-up and refresh the list
            getCRMTransactionCodes(crmTransactionCodes.currentPage, crmTransactionCodes.pageSize);
         }
      } catch (error) {
         // Handle errors if needed
         console.error("Error deleting transactionCodes:", error);
      } finally {
         // Hide the spinner regardless of the outcome
         setShowSpinner(false);
         clearSearchFilters();
      }
   };
   /**
    * Render each cell of a table
    * @param cellIndex  : cell of table
    * @param data  :data of cell
    * @param rowIndex : row index
    * @returns render cell
    */
   const handleCellRendered = (
      cellIndex: number,
      data: ICRMTransactionCodesItem,
      rowIndex: number
   ) => {
      console.log("Crm Transaction Codes", crmTransactionCodes)
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         //  countyName: () => formattedCell(cellValue),
         //  stateName: () => formattedCell(cellValue),
         companyName: () => renderHighlightedCell(cellValue),
         propertyName: () => renderHighlightedCell(cellValue),
         transactionCodes: () => formattedTransactionCodes(data.crmTransactionCodes),
         action: () => formatActionCell(rowIndex, data),
      };
      const renderer =
         renderers[propertyName] || (() => formattedCell(cellValue));
      if (visibleColumns.find(x => x.label === columnName)) {

         return (
            <td
               key={cellIndex}
               className={`px-1.5 py-2 md:py-2.5 font-normal text-[10.3px] md:text-[11px] text-[#2a2929]  ${columnName.replace(
                  /\s/g,
                  ""
               )}`}
            >
               {renderer()}
            </td>
         );
      }
      return <></>;
   };

   /**
    * @param value value to be shown in the cell
    * @returns span
    */
   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );

   const renderHighlightedCell = (value: any) => (
      <HighlightedText text={value as string ?? ''} query={crmTransactionCodes.searchParam ?? ''} />
   );
   const formattedTransactionCodes = (crmTransactionCodes: ICRMTransactionCode[]) => {
      // Extract names from the transaction codes
      const names = crmTransactionCodes.map(code => code.transactionCodeName);

      // If there are more than 3 names, truncate and append ellipsis
      const displayNames = names.length > 3
         ? names.slice(0, 3).join(', ') + '...'
         : names.join(', ');

      return (
         <span>{displayNames}</span>
      );
   };


   const formatActionCell = (rowIndex: number, rowData: ICRMTransactionCodesItem) => {
      return (
         <div
            className="cursor-pointer flex flex-row"
            key={`${rowIndex}_cross`}
         >
            <FaEdit
               style={{
                  height: 14,
                  width: 14,
                  color: "#2472db",
                  margin: 3,
               }}
               onClick={() => {
                  setIsEditMode(true);
                  setShowTransactionCodeForm(true);
                  setSelectedRowData(rowData); // Set the selected row data
               }}
            ></FaEdit>
            <FaTrash
               style={{
                  height: 14,
                  width: 14,
                  color: "#E61818",
                  margin: 3,
               }}
               onClick={() => {
                  setDeleteConfirmation(true);
                  setSelectedRowData(rowData); // Set the selected row data
               }}
            ></FaTrash>
         </div>
      );
   };
   // // Event handler for the 'Next' button
   const handleFrontButton = () => {
      if (crmTransactionCodes.currentPage < crmTransactionCodes.totalPages) {
         const updatedCurrentPage = crmTransactionCodes.currentPage + 1;
         setCRMTransactionCodes({
            ...crmTransactionCodes,
            currentPage: updatedCurrentPage,
         });
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getCRMTransactionCodes(updatedCurrentPage, crmTransactionCodes.pageSize);
      }
   };

   // Event handler for the 'Back' button
   const handleBackButton = () => {
      if (
         crmTransactionCodes.currentPage > 1 &&
         crmTransactionCodes.currentPage <= crmTransactionCodes.totalPages
      ) {
         const updatedCurrentPage = crmTransactionCodes.currentPage - 1;
         setCRMTransactionCodes({
            ...crmTransactionCodes,
            currentPage: updatedCurrentPage,
         });
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(crmTransactionCodes.currentPage > 1);
         // back button get late notices
         getCRMTransactionCodes(updatedCurrentPage, crmTransactionCodes.pageSize);
      }
   };

   const handleCompanyChange = (event: ChangeEvent<HTMLSelectElement>) => {
      const company = event.target.value as string;
      setSelectedCompany({ id: company, value: companyOptions.find(x => x.id === event.target.value)?.value || '' });
      getCRMTransactionCodes(1, 100, '', company);
      setCRMTransactionCodes((prevAllCases) => ({ ...prevAllCases, companyId: company }));
   };

   const handlePropertyChange = (event: ChangeEvent<HTMLSelectElement>) => {
      const property = event.target.value as string;
      setSelectedProperty({ id: property, value: propertyListDetails.find(x => x.propertyId === event.target.value)?.propertyName || '' });
      getCRMTransactionCodes(1, 100, '', selectedCompany.id as string ??"", selectedIntegration.id as string,selectedOwner.id as string,property);
      setCRMTransactionCodes((prevAllCases) => ({ ...prevAllCases, propertyId: property }));
   };
   const handleIntegrationChange = (event: ChangeEvent<HTMLSelectElement>) => {
      const integration = event.target.value as string;
      setSelectedIntegration({ id: integration, value: integrationOptions.find(x => x.id === event.target.value)?.value || '' });
      getCRMTransactionCodes(1, 100, '', selectedCompany.id as string ?? "", integration);
      fetchOwnerListByIntegrationId(integration);
      setCRMTransactionCodes((prevAllCases) => ({ ...prevAllCases, integrationId: integration }));
   };
   const fetchOwnerListByIntegrationId = async (integrationId: string) => {
      try {
         
         // Start the spinner or loading state if needed
         setShowSpinner(true);

         // Fetch properties based on integration ID
         const apiResponse = await EvictionAutomationService.getPropertyBasedOnIntegrationId(integrationId);

         if (apiResponse.status === HttpStatusCode.Ok) {
            setPropertyListDetails(apiResponse.data);
            const ownerMap = new Map<string, { ownerId: string; ownerName: string }>();

            apiResponse.data.forEach((item) => {
               const ownerName = item.ownerName?.trim(); // Ensure ownerName is not null, undefined, or an empty string
               const ownerId = item.ownerId?.trim(); // Fallback if ownerId is null

               // Skip items where ownerName or ownerId is not present
               if (!ownerName || !ownerId) {
                  return;
               }

               if (!ownerMap.has(ownerName)) {
                  ownerMap.set(ownerName, {
                     ownerId,
                     ownerName,
                  });
               }
            });

            // Convert Map to a list for dropdown (with id and name)
            const ownerList = Array.from(ownerMap.values()).map((owner) => ({
               id: owner.ownerId,
               value: owner.ownerName,
            }));

            setOwnerList(ownerList.sort((a, b) => a.value.localeCompare(b.value)) || []);
         } else {
            // Handle the case where the response status is not OK
            console.error("Failed to fetch properties:", apiResponse.status);
         }
      } catch (error) {
         console.error("An error occurred while fetching owner list:", error);
      } finally {
         // Stop the spinner or loading state
         setShowSpinner(false);
      }
   };
   const handleOwnerChange = (event: ChangeEvent<HTMLSelectElement>) => {
      const owner = event.target.value as string;
      setSelectedOwner({ id: owner, value: ownerList.find(x => x.id === event.target.value)?.value || '' });
      getCRMTransactionCodes(1, 100, '', selectedCompany.id as string ?? "", selectedIntegration.id as string,owner);
      filterPropertiesByOwnerId(owner);
      setCRMTransactionCodes((prevAllCases) => ({ ...prevAllCases, ownerId: owner }));
   };
   const filterPropertiesByOwnerId = (ownerId: string) => {
      
      // Start the spinner or loading state if needed
      setShowSpinner(true);

      // Assuming you have access to the full property list in a state (e.g., `propertyListDetails`)
      const filteredProperties = propertyListDetails.filter(
         (property) => property.ownerId === ownerId
      );

      // Create the new list for the properties of the selected owner
      const propertyList = filteredProperties.map((item) => ({
         id: item.propertyId ?? "",
         value: item.propertyName ?? "",
      }));

      // Set the filtered property list
      setPropertyList(
         propertyList.sort((a, b) => a.value.localeCompare(b.value)) || []
      );

      // Stop the spinner or loading state
      setShowSpinner(false);
   };
   const clearSearchFilters = () => {
      // getTylerConfigs(1, 100, '', '');
      setSelectedCompany(initialSelectOption);
      setSelectedProperty(initialSelectOption);
      setSelectedIntegration(initialSelectOption);
      setSelectedOwner(initialSelectOption);
      setCRMTransactionCodes((prevAllCases) => ({ ...prevAllCases, companyId: "", propertyId: "" }));
      setIsshowButton(false);
      setOwnerList([]);
      setPropertyList([]);
      setSelectedRowData({
         id: "",
         companyName: "",
         clientId: "",
         integrationId: "",
         propertyId: "",
         propertyName: "",
         transactionCodes: "",
         ownerId: "",
         ownerName: "",
         crmTransactionCodes: [
            {
               id: "",
               transactionCodeId: "",
               transactionCodeName: "",
               transactionCodeDescription: "",
               isRent: false,
               CompanyPropertyTransactionCodeId: "",
               isSubsidy: false,
               transactionCodeShortDescription: ""
            }
         ],
      });
      getCRMTransactionCodes(1, 100, '');
   };
   return (
      <div className="pt-2.5">
         {/* <div className="text-right mb-2">
            <Button
               isRounded={false}
               classes="bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 py-1.5 font-semibold text-xs text-white rounded shadow-lg inline-flex items-center"
               title={"Add New"}
               handleClick={() => {
                  setIsEditMode(false);
                  setShowTransactionCodeForm(true);
                  setSelectedRowData({
                     stateName: "",
                     countyName: "",
                     method: "",
                     endPoint: "",
                     isMultipleAOSPdf: false
                  });
               }}
               icon={<FaPlus className="mr-1.5"></FaPlus>}
               type={"button"}
            ></Button>
         </div> */}
         <div className="flex items-center justify-between mb-2">
            <div className="flex items-center w-auto filterSec">
               <DropdownPresentation
                  heading=""
                  selectedOption={selectedCompany}
                  handleSelect={handleCompanyChange}
                  options={companyOptions}
                  placeholder="Filter by company"
               />
               <DropdownPresentation
                  heading=""
                  selectedOption={selectedIntegration}
                  handleSelect={handleIntegrationChange}
                  options={integrationOptions}
                  placeholder="Filter by Integration"
               />
               <DropdownPresentation
                  heading=""
                  selectedOption={selectedOwner}
                  handleSelect={handleOwnerChange}
                  options={ownerList}
                  placeholder="Filter by Owner"
               />
               <DropdownPresentation
                  heading=""
                  selectedOption={selectedProperty}
                  handleSelect={handlePropertyChange}
                  options={propertyList}
                  placeholder="Filter by property"
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
               {<>
                  <Button
                     title={"Add"}
                     classes={"bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1"}
                     type="button"
                     isRounded={false}
                     icon={<FaPlus className="fa-solid fa-plus  mr-1 text-xs" />}
                     key={0}
                     handleClick={() => setShowTransactionCodeForm(true)}
                  />
               </>
               }
            </div>
         </div>
         <div className="relative -mr-0.5">
            {/* Render the Grid component with column headings and grid data */}
            {showSpinner ? (
               <Spinner />
            ) : (
               <>
                  <Grid
                     columnHeading={visibleColumns}
                     rows={crmTransactionCodes?.items}
                     cellRenderer={(
                        data: ICRMTransactionCodesItem,
                        rowIndex: number,
                        cellIndex: number
                     ) => {
                        return handleCellRendered(cellIndex, data, rowIndex);
                     }}
                  />
                  {crmTransactionCodes && (
                     <Pagination
                        numberOfItemsPerPage={crmTransactionCodes.pageSize}
                        currentPage={crmTransactionCodes.currentPage}
                        totalPages={crmTransactionCodes.totalPages}
                        totalRecords={crmTransactionCodes.totalCount}
                        handleFrontButton={handleFrontButton}
                        handleBackButton={handleBackButton}
                        canPaginateBack={canPaginateBack}
                        canPaginateFront={canPaginateFront}
                     />
                  )}
               </>
            )}
            {/* {showSpinner === true && <Spinner />}
               <Grid
                  columnHeading={visibleColumns}
                  rows={counties?.items}
                  cellRenderer={(
                     data: ICountyItems,
                     rowIndex: number,
                     cellIndex: number
                  ) => {
                     return handleCellRendered(cellIndex, data, rowIndex);
                  }}
               />
               {counties && (
                  <Pagination
                     numberOfItemsPerPage={counties.pageSize}
                     currentPage={counties.currentPage}
                     totalPages={counties.totalPages}
                     totalRecords={counties.totalCount}
                     handleFrontButton={handleFrontButton}
                     handleBackButton={handleBackButton}
                     canPaginateBack={canPaginateBack}
                     canPaginateFront={canPaginateFront}
                  />
               )} */}
         </div>
         {showTransactionCodeForm && (
            <CRMImporterTransactionCodesFormPopup
               showPopup={showTransactionCodeForm}
               closePopup={(shouldRefresh: string) => {
                  if (shouldRefresh === "refresh") {
                     getCRMTransactionCodes(crmTransactionCodes.currentPage, crmTransactionCodes.totalPages);
                  }
                  setShowTransactionCodeForm(false);
                  if (isEditMode) {
                     setSelectedRowData({
                        id: "",
                        companyName: "",
                        clientId: "",
                        integrationId: "",
                        propertyId: "",
                        propertyName: "",
                        transactionCodes: "",
                        ownerId: "",
                        ownerName: "",
                        crmTransactionCodes: [
                           {
                              id: "",
                              transactionCodeId: "",
                              transactionCodeName: "",
                              transactionCodeDescription: "",
                              isRent: false,
                              CompanyPropertyTransactionCodeId: "",
                              isSubsidy: false,
                              transactionCodeShortDescription: ""
                           }
                        ],
                     });
                  }
                  setIsEditMode(false);
               }}
               isEditMode={isEditMode}
               initialValues={selectedRowData}
               onSubmit={(formValues: ICRMTransactionCodesItem) => {
                  if (isEditMode) {
                     handleEditTransactionCode(formValues);
                  }
                  else {
                     handleCreateTransactionCode(formValues);
                  }
               }}
            ></CRMImporterTransactionCodesFormPopup>
         )}
         {deleteConfirmation === true && (
            <div>
               <ConfirmationBox
                  heading={"Confirmation"}
                  message={"Are you sure you want to delete this record?"}
                  showConfirmation={deleteConfirmation}
                  confirmButtonTitle="OK"
                  closePopup={() => {
                     setDeleteConfirmation(false);
                  }}
                  handleSubmit={() => {
                     setDeleteConfirmation(false);
                     handleDeleteTransactionCode();
                  }}
               ></ConfirmationBox>
            </div>
         )}
      </div>
   );
};
export default EvictionAutomationTransactionCodesGrid;
