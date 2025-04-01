import React from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { Form, Formik } from "formik";
import { ICasperFormValues, ICasperUserItem, CasperFormMode } from "interfaces/casper.interface";
import CasperService from "services/casper.service";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import FormikControl from "components/formik/FormikControl";
import { useCasperLoginsContext } from "./CasperLoginsContext";

type CasperLoginsModalProps = {
   open: boolean;
   setOpen: (open: boolean) => void;
   mode: CasperFormMode;
   selectedUser: ICasperUserItem | null;
   setSelectedUser: (user: ICasperUserItem | null) => void;
};

const CasperLoginsModal = (props: CasperLoginsModalProps) => {
   const { open, setOpen, mode, selectedUser, setSelectedUser } = props;
   const { getCasperUsers, casperUsers,showSpinner,setShowSpinner } = useCasperLoginsContext();

   const validationSchema = yup.object({
      name: yup
         .string()
         .required("Please enter the account name"),
      isDefault: yup
         .boolean(),
   });

   const initialValues: ICasperFormValues = {
      id: selectedUser?.id ?? "",
      userName: selectedUser?.userName ?? "",
      password: selectedUser?.password ?? "",
      isDefault: selectedUser?.isDefault ?? false,
      name: selectedUser?.name ?? "",
      isC2CCard:selectedUser?.isC2CCard ?? true,
      // firstName: selectedUser?.firstName ?? "",
      // lastName: selectedUser?.lastName ?? "",
      // confirmPassword: "",
   };

   const mapFormValuesToLoginRequest = (formValues: ICasperFormValues) => {
      return {
         userName: formValues.userName,
         password: formValues.password,
         isDefault: formValues.isDefault,
         name: formValues.name,
         isC2CCard:formValues.isC2CCard
         // firstName: formValues.firstName,
         // lastName: formValues.lastName,
      };
   };

   const handleCasperLogin = async (formValues: ICasperFormValues) => {
      const loginRequest = mapFormValuesToLoginRequest(formValues);
      const updateRequest = { ...loginRequest, id: formValues.id };

      setShowSpinner(true);
      const response = mode === "create"
         ? await CasperService.createCasperLoginUser(loginRequest)
         : await CasperService.editCasperLoginUser(updateRequest);

      if (response.status === HttpStatusCode.Ok) {
         setOpen(false); // close the modal pop-up
         if (mode === "create") {
            getCasperUsers(1, 100);
         }
         else {
            getCasperUsers(casperUsers.currentPage, casperUsers.pageSize);
         }
         setSelectedUser(null);
         toast.success(response.data.message);
      } else {
         toast.error(response.data.message);
      }
      setShowSpinner(false);
   };

   return (
      <>
         <Modal showModal={open} onClose={() => setOpen(false)} width="max-w-3xl">
            <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
               <div className="sm:flex sm:items-start">
                  <div className="text-center sm:text-left">
                     <h3
                        className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                        id="modal-title"
                     >
                        {mode === "create" ? "Create" : "Edit"} Cobb User
                     </h3>
                  </div>
               </div>
               <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleCasperLogin}
               >
                  {(formik) => (
                     <Form className="flex flex-col pt-1.5">
                        <div className="grid sm:grid-cols-2 gap-2.5 md:gap-3.5">
                           <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="text"
                                 label={"Account"}
                                 name={"name"}
                                 placeholder={"Enter Account name"}
                                 autoFocus={true}
                                 value={formik.values.name.toUpperCase() ?? ""}
                                 onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    const value = event.target.value.toUpperCase();
                                    formik.setFieldValue('name', value);
                                 }}
                              />
                           </div>
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
                           {/* <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="text"
                                 label={"First Name"}
                                 name={"firstName"}
                                 placeholder={"Enter First Name"}
                              />
                           </div> */}
                           {/* <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="text"
                                 label={"Last Name"}
                                 name={"lastName"}
                                 placeholder={"Enter Last Name"}
                              />
                           </div> */}
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
                           {/* <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="password"
                                 label={"Confirm Password"}
                                 name={"confirmPassword"}
                                 placeholder={"Confirm Password"}
                                 autoComplete={"new-password"}
                              />
                           </div> */}
                           <div className="flex items-center justify-end gap-1.5 flex-row-reverse sm:pt-5">
                              <FormikControl
                                 control="checkbox"
                                 type="checkbox"
                                 label={"Is Default"}
                                 name={"isDefault"}
                                 onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                    formik.setFieldValue("isDefault", event)
                                 }}
                                 checked={formik.values.isDefault}
                              />
                           </div>
                           {formik.errors.isDefault && (
                              <span className="text-[11px] text-aidonicRed text-red-500">
                                 {formik.errors.isDefault}
                              </span>
                           )}
                           <div className="w-full">
                              <label className="text-gray-600 text-[11px] md:text-xs font-medium">Payment Account</label>
                              <div className="flex gap-3 items-center h-[30px] sm:h-[44px] md:h-[48px]">
                                 <div className="flex items-center">
                                    <input
                                       id="radio1"
                                       type="radio"
                                       value="true"  // C2C Account
                                       name="isC2CCard"
                                       className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 outline-0"
                                       onChange={() => formik.setFieldValue('isC2CCard', true)}
                                       checked={formik.values?.isC2CCard === true}
                                    />
                                    <label htmlFor="radio1" className="ms-1 text-xs font-medium text-gray-900">C2C</label>
                                 </div>
                                 <div className="flex items-center">
                                    <input
                                       id="radio2"
                                       type="radio"
                                       value="false"  // Client Account
                                       name="isC2CCard"
                                       className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2 outline-0"
                                       onChange={() => formik.setFieldValue('isC2CCard', false)}
                                       checked={formik.values?.isC2CCard === false}
                                    />
                                    <label htmlFor="radio2" className="ms-1 text-xs font-medium text-gray-900">Client</label>
                                 </div>
                              </div>
                           </div>

                        </div>
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
      </>
   );
};

export default CasperLoginsModal;