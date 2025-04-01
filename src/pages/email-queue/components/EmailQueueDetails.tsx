import React, { useEffect, useState, useRef } from 'react';
import { HttpStatusCode } from 'axios';
import Spinner from 'components/common/spinner/Spinner';
import Drawer from 'components/common/drawer/Drawer';
import TenantInfoCard from 'components/common/generic/TenantInfoCard';
import PropertyInfoCard from 'components/common/generic/PropertyInfoCard';
import FilerInfoCard from 'components/common/generic/FilerInfoCard';
import SigningInfoCard from 'components/common/generic/SigningInfoCard';
import BasicInfoInfoCard from 'components/common/generic/BasicInfoCard';
import AttachmentsInfoCard from 'components/common/generic/AttachmentsInfoCard';
import { IAttachment, IRootCaseInfo } from 'interfaces/common.interface';
import AllCasesService from 'services/all-cases.service';
import HelperViewPdfService from "services/helperViewPdfService";
import { formattedDate } from 'utils/helper';
import { FaFilePdf, FaTimes } from 'react-icons/fa';
import IconButton from 'components/common/button/IconButton';
import Modal from 'components/common/popup/PopUp';
import Button from 'components/common/button/Button';
import EmailQueueService from 'services/email-queue.service';
import { toast } from "react-toastify";
import { useEmailQueueContext } from '../EmailQueueContext';

type EmailQueueDetailsProps = {
   caseId: string;
   showDetails: boolean;
   setShowDetails: (show: boolean) => void;
};

