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

import AmendmentsService from "services/amendments.service";
import { ICreateAmendments } from "interfaces/amendments.interface";
import { CountyLists } from "utils/constants";
import { handlePostalCodeKeyDown } from "utils/helper";
import vm from "utils/validationMessages";

type ManuallyAmendmentsProps = {
  manualAmendments: Boolean;
  handleManualAmendments: (value: boolean) => void;
};
// Validation schema for amendments model
const validationSchema = yup.object({
  lastName: yup
    .string()
    .max(50, vm.lastName.max)
    .required(vm.lastName.required),
  firstName: yup
    .string()
    .max(50, vm.firstName.max)
    .required(vm.firstName.required),
  streetNo: yup
    .string()
    .max(50, vm.streetNo.max)
    .required(vm.streetNo.required),
  unit: yup
    .string()
    .max(50, vm.unit.max)
    .required(vm.unit.required),
  city: yup
    .string()
    .max(50, vm.city.max)
    .required(vm.city.required),
  state: yup
    .string()
    .max(50, vm.state.max)
    .required(vm.state.required),
  zip: yup
    .string()
    .required(vm.zip.required)
    .min(5, vm.zip.min)
    .max(5, vm.zip.max),
  address: yup
    .string()
    .required(vm.address.required)
    .min(3, vm.address.min)
    .max(300, vm.address.max),
  caseNo: yup.string().required(vm.caseNo.required),
  propertyName: yup
    .string()
    .max(100, vm.propertyName.max)
    .required(vm.propertyName.required),
  county: yup
    .string()
    .max(50, vm.county.max)
    .required(vm.county.required),
  evictionDateFiled: yup
    .date()
    .required(vm.evictionDateFiled.required)
    .typeError(vm.evictionDateFiled.typeError),
  evictionServiceDate: yup
    .date()
    .required(vm.evictionServiceDate.required)
    .typeError(vm.evictionServiceDate.typeError),
  lastDaytoAnswer: yup
    .date()
    .required(vm.lastDaytoAnswer.required)
    .typeError(vm.lastDaytoAnswer.typeError),
  courtDate: yup
    .date()
    .required(vm.courtDate.required)
    .typeError(vm.courtDate.typeError),
  dismissalFileDate: yup
    .date()
    .required(vm.dismissalFileDate.required)
    .typeError(vm.dismissalFileDate.typeError),
  writFileDate: yup
    .date()
    .required(vm.writFileDate.required)
    .typeError(vm.writFileDate.typeError),
  amendedDate: yup
    .date()
    .required(vm.amendedDate.required)
    .typeError(vm.amendedDate.typeError),
  amendedBy: yup
    .string()
    .max(50, vm.amendedBy.max)
    .required(vm.amendedBy.required),
  evictionAffiantSignature: yup
    .string()
    .max(50, vm.evictionAffiantSignature.max)
    .required(vm.evictionAffiantSignature.required),
  attorneyName: yup
    .string()
    .max(50, vm.attorneyName.max)
    .required(vm.attorneyName.required),
  evictionServiceMethod: yup
    .string()
    .max(50, vm.evictionServiceMethod.max)
    .required(vm.evictionServiceMethod.required),
  amendmentAffiantSignature: yup
    .string()
    .max(50, vm.amendmentAffiantSignature.max)
    .required(vm.amendmentAffiantSignature.required),
});

// ManuallyAmendments component serves as the main entry point for the Amendments page
const ManualCreateAmendments = (props: ManuallyAmendmentsProps) => {
  // toggle pop up
  const [isPopupOpen, setIsPopupOpen] = useState(props.manualAmendments);
  // toggle spinner
  const [showSpinner, setShowSpinner] = useState<boolean>(false);

  const closePopup = () => {
    setIsPopupOpen(false);
    props.handleManualAmendments(false);
  };

  // Amendments form initial values
  const initialValues: ICreateAmendments = {
     caseNo: "",
     propertyName: "",
     county: "",
    //  firstName: "",
    //  middleName: "",
    //  lastName: "",
     unit: "",
     //streetNo: "",
     address: "",
     city: "",
     state: "",
     zip: "",
     evictionDateFiled: null,
     evictionServiceDate: null,
     lastDaytoAnswer: null,
     evictionServiceMethod: "",
     courtDate: null,
     dismissalFileDate: null,
    writFileDate: null,
     attorneyName: "",
     evictionAffiantSignature: "",
     amendedBy: "",
     amendmentAffiantSignature: "",
     amendedDate: null,
     //companyName: "",
     ownerName: "",
     monthlyRent: "",
     totalRent: "",
     evictionAffiantIs: "",
     tenantNames: [],
     andAllOtherOccupants: "",
     versionNumber: 0
  };
  /**
   * Handles the creation of amendments based on the provided form values.
   * Displays a success toast message upon successful creation.
   * Closes the popup on success.
   *
   * @param {ICreateAmendments} formValues - The form values for creating a Amendments.
   */
  const handleManualAmendments = async (formValues: ICreateAmendments) => {
    try {
      // Create an array with a single amendments object
      const amendments = [formValues];
      // display spinner while api is executing
      setShowSpinner(true);
      //  Call the AmendmentsService to create a Amendments
      const response = await AmendmentsService.createAmendments(amendments);
      // Check if the request was successful (status code 200)
      if (response.status === HttpStatusCode.Ok) {
        // Display a success toast message
        toast.success("Successfully Added");
        // Close the popup
        closePopup();
      } else {
        // Handle other status codes if needed
        // For example, display an error message toast
        toast.error("Failed to create Amendments");
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
                  Create Amendments
                </h3>
              </div>
            </div>
            <div className="relative pt-1 md:pt-1.5 flex-auto">
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleManualAmendments}
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
                          label={"Street No"}
                          name={"streetNo"}
                          placeholder={"Street No"}
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
                          label={"Eviction Date Filed"}
                          name={"evictionDateFiled"}
                          placeholder={"Eviction Date Filed"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="date"
                          type="date"
                          label={"Eviction Service Date"}
                          name={"evictionServiceDate"}
                          placeholder={"Eviction Date Filed"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="date"
                          type="date"
                          label={"Eviction Last Day to Answer"}
                          name={"lastDaytoAnswer"}
                          placeholder={"Eviction Last Day to Answer"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="date"
                          type="date"
                          label={"Court Date"}
                          name={"courtDate"}
                          placeholder={"Court Date"}
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
                          control="date"
                          type="date"
                          label={"Writ File Date"}
                          name={"writFileDate"}
                          placeholder={"Writ File Date"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="date"
                          type="date"
                          label={"Amended Date"}
                          name={"amendedDate"}
                          placeholder={"Amended Date"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Amended By"}
                          name={"amendedBy"}
                          placeholder={"Amended By"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Eviction Affiant Signature"}
                          name={"evictionAffiantSignature"}
                          placeholder={"Eviction Affiant Signature"}
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
                          label={"Eviction Service Method"}
                          name={"evictionServiceMethod"}
                          placeholder={"Eviction Service Method"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Amendment Affiant Signature"}
                          name={"amendmentAffiantSignature"}
                          placeholder={"Amendment Affiant Signature"}
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

export default ManualCreateAmendments;
