import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { Form, Formik } from "formik";
import FormikControl from "components/formik/FormikControl";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import vm from "utils/validationMessages";
import CountyService from "services/county.service";
import CourtService from "services/court.service";
import { IC2CFeeItems } from "interfaces/c2c-fees.interface";
import { ICounty } from "interfaces/county.interface";
import { ICourt } from "interfaces/court.interface";
import { ICommonSelectOptions } from "interfaces/common.interface";

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
   clientId: yup
      .string()
      .required(vm.company.required),
   // c2CServiceExpFee: yup
   //    .number()
   //    .required(vm.c2CServiceExpFee.required),
   // c2CServiceFee: yup
   //    .number()
   //    .required(vm.c2CServiceFee.required),
   // c2CAddtlTenantsFee: yup
   //    .number()
   //    .required(vm.c2CAddtlTenantsFee.required),
   // c2CServiceHouseFee: yup
   //    .number()
   //    .required(vm.c2CServiceHouseFee.required),
   // c2CAOSFee: yup
   //    .number()
   //    .required(vm.c2CAOSFee.required),
   // c2CDismissalFee: yup
   //    .number()
   //    .required(vm.c2CDismissalFee.required),
   // c2CWritFee: yup
   //    .number()
   //    .required(vm.c2CWritFee.required),
   // evictionAutomationFee: yup
   //    .number()
   //    .required(vm.evictionAutomationFee.required),
   // c2CAmendmentFee: yup
   //    .number()
   //    .required(vm.c2CAmendmentFee.required),
   // c2CAddtlDocFee: yup
   //    .number()
   //    .required(vm.c2CAddtlDocFee.required),
   // c2COtherFee: yup
   //    .number()
   //    .required(vm.c2COtherFee.required),
   // c2CEvictionFee: yup
   //    .number()
   //    .required(vm.c2CEvictionFee.required),
   // c2CServiceAddtlTenantsFee: yup
   //    .number()
   //    .required(vm.c2CServiceAddtlTenantsFee.required),
});

type C2CFormPopupProps = {
   showPopup: Boolean;
   closePopup: (shouldRefresh: string) => void;
   isEditMode: boolean;
   initialValues: IC2CFeeItems;
   companyOptions: ICommonSelectOptions[];
   onSubmit: (formValues: IC2CFeeItems) => void;
   showSpinner: Boolean;
};
const C2CFormPopup: React.FC<C2CFormPopupProps> = ({
   showPopup,
   closePopup,
   isEditMode,
   initialValues,
   companyOptions,
   onSubmit,
   showSpinner
}) => {
   const [counties, setCounties] = useState<ICounty[]>([]);
   const [courts, setCourts] = useState<ICourt[]>([]);

   useEffect(() => {
      getAllCounties();
      if (initialValues.court.countyId !== 0) {
         getAllCourtsBasedOnCounties(initialValues.court.countyId);
      }
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
               width="max-w-[60rem]"
            >
               <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
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
                        onSubmit={onSubmit}
                     >
                        {(formik) => (
                           <Form className="flex flex-col">
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 md:gap-3.5">
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
                                       disabled={isEditMode}
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
                                       disabled={isEditMode}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="select"
                                       type="select"
                                       label={"Company"}
                                       name={"clientId"}
                                       defaultOption={"Select"}
                                       options={companyOptions}
                                       disabled={isEditMode}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"EAFee"}
                                       name={"evictionAutomationFee"}
                                       placeholder={"EAFee"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"C2CEvictionFee"}
                                       name={"c2CEvictionFee"}
                                       placeholder={"C2CEvictionFee"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"C2CAddtlTenantsFee"}
                                       name={"c2CAddtlTenantsFee"}
                                       placeholder={"C2CAddtlTenantsFee"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"C2CAOSFee"}
                                       name={"c2CAOSFee"}
                                       placeholder={"C2CAOSFee"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"C2CAddtlDocFee"}
                                       name={"c2CAddtlDocFee"}
                                       placeholder={"C2CAddtlDocFee"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"C2CDismissalFee"}
                                       name={"c2CDismissalFee"}
                                       placeholder={"C2CDismissalFee"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"C2CAmendmentFee"}
                                       name={"c2CAmendmentFee"}
                                       placeholder={"C2CAmendmentFee"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"C2CServiceAddtlTenantsFee"}
                                       name={"c2CServiceAddtlTenantsFee"}
                                       placeholder={"C2CServiceAddtlTenantsFee"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"C2CWritFee"}
                                       name={"c2CWritFee"}
                                       placeholder={"C2CWritFee"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"C2COtherFee"}
                                       name={"c2COtherFee"}
                                       placeholder={"C2COtherFee"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"C2CServiceFee"}
                                       name={"c2CServiceFee"}
                                       placeholder={"C2CServiceFee"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"C2CServiceExpFee"}
                                       name={"c2CServiceExpFee"}
                                       placeholder={"c2CServiceExpFee"}
                                    />
                                 </div>
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"C2CServiceHouseFee"}
                                       name={"c2CServiceHouseFee"}
                                       placeholder={"C2CServiceHouseFee"}
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
                                    disabled={showSpinner == true? true:false}
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
export default C2CFormPopup;