const EmailQueueDetails = (props: EmailQueueDetailsProps) => {
   const {
      getEmailQueues,
      emailQueues,
   } = useEmailQueueContext();
   const isMounted = useRef(true);
   const { caseId, showDetails, setShowDetails } = props;
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [caseInfo, setCaseInfo] = useState<IRootCaseInfo | null>(null);
   const [attachments, setAttachments] = useState<IAttachment[] | undefined>();
   const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
   const [selectedLinkId, setSelectedLinkId] = useState<string>("");
   const [hoveredDocumentId, setHoveredDocumentId] = useState<string | null>(null);
   useEffect(() => {
      const fetchEmailQueueDetails = async () => {
         try {
            setShowSpinner(true);
            const response = await AllCasesService.getAllCasesById(caseId);
            if (response.status === HttpStatusCode.Ok) {
               setCaseInfo(response.data);
            };
         } catch (error) {
            console.error('Failed to fetch item details:', error);
         } finally {
            setShowSpinner(false);
         }
      };

      if (isMounted.current) {
         fetchEmailQueueDetails();
         isMounted.current = false;
      }

   }, [caseId]);

   useEffect(() => {
      getAttachments();

   }, [caseInfo]);
   const handleDeletelink = (id: string) => {
      setDeleteConfirmation(true);
      setSelectedLinkId(id);
   };

   const handleDeleted = async () => {
      setDeleteConfirmation(false);
      setShowSpinner(true);
      const response = await EmailQueueService.deletePdfLink(selectedLinkId);
      if (response.status === HttpStatusCode.Ok) {
         if (response.data.isSuccess)
            toast.success(response.data.message);
         else {
            // setErrorMsg(response.data.message);
         }
         setShowSpinner(false);
         getEmailQueues(emailQueues.currentPage, emailQueues.pageSize, emailQueues.searchParam, emailQueues.companyId, emailQueues.county, emailQueues.serverId, emailQueues.isExpedited, emailQueues.isStateCourt, emailQueues.status, emailQueues.taskStatus,emailQueues.court??"");
      }
      else {
         setShowSpinner(false);
      }
      setShowDetails(false)
      setSelectedLinkId("");
   };

   const getAttachments = () => {
      const formattedEvictionDate = caseInfo?.fields?.signing?.affiantSignDate ? formattedDate(caseInfo?.fields?.signing?.affiantSignDate?.toString()) : "";
      const formattedDismissalDate = caseInfo?.unsignedDismissal?.dateFiled ? formattedDate(caseInfo.unsignedDismissal.dateFiled.toString()) : "";
      const formattedWritDate = caseInfo?.unsignedWrit?.dateFiled ? formattedDate(caseInfo.unsignedWrit.dateFiled.toString()) : "";
      const formattedAmendmentDate = caseInfo?.amendment?.dateFiled ? formattedDate(caseInfo.amendment.dateFiled.toString()) : "";
      const formattedAOSDate = caseInfo?.fields?.eviction?.serverSignDate ? formattedDate(caseInfo?.fields?.eviction?.serverSignDate.toString()) : "";

      if (caseInfo?.attachments) {
         caseInfo.attachments.forEach((attachment) => {
            switch (attachment.type.toLowerCase()) {
               case "eviction":
                  attachment.filedDate = formattedEvictionDate;
                  break;
               case "dismissal":
                  attachment.filedDate = formattedDismissalDate;
                  break;
               case "writ":
                  attachment.filedDate = formattedWritDate;
                  break;
               case "amendment":
                  attachment.filedDate = formattedAmendmentDate;
                  break;
               case "aos":
                  attachment.filedDate = formattedAOSDate;
                  break;
               default:
                  attachment.filedDate = '';
            }
         });
      }
      setAttachments(caseInfo?.attachments);
      return caseInfo?.attachments;
   };

   const openPdf = async (url: string) => {
      HelperViewPdfService.GetPdfView(url);
   };

   return (
      <Drawer
         openDrawer={showDetails}
         onClose={() => setShowDetails(false)}
      >
         <div id="fullPageContent">
            <div className="bg-white pb-1.5 pt-4 p-3.5 md:p-5 !pb-1">
               <div className="md:flex md:items-center justify-between text-center md:text-left mb-1.5 -mt-1.5">
                  <h3
                     className="leading-5 text-gray-900 text-[16px] md:text-xl mb-0"
                     id="modal-title"
                  >
                     Case Details
                  </h3>
               </div>
               <div className="relative pt-1.5">
                  {showSpinner ? (
                     <Spinner />
                  ) : caseInfo ? (
                     <div>
                        <div className='mb-3.5'>
                           <BasicInfoInfoCard caseInfo={caseInfo} />
                        </div>
                        <div className='mb-3.5'>
                           <TenantInfoCard tenantInfo={caseInfo?.fields.tenantInfo} />
                        </div>
                        <div className='mb-3.5'>
                           <PropertyInfoCard propertyInfo={caseInfo?.fields.propertyInfo} />
                        </div>
                        <div className='mb-3.5'>
                           <FilerInfoCard filerInfo={caseInfo?.fields.filer} />
                        </div>
                        <div className='mb-3.5'>
                           <SigningInfoCard signing={caseInfo?.fields?.signing} />
                        </div>
                        <div className='mb-3.5'>
                           {/* <AttachmentsInfoCard attachments={getAttachments()} /> */}
                           <div className='p-3.5 bg-white border border-gray-200 rounded shadow relative'>
                              <h2 className='text-sm font-medium absolute bg-white top-[-8px] left-2.5 px-1.5 !leading-4'>Attachments</h2>
                              <div className='flex gap-1 flex-wrap mt-1'>
                                 {attachments && attachments.map((item) => (
                                    <>
                                       <div
                                          className="relative"
                                          onMouseEnter={() => setHoveredDocumentId(item.id)}
                                          onMouseLeave={() => setHoveredDocumentId(null)}
                                       >
                                          <div className='relative pr-1'>
                                             {/* <IconButton
            type={"button"}
            className="cursor-pointer text-[#2472db] absolute right-[-2px] top-[-8px]"
            icon={<FaTimes className='h-3 w-3' />}
            handleClick={() => handleDeletelink(item.id ?? "")}
         /> */}
                                             <a
                                                target="_blank"
                                                rel='noopener noreferrer'
                                                onClick={() => openPdf(item.url)}
                                                className='whitespace-nowrap rounded h-[21px] bg-[#f2f2f3] py-1 px-2 text-[11px] text-blue-500 hover:underline font-medium flex items-center gap-1 cursor-pointer'
                                             >
                                                <FaFilePdf />
                                                {/* {item.type} */}
                                                {/* Handle file name processing */}
                                                {(() => {
                                                   // Ensure filename is a string and not undefined
                                                   let filename = item.filename ?? ""; // Default to an empty string if undefined

                                                   // If filename is still empty (undefined was the original value), return early
                                                   if (!filename) return ""; // Optionally handle this case

                                                   // If the filename contains a '/', show the part after the last '/'
                                                   if (filename.includes('/')) {
                                                      filename = filename.split('/').pop() ?? ""; // Use fallback to empty string if needed
                                                   }

                                                   // If filename doesn't end with '.pdf', append it
                                                   if (!filename.endsWith('.pdf')) {
                                                      filename += '.pdf';
                                                   }

                                                   return filename;
                                                })()}
                                                {/* <span>{item.filedDate ?? ""}</span> */}
                                             </a>
                                             {hoveredDocumentId === item.id && (
                                                <>
                                                   <IconButton
                                                      type={"button"}
                                                      className="cursor-pointer text-[#2472db] absolute right-[-2px] top-[-8px]"
                                                      icon={<FaTimes className='h-3 w-3' />}
                                                      handleClick={() => handleDeletelink(item.id ?? "")}
                                                   />
                                                </>
                                             )}
                                          </div>
                                       </div>
                                    </>
                                 ))}
                              </div>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <p>No case information available.</p>
                  )}
               </div>
            </div>
         </div>
         {deleteConfirmation && (
            <div>
               <Modal
                  showModal={deleteConfirmation}
                  onClose={() => setDeleteConfirmation(false)}
                  width="max-w-md"
               >
                  <div id="fullPageContent">
                     <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                        <div className="text-center pr-4 sm:text-left">
                           <h3
                              className="text-sm font-semibold leading-5 text-gray-900"
                              id="modal-title"
                           >
                              Are you sure you want to delete pdf link?
                           </h3>
                        </div>
                     </div>
                     <div className="flex justify-end m-2">
                        <Button
                           type="button"
                           isRounded={false}
                           title="No"
                           handleClick={() => setDeleteConfirmation(false)}
                           classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg "
                        ></Button>
                        <Button
                           handleClick={handleDeleted}
                           title="Delete"
                           isRounded={false}
                           type={"button"}
                           classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                        ></Button>
                     </div>
                  </div>
               </Modal>
            </div>
         )}
      </Drawer>
   );
};

export default EmailQueueDetails;
