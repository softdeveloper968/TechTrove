import Modal from "components/common/popup/PopUp";
import FormikControl from "components/formik/FormikControl";
import { Form, Formik } from "formik";
import { IUnitsForProperty } from "interfaces/eviction-automation.interface";
import React, { useState } from "react";
import * as yup from "yup";
import Grid from "components/common/grid/GridWithToolTip"; // Import GridWithToolTip
import GridCheckbox from "components/formik/GridCheckBox";
import { toast } from "react-toastify";

type PropertyUnitsFormPopUpProps = {
  showPopup: boolean;
  closePopup: (shouldRefresh: string) => void;
  initialValues: IUnitsForProperty[];
  onSubmit: (formValues: IUnitsForProperty[]) => void;
};

const initialColumnMapping = [
  { columnName: "isChecked", label: "Bulk Edit", controlType: "checkbox", toolTipInfo: "This checkbox represents bulk update only" },
  { columnName: "unitId", label: "Unit Id" },
  { columnName: "unitNumber", label: "Unit Number" },
  { columnName: "address1", label: "Address 1" },
  { columnName: "address2", label: "Address 2" },
  { columnName: "city", label: "City" },
  { columnName: "state", label: "State" },
  { columnName: "zip", label: "Zip" },
  { columnName: "county", label: "County" },
];

const validationSchema = yup.object({
  // Add validations as needed.
});

const PropertyUnitsFormPopUp: React.FC<PropertyUnitsFormPopUpProps> = ({
  showPopup,
  closePopup,
  initialValues,
  onSubmit,
}) => {
  const [selectedUnits, setSelectedUnits] = useState<boolean[]>(Array(initialValues.length).fill(false));
  const [selectAll, setSelectAll] = useState<boolean>(false);

  // To track the initial values for comparison
  const initialFormValues = initialValues.reduce((acc, unit, index) => {
    acc[`unitId_${index}`] = unit.unitId || "";
    acc[`unitNumber_${index}`] = unit.unitNumber || "";
    acc[`address1_${index}`] = unit.address1 || "";
    acc[`address2_${index}`] = unit.address2 || "";
    acc[`city_${index}`] = unit.city || "";
    acc[`state_${index}`] = unit.state || "";
    acc[`zip_${index}`] = unit.zip || "";
    acc[`county_${index}`] = unit.county || "";
    return acc;
  }, {} as Record<string, string>);

  const handleCheckboxChange = (index: number) => {
    const updatedSelectedUnits = [...selectedUnits];
    updatedSelectedUnits[index] = !updatedSelectedUnits[index];
    setSelectedUnits(updatedSelectedUnits);
    setSelectAll(updatedSelectedUnits.every(Boolean)); // Update selectAll based on individual selections
  };

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAll(checked);
    setSelectedUnits(Array(initialValues.length).fill(checked));
  };

  const handleFormSubmit = (values: Record<string, string>) => {
    const updatedUnits = initialValues
      .map((unit, index) => {
        const updatedUnit: IUnitsForProperty = {
          ...unit,
          unitId: values[`unitId_${index}`],
          unitNumber: values[`unitNumber_${index}`],
          address1: values[`address1_${index}`],
          address2: values[`address2_${index}`],
          city: values[`city_${index}`],
          state: values[`state_${index}`],
          zip: values[`zip_${index}`],
          county: values[`county_${index}`],
        };

        return updatedUnit;
      })
      .filter((unit) => unit !== null) as IUnitsForProperty[]; 
      onSubmit(updatedUnits); 
  };

  return (
    <>
      {showPopup && (
        <Modal
          showModal={showPopup}
          onClose={() => closePopup(" noRefresh")}
          width="max-w-5xl"
        >
          <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
            <div className="sm:flex sm:items-start">
              <div className="text-center sm:text-left">
                <h3 className="leading-55 text-gray-900 text-[16px] md:text-xl mb-1.5" id="modal-title">
                  {"Edit Unit Address"}
                </h3>
              </div>
            </div>
            <div className="relative pt-2">
              <Formik
                initialValues={initialFormValues}
                validationSchema={validationSchema}
                onSubmit={handleFormSubmit}
              >
                {(formik) => {
                  const handleInputChange = (columnName: string, value: string, rowIndex: number) => {
                    // If the row is selected, update all selected rows
                    if (selectedUnits[rowIndex]) {
                      const updatedValues = { ...formik.values };
                      
                      // Apply the updated value to all selected rows
                      selectedUnits.forEach((isSelected, index) => {
                        if (isSelected) {
                          updatedValues[`${columnName}_${index}`] = value;
                        }
                      });

                      // Set the updated values to Formik's state
                      Object.keys(updatedValues).forEach((key) => {
                        formik.setFieldValue(key, updatedValues[key]);
                      });
                    } else {
                      // If the row is not selected, update only that row
                      formik.setFieldValue(`${columnName}_${rowIndex}`, value);
                    }
                  };

                  return (
                    <Form className="flex flex-col">
                      <div className="overflow-x-auto">
                        <Grid
                          columnHeading={initialColumnMapping}
                          rows={initialValues}
                          handleSelectAllChange={handleSelectAllChange}
                          selectAll={selectAll}
                          showInPopUp={true}
                          cellRenderer={(data, rowIndex, cellIndex) => {
                            const columnName = initialColumnMapping[cellIndex].columnName;
                            return (
                              <td className="px-1 py-2 text-left">
                                {columnName === "isChecked" ? (
                                  <div className="text-left">
                                    <GridCheckbox
                                      checked={selectedUnits[rowIndex]}
                                      onChange={() => handleCheckboxChange(rowIndex)}
                                      label=""
                                    />
                                  </div>
                                ) : (
                                  <>
                                    <FormikControl
                                      control="input"
                                      type="text"
                                      name={`${columnName}_${rowIndex}`} // Ensure unique name
                                      placeholder={initialColumnMapping[cellIndex].label}
                                      className="peer outline-none p-2.5 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500"
                                      onChange={(e: any) => {
                                        formik.setFieldValue(`${columnName}_${rowIndex}`, e.target.value);
                                        handleInputChange(columnName, e.target.value, rowIndex);
                                      }} // Use setFieldValue and handleInputChange
                                    />
                                    {formik.touched[`${columnName}_${rowIndex}`] && formik.errors[`${columnName}_${rowIndex}`] && (
                                      <div className="text-red-500 text-xs mt-1">
                                        {formik.errors[`${columnName}_${rowIndex}`]}
                                      </div>
                                    )}
                                  </>
                                )}
                              </td>
                            );
                          }}
                        />
                      </div>
                      <div className="flex justify-end mt-4">
                        <button
                          type="submit"
                          className="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                        >
                          Save
                        </button>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default PropertyUnitsFormPopUp;
