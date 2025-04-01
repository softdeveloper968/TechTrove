import React from 'react';
import { IServiceRequest } from 'interfaces/common.interface';

type ServiceRequestInfoCardProps = {
   serviceRequest: IServiceRequest;
};

const ServiceRequestInfoCard: React.FC<ServiceRequestInfoCardProps> = ({ serviceRequest }: ServiceRequestInfoCardProps) => {
   return (
      <div className='p-3.5 bg-white border border-gray-200 rounded shadow relative'>
         <h2 className='text-sm font-medium absolute bg-white top-[-8px] left-2.5 px-1.5 !leading-4'>Service Request Information</h2>
         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5'>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Affiant Is </strong> {serviceRequest?.expedited ? "Expedited" : ""}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Affiant Signature </strong> {serviceRequest?.personalService}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Affiant Sign Date </strong> {serviceRequest?.personalServiceNotes}
            </div>
         </div>
      </div>
   );
};

export default ServiceRequestInfoCard;
