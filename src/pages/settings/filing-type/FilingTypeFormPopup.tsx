import React from "react";
import * as yup from "yup";
import { Form, Formik } from "formik";
import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import { IFilingTypeItem } from "interfaces/filing-type.interface";

const validationSchema = yup.object({
   name: yup
      .string()
      .max(50, "Filing name must not exceed 50 characters")
      .required("Please enter filing name"),
});

type FilingTypeFormPopupProps = {
   showPopup: boolean;
   closePopup: (shouldRefresh: string) => void;
   isEditMode: boolean;
   initialValues: IFilingTypeItem;
   onSubmit: (formValues: IFilingTypeItem) => void;
   showSpinner: boolean;
};

const FilingTypeFormPopup: React.FC<FilingTypeFormPopupProps> = ({
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
               width="max-w-md"
            >
               <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                  <div className="sm:flex sm:items-start">
                     <div className="text-center sm:text-left">
                        <h3
                           className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                           id="modal-title"
                        >
                           {isEditMode ? "Edit" : "Create"}
                        </h3>
                     </div>
                  </div>
                  <div className="relative pt-1 md:pt-1.5 flex-auto">
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
                              <div className="grid sm:grid-cols-1 gap-2.5 md:gap-3.5">
                                 <div className="relative">
                                    <FormikControl
                                       control="input"
                                       type="text"
                                       label={"Filing Name"}
                                       name={"name"}
                                       autoFocus={true}
                                       placeholder={"Please enter filing name"}
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
               </div>
            </Modal>
         )}
      </>
   );
};

export default FilingTypeFormPopup;
