import React, { useState, useCallback, useEffect } from "react";
import * as yup from "yup";
import { AxiosError, HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { Form, Formik, FormikProps } from "formik";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import FormikControl from "components/formik/FormikControl";
import { IProcessServerCaseInfoEditRequest, IProcessServerCaseInfoFormValue, IProcessServerCaseInfoItem, ITypeValidateResource, TypeValidateResponse } from "interfaces/process-server.interface";
import ProcessServerService from "services/process-server.service";
import { useProcessServerContext } from "pages/process-server/ProcessServerContext";
import { FilingTypeList, ServiceMethodList } from "utils/constants";
import { AOSStatusEnum, FilingType, ServiceMethod } from "utils/enum";
import vm from "utils/validationMessages";
import { adjustDateSystemTimezone, adjustDateToSystemTimezone, convertAndFormatDate, convertToEasternISOString, convertUtcToEst, normalizeDate } from "utils/helper";
import { IImportCsvFieldError, IImportCsvRowError } from "interfaces/common.interface";
import { ISelectOptions } from "interfaces/all-cases.interface";

type ProcessServerCaseInfoProps = {
   open: boolean;
   setOpen: (open: boolean) => void;
   selectedCaseInfo: IProcessServerCaseInfoItem | null;
   setSelectedCaseInfo: (user: IProcessServerCaseInfoItem | null) => void;
};

const requiredField = (errorMessage: string) => yup.string().required(errorMessage);
const optionalField = yup.string().optional();

const validationSchema = yup.object({
   caseNumber: yup
      .string()
      // .max(10, "Max 10 digits")
      .required("Case number is required"),
   serviceMethod: yup
      .string()
      .required("Service Type is required"),
   // personServed: yup.string().when("serviceMethod", {
   //    is: (val: string) =>
   //       val === ServiceMethod.NOTORIOUSLY || val === ServiceMethod.PERSONALLY,
   //    then(schema) { return schema.required("Person Served is required") },
   //    otherwise(schema) { return schema.optional() },
   // }),
   height: yup.string().when('serviceMethod', {
      is: (val: string) =>
         val === ServiceMethod.NOTORIOUSLY || val === ServiceMethod.PERSONALLY,
      then(schema) { return schema.required("Height is required") },
      otherwise(schema) { return schema.optional() },
   }),
   weight: yup.string().when('serviceMethod', {
      is: (val: string) =>
         val === ServiceMethod.NOTORIOUSLY || val === ServiceMethod.PERSONALLY,
      then(schema) { return schema.required("Weight is required") },
      otherwise(schema) { return schema.optional() },
   }),
   age: yup.string().when('serviceMethod', {
      is: (val: string) =>
         val === ServiceMethod.NOTORIOUSLY || val === ServiceMethod.PERSONALLY,
      then(schema) { return schema.required("Age is required") },
      otherwise(schema) { return schema.optional() },
   }),
   serviceNotes: yup.string().when('serviceMethod', {
      is: ServiceMethod.NON_EST,
      then(schema) { return schema.required("Service notes is required") },
      otherwise(schema) { return schema.optional() },
   }),
   serverEmail: yup.string().nullable().email(vm.email.email)
});

const formatDate = (dateString: string) => {

   const date = new Date(dateString);
   const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
   return formattedDate;
};

const ProcessServer_EditCaseInfo = (props: ProcessServerCaseInfoProps) => {
   const { open, setOpen, selectedCaseInfo, setSelectedCaseInfo } = props;
   const { getProcessServerCases, processServerCases } = useProcessServerContext();
   const [nameMismatchError, setNameMismatchError] = useState<string | null>("");
   const [showError, setShowError] = useState<boolean>(false);
   const [errorMessage, setErrorMessage] = useState<string>("");
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [columnErrors, setColumnErrors] = useState<
      Record<string, { rowIndex: number; errorMessage: string }[]>[]
   >([]);
   const [rowErrors, setRowErrors] = useState<IImportCsvRowError[]>([]);
   const [filingTypeOptions, setFilingTypeOptions] = useState<ISelectOptions[]>([]);
   useEffect(() => {
      if (selectedCaseInfo && selectedCaseInfo.caseNumber) {
        const fetchFilingOptions = async () => {
          const options = await handleGetFilingTypeOptions(selectedCaseInfo.caseNumber);
          setFilingTypeOptions(options);
        };
        fetchFilingOptions();
      }
    }, [selectedCaseInfo]);
   const initialValues: IProcessServerCaseInfoFormValue = {
      id: selectedCaseInfo?.id ?? "",
      dispoId: selectedCaseInfo?.dispoId ?? "",
      caseNumber: selectedCaseInfo?.caseNumber ?? "",
      unitNumber: selectedCaseInfo?.unitNumber ?? "",
      streetNumber: selectedCaseInfo?.streetNumber ?? "",
      streetName: selectedCaseInfo?.streetName ?? "",
      personServed: selectedCaseInfo?.personServed ?? "",
      height: selectedCaseInfo?.height ?? "",
      weight: selectedCaseInfo?.weight ?? "",
      age: selectedCaseInfo?.age ?? "",
      serviceNotes: selectedCaseInfo?.serviceNotes ?? "",
      // serviceDate: selectedCaseInfo ? formatDate(selectedCaseInfo.serviceDate as string) : "",
      // dateScanned: selectedCaseInfo ? formatDate(selectedCaseInfo.dateScanned as string) : "",
      serviceDate: selectedCaseInfo
         ? new Date(convertAndFormatDate(selectedCaseInfo.serviceDate)).toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
         })
         : "",
      dateScanned: selectedCaseInfo
         ? new Date(convertAndFormatDate(selectedCaseInfo.dateScanned)).toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
         })
         : "",
      // longitude: selectedCaseInfo?.longitude ?? "",
      // latitude: selectedCaseInfo?.latitude ?? "",
      locationCoord: selectedCaseInfo?.locationCoord ?? "",
      comments: selectedCaseInfo?.comments ?? "",
      tenantnames: selectedCaseInfo?.tenantnames ?? "",
      propertyName: selectedCaseInfo?.propertyName ?? "",
      // defendantName: selectedCaseInfo?.defendantName ?? "",
      // house: selectedCaseInfo?.house ?? "",
      serviceMethod: selectedCaseInfo?.serviceMethod ?? "",
      companyName: selectedCaseInfo?.companyName ?? "",
      serverName: selectedCaseInfo?.serverName ?? "",
      status: AOSStatusEnum.Modified,
      serverEmail: selectedCaseInfo?.serverEmail ?? "",
      serverExists: selectedCaseInfo?.serverExists ?? false,
      filingType: selectedCaseInfo?.filingType?.split("_")[0]?.trim() || "Eviction",
      filingTypeOptions:null,
      selectedFilingOption:null,
   };
   const handleGetFilingTypeOptions = async (
      caseNumber: string
    ): Promise<ISelectOptions[]> => {
      try {
        const response = await ProcessServerService.getAmendmentVersionByDispoId([caseNumber]);
    
        // Get responses matching the provided caseNumber
        const matchingResponses = response.filter(
          (item: IProcessServerCaseInfoItem) =>
            item.caseNumber.toLowerCase().trim() === caseNumber.toLowerCase().trim()
        );
    
        // Generate the amendment options
        const amendmentOptions: ISelectOptions[] = (() => {
          if (matchingResponses.length === 0) return [];
    
          // Find the maximum version
          const maxVersion = Math.max(
            ...matchingResponses.map((item: any) => Number(item.dispoVersion))
          );
    
          // Create an array for versions
          return Array.from({ length: maxVersion + 1 }, (_, index) => ({
            id: `Amendment${index !== 0 ? index + 1 : ""}`,
            value: `Amendment${index !== 0 ? index + 1 : ""}`,
          }));
        })();
    
        // Explicitly order options with "Eviction" first
        const filingTypeOptions: ISelectOptions[] = [
          { id: "Eviction", value: "Eviction" }, // Add "Eviction" first
          ...amendmentOptions, // Append all amendments
        ];
    
        return filingTypeOptions; // Return the options for this case
      } catch (error) {
        console.error("Error fetching filing type options:", error);
        return []; // Return an empty array in case of an error
      }
    };
    
   const handleServiceMethodChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>, formik: FormikProps<IProcessServerCaseInfoFormValue>) => {
      const value = event.target.value;
      formik.setFieldValue("serviceMethod", value);

      if (!(value === ServiceMethod.PERSONALLY || value === ServiceMethod.NOTORIOUSLY)) {
         formik.setFieldValue("personServed", "N/A");
         formik.setFieldValue("height", "N/A");
         formik.setFieldValue("weight", "N/A");
         formik.setFieldValue("age", "N/A");
      } else {
         formik.setFieldValue("personServed", "");
         formik.setFieldValue("height", "");
         formik.setFieldValue("weight", "");
         formik.setFieldValue("age", "");
      }

      // Manually trigger validation after setting field values
      formik.validateForm();

   }, []);

   const handleFilingTypeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>, formik: FormikProps<IProcessServerCaseInfoFormValue>) => {
      const value = event.target.value;
      formik.setFieldValue("filingType", value);

      // Manually trigger validation after setting field values
      // formik.validateForm();

   }, []);

   const isServiceMethodPersonalOrNotorious = (formValues: IProcessServerCaseInfoFormValue): boolean => {
      return (formValues.serviceMethod === ServiceMethod.PERSONALLY ||
         formValues.serviceMethod === ServiceMethod.NOTORIOUSLY);
   };

   const handleProcessServerCaseInfo = async (formValues: IProcessServerCaseInfoFormValue) => {
      
      setShowError(false);
      setErrorMessage("")
      setNameMismatchError(null);
      setShowSpinner(true);
      // Convert date strings to Date objects
      // const serviceDate = new Date(formValues.serviceDate);
      // const dateScanned = new Date(formValues.dateScanned);

      // // Adjust to local timezone offset
      // formValues.serviceDate = new Date(serviceDate.getTime() - (serviceDate.getTimezoneOffset() * 60000));
      // formValues.dateScanned = new Date(dateScanned.getTime() - (dateScanned.getTimezoneOffset() * 60000));
      formValues.serviceDate = adjustDateToSystemTimezone(formValues.serviceDate as string);
      formValues.dateScanned = adjustDateToSystemTimezone(formValues.dateScanned as string);
      const payload: IProcessServerCaseInfoEditRequest = {
         id: formValues.id, // Assuming id is included in formValues
         caseNumber: formValues.caseNumber,
         personServed: formValues.personServed === "N/A" ? "" : formValues.personServed,
         serverName: formValues.serverName, // Fill this with the appropriate value
         height: formValues.height === "N/A" ? "" : formValues.height,
         weight: formValues.weight === "N/A" ? "" : formValues.weight,
         age: formValues.age === "N/A" ? "" : formValues.age,
         serviceMethod: formValues.serviceMethod,
         serviceDate: formValues.serviceDate,
         serviceNotes: formValues.serviceNotes,
         // defendantName: formValues.defendantName,
         // house: formValues.house,
         dateScanned: formValues.dateScanned,
         // longitude: formValues.longitude,
         // latitude: formValues.latitude,
         locationCoord: formValues.locationCoord,
         comments: formValues.comments,
         serverEmail: formValues.serverEmail,
         filingType: formValues.filingType ?? ""
      };

      try {
         const response = await ProcessServerService.editProcessServerCaseInfo(payload);
         if (response.status === HttpStatusCode.Ok) {
            setShowSpinner(false);
            setOpen(false); // close the modal pop-up
            setSelectedCaseInfo(null);
            getProcessServerCases(
               1,
               100,
               processServerCases.searchParam,
               processServerCases.serverName,
               processServerCases.serviceMethod,
               processServerCases.dateRange
            );
            // getProcessServerCases(1, 100);
            toast.success(response.data.message);
         }
      } catch (error) {
         console.log(error);
      } finally {
         setShowSpinner(false);
      }
   };

   const checkValidation = async (data: TypeValidateResponse[], filteredRecords: IProcessServerCaseInfoEditRequest) => {
      const errors: Record<string, { rowIndex: number; errorMessage: string }[]>[] = [];
      const rowErrors: IImportCsvRowError[] = [];
      const eviction = FilingType.Eviction;
      let totalError = 0;

      // Assuming filteredRecords is a single object (not an array)
      const record = filteredRecords; // Directly use the single record (not an array)
      const recordErrors: Record<string, { rowIndex: number; errorMessage: string }[]> = {};
      const fields: IImportCsvFieldError[] = [];

      data.forEach(x => {
         x.serviceDate = convertUtcToEst(x.serviceDate.toLocaleString()).date;
      });

      // Step 1: Find the corresponding caseNumber in the data
      const caseNumber = record.caseNumber;
      const matchingData = data.find((item) =>
         item.caseNumber.trim().toLowerCase() === caseNumber.trim().toLowerCase() &&
         item.serverName.toLowerCase() === record.serverName.toLowerCase() &&
         item.serviceMethod.toLowerCase() === record.serviceMethod.toLowerCase() &&
         normalizeDate(item.serviceDate) === normalizeDate(record.serviceDate)
      );

      // Step 2: If a matching caseNumber is found, validate the FilingType
      if (matchingData) {
         // Scenario 1: If matchingData.filingType does not exist (no AOS), check for taskStatus
         if (matchingData.filingType && matchingData.filingType.length === 0) {
            if (matchingData.selectedFilingType == null || matchingData.selectedFilingType === "") {
               if (matchingData.taskStatus && matchingData.taskStatus.length === 1) {
                  // If there is only one status, set the FilingType to that value
                  const statusValue = matchingData.taskStatus[0];
                  record.filingType = statusValue;
               } else if (matchingData.taskStatus && matchingData.taskStatus.length > 1) {
                  // Scenario 3: If there are two statuses, check both against FilingTypeList
                  const matchingStatuses = matchingData.taskStatus.filter((status: string) =>
                     FilingTypeList.some((item) => item.value === status)
                  );

                  if (matchingStatuses.length === 2) {
                     // No action needed, both statuses match
                  } else if (matchingStatuses.length === 1) {
                     // If only one status matches, set FilingType to that value
                     const matchedStatus = matchingStatuses[0];
                     record.filingType = matchedStatus;
                  }
               }
            }

            // If filing type entered for this case in import
            if (matchingData.selectedFilingType != null && matchingData.selectedFilingType !== "") {
               const selectedFilingType = matchingData.selectedFilingType;

               // Scenario 1: If there is only one status in matchingData.status
               if (matchingData.taskStatus && matchingData.taskStatus.length === 1) {
                  const taskStatus = matchingData.taskStatus[0];

                  // Check if the selectedFilingType matches the taskStatus
                  if (taskStatus !== selectedFilingType) {
                     setShowError(true);
                     setErrorMessage(`Filing Type mismatch. Expected: ${taskStatus}, but found: ${selectedFilingType}.`)
                     //  const errorMessage = `Filing Type mismatch. Expected: ${taskStatus}, but found: ${selectedFilingType}.`;
                     //  fields.push({
                     //    fieldName: "FilingType",
                     //    message: errorMessage,
                     //  });
                     //  totalError++;
                  }
               }

               // Scenario 2: If there are two statuses in matchingData.status
               else if (matchingData.taskStatus && matchingData.taskStatus.length > 1) {
                  const taskStatuses = matchingData.taskStatus;

                  // Check if both statuses match any in FilingTypeList
                  const matchingStatuses = taskStatuses.filter((status: string) =>
                     FilingTypeList.some((item) => item.value === status)
                  );

                  if (matchingStatuses.length === 2) {
                     // Both statuses are present, need to check the if signed
                     const isEvictionSigned = matchingData.unsignedFilingType.includes("File Eviction") === false;
                     const isAmendmentSigned = matchingData.unsignedFilingType.includes("Amendments") === false;
                     if (isEvictionSigned && !isAmendmentSigned) {
                        // If Eviction is signed and Amendment not then set Eviction by default
                        record.filingType = "File Eviction";
                     } else if (!isEvictionSigned && isAmendmentSigned) {
                        // If Amendment is signed and Eviction not then set Amendment by default
                        record.filingType = "Amendments";
                     } else if (isEvictionSigned && isAmendmentSigned) {
                        // If both Eviction and Amendment signed, then validation is required
                     } else if (!isEvictionSigned && !isAmendmentSigned) {
                        setShowError(true);
                        setErrorMessage("Already exists for both types. Cannot import this case.")
                        // If both are unsigned, cannot be imported
                        // const errorMessage = "Already exists for both types. Cannot import this case.";
                        // fields.push({
                        //   fieldName: "FilingType",
                        //   message: errorMessage,
                        // });
                        // totalError++;
                     }
                  } else if (matchingStatuses.length === 1) {
                     // If only one status matches, check if the selectedFilingType matches
                     const matchedStatus = matchingStatuses[0];

                     if (matchedStatus !== selectedFilingType) {
                        if (matchingData.unsignedFilingType.includes("File Eviction")) {
                           setShowError(true);
                           setErrorMessage("Already exists. Cannot import this case.")
                           //   const errorMessage = "Already exists. Cannot import this case.";
                           //   fields.push({
                           //     fieldName: "FilingType",
                           //     message: errorMessage,
                           //   });
                           //   totalError++;
                        } else {
                           setShowError(true);
                           setErrorMessage(`Filing Type mismatch. Expected: ${matchedStatus}, but found: ${selectedFilingType}.`)
                           //   const errorMessage = `Filing Type mismatch. Expected: ${matchedStatus}, but found: ${selectedFilingType}.`;
                           //   fields.push({
                           //     fieldName: "FilingType",
                           //     message: errorMessage,
                           //   });
                           //   totalError++;
                        }
                     } else if (matchedStatus === selectedFilingType) {
                        // Check if Eviction AOS document is unsigned then error
                        if (matchingData.unsignedFilingType.includes("File Eviction")) {
                           setShowError(true);
                           setErrorMessage("Already exists. Cannot import this case.")
                           //   const errorMessage = "Already exists. Cannot import this case.";
                           //   fields.push({
                           //     fieldName: "FilingType",
                           //     message: errorMessage,
                           //   });
                           //   totalError++;
                        }
                     }
                  }
               }
            }
         }

         // Scenario 2: If case is imported already
         else if (matchingData.filingType && matchingData.filingType.length > 0) {
            // If not entered filing type in import
            if (matchingData.selectedFilingType == null || matchingData.selectedFilingType === "") {
               if (matchingData.taskStatus && matchingData.taskStatus.length === 1) {
                  // If there is only one taskStatus "Eviction" filed                
                  // Check if Eviction AOS document is signed (not in unsignedFilingType) then set
                  if (matchingData.unsignedFilingType.includes("File Eviction") === false) {
                     const statusValue = matchingData.taskStatus[0];
                     record.filingType = statusValue;
                  } else {
                     setShowError(true);
                     setErrorMessage("Already exists. Cannot import this case.")
                     //  // If the Eviction AOS document is not signed and is in unsignedFilingType
                     //  const errorMessage = "Already exists. Cannot import this case.";
                     //  fields.push({
                     //    fieldName: "FilingType",
                     //    message: errorMessage,
                     //  });
                     //  totalError++;
                  }
               }
            }

            // If filing type entered for this case in import
            if (matchingData.selectedFilingType != null && matchingData.selectedFilingType !== "") {
               const selectedFilingType = matchingData.selectedFilingType;

               // Scenario 1: If there is only one action performed (Eviction filed)
               if (matchingData.taskStatus && matchingData.taskStatus.length === 1) {
                  const taskStatus = matchingData.taskStatus[0];

                  // Check if the selectedFilingType matches the taskStatus if not mismatch error
                  if (taskStatus !== selectedFilingType) {
                     // Again check if document is signed or not; if unsigned, cannot be imported again
                     if (matchingData.unsignedFilingType.includes("File Eviction")) {
                        setShowError(true);
                        setErrorMessage("Already exists. Cannot import this case.")
                        // const errorMessage = "Already exists. Cannot import this case.";
                        // fields.push({
                        //   fieldName: "FilingType",
                        //   message: errorMessage,
                        // });
                        // totalError++;
                     } else {
                        setShowError(true);
                        setErrorMessage(`Filing Type mismatch. Expected: ${taskStatus}, but found: ${selectedFilingType}.`)
                        // const errorMessage = `Filing Type mismatch. Expected: ${taskStatus}, but found: ${selectedFilingType}.`;
                        // fields.push({
                        //   fieldName: "FilingType",
                        //   message: errorMessage,
                        // });
                        // totalError++;
                     }
                  }
               }
               else if (matchingData.taskStatus && matchingData.taskStatus.length > 1) {
                  const taskStatuses = matchingData.taskStatus;

                  // Check if both statuses match any in FilingTypeList
                  const matchingStatuses = taskStatuses.filter((status: string) =>
                     FilingTypeList.some((item) => item.value === status)
                  );

                  // If both statuses match FilingTypeList, do nothing
                  if (matchingStatuses.length === 2) {
                     // Both statuses are present, need to check the if signed
                     const isEvictionSigned = matchingData.unsignedFilingType.includes("File Eviction") === false;
                     const isAmendmentSigned = matchingData.unsignedFilingType.includes("Amendments") === false;
                     if (!isEvictionSigned && !isAmendmentSigned) {
                        setShowError(true);
                        setErrorMessage("Already exists for both type. Cannot import this case.")
                        //If both are unsigned cannot be imported
                        // const errorMessage = `Already exists for both type. Cannot import this case.`;
                        // fields.push({
                        //    fieldName: "FilingType",
                        //    message: errorMessage,
                        // });
                        // totalError++;
                     }
                     else if (isEvictionSigned && !isAmendmentSigned) {
                        //If Eviction is signed and Amendment not 
                        //if not mismatch error here otherwise correct
                        if (selectedFilingType != "File Eviction") {
                           setShowError(true);
                           setErrorMessage(`Filing Type mismatch Expected: ${"FileEviction"}, but found: ${selectedFilingType}.`)
                           // const errorMessage = `Filing Type mismatch Expected: ${"FileEviction"}, but found: ${selectedFilingType}.`;
                           // fields.push({
                           //    fieldName: "FilingType",
                           //    message: errorMessage,
                           // });
                           // totalError++;
                        }
                     }
                     else if (!isEvictionSigned && isAmendmentSigned) {
                        //If Amendment is signed and Eviction not 
                        //if not mismatch error here otherwise correct
                        if (selectedFilingType != "Amendments") {
                           setShowError(true);
                           setErrorMessage(`Filing Type mismatch Expected: ${"Amendments"}, but found: ${selectedFilingType}.`)
                           // const errorMessage = `Filing Type mismatch Expected: ${"Amendments"}, but found: ${selectedFilingType}.`;
                           // fields.push({
                           //    fieldName: "FilingType",
                           //    message: errorMessage,
                           // });
                           // totalError++;
                        }
                     }
                     else if (isEvictionSigned && isAmendmentSigned) {
                        //if both Eviction and Amendment signed then selected is correct
                     }
                  } else if (matchingStatuses.length === 1) {
                     // If only one status matches, check if the selectedFilingType matches
                     const matchedStatus = matchingStatuses[0];

                     if (matchedStatus !== selectedFilingType) {
                        if (matchingData.unsignedFilingType.includes("File Eviction")) {
                           setShowError(true);
                           setErrorMessage("Already exists. Cannot import this case.")
                           // const errorMessage = `Already exists. Cannot import this case.`;
                           // fields.push({
                           //    fieldName: "FilingType",
                           //    message: errorMessage,
                           // });
                           // totalError++;
                        } else {
                           setShowError(true);
                           setErrorMessage(`Filing Type mismatch Expected: ${matchedStatus}, but found: ${selectedFilingType}.`)
                           // const errorMessage = `Filing Type mismatch Expected: ${matchedStatus}, but found: ${selectedFilingType}.`;
                           // fields.push({
                           //    fieldName: "FilingType",
                           //    message: errorMessage,
                           // });
                           // totalError++;
                           // if (!recordErrors["FilingType"]) {
                           //    recordErrors["FilingType"] = [];
                           // }
                           // recordErrors["FilingType"].push({
                           //    rowIndex: index,
                           //    errorMessage: errorMessage,
                           // });
                        }
                     }
                     else if (matchedStatus === selectedFilingType) {
                        // Check if Eviction AOS document is unsigned then error
                        if (matchingData.unsignedFilingType.includes("File Eviction")) {
                           setShowError(true);
                           setErrorMessage("Already exists. Cannot import this case.")
                           // const errorMessage = `Already exists. Cannot import this case.`;
                           // fields.push({
                           //    fieldName: "FilingType",
                           //    message: errorMessage,
                           // });
                           // totalError++;
                        } else {
                           // do nothing as can be reimported for File Eviction
                        }
                     }
                  }
               }
            }
         }
      }

      // Collect errors for this record
      if (Object.keys(recordErrors).length > 0) {
         errors.push(recordErrors);
      }

      rowErrors.push({
         rowIndex: 0, // For a single record, the row index is 0
         fields: fields,
      });

      setRowErrors(rowErrors);
      setColumnErrors(errors);
      return totalError;
   };

   const getTypeValidation = async (payload: IProcessServerCaseInfoEditRequest) => {
      try {
         setShowSpinner(true);
         const request: ITypeValidateResource[] = [{
            caseNumber: payload.caseNumber ?? "",
            filingType: payload.filingType ?? "",
            serviceMethod: payload.serviceMethod,
            serviceDate: payload.serviceDate,
            serverName: payload.serverName
         }];

         const response = await ProcessServerService.validateProcessServerCaseType(request);
         return response;
      } catch (error) {
         console.error("An error occurred:", error);
      } finally {
         setShowSpinner(false);
      }
   };

   return (
      <Modal showModal={open} onClose={() => setOpen(false)} width="max-w-5xl">
         <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
            <div className="sm:flex sm:items-start">
               <div className="text-center sm:text-left">
                  <h3
                     className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                     id="modal-title"
                  >
                     Update Case Info
                  </h3>
               </div>
            </div>
            <Formik
               initialValues={initialValues}
               validationSchema={validationSchema}
               onSubmit={handleProcessServerCaseInfo}
            >
               {(formik) => (
                  <Form className="flex flex-col pt-1.5">
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3.5">
                        <div className="relative">
                           <FormikControl
                              control="input"
                              type="text"
                              label={"Case Number"}
                              name={"caseNumber"}
                              placeholder={"Enter Case Number"}
                              disabled={true}
                           />
                        </div>
                        <div className="relative">
                           <FormikControl
                              control="input"
                              type="text"
                              label={"Process Server Email"}
                              name={"serverEmail"}
                              placeholder={"Enter Server Email"}
                           />
                        </div>
                        <div className="relative">
                           <FormikControl
                              control="select"
                              type="select"
                              label={"Service Type"}
                              name={"serviceMethod"}
                              placeholder={"Select"}
                              options={ServiceMethodList}
                              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => handleServiceMethodChange(event, formik)}
                           />
                        </div>
                        <div className="relative">
                           <FormikControl
                              control="input"
                              type="text"
                              label={"Server Name"}
                              name={"serverName"}
                              placeholder={"Enter Server Name"}
                           />
                        </div>
                        <div className="relative">
                           <FormikControl
                              control="input"
                              type="text"
                              label={"Person Served"}
                              name={"personServed"}
                              placeholder={"Enter Person Served"}
                              disabled={!isServiceMethodPersonalOrNotorious(formik.values)}
                           />
                        </div>
                        <div className="relative">
                           <FormikControl
                              control="input"
                              type="text"
                              label={"Height"}
                              name={"height"}
                              placeholder={"Enter Height"}
                              disabled={!isServiceMethodPersonalOrNotorious(formik.values)}
                           />
                        </div>
                        <div className="relative">
                           <FormikControl
                              control="input"
                              type="text"
                              label={"Weight"}
                              name={"weight"}
                              placeholder={"Enter Weight"}
                              disabled={!isServiceMethodPersonalOrNotorious(formik.values)}
                           />
                        </div>
                        <div className="relative">
                           <FormikControl
                              control="input"
                              type="text"
                              label={"Age"}
                              name={"age"}
                              placeholder={"Enter Age"}
                              disabled={!isServiceMethodPersonalOrNotorious(formik.values)}
                           />
                        </div>
                        <div className="relative">
                           <FormikControl
                              control="input"
                              type="text"
                              label={"Service Notes"}
                              name={"serviceNotes"}
                              placeholder={"Enter Service Notes"}
                           />
                        </div>
                        <div className="relative">
                           <FormikControl
                              control="date"
                              type="date"
                              label={"Service Date"}
                              name={"serviceDate"}
                              placeholder={"Enter Service Date"}
                              minDate={null}
                           />
                        </div>
                        <div className="relative">
                           <FormikControl
                              control="date"
                              type="date"
                              label={"Date Scanned"}
                              name={"dateScanned"}
                              placeholder={"Enter Date Scanned"}
                              minDate={null}
                           />
                        </div>
                        <div className="relative">
                           <FormikControl
                              control="input"
                              type="text"
                              label={"Location Coord"}
                              name={"locationCoord"}
                              placeholder={"Enter Location Coord"}
                           />
                        </div>
                        <div className="relative">
                           <FormikControl
                              control="input"
                              type="text"
                              label={"Service Comments"}
                              name={"comments"}
                              placeholder={"Enter Service Comments"}
                           />
                        </div>
                        <div className="relative">
                           {/* <FormikControl
                              control="select"
                              type="select"
                              label={"Filing Type"}
                              name={"filingType"}
                              placeholder={"Select"}
                              // disabled={true}
                              options={FilingTypeList}
                              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => handleFilingTypeChange(event, formik)}
                           />
                           {showError && errorMessage && (
                              <div className="text-red-600 mt-1 text-sm">{errorMessage}</div>
                           )} */}
                           {/* <FormikControl
                              control="input"
                              type="text"
                              label={"Filing Type"}
                              name={"filingType"}
                              placeholder={"Enter Filing Type"}
                           /> */}
                           <FormikControl
                              control="select"
                              type="select"
                              label={"Filing Type"}
                              name={"filingType"}
                              placeholder={"Select"}
                              options={filingTypeOptions}
                              onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>formik.setFieldValue("filingType",event.target.value) }
                           />
                           {/* <FormikControl
                                 control="input"
                                 type="text"
                                 label={"Filing Type"}
                                 name={"filingType"}
                                 disabled = {true}
                              /> */}
                        </div>
                     </div>

                     <div className="flex justify-between items-center">
                        <div className="text-[#E61818]">
                           {nameMismatchError}
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
                              title={"Update"}
                              type={"submit"}
                              isRounded={false}
                              disabled={showSpinner}
                              classes="mt-2.5 py-2 md:py-2.5 px-4 inline-flex justify-center items-center gap-x-1.5 text-xs font-semibold rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none   "
                           ></Button>
                        </div>
                     </div>
                  </Form>
               )}
            </Formik>
         </div>
      </Modal>
   );
};

export default ProcessServer_EditCaseInfo;