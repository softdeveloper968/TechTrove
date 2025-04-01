import React, { useEffect, useState, Fragment } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { Form, Formik, FormikProps } from "formik";
import { FaPlusCircle, FaTimes } from "react-icons/fa";
import {
   ISelectOptions,
   ITylerConfigFormValues,
   ITylerConfigItems,
   DataList
} from "interfaces/tyler.interface";
import vm from "utils/validationMessages";
import { CourtTypeOptions, StateCode ,CourtTypeOptionTX } from "utils/constants";
import TylerService from "services/tyler.service";
import { useTylerConfigContext } from "./TylerConfigContext";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import FormikControl from "components/formik/FormikControl";
import arrow from "assets/images/select_arrow.png";

type TylerConfigModalProps = {
   open: boolean;
   setOpen: (open: boolean) => void;
   mode: "create" | "edit" | "clone";
   selectedConfig: ITylerConfigItems | null;
   setSelectedConfig: (config: ITylerConfigItems | null) => void;
   selectedCounty: string;
};

const validationSchema = yup.object({
   countyName: yup.string().required(vm.countyName.required),
   locationCode: yup.string().required(vm.locationCode.required),
   state: yup.string().required(vm.state.required),
   caseTypeCode: yup.string().required(vm.caseTypeCode.required),
   filingCode: yup.string().required(vm.filingCode.required),
   filingDescription: yup.string().required(vm.filingDescription.required),
   preliminaryCopyEmail: yup
      .string()
      .test("valid-emails", vm.email.format, (value) => {
         if (!value) return true; // Allow empty value
         const emails = value.split(",").map((email) => email.trim());
         const isValid = emails.every((email) =>
            yup.string().email().isValidSync(email)
         );
         return isValid;
      }),
   ccEmail: yup
      .string()
      .test("valid-emails", vm.email.format, (value) => {
         if (!value) return true; // Allow empty value
         const emails = value.split(",").map((email) => email.trim());
         const isValid = emails.every((email) =>
            yup.string().email().isValidSync(email)
         );
         return isValid;
      }),
   filingType: yup.string().required(vm.filingType.required),
   courtType: yup.string().required(vm.courtType.required),
   requiredSupplementDoc: yup.boolean(),
   supplementCode: yup.string().when('requiredSupplementDoc', {
      is: true,
      then: (schema) => schema.required(vm.supplementCode.required),
      otherwise: (schema) => schema.nullable(),
   }),
   supplementDescription: yup.string().when('requiredSupplementDoc', {
      is: true,
      then: (schema) => schema.required(vm.supplementDescription.required),
      otherwise: (schema) => schema.nullable(),
   }),
   //maxPayment: yup.string().required(vm.maxPayment.required),
   //locationName: yup.string().required(vm.locationName.required),
   //caseTypeName: yup.string().required(vm.caseTypeName.required),
   //filingCodeName: yup.string().required(vm.filingCodeName.required),
   // optionalService: yup.array().of(
   //   yup.object().shape({
   //     quantity: yup
   //       .number()
   //       .integer(vm.quantity.integer),
   //       //.max(9999, vm.quantity.max),
   //       //.required(vm.quantity.required),
   //     maxQuantity: yup
   //       .number()
   //       .integer(vm.maxQuantity.integer),
   //      // .max(9999, vm.maxQuantity.max),
   //       //.required(vm.maxQuantity.required),
   //     useDefendantCount: yup.string(),//.required("useDefendantCount is required"),
   //     useAdditionalDefendantCount: yup.string(),//.required("useAdditionalDefendantCount is required"),
   //     excludeAndAllOther: yup.string(),//.required("excludeAndAllOther is required"),
   //   })
   // ),
});

