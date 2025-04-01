import React, { useEffect, useRef, useState } from "react";
import { IEvictionAutomationIntegrationsGridItem, IUnitsForProperty } from "interfaces/eviction-automation.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { useEvictionAutomationContext } from "pages/eviction-automation/EvictionAutomationContext";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import { toCssClassName } from "utils/helper";
import { FaEdit, FaEye, FaTrash } from "react-icons/fa";
import PropertyUnitsFormPopUp from "./PropertyUnits_EditForm";
import PropertyUnitsGrid from "./PropertyUnitsGrid";
import IconButton from "components/common/button/IconButton";

type EvictionAutomationIntegrationsGridProps = {};

const EvictionAutomationRealPageGrid = (props: EvictionAutomationIntegrationsGridProps) => {
  const initialColumnMapping: IGridHeader[] = [
    { columnName: "propertyId", label: "Property Id" },
    { columnName: "propertyName", label: "Property Name" },
    { columnName: "units", label: "Units" },
    { columnName: "ownerName", label: "Owner Name" },
    { columnName: "streetAddress1", label: "Address 1" },
    { columnName: "city", label: "City" },
    { columnName: "state", label: "State" },
    { columnName: "zip", label: "Zip" },
    { columnName: "country", label: "Country" },
    { columnName: "county", label: "County" },
    {columnName: "pullDate", label: "Pull Date"},
    {columnName: "status", label: "Status"}
  ];

  const initialUnitsColumnMapping: IGridHeader[] = [
    { columnName: "action", label: "Action", className: "action" },
    { columnName: "unitId", label: "Unit Id" },
    { columnName: "unitNumber", label: "Unit Number" },
    { columnName: "address1", label: "Address 1" },
    { columnName: "address2", label: "Address 2" },
    { columnName: "city", label: "City" },
    { columnName: "state", label: "State" },
    { columnName: "zip", label: "Zip" },
    { columnName: "county", label: "County" },
   
  ];

  const {
    showSpinner,
    evictionAutomationIntegrationsQueue,
    getEvictionAutomationIntegrationsQueue,
    getUnitsForProperty,
    propertyUnits,
  } = useEvictionAutomationContext();

  const isMounted = useRef(true);
  const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
  const [visibleUnitsColumns] = useState<IGridHeader[]>(initialUnitsColumnMapping);
  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(evictionAutomationIntegrationsQueue.currentPage > 1);
  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(evictionAutomationIntegrationsQueue.totalPages > 1);
  const [isUnitsGridVisible, setIsUnitsGridVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<IUnitsForProperty | null>(null);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [formValues, setFormValues] = useState<IUnitsForProperty | null>(null);
  const [initialUnitValues, setInitialUnitValues] = useState<IUnitsForProperty | null>(null);
  const [isUpdateButtonDisabled, setIsUpdateButtonDisabled] = useState(true);
  const [integrationId, setIntegrationId] = useState('');
  const [propertyId, setPropertyId] = useState('');
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);


  useEffect(() => {
    if (isMounted.current) {
      getEvictionAutomationIntegrationsQueue(1, 100, 'RealPage', '');
      isMounted.current = false;
    }
  }, []);

  useEffect(() => {
    setCanPaginateBack(evictionAutomationIntegrationsQueue.currentPage > 1);
    setCanPaginateFront(evictionAutomationIntegrationsQueue.totalPages > 1);
  }, [evictionAutomationIntegrationsQueue]);

  const handlePagination = (direction: "back" | "front") => {
    let updatedCurrentPage = evictionAutomationIntegrationsQueue.currentPage;

    if (direction === "front" && updatedCurrentPage < evictionAutomationIntegrationsQueue.totalPages) {
      updatedCurrentPage++;
    }

    if (direction === "back" && updatedCurrentPage > 1) {
      updatedCurrentPage--;
    }

    if (updatedCurrentPage !== evictionAutomationIntegrationsQueue.currentPage) {
      setCanPaginateBack(updatedCurrentPage > 1);
      setCanPaginateFront(updatedCurrentPage < evictionAutomationIntegrationsQueue.totalPages);
      getEvictionAutomationIntegrationsQueue(updatedCurrentPage, evictionAutomationIntegrationsQueue.pageSize, 'RealPage', '');
    }
  };

  const handleViewUnitsClick = async (integrationId: string, propertyId: string) => {
   setIntegrationId(integrationId);
   setPropertyId(propertyId);
   setIsLoadingUnits(true);
  await getUnitsForProperty(integrationId, propertyId);
   setIsLoadingUnits(false);
    setIsUnitsGridVisible(true);
    setIsModalOpen(true);
  };

  const handleEditClick = (unitData: IUnitsForProperty) => {
    setSelectedUnit(unitData);
    setIsEditFormOpen(true);
  };

  const handleCellRenderer = (columnName: string, data: IEvictionAutomationIntegrationsGridItem) => {
    const baseUrl = process.env.REACT_APP_API_URL;
    
    const cellValue = data[columnName as keyof IEvictionAutomationIntegrationsGridItem];
  
    const renderers: Record<string, () => JSX.Element> = {
      propertyName: () => (
        data.propertyName !== "New" ? (
          <span>
            <a href={`${baseUrl}/api/CRMImporter/GetPropertyDetails?propertyId=${data.id}`} target="_blank" className="text-[#2472db]">
              {data.propertyName}
            </a>
          </span>
        ) : (
          formattedCell(data.propertyName)
        )
      ),
      units: () => (
          <IconButton
          type={"button"}
          className="cursor-pointer text-[#2472db] ml-1.5"
          icon={<FaEye className="h-4 w-4" />}
          handleClick={() => handleViewUnitsClick(data.integrationId ?? "", data.propertyId ?? "")}
       />
      ),
      isActive: () => <span>{data.isActive ? "True" : "False"}</span>,
      default: () => formattedCell(cellValue),
    };
  
    return renderers[columnName] ? renderers[columnName]() : renderers.default();
  };

  const handleUnitsCellRenderer = (columnName: string, data: IUnitsForProperty) => {
    const cellValue = data[columnName as keyof IUnitsForProperty];
  
    const renderers: Record<string, () => JSX.Element> = {
      action: () => (
        <div className="cursor-pointer flex flex-row">
          <FaEdit
            style={{ height: 14, width: 14, color: "#2472db", margin: 3 }}
            onClick={() => handleEditClick(data)}
          />
        </div>
      ),
      default: () => formattedCell(cellValue),
    };
  
    return renderers[columnName] ? renderers[columnName]() : renderers.default();
  };

  const formattedCell = (value: any) => <span>{value !== null ? value : ""}</span>;

  useEffect(() => {
    // Track initial values and compare with form values
    if (selectedUnit) {
      setInitialUnitValues(selectedUnit);
      setFormValues(selectedUnit);
    }
  }, [selectedUnit]);

  useEffect(() => {
    if (initialUnitValues && formValues) {
      const isFormChanged = !Object.keys(initialUnitValues).every(
        (key) => initialUnitValues[key as keyof IUnitsForProperty] === formValues[key as keyof IUnitsForProperty]
      );
      setIsUpdateButtonDisabled(!isFormChanged);
    }
  }, [formValues, initialUnitValues]);

  return (
   <div>
   
     <div className="relative -mr-0.5">
       {showSpinner && <Spinner />}
       <Grid
         columnHeading={visibleColumns}
         rows={evictionAutomationIntegrationsQueue.items}
         cellRenderer={(data: IEvictionAutomationIntegrationsGridItem, rowIndex: number, cellIndex: number) => (
           <td
             key={cellIndex}
             className={`px-1.5 py-2 md:py-2.5 font-normal text-[10.3px] md:text-[11px] text-[#2a2929] ${toCssClassName(visibleColumns[cellIndex].columnName)}`}
           >
             {handleCellRenderer(visibleColumns[cellIndex].columnName, data)}
           </td>
         )}
       />
       <Pagination
         numberOfItemsPerPage={evictionAutomationIntegrationsQueue.pageSize}
         currentPage={evictionAutomationIntegrationsQueue.currentPage}
         totalPages={evictionAutomationIntegrationsQueue.totalPages}
         totalRecords={evictionAutomationIntegrationsQueue.totalCount}
         handleFrontButton={() => handlePagination("front")}
         handleBackButton={() => handlePagination("back")}
         canPaginateBack={canPaginateBack}
         canPaginateFront={canPaginateFront}
       />
     </div>
 
     {isModalOpen  && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-40">
          <div className="bg-white rounded-lg p-6 w-full relative"  style={{ width: '1000px' }}>
            {/* Show the spinner while units are loading */}
            {isLoadingUnits && <Spinner />}

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Units for Property</h3>
            </div>
           
               <PropertyUnitsGrid integrationId={integrationId} propertyId={propertyId} propertyUnits={propertyUnits} />
               <button onClick={() => setIsModalOpen(false)} className="absolute top-0 right-0 m-2 md:m-3 text-gray-500 cursor-pointer"><svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 352 512" className="h-3.5 h-3.5" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path></svg></button>
           
          </div>
        </div>
      )}
   </div>
 );
};

export default EvictionAutomationRealPageGrid;
