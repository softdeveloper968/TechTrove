import React, { useEffect, useState } from "react";
import { IUnitsForProperty } from "interfaces/eviction-automation.interface";
import { useEvictionAutomationContext } from "pages/eviction-automation/EvictionAutomationContext";
import Grid from "components/common/grid/GridWithToolTip";
import Spinner from "components/common/spinner/Spinner";
import PropertyUnitsFormPopUp from "./PropertyUnits_EditForm";
import { IGridHeader } from "interfaces/grid-interface";
import GridCheckbox from "components/formik/GridCheckBox"; 
import { toCssClassName } from "utils/helper";
import { FaEdit } from "react-icons/fa";
import Button from "components/common/button/Button";

interface PropertyUnitsGridProps {
    integrationId: string;
    propertyId: string;
    propertyUnits: IUnitsForProperty[];
}

const PropertyUnitsGrid: React.FC<PropertyUnitsGridProps> = ({ integrationId, propertyId, propertyUnits }) => {
    const { showSpinner, updateUnits, getUnitsForProperty } = useEvictionAutomationContext();

    const initialColumnMapping: IGridHeader[] = [
        { columnName: "isChecked", label: "Select", controlType: "checkbox" },
        { columnName: "unitId", label: "Unit Id" },
        { columnName: "unitNumber", label: "Unit Number" },
        { columnName: "address1", label: "Address 1" },
        { columnName: "address2", label: "Address 2" },
        { columnName: "city", label: "City" },
        { columnName: "state", label: "State" },
        { columnName: "zip", label: "Zip" },
        { columnName: "county", label: "County" },
    ];

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
    const [selectedUnits, setSelectedUnits] = useState<IUnitsForProperty[]>([]);
    const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);

    // Track the column being edited
    const [editingColumn, setEditingColumn] = useState<string | null>(null);
    const [editingValue, setEditingValue] = useState<string>("");

    const handleBulkEdit = () => {
        setIsModalOpen(true);
    };

    const handleFormSubmit = (formValues: IUnitsForProperty[]) => {
        updateUnits(integrationId, propertyId, formValues);
        getUnitsForProperty(integrationId, propertyId);
        setIsModalOpen(false);
        setSelectedUnits([]);
    };

    const handleSelectAllChange = (checked: boolean) => {
        setIsSelectAllChecked(checked);
        if (checked) {
            setSelectedUnits(propertyUnits);
        } else {
            setSelectedUnits([]);
        }
    };

    // Real-time change handler to update all selected rows with the new value
    const handleRealTimeChange = (value: string, column: string) => {
        // Update the column for all selected units immediately
        setEditingValue(value); // Update the editing value
        setSelectedUnits(prevSelected => {
            return prevSelected.map(unit => ({
                ...unit,
                [column]: value, // Update the column for each selected unit
            }));
        });
    };

    const renderCellContent = (data: IUnitsForProperty, column: IGridHeader) => {
        if (column.columnName === "isChecked") {
            return (
                <GridCheckbox
                    checked={selectedUnits.includes(data)}
                    onChange={(checked: boolean) => {
                        if (checked) {
                            setSelectedUnits(prev => [...prev, data]);
                        } else {
                            setSelectedUnits(prev => prev.filter(unit => unit !== data));
                        }
                    }}
                    label={""}
                />
            );
        }

        // If the column is being edited, show an input field
        if (selectedUnits.includes(data) && editingColumn === column.columnName) {
            return (
                <input
                    type="text"
                    value={editingValue !== null ? editingValue : data[column.columnName]}
                    onChange={(e) => handleRealTimeChange(e.target.value, column.columnName)}
                    className="p-1 border border-gray-300 rounded"
                />
            );
        }

        return data[column.columnName] || "";
    };

    useEffect(() => {
        setIsSelectAllChecked (selectedUnits.length === propertyUnits.length);
    }, [selectedUnits, propertyUnits.length]);

    return (
        <div>
            {showSpinner && <Spinner />}
            <div className="mb-2">
            <Button
                  title={"Edit"}
                  classes={"bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold font-semibold"}
                  type={"button"}
                  isRounded={false}
                  icon={<FaEdit className="fa-solid fa-plus  mr-1 text-xs" />}
                  handleClick={handleBulkEdit}
                  disabled={selectedUnits.length === 0}
               ></Button>
            </div>
            
            <Grid
                columnHeading={visibleColumns}
                rows={propertyUnits}
                handleSelectAllChange={handleSelectAllChange}
                selectAll={isSelectAllChecked}
                cellRenderer={(data: IUnitsForProperty, rowIndex: number, cellIndex: number) => (
                    <td
                        key={cellIndex}
                        className={`px-1.5 py-2 md:py-2.5 font-normal text-[10.3px] md:text-[11px] text-[#2a2929] ${toCssClassName(visibleColumns[cellIndex].columnName)}`}
                        onClick={() => {
                            setEditingColumn(visibleColumns[cellIndex].columnName); // Set the column to edit
                            setEditingValue(data[visibleColumns[cellIndex].columnName] || ""); // Set the initial value to edit
                        }}
                    >
                        {renderCellContent(data, visibleColumns[cellIndex])}
                    </td>
                )}
            />

            {isModalOpen && (
                <PropertyUnitsFormPopUp
                    showPopup={isModalOpen}
                    closePopup={(shouldRefresh) => {
                        setIsModalOpen(false);
                    }}
                    initialValues={selectedUnits}
                    onSubmit={handleFormSubmit}
                />
            )}
        </div>
    );
};

export default PropertyUnitsGrid;