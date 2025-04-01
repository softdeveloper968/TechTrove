import React, { useState, useRef } from 'react';
import { HttpStatusCode } from 'axios';
import { toast } from 'react-toastify';
import { pdfjs } from 'react-pdf';
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { TextItem } from 'pdfjs-dist/types/src/display/api';
import { FaCheck, FaTimes } from 'react-icons/fa';
import AllCasesService from 'services/all-cases.service';
import { useAllCasesContext } from 'pages/all-cases/AllCasesContext';
import { ISelectedWrit, ITenantDocument, ITenant } from 'interfaces/all-cases.interface';
import Modal from 'components/common/popup/PopUp';
import Spinner from 'components/common/spinner/Spinner';

// Set worker URL for pdfjs
try {
   pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
} catch (error) {
   console.error("Error setting PDF.js worker source:", error);
}

interface ResultMap {
   [key: string]: string;
};

type WritsDocumentUploader = {
   open: boolean;
   setOpen: React.Dispatch<React.SetStateAction<boolean>>;
   selectedCaseForWrits: ISelectedWrit | null;
   setSelectedCaseForWrits: (data: ISelectedWrit) => void;
};

const AllCases_WritsDocumentUploader = (props: WritsDocumentUploader) => {
   const MAX_FILE_SIZE_MB = 2;
   const VALID_FILE_TYPES = ['application/pdf'];
   const { selectedCaseForWrits } = props;
   const { setAllCases, setFilteredRecords, setBulkRecords } = useAllCasesContext();
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [showSpinner, setShowSpinner] = useState<boolean>(false);

   const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files || [];
      handleFileChange(Array.from(files));
   };

   const handleFileChange = async (files: File[]) => {
      if (!files || files.length === 0) {
         return;
      }

      setShowSpinner(true);

      try {
         const isValidSize = Array.from(files).every(validateFile);

         if (!isValidSize) {
            toast.error(`Please upload PDF files with a size of up to ${MAX_FILE_SIZE_MB} MB.`);
            return;
         }

         for (const file of files) {
            const base64String = await readFile(file) || "";
            const tenantPdfDataArray = await parsePdfData(file);

            await handleMatchingTenants(base64String, tenantPdfDataArray);
         }

         // const uploadPromises = Array.from(files).map(async (file) => {
         //    // const base64String = await readFile(file) || "";
         //    // const tenantPdfDataArray = await parsePdfData(file);

         //    await handleMatchingTenants(base64String, tenantPdfDataArray);
         // });

         // await Promise.all(uploadPromises);
      } catch (error) {
         console.error("Error handling files:", error);
         // toast.error('Error handling files. Please try again.');
      } finally {
         setShowSpinner(false);
      }
   };

   const validateFile = (file: File): boolean => {
      const isValidType = VALID_FILE_TYPES.includes(file.type);
      const isValidSize = file.size / (1024 * 1024) <= MAX_FILE_SIZE_MB;

      return isValidType && isValidSize;
   };

   const readFile = (file: File): Promise<string | null> => {
      return new Promise((resolve) => {
         const reader = new FileReader();
         reader.onload = (e) => {
            if (e.target?.result) {
               const result = e.target.result as string;
               const base64Data = result.split(',')[1]; // Extracting base64 data after the comma
               resolve(base64Data || null);
            } else {
               resolve(null);
            }
         };
         reader.readAsDataURL(file);
      });
   };

   const parsePdfData = async (file: File): Promise<ResultMap[]> => {
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
         reader.onloadend = async () => {
            const arrayBuffer = reader.result as ArrayBuffer;
            const uint8Array = new Uint8Array(arrayBuffer);
            const loadingTask = pdfjs.getDocument({ data: uint8Array });
            try {
               const pdf = await loadingTask.promise;
               const numPages = pdf.numPages;
               let tenantPdfDataArray: ResultMap[] = [];

               for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
                  const page = await pdf.getPage(pageNumber);
                  const textContent = await page.getTextContent();

                  if (Array.isArray(textContent.items) && textContent.items.every((item) => 'str' in item)) {
                     const pdfDataObject = mapAndTransformTextItems(textContent.items as TextItem[]);
                     if (pdfDataObject !== null)
                        tenantPdfDataArray.push(pdfDataObject);
                  }
               }
               if (!tenantPdfDataArray.length) {
                  toast.error(`Please upload a valid document: ${file.name}`);
                  reject(new Error(`Invalid document: ${file.name}`));
                  return;
               }

               resolve(tenantPdfDataArray);
            } catch (error) {
               console.error("Error loading PDF:", error);
               reject(new Error(`Error loading PDF: ${file.name}`));
            }
         };

         reader.readAsArrayBuffer(file);
      });
   };

   const mapAndTransformTextItems = (data: TextItem[]) => {
      let result: ResultMap = {};

      data.forEach((entry) => {
         const lastTransformElement = entry.transform[entry.transform.length - 1];
         const matchingEntry = data.find((innerEntry) => innerEntry.str !== entry.str && innerEntry.transform[innerEntry.transform.length - 1] === lastTransformElement);

         if (matchingEntry) {
            result[entry.str] = matchingEntry.str;
         }
      });

      const filteredObject = filterPdfDataProperties(result);

      // Check if filteredObject has data, and return it or null
      return Object.keys(filteredObject).length > 0 ? filteredObject : null;
   };

   const filterPdfDataProperties = (originalObject: { [key: string]: string }): ResultMap => {
      const desiredProperties = [
         "SSN:",
         "Birth Date:",
         "Last Name:",
         "First Name:",
         "Middle Name:",
         "Status As Of:",
         "Certificate ID:"
      ];

      return Object.keys(originalObject).reduce((filteredObject, key) => {
         if (desiredProperties.includes(key)) {
            filteredObject[key] = originalObject[key];
         }
         return filteredObject;
      }, {} as ResultMap);
   };

   const handleMatchingTenants = async (base64String: string, tenantPdfDataArray: ResultMap[]) => {
      const { selectedCaseForWrits, setSelectedCaseForWrits } = props;

      if (!selectedCaseForWrits || !selectedCaseForWrits.id || !selectedCaseForWrits.tenantNames) {
         return;
      }

      const matchingTenants: ITenant[] = [];

      for (const pdfDataObject of tenantPdfDataArray) {
         const matchingTenant = selectedCaseForWrits.tenantNames.find((tenant) => {
            return (
               pdfDataObject["First Name:"]?.toUpperCase() === tenant.firstName?.toUpperCase() &&
               //pdfDataObject["Middle Name:"]?.toUpperCase() === tenant.middleName?.toUpperCase() &&
               pdfDataObject["Last Name:"]?.toUpperCase() === tenant.lastName?.toUpperCase()
            );
         });

         if (matchingTenant) {
            matchingTenants.push(matchingTenant);
         }
      }

      if (!matchingTenants.length) {
         toast.error('Tenant name does not match');
         return;
      }

      const matchingTenantIds: string[] = matchingTenants.map(tenant => tenant.id);
      const matchingTenantNames: string[] = matchingTenants.map(tenant => tenant.firstName);

      const uploadDocumentRequest: ITenantDocument = {
         caseId: selectedCaseForWrits.id,
         tenantNameId: matchingTenantIds,
         militaryReportDocument: base64String // Assuming base64String is available in the scope
      };

      try {
         const response = await AllCasesService.uploadMilitaryStatusReport(uploadDocumentRequest);
         if (response.status === HttpStatusCode.Ok && response.data) {
            const uploadedTenantIds = response.data.map(item => item.tenantNameId);
            // Update only tenants included in matchingTenantIds
            const updatedTenants = selectedCaseForWrits.tenantNames.map((tenant) => {
               const matchingResponseItem = response.data.find((item) => item.tenantNameId === tenant.id);
               return {
                  ...tenant,
                  isMilitaryStatusUploaded: uploadedTenantIds.includes(tenant.id),
                  militaryStatusDocURL: matchingResponseItem ? matchingResponseItem.militaryReportURL : "",
                  attachmentId: matchingResponseItem?.attachmentId
               };
            });
            setFilteredRecords((prev) =>
               prev.map((item) =>
                  item.id === selectedCaseForWrits.id ? { ...item, tenantNames: updatedTenants } : item
               )
            );
            setBulkRecords((prev) =>
               prev.map((item) =>
                  item.id === selectedCaseForWrits.id ? { ...item, tenantNames: updatedTenants } : item
               )
            );
            setAllCases((prev) => ({
               ...prev,
               items: prev.items.map((item) => ({
                  ...item,
                  tenantNames: item.id === selectedCaseForWrits.id ? updatedTenants : item.tenantNames,
               })),
            }));

            setSelectedCaseForWrits({
               ...selectedCaseForWrits,
               tenantNames: updatedTenants,
            });

            if (response.data.every((item) => item.isUploaded)) {
               setFilteredRecords((prev) =>
                  prev.map((item) =>
                     item.id === selectedCaseForWrits.id ? { ...item, militaryStatusReport: "UPLOADED" } : item
                  )
               );
               setBulkRecords((prev) =>
                  prev.map((item) =>
                     item.id === selectedCaseForWrits.id ? { ...item, militaryStatusReport: "UPLOADED" } : item
                  )
               );
               setSelectedCaseForWrits({
                  ...selectedCaseForWrits,
                  tenantNames: updatedTenants,
               });
            }

            if(uploadedTenantIds?.length === selectedCaseForWrits?.tenantNames?.length) {
               setTimeout(() => {
                  props.setOpen(false);
               }, 2500);
            }

            let toastMessage = "";

            if (matchingTenantNames.length === 1) {
               toastMessage = matchingTenantNames[0];
            } else {
               for (let i = 0; i < matchingTenantNames.length; i++) {
                  if (i === matchingTenantNames.length - 1) {
                     // Last name
                     toastMessage += `and ${matchingTenantNames[i]}`;
                  } else {
                     toastMessage += `${matchingTenantNames[i]}, `;
                  }
               }
            }

            toast.success(`Military Status Report uploaded for ${toastMessage}`);

         } else {
            console.error("Error uploading military status reports");
         }
      } catch (error) {
         console.error("Error uploading military status reports:", error);
         // toast.error('Error uploading military status reports. Please try again.');
      }
   };

   const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const dataTransfer = event.dataTransfer;

      if (dataTransfer && dataTransfer.files) {
         const files = Array.from(dataTransfer.files);
         handleFileChange(files);
      }
   };

   const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
   };

   return (
      <Modal
         showModal={props.open}
         onClose={() => { props.setOpen(false); }}
         width="max-w-3xl uploadDocsPopUp"
      >
         {showSpinner && <Spinner />}
         <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
            <div className="text-center sm:text-left ">
               <h3
                  className="text-sm font-semibold leading-5 text-gray-900"
                  id="modal-title"
               >
                  Upload Military Status Report
               </h3>
               <div className="mt-3">
                  <div
                     onDrop={handleDrop}
                     onDragOver={handleDragOver}
                     className="flex items-center justify-center w-full">
                     <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center px-2.5 py-4">
                           <svg className="w-7 h-7 mb-3.5 text-gray-500  " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                           </svg>
                           <p className="mb-1.5 text-xs text-gray-500 "><span className="font-semibold">Click to upload Military Status Report</span> or drag and drop</p>
                           <p className="text-xs text-gray-500 ">PDF (MAX. 2MB)</p>
                        </div>
                        <input
                           id="dropzone-file"
                           type="file"
                           accept=".pdf"
                           className="hidden"
                           ref={fileInputRef}
                           onChange={handleInputChange}
                           multiple
                        />
                     </label>
                  </div>
               </div>
               <div>
                  <div className="mt-3.5 flex gap-1 sm:gap-1.5 justify-center flex-wrap">
                     {selectedCaseForWrits && selectedCaseForWrits.tenantNames && (
                        selectedCaseForWrits.tenantNames.map((item: ITenant) => (
                           <>
                              {item.isMilitaryStatusUploaded ? (
                                 <div
                                    key={item.id}
                                    className="relative grid items-center py-1.5 px-3 font-sans text-xs font-bold text-green-900 uppercase rounded-md select-none whitespace-nowrap bg-green-500/20">
                                    <div className="absolute left-3">
                                       <FaCheck />
                                    </div>
                                    <span className="ml-[18px]">{item.firstName}</span>
                                 </div>
                              ) : (
                                 <div
                                    key={item.id}
                                    className="relative grid select-none items-center whitespace-nowrap rounded-lg bg-gray-900/10 py-1 px-2.5 font-sans text-[10px] font-bold uppercase text-gray-900"
                                 >
                                    <div className="absolute left-3">
                                       <FaTimes />
                                    </div>
                                    <span className="ml-[18px]">{item.firstName}</span>
                                 </div>
                              )}
                           </>
                        ))
                     )}
                  </div>
               </div>
            </div>
            <div className="py-2.5 flex justify-between mt-1.5 items-center">
               <div className="text-start">
                  <a
                     className="text-xs italic font-medium text-blue-600 underline inline-block"
                     href="https://scra.dmdc.osd.mil/scra/#/single-record" target="_blank" rel="noreferrer"
                  >
                     Click here to obtain Military Status Report
                  </a>
               </div>
               <div>
                  <button
                     type="button"
                     onClick={() => props.setOpen(false)}
                     className="text-xs bg-[#2472db] hover:bg-[#0d5ecb] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-5 text-white"
                  >
                     Close
                  </button>
               </div>
            </div>
         </div>
      </Modal>
   )
}

export default AllCases_WritsDocumentUploader;
