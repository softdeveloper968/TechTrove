import React, { useEffect, useState } from 'react';
import { FaFilePdf } from 'react-icons/fa';
import { IAttachment } from 'interfaces/common.interface';
import HelperViewPdfService from "services/helperViewPdfService";
import { extractFilePrefix, checkDatePart, parseFileName, getEnumFromValue } from 'utils/helper';
import { useAuth } from 'context/AuthContext';
import { AttatchmentTypeEnum, StateTypeEnum } from 'utils/enum';

type AttachmentsInfoCardProps = {
   attachments: IAttachment[] | undefined;
};

const AttachmentsInfoCard: React.FC<AttachmentsInfoCardProps> = ({ attachments }: AttachmentsInfoCardProps) => {
   const [updatedAttachments, setUpdatedAttachments] = useState<IAttachment[]>([]);

   const openPdf = async (url: string) => {
      HelperViewPdfService.GetPdfView(url);
   };

   useEffect(() => {
      if (attachments && attachments.length > 0) {
         const updated = attachments.map((item) => {
            let updatedType = item.type;
            if (item.type === "AOS" || item.type === "EvictionAOS" || item.type === "AmendmentAOS") {
               updatedType = extractFilePrefix(item.url);
            } else if (item.type === "AOSStamped") {
               const name = extractFilePrefix(item.url);

               // Check if the string contains 'Eviction'
               if (name.includes("Eviction")) {
                  updatedType = `Eviction${item.type}`;
               }
               if (name.includes("Amendment")) {
                  updatedType = `Amendment${item.type}`;
               }
            }

            return { ...item, type: updatedType }; // Create a new object with the updated type
         });

         // Update the state with the new array
         setUpdatedAttachments(updated);
      }
   }, [attachments]); // Dependency on attachments
   const { selectedStateValue } = useAuth();

   const getFileName = (item: IAttachment): string => {
      //used switch case as there are multiple types and might used later
      //currently versioning is only implemented for Writs
      switch (selectedStateValue.toUpperCase()) {
         case StateTypeEnum.TX:
            return `${item.filename} ${item.filedDate ?? ""}`

         default:
            var attatchmentType = getEnumFromValue(item.type);
            switch (attatchmentType) {
               case AttatchmentTypeEnum.Amendment:
               case AttatchmentTypeEnum.Writ:
                  if (item.filename && checkDatePart(item.filename))
                     return parseFileName(item.filename, attatchmentType);
                  return `${item.type} ${item.filedDate ?? ""}`;
               default:
                  return (`${item.type} ${item.filedDate ?? ""}`);
            }
      }
   }

   return (
      <div className='p-3.5 bg-white border border-gray-200 rounded shadow relative'>
         <h2 className='text-sm font-medium absolute bg-white top-[-8px] left-2.5 px-1.5 !leading-4'>Attachments</h2>
         <div className='flex gap-1 flex-wrap mt-1'>
            {updatedAttachments && updatedAttachments.map((item) => (
               // eslint-disable-next-line jsx-a11y/anchor-is-valid
               <a
                  target="_blank"
                  rel='noopener noreferrer'
                  onClick={() => openPdf(item.url)}
                  className='whitespace-nowrap rounded h-[21px] bg-[#f2f2f3] py-1 px-2 text-[11px] text-blue-500 hover:underline font-medium flex items-center gap-1 cursor-pointer'
               >
                  <FaFilePdf />
                  {getFileName(item)}
               </a>
            ))}
         </div>
      </div>
   );
};

export default AttachmentsInfoCard;