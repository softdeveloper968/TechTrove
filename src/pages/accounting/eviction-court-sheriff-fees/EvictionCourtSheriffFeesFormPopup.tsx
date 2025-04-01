import React, { useEffect, useState } from "react";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import vm from "utils/validationMessages";
import CountyService from "services/county.service";
import CourtService from "services/court.service";
import { ICourtItems } from "interfaces/court.interface";
import { ICountyItems } from "interfaces/county.interface";
import { IEvictionCourtShariffFeeItems } from "interfaces/eviction-court-shariff-fees.interface";

// Validation schema for the county model
const validationSchema = yup.object().shape({
   countyId: yup
      .number()
      .required(vm.countyName.required)
      .min(0)
      .test(vm.countyName.test, vm.countyName.required, (value) => value !== 0),
   courtId: yup
      .number()
      .required(vm.court.required)
      .min(0)
      .test(vm.court.test, vm.court.required, (value) => value !== 0),
   // poevService1stTenant: yup
   //    .number()
   //    .required(vm.basicRequired.required),
   // poevService2ndTenant: yup
   //    .number()
   //    .required(vm.basicRequired.required),
   // poevService3rdTenant: yup
   //    .number()
   //    .required(vm.basicRequired.required),
   // poevService4thTenant: yup
   //    .number()
   //    .required(vm.basicRequired.required),
   // poevService5thTenant: yup
   //    .number()
   //    .required(vm.basicRequired.required),
   // poevServiceAAOTenant: yup
   //    .number()
   //    .required(vm.basicRequired.required),
   // evictionCourtTransAmount: yup
   //    .number()
   //    .required(vm.basicRequired.required),
   // aosCourtTransAmount: yup
   //    .number()
   //    .required(vm.basicRequired.required),
   // addtlDocCourtTransAmount: yup
   //    .number()
   //    .required(vm.basicRequired.required),
   // dismissalCourtTransAmount: yup
   //    .number()
   //    .required(vm.basicRequired.required),
   // amendmentCourtTransAmount: yup
   //    .number()
   //    .required(vm.basicRequired.required),
   // answerCourtTransAmount: yup
   //    .number()
   //    .required(vm.basicRequired.required),
   // writCourtTransAmount: yup
   //    .number()
   //    .required(vm.basicRequired.required),
   // powrService: yup
   //    .number()
   //    .required(vm.basicRequired.required),
   // pogmService1stTime: yup
   //    .number()
   //    .required(vm.basicRequired.required),
   // pogmService2ndTime: yup
   //    .number()
   //    .required(vm.basicRequired.required),
});

type EvictionCourtSheriffFeesFormPopupProps = {
   showPopup: Boolean;
   closePopup: (shouldRefresh: string) => void;
   isEditMode: boolean;
   initialValues: IEvictionCourtShariffFeeItems;
   onSubmit: (formValues: IEvictionCourtShariffFeeItems) => void;
   showSpinner: Boolean;
};

