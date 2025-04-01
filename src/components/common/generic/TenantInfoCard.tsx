import React from 'react';
import { ITenantInfo } from 'interfaces/common.interface';
import TenantNames from './TenantNames';

type TenantInfoCardProps = {
   tenantInfo: ITenantInfo | null | undefined;
};

const TenantInfoCard: React.FC<TenantInfoCardProps> = ({ tenantInfo }: TenantInfoCardProps) => {
   return (
      <div className='p-3.5 bg-white border border-gray-200 rounded shadow relative'>
         <h2 className='text-sm font-medium absolute bg-white top-[-8px] left-2.5 px-1.5 !leading-4'>Tenant Information</h2>
         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5'>
            {tenantInfo?.unsignedDisposTenantnames &&
               <TenantNames
                  tenantNames={tenantInfo?.unsignedDisposTenantnames}
               />}
            {tenantInfo?.unsignedDisposTenantNames &&
               <TenantNames
                  tenantNames={tenantInfo?.unsignedDisposTenantNames}
               />}
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>And All Other Occupants </strong> {tenantInfo?.andAllOthersText}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Tenant Address </strong> {tenantInfo?.address.tenantStreet}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Tenant Unit </strong> {tenantInfo?.address.tenantUnit}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Tenant City </strong> {tenantInfo?.address.tenantCity}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Tenant State </strong> {tenantInfo?.address.tenantState}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Tenant Zip </strong> {tenantInfo?.address.tenantZipCode}
            </div>
         </div>
      </div>
   );
};

export default TenantInfoCard;
