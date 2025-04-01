import React, { useState, useEffect } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import InputMask from "react-input-mask";
import { Form, Formik } from "formik";
import Spinner from "components/common/spinner/Spinner";
import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import Select from "components/formik/Select";
import { IWritlaborItems, ICompanyItems } from "interfaces/writ-labor-interface";
import {
  ISelectOptions,
} from "interfaces/late-notices.interface";
import WritLaborService from "services/writ-labor.service";
import { useWritLaborContext } from "./WritLaborContext";
import { useAuth } from "context/AuthContext";
import { UserRole } from "utils/enum";
import { getUserInfoFromToken } from "utils/helper";

type InviteUserProps = {
  showWritLaborModal: Boolean;
  handleInviteUserModal: (value: boolean) => void;
};


const WritLaborModal = (props: InviteUserProps) => {
  const { userRole } = useAuth();
  const {
   allCompanies,
   getAllCompanies,
   getListOfWritLabor,
   editWritLabor,
   writLabors,
  } = useWritLaborContext();
  // toggle pop up
 // Ref for the first input field

  //validation schema for signup model
const validationSchema = yup.object({
  // email: yup
  //   .string()
  //   .email("Please enter a valid Email address")
  //   // .required("Please enter your Email")
  //   .max(50, "The Email must not exceed 50 characters"),
  email: yup
      .string()
      .email("Please enter a valid Email address")
      .max(50, "The Email must not exceed 50 characters")
      .when("isUser", {
        is: true, // Only make email required if isUser is true
        then: (schema) => schema.required("Please enter your Email"),
      }),

  firstName: yup
    .string()
    .trim()
    .required("Please enter your first name")
    .max(50, "The First name must not exceed 50 characters"),
  lastName: yup
    .string()
    .trim()
    .required("Please enter your last name")
    .max(50, "The Last name must not exceed 50 characters"),
  // phone: yup.string().matches(/^\(\d{3}\) \d{3}-\d{4}$/, "Please enter a valid US phone number").required("Please enter phone"),
  phone: yup.string().matches(/^\(\d{3}\) \d{3}-\d{4}$/, "Please enter a valid US phone number"),

  // userCompanyId:(userRole.includes(UserRole.Admin))? yup.string() : yup.string().required("Company is required"),
});

  const [isPopupOpen, setIsPopupOpen] = useState(props.showWritLaborModal);
  const [showInviteUsers, setInviteUsers] = useState<boolean>(false);
  // State to hold the late notices spinner
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [companyList,setCompanyList]=useState<ISelectOptions[]>([]);
  const [isUser,setIsUser]=useState<boolean>(false);
  const [company,setCompany]=useState<ICompanyItems>();
const userInfo = getUserInfoFromToken();
  useEffect(()=>{
    
    var list = allCompanies.map((item) => ({
      id: item.id,
      value: item.companyName
    }));
    if(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)){      
      list = list.filter(item => item.id !== userInfo?.ClientID);
      // Add the new item
      list.unshift({ id: userInfo?.ClientID ?? "", value: "All Companies" });
    }    
    setCompanyList(list);   
  },[]);

  const initialValues: IWritlaborItems & {
    email: string;
    firstName: string;
    lastName: string;
    clientId:string;
    phone:string;
    isUser:boolean;
  } = {
    email: editWritLabor?.email??"",
    firstName:editWritLabor?.firstName?? "",
    lastName:editWritLabor?.lastName?? "",
    clientId:editWritLabor?.clientId??userInfo?.ClientID??"",
    phone:editWritLabor?.phone??"",
    isUser:false,
  };

  const handleSignup = async (formValues: IWritlaborItems) => {
       formValues.email = formValues.email ??"";
       formValues.phone = formValues.phone ?? "";
       setShowSpinner(true);
    const response =(Object.keys(editWritLabor).length !== 0)?await WritLaborService.editWritLabor(editWritLabor.id,
      formValues
    ): await WritLaborService.createWritLabor(
      formValues
    );
    if (response.status === HttpStatusCode.Ok) {
      setShowSpinner(false); 
      if(Object.keys(editWritLabor).length === 0)
        toast.success(response.data.message);
      else
      toast.success("Writ Labor Successfully Updated");
      props.handleInviteUserModal(false);  
      if(Object.keys(editWritLabor).length !== 0)
      {
      getListOfWritLabor(writLabors.currentPage,writLabors.pageSize,""); 
      }
      else
      {
        getListOfWritLabor(1,100,"");
      }  
    }   
  };

  const closePopup = () => {
    props.handleInviteUserModal(false);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, formik: any) => {
    const value = event.target.checked; // Use checked property directly
    setIsUser(value);
    formik.setFieldValue("isUser", value); // Update formik field value
  };
  

  return (
    <>
      {isPopupOpen && (
        <Modal showModal={isPopupOpen} onClose={closePopup} width="max-w-3xl">
          {showSpinner && <Spinner></Spinner>}
          <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
            <div className="sm:flex sm:items-start">
              <div className="text-center sm:text-left">
                <h3
                  className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                  id="modal-title"
                >
                  {(Object.keys(editWritLabor).length !== 0)?"Edit Writ Labor Information":"Create Writ Labor"}
                </h3>
              </div>
            </div>
            {showSpinner ? <Spinner></Spinner> : null}
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
                        type={"text"}
                        label={"Email"}
                        name={"email"}
                        placeholder={"Enter Email"}
                      />
                    </div>
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
                        name="clientId"
                        //defaultOption={"Please select"}
                        handleSelect={(event: any) => {
                          
                        }}
                        options={companyList}
                       // placeholder="Select an option"
                        selectedValue={initialValues.clientId}
                      />
                    </div>)
                    }                  
                   
                  </div>
                  {
                    (Object.keys(editWritLabor).length === 0) && (
                      
                      <div className="flex items-center mt-4">
                        <input
                          type="checkbox"
                          className="form-checkbox"
                          name="isUser"
                          checked={isUser} // Set checked attribute based on state
                          onChange={(event) => handleCheckboxChange(event, formik)} // Handle change event
                        />
                        <span className="text-gray-600 text-[11px] md:text-xs font-medium ml-2">Create this as a user as well</span>
                      </div>
                 
                    )
                  }               

                  <div className="text-right pt-2.5">
                  <Button
                        type="button"
                        isRounded={false}
                        title="Cancel"
                        handleClick={closePopup}
                        classes="text-[11px] md:text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                      ></Button>
                    <Button
                      title={(Object.keys(editWritLabor).length !== 0 )?"Update":"Create"}
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
export default WritLaborModal;
