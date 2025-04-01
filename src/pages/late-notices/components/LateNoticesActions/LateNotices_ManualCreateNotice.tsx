import React from "react";
import { useState } from "react";

import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { Form, Formik, FormikProps } from "formik";
import { FaTimes, FaPlusCircle } from "react-icons/fa";

import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import Spinner from "components/common/spinner/Spinner";
import { useLateNoticesContext } from "pages/late-notices/LateNoticesContext";

import { ICreateLateNotice } from "interfaces/late-notices.interface";
import LateNoticesService from "services/late-notices.service";
import { StateCode } from "utils/constants";
import { handlePostalCodeKeyDown } from "utils/helper";

type ManuallyCreateNoticeProps = {
  manualCreateNotice: Boolean;
  handleManualCreateNotice: (value: boolean) => void;
};

// Validation schema for manual create notice
const validationSchema = yup.object({
  unit: yup
    .string()
    .required("Please enter unit")
    .max(50, "Unit must not exceed 50 characters"),
  city: yup
    .string()
    .max(50, "City must not exceed 50 characters")
    .required("Please enter city"),
  state: yup
    .string()
    .max(2, "State Code must be of 2 characters")
    .required("Please enter state code"),
  zip: yup
    .string()
    .required("Please enter Zip code.")
    .min(5, "Zip code must be 5 digits.")
    .max(5, "Zip code must be 5 digits."),
  rentDue: yup
    .number()
    .required("Please enter due rent ")
    .typeError("Rent due must be a valid amount")
    .transform((value) => (isNaN(value) ? undefined : value)) // Transform to undefined if it's not a number
    .test("maxDigits", "Rent due must have at most 20 digits", (value) => {
      if (!value) return true; // Skip if undefined
      const stringValue = value.toString();
      return stringValue.length <= 20;
    }),
  property: yup
    .string()
    .max(100, "Property must not exceed 100 characters")
    .required("Please enter property"),
  noticePeriod: yup
    .mixed()
    .test("isInteger", "Please enter only integer value.", (value) => {
      const numericValue = Number(value);
      return !isNaN(numericValue) && Number.isInteger(numericValue);
    })
    .test("maxDigits", "Notice period must have at most 20 digits", (value) => {
      if (value === undefined) return true; // Skip if undefined
      const stringValue = value.toString();
      return stringValue.length <= 20;
    })
    .required("Please enter notice period"),
  otherFees: yup
    .number()
    .typeError("Fees due must be a valid amount")
    .transform((value) => (isNaN(value) ? undefined : value)) // Transform to undefined if it's not a number
    .test("maxDigits", "Fees due must have at most 20 digits", (value) => {
      if (!value) return true; // Skip if undefined
      const stringValue = value.toString();
      return stringValue.length <= 20;
    })
    .required("Please enter fees"),

  noticeAffiant: yup
    .string()
    .max(50, "Affiant signature must not exceed 50 characters")
    .required("Please enter notice affiant signature"),
  lateFees: yup
    .number()
    .typeError("Late fees must be a valid amount")
    .transform((value) => (isNaN(value) ? undefined : value)) // Transform to undefined if it's not a number
    .test("maxDigits", "Late fees must have at most 20 digits", (value) => {
      if (!value) return true; // Skip if undefined
      const stringValue = value.toString();
      return stringValue.length <= 20;
    })
    .required("Please enter late fees"),
  lateFeesDate: yup
    .date()
    .required("Please enter late fee date")
    .typeError("Please enter a valid date"),
  addAllOtherTenant: yup.boolean(),
  address: yup
    .string()
    .required("Please enter address")
    .min(3, "Address must be at least 3 characters")
    .max(300, "Address must not exceed 300 characters"),
  tenants: yup.array().of(
    yup.object().shape({
      firstName: yup.string().required("First name is required"),
      lastName: yup.string().required("Last name is required"),
    })
  ),
});

