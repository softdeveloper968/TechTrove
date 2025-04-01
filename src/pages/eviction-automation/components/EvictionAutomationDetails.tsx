import React, { useState } from 'react';
import Spinner from 'components/common/spinner/Spinner';
import Drawer from 'components/common/drawer/Drawer';
import { IEvictionAutomationQueueItem } from 'interfaces/eviction-automation.interface';

type EvictionAutomationDetailsProps = {
   data: IEvictionAutomationQueueItem | null;
   showDetails: boolean;
   setShowDetails: (show: boolean) => void;
};

const EvictionAutomationDetails = (props: EvictionAutomationDetailsProps) => {
   const { data, showDetails, setShowDetails } = props;
   const [showSpinner, setShowSpinner] = useState<boolean>(false);

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
                     Eviction Automation Details
                  </h3>
               </div>
               <div className="relative pt-1.5">
                  {showSpinner ? (
                     <Spinner />
                  ) : data ? (
                     <>
                        <div className='p-3.5 bg-white border border-gray-200 rounded shadow relative'>
                           <h2 className='text-sm font-medium absolute bg-white top-[-8px] left-2.5 px-1.5 !leading-4'>Eviction Management Information</h2>
                           <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5'>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Notes</strong> {data.notes}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Company</strong> {data.company}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Disabled</strong> {data.disabled ? "Yes" : "No"}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>ConfirmationPin</strong> {data.confirmationPin}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>County</strong> {data.county}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>FilerBusinessName</strong> {data.filerBusinessName}
                              </div>
                              {/* <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>EvictionFilingDay</strong> {data.evictionFilingDay??}
                              </div> */}
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>DismissalNotificationDay</strong> {data.dismissalNotificationDay}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Expedited</strong> {data.expedited ? "Expedited" : ""}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>StateCourt</strong> {data.stateCourt ? "State Court" : ""}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>ConfirmReportEmail</strong> {data.confirmReportEmail}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>SignerEmail</strong> {data.signerEmail}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>CcEmails</strong> {data.ccEmails}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>EvictionFilerEmail</strong> {data.evictionFilerEmail}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>EvictionAffiantIs</strong> {data.evictionAffiantIs}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>ProcessServer</strong> {data.processServer}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>AndAllOtherOccupants</strong> {data.andAllOtherOccupants}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>TenantAddressConfig</strong> {JSON.parse(data.tenantAddressConfig).street}, {JSON.parse(data.tenantAddressConfig).city}, {JSON.parse(data.tenantAddressConfig).state}, {JSON.parse(data.tenantAddressConfig).zip}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>UnitsUsePropertyAddress</strong> {data.unitsUsePropertyAddress ? "Yes" : "No"}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>NoticesRequired</strong> {data.noticesRequired ? "Yes" : "No"}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>DaysToFileAfterNoticeDelivery</strong> {data.daysToFileAfterNoticeDelivery}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>AllowMultipleImports</strong> {data.allowMultipleImports ? "Yes" : "No"}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>FilingThresholdAdjustment</strong> {data.filingThresholdAdjustment}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>MinimumFilingAmount</strong> {data.minimumFilingAmount}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>PrescreenSignEmail</strong> {data.prescreenSignEmail ? "Yes" : "No"}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>PrescreenConfirmEmail</strong> {data.prescreenConfirmEmail}
                              </div>
                              <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                 <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>BccEmails</strong> {data.bccEmails}
                              </div>
                           </div>
                        </div>
                        <div className='mt-4'>
                           <div className='p-3.5 bg-white border border-gray-200 rounded shadow relative'>
                              <h2 className='text-sm font-medium absolute bg-white top-[-8px] left-2.5 px-1.5 !leading-4'>Property Information</h2>
                              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5'>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>PropertyName</strong> {data.propertyName}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>PropertyId</strong> {data.propertyId}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>PropertyAddress</strong> {data.propertyAddress}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>PropertyCity</strong> {data.propertyCity}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>PropertyState</strong> {data.propertyState}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>PropertyZip</strong> {data.propertyZip}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>PropertyPhone</strong> {data.propertyPhone}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>PropertyEmail</strong> {data.propertyEmail}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>OwnerName</strong> {data.ownerName}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>OwnerId</strong> {data.ownerId}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>OwnerAddress</strong> {data.ownerAddress}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>OwnerCity</strong> {data.ownerCity}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>OwnerState</strong> {data.ownerState}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>OwnerZip</strong> {data.ownerZip}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>OwnerEmail</strong> {data.ownerEmail}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>OwnerPhone</strong> {data.ownerPhone}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>AttorneyEmail</strong> {data.attorneyEmail}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>AttorneyName</strong> {data.attorneyName}
                                 </div>
                                 <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                                    <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>AttorneyBarNo</strong> {data.attorneyBarNo}
                                 </div>
                              </div>
                           </div>
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

export default EvictionAutomationDetails;