const EvictionCourtSheriffFeesFormPopupProps: React.FC<EvictionCourtSheriffFeesFormPopupProps> = ({ showPopup, closePopup, isEditMode, initialValues, onSubmit, showSpinner }) => {
   const [counties, setCounties] = useState<ICountyItems[]>([]);
   const [courts, setCourts] = useState<ICourtItems[]>([]);

   useEffect(() => {
      getAllCounties();
      if (initialValues.courtId !== 0)
         getAllCourtsBasedOnCounties(initialValues.countyId);
   }, []);

   const getAllCounties = async () => {
      try {
         // let response = await CountyService.getAllCounty();
         const response = await CountyService.getCounties();
         if (response.status === HttpStatusCode.Ok) {
            let api = response.data.map((item: any) => {
               return {
                  id: item.countyId,
                  value: item.countyName,
               };
            });
            setCounties(api);
         }
      } finally {
      }
   };

   const getAllCourtsBasedOnCounties = async (countyId: number) => {
      try {
         let response = await CourtService.getCourtsByCountyId(countyId);
         if (response.status === HttpStatusCode.Ok) {
            let api = response.data.map((item: any) => {
               return {
                  id: parseInt(item.id),
                  value: item.courtName,
               };
            });
            setCourts(api);
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
               width="max-w-3xl"
            >
               <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
                  <div className="sm:flex sm:items-start">
                     <div className="text-center sm:text-left">
                        <h3
                           className="leading-5 text-gray-900 text-[16px] md:text-xl"
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
                        onSubmit={onSubmit}
                     >
                        {(formik) => (
                           <Form className="flex flex-col">
                              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 md:gap-3.5">
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="select"
                                       type="select"
                                       label={"County"}
                                       name={"countyId"}
                                       placeholder={"County"}
                                       options={counties}
                                       defaultOption={"Select"}
                                       onChange={(e: any) => {
                                          formik.setFieldValue("countyId", e.target.value);
                                          formik.setFieldValue("courtId", "");
                                          getAllCourtsBasedOnCounties(e.target.value);
                                       }}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="select"
                                       type="select"
                                       label={"Court"}
                                       name={"courtId"}
                                       placeholder={"Court"}
                                       options={courts}
                                       defaultOption={"Select"}
                                       onChange={(e: any) => {
                                          formik.setFieldValue("courtId", e.target.value);
                                       }}
                                    />
                                 </div>
                                 
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"POEVServiceTenant1"}
                                       name={"poevService1stTenant"}
                                       placeholder={"POEVServiceTenant1"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"POEVServiceTenant2"}
                                       name={"poevService2ndTenant"}
                                       placeholder={"POEVServiceTenant2"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"POEVServiceTenant3"}
                                       name={"poevService3rdTenant"}
                                       placeholder={"POEVServiceTenant3"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"POEVServiceTenant4"}
                                       name={"poevService4thTenant"}
                                       placeholder={"POEVServiceTenant4"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"POEVServiceTenant5"}
                                       name={"poevService5thTenant"}
                                       placeholder={"POEVServiceTenant5"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"POEVServiceTenantAAO"}
                                       name={"poevServiceAAOTenant"}
                                       placeholder={"POEVServiceTenantAAO"}
                                    />
                                 </div>
                                 {/* Unused */}
                                 {/* <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"EvictionCourtTransAmount"}
                                       name={"evictionCourtTransAmount"}
                                       placeholder={"EvictionCourtTransAmount"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"AOSCourtTransAmount"}
                                       name={"aosCourtTransAmount"}
                                       placeholder={"AOSCourtTransAmount"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"AddtlDocCourtTransAmount"}
                                       name={"addtlDocCourtTransAmount"}
                                       placeholder={"AddtlDocCourtTransAmount"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"DismissalCourtTransAmount"}
                                       name={"dismissalCourtTransAmount"}
                                       placeholder={"DismissalCourtTransAmount"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"AmendmentCourtTransAmount"}
                                       name={"amendmentCourtTransAmount"}
                                       placeholder={"AmendmentCourtTransAmount"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"AnswerCourtTransAmount"}
                                       name={"answerCourtTransAmount"}
                                       placeholder={"AnswerCourtTransAmount"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"WritCourtTransAmount"}
                                       name={"writCourtTransAmount"}
                                       placeholder={"WritCourtTransAmount"}
                                    />
                                 </div> */}
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"POWRService"}
                                       name={"powrService"}
                                       placeholder={"POWRService"}
                                    />
                                 </div>
                                 {/* Unused */}
                                 {/* <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"POGMServiceAtt1"}
                                       name={"pogmService1stTime"}
                                       placeholder={"POGMServiceAtt1"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"POGMServiceAtt2"}
                                       name={"pogmService2ndTime"}
                                       placeholder={"POGMServiceAtt2"}
                                    />
                                 </div> */}
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
                                    disabled={showSpinner ==  true? true: false}
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

export default EvictionCourtSheriffFeesFormPopupProps;
