import React from "react";
import { useState } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { Form, Formik } from "formik";
import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import Spinner from "components/common/spinner/Spinner";
import WritsOfPossessionService from "services/writs-of-possesson.service";
import { ICreateWritsOfPossession } from "interfaces/writs-of-possession.interface";
import { CountyLists } from "utils/constants";
import { handlePostalCodeKeyDown } from "utils/helper";

type ManuallyWritsOfPossessionProps = {
   manualWritsOfPossession: Boolean;
   handleManualWritsOfPossession: (value: boolean) => void;
};

// Validation schema for WritsOfPossession model
const validationSchema = yup.object({
   WritPDFs: yup
      .string()
      .max(50, "The WritPDFs must not exceed 50 characters.")
      .required("Please enter WritPDFs."),
   lastName: yup
      .string()
      .max(50, "The Last Name must not exceed 50 characters.")
      .required("Please enter last name."),
   firstName: yup
      .string()
      .max(50, "The First Name must not exceed 50 characters.")
      .required("Please enter first name."),
   streetNo: yup
      .string()
      .max(50, "The StreetNo must not exceed 50 characters.")
      .required("Please enter street no."),
   unit: yup
      .string()
      .max(50, "Unit must not exceed 50 characters.")
      .required("Please enter unit."),
   city: yup
      .string()
      .max(50, "The city must not exceed 50 characters.")
      .required("Please enter city."),
   state: yup
      .string()
      .max(2, "State Code must be of 2 characters.")
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
   evictionDateFiled: yup
      .date()
      .required("Please enter eviction date filed.")
      .typeError("Please enter a valid date."),
   evictionServiceDate: yup
      .date()
      .required("Please enter service date.")
      .typeError("Please enter a valid date."),
   lastDaytoAnswer: yup
      .date()
      .required("Please enter answer by.")
      .typeError("Please enter a valid date."),
   writLaborName: yup
      .string()
      .max(50, "The Writ Labor Name must not exceed 50 characters.")
      .required("Please enter service method."),
   courtDate: yup
      .date()
      .required("Please enter court date.")
      .typeError("Please enter a valid date."),
   dismissalFileDate: yup
      .date()
      .required("Please enter dismissal file date.")
      .typeError("Please enter a valid date."),
   writFileDate: yup
      .date()
      .required("Please enter writ file date.")
      .typeError("Please enter a valid date."),
   writAffiantSignature: yup
      .string()
      .max(50, "The Writ Affiant Signature must not exceed 50 characters.")
      .required("Please enter Writ Affiant Signature."),
   amended: yup
      .string()
      .max(50, "The Amended must not exceed 50 characters.")
      .required("Please enter Amended."),
});

// ManuallyWritsOfPossession component serves as the main entry point for the WritsOfPossession page
const ManualCreateWritsOfPossession = (
   props: ManuallyWritsOfPossessionProps
) => {
   // toggle pop up
   const [isPopupOpen, setIsPopupOpen] = useState(props.manualWritsOfPossession);
   // toggle spinner
   const [showSpinner, setShowSpinner] = useState<boolean>(false);

   const closePopup = () => {
      setIsPopupOpen(false);
      props.handleManualWritsOfPossession(false);
   };

   // WritsOfPossession form initial values
   const initialValues: ICreateWritsOfPossession = {
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
      dateFiled: null,
      writLabor: "",
      amended: "",
      answerBy: "",
      dateServed: "",
      evictionAffiantSignature: "",
      signedBy: "",
      companyName: "",
      tenantNames: [],
      andAllOtherOccupants: "",
      reason: "",
      writOrderDate: null,
      paymentAmountOwned: null,
      paymentDueOn: null,
      writComment: "",
      hasSSN: false,
      writLaborId: "",
      writApplicantIs: "",
      writApplicantPhone: "",
      isCorporation: false,
      documentsPdf: [],
      versionNumber: 0
   };
   /**
    * Handles the creation of writs of possession based on the provided form values.
    * Displays a success toast message upon successful creation.
    * Closes the popup on success.
    *
    * @param {ICreateWritsOfPossession} formValues - The form values for creating a writs of possession.
    */
   const handleWritsOfPossession = async (
      formValues: ICreateWritsOfPossession
   ) => {
      try {
         // Create an array with a single writs of possession object
         const writsOfPossession = [formValues];
         // display spinner while api is executing
         setShowSpinner(true);
         //  Call the WritsOfPossessionService to create a write of possession
         const response = await WritsOfPossessionService.createWritsOfPossession(
            writsOfPossession
         );
         // Check if the request was successful (status code 200)
         if (response.status === HttpStatusCode.Ok) {
            // Display a success toast message
            toast.success("Successfully Added");
            // Close the popup
            closePopup();
         } else {
            // Handle other status codes if needed
            // For example, display an error message toast
            toast.error("Failed to create writs of possession");
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
                           className="leading-5 text-gray-900 text-[16px] md:text-xl"
                           id="modal-title"
                        >
                           Create Writs Of Possession
                        </h3>
                     </div>
                  </div>
                  <div className="relative pt-1 md:pt-1.5 flex-auto">
                     <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleWritsOfPossession}
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
                                       label={"WritPDFs"}
                                       name={"WritPDFs"}
                                       placeholder={"WritPDFs"}
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
                                       label={"Date Filed"}
                                       name={"evictionDateFiled"}
                                       placeholder={"Date Filed"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="date"
                                       type="date"
                                       label={"Date served"}
                                       name={"evictionServiceDate"}
                                       placeholder={"Service Date"}
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
                                       label={"Writ File Date"}
                                       name={"writFileDate"}
                                       placeholder={"Writ File Date"}
                                    />
                                 </div>

                                 <div className="relative text-left">
                                    <FormikControl
                                       control="input"
                                       type="text"
                                       label={"Writ Labor Name"}
                                       name={"writLaborName"}
                                       placeholder={"writ Labor Name"}
                                    />
                                 </div>

                                 <div className="relative text-left">
                                    <FormikControl
                                       control="date"
                                       type="text"
                                       label={"Writ Affiant Signature"}
                                       name={"writAffiantSignature"}
                                       placeholder={"Writ Affiant Signature"}
                                    />
                                 </div>
                                 <div className="relative">
                                    <FormikControl
                                       control="date"
                                       type="date"
                                       label={"Amended"}
                                       name={"amended"}
                                       placeholder={"Amended"}
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

export default ManualCreateWritsOfPossession;
