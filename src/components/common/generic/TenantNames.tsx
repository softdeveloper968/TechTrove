import React from 'react';
import { ITenantName } from 'interfaces/common.interface';

type TenantNamesProps = {
   tenantNames: ITenantName[];
};

const TenantNames: React.FC<TenantNamesProps> = ({ tenantNames }: TenantNamesProps) => {
   return (
      <>
         {tenantNames && tenantNames.map((tenant, index) => (
            <>
               <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                  <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Tenant{index + 1} First </strong> {tenant.firstName}
               </div>
               <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                  <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Tenant{index + 1} MI </strong> {tenant.middleName}
               </div>
               <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
                  <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Tenant{index + 1} Last </strong> {tenant.lastName}
               </div>
            </>
         ))}
      </>
   );
};

export default TenantNames;
