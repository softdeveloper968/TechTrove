import React from 'react';
import { IPropertyInfo } from 'interfaces/common.interface';
import { useAuth } from 'context/AuthContext';

type PropertyInfoCardProps = {
   propertyInfo: IPropertyInfo;
};

const PropertyInfoCard: React.FC<PropertyInfoCardProps> = ({ propertyInfo }: PropertyInfoCardProps) => {
   const {selectedStateValue}=useAuth();
   return (
      <div className='p-3.5 bg-white border border-gray-200 rounded shadow relative'>
         <h2 className='text-sm font-medium absolute bg-white top-[-8px] left-2.5 px-1.5 !leading-4'>Property Information</h2>
         <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1.5'>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Property Name </strong> {propertyInfo?.propertyName}
            </div>
            {selectedStateValue.toUpperCase()!=="TX" && ( <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Owner Name </strong> {propertyInfo?.ownerName}
            </div>)}
           
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Property Phone </strong> {propertyInfo?.propertyPhone}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Property Email </strong> {propertyInfo?.propertyEmail}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Property Address </strong> {propertyInfo?.address?.street1}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Property City </strong> {propertyInfo?.address?.city}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Property State </strong> {propertyInfo?.address?.state}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Property Zip </strong> {propertyInfo?.address?.propertyZipCode}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Attorney Name </strong> {propertyInfo?.attorney?.attorneyName}
            </div>
            <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Attorney BarNo </strong> {propertyInfo?.attorney.attorneyBarNo}
            </div>
            {selectedStateValue.toUpperCase()!=="TX" && ( <div className='flex flex-col text-xs leading-[13px] gap-1 text-[#212529]'>
               <strong className='text-[#7a7a7a] capitalize font-normal text-[10px]'>Attorney Email </strong> {propertyInfo?.attorney?.attorneyEmail}
            </div>)}           
         </div>
      </div>
   );
};

export default PropertyInfoCard;
