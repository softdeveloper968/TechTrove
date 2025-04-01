import React from "react";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { Field, Form, Formik } from "formik";

import Modal from "components/common/popup/PopUp";
import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";

import { ICountyFormValues, ICountyItems } from "interfaces/county.interface";
import CountyService from "services/county.service";

// Validation schema for the county model
const validationSchema = yup.object({
   countyName: yup
      .string()
      .max(50, "The county name must not exceed 50 characters")
      .required("Please enter county name"),
   stateName: yup
      .string()
      .max(2, "The state  must not exceed 50 characters")
      .required("Please select state "),
});

type CountyFormPopupProps = {
   showPopup: Boolean;
   closePopup: (shouldRefresh: string) => void;
   isEditMode: boolean;
   initialValues: ICountyItems;
   onSubmit: (formValues: ICountyFormValues) => void;
   showSpinner: Boolean;
};

const CountyFormPopup: React.FC<CountyFormPopupProps> = ({
   showPopup,
   closePopup,
   isEditMode,
   initialValues,
   onSubmit,
   showSpinner
}) => {
   const [states, setStates] = useState<ICountyItems[]>([]);
   const [isExecuting, setIsExecuting] = useState(false);

   const initialFormValues: ICountyFormValues = {
      id: initialValues.id,
      stateName: initialValues.stateName,
      countyName: initialValues.countyName,
      method: initialValues.method,
      endPoint: initialValues.endPoint,
      isMultipleAOSPdf: initialValues.isMultipleAOSPdf ? "multiple" : "single"
   };

   useEffect(() => {
      getAllStates();
   }, []);

   useEffect(() => {


   }, []);

   const getAllStates = async () => {
      try {
         let response = await CountyService.getAllStates();
         if (response.status === HttpStatusCode.Ok) {
            let api = response.data.map((item: any) => {
               return {
                  id: item.stateAbbrev,
                  value: item.stateAbbrev,
               };
            });
            setStates(api);
         }
      } finally {
      }
   };

   return (
      <>
         {showPopup && (
            <Modal
               showModal={showPopup}
               onClose={() => closePopup("noRefresh")}
               width="max-w-xl"
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
                        initialValues={initialFormValues}
                        validationSchema={validationSchema}
                        onSubmit={onSubmit}
                     >
                        {(formik) => (
                           <Form className="flex flex-col">
                              <div className="grid sm:grid-cols-2 gap-2.5 md:gap-3.5">
                                 <div className="relative">
                                    <FormikControl
                                       control="input"
                                       type="text"
                                       label={"County Name"}
                                       name={"countyName"}
                                       autoFocus={true}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="select"
                                       type="select"
                                       label={"State"}
                                       name={"stateName"}
                                       placeholder={"State"}
                                       options={states}
                                       defaultOption={"Select"}
                                       onChange={(e: any) => {
                                          formik.setFieldValue("stateName", e.target.value);
                                       }}
                                    />
                                 </div>
                                 <div className="relative">
                                    <FormikControl
                                       control="input"
                                       type="text"
                                       label={"Filing Method"}
                                       name={"method"}
                                    />
                                 </div>
                                 <div className="relative">
                                    <FormikControl
                                       control="input"
                                       type="text"
                                       label={"End Point"}
                                       name={"endPoint"}
                                    />
                                 </div>
                              </div>
                              <div className="mt-3">
                                 {/* <div className="relative">
                                    <FormikControl
                                       control="radio"
                                       label={"Preferred option for the AOS document in this county:"}
                                       name={"isMultipleAOSPdf"}
                                       value={formik.values.isMultipleAOSPdf}
                                       options={MultipleAOSPdfOption}
                                    />
                                 </div> */}
                                 <div>
                                    <div id="my-radio-group" className="text-gray-600 text-xs font-medium mb-1">Preferred option for the AOS PDF in this county:</div>
                                    <div role="group" className="flex items-center gap-2" aria-labelledby="my-radio-group">
                                       <label className="text-gray-600 text-xs font-medium flex items-center cursor-pointer">
                                          <Field className="mr-1" type="radio" name="isMultipleAOSPdf" value="single" />
                                          Single
                                       </label>
                                       <label className="text-gray-600 text-xs font-medium flex items-center cursor-pointer">
                                          <Field className="mr-1" type="radio" name="isMultipleAOSPdf" value="multiple" />
                                          Multiple
                                       </label>
                                    </div>
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
                                    disabled={showSpinner == true ? true : false}
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

export default CountyFormPopup;
