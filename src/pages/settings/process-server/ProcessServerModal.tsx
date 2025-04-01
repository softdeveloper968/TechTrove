import React, { useState, useEffect } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { Form, Formik, FormikProps } from "formik";
import { Guid } from 'guid-typescript';
import { IProcessServerUserItem, ISelectOptions, ProcessServerFormMode } from "interfaces/process-server.interface";
import ProcessServerService from "services/process-server.service";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import FormikControl from "components/formik/FormikControl";
import vm from "utils/validationMessages";
import { StateCode } from "utils/constants";
import { handlePostalCodeKeyDown } from "utils/helper";
import { useProcessServerContext } from "./ProcessServerContext";

type ProcessServerModalProps = {
   open: boolean;
   setOpen: (open: boolean) => void;
   mode: ProcessServerFormMode;
   selectedUser: IProcessServerUserItem | null;
   setSelectedUser: (user: IProcessServerUserItem | null) => void;
};

const validationSchema = yup.object({
   userId: yup
      .string()
      .required(vm.email.required),
   county: yup
      .string()
      .required("Please enter county"),
   state: yup
      .string()
      .required("Please select state"),
   zip: yup
      .string()
      .required("Please enter Zip code.")
      .min(5, "Zip code must be 5 digits.")
      .max(5, "Zip code must be 5 digits."),
});

const ProcessServerModal = (props: ProcessServerModalProps) => {
   const { open, setOpen, mode, selectedUser, setSelectedUser } = props;
   const { processServerUsers, getProcessServers, processServers, setSelectedProcessServerIds,showSpinner,setShowSpinner} = useProcessServerContext();
   const [processServerUserOptions, setProcessServerUserOptions] = useState<ISelectOptions[]>([]);

   useEffect(() => {
      const processServerUserOptions = processServerUsers.map((item) => {
         return {
            id: item.id,
            value: item.email
         } as ISelectOptions
      });

      var sortedProcessServerUserOptions = processServerUserOptions.sort((a, b) => a.value.localeCompare(b.value));

      setProcessServerUserOptions(sortedProcessServerUserOptions);

   }, [processServerUsers]);

   const initialValues: IProcessServerUserItem = {
      id: selectedUser?.id ?? "",
      userId: selectedUser?.userId ?? "",
      email: selectedUser?.email ?? "",
      county: selectedUser?.county ?? "",
      state: selectedUser?.state ?? "",
      zip: selectedUser?.zip ?? "",
      city: selectedUser?.city ?? "",
      alternateCity: selectedUser?.alternateCity ?? "",
      companyName: "",
   };

   const mapFormValuesToLoginRequest = (formValues: IProcessServerUserItem) => {
      return {
         userId: formValues.userId,
         email: formValues.email,
         county: formValues.county,
         state: formValues.state,
         zip: formValues.zip,
         city: formValues.city,
         alternateCity: formValues.alternateCity
      };
   };

   const handleAssignProcessServer = async (formValues: IProcessServerUserItem) => {
      const createRequest = mapFormValuesToLoginRequest(formValues);

      const updateRequest = {
         ...createRequest,
         id: formValues.id ? formValues.id : Guid.createEmpty().toString(),
         userId: formValues.userId,
         email: formValues.email
      };
      setShowSpinner(true);
      const response = mode === "create"
         ? await ProcessServerService.createProcessServer(createRequest)
         : await ProcessServerService.editProcessServerUser([updateRequest]);

      if (response.status === HttpStatusCode.Ok) {
         setOpen(false); // close the modal pop-up
         if(mode === "create")
         {
            getProcessServers(1,100, '', processServers.sortings);
         }
         else
         {
            getProcessServers(processServers.currentPage,processServers.pageSize, '', processServers.sortings);
         }
         setSelectedUser(null);
         toast.success(response.data.message);
      } else {
         if (response && response.data && response.data.message)
            toast.error(response.data.message);
      }
      setShowSpinner(false);
   };

   const handleSelectInputChange = (
      event: React.ChangeEvent<HTMLSelectElement>,
      formik: FormikProps<IProcessServerUserItem>
   ) => {
      const processServer = processServerUserOptions.find(item=>item.id===event.target.value);
     // const processServer = processServers.items.find((item) => item.userId === event.target.value as string);
      if (processServer && processServer.id) {
         formik.setFieldValue("userId", processServer.id);
         formik.setFieldValue("email", processServer.value);
      } 
      //else {
      //    // Get the selected option element
      //    const selectedOption = event.target.selectedOptions[0];
      //    // Extract the email address from the value attribute
      //    const emailAddress = selectedOption.innerText;
      //    const userId = event.target.value as string;

      //    formik.setFieldValue("id", "");
      //    formik.setFieldValue("userId", userId);
      //    formik.setFieldValue("email", emailAddress);
      // }
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
                        Assign Process Server
                     </h3>
                  </div>
               </div>
               <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleAssignProcessServer}
               >
                  {(formik) => (
                     <Form className="flex flex-col">
                        <div className="grid sm:grid-cols-2 gap-2.5 md:gap-3.5">
                           <div className="relative text-left">
                              <FormikControl
                                 control="select"
                                 type="select"
                                 label={"Process Server Email"}
                                 name={"userId"}
                                 defaultOption={"Select"}
                                 placeholder={"Process Server Email"}
                                 options={processServerUserOptions}
                                 onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSelectInputChange(e, formik)}
                              />
                           </div>
                           <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="text"
                                 label={"County"}
                                 name={"county"}
                                 placeholder={"Enter County"}
                                 disabled={mode === "edit" ? true : false}
                              />
                           </div>
                           <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="text"
                                 label={"City"}
                                 name={"city"}
                                 placeholder={"Enter City"}
                              />
                           </div>
                           <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="text"
                                 label={"Alternate City"}
                                 name={"alternateCity"}
                                 placeholder={"Enter Alternate City"}
                              />
                           </div>
                           <div className="relative text-left">
                              <FormikControl
                                 control="select"
                                 type="select"
                                 label={"State"}
                                 name={"state"}
                                 defaultOption={"Please select an option"}
                                 placeholder={"State"}
                                 options={StateCode}
                                 disabled={mode === "edit" ? true : false}
                              />
                           </div>
                           <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="text"
                                 label={"Zip Code"}
                                 name={"zip"}
                                 placeholder={"Enter zip code"}
                                 maxlength={5}
                                 onKeyDown={handlePostalCodeKeyDown}
                                 disabled={mode === "edit" ? true : false}
                              />
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
                              title={mode === 'create' ? "Assign" : "Update"}
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

export default ProcessServerModal;