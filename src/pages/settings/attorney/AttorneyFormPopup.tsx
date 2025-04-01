import React from "react";
import * as yup from "yup";
import { Form, Formik } from "formik";
import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import { IAttorneyItem } from "interfaces/attorney.interface";
import { StateCode } from "utils/constants";
import { handlePostalCodeKeyDown } from "utils/helper";

const validationSchema = yup.object({
   firstName: yup
      .string()
      .max(50, "First Name Name must not exceed 50 characters")
      .required("Please enter the First Name"),
   barNumber: yup
      .string()
      .max(20, "Bar Number must not exceed 20 characters")
      .required("Please enter the Bar Number"),
   email: yup
      .string()
      .email("Please enter a valid email address")
      .required("Please enter the Email"),
   firmName: yup
      .string()
      .max(100, "Firm Name must not exceed 100 characters")
      .required("Please enter the Firm Name"),
   address: yup
      .string()
      .max(100, "Address must not exceed 100 characters")
      .required("Please enter the Address"),
   unit: yup
      .string()
      .max(10, "Unit must not exceed 10 characters")
      .nullable(), // Optional field
   city: yup
      .string()
      .max(50, "City must not exceed 50 characters")
      .required("Please enter the City"),
   state: yup
      .string()
      .max(2, "State code must not exceed 2 characters")
      .required("Please select the State"),
   zipCode: yup
      .string()
      .matches(/^\d{5}(-\d{4})?$/, "Please enter a valid Zip Code")
      .required("Please enter the Zip Code"),
});

type AttorneyFormPopupProps = {
   showPopup: boolean;
   closePopup: (shouldRefresh: string) => void;
   isEditMode: boolean;
   initialValues: IAttorneyItem;
   onSubmit: (formValues: IAttorneyItem) => void;
   showSpinner: boolean
};

const AttorneyFormPopup: React.FC<AttorneyFormPopupProps> = ({
   showPopup,
   closePopup,
   isEditMode,
   initialValues,
   onSubmit,
   showSpinner
}) => {
   return (
      <>
         {showPopup && (
            <Modal
               showModal={showPopup}
               onClose={() => closePopup("noRefresh")}
               width="max-w-3xl"
            >
               <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                  <div className="sm:flex sm:items-start">
                     <div className="text-center sm:text-left">
                        <h3
                           className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                           id="modal-title"
                        >
                           {isEditMode ? "Update" : "Add"} Attorney
                        </h3>
                     </div>
                  </div>
                  <Formik
                     initialValues={initialValues}
                     validationSchema={validationSchema}
                     // onSubmit={(values, actions) => {
                     //    onSubmit(values);
                     //    actions.setSubmitting(true);
                     //    // closePopup("refresh");
                     // }}
                onSubmit={onSubmit}
                  >
                     {(formik) => (
                        <Form className="flex flex-col">
                           <div className="grid sm:grid-cols-2 gap-2.5 md:gap-3.5">
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type="text"
                                    label={"FirstName"}
                                    name={"firstName"}
                                    autoFocus={true}
                                    placeholder={"Please enter attorney first name"}
                                 />
                              </div>
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type="text"
                                    label={"LastName"}
                                    name={"lastName"}
                                    placeholder={"Please enter attorney last name"}
                                 />
                              </div>
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type="text"
                                    label={"BarNumber"}
                                    name={"barNumber"}
                                    placeholder={"Please enter bar number"}
                                    disabled={isEditMode}
                                 />
                              </div>
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type="text"
                                    label={"Email"}
                                    name={"email"}
                                    placeholder={"Please enter email"}
                                 />
                              </div>
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type="text"
                                    label={"FirmName"}
                                    name={"firmName"}
                                    placeholder={"Please enter firm name"}
                                 />
                              </div>
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type="text"
                                    label={"Address"}
                                    name={"address"}
                                    placeholder={"Please enter address"}
                                 />
                              </div>
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type="text"
                                    label={"Unit"}
                                    name={"unit"}
                                    placeholder={"Please enter unit"}
                                 />
                              </div>
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type="text"
                                    label={"City"}
                                    name={"city"}
                                    placeholder={"Please enter city"}
                                 />
                              </div>
                              <div className="relative text-left">
                                 <FormikControl
                                    control="select"
                                    type="select"
                                    label={"State"}
                                    name={"state"}
                                    defaultOption={"Please select an option"}
                                    placeholder={"Attorney State"}
                                    options={StateCode}
                                 />
                              </div>
                              <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="text"
                                 label={"ZipCode"}
                                 name={"zipCode"}
                                 placeholder={"Enter zip code"}
                                 maxlength={5}
                                 onKeyDown={handlePostalCodeKeyDown}
                              />
                           </div>
                           </div>
                           <div className="py-2.5 flex justify-end mt-1.5">
                              <Button
                                 type="button"
                                 isRounded={false}
                                 title="Cancel"
                                 handleClick={() => closePopup("noRefresh")}
                                 classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg"
                              ></Button>
                              <Button
                                 type="submit"
                                 isRounded={false}
                                 title="Save"
                                 disabled={showSpinner}
                                 classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                              ></Button>
                           </div>
                        </Form>
                     )}
                  </Formik>
               </div>
            </Modal>
         )}
      </>
   );
};

export default AttorneyFormPopup;
