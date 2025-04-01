import React from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { Form, Formik, FormikProps } from "formik";
import { FaTimes, FaPlusCircle } from "react-icons/fa";
import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import Spinner from "components/common/spinner/Spinner";
import FileEvictionsService from "services/file-evictions.service";
import {
  ICreateFileEviction,
  IFileEvictionsItems,
} from "interfaces/file-evictions.interface";
import { CountyLists } from "utils/constants";
import { StateCode } from "utils/constants";
import { useFileEvictionsContext } from "pages/file-evictions/FileEvictionsContext";

type ManuallyFleEvictionProps = {
  manualFileEvictions: Boolean;
  handleManualFileEvictions: (value: boolean) => void;
};

// Validation schema for login model
const validationSchema = yup.object({
  // lastName: yup
  //   .string()
  //   .max(50, "The Last Name must not exceed 50 characters")
  //   .required("Please enter last name"),
  // firstName: yup
  //   .string()
  //   .max(50, "The First Name must not exceed 50 characters")
  //   .required("Please enter first name"),
  tenantUnit: yup.string().max(50, "Unit must not exceed 50 characters"),
  tenantCity: yup
    .string()
    .max(50, "The city must not exceed 50 characters")
    .required("Please enter city"),
  tenantState: yup
    .string()
    .max(2, "State Code must be of 2 characters")
    .required("Please enter state"),
  tenantZip: yup
    .string()
    .min(5, "Zip code must be 5 digits.")
    .max(5, "Zip code must be 5 digits.")
    .required("Please enter Zip code."),

  propertyZip: yup
    .string()
    .min(5, "Zip code must be 5 digits.")
    .max(5, "Zip code must be 5 digits.")
    .required("Please enter Zip code."),

  propertyCity: yup
    .string()
    .max(50, "The city must not exceed 50 characters")
    .required("Please enter city"),

  propertyPhone: yup
    .string()
    .matches(
      /^(\(\d{3}\) ?|\d{3}-)\d{3}-\d{4}$/,
      "Please enter a valid phone number"
    )
    .required("Please enter a valid phone number"),

  propertyState: yup
    .string()
    .max(2, "State Code must be of 2 characters")
    .required("Please enter state"),

  propertyAddress: yup
    .string()
    .required("Please enter address")
    .min(3, "Address must be at least 3 characters")
    .max(300, "Address must not exceed 300 characters"),
  filerBusinessName: yup
    .string()
    .max(50, "The filer business name must not exceed 50 characters")
    .required("Please enter filer business name"),
  EvictionFilerEmail: yup
    .string()
    .email("Please enter a valid Email address")
    .required("Please enter your Email")
    .max(50, "The Email must not exceed 50 characters"),
  propertyName: yup
    .string()
    .max(100, "The property name must not exceed 100 characters")
    .required("Please enter property name"),
  county: yup
    .string()
    .max(50, "The county name must not exceed 50 characters")
    .required("Please enter county name"),
  evictionDateFiled: yup
    .date()
    .required("Please enter eviction date filed")
    .typeError("Please enter a valid date"),
  evictionServiceDate: yup
    .date()
    .required("Please enter service date")
    .typeError("Please enter a valid date"),
  lastDaytoAnswer: yup
    .date()
    .required("Please enter answer by")
    .typeError("Please enter a valid date"),
  // evictionServiceMethod: yup
  //   .string()
  //   .max(50, "The service method must not exceed 50 characters")
  //   .required("Please enter service method"),
  courtDate: yup
    .date()
    .required("Please enter court date")
    .typeError("Please enter a valid date"),
  dismissalFileDate: yup
    .date()
    .required("Please enter dismissal file date")
    .typeError("Please enter a valid date"),
  writFileDate: yup
    .date()
    .required("Please enter writ file date")
    .typeError("Please enter a valid date"),
  attorneyName: yup
    .string()
    .max(50, "The attorney name must not exceed 50 characters"),
  evictionAffiantSignature: yup
    .string()
    .max(50, "The affiant signature must not exceed 50 characters")
    .required("Please enter affiant signature"),
  ownerName: yup
    .string()
    .max(50, "The Owner name  must not exceed 50 characters"),
  evictionReason: yup
    .string()
    .max(120, "The reason  must not exceed 120 characters")
    .required("Please enter reason"),
  tenantAddress: yup
    .string()
    .required("Please enter address")
    .min(3, "Address must be at least 3 characters")
    .max(300, "Address must not exceed 300 characters"),
  monthlyRent: yup
    .string()
    .test(
      "isCurrency",
      "Monthly rent must be a valid currency amount",
      (value) => {
        if (!value) return true; // Skip if undefined or empty
        const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
        return regex.test(value);
      }
    ),
   //  .test(
   //    "maxAmount",
   //    "Monthly rent must be less than or equal to $99999",
   //    (value) => {
   //      if (!value) return true; // Skip if undefined or empty
   //      const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
   //      return numericValue <= 99999;
   //    }
   //  )
   //  .required("Please enter monthly rent"),
  // monthlyRent: yup
  //   .number()
  //   .typeError("Monthly rent must be a valid number")
  //   .transform((value) => (isNaN(value) ? undefined : value)) // Transform to undefined if it's not a number
  //   .test("maxDigits", "Monthly rent must have at most 20 digits", (value) => {
  //     if (!value) return true; // Skip if undefined
  //     const stringValue = value.toString();
  //     return stringValue.length <= 20;
  //   })
  //   .required("Please enter monthly rent"),
  evictionTotalRentDue: yup.string(),
  // .typeError("Total rent due must be a valid number")
  // .transform((value) => (isNaN(value) ? undefined : value)) // Transform to undefined if it's not a number
  // .test(
  //   "maxDigits",
  //   "Total rent due  must have at most 20 digits",
  //   (value) => {
  //     if (!value) return true; // Skip if undefined
  //     const stringValue = value.toString();
  //     return stringValue.length <= 20;
  //   }
  // )
  evictionOtherFees: yup.string(),
  // .required("Please enter  eviction other fee.")
  // .typeError("Eviction other fee must be a valid number")
  // .transform((value) => (isNaN(value) ? undefined : value)) // Transform to undefined if it's not a number
  // .test(
  //   "maxDigits",
  //   "Eviction other fee must have at most 20 digits",
  //   (value) => {
  //     if (!value) return true; // Skip if undefined
  //     const stringValue = value.toString();
  //     return stringValue.length <= 20;
  //   }
  // )
  evictionAffiantIs: yup
    .string()
    .max(50, "The eviction affiant  must not exceed 50 characters")
    .required("Please enter eviction affiant "),
  evictionAffiantSignDate: yup
    .date()
    .required("Please enter eviction affiant sign date")
    .typeError("Please enter a eviction affiant sign date"),
  tenants: yup.array().of(
    yup.object().shape({
      firstName: yup.string().required("First name is required"),
      lastName: yup.string().required("Last name is required"),
    })
  ),
});