const TylerConfigModal = (props: TylerConfigModalProps) => {
   const { open, setOpen, mode, selectedConfig, setSelectedConfig, selectedCounty } = props;
   const { getTylerConfigs, setShowSpinner, filingTypeList, tylerConfigs, showSpinner } = useTylerConfigContext();
   const [courtOptions, setCourtOptions] = useState<ISelectOptions[]>([]);
   const [caseTypeOptions, setCaseTypeOptions] = useState<ISelectOptions[]>([]);
   const [caseCategoryOptions, setCaseCategoryOptions] = useState<ISelectOptions[]>([]);
   const [filingCodeOptions, setFilingCodeOptions] = useState<ISelectOptions[]>([]);
   const [supplementCodeOptions, setSupplementCodeOptions] = useState<ISelectOptions[]>([]);
   const [optionalServices, setOptionalServices] = useState<ISelectOptions[]>([]);
   const [filingTypeOptions, setFilingTypeOptions] = useState<ISelectOptions[]>([]);
   const [selectedValues, setSelectedValues] = useState([
      { id: "", value: "", disabled: false },
   ]);

   const initialValues: ITylerConfigFormValues = {
      id: selectedConfig?.id ?? "",
      feeCalcOnly: selectedConfig?.feeCalcOnly ?? false,
      maxPayment: selectedConfig?.maxPayment ?? null,
      ccEmail: selectedConfig?.ccEmail ?? "",
      preliminaryCopyEmail: selectedConfig?.preliminaryCopyEmail ?? "",
      caseTypeCode: selectedConfig?.caseTypeCode ?? "",
      countyName: selectedConfig?.countyName ?? "",
      locationCode: selectedConfig?.locationCode ?? "",
      locationName: selectedConfig?.locationName ?? "",
      state: selectedConfig?.state ?? "",
      // locationCode: "",    
      caseTypeName: selectedConfig?.caseTypeName ?? "",
      filingCode: selectedConfig?.filingCode ?? "",
      filingCodeName: selectedConfig?.filingCodeName ?? "",
      filingDescription: selectedConfig?.filingDescription ?? "",
      caseCategoryCode:selectedConfig?.caseCategoryCode ?? "",
      caseCategoryName:selectedConfig?.caseCategoryName ?? "",
      optionalService: selectedConfig?.optionalService?.length ? selectedConfig?.optionalService : [
         {
            optionalServiceName: "",
            optionalServiceCode: "",
            quantity: "",
            maxQuantity: "",
            isDefendantCount: false,
            isAdditionalDefendantCount: false,
            isAllOther: false
         }
      ],
      fileIntoExistingCase: selectedConfig?.fileIntoExistingCase ?? false,
      filingType: selectedConfig?.filingType ?? "",
      courtType: selectedConfig?.courtType ?? "",
      requiredSupplementDoc: selectedConfig?.requiredSupplementDoc ?? false,
      supplementCode: selectedConfig?.supplementCode ?? "",
      supplementCodeName: selectedConfig?.supplementCodeName ?? "",
      supplementDescription: selectedConfig?.supplementDescription ?? "",
      isActive: selectedConfig?.isActive ?? false
   };

   useEffect(() => {
      const options: ISelectOptions[] = filingTypeList.map((item) => ({
         id: item.name,
         value: item.name,
      }));
      var sortedOptions = options.sort((a, b) => a.value.localeCompare(b.value));
      setFilingTypeOptions(sortedOptions);

   }, []);


   useEffect(() => {
      if (mode !== "create") {
         handleSetCourtValues(selectedConfig?.state ?? "", selectedConfig?.fileIntoExistingCase ?? false);
         handleSetCaseTypeValues(selectedConfig?.state ?? "", selectedConfig?.locationCode ?? "", selectedConfig?.fileIntoExistingCase ?? false);       
         if(selectedConfig?.state === "TX")
            {
               handleSetCaseCategoryValues(selectedConfig?.state??"", selectedConfig?.locationCode ?? "",selectedConfig?.fileIntoExistingCase ?? false,selectedConfig?.caseCategoryCode ?? "")
            }
         handleSetFilingCodeValues(selectedConfig?.state ?? "", selectedConfig?.locationCode ?? "", selectedConfig?.caseTypeCode ?? "", selectedConfig?.fileIntoExistingCase ?? false, selectedConfig?.caseCategoryCode ?? "");
         handleSetSupplementCodeDropdown(selectedConfig?.state ?? "", selectedConfig?.locationCode ?? "", selectedConfig?.caseTypeCode ?? "", selectedConfig?.fileIntoExistingCase ?? false, selectedConfig?.caseCategoryCode ?? "")
         handleSetOptionalServiceValues(selectedConfig?.state ?? "", selectedConfig?.locationCode ?? "", selectedConfig?.caseTypeCode ?? "", selectedConfig?.filingCode ?? "", selectedConfig?.fileIntoExistingCase ?? false, selectedConfig?.caseCategoryCode ?? "")
      }

   }, []);

   const getDropdownValues = async (state: string, court: string, caseType: string, filingCode: string, fileIntoExistingCase: boolean,category:string) => {

      const apiResponse = await TylerService.getCourtsByState(state, court, caseType, filingCode, fileIntoExistingCase,category);
      if (apiResponse.status === HttpStatusCode.Ok) {
         return apiResponse.data as DataList[];
      }
      else
         return [];
   };

   const handleSetCourtValues = async (state: string, fileIntoExistingCase: boolean) => {
      setShowSpinner(true);
      try {
         var data = await getDropdownValues(state, "", "", "", fileIntoExistingCase,"");
         const courtOptions = data.map((item: DataList) => {
            return {
               id: item.code,
               value: item.name
            } as ISelectOptions;
         });
         setCourtOptions(courtOptions);

      } finally {
         setShowSpinner(false);
      }

   };

   const handleFileIntoExistingCaseValues = async (fieldName: string, value: boolean, formik: FormikProps<ITylerConfigFormValues>) => {
      setShowSpinner(true);
      handleCheckboxChange(
         `fileIntoExistingCase`,
         value,
         formik
      )
      setCourtOptions([]);
      setCaseTypeOptions([]);
      setCaseCategoryOptions([]);
      setFilingCodeOptions([]);
      setOptionalServices([]);
      try {
         var data = await getDropdownValues(formik.values.state, "", "", "", value,"");
         const courtOptions = data.map((item: DataList) => {
            return {
               id: item.code,
               value: item.name
            } as ISelectOptions;
         });
         setCourtOptions(courtOptions);
      } finally {
         setShowSpinner(false);
      }

   };

   const handleSetCaseTypeValues = async (state: string, court: string, fileIntoExistingCase: boolean) => {
      if (court !== "") {
         setShowSpinner(true);
         try {
            var data = await getDropdownValues(state, court, "", "", fileIntoExistingCase,"");
            const caseTypeOptions = data.map((item: DataList) => {
               return {
                  id: item.code,
                  value: item.name
               } as ISelectOptions;
            });
            if (state === "TX") {
               setCaseCategoryOptions(caseTypeOptions);
            }
            else {
               setCaseTypeOptions(caseTypeOptions);
            }
         } finally {
            setShowSpinner(false);
         }
      }
      else {
         setCaseTypeOptions([]);
         setCaseCategoryOptions([]);
      }

   };
   const handleSetCaseCategoryValues = async (state: string, court: string, fileIntoExistingCase: boolean, category: string) => {
      if (court !== "") {
         setShowSpinner(true);
         try {
            var data = await getDropdownValues(state, court, "", "", fileIntoExistingCase, category);
            const caseTypeOptions = data.map((item: DataList) => {
               return {
                  id: item.code,
                  value: item.name
               } as ISelectOptions;
            });
            setCaseTypeOptions(caseTypeOptions);
         } finally {
            setShowSpinner(false);
         }
      }
      else {
         setCaseTypeOptions([]);
      }

   };

   const handleSetFilingCodeValues = async (state: string, court: string, caseType: string, fileIntoExistingCase: boolean,category:string) => {
      if (caseType !== "") {
         setShowSpinner(true);
         try {
            var data = await getDropdownValues(state, court, caseType, "", fileIntoExistingCase,category);
            const filingCodeOptions = data.map((item: DataList) => {
               return {
                  id: item.code,
                  value: item.name
               } as ISelectOptions;
            });
            setFilingCodeOptions(filingCodeOptions);
         } finally {
            setShowSpinner(false);
         }
      }
      else {
         setFilingCodeOptions([]);
      }
   };

   const handleSetSupplementCodeDropdown = async (state: string, court: string, caseType: string, existingCase: boolean,category:string) => {
      if (caseType !== "") {
         setShowSpinner(true);
         try {
            const data = await getDropdownValues(state, court, caseType, "", existingCase,category);
            const supplementCodeOptions = data.map((item: DataList) => {
               return {
                  id: item.code,
                  value: item.name
               } as ISelectOptions;
            });
            setSupplementCodeOptions(supplementCodeOptions);
         } finally {
            setShowSpinner(false);
         }
      }
      else {
         setSupplementCodeOptions([]);
      }
   };

   const handleSetOptionalServiceValues = async (state: string, court: string, caseType: string, filing: string, fileIntoExistingCase: boolean,category:string) => {
      if (filing !== "") {
         setShowSpinner(true);
         try {
            var data = await getDropdownValues(state, court, caseType, filing, fileIntoExistingCase,category);
            const optionalServicesOptions = data.map((item: DataList) => {
               return {
                  id: item.code,
                  value: item.name
               } as ISelectOptions;
            });
            setOptionalServices(optionalServicesOptions);
         } finally {
            setShowSpinner(false);
         }
      }
      else {
         setOptionalServices([]);
      }
   };

   const handleTylerConfig = async (formValues: ITylerConfigFormValues) => {
      const configRequest: any = {
         locationCode: formValues.locationCode,
         locationName: formValues.locationName,
         countyName: formValues.countyName,
         state: formValues.state,
         caseTypeCode: formValues.caseTypeCode,
         caseTypeName: formValues.caseTypeName,
         preliminaryCopyEmail: formValues.preliminaryCopyEmail,
         ccEmail: formValues.ccEmail,
         filingCode: formValues.filingCode,
         filingCodeName: formValues.filingCodeName,
         filingDescription: formValues.filingDescription,
         maxPayment: formValues.maxPayment,
         feeCalcOnly: formValues.feeCalcOnly,
         caseCategoryCode:formValues.caseCategoryCode,
         caseCategoryName:formValues.caseCategoryName,
         optionalService: formValues.optionalService
            .filter(item =>
               item.optionalServiceName !== null && item.optionalServiceName !== "" &&
               item.optionalServiceCode !== null && item.optionalServiceCode !== ""
            )
            .map((item) => ({
               optionalServiceName: item.optionalServiceName,
               optionalServiceCode: item.optionalServiceCode,
               quantity: item.quantity !== "" ? item.quantity : null,
               maxQuantity: item.maxQuantity !== "" ? item.maxQuantity : null,
               isDefendantCount: item.isDefendantCount,
               isAdditionalDefendantCount: item.isAdditionalDefendantCount,
               isAllOther: item.isAllOther,
            })),
         fileIntoExistingCase: formValues.fileIntoExistingCase,
         courtType: formValues.courtType,
         filingType: formValues.filingType,
         requiredSupplementDoc: formValues.requiredSupplementDoc,
         supplementCode: formValues.supplementCode,
         supplementCodeName: formValues.supplementCodeName,
         supplementDescription: formValues.supplementDescription,
         isActive: formValues.isActive
      };
      setShowSpinner(true);
      const updateRequest = { ...configRequest, id: formValues.id };
      const response = mode === "edit"
         ? await TylerService.editTylerConfig(updateRequest)
         : await TylerService.createTylerConfig(configRequest);
      //const response = await TylerService.createTylerConfig(configRequest);

      if (response.status === HttpStatusCode.Ok) {
         setOpen(false);
         if (mode === "edit") {
            getTylerConfigs(tylerConfigs.currentPage, tylerConfigs.pageSize, '', selectedCounty);
         }
         else {
            getTylerConfigs(1, 100, '', selectedCounty);
         }
         setSelectedConfig(null);
         toast.success(response.data.message);
      } else {
         toast.error(response.data.message);
      }
      setShowSpinner(false);
   };

   const handlePlusClick = (formik: FormikProps<ITylerConfigFormValues>) => {
      if (formik.values.optionalService && formik.values.optionalService.length < 5) {
         // Create a new Optional Service object with default values
         const newOptionalService = {
            quantity: "",
            maxQuantity: "",
            isDefendantCount: false,
            isAdditionalDefendantCount: false,
            isAllOther: false
         };

         // Update the form data model by adding the new optional service object
         formik.setFieldValue("optionalService", [...formik.values.optionalService, newOptionalService]);
         setSelectedValues([...selectedValues, { id: '', value: '', disabled: false }])
      }
   };

   // Function to handle clicking the cross icon to remove an input field
   const handleCrossClick = (
      _index: number,
      formik: FormikProps<ITylerConfigFormValues>
   ) => {

      if (formik.values.optionalService && formik.values.optionalService.length > 1) {
         // Use filter to create a new array without the element at the specified index
         let filteredRecords = formik.values.optionalService.filter(
            (_, index) => index !== _index
         );
         // Update the form data model using Formik's setFieldValue
         formik.setFieldValue("optionalService", filteredRecords);
      }
   };

   const handleInputChange = (
      fieldName: string,
      value: string | number | null,
      formik: FormikProps<ITylerConfigFormValues>
   ) => {
      // Update the form data model using Formik's setFieldValue
      formik.setFieldValue(`${fieldName}`, value);
   };

   const handleCheckboxChange = (
      fieldName: string,
      value: boolean,
      formik: FormikProps<ITylerConfigFormValues>
   ) => {
      formik.setFieldValue(`${fieldName}`, value);
   };

   const handleDropdownChange = (
      index: number,
      value: string,
      fieldCodeName: string,
      formik: FormikProps<ITylerConfigFormValues>,
      name: string,
      fieldName: string
   ) => {

      const updatedValues: any = [...selectedValues];
      updatedValues[index] = { id: value, value: "", disabled: false };
      setSelectedValues(updatedValues);
      formik.setFieldValue(`${fieldCodeName}`, value);
      formik.setFieldValue(`${fieldName}`, name);
   };

   const renderOptions = (options: ISelectOptions[], index: number) => {

      return (
         <>
            <option value="">Select an option</option>
            {options.map((value) => (
               <option key={value.value} value={value.id}>
                  {value.value}
               </option>
            ))}
         </>
      );
   };

   const resetOptionalServices = (formik: FormikProps<ITylerConfigFormValues>) => {
      const initialOptionalService = [{
         optionalServiceName: "",
         optionalServiceCode: "",
         quantity: "",
         maxQuantity: "",
         isDefendantCount: false,
         isAdditionalDefendantCount: false,
         isAllOther: false
      }];

      formik.setFieldValue("optionalService", initialOptionalService);
   };

   return (
      <Modal showModal={open} onClose={() => setOpen(false)} width="max-w-5xl">
         <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
            <div className="sm:flex sm:items-start">
               <div className="my-2.5 text-center md:my-0 sm:text-left">
                  <h3
                     className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                     id="modal-title"
                  >
                     {mode === "edit" ? "Edit" : "Create"} Tyler Config
                  </h3>
               </div>
            </div>
            <div className="relative pt-1 flex-auto overflow-y-auto">
               <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={handleTylerConfig}
               >
                  {(formik) => {
                     return (
                        <Form className="flex flex-col">
                           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 md:gap-3.5">
                              <div className="relative text-left">
                                 <FormikControl
                                    control="select"
                                    type="select"
                                    label={"State"}
                                    name={"state"}
                                    defaultOption={"Please select an option"}
                                    placeholder={"State"}
                                    options={StateCode}
                                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                                       formik.setFieldValue("state", evt.target.value);
                                       formik.setFieldValue("locationCode", "");
                                       formik.setFieldValue("locationName", "");
                                       formik.setFieldValue("caseTypeCode", "");
                                       formik.setFieldValue("caseTypeName", "");
                                       formik.setFieldValue("filingCode", "");
                                       formik.setFieldValue("filingCodeName", "");
                                       formik.setFieldValue("caseCategoryCode","");
                                       formik.setFieldValue("caseCategoryName", "");
                                       setCourtOptions([]);
                                       setCaseTypeOptions([]);
                                       setCaseCategoryOptions([]);
                                       setFilingCodeOptions([]);
                                       setOptionalServices([]);
                                       resetOptionalServices(formik);
                                       handleSetCourtValues(evt.target.value, formik.values.fileIntoExistingCase);
                                    }}
                                 />
                              </div>
                              <div className="relative text-left">
                                 <FormikControl
                                    control="input"
                                    type="text"
                                    label={"County"}
                                    name={"countyName"}
                                    placeholder={"County"}
                                 //  disabled={courtOptions.length}
                                 />
                              </div>
                              <div className="relative text-left">
                                 <FormikControl
                                    control="select"
                                    type="select"
                                    label={"Filing Type"}
                                    name={"filingType"}
                                    defaultOption={"Please select an option"}
                                    placeholder={"Filing Type"}
                                    options={filingTypeOptions}
                                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                                       formik.setFieldValue("filingType", evt.target.value);
                                    }}
                                 />
                              </div>
                              <div className="relative text-left">
                                 <FormikControl
                                    control="select"
                                    type="select"
                                    label={"Court Type"}
                                    name={"courtType"}
                                    defaultOption={"Please select an option"}
                                    placeholder={"Court Type"}
                                    options={ formik.values.state === "TX" ?  CourtTypeOptionTX : CourtTypeOptions}
                                    onChange={(evt: React.ChangeEvent<HTMLInputElement>) => {
                                       ;
                                       formik.setFieldValue("courtType", evt.target.value);
                                    }}
                                 />
                              </div>
                              <div className="relative text-left sm:pt-6">
                                 <div className="flex items-center flex-row-reverse justify-end gap-1 sm:h-[34px] md:h-[38px]">
                                    <FormikControl
                                       control="checkbox"
                                       type="checkbox"
                                       label={"File Into Existing Case"}
                                       name={`fileIntoExistingCase`}
                                       checked={formik.values.fileIntoExistingCase}
                                       onChange={(isChecked: boolean) => {
                                          // handleCheckboxChange(
                                          //   `fileIntoExistingCase`,
                                          //   isChecked,
                                          //   formik
                                          // )
                                          formik.setFieldValue("locationCode", "");
                                          formik.setFieldValue("locationName", "");
                                          resetOptionalServices(formik);
                                          handleFileIntoExistingCaseValues(`fileIntoExistingCase`, isChecked, formik)
                                       }}
                                    />
                                 </div>

                              </div>
                              <div className="relative text-left">
                                 <FormikControl
                                    control="select"
                                    type="select"
                                    label={"Location/Court Name"}
                                    name={"locationCode"}
                                    defaultOption={"Please select an option"}
                                    placeholder={"Select"}
                                    options={courtOptions}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                       formik.handleChange(e);
                                       setCaseTypeOptions([]);
                                       setCaseCategoryOptions([]);
                                       setFilingCodeOptions([]);
                                       setOptionalServices([]);
                                       formik.setFieldValue("locationCode", e.target.value);
                                       formik.setFieldValue("locationName", e.target.selectedOptions[0].textContent);
                                       formik.setFieldValue("caseTypeCode", "");
                                       formik.setFieldValue("caseTypeName", "");
                                       formik.setFieldValue("caseCategoryCode", "");
                                       formik.setFieldValue("caseCategoryName", "");
                                       formik.setFieldValue("filingCode", "");
                                       formik.setFieldValue("filingCodeName", "");
                                       resetOptionalServices(formik);
                                       handleSetCaseTypeValues(formik.values.state, e.target.value, formik.values.fileIntoExistingCase);
                                    }

                                       // handleSelectInputChange("locationName", e.target.value as string, formik)
                                    }
                                 />
                              </div>
                              {
                                 formik.values.state === "TX"&&<div className="relative text-left">
                                 <FormikControl
                                    control="select"
                                    type="select"
                                    label={"Case Category"}
                                    name={"caseCategoryCode"}
                                    defaultOption={"Please select an option"}
                                    placeholder={"Select"}
                                    options={caseCategoryOptions}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                       formik.setFieldValue("caseCategoryCode", e.target.value);
                                       formik.setFieldValue("caseCategoryName", e.target.selectedOptions[0].textContent);
                                       formik.setFieldValue("caseTypeCode", "");
                                       formik.setFieldValue("caseTypeName", "");
                                       formik.setFieldValue("filingCode", "");
                                       formik.setFieldValue("filingCodeName", "");
                                       resetOptionalServices(formik);
                                       handleSetCaseCategoryValues(formik.values.state, formik.values.locationCode, formik.values.fileIntoExistingCase,e.target.value);
                                       //handleSetCourtValues(formik.values.state,e.target.value,"");
                                    }
                                       // handleSelectInputChange("locationName", e.target.value as string, formik)
                                    }
                                 />
                              </div>
                              }                         
                              <div className="relative text-left">
                                 <FormikControl
                                    control="select"
                                    type="select"
                                    label={"Case Type"}
                                    name={"caseTypeCode"}
                                    defaultOption={"Please select an option"}
                                    placeholder={"Select"}
                                    options={caseTypeOptions}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                       formik.setFieldValue("caseTypeCode", e.target.value);
                                       formik.setFieldValue("caseTypeName", e.target.selectedOptions[0].textContent);
                                       formik.setFieldValue("filingCode", "");
                                       formik.setFieldValue("filingCodeName", "");
                                       resetOptionalServices(formik);
                                       handleSetFilingCodeValues(formik.values.state, formik.values.locationCode, e.target.value, formik.values.fileIntoExistingCase,formik.values.caseCategoryCode);
                                       //handleSetCourtValues(formik.values.state,e.target.value,"");
                                    }
                                       // handleSelectInputChange("locationName", e.target.value as string, formik)
                                    }
                                 />
                              </div>
                              <div className="relative text-left">
                                 <FormikControl
                                    control="select"
                                    type="select"
                                    label={"Filing Code"}
                                    name={"filingCode"}
                                    defaultOption={"Please select an option"}
                                    placeholder={"Select"}
                                    options={filingCodeOptions}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                       formik.setFieldValue("filingCode", e.target.value);
                                       formik.setFieldValue("filingCodeName", e.target.selectedOptions[0].textContent);
                                       resetOptionalServices(formik);
                                       handleSetOptionalServiceValues(formik.values.state, formik.values.locationCode, formik.values.caseTypeCode, e.target.value, formik.values.fileIntoExistingCase,formik.values.caseCategoryCode );
                                    }
                                       // handleSelectInputChange("locationName", e.target.value as string, formik)
                                    }
                                 />
                              </div>
                              <div className="relative text-left">
                                 <FormikControl
                                    control="input"
                                    type="text"
                                    label={"Filing Description"}
                                    name={"filingDescription"}
                                    placeholder={"Filing Description"}
                                 />
                              </div>
                              <div className="relative text-left">
                                 <FormikControl
                                    control="number"
                                    type="number"
                                    label={"Max Payment"}
                                    name={"maxPayment"}
                                    placeholder={"Max Payment"}
                                 />
                              </div>
                              <div className="relative text-left">
                                 <FormikControl
                                    control="input"
                                    type="text"
                                    label={"Preliminary Copy Email"}
                                    name={"preliminaryCopyEmail"}
                                    placeholder={"Preliminary Copy Email"}
                                 />
                              </div>
                              <div className="relative text-left">
                                 <FormikControl
                                    control="input"
                                    type="text"
                                    label={"Cc Email"}
                                    name={"ccEmail"}
                                    placeholder={"Cc Email"}
                                 />
                              </div>
                           </div>
                           <div className="mt-2.5 md:mt-3.5 mb-2.5 items-center grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 md:gap-3.5">
                              <div className="flex items-center flex-row-reverse justify-end gap-1 sm:h-[34px] md:h-[38px] sm:mt-5">
                                 <FormikControl
                                    control="checkbox"
                                    type="checkbox"
                                    label={"Fee Calc Only"}
                                    name={`feeCalcOnly`}
                                    checked={formik.values.feeCalcOnly}
                                    onChange={(isChecked: boolean) => {
                                       handleCheckboxChange(
                                          `feeCalcOnly`,
                                          isChecked,
                                          formik
                                       )
                                    }}
                                 />
                              </div>
                              <div className="flex items-center flex-row-reverse justify-end gap-1 sm:h-[34px] md:h-[38px] sm:mt-5">
                                 <FormikControl
                                    control="checkbox"
                                    type="checkbox"
                                    label={"Is Active"}
                                    name={`isActive`}
                                    checked={formik.values.isActive}
                                    onChange={(isChecked: boolean) => {
                                       handleCheckboxChange(
                                          `isActive`,
                                          isChecked,
                                          formik
                                       )
                                    }}
                                 />
                              </div>
                              <div className="flex items-center flex-row-reverse justify-end gap-1 sm:h-[34px] md:h-[38px] sm:mt-5">
                                 <FormikControl
                                    control="checkbox"
                                    type="checkbox"
                                    label={"Include Supplement"}
                                    name={`requiredSupplementDoc`}
                                    checked={formik.values.requiredSupplementDoc}
                                    onChange={(isChecked: boolean) => {
                                       handleCheckboxChange(
                                          `requiredSupplementDoc`,
                                          isChecked,
                                          formik
                                       );
                                       if (isChecked) {
                                          handleSetSupplementCodeDropdown(
                                             formik.values.state,
                                             formik.values.locationCode,
                                             formik.values.caseTypeCode,
                                             formik.values.fileIntoExistingCase,
                                             formik.values.caseCategoryCode
                                          );
                                       } else {
                                          formik.setFieldValue("supplementCode", "");
                                          formik.setFieldValue("supplementCodeName", "");
                                          formik.setFieldValue("supplementDescription", "");
                                       }
                                    }}
                                 />
                              </div>
                              {formik.values.requiredSupplementDoc && (
                                 <>
                                    <div className="relative text-left">
                                       <FormikControl
                                          control="select"
                                          type="select"
                                          label={"Supplement Code Name"}
                                          name={"supplementCode"}
                                          defaultOption={"Please select an option"}
                                          placeholder={"Select"}
                                          value={formik.values.supplementCode}
                                          options={supplementCodeOptions}
                                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                             formik.setFieldValue("supplementCode", e.target.value);
                                             formik.setFieldValue("supplementCodeName", e.target.selectedOptions[0].textContent);
                                             // formik.setFieldValue("filingCodeName", e.target.selectedOptions[0].text);
                                             // resetOptionalServices(formik);
                                             // handleSetOptionalServiceValues(formik.values.state, formik.values.locationCode, formik.values.caseTypeCode, e.target.value, formik.values.fileIntoExistingCase);
                                          }}
                                       />
                                    </div>
                                    <div className="relative text-left">
                                       <FormikControl
                                          control="input"
                                          type="text"
                                          label={"Supplement Description"}
                                          name={"supplementDescription"}
                                          placeholder={"Supplement Description"}
                                       />
                                    </div>
                                 </>
                              )}
                           </div>
                           <div className="pb-1 mt-2.5 text-sm">
                              <b>Optional Service</b>
                           </div>
                           {formik.values.optionalService && formik.values.optionalService.map((value, index) => (
                              <Fragment key={index}>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 md:gap-3.5 mb-1">
                                    <select style={{
                                       backgroundImage: `url(${arrow})`,
                                    }} className={`peer outline-none py-2 md:py-2.5 p-2.5 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none disabled:bg-[#fcfcfc] disabled:text-[#a8aeb8] bg-no-repeat bg-[center_right_13px] appearance-none !pr-7`}
                                       key={index}
                                       value={value.optionalServiceCode}
                                       onChange={(e) => handleDropdownChange(index, e.target.value, `optionalService[${index}].optionalServiceCode`, formik, e.target.selectedOptions[0].text, `optionalService[${index}].optionalServiceName`)}
                                    >
                                       {renderOptions(
                                          optionalServices.filter(
                                             (optionalServices: ISelectOptions) => selectedValues.slice(0, index).every(v => v.id !== optionalServices.id)
                                          ),
                                          index
                                       )}
                                    </select>
                                    {/* <FormikControl
                          control="select"
                          type="select"
                          label={""}
                          name={`optionalService[${index}].optionalServiceName`}
                          defaultOption={"Select"}
                          placeholder={"Optional Service"}
                          options={OptionalServiceList}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            handleSelectOptionalService(
                              `optionalService[${index}].optionalServiceName`,
                              e.target.value as string, 
                              formik
                            )
                          }
                        /> */}
                                 </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 md:gap-3.5 mb-1">
                                    <div className="relative text-left" key={`${index}_quantity`}>
                                       <FormikControl
                                          control="input"
                                          type="number"
                                          label={"Quantity"}
                                          name={`optionalService[${index}].quantity`}
                                          classes="p-2"
                                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                             const value = e.target.value.trim(); // Trim whitespace
                                             const numericValue = value !== "" ? parseInt(value, 10) : ""; // Check for empty string
                                             handleInputChange(
                                                `optionalService[${index}].quantity`,
                                                numericValue,
                                                formik
                                             );
                                          }}
                                       // onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                       //   handleInputChange(
                                       //     `optionalService[${index}].quantity`,
                                       //     e.target.value,
                                       //     formik
                                       //   )
                                       // }}
                                       />
                                    </div>
                                    <div className="relative text-left" key={`${index}_maxQuantity`}>
                                       <FormikControl
                                          control="input"
                                          type="number"
                                          label={"Max Quantity"}
                                          name={`optionalService[${index}].maxQuantity`}
                                          classes="p-2"
                                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                             const value = e.target.value.trim(); // Trim whitespace
                                             const numericValue = value !== "" ? parseInt(value, 10) : ""; // Check for empty string
                                             handleInputChange(
                                                `optionalService[${index}].maxQuantity`,
                                                numericValue,
                                                formik
                                             );
                                          }}
                                       // onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                       //   handleInputChange(
                                       //     `optionalService[${index}].maxQuantity`,
                                       //     e.target.value,
                                       //     formik
                                       //   )
                                       // }}
                                       />
                                    </div>
                                    <div className="relative text-left pt-1">
                                       <div className="flex items-center flex-row-reverse justify-end gap-1.5" key={`${index}_isDefendantCount`}>
                                          <FormikControl
                                             control="checkbox"
                                             type="checkbox"
                                             label={"Use Defendant Count"}
                                             name={`optionalService[${index}].isDefendantCount`}
                                             checked={value.isDefendantCount}
                                             onChange={(isChecked: boolean) => {
                                                handleCheckboxChange(
                                                   `optionalService[${index}].isDefendantCount`,
                                                   isChecked,
                                                   formik
                                                )
                                             }}
                                          />
                                       </div>
                                       <div className="flex items-center pt-2 flex-row-reverse justify-end gap-1.5" key={`${index}_isAdditionalDefendantCount`}>
                                          <FormikControl
                                             control="checkbox"
                                             type="checkbox"
                                             label={"Use Additional Defendant Count"}
                                             name={`optionalService[${index}].isAdditionalDefendantCount`}
                                             checked={value.isAdditionalDefendantCount}
                                             onChange={(isChecked: boolean) => {
                                                handleCheckboxChange(
                                                   `optionalService[${index}].isAdditionalDefendantCount`,
                                                   isChecked,
                                                   formik
                                                )
                                             }}
                                          />
                                       </div>
                                       <div className="flex items-center pt-2 flex-row-reverse justify-end gap-1.5" key={`${index}_isAllOther`}>
                                          <FormikControl
                                             control="checkbox"
                                             type="checkbox"
                                             label={"Exclude and All Other"}
                                             name={`optionalService[${index}].isAllOther`}
                                             checked={value.isAllOther}
                                             onChange={(isChecked: boolean) => {
                                                handleCheckboxChange(
                                                   `optionalService[${index}].isAllOther`,
                                                   isChecked,
                                                   formik
                                                )
                                             }}
                                          />
                                       </div>
                                    </div>
                                    <div className="relative text-left">
                                       <label className="hidden xl:block">&nbsp;</label>
                                       <div className="flex items-center xl:h-[38px]">
                                          {index !== 0 && (
                                             <div
                                                className="cursor-pointer mr-2.5"
                                                key={`${index}_cross`}
                                             >
                                                <FaTimes
                                                   style={{
                                                      height: 17,
                                                      width: 17,
                                                      color: "#2472db",
                                                   }}
                                                   onClick={() => handleCrossClick(index, formik)}
                                                ></FaTimes>
                                             </div>
                                          )}
                                          {index === (
                                             formik.values.optionalService &&
                                             formik.values?.optionalService.length - 1) &&
                                             index < 2 && (
                                                <div
                                                   className="cursor-pointer flex items-center"
                                                   key={`${index}_plus`}
                                                >
                                                   <FaPlusCircle
                                                      style={{
                                                         height: 17,
                                                         width: 17,
                                                         color: "#2472db",
                                                      }}
                                                      onClick={() => handlePlusClick(formik)}
                                                   ></FaPlusCircle>
                                                   <label className="pl-1.5 text-xs md:text-base">Add Optional Service</label>
                                                </div>
                                             )}
                                       </div>
                                    </div>
                                 </div>
                              </Fragment>
                           ))}
                           <div className="py-2.5 flex justify-end mt-1.5">
                              <Button
                                 type="button"
                                 isRounded={false}
                                 title="Cancel"
                                 handleClick={() => setOpen(false)}
                                 classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2.5 px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                              ></Button>
                              <Button
                                 type="submit"
                                 isRounded={false}
                                 title={mode === "edit" ? "Update" : "Create"}
                                 disabled={showSpinner}
                                 classes="text-xs bg-[#2472db] hover:bg-[#0d5ecb] inline-flex justify-center items-center rounded-md font-semibold py-2.5 px-5 text-white"
                              ></Button>
                           </div>
                        </Form>
                     )
                  }}
               </Formik>
            </div>
         </div>
      </Modal>
   );
};

export default TylerConfigModal;