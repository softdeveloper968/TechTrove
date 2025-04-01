import React from 'react';
import { IFiler } from 'interfaces/common.interface';
import { useAuth } from 'context/AuthContext';

type FilerInfoCardProps = {
   filerInfo: IFiler;
};

const FilerInfoCard: React.FC<FilerInfoCardProps> = ({ filerInfo }: FilerInfoCardProps) => {
   const {selectedStateValue}=useAuth();
   return (
      <div className='p-3.5 bg-white border border-gray-200 rounded shadow relative'>
         <h2 className='text-sm font-medium absolute bg-white top-[-8px] left-2.5 px-1.5 !leading-4'>Filer Information</h2>
         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5'>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Filer Business Name </strong> {filerInfo?.filerBusinessName}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Eviction Filer Email </strong> {filerInfo?.filerEmail}
            </div>
            {selectedStateValue.toUpperCase()!=="TX" && (<div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Eviction Filer Phone </strong> {filerInfo?.filerPhone}
            </div>)}            
         </div>
      </div>
   );
};

export default FilerInfoCard;
