import React, { useState, useEffect } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import InputMask from "react-input-mask";
import { Form, Formik, FormikProps } from "formik";
import { FaPlusCircle, FaTimes } from "react-icons/fa";
import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import DropdownPresentation from "components/common/dropdown/DropDown";
import Select from "components/formik/Select";
import { useUserContext } from "../UserContext";
import { useAuth } from "context/AuthContext";
import { UserRole } from "utils/enum";
import { RolesList } from "utils/constants";
import { getUserInfoFromToken, toCssClassName } from "utils/helper";
import HelperViewPdfService from "services/helperViewPdfService";
import AllUsersService from "services/all-users.service";
import { ISelectOptions } from "interfaces/late-notices.interface";
import { IUserItems, ICompanyItems } from "interfaces/all-users.interface";
import { ICommonSelectOptions } from "interfaces/common.interface";

type InviteUserProps = {
   showInviteUserModal: Boolean;
   handleInviteUserModal: (value: boolean) => void;
   courtOptions: ICommonSelectOptions[];
   handleModalClose:()=>void;
};

interface IUserInfo {
   id: any;
   email: string;
}

const InviteUsers = (props: InviteUserProps) => {
   const { userRole } = useAuth();
   const {
      allCompanies,
      editUser,
      showSpinner,
      setShowSpinner,
      permittedStates,
      fetchPermittedStates,
      fetchCompanyProperties,
      companyProperties,      
   } = useUserContext();
   const [isCompanyPropertySpecific, setIsCompanyPropertySpecific] = useState<boolean>(false);
   const [isAdminOrServerSelected, setIsAdminOrServerSelected] = useState<boolean>(editUser.role==UserRole.ChiefAdmin || editUser.role==UserRole.ChiefAdmin || editUser.role==UserRole.ChiefAdmin);
   //validation schema for signup model
   const validationSchema = yup.object().shape({
      email: yup
         .string()
         .email("Please enter a valid Email address")
         .required("Please enter your Email")
         .max(50, "The Email must not exceed 50 characters"),
      firstName: yup
         .string()
         .trim()
         .required("Please enter your First Name")
         .max(50, "The First name must not exceed 50 characters"),
      lastName: yup
         .string()
         .trim()
         .required("Please enter your Last Name")
         .max(50, "The Last name must not exceed 50 characters"),
      role: yup.string().required("Role is required"),
      phoneNumber: yup.string().matches(/^\(\d{3}\) \d{3}-\d{4}$/, "Please enter a valid US phone number").required("Please enter phone"),
      statesPermitted: yup.array()
         .min(1, "Please select at least one state.")
         .required("statesPermitted is a required field."),
         companyProperties: isCompanyPropertySpecific && !isAdminOrServerSelected
         ? yup.array()
             .min(1, "Please select at least one property.")
             .required("companyProperties is a required field.")
         : yup.array(),
   });

   const [isPopupOpen, setIsPopupOpen] = useState(props.showInviteUserModal);
   // const [companyList, setCompanyList] = useState<ISelectOptions[]>([]);
   const [isProcessServerdDocuments, setIsProcessServerdDocuments] = useState<boolean>(false);
   const [roles, setRoles] = useState<ISelectOptions[]>(RolesList);

   const [currentClientID,setCurrentClientId]=useState<string>("");

   const [loginUserDetails, setLoginUserDetails] = useState<IUserInfo>({
      id: "",
      email: ''
   });

   const loginUserInfo = JSON.parse(localStorage.getItem("userDetail") ?? "");
   const [selectedValues, setSelectedValues] = useState([{ id: "", value: "", disabled: false }]); 

   useEffect(() => {      ;
      const fetchUserInfo = async () => {
         if (loginUserInfo) {
            setLoginUserDetails({
               id: loginUserInfo.UserID,
               email: loginUserInfo.Email
            });
         }
      };

      fetchUserInfo();
   }, []);

   useEffect(() => {
      
      if (allCompanies.length > 0) {
          const userInfo = getUserInfoFromToken();
          setCurrentClientId(userInfo?.ClientID ?? "");
  
          const selectedCompanyId = userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin)? allCompanies[0].id : userInfo?.ClientID ?? "";
          const selectedCompany = allCompanies.find(company => company.id === selectedCompanyId);
  
          if (selectedCompany) {
              const { isPropertySpecific} = selectedCompany;  
              setIsCompanyPropertySpecific(isPropertySpecific);
              handleSetRoles(selectedCompany); 
          }  
          //setCompanyList(companyList);
      }
  }, []);
  

   useEffect(() => {  
      
      var data = localStorage.getItem("userDetail");
      if (data != null) {
         var id = JSON.parse(data).ClientID;
         // if (userRole.includes(UserRole.Admin)) {
         //    companyData(id);
         // }
      }
      if(!(Object.keys(editUser).length !== 0)){
         if(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)){
            fetchPermittedStates(allCompanies[0].id);
            fetchCompanyProperties(allCompanies[0].id);
         }else{
            fetchPermittedStates(JSON.parse(data??"").ClientID);
            fetchCompanyProperties(JSON.parse(data??"").ClientID);
         }       
      }         
      if(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)){
         setIsCompanyPropertySpecific(allCompanies[0].isPropertySpecific??false);
      }else{
        
         setIsCompanyPropertySpecific(allCompanies.find(x=>x.id==JSON.parse(data??"").ClientID)?.isPropertySpecific??false);
      } 
   }, []);

   useEffect(() => {  
      
      if((Object.keys(editUser).length !== 0)){
         if (editUser.role?.toLowerCase() === UserRole.ProcessServer.toLowerCase())
            setIsProcessServerdDocuments(true);
         fetchPermittedStates(editUser.userCompanyId??"");
         fetchCompanyProperties(editUser.userCompanyId??"");
         if(editUser.userCompany){
            handleSetRoles(editUser.userCompany);
            setIsCompanyPropertySpecific(editUser.userCompany.isPropertySpecific);
         }  
      }       

   }, [editUser]);

   const initialValues: IUserItems = {
      id: editUser?.id ?? "",
      isActive: editUser?.isActive ?? true, // Provide default value for isActive
      email: editUser?.email ?? "",
      firstName: editUser?.firstName ?? "",
      lastName: editUser?.lastName ?? "",
      password: "",
      confirmPassword: "",
      role: editUser?.role ?? "",
      userCompanyId: editUser?.userCompanyId ?? allCompanies[0].id,
      phoneNumber: editUser?.phoneNumber ?? "",
      processServerDocuments: editUser?.processServerDocuments?.length ? editUser?.processServerDocuments : [
         {
            courtCode: "",
            courtName: "",
            countyName: "",
            pdfBase64: "",
         }
      ],
      statesPermitted: editUser?.statesPermitted ?? [],
      companyProperties:editUser?.companyProperties??[],
   };

   const handleSignup = async (formValues: IUserItems) => {
      
      try {
         setShowSpinner(true);
         if(typeof(formValues.companyProperties) === 'string') formValues.companyProperties = [];
         // if (!formValues.userCompanyId && companyList.length > 0) {
         //    formValues.userCompanyId = companyList[0].id as string; // Ensure the companyList has at least one entry
         // }      
         if (
            formValues.role?.toLowerCase() === UserRole.ProcessServer.toLowerCase() &&
            formValues?.processServerDocuments
         ) {
            // Check for missing court names
            if (formValues.processServerDocuments.some(doc => !doc.courtName || !doc.fileName)) {
               toast.error("Please add required documents and fields in the Process Server Document.");
               return; // Exit function without further execution
            }

            // Check for duplicate court names
            const courtNames = formValues.processServerDocuments.map(doc => doc.courtName.toLowerCase());
            const duplicateCourt = courtNames.some((name, index) => courtNames.indexOf(name) !== index);

            if (duplicateCourt) {
               toast.error("Each document must have a unique court name.");
               return; // Exit function without further execution
            }
         }
         if (formValues.role?.toLowerCase() !== UserRole.ProcessServer.toLowerCase()) {
            formValues.processServerDocuments = [];
         }

         const response = (Object.keys(editUser).length !== 0) ? await AllUsersService.editUser(editUser.id,
            formValues
         ) : await AllUsersService.createUser(
            formValues
         );
         if (response.status === HttpStatusCode.Ok) {
            setShowSpinner(false);
            if (Object.keys(editUser).length === 0)
               toast.success(response.data.message);
            else
               toast.success(response.data.message);
            props.handleInviteUserModal(false);
            // getListOfUsers(1, 100, users.searchParam);
         }
      } catch (error) {
         console.error("Error:", error);
      } finally {
         setShowSpinner(false);
      }
   };

   const handlePlusClick = (formik: FormikProps<IUserItems>) => {
      const newDocument = {
         courtName: "",
         CountyName: "",
         pdfBase64: "",
      };

      // Update the form data model by adding the new optional service object
      formik.setFieldValue("processServerDocuments", [...formik.values.processServerDocuments ?? [], newDocument]);
      setSelectedValues([...selectedValues, { id: '', value: '', disabled: false }])
   };

   const handleCrossClick = (
      _index: number,
      formik: FormikProps<IUserItems>
   ) => {
      if (formik.values.processServerDocuments && formik.values.processServerDocuments.length >= 1) {
         // Use filter to create a new array without the element at the specified index
         let filteredRecords = formik.values.processServerDocuments.filter(
            (_, index) => index !== _index
         );
         // Update the form data model using Formik's setFieldValue
         formik.setFieldValue(`processServerDocuments`, filteredRecords);
      }
   };

   const handleDropdownChange = (
      index: number,
      event: React.ChangeEvent<HTMLSelectElement>,
      fieldName: string,
      formik: FormikProps<IUserItems>
   ) => {
      const selectedOption = props.courtOptions.find(item => item.id === event.target.value as string);
      const updatedValues: any = [...selectedValues];
      updatedValues[index] = { id: event.target.value as string, value: selectedOption?.value, disabled: false };
      setSelectedValues(updatedValues);
      formik.setFieldValue(`${fieldName}`, event.target.value as string);
      formik.setFieldValue(`processServerDocuments[${index}].courtName`, selectedOption?.value);
   };

   const handleFileChange = (
      formik: FormikProps<IUserItems>,
      index: number,
      event: React.ChangeEvent<HTMLInputElement>
   ) => {
      const file = event.target.files?.[0]; // Get the first selected file
      if (file) {
         // Check if the selected file is of type PDF
         if (file.type === "application/pdf") {
            // Convert the selected file to base64
            const reader = new FileReader();
            reader.onload = () => {
               const pdfBase64 = reader.result as string;
               const base64Data = pdfBase64.split(",")[1]; // Extracting only the base64 data part
               const fileName = file.name; // Base64 string of the PDF file
               const fileNameWithoutExtension = fileName.split('.').slice(0, -1).join('.');
               // Update the processServerDocuments.pdfBase64 field with base64 string
               formik.setFieldValue(
                  `processServerDocuments[${index}].pdfBase64`,
                  base64Data
               );
               formik.setFieldValue(
                  `processServerDocuments[${index}].fileName`,
                  fileNameWithoutExtension
               );
            };
            reader.readAsDataURL(file);
         } else {
            // Reset selected file and show error message
            toast.error("Please select a PDF file.");
         }
      }
   };

   const handleDocumentClick = async (url: string) => {
      HelperViewPdfService.GetPdfView(url);
   };
   const handleSetRoles=async(company:ICompanyItems)=>{
      const { isParentCompany,isProcessServer} = company;
      if(!isParentCompany&& !isProcessServer){
         setRoles(RolesList.filter(x=>x.id!==UserRole.ChiefAdmin && x.id!==UserRole.ProcessServer));
      }
      else if(!isParentCompany){
         setRoles(RolesList.filter(x=>x.id!==UserRole.ChiefAdmin));
      }
      else if(!isProcessServer){
         setRoles(RolesList.filter(x=>x.id!==UserRole.ProcessServer));
      }  
      else{
         setRoles(RolesList);
      }   
   }

   return (
      <>
         {isPopupOpen && (
            <Modal showModal={isPopupOpen} onClose={props.handleModalClose} width="max-w-3xl">
               {/* {showSpinner && <Spinner></Spinner>} */}
               <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
                  <div className="sm:flex sm:items-start">
                     <div className="text-center sm:text-left">
                        <h3
                           className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                           id="modal-title"
                        >
                           {(Object.keys(editUser).length !== 0) ? "Edit User Information" : "Create User"}
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
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type="text"
                                    label={"First Name"}
                                    name={"firstName"}
                                    placeholder={"Enter First Name"}
                                    autoFocus={true}
                                 />
                              </div>
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type={"text"}
                                    label={"Last Name"}
                                    name={"lastName"}
                                    placeholder={"Enter Last Name"}
                                 />
                              </div>
                              <div className="relative">
                                 <FormikControl
                                    control="input"
                                    type="text"
                                    label="Email"
                                    name="email"
                                    placeholder="Enter Email"
                                    disabled={loginUserDetails.id === initialValues.id} // Disable condition
                                 />
                              </div>
                              <div className="relative">
                                 <label
                                    htmlFor={"phoneNumber"}
                                    className="text-gray-600 text-[11px] md:text-xs font-medium"
                                 >
                                    Phone Number
                                 </label>
                                 <div>
                                    <InputMask
                                       mask="(999) 999-9999"
                                       maskChar=" "
                                       value={formik.values.phoneNumber}
                                       onChange={formik.handleChange}
                                       onBlur={formik.handleBlur}
                                       name="phoneNumber"
                                       id="phoneNumber"
                                       placeholder="Enter Phone Number"
                                       className="peer outline-none p-2.5 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none   " // Custom class for styling
                                    />
                                    {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
                                       <div className="text-[11px] text-aidonicRed text-red-500">{formik.errors.phoneNumber}</div>
                                    ) : null}

                                 </div>

                              </div>
                              <div className="relative ">
                                 <label
                                    htmlFor={"role"}
                                    className="text-gray-600 text-[11px] md:text-xs font-medium"
                                 >
                                    Role
                                 </label>
                                 <Select
                                    heading={"Roles"}
                                    name="role"
                                    defaultOption={"Please select"}
                                    options={roles}
                                    placeholder="Select an option"
                                    selectedValue={initialValues.role}
                                    disabled={loginUserDetails.id === initialValues.id}
                                    onChange={(event: any) => {
                                       formik.setFieldValue("role", event.target.value);
                                       const selectedRole = event.target.value;                                      
                                       if (selectedRole === UserRole.ProcessServer) {
                                          setIsProcessServerdDocuments(true);
                                       } 
                                       else {
                                          setIsProcessServerdDocuments(false);
                                       }  
                                       if(selectedRole==UserRole.Admin || selectedRole==UserRole.ProcessServer || selectedRole==UserRole.ChiefAdmin) {
                                          formik.setFieldValue("companyProperties", []);
                                          setIsAdminOrServerSelected(true);   
                                       }                                          
                                       else{
                                          setIsAdminOrServerSelected(false);   
                                          formik.setFieldValue("companyProperties", editUser.companyProperties??"");
                                       }
                                                                      
                                    }}
                                 />
                              </div>
                              {(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)) &&
                                 (<div className="relative ">
                                    <label
                                       htmlFor={"company"}
                                       className="text-gray-600 text-[11px] md:text-xs font-medium"
                                    >
                                       Company
                                    </label>
                                    <Select
                                       heading={"Company"}
                                       name="userCompanyId"
                                       onChange={(event: any) => {  
                                                                                  
                                          formik.setFieldValue("userCompanyId", event.target.value);
                                          fetchPermittedStates(event.target.value);
                                          var filteredData=allCompanies.find(x=>x.id==event.target.value);
                                          if(filteredData){                                             
                                             if(filteredData.isPropertySpecific){
                                                fetchCompanyProperties(event.target.value);
                                                setIsCompanyPropertySpecific(true);
                                             }
                                             else{
                                                setIsCompanyPropertySpecific(false);
                                             } 
                                             handleSetRoles(filteredData);                                 
                                          }                                                                                                                        
                                          formik.setFieldValue("statesPermitted", []);
                                          formik.setFieldValue("companyProperties", []);
                                       }}
                                       options={allCompanies.map((item) => ({
                                          id: item.id,
                                          value: item.companyName
                                      }))}
                                       selectedValue={initialValues.userCompanyId}
                                    />
                                 </div>)
                              }
                              <div>
                                 {permittedStates && 
                                 <FormikControl
                                    control="multiselect"
                                    type="select"
                                    label={"Permitted States"}
                                    name={"statesPermitted"}
                                    defaultOption={"Select"}
                                    placeholder={"State"}
                                    options={permittedStates.map((item) => ({
                                       id: item.stateId,
                                       value: item.stateName
                                    }))}
                                    selected={initialValues.statesPermitted}
                                 />
                                 }
                              </div>
                              {(isCompanyPropertySpecific && !isAdminOrServerSelected) && <div>                               
                               <FormikControl
                                  control="multiselect"
                                  type="select"
                                  label={"Properties"}
                                  name={"companyProperties"}
                                  defaultOption={"Select"}
                                  placeholder={"Properties"}
                                  options={companyProperties.map((item) => ({
                                    id: item.id??"",
                                    value: item.propertyName
                                 }))}
                                  selected={initialValues.companyProperties}
                               />                               
                            </div>}
                             
                           </div>
                           {isProcessServerdDocuments &&
                              <div className="court_payments">
                                 <div className="flex mt-3.5 items-center gap-3.5 -mb-1.5">
                                    <label className="font-medium">Add Process Server Documents</label>
                                    <FaPlusCircle
                                       style={{
                                          height: 20,
                                          width: 20,
                                          color: "#2472db",
                                          cursor: "pointer"
                                       }}
                                       onClick={() => handlePlusClick(formik)}
                                    />
                                 </div>
                                 {formik.values.processServerDocuments && formik.values.processServerDocuments.map((_, index) => (
                                    <div className="flex mt-2.5 items-center gap-2.5 sm:gap-3.5 pr-7 relative flex-col sm:flex-row">                                     
                                       <div className="w-full">
                                          <label className="text-gray-600 text-[11px] md:text-xs font-medium">Court Name</label>
                                          <DropdownPresentation
                                             heading={""}
                                             selectedOption={{ id: _.courtCode, value: _.courtName }}
                                             handleSelect={(event) => handleDropdownChange(index, event, `processServerDocuments[${index}].courtCode`, formik)}
                                             options={props.courtOptions}
                                             placeholder="Select Court Name"
                                          />
                                       </div>
                                       <div className="w-full">
                                          <label className="text-gray-600 text-[11px] md:text-xs font-medium">Select Document</label>

                                          <input
                                             type="file"
                                             accept="application/pdf"
                                             onChange={(event) => handleFileChange(formik, index, event)} // Pass formik, index, and event                          
                                          />

                                       </div>
                                       <button
                                          type="button" // Add this line
                                          onClick={() => { formik.values.processServerDocuments && handleDocumentClick(formik.values.processServerDocuments[index]?.docUri ?? "") }}
                                          className={`underline text-[#3b82f6] mr-1.5 py-2 px-1 ${formik.values.processServerDocuments && formik.values.processServerDocuments[index]?.docUri ? "" : "invisible"}`}
                                          style={{ cursor: 'pointer', paddingRight: '1.25rem' }}
                                       >
                                          <i className="fas fa-file-pdf"></i>
                                       </button>
                                       {index >= 0 && <>
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
                              </div>}
                           <div className="text-right pt-2.5">
                              <Button
                                 type="button"
                                 isRounded={false}
                                 title="Cancel"
                                 handleClick={props.handleModalClose}
                                 classes="text-[13px] md:text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                              ></Button>
                              <Button
                                 title={(Object.keys(editUser).length !== 0) ? "Update" : "Create"}
                                 type={"submit"}
                                 isRounded={false}
                                 disabled={showSpinner}
                                 classes="mt-2.5 py-2 md:py-2.5 px-4 inline-flex justify-center items-center gap-x-1.5 text-[11px] md:text-xs font-semibold rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none "
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
export default InviteUsers;
