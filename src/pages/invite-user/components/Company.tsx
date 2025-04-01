import React, { useState, useEffect } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import InputMask from "react-input-mask";
import { Form, Formik } from "formik";
import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import Select from "components/formik/Select";
import { ICompanyItems } from "interfaces/all-users.interface";
import {
   ISelectOptions,
} from "interfaces/late-notices.interface";
import AllUsersService from "services/all-users.service";
import { useUserContext } from "../UserContext";
import { StateCode } from "utils/constants";
import { handlePostalCodeKeyDown, toCssClassName } from "utils/helper";

type InviteUserProps = {
   showInviteUserModal: Boolean;
   handleCompanyModal: (value: boolean) => void;
};
//validation schema for signup model
const validationSchema = yup.object({
   email: yup
      .string()
      .email("Please enter a valid Email address")
      .required("Please enter your Email")
      .max(50, "The Email must not exceed 50 characters"),

   billingEmail: yup
      .string()
      .email("Please enter a valid Email address")
      .required("Please enter your Billing Email")
      .max(50, "The Email must not exceed 50 characters"),

   companyName: yup
      .string()
      .trim()
      .required("Please enter your company name")
      .max(50, "The company name must not exceed 50 characters"),
   // phone: yup
   //   .string()
   //   .required("Please enter phone"),
   phone: yup.string().matches(/^\(\d{3}\) \d{3}-\d{4}$/, "Please enter a valid  phone number").required("Please enter phone"),
   addressLine1: yup
      .string()
      .required("Please enter address")
      .min(3, "Address must be at least 3 characters")
      .max(300, "Address must not exceed 300 characters"),
   billingAddress: yup
      .string()
      .required("Please enter address")
      .min(3, "Address must be at least 3 characters")
      .max(300, "Address must not exceed 300 characters"),
   addressLine2: yup
      .string()
      .min(3, "Address must be at least 3 characters")
      .max(300, "Address must not exceed 300 characters"),
   city: yup
      .string()
      .required("Please enter city"),
   state: yup.string().required("State is required"),
   billingCity: yup
      .string()
      .required("Please enter city"),
   billingCountrySubDivisionCode: yup.string().required("State is required"),
   // tylerUserId: yup.string().required("Tyler user is required"),
   // casperUserId:yup.string().required("Casper user is required"),
   postalCode: yup.string()
      .required("Zip is required")
      .min(5, "Zip code must be 5 digits")
      .max(5, "Zip code must be 5 digits")
      .matches(/^[0-9]*$/, "Zip Code accepts only numbers"),
   billingPostalCode: yup.string()
      .required("Zip is required")
      .min(5, "Zip code must be 5 digits")
      .max(5, "Zip code must be 5 digits")
      .matches(/^[0-9]*$/, "Zip Code accepts only numbers"),
   statesPermitted: yup.array()
   .min(1, "Please select at least one state.")
   .required("statesPermitted is a required field.")
});

