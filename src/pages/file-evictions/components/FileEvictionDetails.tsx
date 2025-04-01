import React, { useEffect, useState, useRef } from 'react';
import { HttpStatusCode } from 'axios';
import FileEvictionService from 'services/file-evictions.service';
import Spinner from 'components/common/spinner/Spinner';
import Drawer from 'components/common/drawer/Drawer';
import TenantInfoCard from 'components/common/generic/TenantInfoCard';
import PropertyInfoCard from 'components/common/generic/PropertyInfoCard';
import FilerInfoCard from 'components/common/generic/FilerInfoCard';
import { IRootCaseInfo } from 'interfaces/common.interface';
import AttachmentsInfoCard from 'components/common/generic/AttachmentsInfoCard';
import { useAuth } from 'context/AuthContext';

type FileEvictionDetailsProps = {
   evictionId: string;
   showViewDetails: boolean;
   setShowViewDetails: (show: boolean) => void;
};

const FileEvictionDetails = (props: FileEvictionDetailsProps) => {
   const isMounted = useRef(true);
   const { evictionId, showViewDetails, setShowViewDetails } = props;
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [caseInfo, setCaseInfo] = useState<IRootCaseInfo | null>(null);
   const {selectedStateValue}=useAuth();

   useEffect(() => {
      const fetchFileEvictionDetails = async () => {
         try {
            setShowSpinner(true);
            const response = await FileEvictionService.getFileEvictionById(evictionId);
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
         fetchFileEvictionDetails();
         isMounted.current = false;
      }

   }, [evictionId]);

   return (
      <Drawer
         openDrawer={showViewDetails}
         onClose={() => setShowViewDetails(false)}
      >
         <div id="fullPageContent">
            <div className="bg-white pb-1.5 pt-4 p-3.5 md:p-5 !pb-1">
               <div className="md:flex md:items-center justify-between text-center md:text-left mb-1.5 -mt-1.5">
                  <h3
                     className="leading-5 text-gray-900 text-[16px] md:text-xl mb-0"
                     id="modal-title"
                  >
                     File Eviction Details
                  </h3>
               </div>
               <div className="relative pt-1.5">
                  {showSpinner ? (
                     <Spinner />
                  ) : caseInfo ? (
                     <div>
                        <div className='mb-3.5'>
                           <div className='p-3.5 bg-white border border-gray-200 rounded shadow relative'>
                              <h2 className='text-sm font-medium absolute bg-white top-[-8px] left-2.5 px-1.5 !leading-4'>Eviction Information</h2>
                              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5'>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>County </strong> {caseInfo?.efile?.county}
                                 </div>
                                 {selectedStateValue.toUpperCase()!=="TX" && (<>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>EvictionReason </strong> {caseInfo?.fields?.filing?.reason}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>EvictionTotalRentDue </strong> {caseInfo?.fields?.eviction?.totalRentDue}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>MonthlyRent </strong> ${caseInfo?.fields?.filing?.monthlyRent}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>AllMonths </strong> {caseInfo?.fields?.filing?.allMonths}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>EvictionOtherFees </strong> {caseInfo?.fields?.filing.otherFee}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>EvictionAffiantIs </strong> {caseInfo?.fields?.signing?.affiantIs}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Expedited </strong> {caseInfo?.fields?.serviceRequest?.expedited}
                                 </div>
                              </>
                                 )
                                 }
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>{selectedStateValue.toUpperCase()=="TX"?"Court":"StateCourt"} </strong> {caseInfo?.efile?.courtName}
                                 </div>
                              </div>
                           </div>
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
                           <AttachmentsInfoCard attachments={caseInfo.attachments} />
                        </div>
                     </div>
                  ) : (
                     <p>No eviction information available.</p>
                  )}
               </div>
            </div>
         </div>
      </Drawer>
   );
};

export default FileEvictionDetails;
