import React from 'react';
import HighlightedText from 'components/common/highlightedText/HighlightedText';
import * as yup from "yup";
import vm from "utils/validationMessages";
import CommonValidations from "utils/common-validations";
import { ICountyItems } from 'interfaces/county.interface';
import { IEmailQueue, IEmailQueueItem } from 'interfaces/email-queue.interface';
import GridCheckbox from 'components/formik/GridCheckBox';
import { toast } from 'react-toastify';
import HelperViewPdfService from "services/helperViewPdfService";
import IconButton from "components/common/button/IconButton";
import { FaCopy, FaTimes } from 'react-icons/fa';
import { getStatusClassName } from './helper';

export const formattedCell = (value: any) => (
   <span>{value !== null ? value : ""}</span>
);

export const formatAttorneyCell = (record: any) => (
   <span>
      {record.attorneyName && <>{formatNoWrapSpan(record.attorneyName)}<br /></>}
      {record.attorneyBarNo && <>Bar#: {formatNoWrapSpan(record.attorneyBarNo)}<br /></>}
      {record.attorneyEmail && <>{formatNoWrapSpan(record.attorneyEmail)}<br /></>}
   </span>
);

export const formatTenantName = (value: any, index: number) => (
   `${value.firstName ?? ""} ${value.middleName ?? ""} ${value.lastName ?? ""}`
      .trim()
      .replace(/\s+/g, ' ')
);
export const formatTenantUnitCell = (value: string) => (
   <span style={{ fontWeight: '600' }}>
      {value}
   </span>
);
export const formatTenantNamesCell = (values: any[], andallothers: string) => (
   <span style={{ fontWeight: '600' }}>
      {values.map((value, index) => (
         <>
            <span key={index} className="whitespace-nowrap">
               {formatTenantName(value, index)}
            </span>
            <br />
         </>
      ))}
      {(andallothers) && (
         <span className="whitespace-nowrap">
            {andallothers}
         </span>
      )}
   </span>
);
export const formatNoWrapSpan = (value: string) => (
   <span className="whitespace-nowrap">
      {value}
   </span>
);
export const formatCityStateZip = (city: string, state: string, zip: string) => (
   ((city ?? "") + ", " + (state ?? "") + " " + (zip ?? ""))
);
export const formatTenantAddressCell = (record: any) => {
   const address = record.tenantAddress ?? "";
   const unit = record.tenantUnit ?? "";
   
   // Get the last character of address and unit
   const lastCharAddress = address.charAt(address.length - 1);
   const lastCharUnit = unit.charAt(unit.length - 1);
   
   // Check if last character of address matches the last character of unit
   const isLastCharMatch = lastCharAddress === lastCharUnit;

   return (
      <span style={{ fontWeight: '600' }}>
         {/* Display the tenant address */}
         {address && <>{formatNoWrapSpan(address)}<br /></>}

         {/* Display the unit only if the last characters do not match */}
         {unit && !isLastCharMatch && <>{formatNoWrapSpan(unit)}<br /></>}

         {/* Display City, State, Zip */}
         {formatNoWrapSpan(formatCityStateZip(record.tenantCity, record.tenantState, record.tenantZip))}<br />
      </span>
   );
};


export const formatPropertyNameAddressCell = (record: any) => (
   <span>
      {record.ownerName && <>{formatNoWrapSpan(record.ownerName)}<br /></>}
      {record.propertyName && <>{formatNoWrapSpan(record.propertyName)}<br /></>}
      {record.propertyAddress && <>{formatNoWrapSpan(record.propertyAddress)}<br /></>}
      {(record.propertyCity || record.propertyState || record.propertyZip) && (
         <>
            <span className="whitespace-nowrap">
               {record.propertyCity ?? ""}, {record.propertyState ?? ""} {record.propertyZip ?? ""}
            </span>
            <br />
         </>
      )}
      {(record.propertyPhone || record.propertyEMail) && (
         <>
            {record.propertyPhone ?? ""} {record.propertyEMail ?? ""}
         </>
      )}
   </span>
);

export const renderHighlightedCell = (value: any, searchParam: any) => (
   <HighlightedText text={value as string ?? ''} query={searchParam ?? '2'} />
);

export const formatFilerBusinessInfoCell = (record: any) => (
   <span>
      {record.filerBusinessName && <>{formatNoWrapSpan(record.filerBusinessName)}<br /></>}
      {record.filerPhone && <>{formatNoWrapSpan(record.filerPhone)}<br /></>}
      {record.filerEmail && <>{formatNoWrapSpan(record.filerEmail)}<br /></>}
   </span>
);

export const emailQueueValidationSchema = (allCounties: ICountyItems[]): any => {
   return yup.object({
      processServerEmail: yup.string().email(vm.email.email),
      // filerEmail: yup.string().email(vm.email.email).required(vm.email.required),
      filerEmail: yup
         .string()
         .required("Please enter filer email.")
         .test("valid-emails", "Invalid email format. Enter in johndoe@gmail.com, sarahjane@yahoo.com, etc format", (value) => {
            if (!value) return true; // Allow empty value
            const emails = value.split(",").map((email) => email.trim());
            const isValid = emails.every((email) =>
               yup.string().email().isValidSync(email)
            );
            return isValid;
         }),
      // caseNo: yup
      //    .string()
      //    .required(vm.caseNo.required),
      tenantAddress: yup
         .string()
         .required("Please enter address")
         .min(3, "Address must be at least 3 characters")
         .max(300, "Address must not exceed 300 characters"),
      tenantUnit: yup.string(),
      tenantCity: yup
         .string()
         .required("Please enter city")
         .max(50, "City must not exceed 50 characters"),
      tenantState: yup
         .string()
         .required("Please enter state code.")
         .max(2, "State Code must be of 2 characters."),
      propertyName: yup
         .string()
         .required("Please enter property")
         .max(100, "Property must not exceed 100 characters"),
      evictionReason: yup
         .string()
         .required("Please enter reason")
         .max(200, "Reason must not exceed 50 characters"),
      tenant1FirstName: yup
         .string()
         .required(vm.tenant1First.required)
         .max(50, vm.tenant1First.max),
      tenant1MiddleName: yup
         .string()
         .max(50, vm.tenant1MI.max),
      tenant1LastName: yup
         .string()
         .required(vm.tenant1Last.required)
         .max(50, vm.tenant1Last.max),
      expedited: yup.string(),
      county: CommonValidations.countyValidation(allCounties.map(c => c.countyName.toLowerCase())),
      // tenantZip: yup
      //    .string()
      //    .required(vm.zip.required)
      //    .min(5, vm.zip.min)
      //    .max(5, vm.zip.max),
      tenantZip: yup
         .string()
         .required(vm.zip.required),
      referenceId: yup.string()
         .matches(/^[0-9]+$/, vm.referenceId.matches),
      evictionCourtFee: yup
         .string()
         .test(
            "isCurrency",
            vm.evictionCourtFee.test,
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         )
         .test(
            "maxAmount",
            vm.evictionCourtFee.testAmount,
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
               return numericValue <= 9999;
            }
         ),
      eFileFeeClient: yup
         .string()
         .test(
            "isCurrency",
            vm.eFileFeeClient.test,
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         )
         .test(
            "maxAmount",
            vm.eFileFeeClient.testAmount,
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
               return numericValue <= 9999;
            }
         ),
      transactionfee: yup
         .string()
         .test(
            "isCurrency",
            vm.transactionfee.test,
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         )
         .test(
            "maxAmount",
            vm.transactionfee.testAmount,
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
               return numericValue <= 9999;
            }
         ),
   });
}

