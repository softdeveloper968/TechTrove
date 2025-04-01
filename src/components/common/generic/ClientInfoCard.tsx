import React from 'react';
import { IClient } from 'interfaces/common.interface';

type ClientInfoCardProps = {
   client: IClient;
};

const ClientInfoCard: React.FC<ClientInfoCardProps> = ({ client }: ClientInfoCardProps) => {
   return (
      <div className='p-3.5 bg-white border border-gray-200 rounded shadow relative'>
         <h2 className='text-sm font-medium absolute bg-white top-[-8px] left-2.5 px-1.5 !leading-4'>Client Details</h2>
         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5'>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Company Name </strong> {client?.companyName}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Phone Number </strong> {client?.phone}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Client Type </strong> {client?.clientType}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Address Line1 </strong> {client?.addressLine1}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Address Line2 </strong> {client?.addressLine2}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>City </strong> {client?.city}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>State </strong> {client?.state}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>ZipCode </strong> {client?.postalCode}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Email </strong> {client?.email}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Notes </strong> {client?.notes}
            </div>
         </div>
      </div>
   );
};

export default ClientInfoCard;