// ManuallyCreateNotice component serves as the main entry point for the Late Notices page
const ManualCreateNotice = (props: ManuallyCreateNoticeProps) => {
  // get late notices
  const { getLateNotices, setSelectedLateNoticeId, setLateNotices } = useLateNoticesContext();
  // handle pop up close event
  const [isPopupOpen, setIsPopupOpen] = useState(props.manualCreateNotice);

  // spinner toggle
  const [spinner, setSpinner] = useState<Boolean>(false);

  const closePopup = () => {
    props.handleManualCreateNotice(false);
    setIsPopupOpen(false);
    setSelectedLateNoticeId([]);
    setLateNotices((prev) => {
      return {
        ...prev,
        items: prev.items.map((item) => ({
          ...item,
          isChecked: false,
        })),
      };
    });
  };

  // LateNotice form initial values
  const initialValues: ICreateLateNotice = {
    city: "",
    unit: "",
    zip: "",
    state: "",
    rentDue: 0,
    property: "",
    noticePeriod: 0,
    otherFees: "",
    lateFees: 0,
    noticeAffiantSignature: "",
    lateFeesDate: new Date(),
    addAllOtherTenant: false,
    tenants: [
      {
        firstName: "",
        lastName: "",
        middleName: "",
      },
    ],
  };

  /**
   * Handles the creation of late notices based on the provided form values.
   * Displays a success toast message upon successful creation.
   * Closes the popup on success.
   *
   * @param {ICreateLateNotice} formValues - The form values for creating a late notice.
   */
  const handleLateNotices = async (formValues: ICreateLateNotice) => {
    try {
      // Create an array with a single late notice object
      setSpinner(true);
      if (formValues.tenants && formValues.tenants.length > 0) {
        formValues.tenants.forEach((tenant, index) => {
          (formValues as any)[`tenant${index + 1}FirstName`] = tenant.firstName;
          (formValues as any)[`tenant${index + 1}MiddleName`] =
            tenant.middleName || "";
          (formValues as any)[`tenant${index + 1}LastName`] = tenant.lastName;
        });
      }
      formValues.zip = formValues.zip.toString();
      // Destructure the object and rename 'tenants' to 'tenant1'
      const { tenants, ...newObject } = formValues;
      const lateNotices = [newObject];
      // Call the LateNoticesService to create a late notice
      const response = await LateNoticesService.createLateNotice(lateNotices);
      // Check if the request was successful (status code 200)
      if (response.status === HttpStatusCode.Ok) {
        // Display a success toast message
        toast.success("Successfully Added");
        getLateNotices(1, 100);
        // Close the popup
        closePopup();
      } else {
        // Handle other status codes if needed
        // For example, display an error message toast
        toast.error("Failed to create late notice");
      }
    } finally {
      setSpinner(false);
    }
  };

  // handle plus icon click
  const handlePlusClick = (formik: FormikProps<ICreateLateNotice>) => {
    if (formik.values.tenants && formik.values.tenants.length < 5) {
      // Create a new tenant object with default values
      const newTenant = {
        firstName: "",
        middleName: "",
        lastName: "",
      };

      // Update the form data model by adding the new tenant object
      formik.setFieldValue("tenants", [...formik.values.tenants, newTenant]);
    }
  };

  // Function to handle input change
  const handleInputChange = (
    fieldName: string,
    value: string,
    formik: FormikProps<ICreateLateNotice>
  ) => {
    // Update the form data model using Formik's setFieldValue
    formik.setFieldValue(`${fieldName}`, value);
  };

  // Function to handle clicking the cross icon to remove an input field
  const handleCrossClick = (
    _index: number,
    formik: FormikProps<ICreateLateNotice>
  ) => {
    if (formik.values.tenants && formik.values.tenants.length > 1) {
      // Use filter to create a new array without the element at the specified index
      let filteredRecords = formik.values.tenants.filter(
        (_, index) => index !== _index
      );
      // Update the form data model using Formik's setFieldValue
      formik.setFieldValue("tenants", filteredRecords);
    }
  };

  return (
    <>
      {isPopupOpen && (
        <Modal showModal={isPopupOpen} onClose={closePopup} width="max-w-5xl">
          {spinner && <Spinner></Spinner>}
          <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
            <div className="sm:flex sm:items-start">
              <div className="my-2.5 text-center md:my-0 sm:text-left">
                <h3
                  className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                  id="modal-title"
                >
                  Create Late Notice
                </h3>
              </div>
            </div>
            <div className="relative pt-1 flex-auto">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleLateNotices}
              >
                {(formik) => (
                  <Form className="flex flex-col">
                    {formik.values.tenants &&
                      formik.values.tenants.map((value, index) => (
                        <>
                          <div className="pb-1">
                            <b>Tenant {index + 1}</b>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-3 md:mb-4">
                            <div
                              className="relative text-left"
                              key={`${index}_firstName`}
                            >
                              <FormikControl
                                control="input"
                                type="text"
                                label={"First Name"}
                                name={`tenants[${index}].firstName`}
                                classes="p-2"
                                autoFocus={true}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                  handleInputChange(
                                    `tenants[${index}].firstName`,
                                    e.target.value,
                                    formik
                                  )
                                }
                              />
                            </div>
                            <div
                              className="relative text-left"
                              key={`${index}_middleName`}
                            >
                              <FormikControl
                                control="input"
                                type="text"
                                label={"Middle Name"}
                                name={`tenants[${index}].middleName`}
                                classes="p-2"
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                  handleInputChange(
                                    `tenants[${index}].middleName`,
                                    e.target.value,
                                    formik
                                  )
                                }
                              />
                            </div>
                            <div
                              className="relative text-left "
                              key={`${index}_lastName`}
                            >
                              <FormikControl
                                control="input"
                                type="text"
                                label={"Last Name"}
                                name={`tenants[${index}].lastName`}
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                  handleInputChange(
                                    `tenants[${index}].lastName`,
                                    e.target.value,
                                    formik
                                  )
                                }
                              />
                            </div>
                            <div className="relative text-left">
                              <label className="hidden sm:block">&nbsp;</label>
                              <div className="flex items-center sm:h-[46px]">
                                {index !== 0 && (
                                  <div
                                    className="cursor-pointer mr-3"
                                    key={`${index}_cross`}
                                  >
                                    <FaTimes
                                      style={{
                                        height: 20,
                                        width: 20,
                                        color: "#2472db",
                                      }}
                                      onClick={() =>
                                        handleCrossClick(index, formik)
                                      }
                                    ></FaTimes>
                                  </div>
                                )}
                                {index ===
                                  (formik.values.tenants &&
                                    formik.values?.tenants.length - 1) &&
                                  index < 4 && (
                                    <div
                                      className="cursor-pointer flex items-center"
                                      key={`${index}_plus`}
                                    >
                                      <FaPlusCircle
                                        style={{
                                          height: 20,
                                          width: 20,
                                          color: "#2472db",
                                        }}
                                        onClick={() => handlePlusClick(formik)}
                                      ></FaPlusCircle>
                                      <label className="pl-2">Add Tenant</label>
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        </>
                      ))}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                      <div className="relative  text-left ">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Tenant Address"}
                          name={"address"}
                          placeholder={"Address"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Tenant Unit"}
                          name={"unit"}
                          placeholder={"Unit"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Tenant City"}
                          name={"city"}
                          placeholder={"City"}
                        />
                      </div>
                      <div className="relative text-left max-w-[120px]">
                        <FormikControl
                          control="select"
                          type="select"
                          label={"Tenant State"}
                          name={"state"}
                          defaultOption={"Please select"}
                          placeholder={"State"}
                          options={StateCode}
                        />
                      </div>
                      <div className="relative  text-left max-w-[120px]">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Zip"}
                          name={"zip"}
                          placeholder={"Zip"}
                          maxlength={5}
                          onKeyDown={handlePostalCodeKeyDown}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="number"
                          type="number"
                          label={"Rent Due"}
                          name={"rentDue"}
                          placeholder={"Rent Due"}
                        />
                      </div>
                      <div className="relative  text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Property"}
                          name={"property"}
                          placeholder={"Property"}
                        />
                      </div>
                      <div className="relative  text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Notice Period"}
                          name={"noticePeriod"}
                          placeholder={"Notice Period"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="number"
                          type="number"
                          label={"Other Fees"}
                          name={"otherFees"}
                          placeholder={"Other Fees"}
                        />
                      </div>

                      <div className="relative  text-left">
                        <FormikControl
                          control="number"
                          type="number"
                          label={"Late Fees"}
                          name={"lateFees"}
                          placeholder={"Late Fees"}
                        />
                      </div>
                      <div className="relative  text-left">
                        <FormikControl
                          control="date"
                          type="date"
                          label={"Late Fees Date"}
                          name={"lateFeesDate"}
                          placeholder={"Late Fees Date"}
                        />
                      </div>
                    </div>
                    <div className="relative flex items-center pt-4 md:pt-5">
                      <FormikControl
                        control="checkbox"
                        type="checkbox"
                        label={"Add  Other Tenants"}
                        name={"addAllOtherTenant"}
                        onChange={(value: boolean) => {
                          formik.setFieldValue("addAllOtherTenant", value);
                        }}
                        checked={formik.values.addAllOtherTenant}
                      />
                      {formik.errors.addAllOtherTenant && (
                        <span className="text-[11px] text-aidonicRed text-red-500">
                          {formik.errors.addAllOtherTenant}
                        </span>
                      )}
                    </div>
                    <div className="relative flex items-center pt-4 md:pt-5">
                      <div className="relative ">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Notice Affiant Signature"}
                          name={"noticeAffiant"}
                          placeholder={"Notice Affiant"}
                        />
                      </div>
                    </div>
                    <div className="mt-2 md:mt-0 py-3 flex justify-end">
                      <Button
                        type="button"
                        isRounded={false}
                        title="Cancel"
                        handleClick={closePopup}
                        classes="text-[13px] md:text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                      ></Button>
                      <Button
                        type="submit"
                        isRounded={false}
                        title="Create"
                        classes="text-[11px] md:text-xs bg-[#2472db] hover:bg-[#0d5ecb] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                      ></Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

export default ManualCreateNotice;
