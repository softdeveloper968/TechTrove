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
import { formattedDate } from 'utils/helper';
import AllCasesService from 'services/all-cases.service';
import { IRootCaseInfo } from 'interfaces/common.interface';

type AllCasesDetailsProps = {
   title: string;
   caseId: string;
   showDetails: boolean;
   setShowDetails: (show: boolean) => void;
};

const AllCasesDetails = (props: AllCasesDetailsProps) => {
   const isMounted = useRef(true);
   const { title, caseId, showDetails, setShowDetails } = props;
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [caseInfo, setCaseInfo] = useState<IRootCaseInfo | null>(null);

   useEffect(() => {
      const fetchAllCasesDetails = async () => {
         try {
            setShowSpinner(true);
            const response = await AllCasesService.getAllCasesById(caseId);
            if (response.status === HttpStatusCode.Ok) {
               // const updatedItem = {
               //    ...response.data,
               //    crmInfo: {
               //      ...response.data.crmInfo,
               //      isCrmRecord: !!response.data.crmInfo.crmName,
               //    },
               //  };
               setCaseInfo(response.data);
            };
         } catch (error) {
            console.error('Failed to fetch item details:', error);
         } finally {
            setShowSpinner(false);
         }
      };

      if (isMounted.current) {
         fetchAllCasesDetails();
         isMounted.current = false;
      }

   }, [caseId]);

   const getAttachments = () => {
      const formattedEvictionDate = caseInfo?.fields?.signing?.affiantSignDate ? formattedDate(caseInfo?.fields?.signing?.affiantSignDate?.toString()) : "";
      const formattedDismissalDate = caseInfo?.unsignedDismissal?.applicantDate ? formattedDate(caseInfo.unsignedDismissal.applicantDate.toString()) : "";
      const formattedWritDate = caseInfo?.unsignedWrit?.applicantDate ? formattedDate(caseInfo.unsignedWrit.applicantDate.toString()) : "";
      const formattedAmendmentDate = caseInfo?.amendment?.applicantDate ? formattedDate(caseInfo.amendment.applicantDate.toString()) : "";
      const formattedAOSDate = caseInfo?.fields?.eviction?.aosApplicantDate ? formattedDate(caseInfo?.fields?.eviction?.aosApplicantDate.toString()) : "";

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
                  // attachment.filedDate = formattedWritDate;
                  // const formattedWritDate = caseInfo?.unsignedWrit?.applicantDate ? formattedDate(caseInfo.unsignedWrit.applicantDate.toString()) : "";
                  attachment.filedDate = attachment.createdDate ? formattedDate(attachment.createdDate.toString()) : formattedWritDate;
                  break;
               case "amendment":
                  // attachment.filedDate = formattedAmendmentDate;
                  attachment.filedDate = attachment.createdDate ? formattedDate(attachment.createdDate.toString()) : formattedAmendmentDate;
                  break;
               case "aos":
                  // attachment.filedDate = formattedAOSDate;
                  attachment.filedDate = attachment.createdDate ? formattedDate(attachment.createdDate.toString()) : formattedAOSDate;

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

      return caseInfo?.attachments;
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
                     {title}
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
                           <TenantInfoCard tenantInfo={caseInfo?.fields?.tenantInfo} />
                        </div>
                        <div className='mb-3.5'>
                           <PropertyInfoCard propertyInfo={caseInfo?.fields?.propertyInfo} />
                        </div>
                        <div className='mb-3.5'>
                           <FilerInfoCard filerInfo={caseInfo?.fields?.filer} />
                        </div>
                        <div className='mb-3.5'>
                           <SigningInfoCard signing={caseInfo?.fields?.signing} />
                        </div>
                        <div className='mb-3.5'>
                           <AttachmentsInfoCard attachments={getAttachments()} />
                        </div>
                     </div>
                  ) : (
                     <p>No case information available.</p>
                  )}
               </div>
            </div>
         </div>
      </Drawer>
   );
};

export default AllCasesDetails;
