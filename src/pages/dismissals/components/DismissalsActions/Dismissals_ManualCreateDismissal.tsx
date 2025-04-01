import React from "react";
import { useState } from "react";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { toast } from "react-toastify";
import { HttpStatusCode } from "axios";
import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import Spinner from "components/common/spinner/Spinner";
import DismissalsService from "services/dismissals.service";
import { ICreateDismissals } from "interfaces/dismissals.interface";
import { CountyLists } from "utils/constants";
import { handlePostalCodeKeyDown } from "utils/helper";

type ManuallyDismissalsProps = {
  manualDismissals: Boolean;
  handleManualDismissals: (value: boolean) => void;
};

// Validation schema for dismissals model
const validationSchema = yup.object({
  dismissalPDFs: yup
    .string()
    .max(50, "The dismissalPDFs must not exceed 50 characters.")
    .required("Please enter dismissalPDFs."),
  lastName: yup
    .string()
    .max(50, "The Last Name must not exceed 50 characters.")
    .required("Please enter last name."),
  firstName: yup
    .string()
    .max(50, "The First Name must not exceed 50 characters.")
    .required("Please enter first name."),
  unit: yup
    .string()
    .max(50, "Unit must not exceed 50 characters.")
    .required("Please enter unit."),
  city: yup
    .string()
    .max(100, "The city must not exceed 100 characters.")
    .required("Please enter city."),
  state: yup
    .string()
    .max(50, "The state must not exceed 50 characters.")
    .required("Please enter state."),
  zip: yup
    .string()
    .required("Please enter Zip code.")
    .min(5, "Zip code must be 5 digits.")
    .max(5, "Zip code must be 5 digits."),
  address: yup
    .string()
    .required("Please enter address")
    .min(3, "Address must be at least 3 characters")
    .max(300, "Address must not exceed 300 characters"),
  caseNo: yup.string().required("Please enter Case No."),
  propertyName: yup
    .string()
    .max(100, "The property name must not exceed 100 characters.")
    .required("Please enter property name."),
  county: yup
    .string()
    .max(50, "The county name must not exceed 50 characters.")
    .required("Please enter county name."),
  dismissalFileDate: yup
    .date()
    .required("Please enter dismissal file date.")
    .typeError("Please enter a valid date."),
  dismissalAffiantSignature: yup
    .string()
    .max(50, "The Dismissal Affiant Signature must not exceed 50 characters.")
    .required("Please enter Dismissal Affiant Signature."),
});

// ManuallyDimissals component serves as the main entry point for the Dismissals page
const ManualCreateDismissals = (props: ManuallyDismissalsProps) => {
  // toggle pop up
  const [isPopupOpen, setIsPopupOpen] = useState(props.manualDismissals);
  // toggle spinner
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  const closePopup = () => {
    setIsPopupOpen(false);
    props.handleManualDismissals(false);
  };

  // Dismissals form initial values
  const initialValues: ICreateDismissals = {
    caseNo: "",
    documents: "",
    propertyName: "",
    county: "",
    firstName: "",
    lastName: "",
    unit: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    filed: null,
    signedBy: "",
    evictionAffiantSignature:"",
    companyName:"",
    tenantNames: [],
    andAllOtherOccupants: "",
    crmInfo:{
      id: "",
      crmName: "",
      status: "",
      statusDate: null,
    }
  };
  /**
   * Handles the creation of dismissals based on the provided form values.
   * Displays a success toast message upon successful creation.
   * Closes the popup on success.
   *
   * @param {ICreateDismissals} formValues - The form values for creating a Dismissal.
   */
  const handleDismissals = async (formValues: ICreateDismissals) => {
    try {
      // Create an array with a single dismissals object
      const dismissal = [formValues];
      // display spinner while api is executing
      setShowSpinner(true);
      //  Call the DismissalsService to create a Dismissal
      const response = await DismissalsService.createDismissals(dismissal);
      // Check if the request was successful (status code 200)
      if (response.status === HttpStatusCode.Ok) {
        // Display a success toast message
        toast.success("Successfully Added");
        // Close the popup
        closePopup();
      } else {
        // Handle other status codes if needed
        // For example, display an error message toast
        toast.error("Failed to create Dismissal");
      }
    } finally {
      // hide spinner
      setShowSpinner(false);
    }
  };

  return (
    <>
      {isPopupOpen && (
        <Modal showModal={isPopupOpen} onClose={closePopup} width="max-w-5xl">
          {showSpinner && <Spinner></Spinner>}

          <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
            <div className="sm:flex sm:items-start">
              <div className="text-center sm:text-left">
                <h3
                  className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                  id="modal-title"
                >
                  Create Dismissal
                </h3>
              </div>
            </div>
            <div className="relative pt-1 md:pt-1.5 flex-auto">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleDismissals}
              >
                {(formik) => (
                  <Form className="flex flex-col">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 md:gap-3.5">
                      <div className="relative">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Case No"}
                          name={"caseNo"}
                          placeholder={"Case No"}
                        />
                      </div>
                      <div className="relative">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"DismissalPDFs"}
                          name={"dismissalPDFs"}
                          placeholder={"DismissalPDFs"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Property"}
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
                          label={"First Name"}
                          name={"firstName"}
                          placeholder={"First Name"}
                        />
                      </div>

                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Last Name"}
                          name={"lastName"}
                          placeholder={"Last Name"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Unit"}
                          name={"unit"}
                          placeholder={"Unit"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Address"}
                          name={"address"}
                          placeholder={"Address"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"City"}
                          name={"city"}
                          placeholder={"City"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"State"}
                          name={"state"}
                          placeholder={"State"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Zip Code"}
                          name={"zip"}
                          placeholder={"Zip Code"}
                          maxlength={5}
                          onKeyDown={handlePostalCodeKeyDown}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="date"
                          type="date"
                          label={"Dismissal File Date"}
                          name={"dismissalFileDate"}
                          placeholder={"Dismissal File Date"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Dismissal Affiant Signature"}
                          name={"dismissalAffiantSignature"}
                          placeholder={"Dismissal Affiant Signature"}
                        />
                      </div>
                    </div>
                    <div className="py-2.5 flex justify-end mt-1.5">
                      <Button
                        type="button"
                        isRounded={false}
                        title="Cancel"
                        handleClick={closePopup}
                        classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg"
                      ></Button>
                      <Button
                        type="submit"
                        isRounded={false}
                        title="Create"
                        classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
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

export default ManualCreateDismissals;