// ManuallyFleEviction component serves as the main entry point for the File Evictions page
const ManualCreateFileEvictions = (props: ManuallyFleEvictionProps) => {
  // toggle pop up
  const [isPopupOpen, setIsPopupOpen] = useState(props.manualFileEvictions);
  // toggle spinner
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [filteredRecords, setFilteredRecords] = useState<IFileEvictionsItems[]>(
    []
  );
  const {
    getFileEvictions,
    setSelectedFileEvictionId,
    setFileEvictions,
    fileEvictions,
    selectedFileEvictionId,
  } = useFileEvictionsContext();
  const closePopup = () => {
    setIsPopupOpen(false);
    props.handleManualFileEvictions(false);
  };

  useEffect(() => {
    setFilteredRecords(
      fileEvictions.items.filter((item) =>
        selectedFileEvictionId.includes(item.id || "")
      )
    );
  }, [fileEvictions.items, selectedFileEvictionId]);

  const resetSelectedRows = () => {
    setFilteredRecords([]);
    setSelectedFileEvictionId([]);
    setFileEvictions((prev) => {
      return {
        ...prev,
        items: prev.items.map((item) => ({
          ...item,
          isChecked: false,
        })),
      };
    });
  };

  // FileEvictions form initial values
  const initialValues: ICreateFileEviction = {
    // caseNo: "",
    // propertyName: "",
    // county: "",
    // tenantAddress: "",
    // tenantUnit: "",
    // tenantCity: "",
    // tenantState: "",
    // tenantZip: "",
    // propertyZip: "",
    // propertyCity: "",
    // propertyPhone: "",
    // propertyState: "",
    // propertyAddress: "",
    // filerBusinessName: "",
    // EvictionFilerEmail: "",
    // evictionDateFiled: null,
    // evictionServiceDate: null,
    // lastDaytoAnswer: null,
    // // evictionServiceMethod: "",
    // courtDate: null,
    // writFileDate: null,
    // attorneyName: "",
    // barNo: "",
    // attorneyBarNo: "",
    // evictionAffiantSignature: "",
    // dismissalFileDate: null,
    // evictionTotalRentDue: "",
    // monthlyRent: 0,
    // ownerName: "",
    // reason: "",
    // // evictionReason: "",
    // evictionOtherFees: "",
    // evictionAffiantIs: "",
    // evictionAffiantSignDate: new Date(),
    // stateCourt: "",
    // companyName: "",

    tenantNames: [],

    county: "",
    // tenant1Last: "",
    // tenant1First: "",
    // tenant1MI: "",
    // tenant2Last: "",
    // tenant2First: "",
    // tenant2MI: "",
    // tenant3Last: "",
    // tenant3First: "",
    // tenant3MI: "",
    // tenant4Last: "",
    // tenant4First: "",
    // tenant4MI: "",
    // tenant5Last: "",
    // tenant5First: "",
    // tenant5MI: "",
    andAllOtherTenants: "",
    tenantAddress: "",
    tenantUnit: "",
    tenantCity: "",
    tenantState: "",
    tenantZip: "",
    reason: "",
    evictionTotalRentDue: "",
    monthlyRent: 0,
    allMonths: "",
    evictionOtherFees: "",
    ownerName: "",
    propertyName: "",
    propertyPhone: "",
    propertyEmail: "",
    propertyAddress: "",
    propertyCity: "",
    propertyState: "",
    propertyZip: "",
    attorneyName: "",
    attorneyBarNo: "",
    attorneyEmail: "",
    filerBusinessName: "",
    evictionAffiantIs: "",
    filerPhone: "",
    filerEmail: "",
    processServer: "",
    processServerEmail: "",
    expedited: "",
    stateCourt: "",
    clientReferenceId: "",
    processServerCompany: "",
    clientId:""
  };
  /**
   * Handles the creation of file eictions based on the provided form values.
   * Displays a success toast message upon successful creation.
   * Closes the popup on success.
   *
   * @param {ICreateFileEviction} formValues - The form values for creating a file eictions.
   */
  const handleFileEvictions = async (formValues: ICreateFileEviction) => {
    try {
      // if (formValues.tenants && formValues.tenants.length > 0) {
      //   formValues.tenants.forEach((tenant, index) => {
      //     (formValues as any)[`tenant${index + 1}FirstName`] = tenant.firstName;
      //     (formValues as any)[`tenant${index + 1}MiddleName`] =
      //       tenant.middleName || "";
      //     (formValues as any)[`tenant${index + 1}LastName`] = tenant.lastName;
      //   });
      // }
      if (formValues.tenants && formValues.tenants.length > 0) {
        formValues.tenants.forEach((tenant, index) => {
          (formValues as any)[`tenant${index + 1}First`] = tenant.firstName;
          (formValues as any)[`tenant${index + 1}MI`] = tenant.middleName || "";
          (formValues as any)[`tenant${index + 1}Last`] = tenant.lastName;
        });
      }
      formValues.tenantZip = formValues.tenantZip.toString();
      formValues.propertyZip = formValues.propertyZip.toString();
      // Destructure the object and rename 'tenants' to 'tenant1'
      const { tenants, ...newObject } = formValues;
      const fileEvictions = [newObject];
      // Create an array with a single file evictions object
      // const fileEvictions = [formValues];
      // display spinner while api is executing
      setShowSpinner(true);

      // // Call the FileEvictionsService to create a file evictions
      const response = await FileEvictionsService.createFileEviction(
        fileEvictions
      );
      // Check if the request was successful (status code 200)
      if (response.status === HttpStatusCode.Ok) {
        // Display a success toast message
        toast.success("Successfully Added");
        getFileEvictions(1, 100,true);
        setSelectedFileEvictionId([]);
        // Close the popup
        closePopup();
        resetSelectedRows();
      } else {
        // Handle other status codes if needed
        // For example, display an error message toast
        toast.error("Failed to create file eviction");
      }
    } finally {
      // hide spinner
      setShowSpinner(false);
    }
  };

  // Function to handle input change
  const handleInputChange = (
    fieldName: string,
    value: string,
    formik: FormikProps<ICreateFileEviction>
  ) => {
    // Update the form data model using Formik's setFieldValue
    if (fieldName == "evictionOtherFee")
      formik.setFieldValue(`${fieldName}`, value.toString());
    else formik.setFieldValue(`${fieldName}`, value);
  };

  // Function to handle clicking the cross icon to remove an input field
  const handleCrossClick = (
    _index: number,
    formik: FormikProps<ICreateFileEviction>
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

  // handle plus icon click
  const handlePlusClick = (formik: FormikProps<ICreateFileEviction>) => {
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

  return (
    <>
      {isPopupOpen && (
        <Modal
          showModal={isPopupOpen}
          onClose={() => {
            closePopup();
            resetSelectedRows();
          }}
          width="max-w-5xl"
        >
          {showSpinner && <Spinner></Spinner>}

          <div className="bg-white px-4 pb-4 pt-5 sm:p-5 sm:pb-4 rounded-lg">
            <div className="sm:flex sm:items-start">
              <div className="my-2.5 text-center md:my-0 sm:text-left">
                <h3
                  className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                  id="modal-title"
                >
                  Create File Eviction
                </h3>
              </div>
            </div>
            <div className="relative pt-1 flex-auto overflow-y-auto">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleFileEvictions}
              >
                {(formik) => (
                  <Form className="flex flex-col">
                    {formik.values.tenants &&
                      formik.values.tenants.map((value, index) => (
                        <>
                          <div className="pb-1">
                            <b>Tenant {index + 1}</b>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 lg:gap-4 mb-3 md:mb-4">
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
                              <label className="hidden lg:block">&nbsp;</label>
                              <div className="flex items-center lg:h-[46px]">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Property Name"}
                          name={"propertyName"}
                          placeholder={"Property"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="select"
                          type="select"
                          label={"County"}
                          name={"county"}
                          defaultOption={"Please select"}
                          placeholder={"County"}
                          options={CountyLists}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Tenant Address"}
                          name={"tenantAddress"}
                          placeholder={"Address"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Tenant Unit"}
                          name={"tenantUnit"}
                          placeholder={"Unit"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Tenant City"}
                          name={"tenantCity"}
                          placeholder={"City"}
                        />
                      </div>
                      {/* <div className="relative text-left w-20">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"State Code"}
                          name={"state"}
                          placeholder={"State"}
                        />
                      </div> */}
                      {/* max-w-[120px] */}
                      <div className="relative text-left">
                        <FormikControl
                          control="select"
                          type="select"
                          label={"Tenant State"}
                          name={"tenantState"}
                          defaultOption={"Please select"}
                          placeholder={"State"}
                          options={StateCode}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="number"
                          label={"Tenant Zip"}
                          name={"tenantZip"}
                          placeholder={"Zip"}
                          maxlength={5}
                          // onKeyDown={handlePostalCodeKeyDown}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="number"
                          label={"Property Zip"}
                          name={"propertyZip"}
                          placeholder={"Zip"}
                          maxlength={5}
                          // onKeyDown={handlePostalCodeKeyDown}
                        />
                      </div>

                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Property City"}
                          name={"propertyCity"}
                          placeholder={"City"}
                        />
                      </div>

                      <div className="relative text-left">
                        <label className="text-gray-600 text-[11px] md:text-xs font-medium">
                          Property Phone
                        </label>
                        <FormikControl
                          control="maskedInput"
                          type="text"
                          label={"Property Phone"}
                          name={"propertyPhone"}
                          placeholder={"Phone"}
                        />
                      </div>

                      <div className="relative text-left">
                        <FormikControl
                          control="select"
                          type="select"
                          label={"Property State"}
                          name={"propertyState"}
                          defaultOption={"Please select"}
                          placeholder={"State"}
                          options={StateCode}
                        />
                      </div>

                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Property Address"}
                          name={"propertyAddress"}
                          placeholder={"Address"}
                        />
                      </div>

                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Filer Business Name"}
                          name={"filerBusinessName"}
                          placeholder={"Filer Business Name"}
                        />
                      </div>

                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type={"text"}
                          label={"Eviction Filer Email"}
                          name={"EvictionFilerEmail"}
                          placeholder={"Enter Email"}
                        />
                      </div>

                      <div className="relative text-left">
                        <FormikControl
                          control="date"
                          type="date"
                          label={"Date Filed"}
                          name={"evictionDateFiled"}
                          placeholder={"Date Filed"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="date"
                          type="date"
                          label={"Date Served"}
                          name={"evictionServiceDate"}
                          placeholder={"Service Date"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="date"
                          type="date"
                          label={"Answer By"}
                          name={"lastDaytoAnswer"}
                          placeholder={"Last Day to Answer"}
                        />
                      </div>
                      {/* <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Service Method"}
                          name={"evictionServiceMethod"}
                          placeholder={"Service Method"}
                        />
                      </div> */}
                      <div className="relative text-left">
                        <FormikControl
                          control="date"
                          type="date"
                          label={"Court Date"}
                          name={"courtDate"}
                          placeholder={"Court Date"}
                        />
                      </div>
                      <div className="relative">
                        <FormikControl
                          control="date"
                          type="date"
                          label={"Dismissal File Date"}
                          name={"dismissalFileDate"}
                          placeholder={"Dismissal File Date"}
                        />
                      </div>
                      <div className="relative">
                        <FormikControl
                          control="date"
                          type="date"
                          label={"Writ File Date"}
                          name={"writFileDate"}
                          placeholder={"Writ File Date"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Attorney Name"}
                          name={"attorneyName"}
                          placeholder={"Attorney Name"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Attorney Bar No"}
                          name={"barNo"}
                          placeholder={"Attorney Bar No"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Owner Name"}
                          name={"ownerName"}
                          placeholder={"Owner Name"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Reason"}
                          name={"evictionReason"}
                          placeholder={"Reason"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="number"
                          type="number"
                          label={"Monthly Rent"}
                          name={"monthlyRent"}
                          placeholder={"Monthly Rent"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Total Rent Due"}
                          name={"evictionTotalRentDue"}
                          placeholder={"Total Rent Due"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Eviction Other Fee"}
                          name={"evictionOtherFees"}
                          // onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          //   handleInputChange(
                          //     `evictionOtherFee`,
                          //     e.target.value,
                          //     formik
                          //   )
                          // }
                          placeholder={"Eviction Other Fee"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Eviction Affiant Is"}
                          name={"evictionAffiantIs"}
                          placeholder={"Eviction Affiant Is"}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      <div className="relative text-left">
                        <FormikControl
                          control="date"
                          type="date"
                          label={"Eviction Affiant Sign Date"}
                          name={"evictionAffiantSignDate"}
                          placeholder={"Eviction Affiant Sign Date"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"State Court"}
                          name={"stateCourt"}
                          placeholder={"State Court"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Eviction Affiant Signature"}
                          name={"evictionAffiantSignature"}
                          placeholder={"Affiant Signature"}
                        />
                      </div>
                    </div>
                    <div className="py-2.5 flex justify-end mt-1.5">
                      <Button
                        type="button"
                        isRounded={false}
                        title="Cancel"
                        handleClick={closePopup}
                        classes="text-sm bg-white	inline-flex justify-center items-center rounded-lg text-md font-semibold py-2.5 md:py-3 px-5 md:px-6  mr-2  ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                      ></Button>
                      <Button
                        type="submit"
                        isRounded={false}
                        title="Create"
                        classes="text-sm bg-[#2472db] hover:bg-[#0d5ecb] inline-flex justify-center items-center rounded-lg text-md font-semibold py-2.5 md:py-3 px-5 md:px-6 text-white"
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

export default ManualCreateFileEvictions;