const Company = (props: InviteUserProps) => {
   const {
      allCompanies,
      getAllCompanies,
      getListOfCompany,
      editCompany,
      allTylerUsers,
      allCasperUsers,
      showSpinner,
      setShowSpinner,
      companies
   } = useUserContext();
   // toggle pop up
   const [isPopupOpen, setIsPopupOpen] = useState(props.showInviteUserModal);
   // State to hold the late notices spinner
   const [tylerUserList, setTylerUserList] = useState<ISelectOptions[]>([]);
   const [tylerUserListGA, setTylerUserListGA] = useState<ISelectOptions[]>([]);
   const [tylerUserListTX, setTylerUserListTX] = useState<ISelectOptions[]>([]);
   const [casperUserList, setCasperUserList] = useState<ISelectOptions[]>([]);
   const [isProcessServer, setIsProcessServer] = useState(
      editCompany?.isProcessServer ?? false
   );
   const [isPropertySpecific, setIsPropertySpecific] = useState(
      editCompany?.isPropertySpecific ?? false
   );
   const [isNoLimit, setIsNoLimit] = useState(
      editCompany?.isNoLimit ?? false
   );
   const [isSameAddress, setIsSameAddress] = useState<boolean>(false);
   useEffect(() => {
      var list = allTylerUsers.map((item) => ({
         id: item.id,
         value: item.userName
      }));
      var sortedTylerUser = list.sort((a, b) => a.value.localeCompare(b.value));
      setTylerUserList(sortedTylerUser);
      var coblist = allCasperUsers.map((item) => ({
         id: item.id,
        value: `${item.name} - ${item.userName}`
      }));
      const listGA = allTylerUsers
         .filter(user => user.state === 'GA')
         .map((item) => ({
            id: item.id,
            value: item.userName
         }));
      const sortedTylerUserGA = listGA.sort((a, b) => a.value.localeCompare(b.value));
      setTylerUserListGA(sortedTylerUserGA);

      const listTX = allTylerUsers
         .filter(user => user.state === 'TX')
         .map((item) => ({
            id: item.id,
            value: item.userName
         }));
      const sortedTylerUserTX = listTX.sort((a, b) => a.value.localeCompare(b.value));
      setTylerUserListTX(sortedTylerUserTX);
      var sortedCoblist = coblist.sort((a, b) => a.value.localeCompare(b.value));
     console.log(sortedCoblist);
      setCasperUserList(sortedCoblist);

   }, []);

   // const initialValues = {
   //   email: "",
   //   firstName: "",
   //   lastName: "",
   //   password: "",
   //   confirmPassword: "",
   //   role: "",
   // };
   const initialValues: ICompanyItems & {
      companyName: string;
      phone: string;
      clientType: string;
      addressLine1: string;
      addressLine2: string;
      city: string;
      state: string;
      postalCode: string;
      email: string;
      billingEmail: string;
      notes: string;
      tylerUserId: string;
      casperUserId: string;
      isProcessServer: boolean;
      limit: number;
      isNoLimit: boolean;
      billingAddress: string;
      billingCity: string;
      billingCountrySubDivisionCode: string;
      billingPostalCode: string;
      statesPermitted: string[];
      isPropertySpecific:boolean;
      isParentCompany:boolean;
      tylerUserTXId:string;
   } = {
      id: "",
      companyName: editCompany?.companyName ?? "",
      phone: editCompany?.phone ?? "",
      clientType: editCompany.clientType ?? "",
      addressLine1: editCompany?.addressLine1 ?? "",
      addressLine2: editCompany?.addressLine2 ?? "",
      city: editCompany?.city ?? "",
      state: editCompany?.state ?? "",
      postalCode: editCompany.postalCode ?? "",
      email: editCompany?.email ?? "",
      billingEmail: editCompany?.billingEmail ?? "",
      notes: editCompany?.notes ?? "",
      tylerUserId: editCompany?.tylerUserId ?? "",
      tylerUserTXId : editCompany?.tylerUserTXId ??"",
      casperUserId: editCompany.casperUserId ?? "",
      isProcessServer: editCompany?.isProcessServer ?? false,
      limit: editCompany?.limit ?? 0,
      isNoLimit: editCompany?.isNoLimit ?? true,
      billingAddress: editCompany?.billingAddress ?? "",
      billingCity: editCompany?.billingCity ?? "",
      billingCountrySubDivisionCode: editCompany?.billingCountrySubDivisionCode ?? "",
      billingPostalCode: editCompany.billingPostalCode ?? "",
      statesPermitted: editCompany?.statesPermitted ?? [],
      isPropertySpecific:editCompany?.isPropertySpecific ?? false,
      isParentCompany:editCompany?.isParentCompany??false,
   };

   const handleSignup = async (formValues: ICompanyItems) => {
      try {
         setShowSpinner(true);
         formValues.postalCode = formValues.postalCode.toString();
         formValues.billingPostalCode = formValues.billingPostalCode.toString();
         formValues.casperUserId = formValues.casperUserId ? formValues.casperUserId : null;
         formValues.tylerUserId = formValues.tylerUserId ? formValues.tylerUserId : null;
         formValues.tylerUserTXId = formValues.tylerUserTXId ? formValues.tylerUserTXId : null;
         formValues.isNoLimit = isNoLimit;

         const response = (Object.keys(editCompany).length !== 0) ? await AllUsersService.editCompany(editCompany.id,
            formValues
         ) : await AllUsersService.createCompany(
            formValues
         );
         // const response = await AllUsersService.createCompany(
         //   formValues
         // );
         if (response.status === HttpStatusCode.Ok) {
            //   setShowSpinner(false);
            if (Object.keys(editCompany).length === 0)
               toast.success("Company Successfully Added");
            else
               toast.success("Company Successfully Updated");
            props.handleCompanyModal(false);           
            //   getListOfCompany(1, 100, companies.searchParam);
         }
      } catch (error) {
         console.error("Error:", error);
      } finally {
         setShowSpinner(false);
         getAllCompanies();
      }
   };

   const closePopup = () => {
      props.handleCompanyModal(false);
   };
   const handleIsSameAddressChange = (e: React.ChangeEvent<HTMLInputElement>, formik: any) => {
      const checked = e.target.checked;
      setIsSameAddress(checked);
      if (checked) {
         formik.setFieldValue("billingAddress", formik.values.addressLine1);
         formik.setFieldValue("billingCity", formik.values.city);
         formik.setFieldValue("billingCountrySubDivisionCode", formik.values.state);
         formik.setFieldValue("billingPostalCode", formik.values.postalCode);
      } else {
         formik.setFieldValue("billingAddress", "");
         formik.setFieldValue("billingCity", "");
         formik.setFieldValue("billingCountrySubDivisionCode", "");
         formik.setFieldValue("billingPostalCode", "");
      }
   };

   const handleRadioButtonChange = (event: any, formik: any) => {
      const value = event.target.value === "yes"; // Convert value to boolean
      setIsProcessServer(value);
      formik.setFieldValue("isProcessServer", value); // Update formik field value
      if ((Object.keys(editCompany).length !== 0)) {
         editCompany.isProcessServer = value;
      }
   };
   const handlePropertyRadioButtonChange = (event: any, formik: any) => {
      const value = event.target.value === "yes"; // Convert value to boolean
      setIsPropertySpecific(value);
      formik.setFieldValue("isPropertySpecific", value); // Update formik field value
      if ((Object.keys(editCompany).length !== 0)) {
         editCompany.isPropertySpecific = value;
      }
   };

   return (
      <>
         {isPopupOpen && (
            <Modal showModal={isPopupOpen} onClose={closePopup} width="max-w-4xl">
               {/* {showSpinner && <Spinner></Spinner>} */}
               <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                  <div className="sm:flex sm:items-start">
                     <div className="text-center sm:text-left">
                        <h3
                           className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                           id="modal-title"
                        >
                           {(Object.keys(editCompany).length !== 0) ? "Edit Company Information" : "Create Company"}
                        </h3>
                     </div>
                  </div>
                  {/* {showSpinner ? <Spinner></Spinner> : null} */}
                  <Formik
                     initialValues={initialValues}
                     validationSchema={validationSchema}
                     onSubmit={handleSignup}
                  >
                     {(formik) => (
                        <Form className="flex flex-col pt-1.5">
                           <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3.5">
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type="text"
                                    label={"Company Name"}
                                    name={"companyName"}
                                    placeholder={"Enter Company Name"}
                                    autoFocus={true}
                                 />
                              </div>
                              {/* <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type={"text"}
                                    label={"Phone"}
                                    name={"phone"}
                                    placeholder={"Enter Phone Number"}
                                 />
                              </div> */}
                              <div className="relative">
                                 <label
                                    htmlFor={"role"}
                                    className="text-gray-600 text-[11px] md:text-xs font-medium"
                                 >
                                    Phone Number
                                 </label>
                                 <div>
                                    <InputMask
                                       mask="(999) 999-9999"
                                       maskChar=" "
                                       value={formik.values.phone}
                                       onChange={formik.handleChange}
                                       onBlur={formik.handleBlur}
                                       name="phone"
                                       id="phone"
                                       placeholder="Enter Phone Number"
                                       className="peer outline-none p-2.5 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none   " // Custom class for styling
                                    />
                                    {formik.touched.phone && formik.errors.phone ? (
                                       <div className="text-[11px] text-aidonicRed text-red-500">{formik.errors.phone}</div>
                                    ) : null}

                                 </div>

                              </div>
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type={"text"}
                                    label={"Company Type"}
                                    name={"clientType"}
                                    placeholder={"Enter Company Type"}
                                 />
                              </div>
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type={"text"}
                                    label={"Address"}
                                    name={"addressLine1"}
                                    placeholder={"Enter Address"}
                                 />
                              </div>
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type={"text"}
                                    label={"Address Line 2"}
                                    name={"addressLine2"}
                                    placeholder={"Enter Address Line 2"}
                                 />
                              </div>
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type={"text"}
                                    label={"City"}
                                    name={"city"}
                                    placeholder={"Enter City"}
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
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type="text"
                                    label={"Zip Code"}
                                    name={"postalCode"}
                                    placeholder={"Zip"}
                                    maxlength={5}
                                    onKeyDown={handlePostalCodeKeyDown}
                                 />
                              </div>
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type={"text"}
                                    label={"Email"}
                                    name={"email"}
                                    placeholder={"Enter Email"}
                                 />
                              </div>
                              <div className="relative">
                                 <FormikControl
                                    control="multiselect"
                                    type="select"
                                    label={"Permitted States "}
                                    name={"statesPermitted"}
                                    defaultOption={"Select"}
                                    placeholder={"State"}
                                    options={StateCode}
                                    selected={initialValues.statesPermitted}
                                 />
                              </div>
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type={"text"}
                                    label={"Notes"}
                                    name={"notes"}
                                    placeholder={"Enter Notes"}
                                 />
                              </div>
                              <div className="relative ">
                                 <label
                                    htmlFor={"company"}
                                    className="text-gray-600 text-[11px] md:text-xs font-medium"
                                 >
                                    Cobb User
                                 </label>
                                 <Select
                                    heading={"CasperUser"}
                                    name="casperUserId"
                                    defaultOption={" please select "}
                                    handleSelect={(event: any) => {

                                    }}
                                    options={casperUserList}
                                 //placeholder="Select an option"
                                 // selectedValue={initialValues.userCompanyId}
                                 />
                              </div>
                              <div className="relative ">
                                 <label
                                    htmlFor={"company"}
                                    className="text-gray-600 text-[11px] md:text-xs font-medium"
                                 >
                                    Tyler User GA
                                 </label>
                                 <Select
                                    heading={"TylerUser"}
                                    name="tylerUserId"
                                    defaultOption={" please select "}
                                    handleSelect={(event: any) => {

                                    }}
                                    options={tylerUserListGA}
                                 //placeholder="Select an option"
                                 // selectedValue={initialValues.userCompanyId}
                                 />
                              </div>
                              <div className="relative ">
                                 <label
                                    htmlFor={"company"}
                                    className="text-gray-600 text-[11px] md:text-xs font-medium"
                                 >
                                    Tyler User TX
                                 </label>
                                 <Select
                                    heading={"TylerUser"}
                                    name="tylerUserTXId"
                                    defaultOption={" please select "}
                                    handleSelect={(event: any) => {

                                    }}
                                    options={tylerUserListTX}
                                 //placeholder="Select an option"
                                 // selectedValue={initialValues.userCompanyId}
                                 />
                              </div>
                              <div className="flex gap-2">
                                 <div className="relative w-full">
                                    <FormikControl
                                       control="number"
                                       type={"text"}
                                       label={"Wallet Limit"}
                                       name={"limit"}
                                       placeholder={"Enter Limit"}
                                       disabled={isNoLimit}
                                    />
                                 </div>
                                 <div className="relative text-nowrap">
                                    <label className="text-gray-600 text-[11px] md:text-xs font-medium">&nbsp;</label>
                                    <div>
                                       <label className="h-[34px] md:h-[38px] inline-flex gap-1.5 items-center text-gray-600 text-[11px] md:text-xs font-medium cursor-pointer">
                                          <input
                                             type="checkbox"
                                             name="isNoLimit"
                                             onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                ;
                                                setIsNoLimit(e.target.checked)
                                             }

                                                // onChange(e.target.checked)
                                             }
                                             checked={isNoLimit}
                                          /> No Limit</label>
                                    </div>

                                    {/* <GridCheckbox
                                       checked={isNoLimit}
                                       onChange={(checked: boolean) =>
                                       setIsNoLimit(checked)
                                       }
                                       label="No Limit"
                                    /> */}
                                 </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-4 mb-1 mt-4">
                              <h3 className="font-medium">Billing Address</h3>
                              <div className="relative">
                                 <label className="h-[28px] inline-flex gap-1.5 items-center text-gray-600 text-[11px] md:text-xs font-medium cursor-pointer"><input
                                    type="checkbox"
                                    name="isSameAddress"
                                    onChange={(event) => handleIsSameAddressChange(event, formik)}
                                    checked={isSameAddress}
                                 />Same as Above</label>
                              </div>
                           </div>
                           <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3.5">
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type={"text"}
                                    label={"Billing Email"}
                                    name={"billingEmail"}
                                    placeholder={"Enter Billing Email"}
                                 />
                              </div>
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type={"text"}
                                    label={"Address"}
                                    name={"billingAddress"}
                                    placeholder={"Enter Address"}
                                 />
                              </div>
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type={"text"}
                                    label={"City"}
                                    name={"billingCity"}
                                    placeholder={"Enter City"}
                                 />
                              </div>
                              <div className="relative">
                                 <FormikControl
                                    control="select"
                                    type="select"
                                    label={"State"}
                                    name={"billingCountrySubDivisionCode"}
                                    defaultOption={"Please select"}
                                    placeholder={"State"}
                                    options={StateCode}
                                    selected={initialValues.billingCountrySubDivisionCode}
                                 />
                              </div>
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type="text"
                                    label={"Zip Code"}
                                    name={"billingPostalCode"}
                                    placeholder={"Zip"}
                                    maxlength={5}
                                    onKeyDown={handlePostalCodeKeyDown}
                                 />
                              </div>
                              {/* <div className="relative">
                                 <label className="text-gray-600 text-[11px] md:text-xs font-medium hidden sm:block">&nbsp;</label>
                                 <div className="flex items-center h-[28px] sm:h-[42px] md:h-[46px]">
                                    <input
                                    type="checkbox"
                                    name="isSameAddress"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                       ;
                                       setIsSameAddress(e.target.checked)
                                    }
                                    }
                                    checked={isNoLimit}
                                    />
                                    <label className="text-gray-600 text-[11px] md:text-xs font-medium ml-2">Is Same Address</label>
                                 </div>
                              </div> */}
                           </div>
                           <div className="mt-3">
                              <span className="text-gray-700 text-[12px] md:text-sm font-medium">Data Visibility Options for Users</span>
                              {/* Radio buttons for Yes/No */}
                              <div className="sm:flex items-center mt-1.5">
                              <label className="inline-flex items-center text-gray-600 text-[11px] md:text-xs font-medium mr-4">
                                 <input
                                    type="radio"
                                    className="form-radio"
                                    name="isPropertySpecific"
                                    value="no"
                                    checked={!isPropertySpecific} // Set checked attribute based on state
                                    onChange={(event) => handlePropertyRadioButtonChange(event, formik)} // Handle change event
                                 />
                                 <span className="ml-1">All Data Visible to Users</span>
                              </label>
                              <label className="inline-flex items-center text-gray-600 text-[11px] md:text-xs font-medium mt-1 sm:mt-0">
                                 <input
                                    type="radio"
                                    className="form-radio"
                                    name="isPropertySpecific"
                                    value="yes"
                                    checked={isPropertySpecific} // Set checked attribute based on state
                                    onChange={(event) => handlePropertyRadioButtonChange(event, formik)} // Handle change event
                                 />
                                 <span className="ml-1">Property-Specific Data Visible to Users</span>
                              </label>
                              </div>
                              
                           </div>
                           <div className="mt-3 flex items-center">
                              <span className="text-gray-600 text-[11px] md:text-xs font-medium">Process Server Role</span>
                              {/* Radio buttons for Yes/No */}
                              <label className="inline-flex items-center text-gray-600 text-[11px] md:text-xs font-medium ml-2 mr-4">
                                 <input
                                    type="radio"
                                    className="form-radio"
                                    name="isProcessServer"
                                    value="yes"
                                    checked={isProcessServer} // Set checked attribute based on state
                                    onChange={(event) => handleRadioButtonChange(event, formik)} // Handle change event
                                 />
                                 <span className="ml-1">Yes</span>
                              </label>
                              <label className="inline-flex items-center text-gray-600 text-[11px] md:text-xs font-medium ml-2 mr-4">
                                 <input
                                    type="radio"
                                    className="form-radio"
                                    name="isProcessServer"
                                    value="no"
                                    checked={!isProcessServer} // Set checked attribute based on state
                                    onChange={(event) => handleRadioButtonChange(event, formik)} // Handle change event
                                 />
                                 <span className="ml-1">No</span>
                              </label>
                           </div>
                           
                           <div className="text-right">
                              <Button
                                 type="button"
                                 isRounded={false}
                                 title="Cancel"
                                 handleClick={closePopup}
                                 classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                              ></Button>
                              <Button
                                 title={(Object.keys(editCompany).length !== 0) ? "Update" : "Create"}
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
         )}
      </>
   );
};
export default Company;