const openPdf = async (url: string) => {
   HelperViewPdfService.GetPdfView(url);
};

export const getEmailQueueGridenderers = (
   data: IEmailQueueItem, 
   selectedEmailTaskIds: string[],
   handleCheckBoxChange: (index: number, id: string, checked: boolean, taskId: string) => void,
   rowIndex : number,
   cellValue: any,
   setHoveredDocumentId: (id : string | null) => void,
   hoveredDocumentId: string | null,
   handleDeletelink: (id: string) => void,
   renderActionCell: (data: IEmailQueueItem) => React.JSX.Element,
   renderStatusCell: (status: string, county: string) => React.JSX.Element,
   emailQueues: IEmailQueue,
   formattedDateCell: (val: any) => React.JSX.Element,
   renderHighlightedAmount: (cellValue: any, data: IEmailQueueItem) => React.JSX.Element,
): Record<string, () => JSX.Element> => {
   return {
      
      isChecked: () => (
         <GridCheckbox
            checked={selectedEmailTaskIds.includes(data.taskId as string)}
            onChange={(checked: boolean) =>
               handleCheckBoxChange(rowIndex, data.id, checked, data.taskId)}
            label=""
         />
      ),
      documents: () => {

         const handleCopyClick = (url: string | undefined) => {
            if (url) {
               navigator.clipboard.writeText(url);
               toast.success("Document URL copied to clipboard!");
            }
         };

         if (!cellValue || !cellValue.url || !data?.caseNo) {
            return <></> as JSX.Element; // Return an empty fragment instead of null
         }

         return (
            <>
               <div
                  className="relative w-40"
                  onMouseEnter={() => setHoveredDocumentId(data.id)}
                  onMouseLeave={() => setHoveredDocumentId(null)}
               >
                  <div className="inline-flex items-center relative pr-3">
                     
                     <h1
                        key={cellValue.id}
                        onClick={() => openPdf(cellValue.url)}
                        className="underline text-[#2472db] mr-1"
                        style={{ cursor: 'pointer' }}
                     >
                        {cellValue.fileName?.endsWith('.pdf')
                           ? cellValue.fileName
                           : `${cellValue.fileName}.pdf`}
                     </h1>
                     {hoveredDocumentId === data.id && (
                        <>
                           <IconButton
                              type={"button"}
                              className="cursor-pointer text-[#2472db] absolute right-0 -top-2"
                              icon={<FaTimes />}
                              handleClick={() => handleDeletelink(cellValue.id ?? "")}
                           />
                           <FaCopy
                              className="w-4 h-4 text-gray-500 cursor-pointer"
                              onClick={() => handleCopyClick(cellValue.url)}
                           />
                        </>
                     )}
                  </div>

               </div>
            </>
         );
      },

      tenantOne: () => <HighlightedText text={`${data.tenant1FirstName ?? ''} ${data?.tenant1MiddleName ?? ""} ${data?.tenant1LastName ?? ''}`} query={emailQueues.searchParam ?? ''} />,
      action: () => renderActionCell(data),
      status: () => <div className={getStatusClassName(cellValue)}>{cellValue}</div>,
      taskStatus: () => renderStatusCell(cellValue, data.county),
      expedited: () => <span>{cellValue != "" && cellValue != null ? "Expedited" : ""}</span>,
      propertyName: () => <HighlightedText text={data.propertyName ?? ""} query={emailQueues.searchParam ?? ''} />,
      tenantZip: () => <HighlightedText text={data.tenantZip ?? ""} query={emailQueues.searchParam ?? ''} />,
      caseNo: () => <HighlightedText text={data.caseNo ?? ""} query={emailQueues.searchParam ?? ''} />,
      county: () => <HighlightedText text={data.county ?? ""} query={emailQueues.searchParam ?? ''} />,
      processServerEmail: () => <HighlightedText text={data.processServerEmail ?? ""} query={emailQueues.searchParam ?? ''} />,
      filerEmail: () => <HighlightedText text={data.filerEmail ?? ""} query={emailQueues.searchParam ?? ''} />,
      attorneyName: () => <HighlightedText text={data.attorneyName ?? ""} query={emailQueues.searchParam ?? ''} />,
      attorneyBarNo: () => <HighlightedText text={data.attorneyBarNo ?? ""} query={emailQueues.searchParam ?? ''} />,
      referenceId: () => <HighlightedText text={data.referenceId ?? ""} query={emailQueues.searchParam ?? ''} />,
      evictionEnvelopeID: () => <HighlightedText text={data.evictionEnvelopeID ?? ""} query={emailQueues.searchParam ?? ''} />,
      caseCreatedDate: () => formattedDateCell(cellValue),
      tenantAddressCombined: () => <HighlightedText text={`${data.tenantAddress ?? ''} ${data.tenantUnit ?? ''} ${data.tenantCity ?? ''} ${data.tenantState ?? ''} ${data.tenantZip ?? ''}`} query={emailQueues.searchParam ?? ''} />,
      evictionDateFiled: () => formattedDateCell(cellValue),
      transactionfee: () => renderHighlightedAmount(cellValue, data),
      // transactionfee: () => cellValue == ""? renderHighlightedAmount(null, data):renderHighlightedAmount(cellValue, data),
      eFileFeeClient: () => {
         let formattedValue = cellValue;

         // Try to parse the cellValue as a number
         const numericValue = parseFloat(cellValue);

         // Check if the parsed value is a valid number
         if (!isNaN(numericValue)) {
            // Format as currency if it's a valid number
            formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericValue);
         }

         return <span>{formattedValue}</span>;
      },
      evictionCourtFee: () => {
         let formattedValue = cellValue;

         // Try to parse the cellValue as a number
         const numericValue = parseFloat(cellValue);

         // Check if the parsed value is a valid number
         if (!isNaN(numericValue)) {
            // Format as currency if it's a valid number
            formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericValue);
         }

         return <span>{formattedValue}</span>;
      },
   };
}
