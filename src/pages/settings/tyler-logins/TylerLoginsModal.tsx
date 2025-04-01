import React, { useState, useEffect } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { Form, Formik, FormikProps } from "formik";
import { FaPlusCircle, FaTimes } from "react-icons/fa";
import { DataList, ITylerFormValues, ITylerUserItems, TylerFormMode } from "interfaces/tyler.interface";
import { ISelectOptions } from "interfaces/all-cases.interface";
import TylerService from "services/tyler.service";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import FormikControl from "components/formik/FormikControl";
import vm from "utils/validationMessages";
import { StateCode } from "utils/constants";
import { useTylerLoginsContext } from "./TylerLoginsContext";
import { IFilingTypeItem } from "interfaces/filing-type.interface";

type TylerLoginsModalProps = {
   open: boolean;
   setOpen: (open: boolean) => void;
   mode: TylerFormMode;
   selectedUser: ITylerUserItems | null;
   setSelectedUser: (user: ITylerUserItems | null) => void;
};

const TylerLoginsModal = (props: TylerLoginsModalProps) => {
   const {
      getTylerUsers,
      setShowSpinner,
      filingTypeList,
      showSpinner
   } = useTylerLoginsContext();

   const { open, setOpen, mode, selectedUser, setSelectedUser } = props;
   const [courtOptionsList, setCourtOptionsList] = useState<ISelectOptions[][]>([]);
   const [filingTypeOptions, setFilingTypeOptions] = useState<ISelectOptions[][]>([]);

   const validationSchema = yup.object({
      userName: yup
         .string()
         .required(vm.username.required)
         .test("valid-emails", vm.username.format, (value) => {
            if (!value) return true; // Allow empty value
            const emails = value.split(",").map((email) => email.trim());
            const isValid = emails.every((email) =>
               yup.string().email().isValidSync(email)
            );
            return isValid;
         }),
      password: yup.string().nullable(),
      hasAttorney: yup.boolean(),
      // paymentName: yup
      //    .string()
      //    .when('isDefaultPayment', {
      //       is: true,
      //       then: (schema) => schema.required(vm.paymentName.required),
      //       otherwise: (schema) => schema.notRequired(),
      //    }),
      courtPayments: yup.array().of(
         yup.object().shape({
            paymentName: mode !== "create" ? yup.string().required(vm.paymentName.required) : yup.string().nullable(),
            state: mode !== "create" ? yup.string().required('State is required.') : yup.string().nullable(),
            courtCode: mode !== "create" ? yup.string().required('Court is required.') : yup.string().nullable(),
         })
      ),
   });

   const initialValues: ITylerFormValues = {
      id: selectedUser?.id ?? "",
      userName: selectedUser?.userName ?? "",
      password: selectedUser?.password ?? "",
      firstName: selectedUser?.firstName ?? "",
      lastName: selectedUser?.lastName ?? "",
      paymentName: selectedUser?.paymentName ?? "",
      hasAttorney: selectedUser?.hasAttorney ?? false,
      isDefaultPayment: selectedUser?.isDefaultPayment ?? false,
      state:selectedUser?.state,
      courtPayments: selectedUser?.courtPayments?.length ? selectedUser?.courtPayments : [
         {
            courtName: "",
            paymentName: "",
            isC2CCard: true,
            state: "",
            courtCode: "",
            filingType: ""
         }]
   };

   useEffect(() => {
      if (
         mode === "edit" &&
         selectedUser &&
         Array.isArray(selectedUser.courtPayments) &&
         selectedUser.courtPayments.length > 0
      ) {
         selectedUser.courtPayments.forEach((payment, index) => {
            handleSetCourtValues(index, payment.state ?? "");
            handleSetFilingTypeValues(index);
         });
      }
      else
      {
         setFilingTypeOptions([filingTypeList.map((item: IFilingTypeItem) => ({
            id: item.name,
            value: item.name
         }))]);
      }
   }, []);

   const mapFormValuesToLoginRequest = (formValues: ITylerFormValues) => {
      return {
         userName: formValues.userName,
         password: formValues.password,
         firstName: formValues.firstName,
         lastName: formValues.lastName,
         paymentName: formValues.paymentName,
         hasAttorney: formValues.hasAttorney,
         isDefaultPayment: formValues.isDefaultPayment,
         state:formValues.state
      };
   };

   const handleTylerLogin = async (formValues: ITylerFormValues) => {
      const loginRequest = mapFormValuesToLoginRequest(formValues);
      const updateRequest = { ...loginRequest, id: formValues.id, courtPayments: formValues.courtPayments };
      setShowSpinner(true);
      const response = mode === "create"
         ? await TylerService.createTylerLogin(loginRequest)
         : await TylerService.editTylerLogin(updateRequest);

      if (response.status === HttpStatusCode.Ok) {
         setOpen(false); // close the modal pop-up
         getTylerUsers(1, 100);
         setSelectedUser(null);
         toast.success(response.data.message);
      } else {
         toast.error(response.data.message);
      }
      setShowSpinner(false);
   };

   const handlePlusClick = (formik: FormikProps<ITylerFormValues>) => {
      const newCourtPayment = {
        courtName: "",
        paymentName: "",
        isC2CCard: true,
        state: "",
        courtCode: "",
        filingType: ""
      };
    
      // Update the form data model by adding the new court payment object
      formik.setFieldValue("courtPayments", [...formik.values.courtPayments, newCourtPayment]);
    
      // Add a new empty array to the court options list
      setCourtOptionsList(prevOptions => [...prevOptions, []]);
    
      // Completely replace filingTypeOptions with the new list based on filingTypeList
      setFilingTypeOptions(prevOptions => [
         ...prevOptions,  // Preserve previous options if necessary
         filingTypeList.map((item: IFilingTypeItem) => ({
           id: item.name,
           value: item.name
         }))
      ]);
    };    

   const handleCrossClick = (
      _index: number,
      formik: FormikProps<ITylerFormValues>
   ) => {
      if (formik.values.courtPayments && formik.values.courtPayments.length > 1) {
         // Use filter to create a new array without the element at the specified index
         let filteredRecords = formik.values.courtPayments.filter(
            (_, index) => index !== _index
         );
         // Update the form data model using Formik's setFieldValue
         formik.setFieldValue("courtPayments", filteredRecords);
      }
   };

   const handleSetCourtValues = async (index: number, state: string) => {
      setShowSpinner(true);
      try {
         const data = await getCourtDropdownValues(state, "", "", "", false);
         setCourtOptionsList(prevOptions => {
            const updatedOptionsList = [...prevOptions];
            updatedOptionsList[index] = data.map((item: DataList) => ({
               id: item.code,
               value: item.name
            }));
            return updatedOptionsList;
         });
      } finally {
         setShowSpinner(false);
      }
   };

   const getCourtDropdownValues = async (
      state: string,
      court: string,
      caseType: string,
      filingCode: string,
      fileIntoExistingCase: boolean
   ) => {
      const apiResponse = await TylerService.getCourtsByState(
         state,
         court,
         caseType,
         filingCode,
         fileIntoExistingCase,
         ""
      );
      if (apiResponse.status === HttpStatusCode.Ok) {
         return apiResponse.data as DataList[];
      }
      else
         return [];
   };

   const handleSetFilingTypeValues = async (index: number) => {
      setShowSpinner(true);
      try {
         setFilingTypeOptions(prevOptions => {
            const updatedOptionsList = [...prevOptions];
            updatedOptionsList[index] = filingTypeList.map((item: IFilingTypeItem) => ({
               id: item.name,
               value: item.name
            }));
            return updatedOptionsList;
         });
      } finally {
         setShowSpinner(false);
      }
   };

   return (
      <Modal showModal={open} onClose={() => setOpen(false)} width="max-w-3xl">
         <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
            <div className="sm:flex sm:items-start">
               <div className="text-center sm:text-left">
                  <h3
                     className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                     id="modal-title"
                  >
                     {mode === "create" ? "Create" : "Edit"} Tyler User
                  </h3>
               </div>
            </div>
            <Formik
               initialValues={initialValues}
               validationSchema={validationSchema}
               onSubmit={handleTylerLogin}
            >
               {(formik) => (
                  <Form className="flex flex-col pt-1.5">
                     <div className="grid sm:grid-cols-3 gap-2.5 md:gap-3.5">
                        <div className="relative">
                           <FormikControl
                              control="input"
                              type="text"
                              label={"Username"}
                              name={"userName"}
                              placeholder={"Enter Username"}
                              autoFocus={true}
                           />
                        </div>
                        <div className="relative">
                           <FormikControl
                              control="input"
                              type="text"
                              label={"First Name"}
                              name={"firstName"}
                              placeholder={"Enter First Name"}
                           />
                        </div>
                        <div className="relative">
                           <FormikControl
                              control="input"
                              type="text"
                              label={"Last Name"}
                              name={"lastName"}
                              placeholder={"Enter Last Name"}
                           />
                        </div>
                        <div className="relative">
                           <FormikControl
                              control="input"
                              type="password"
                              label={"Password"}
                              name={"password"}
                              placeholder={"Enter Password"}
                              autoComplete={"new-password"}
                           />
                        </div>
                        <div className="relative">
                                 <FormikControl
                                    control="select"
                                    type="select"
                                    label={"State"}
                                    name={"state"}
                                    defaultOption={"Please select"}
                                    placeholder={"State"}
                                    options={StateCode}
                                    selected={initialValues.state}
                                 />
                              </div>
                        {/* <div className="flex items-center justify-end gap-1.5 flex-row-reverse sm:pt-5">
                           <FormikControl
                              control="checkbox"
                              name="isDefaultPayment"
                              label="Is Default Payment?"
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                 formik.setFieldValue("isDefaultPayment", event)
                                 if (!event) {
                                    formik.setFieldValue("paymentName", ""); // Clear paymentName if unchecked
                                 }
                              }}
                              checked={formik.values.isDefaultPayment}
                           />
                        </div> */}
                        {/* {formik.values.isDefaultPayment && (
                           <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="text"
                                 name="paymentName"
                                 label="Payment Name"
                                 autoComplete="off"
                                 className="form-control"
                                 placeholder="Payment Name"
                              />
                           </div>
                        )} */}
                        <div className="flex items-center justify-end gap-1.5 flex-row-reverse sm:pt-5">
                           <FormikControl
                              control="checkbox"
                              type="checkbox"
                              label={"Has Attorney"}
                              name={"hasAttorney"}
                              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                 formik.setFieldValue("hasAttorney", event)
                              }}
                              checked={formik.values.hasAttorney}
                           />
                        </div>
                        {formik.errors.hasAttorney && (
                           <span className="text-[11px] text-aidonicRed text-red-500">
                              {formik.errors.hasAttorney}
                           </span>
                        )}
                        {/* </div> */}
                     </div>
                     {mode !== "create" && <>
                        <div className="flex mt-3.5 items-center gap-3.5 ">
                           <label className="font-medium text-sm">Add Court Payments</label>
                           <FaPlusCircle
                              style={{
                                 height: 16,
                                 width: 16,
                                 color: "#2472db",
                                 cursor: "pointer"
                              }}
                              onClick={() => handlePlusClick(formik)}
                           />
                        </div>
                        <div className="court_payments">
                           {formik.values.courtPayments && formik.values.courtPayments.map((_, index) => (
                              <div className="flex mt-2.5 items-center gap-2.5 sm:gap-3.5 pr-7 relative flex-col sm:flex-row">
                                 <div className="w-full">
                                    <FormikControl
                                       control="select"
                                       type="select"
                                       label={"State"}
                                       name={`courtPayments[${index}].state`}
                                       defaultOption={"Please select an option"}
                                       placeholder={"State"}
                                       options={StateCode}
                                       onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                                          formik.setFieldValue(`courtPayments[${index}].state`, evt.target.value);
                                          formik.setFieldValue(`courtPayments[${index}].courtName`, "");
                                          formik.setFieldValue(`courtPayments[${index}].courtCode`, "");
                                          handleSetCourtValues(index, evt.target.value);
                                       }}
                                    />
                                 </div>
                                 <div className="w-full">
                                    <FormikControl
                                       control="select"
                                       type="select"
                                       label={"Court Name"}
                                       name={`courtPayments[${index}].courtCode`}
                                       defaultOption={"Please select an option"}
                                       placeholder={"Select"}
                                       options={courtOptionsList[index] ?? []}
                                       value={_.courtCode}
                                       onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                          formik.handleChange(e);
                                          formik.setFieldValue(`courtPayments[${index}].courtName`, e.target.selectedOptions[0].text);
                                          formik.setFieldValue(`courtPayments[${index}].courtCode`, e.target.value);
                                       }}
                                    />
                                 </div>
                                 <div className="w-full">
                                    <FormikControl
                                       control="select"
                                       type="select"
                                       label={"Filing Type"}
                                       name={`courtPayments[${index}].filingType`}
                                       defaultOption={"Please select an option"}
                                       placeholder={"Select"}
                                       options={filingTypeOptions[index] ?? []}
                                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                          formik.handleChange(e);
                                          formik.setFieldValue(`courtPayments[${index}].filingType`, e.target.value);
                                       }}
                                    />
                                 </div>
                                 <div className="w-full">
                                    <FormikControl
                                       control="input"
                                       type="text"
                                       label={"Payment Name"}
                                       name={`courtPayments[${index}].paymentName`}
                                       placeholder={"Enter Payment Name"}
                                    />
                                 </div>
                                 <div className="w-full">
                                    <label className="text-gray-600 text-[11px] md:text-xs font-medium">Payment Account</label>
                                    <div className="flex gap-3 items-center h-[30px] sm:h-[44px] md:h-[48px]">
                                       <div className="flex items-center">
                                          <input
                                             id={`radio1-${index}`}
                                             type="radio"
                                             value="true"  // Set appropriate value for 'C2C Account'
                                             name={`courtPayments[${index}].isC2CCard`}
                                             className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 outline-0"
                                             onChange={() => formik.setFieldValue(`courtPayments[${index}].isC2CCard`, true)}
                                             checked={formik.values.courtPayments[index].isC2CCard === true}
                                          />
                                          <label htmlFor={`radio1-${index}`} className="ms-1 text-xs font-medium text-gray-900">C2C</label>
                                       </div>
                                       <div className="flex items-center">
                                          <input
                                             id={`radio2-${index}`}
                                             type="radio"
                                             value="false"  // Set appropriate value for 'Client Account'
                                             name={`courtPayments[${index}].isC2CCard`}
                                             className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 outline-0"
                                             onChange={() => formik.setFieldValue(`courtPayments[${index}].isC2CCard`, false)}
                                             checked={formik.values.courtPayments[index].isC2CCard === false}
                                          />
                                          <label htmlFor={`radio2-${index}`} className="ms-1 text-xs font-medium text-gray-900">Client</label>
                                       </div>
                                    </div>


                                 </div>
                                 {index > 0 && <>
                                    <FaTimes
                                       className="absolute right-1 inset-y-0 m-auto"
                                       style={{
                                          height: 17,
                                          width: 17,
                                          minWidth: 13,
                                          color: "#E61818",
                                          cursor: "pointer"
                                       }}
                                       onClick={() => handleCrossClick(index, formik)}
                                    />
                                 </>}
                              </div>
                           ))}
                        </div>
                     </>}
                     <div className="text-right pt-2.5">
                        <Button
                           type="button"
                           isRounded={false}
                           title="Cancel"
                           handleClick={() => setOpen(false)}
                           classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                        ></Button>
                        <Button
                           title={mode === "create" ? "Create" : "Update"}
                           type={"submit"}
                           isRounded={false}
                           disabled={showSpinner}
                           classes="mt-2.5 py-2 md:py-2.5 px-4 inline-flex justify-center items-center gap-x-1.5 text-xs font-semibold rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none   "
                        ></Button>
                     </div>
                  </Form>
               )}
            </Formik>
         </div>
      </Modal>
   );
};

export default TylerLoginsModal;