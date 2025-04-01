import React, { useState, useEffect } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import InputMask from "react-input-mask";
import { Form, Formik, FormikProps } from "formik";
import { FaPlusCircle, FaTimes } from "react-icons/fa";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import FormikControl from "components/formik/FormikControl";
import { StateCode } from "utils/constants";
import { IPropertyItems, PropertyFormModeType} from "interfaces/user.interface";
import { handlePostalCodeKeyDown, toCssClassName } from "utils/helper";
import { ISelectOptions } from "interfaces/all-cases.interface";
import { useAuth } from "context/AuthContext";
import { useUserContext } from "pages/invite-user/UserContext";
import { UserRole } from "utils/enum";
import Select from "components/formik/Select";
import UserService from "services/all-users.service"

type AddNewPropertyModalProps = {
   open: boolean;
   setOpen: (open: boolean) => void;
   mode: PropertyFormModeType;
   selectedProperty: IPropertyItems | null;
   setSelectedProperty: (property: IPropertyItems | null) => void;
};

const AddNewPropertyModal = (props: AddNewPropertyModalProps) => {
   const { open, setOpen, mode, selectedProperty, setSelectedProperty } = props;
   const [showSpinner, setShowSpinner] = useState<boolean>(false);

   const validationSchema = yup.object({
      propertyName: yup
      .string()     
      .required("Please enter property name"),
      propertyAddress: yup
      .string()     
      .required("Please enter address"),
      propertyCity: yup
      .string()     
      .required("Please enter city"),
      propertyState: yup
      .string()
      .required("Please select state code.")
      .max(2, "State Code must be of 2 characters."),
      propertyZip: yup
         .string()
         .min(5, "Zip code must be 5 digits.")
         .max(5, "Zip code must be 5 digits.")
         .required("Please enter Zip code."),
      propertyPhone: yup
         .string()
         .matches(
            /^(\(\d{3}\) ?|\d{3}-?)\d{3}-?\d{4}$/,
            "Please enter a valid phone number"
         ),
      propertyEmail: yup.string().email("Please enter a valid Email address"),
      
   });

   const initialValues: IPropertyItems = {
      id: selectedProperty?.id ?? "",
      propertyName: selectedProperty?.propertyName ?? "",
      propertyAddress: selectedProperty?.propertyAddress ?? "",
      propertyCity: selectedProperty?.propertyCity ?? "",
      propertyState: selectedProperty?.propertyState ?? "",
      propertyZip: selectedProperty?.propertyZip ?? "",
      propertyPhone: selectedProperty?.propertyPhone ?? "",
      propertyEmail: selectedProperty?.propertyEmail ?? "",
      numberOfUnits: selectedProperty?.numberOfUnits ?? 0,  
      clientId:selectedProperty?.clientId ?? "",
   };
   const [companyList, setCompanyList] = useState<ISelectOptions[]>([]);
   const { userRole } = useAuth();
   const {
      allCompanies,
      getProperties
   } = useUserContext();

   useEffect(() => {
      if(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)){
         var list = allCompanies.filter(x=>x.isPropertySpecific).map((item) => ({
            id: item.id,
            value: item.companyName
         }));
         setCompanyList(list);
      }      
   }, []);


   const handleAddNewProperty = async (formValues: IPropertyItems) => {
      ;
   
      // If clientId is undefined, assign the first company from the companyList as the default
      if (!formValues.clientId && companyList.length > 0) {
         formValues.clientId = companyList[0].id as string; // Ensure the companyList has at least one entry
      }
      setShowSpinner(true);
      // Make API request
      const response = await UserService.addEditProperty(selectedProperty?.id ?? "", formValues);
   
      // Check if the request was successful
      if (response.status === HttpStatusCode.Ok) {
         // Show success message
         toast.success(response.data.message, {
            position: toast.POSITION.TOP_RIGHT,
         });
   
         // Close modal and refresh properties
         setOpen(false);
         getProperties(1, 100, "");
      } else {
         // Show error message
         toast.error(response.statusText, {
            position: toast.POSITION.TOP_RIGHT,
         });
      }
      setShowSpinner(false)
   };
   

   const handlePlusClick = (formik: FormikProps<IPropertyItems>) => {

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
                        {mode === "create" ? "Create" : "Edit"} Property
                     </h3>
                  </div>
               </div>
               <Formik
                   initialValues={{
                     ...initialValues,
                     clientId: initialValues.clientId || companyList[0]?.id as string, // Set default to first company if not selected
                   }}
                  validationSchema={validationSchema}
                  onSubmit={handleAddNewProperty}
               >
                  {(formik) => (
                     <Form className="flex flex-col pt-1.5">
                        {(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)) &&
                              (<div className="relative sm:w-[50%] mb-3">
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
                                    onChange={(event: any) => {
                                       formik.setFieldValue("clientId", event.target.value);                                    
                                    }}
                                    options={companyList}
                                    // placeholder="Select an option"
                                    selectedValue={initialValues.clientId}
                                 />
                              </div>)
                           }
                        <div className="grid sm:grid-cols-3 gap-2.5 md:gap-3.5">
                           
                           <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="text"
                                 label={"Property Name"}
                                 name={"propertyName"}
                                 placeholder={"Enter Property Name"}
                                 autoFocus={true}
                              />
                           </div>
                           <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="text"
                                 label={"Property Address"}
                                 name={"propertyAddress"}
                                 placeholder={"Enter Property Address"}
                              />
                           </div>
                           <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="text"
                                 label={"Property City"}
                                 name={"propertyCity"}
                                 placeholder={"Enter Property City"}
                              />
                           </div>
                           <div className="relative">
                              <FormikControl
                                 control="select"
                                 type="select"
                                 label={"Property State"}
                                 name={"propertyState"}
                                 defaultOption={"Please select"}
                                 placeholder={"Property State"}
                                 options={StateCode}
                                 selected={initialValues.propertyState}
                              />
                           </div>
                           <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="text"
                                 label={"Property Zip"}
                                 name={"propertyZip"}
                                 placeholder={"Property Zip"}
                                 maxlength={5}
                                 onKeyDown={handlePostalCodeKeyDown}
                              />
                           </div>
                           <div className="relative">
                              <label htmlFor={"role"} className="text-gray-600 text-[11px] md:text-xs font-medium">
                                 Phone Number
                              </label>
                              <div>
                                 <InputMask
                                    mask="(999) 999-9999"
                                    maskChar=" "
                                    value={formik.values.propertyPhone}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    name="propertyPhone"
                                    id="propertyPhone"
                                    placeholder="Enter Phone Number"
                                    className="peer outline-none p-2.5 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none   " // Custom class for styling
                                 />
                                 {formik.touched.propertyPhone && formik.errors.propertyPhone ? (
                                    <div className="text-[11px] text-aidonicRed text-red-500">
                                       {formik.errors.propertyPhone}
                                    </div>
                                 ) : null}
                              </div>
                           </div>
                           <div className="relative">
                              <FormikControl
                                 control="input"
                                 type={"text"}
                                 label={"Property Email"}
                                 name={"propertyEmail"}
                                 placeholder={"Enter Property Email"}
                              />
                           </div>
                           <div className="relative">
                              <FormikControl
                                 control="input"
                                 type={"number"}
                                 label={"Number of Units"}
                                 name={"numberOfUnits"}
                                 placeholder={"Enter Number of Units"}
                              />
                           </div>

                           {/* <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="text"
                                 label={"Non-Signer User"}
                                 name={"nonSignerUser"}
                                 placeholder={"Enter Non-Signer User"}
                              />
                           </div>
                           <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="text"
                                 label={"Signer User"}
                                 name={"signerUser"}
                                 placeholder={"Enter Signer User"}
                              />
                           </div>
                           <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="text"
                                 label={"Admin User"}
                                 name={"adminUser"}
                                 placeholder={"Enter Admin User"}
                              />
                           </div> */}
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

export default AddNewPropertyModal;