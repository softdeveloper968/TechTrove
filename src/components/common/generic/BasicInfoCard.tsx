import React from 'react';
import { enumToDismissalReasonString, formattedDate, formattedCurrency, convertUtcToEst } from 'utils/helper';
import { IRootCaseInfo } from 'interfaces/common.interface';
import { useAuth } from 'context/AuthContext';

type BasicInfoInfoCardProps = {
   caseInfo: IRootCaseInfo;
};

const BasicInfoInfoCard: React.FC<BasicInfoInfoCardProps> = ({ caseInfo }: BasicInfoInfoCardProps) => {
   // Destructure fields and efile from caseInfo once it's available
   const { fields, efile, unsignedWrit, unsignedDismissal } = caseInfo || {};
   const {selectedStateValue}=useAuth();

   return (
      <div className='p-3.5 bg-white border border-gray-200 rounded shadow relative'>
         <h2 className='text-sm font-medium absolute bg-white top-[-8px] left-2.5 px-1.5 !leading-4'>Case Information</h2>
         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5'>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Case Number </strong> {efile?.caseNumber}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Eviction Envelope Id </strong> {efile?.envelopeId}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Status </strong> {caseInfo?.status}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>County </strong> {efile?.county}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Eviction Date Filed </strong> {formattedDate(fields?.signing?.affiantSignDate)}
            </div>
            {selectedStateValue.toUpperCase()!=="TX" && (<>
               <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               {/* <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Eviction Last Day To Answer </strong> {formattedDate(fields?.eviction?.lastDayToAnswer)} */}
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Eviction Last Day To Answer </strong> {convertUtcToEst(fields?.eviction?.lastDayToAnswer??"").date}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Service Date History </strong> {caseInfo?.serviceDateHistory}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Eviction Service Date </strong> {formattedDate(fields?.eviction?.serviceDate)}
            </div>     
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Eviction Service Method </strong> {fields?.eviction?.serviceMethod}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Eviction Reason </strong> {fields?.filing?.reason}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Dismissal Reason </strong> {enumToDismissalReasonString(unsignedDismissal?.reason)}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Eviction Total Rent Due </strong> {fields?.eviction?.totalRentDue}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Eviction Other Fees </strong> {fields?.filing.otherFee}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Eviction AffiantIs </strong> {fields?.signing?.affiantIs}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Answer Date </strong> N/A
            </div>
            </>
            )}

            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Court Date </strong> {formattedDate(fields?.eviction?.courtDate)}
            </div>
            {selectedStateValue.toUpperCase()!=="TX" && (<>
               <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Writ Filed Date </strong> {formattedDate(unsignedWrit?.dateFiled)}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Dismissal Filed Date </strong> {formattedDate(unsignedDismissal?.dateFiled)}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Eviction Affiant Signature </strong> {fields?.signing?.affiantSignature}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Eviction Count </strong> 0
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Writ Applicant Date </strong> {formattedDate(unsignedWrit?.dateFiled)}
            </div>
            </>
            )}
            
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Case Created Date </strong> {formattedDate(fields?.timeStamp)}
            </div>
            {selectedStateValue.toUpperCase()!=="TX" && (<>
               <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Notice Count </strong> 0
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Monthly Rent </strong> ${formattedCurrency(fields?.filing?.monthlyRent)}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>All Months </strong> {fields?.filing?.allMonths}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Expedited </strong> {fields?.serviceRequest?.expedited?.length ? "Expedited" : ""}
            </div>            
            </>
            )}
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>{selectedStateValue.toUpperCase()=="TX"?"Court":"State Court"} </strong> {efile?.courtName}
            </div>
            {selectedStateValue.toUpperCase()!=="TX" && (<>
               <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Eviction Automation </strong> {caseInfo?.crmInfo?.crmName?.length ? "Yes" : "No"}
            </div>    
            </>)}
                 
         </div>
      </div>
   );
};

export default BasicInfoInfoCard;
