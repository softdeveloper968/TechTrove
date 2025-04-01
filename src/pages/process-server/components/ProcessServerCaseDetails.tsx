import React, { useEffect, useState, useRef } from 'react';
import { HttpStatusCode } from 'axios';
import Spinner from 'components/common/spinner/Spinner';
import Drawer from 'components/common/drawer/Drawer';
import AttachmentsInfoCard from 'components/common/generic/AttachmentsInfoCard';
import ProcessServerService from 'services/process-server.service';
import { IProcessServerCaseInfoView } from 'interfaces/process-server.interface';
import { formattedDate } from 'utils/helper';

type ProcessServerCasesDetailsProps = {
   id: string;
   showDetails: boolean;
   setShowDetails: (show: boolean) => void;
};

const ProcessServerCasesDetails = (props: ProcessServerCasesDetailsProps) => {
   const isMounted = useRef(true);
   const { id, showDetails, setShowDetails } = props;
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [data, setData] = useState<IProcessServerCaseInfoView | null>(null);

   useEffect(() => {
      const fetchProcessServerCasesDetails = async () => {
         try {
            setShowSpinner(true);
            const response = await ProcessServerService.getProcessServerCasesById(id);
            if (response.status === HttpStatusCode.Ok) {
               setData(response.data);
            };
         } catch (error) {
            console.error('Failed to fetch item details:', error);
         } finally {
            setShowSpinner(false);
         }
      };

      if (isMounted.current) {
         fetchProcessServerCasesDetails();
         isMounted.current = false;
      }

   }, [id]);

   const getAttachments = () => {
      const formattedEvictionDate = data?.evictionFiledDate ? formattedDate(data?.evictionFiledDate?.toString()) : "";
      const formattedDismissalDate = data?.dismissalFiledDate ? formattedDate(data?.dismissalFiledDate?.toString()) : "";
      const formattedWritDate = data?.writFiledDate ? formattedDate(data?.writFiledDate?.toString()) : "";
      const formattedAmendmentDate = data?.amendmentFiledDate ? formattedDate(data?.amendmentFiledDate?.toString()) : "";
      const formattedAOSDate = data?.serverSignDate ? formattedDate(data?.serverSignDate?.toString()) : "";

      // if (data?.attachments) {
      //    data.attachments.forEach((attachment) => {
      //       switch (attachment.type.toLowerCase()) {
      //          case "eviction":
      //             attachment.filedDate = formattedEvictionDate;
      //             break;
      //          case "dismissal":
      //             attachment.filedDate = formattedDismissalDate;
      //             break;
      //          case "writ":
      //             attachment.filedDate = formattedWritDate;
      //             break;
      //          case "amendment":
      //             attachment.filedDate = formattedAmendmentDate;
      //             break;
      //          case "aos":
      //             attachment.filedDate = formattedAOSDate;
      //             break;
      //          default:
      //             attachment.filedDate = '';
      //       }
      //    });
      // }

      if(data?.attachments) {
         data.attachments.forEach((attachment) => {
            switch (attachment.type.toLowerCase()) {
               case "eviction":
                  attachment.filedDate = formattedEvictionDate;
                  break;
               case "dismissal":
                  attachment.filedDate = formattedDismissalDate;
                  break;
               case "writ":
                     // attachment.filedDate = formattedWritDate;
                     // const formattedWritDate = caseInfo?.unsignedWrit?.applicantDate ? formattedDate(caseInfo.unsignedWrit.applicantDate.toString()) : "";
                     attachment.filedDate = attachment.createdDate? formattedDate(attachment.createdDate.toString()) : formattedWritDate;
                     break;
               case "amendment":
                  // attachment.filedDate = formattedAmendmentDate;
                  attachment.filedDate = attachment.createdDate? formattedDate(attachment.createdDate.toString()) : formattedAmendmentDate;
                  break;
               case "aos":
                  // attachment.filedDate = formattedAOSDate;
                  attachment.filedDate = attachment.createdDate? formattedDate(attachment.createdDate.toString()) : formattedAOSDate;

                  break;
               case "writstamped":
                     if (attachment.filename.includes("Affidavit")) {
                         attachment.type = `${attachment.type}_Affidavit`;
                     }
                     else {
                        attachment.filedDate = attachment.createdDate ? formattedDate(attachment.createdDate.toString()) : formattedWritDate;
                     }
                     break;
               case "evictionstamped":
                  attachment.filedDate = formattedEvictionDate;
                  break;
               case "dismissalstamped":
                  attachment.filedDate = formattedDismissalDate;
                  break;
               case "amendmentstamped":
                  // attachment.filedDate = formattedAmendmentDate;
                  attachment.filedDate = attachment.createdDate ? formattedDate(attachment.createdDate.toString()) : formattedAmendmentDate;
                  break;
               case "aosstamped":
                  // attachment.filedDate = formattedAOSDate;
                  attachment.filedDate = attachment.createdDate ? formattedDate(attachment.createdDate.toString()) : formattedAOSDate;

                  break;
               case "militarystatus":
                  // attachment.type = attachment.filename ?? attachment.type;
                  attachment.filedDate = attachment.createdDate?formattedDate(attachment.createdDate.toString()) : "";
                  break;
               default:
                  attachment.filedDate = '';
            }
         });
      }

      return data?.attachments;
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
                     Process Server Case Info
                  </h3>
               </div>
               <div className="relative pt-1.5">
                  {showSpinner ? (
                     <Spinner />
                  ) : data ? (
                     <>
                        <div className='p-3.5 bg-white border border-gray-200 rounded shadow relative'>
                           <h2 className='text-sm font-medium absolute bg-white top-[-8px] left-2.5 px-1.5 !leading-4'>Case Information</h2>
                           <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5'>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>CaseNumber</strong> {data?.caseNumber}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>ServiceType</strong> {data?.serviceMethod}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Person Served</strong> {data?.personServed}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Height</strong> {data?.height}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Weight</strong> {data?.weight}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Age</strong> {data?.age}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Server Name</strong> {data?.serverName}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Service Notes</strong> {data?.serviceNotes}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Service Date</strong> {formattedDate(data?.serviceDate?.toString())}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Date Scanned</strong> {formattedDate(data?.dateScanned?.toString())}
                              </div>
                              {/* <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Defendant Name</strong> {data?.defendantName}
                              </div> */}
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Service Comments</strong> {data?.comments}
                              </div>
                              {/* <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Latitude</strong> {data?.latitude}
                              </div> */}
                              {/* <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Longitude</strong> {data?.longitude}
                              </div> */}
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Location Coord</strong> {data?.locationCoord}
                              </div>
                           </div>
                        </div>
                        <div className='mt-3.5'>
                           <AttachmentsInfoCard attachments={getAttachments()} />
                        </div>
                     </>

                  ) : (
                     <p>No case information available.</p>
                  )}
               </div>
            </div>
         </div>
      </Drawer>
   );
};

export default ProcessServerCasesDetails;
