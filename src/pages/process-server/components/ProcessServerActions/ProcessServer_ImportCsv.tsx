import React, { useState } from "react";
import * as yup from "yup";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import { Form, Formik } from "formik";
import { FaTrash } from "react-icons/fa";
import fileUpload from "assets/svg/file-upload.svg";
import FormikControl from "components/formik/FormikControl";
import Grid from "components/common/grid/Grid";
import Button from "components/common/button/Button";
import Spinner from "components/common/spinner/Spinner";
import Modal from "components/common/popup/PopUp";
import DropdownPresentation from "components/common/dropdown/DropDown";
import DownloadButton from "components/common/button/DownloadButton";
import { FilingType, HttpStatusCode, ServiceMethod } from "utils/enum";
import { adjustDateToSystemTimezone, convertDateStringToUTCISOString, convertToEasternISOString, convertToEasternISOStringV2, convertUtcToEst, formatCurrency, getEvictionServiceMethod, getFilingType, normalizeDate } from "utils/helper";
import { FilingTypeList, ProcessServerCaseInfoCSVHeader, ServiceMethodList } from "utils/constants";
import { IProcessServerCaseInfoImportRequest, IProcessServerImportCsv, IServerCaseInfoResource, ITypeValidateResource, TypeValidateResponse } from "interfaces/process-server.interface";
import { IImportCsvFieldError, IImportCsvRowError } from "interfaces/common.interface";
import ProcessServerService from "services/process-server.service";
import { useProcessServerContext } from "pages/process-server/ProcessServerContext";
import vm from "utils/validationMessages";
import moment from "moment";
import { ISelectOptions } from "interfaces/all-cases.interface";

type ProcessServerImportCsvProps = {
   importCsvPopUp: boolean;
   setImportCsvPopUp: React.Dispatch<React.SetStateAction<boolean>>;
};

const validationSchema: yup.ObjectSchema<any> = yup.object({
   CaseNumber: yup
      .string()
      // .max(10, "Max 10 digits")
      .required("Case number is required"),
   EvictionServiceMethod: yup.string().required("Service Type is required"),
   // PersonServed: yup.string().when("EvictionServiceMethod", {
   //    is: (val: string) =>
   //       val === ServiceMethod.NOTORIOUSLY || val === ServiceMethod.PERSONALLY,
   //    then(schema) {
   //       return schema.required("This is a required field");
   //    },
   //    otherwise(schema) {
   //       return schema.optional();
   //    },
   // }),
   Height: yup.string().when("EvictionServiceMethod", {
      is: (val: string) =>
         val === ServiceMethod.NOTORIOUSLY || val === ServiceMethod.PERSONALLY,
      then(schema) {
         return schema.required("Height is required");
      },
      otherwise(schema) {
         return schema.optional();
      },
   }),
   Weight: yup.string().when("EvictionServiceMethod", {
      is: (val: string) =>
         val === ServiceMethod.NOTORIOUSLY || val === ServiceMethod.PERSONALLY,
      then(schema) {
         return schema.required("Weight is required");
      },
      otherwise(schema) {
         return schema.optional();
      },
   }),
   Age: yup.string().when("EvictionServiceMethod", {
      is: (val: string) =>
         val === ServiceMethod.NOTORIOUSLY || val === ServiceMethod.PERSONALLY,
      then(schema) {
         return schema.required("Age is required");
      },
      otherwise(schema) {
         return schema.optional();
      },
   }),
   ServiceNotes: yup.string().when("EvictionServiceMethod", {
      is: ServiceMethod.NON_EST,
      then(schema) {
         return schema.required("Service notes is required");
      },
      otherwise(schema) {
         return schema.optional();
      },
   }),
   DateScanned: yup
      .date()
      .required("Date Scanned is required")
      .typeError("Date Scanned is required"),
   EvictionServiceDate: yup
      .date()
      .required("Service Date is required")
      .typeError("Service Date is required"),
   ProcessServerEmail: yup.string().nullable().email(vm.email.email),
   FilingType: yup
   .string()
   .when("filingTypeOptions", (filingTypeOptions: any[], schema) => {
      debugger
     return filingTypeOptions[0]?.length > 1
       ? schema.required("Filing type is required.")
       : schema.nullable();
   }), 
});

// React functional component 'FIleEvictionsGrid' with a generic type 'IFileEvictions'
const ProcessServer_ImportCsv = (props: ProcessServerImportCsvProps) => {
   const {
      getProcessServerCases,
      setSelectedProcessServerId,
      setProcessServerCases,
      processServerCases
   } = useProcessServerContext();
   const initialValues = { UploadFile: "" };
   const [gridData, setGridData] = useState<IProcessServerImportCsv[]>([]);
   const [showUploadCsv, setShowUploadCsv] = useState<boolean>(true);
   const [showEmptyRecordMessage, setShowEmptyRecordMessage] =
      useState<boolean>(false);
   const [columnErrors, setColumnErrors] = useState<
      Record<string, { rowIndex: number; errorMessage: string }[]>[]
   >([]);
   const [rowErrors, setRowErrors] = useState<IImportCsvRowError[]>([]);
   const [showInvalidCSVMessage, setShowInvalidCSVMessage] =
      useState<boolean>(false);
   const [showMaxRecords, setShowMaxRecords] = useState<boolean>(false);
   const [toggleSpinner, setToggleSpinner] = useState<boolean>(false);
   const [totalRecord, setTotalRecord] = useState<number>(0);
   const [nameMismatchError, setNameMismatchError] = useState<string | null>("");
   const [showImportConfirmation, setShowImportConfirmation] = useState<boolean>(false);
   const [alreadySignedCases, setAlreadySignedCases] = useState<string | null>(null);
   const [showSelectionPrompt, setShowSelectionPrompt] = useState<boolean>(true);
   const [promptMessage, setPromptMessage] = useState<string>("");



   const formatDataForServerCaseInfo = (gridData: IProcessServerImportCsv[]) => {
      const requestData: IProcessServerCaseInfoImportRequest[] = gridData.map(
         (item) => ({
            caseNumber: item.CaseNumber.trim(),
            serverEmail: item.ProcessServerEmail,
            personServed:
               item.EvictionServiceMethod === ServiceMethod.PERSONALLY ||
                  item.EvictionServiceMethod === ServiceMethod.NOTORIOUSLY
                  ? item.PersonServed
                  : "",
            serverName: item.ServerName,
            height:
               item.EvictionServiceMethod === ServiceMethod.PERSONALLY ||
                  item.EvictionServiceMethod === ServiceMethod.NOTORIOUSLY
                  ? item.Height
                  : "",
            weight:
               item.EvictionServiceMethod === ServiceMethod.PERSONALLY ||
                  item.EvictionServiceMethod === ServiceMethod.NOTORIOUSLY
                  ? item.Weight
                  : "",
            age:
               item.EvictionServiceMethod === ServiceMethod.PERSONALLY ||
                  item.EvictionServiceMethod === ServiceMethod.NOTORIOUSLY
                  ? item.Age
                  : "",
            serviceMethod: item.EvictionServiceMethod,
            // serviceDate: convertDateStringToUTCISOString(
            //    item.EvictionServiceDate as string
            // ),
            // serviceDate: convertToEasternISOString(item.EvictionServiceDate as string),
            // serviceDate: moment(item.EvictionServiceDate, "MM/dd/yyyy, hh:mm:ss tt").toISOString(),
            serviceDate: convertToEasternISOStringV2(item.EvictionServiceDate as string),
            // serviceDate: item.EvictionServiceDate,

            // serviceDate: new Date(new Date(item.EvictionServiceDate).getTime() - (new Date(item.EvictionServiceDate).getTimezoneOffset() * 60000)),
            serviceNotes: item.ServiceNotes,
            // defendantName: string;
            // house: item.House,
            // dateScanned: convertDateStringToUTCISOString(
            //    item.DateScanned as string
            // ),
            dateScanned: convertToEasternISOStringV2(item.DateScanned as string),
            // longitude: item.Longitude,
            // latitude: item.Latitude,
            locationCoord: item.LocationCoord,
            comments: item.ServiceComments,
            // filingType: item.FilingType ? item.FilingType : 'Eviction',
            filingType: item.FilingType ? item.FilingType : '',

         })
      );

      return requestData;
   };

   const handleImportCaseInfo = async () => {
      const errors: Record<
         string,
         { rowIndex: number; errorMessage: string }[]
      >[] = [];
      const rowErrors: IImportCsvRowError[] = [];

      gridData.forEach((record, index: number) => {
         const recordErrors: Record<
            string,
            { rowIndex: number; errorMessage: string }[]
         > = {};
         const fields: IImportCsvFieldError[] = [];

         try {
            debugger
            validationSchema.validateSync(record, { abortEarly: false });
         } catch (error: any) {
            if (error.inner) {
               error.inner.forEach((detailError: any) => {
                  const propertyName = detailError.path || "unknown";
                  const errorMessage = `${detailError.message}`;
                  // const rowIndex = detailError?.rowIndex ?? -1;
                  const rowIndex = index;

                  fields.push({
                     fieldName: propertyName,
                     message: errorMessage,
                  });

                  if (!recordErrors[propertyName]) {
                     recordErrors[propertyName] = [];
                  }

                  recordErrors[propertyName].push({
                     rowIndex,
                     errorMessage,
                  });
               });
            }
         }

         if (Object.keys(recordErrors).length > 0) {
            errors.push(recordErrors);
         }

         rowErrors.push({
            rowIndex: index, // here index is rowIndex
            fields: fields,
         });
      });

      setRowErrors(rowErrors);
      setColumnErrors(errors);

      // if (errors.length === 0) {
      //    let error = false;
      //    const response = await getTypeValidation();
      //    if (response != undefined && response.status === HttpStatusCode.OK) {
      //       if (response.data && Array.isArray(response.data)) {
      //          // Loop through each element in the response data
      //          response.data.forEach(item => {
      //             // Check if the statusCode is 0 (or any specific status code you want to check for)
      //             if (item.statusCode === HttpStatusCode.BadRequest && item.message) {
      //                error = true;
      //                // Show the error message
      //                toast.error(item.message, {
      //                   position: toast.POSITION.TOP_RIGHT,
      //                });
      //             }
      //          });
      //          if (!error) {
      //             const isValidData = await checkValidation(response.data);
      //             if (isValidData === 0) {
      //                await importCaseInformation();
      //             }
      //          }
      //       }
      //    }
      //    else {
      //       toast.error('An unknown error occurred', {
      //          position: toast.POSITION.TOP_RIGHT,
      //       });
      //    }
      // }
      if (errors.length === 0) {
         // const response = await validateServerCaseInfo();
         // if (response !== undefined && response.status === HttpStatusCode.OK) {
         //    await importCaseInformation();
         // }
         await importCaseInformation();
      }
   };

   // const validateServerCaseInfo = async () => {
   //    try {
   //       setToggleSpinner(true);
   //       const formattedData = formatDataForServerCaseInfo(gridData);
   //       const request: ITypeValidateResource[] = formattedData.map((dataItem) => ({
   //          caseNumber: dataItem.caseNumber,
   //          filingType: dataItem.filingType,
   //          serviceMethod: dataItem.serviceMethod,
   //          serviceDate: dataItem.serviceDate,
   //          serverName: dataItem.serverName,
   //       }));
   //       const response = await ProcessServerService.validateProcessServerCaseType(request);
   //       return response;
   //    } catch (error) {
   //       console.error("An error occurred:", error);
   //    } finally {
   //       setToggleSpinner(false);
   //    }
   // };

   // const checkValidation = async (data: TypeValidateResponse[]) => {
   //    const errors: Record<string, { rowIndex: number; errorMessage: string }[]>[] = [];
   //    const rowErrors: IImportCsvRowError[] = [];
   //    const eviction = FilingType.Eviction;
   //    let totalError = 0;

   //    gridData.forEach((record, index: number) => {
   //       const recordErrors: Record<string, { rowIndex: number; errorMessage: string }[]> = {};
   //       const fields: IImportCsvFieldError[] = [];
   //       data.forEach(x => {
   //          x.serviceDate = convertUtcToEst(x.serviceDate.toLocaleString()).date
   //       });
   //       // Step 1: Find the corresponding caseNumber in the data
   //       const caseNumber = record.CaseNumber;
   //       const matchingData = data.find((item) => item.caseNumber.trim().toLowerCase() === caseNumber.trim().toLowerCase() && item.serverName.toLowerCase() === record.ServerName.toLowerCase()
   //          && item.serviceMethod.toLowerCase() === record.EvictionServiceMethod.toLowerCase() && normalizeDate(item.serviceDate) === normalizeDate(record.EvictionServiceDate));

   //       // Step 2: If a matching caseNumber is found, validate the FilingType
   //       if (matchingData) {
   //          // Scenario 1: If matchingData.filingType not exists(no AOS), check for taskStatus
   //          if (matchingData.filingType && matchingData.filingType.length == 0) {
   //             //if not entered filing type in import
   //             if (matchingData.selectedFilingType == null || matchingData.selectedFilingType == "") {
   //                if (matchingData.taskStatus && matchingData.taskStatus.length === 1) {
   //                   // If there is only one status, set the FilingType to that value
   //                   const statusValue = matchingData.taskStatus[0];
   //                   record.FilingType = statusValue;

   //                   // const successMessage = `Filing Type set to ${statusValue} for Case Number: ${caseNumber}`;
   //                   // fields.push({
   //                   //    fieldName: "FilingType",
   //                   //    message: successMessage,
   //                   // });
   //                } else if (matchingData.taskStatus && matchingData.taskStatus.length > 1) {
   //                   // Scenario 3: If there are two statuses, check both against FilingTypeList
   //                   const matchingStatuses = matchingData.taskStatus.filter((status) =>
   //                      FilingTypeList.some((item) => item.value === status)
   //                   );

   //                   if (matchingStatuses.length === 2) {
   //                      // If both statuses match, add validation message to set FilingType
   //                      // const errorMessage = `Please Select the FilingType.`;
   //                      // fields.push({
   //                      //    fieldName: "FilingType",
   //                      //    message: errorMessage,
   //                      // });
   //                      //  totalError++;
   //                   } else if (matchingStatuses.length === 1) {
   //                      // If only one status matches, set FilingType to that value
   //                      const matchedStatus = matchingStatuses[0];
   //                      record.FilingType = matchedStatus;

   //                      // const successMessage = `Filing Type set to ${matchedStatus} for Case Number: ${caseNumber}`;
   //                      // fields.push({
   //                      //    fieldName: "FilingType",
   //                      //    message: successMessage,
   //                      // });
   //                   }
   //                }
   //             }
   //             //if filing type entered for this case in import
   //             if (matchingData.selectedFilingType != null && matchingData.selectedFilingType != "") {
   //                const selectedFilingType = matchingData.selectedFilingType;

   //                // Scenario 1: If there is only one status in matchingData.status
   //                if (matchingData.taskStatus && matchingData.taskStatus.length === 1) {
   //                   const taskStatus = matchingData.taskStatus[0];

   //                   // Check if the selectedFilingType matches the taskStatus
   //                   if (taskStatus !== selectedFilingType) {
   //                      const errorMessage = `Filing Type mismatch Expected: ${taskStatus}, but found: ${selectedFilingType}.`;
   //                      fields.push({
   //                         fieldName: "FilingType",
   //                         message: errorMessage,
   //                      });
   //                      totalError++;

   //                      // if (!recordErrors["FilingType"]) {
   //                      //    recordErrors["FilingType"] = [];
   //                      // }
   //                      // recordErrors["FilingType"].push({
   //                      //    rowIndex: index,
   //                      //    errorMessage: errorMessage,
   //                      // });
   //                   }
   //                }
   //                // Scenario 2: If there are two statuses in matchingData.status
   //                else if (matchingData.taskStatus && matchingData.taskStatus.length > 1) {
   //                   const taskStatuses = matchingData.taskStatus;

   //                   // Check if both statuses match any in FilingTypeList
   //                   const matchingStatuses = taskStatuses.filter((status) =>
   //                      FilingTypeList.some((item) => item.value === status)
   //                   );

   //                   // If both statuses match FilingTypeList, do nothing
   //                   if (matchingStatuses.length === 2) {
   //                      // No action needed, both statuses match
   //                   } else if (matchingStatuses.length === 1) {
   //                      // If only one status matches, check if the selectedFilingType matches
   //                      const matchedStatus = matchingStatuses[0];

   //                      if (matchedStatus !== selectedFilingType) {
   //                         const errorMessage = `Filing Type mismatch Expected: ${matchedStatus}, but found: ${selectedFilingType}.`;
   //                         fields.push({
   //                            fieldName: "FilingType",
   //                            message: errorMessage,
   //                         });
   //                         totalError++;

   //                         if (!recordErrors["FilingType"]) {
   //                            recordErrors["FilingType"] = [];
   //                         }
   //                         recordErrors["FilingType"].push({
   //                            rowIndex: index,
   //                            errorMessage: errorMessage,
   //                         });
   //                      }
   //                   }
   //                }
   //             }
   //          }
   //          // Scenario 1: If case is imported already
   //          else if (matchingData.filingType && matchingData.filingType.length > 0) {
   //             //if not entered filing type in import
   //             if (matchingData.selectedFilingType == null || matchingData.selectedFilingType === "") {
   //                if (matchingData.taskStatus && matchingData.taskStatus.length === 1) {
   //                   // If there is only one taskStatus "Eviction" filing                
   //                   // Check if Eviction AOS document is signed (not in unsignedFilingType) then set
   //                   if (matchingData.unsignedFilingType.includes("File Eviction") === false) {
   //                      const statusValue = matchingData.taskStatus[0];
   //                      record.FilingType = statusValue;
   //                   } else {
   //                      // If the Eviction AOS document is not signed and is in unsignedFilingType
   //                      const errorMessage = `Already exists. Cannot import this case.`;
   //                      fields.push({
   //                         fieldName: "FilingType",
   //                         message: errorMessage,
   //                      });
   //                      totalError++;
   //                   }
   //                } else if (matchingData.taskStatus && matchingData.taskStatus.length > 1) {
   //                   const matchingStatuses = matchingData.taskStatus.filter((status) =>
   //                      FilingTypeList.some((item) => item.value === status)
   //                   );

   //                   if (matchingStatuses.length === 2) {
   //                      // Both statuses are present, need to check the if signed
   //                      const isEvictionSigned = matchingData.unsignedFilingType.includes("File Eviction") === false;
   //                      const isAmendmentSigned = matchingData.unsignedFilingType.includes("Amendments") === false;
   //                      if (isEvictionSigned && !isAmendmentSigned) {
   //                         //If Eviction is signed and Amendment not then set Eviction by dafault
   //                         record.FilingType = "File Eviction";
   //                      }
   //                      else if (!isEvictionSigned && isAmendmentSigned) {
   //                         //If Amendment is signed and Eviction not then set Amendment by default
   //                         record.FilingType = "Amendments";
   //                      }
   //                      else if (isEvictionSigned && isAmendmentSigned) {
   //                         //if both Eviction and Amendment signed then validation need to select
   //                         // const errorMessage = `Please select a FilingType.`;
   //                         // fields.push({
   //                         //    fieldName: "FilingType",
   //                         //    message: errorMessage,
   //                         // });
   //                         // totalError++;
   //                      }
   //                      else if (!isEvictionSigned && !isAmendmentSigned) {
   //                         //If both are unsigned cannot be imported
   //                         const errorMessage = `Already exists for both type. Cannot import this case.`;
   //                         fields.push({
   //                            fieldName: "FilingType",
   //                            message: errorMessage,
   //                         });
   //                         totalError++;
   //                      }

   //                   } else if (matchingStatuses.length === 1) {
   //                      // If only one status matches, that can be File Eviction only
   //                      //Check if unsigned document is there or not
   //                      if (matchingData.unsignedFilingType.includes("File Eviction") === false) {
   //                         const matchedStatus = matchingStatuses[0];
   //                         record.FilingType = matchedStatus;
   //                      } else {
   //                         // If the Eviction AOS document is not signed and is in unsignedFilingType
   //                         const errorMessage = `Already exists. Cannot import this case.`;
   //                         fields.push({
   //                            fieldName: "FilingType",
   //                            message: errorMessage,
   //                         });
   //                         totalError++;
   //                      }
   //                   }
   //                }
   //             }
   //             //if filing type entered for this case in import
   //             if (matchingData.selectedFilingType != null && matchingData.selectedFilingType != "") {
   //                const selectedFilingType = matchingData.selectedFilingType;

   //                // Scenario 1: If there is only one action performed Eviction filed
   //                if (matchingData.taskStatus && matchingData.taskStatus.length === 1) {
   //                   const taskStatus = matchingData.taskStatus[0];

   //                   // Check if the selectedFilingType matches the taskStatus if not mismatch error
   //                   if (taskStatus !== selectedFilingType) {
   //                      //again check if document is signed or not if unsigned cannot be imported again
   //                      if (matchingData.unsignedFilingType.includes("File Eviction")) {
   //                         const errorMessage = `Already exists. Cannot import this case.`;
   //                         fields.push({
   //                            fieldName: "FilingType",
   //                            message: errorMessage,
   //                         });
   //                         totalError++;
   //                      } else {
   //                         const errorMessage = `Filing Type mismatch Expected: ${taskStatus}, but found: ${selectedFilingType}.`;
   //                         fields.push({
   //                            fieldName: "FilingType",
   //                            message: errorMessage,
   //                         });
   //                         totalError++;
   //                         // if (!recordErrors["FilingType"]) {
   //                         //    recordErrors["FilingType"] = [];
   //                         // }
   //                         // recordErrors["FilingType"].push({
   //                         //    rowIndex: index,
   //                         //    errorMessage: errorMessage,
   //                         // });
   //                      }
   //                   }
   //                   else if (taskStatus === selectedFilingType) {
   //                      // Check if Eviction AOS document is unsigned then error
   //                      if (matchingData.unsignedFilingType.includes("File Eviction")) {
   //                         const errorMessage = `Already exists. Cannot import this case.`;
   //                         fields.push({
   //                            fieldName: "FilingType",
   //                            message: errorMessage,
   //                         });
   //                         totalError++;
   //                      } else {
   //                         // do nothing as can be reimported for File Eviction
   //                      }
   //                   }
   //                }
   //                // Scenario 2: If there are two statuses in matchingData.status
   //                else if (matchingData.taskStatus && matchingData.taskStatus.length > 1) {
   //                   const taskStatuses = matchingData.taskStatus;

   //                   // Check if both statuses match any in FilingTypeList
   //                   const matchingStatuses = taskStatuses.filter((status) =>
   //                      FilingTypeList.some((item) => item.value === status)
   //                   );

   //                   // If both statuses match FilingTypeList, do nothing
   //                   if (matchingStatuses.length === 2) {
   //                      // Both statuses are present, need to check the if signed
   //                      const isEvictionSigned = matchingData.unsignedFilingType.includes("File Eviction") === false;
   //                      const isAmendmentSigned = matchingData.unsignedFilingType.includes("Amendments") === false;
   //                      if (!isEvictionSigned && !isAmendmentSigned) {
   //                         //If both are unsigned cannot be imported
   //                         const errorMessage = `Already exists for both type. Cannot import this case.`;
   //                         fields.push({
   //                            fieldName: "FilingType",
   //                            message: errorMessage,
   //                         });
   //                         totalError++;
   //                      }
   //                      else if (isEvictionSigned && !isAmendmentSigned) {
   //                         //If Eviction is signed and Amendment not 
   //                         //if not mismatch error here otherwise correct
   //                         if (selectedFilingType != "File Eviction") {
   //                            const errorMessage = `Filing Type mismatch Expected: ${"FileEviction"}, but found: ${selectedFilingType}.`;
   //                            fields.push({
   //                               fieldName: "FilingType",
   //                               message: errorMessage,
   //                            });
   //                            totalError++;
   //                         }
   //                      }
   //                      else if (!isEvictionSigned && isAmendmentSigned) {
   //                         //If Amendment is signed and Eviction not 
   //                         //if not mismatch error here otherwise correct
   //                         if (selectedFilingType != "Amendments") {
   //                            const errorMessage = `Filing Type mismatch Expected: ${"Amendments"}, but found: ${selectedFilingType}.`;
   //                            fields.push({
   //                               fieldName: "FilingType",
   //                               message: errorMessage,
   //                            });
   //                            totalError++;
   //                         }
   //                      }
   //                      else if (isEvictionSigned && isAmendmentSigned) {
   //                         //if both Eviction and Amendment signed then selected is correct
   //                      }
   //                   } else if (matchingStatuses.length === 1) {
   //                      // If only one status matches, check if the selectedFilingType matches
   //                      const matchedStatus = matchingStatuses[0];

   //                      if (matchedStatus !== selectedFilingType) {
   //                         if (matchingData.unsignedFilingType.includes("File Eviction")) {
   //                            const errorMessage = `Already exists. Cannot import this case.`;
   //                            fields.push({
   //                               fieldName: "FilingType",
   //                               message: errorMessage,
   //                            });
   //                            totalError++;
   //                         } else {
   //                            const errorMessage = `Filing Type mismatch Expected: ${matchedStatus}, but found: ${selectedFilingType}.`;
   //                            fields.push({
   //                               fieldName: "FilingType",
   //                               message: errorMessage,
   //                            });
   //                            totalError++;
   //                            // if (!recordErrors["FilingType"]) {
   //                            //    recordErrors["FilingType"] = [];
   //                            // }
   //                            // recordErrors["FilingType"].push({
   //                            //    rowIndex: index,
   //                            //    errorMessage: errorMessage,
   //                            // });
   //                         }
   //                      }
   //                      else if (matchedStatus === selectedFilingType) {
   //                         // Check if Eviction AOS document is unsigned then error
   //                         if (matchingData.unsignedFilingType.includes("File Eviction")) {
   //                            const errorMessage = `Already exists. Cannot import this case.`;
   //                            fields.push({
   //                               fieldName: "FilingType",
   //                               message: errorMessage,
   //                            });
   //                            totalError++;
   //                         } else {
   //                            // do nothing as can be reimported for File Eviction
   //                         }
   //                      }
   //                   }
   //                }
   //             }
   //          }
   //       }

   //       // Collect errors for this record
   //       if (Object.keys(recordErrors).length > 0) {
   //          errors.push(recordErrors);
   //       }

   //       rowErrors.push({
   //          rowIndex: index, // here index is rowIndex
   //          fields: fields,
   //       });
   //    });

   //    setRowErrors(rowErrors);
   //    setColumnErrors(errors);
   //    return totalError
   // };

   const importCaseInformation = async () => {
      try {
         setToggleSpinner(true);
         setShowSelectionPrompt(false);
         setPromptMessage("");
         const formattedData = formatDataForServerCaseInfo(gridData);
         const request: IServerCaseInfoResource = {
            caseInfoList: formattedData,
            importSignedCases: showImportConfirmation
         };

         const response = await ProcessServerService.importProcessServerCaseInfo(request);

         if (response.status === HttpStatusCode.OK) {
            if (response.data.statusCode === 409) {
               setAlreadySignedCases(response.data.message);
               setShowImportConfirmation(true);
            } else {
               setAlreadySignedCases(null);
               setShowImportConfirmation(false);
               props.setImportCsvPopUp(false);
               // getProcessServerCases(1, 100);
               getProcessServerCases(1, 100, processServerCases.searchParam, processServerCases.serverName, processServerCases.serviceMethod, processServerCases.dateRange);
               toast.success("Case information imported successfully");
            }
         } else {
            if (response.data.message.contains("Please select")) {
               toast.error(response.data.message, {
                  position: toast.POSITION.TOP_CENTER,
               });
               setShowSelectionPrompt(true);
               setPromptMessage(response.data.message);
            }
            console.error("Failed to add the process server data.");
         }
      } catch (error) {
         console.error("An error occurred:", error);
      } finally {
         setToggleSpinner(false);
      }
   };

   /**
    *  handle cross click
    */
   const handleCrossClick = (rowIndex: number) => {
      let filteredRecords = gridData.filter((_, index) => index !== rowIndex);
      const newColumnErrors = [...columnErrors];
      newColumnErrors.splice(rowIndex, 1);
      setColumnErrors(newColumnErrors);
      // Set the updated array to the state or wherever you store the data
      setTotalRecord(filteredRecords.length);
      setGridData(filteredRecords);
   };

   /**
    *  * setting updated value in the editable grid
    * @param columnName editable column name
    * @param updatedBValue updated value in the text box
    * @param selectedRowIndex selected row
    */
   const handleInputChange = (
      columnName: string,
      updatedBValue: string,
      selectedRowIndex: number
   ) => {
      
      let sanitizedValue =
         columnName === "ServiceFee"
            ? formatCurrency(
               parseFloat(updatedBValue.toString().replace(/[^0-9.]/g, ""))
            )
            : updatedBValue;
      if (columnName === "CaseNumber") {
         var updatedRow = gridData[selectedRowIndex];
         updatedRow.CaseNumber=updatedBValue;
         if (updatedRow)
            handleGetFilingTypeOptionsForSingleRow(updatedRow);
      }
      else {
         setGridData((prevRows) =>
            prevRows.map((row, rowIndex) => {
               const updatedRow =
                  rowIndex === selectedRowIndex
                     ? { ...row, [columnName]: updatedBValue }
                     : row;
               // Perform validation for the updated row
               validateRow(updatedRow, rowIndex);

               return updatedRow;
            })
         );
         setNameMismatchError(null);
      }
   };

   const validateRow = (row: IProcessServerImportCsv, rowIndex: number) => {
      const recordErrors: Record<
         string,
         { rowIndex: number; errorMessage: string }[]
      > = {};
      const fields: IImportCsvFieldError[] = [];
      try {
         // Validate the updated row against the schema
         validationSchema.validateSync(row, { abortEarly: false });
      } catch (error: any) {
         if (error.inner) {
            // Collect validation errors for each property
            error.inner.forEach((detailError: any) => {
               const propertyName = detailError.path || "unknown";
               const errorMessage = `${detailError.message}`;

               // Get the row index from your record, adjust this based on your data structure
               const rowIndex = detailError.rowIndex || -1;

               fields.push({
                  fieldName: propertyName,
                  message: errorMessage,
               });

               // Check if the property already has errors, if not, initialize an array
               if (!recordErrors[propertyName]) {
                  recordErrors[propertyName] = [];
               }

               // Push the error object with rowIndex to the array
               recordErrors[propertyName].push({
                  rowIndex,
                  errorMessage,
               });
            });
         }
      }

      // Update row errors for the specific row
      setRowErrors((prevErrors) => {
         const updatedRowErrors = [...prevErrors];
         updatedRowErrors[rowIndex] = { rowIndex, fields };
         return updatedRowErrors;
      });

      // If there are errors for the record, update the columnErrors state
      setColumnErrors((prevErrors) => [
         ...prevErrors.slice(0, rowIndex),
         recordErrors,
         ...prevErrors.slice(rowIndex + 1),
      ]);
   };

   const loadUserData = (data: IProcessServerImportCsv[]) => {
      try {
         if (data.length === 0) {
            setShowUploadCsv(true);
            setToggleSpinner(false);
            setShowEmptyRecordMessage(true);
            return;
         }
         setTotalRecord(data.length);
         setShowUploadCsv(false);
         setShowEmptyRecordMessage(false);
         setShowInvalidCSVMessage(false);

         const formattedData = data.map((item: IProcessServerImportCsv) => {
            const formatDate = (dateString: string | null | undefined) => {
               if (!dateString) return "";
               const date = new Date(dateString);
               const options: Intl.DateTimeFormatOptions = {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
               };
               return new Intl.DateTimeFormat("en-US", options).format(date);
            };

            return {
               Remove: "",
               ...item,
               // ServiceFee: item.ServiceFee.replace(/\s/g, "").replace("$", ""),
               DateScanned: formatDate(item.DateScanned as string) ?? "",
               EvictionServiceDate: formatDate(item.EvictionServiceDate as string) ?? "",
               EvictionServiceMethod: getEvictionServiceMethod(item.EvictionServiceMethod) ?? "",
               FilingType: getFilingType(item.FilingType) ?? "",
            };
         });
         handleGetFilingTypeOptions(formattedData);
         // setGridData(formattedData);
         setToggleSpinner(false);
      } catch (error) {
         setShowUploadCsv(true);
         setToggleSpinner(false);
         setShowInvalidCSVMessage(true);
      }
   };
   const handleGetFilingTypeOptionsForSingleRow = async (updatedRecord: IProcessServerImportCsv) => {
      ;
      try {
         // Fetch the amendment version for the specific record
         const response = await ProcessServerService.getAmendmentVersionByDispoId([updatedRecord.CaseNumber]);

         // Filter the responses matching the current record's CaseNumber
         const matchingResponses = response.filter(
            (item: any) =>
               item.caseNumber.toLowerCase().trim() === updatedRecord.CaseNumber.toLowerCase().trim()
         );

         // Generate the amendment options for the updated record
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

         // Update only the specific record in the filteredRecords list
         setGridData((prevData) =>
            prevData.map((record) =>
               record.CaseNumber === updatedRecord.CaseNumber
                  ? { ...record, filingTypeOptions }
                  : record
            )
         );
      } catch (error) {
         console.error("Error fetching filing type options:", error);
      }
   };

   const handleGetFilingTypeOptions = async (filteredRecords: IProcessServerImportCsv[]) => {
      
      try {
         const response = await ProcessServerService.getAmendmentVersionByDispoId(
            filteredRecords.map((record) => record.CaseNumber)
         );

         const updatedRecords = filteredRecords.map((record) => {
            // Get responses matching the current record's dispoId
            const matchingResponses = response.filter(
               (item: any) =>
                  item.caseNumber.toLowerCase().trim() === record.CaseNumber.toLowerCase().trim()
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

            return {
               ...record,
               filingTypeOptions,
            };
         });

         // Update the state with reordered records
         setGridData(updatedRecords);

      } catch (error) {
         console.error("Error fetching filing type options:", error);
      }
   };

   const getFieldsErrorMessages = (rowIndex: number, propertyName: string) => {
      const errorMessages: string[] = [];
      rowErrors.filter((error) => {
         if (!error.fields.length) return null;
         if (error.rowIndex === rowIndex && error.fields.length) {
            error.fields.forEach((f) => {
               if (f.fieldName === propertyName) {
                  errorMessages.push(f.message);
               }
            });
         }
      });

      return errorMessages;
   };

   const handleFileUpload = (data: IProcessServerImportCsv[]) => {
      if (data.length === 0) {
         setToggleSpinner(false);
         toast.error(
            "The uploaded file is empty. Please make sure the file is not empty and try again."
         );
         return;
      }
      // Trim spaces from each cell in the data and remove entries with empty string keys
      const trimmedData = data.map(record => {
         const trimmedRecord: Partial<IProcessServerImportCsv> = {};
         for (const key in record) {
            if (record.hasOwnProperty(key)) {
               const trimmedKey = key.trim();
               if (trimmedKey !== "") {
                  const value = record[key as keyof IProcessServerImportCsv];

                  // Handle the specific type of the value
                  if (typeof value === 'string') {
                     trimmedRecord[trimmedKey as keyof IProcessServerImportCsv] = value.trim() as any;
                  } else if (value instanceof Date) {
                     trimmedRecord[trimmedKey as keyof IProcessServerImportCsv] = value.toISOString() as any; // or value depending on your logic
                  } else if (Array.isArray(value)) {
                     // If it's an array (e.g., ISelectOptions[])
                     trimmedRecord[trimmedKey as keyof IProcessServerImportCsv] = [...value] as any;
                  } else {
                     // Handle other potential types (e.g., numbers, booleans)
                     trimmedRecord[trimmedKey as keyof IProcessServerImportCsv] = value as any;
                  }
               }
            }
         }
         return trimmedRecord as IProcessServerImportCsv;
      });


      const keys = Object.keys(trimmedData[0])
         .map(key => key.trim())
         .filter(key => key !== "");

      const headerMatches = keys.every((key) =>
         ProcessServerCaseInfoCSVHeader.includes(key)
      );

      if (
         headerMatches &&
         ProcessServerCaseInfoCSVHeader.length === keys?.length
      ) {
         loadUserData(trimmedData);
      } else {
         setToggleSpinner(false);
         toast.error(
            "The uploaded file header does not match. Please download the template, and try uploading again."
         );
      }
   };

   const handleFileUploadError = (error: Error) => {
      if (error.message === "File size exceeds the maximum allowed size.") {
         setShowMaxRecords(true);
      } else {
         setShowMaxRecords(false);
      }
      setToggleSpinner(false);
   };

   const resetSelectedRows = () => {
      setSelectedProcessServerId([]);
      setProcessServerCases((prev) => {
         return {
            ...prev,
            items: prev.items.map((item) => ({
               ...item,
               isChecked: false,
            })),
         };
      });
   };

   const handleCellRendered = (
      data: IProcessServerImportCsv,
      rowIndex: number,
      cellIndex: number
   ) => {

      const columnNames = Object.keys(data);
      const columnName = columnNames[cellIndex];
      const cellValue = data[columnName as keyof IProcessServerImportCsv];
      const isServiceTypePersonalOrNotorious =
         data.EvictionServiceMethod === ServiceMethod.PERSONALLY ||
         data.EvictionServiceMethod === ServiceMethod.NOTORIOUSLY;

      if (columnName === "Remove") {
         return (
            <td
               key={cellIndex}
               className="px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap "
            >
               <div className="cursor-pointer trash-icon" key={`${rowIndex}_cross`}>
                  <FaTrash
                     style={{
                        height: 14,
                        width: 14,
                        color: "#E61818",
                     }}
                     onClick={() => handleCrossClick(rowIndex)}
                  ></FaTrash>
               </div>
            </td>
         );
      } else if (columnName === "EvictionServiceMethod") {
         return (
            <td
               key={cellIndex}
               className="px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap "
            >
               {/* Use a regular HTML select element */}
               <div className="relative text-left max-w-[120px]">
                  <DropdownPresentation
                     heading={""}
                     selectedOption={{
                        id: cellValue as string,
                        value: cellValue as string,
                     }}
                     handleSelect={(event) =>
                        handleInputChange?.(columnName, event.target.value, rowIndex)
                     }
                     options={ServiceMethodList}
                     placeholder="Select"
                  />
                  {getFieldsErrorMessages(rowIndex, columnName).map(
                     (message, index) => (
                        <div key={index} className="text-red-500 whitespace-normal">
                           {message}
                        </div>
                     )
                  )}
               </div>
            </td>
         );
      } else if (columnName === "FilingType") {
         return (
            <td
               key={cellIndex}
               className="px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap "
            >
               {/* Use a regular HTML select element */}
               <div className="relative text-left max-w-[120px]">
                  <DropdownPresentation
                     heading={""}
                     selectedOption={{
                        id: cellValue as string,
                        value: cellValue as string,
                     }}
                     handleSelect={(event) => {
                        handleInputChange?.(columnName, event.target.value, rowIndex)
                     }}
                     options={data.filingTypeOptions ?? []}
                     placeholder="Select"
                     disabled={false}
                     sort={false}
                  />
                  {getFieldsErrorMessages(rowIndex, columnName).map(
                     (message, index) => (
                        <div key={index} className="text-red-500 whitespace-normal">
                           {message}
                        </div>
                     )
                  )}
               </div>
            </td>
         );
      }
      else if (columnName === "filingTypeOptions") {
         return <></>
      }
      else if (
         columnName === "PersonServed" ||
         columnName === "Height" ||
         columnName === "Weight" ||
         columnName === "Age"
      ) {
         return (
            <td
               key={cellIndex}
               className="px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap"
            >
               {isServiceTypePersonalOrNotorious ? (
                  <input
                     type={"text"}
                     value={
                        typeof cellValue === "number"
                           ? formatCurrency(cellValue)
                           : (cellValue as any)
                     }
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10.5px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
                     onChange={(e) =>
                        handleInputChange?.(columnName, e.target.value, rowIndex)
                     }
                     disabled={!isServiceTypePersonalOrNotorious}
                  />
               ) : (
                  <input
                     type={"text"}
                     value={"N/A"}
                     className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10.5px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px]`}
                     disabled
                  />
               )}
               {getFieldsErrorMessages(rowIndex, columnName).map(
                  (message, index) => (
                     <div key={index} className="text-red-500 whitespace-normal">
                        {message}
                     </div>
                  )
               )}
            </td>
         );
      } else if (
         columnName === "DateScanned" ||
         columnName === "EvictionServiceDate"
      ) {
         return (
            <td
               key={cellIndex}
               className="px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap"
            >
               <div className="datePicker">
                  <DatePicker
                     selected={
                        cellValue && Date.parse(cellValue as string)
                           ? new Date(cellValue as string)
                           : null // new Date()
                     }
                     onChange={(date: any) => {
                        const dateString = date ? date.toLocaleDateString() : "";
                        handleInputChange?.(columnName, dateString, rowIndex);
                     }}
                     dateFormat="MM/dd/yyyy"
                     placeholderText="mm/dd/yyyy"
                     className="bg-calendar bg-no-repeat bg-[center_right_10px] peer placeholder-gray-500 outline-none p-2.5 py-1 h-[31px] pr-7 min-w-32 block border w-full border-gray-200 rounded-md text-[10.5px]  focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none        "
                  />
               </div>
               {getFieldsErrorMessages(rowIndex, columnName).map(
                  (message, index) => (
                     <div key={index} className="text-red-500 whitespace-normal">
                        {message}
                     </div>
                  )
               )}
            </td>
         );
      } else if (columnName === "ProcessServerEmail") {
         return <td
            key={cellIndex}
            className="px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap"
         >
            <input
               type={"text"}
               value={(cellValue as any)}
               className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10.5px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px] ${(cellValue === null || cellValue === '') ? 'border-red-500' : ''
                  }`}
               onChange={(e) =>
                  handleInputChange?.(columnName, e.target.value, rowIndex)
               }
            />
            {getFieldsErrorMessages(rowIndex, columnName).map(
               (message, index) => (
                  <div key={index} className="text-red-500 whitespace-normal">
                     {message}
                  </div>
               )
            )}
         </td>
      } else {
         return (
            <td
               key={cellIndex}
               className="px-1.5 py-2 md:py-2.5 font-normal text-[10.5px] text-gray-900 whitespace-nowrap "
            >
               <input
                  type={"text"}
                  value={
                     typeof cellValue === "number"
                        ? formatCurrency(cellValue)
                        : (cellValue as any)
                  }
                  className={`peer outline-none p-2 py-1 block border w-full rounded-md text-[10.5px] placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[31px] ${columnName === "Expedited" ? "font-bold" : ""
                     }`}
                  onChange={(e) =>
                     handleInputChange?.(columnName, e.target.value, rowIndex)
                  }
               />
               {getFieldsErrorMessages(rowIndex, columnName).map(
                  (message, index) => (
                     <div key={index} className="text-red-500 whitespace-normal">
                        {message}
                     </div>
                  )
               )}
            </td>
         );
      }
   };

   return (
      <>
         <Modal
            showModal={props.importCsvPopUp}
            onClose={() => {
               props.setImportCsvPopUp(false);
               resetSelectedRows();
            }}
            width="max-w-5xl importCsv"
         >
            {toggleSpinner && <Spinner></Spinner>}
            <div className="rounded-md bg-white text-left transition-all w-full py-4 px-3.5 md:p-5 m-auto">
               {(showUploadCsv === true || totalRecord == 0) && (
                  <div className="flex w-full my-1.5 md:my-2 justify-center rounded-md border border-dashed border-gray-900/25 px-3.5 py-3.5 md:px-5 md:py-5">
                     <div className="text-center">
                        <img
                           src={fileUpload}
                           className="mx-auto h-10 w-10 text-gray-300"
                           color="red"
                        ></img>
                        <div className="mt-1.5 text-xs leading-5 text-[#2472db]">
                           <Formik initialValues={initialValues} onSubmit={() => { }}>
                              {(formik) => (
                                 <Form>
                                    <FormikControl
                                       control="fileUpload"
                                       type="file"
                                       label={"Click here to upload .csv or .xlsx file"}
                                       name={"UploadFile"}
                                       accept={
                                          ".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                       }
                                       showSpinner={(value: boolean) =>
                                          setToggleSpinner(value)
                                       }
                                       onDataLoaded={handleFileUpload}
                                       onError={(error: Error) =>
                                          handleFileUploadError(error)
                                       }
                                       className="sr-only"
                                       filingType={"PS"}
                                    />
                                 </Form>
                              )}
                           </Formik>

                           <p className="w-full text-xs mt-3 text-[#2472db]">
                              <DownloadButton
                                 headers={ProcessServerCaseInfoCSVHeader}
                                 fileName={"ProcessServerCaseInfo"}
                                 title={"Click here to download a blank template"}
                              />
                           </p>
                        </div>
                     </div>
                  </div>
               )}
               {gridData?.length > 0 ? (
                  <>
                     <div className="sm:flex sm:items-start">
                        <div className="mt-2.5 text-center sm:mt-0 sm:text-left">
                           <h3
                              className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                              id="modal-title"
                           >
                              Preview
                           </h3>
                        </div>
                     </div>
                     <div className="preview-data">
                        <Grid
                           columnHeading={[
                              "",
                              "DateScanned",
                              "CaseNumber",
                              "ProcessServerEmail",
                              // "ServiceType",
                              "EvictionServiceMethod",
                              "PersonServed",
                              "Height",
                              "Weight",
                              "Age",
                              "ServiceNotes",
                              "EvictionServiceDate",
                              // "Defendant Name",
                              //   "House",
                              //   "ServiceFee",
                              "ServerName",
                              //   "Longitude",
                              //   "Latitude",
                              "LocationCoord",
                              //   "County",
                              //   "Comments",
                              "ServiceComments",
                              "FilingType"
                           ]}
                           rows={gridData}
                           showInPopUp={true}
                           cellRenderer={(
                              data: IProcessServerImportCsv,
                              rowIndex: number,
                              cellIndex: number
                           ) => handleCellRendered(data, rowIndex, cellIndex)}
                        ></Grid>
                     </div>
                     <div className="text-center mt-3">
                        <span className="text-[#E61818]">{nameMismatchError}</span>
                     </div>
                     <div className="flex items-center justify-between mt-3.5">
                        <div className="text-xs sm:text-sm font-semibold text-slate-900">
                           Total No. of Records : {totalRecord}
                        </div>
                        <div className="mt-1.5 flex justify-end">
                           <Button
                              type="button"
                              isRounded={false}
                              title="Cancel"
                              handleClick={() => props.setImportCsvPopUp(false)}
                              classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2.5 px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                           ></Button>
                           <Button
                              type="button"
                              isRounded={false}
                              handleClick={handleImportCaseInfo}
                              title="Confirm"
                              disabled={toggleSpinner}
                              classes="text-xs bg-[#2472db] hover:bg-[#0d5ecb] inline-flex justify-center items-center rounded-md font-semibold py-2.5 px-5 text-white"
                           ></Button>
                        </div>
                     </div>
                  </>
               ) : null}
               {showEmptyRecordMessage && (
                  <p className="text-center text-red-500	">No record found </p>
               )}
               {showInvalidCSVMessage && (
                  <p className="text-center text-red-500	">
                     Invalid format. Please download the template and re-upload your
                     records.
                  </p>
               )}
               {showMaxRecords && (
                  <p className="text-center text-red-500	">
                     File size exceeds the maximum allowed size.
                  </p>
               )}
               {columnErrors.some((errors) => Object.keys(errors).length > 0) && (
                  <p className="text-red-500 text-center">
                     Please validate your data
                  </p>
               )}
            </div>
         </Modal>
         {showImportConfirmation && (
            <Modal
               showModal={showImportConfirmation}
               onClose={() => setShowImportConfirmation(false)}
               width="max-w-md"
            >
               {/* Container for the content */}
               <div id="fullPageContent">
                  <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                     <div className="text-center pr-4 sm:text-left">
                        <h3
                           className="text-sm font-semibold leading-5 text-gray-900"
                           id="modal-title"
                        >
                           The following case(s) already have an AOS. Do you want to create another AOS for these case(s)?
                        </h3>
                        <p>{alreadySignedCases}</p>
                     </div>
                  </div>
                  <div className="flex justify-end m-2">
                     <Button
                        type="button"
                        isRounded={false}
                        title="No"
                        handleClick={() => setShowImportConfirmation(false)}
                        //disabled={showSpinner}
                        classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg "
                     ></Button>
                     <Button
                        handleClick={() => importCaseInformation()}
                        title="Yes"
                        isRounded={false}
                        type={"button"}
                        //disabled={showSpinner}
                        classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                     ></Button>
                  </div>
               </div>
            </Modal>
         )}
      </>
   );
};

export default ProcessServer_ImportCsv;


