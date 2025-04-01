import React, { ReactNode } from 'react';
import { Tooltip as ReactTooltip } from "react-tooltip";

interface TooltipProps {
   id: string;
   content: string;
   children: ReactNode
};

const Tooltip: React.FC<TooltipProps> = ({ id, content, children }) => {
   return (
      <>
         <a data-tooltip-id={id} data-tooltip-content={content} data-tooltip-place="top">
            {children}
         </a>
         <ReactTooltip
            id={id}
            place="top"
            variant="info"
            content={content}
            className="inline-block !px-2.5 !py-1.5 text-xs font-medium text-white transition-opacity duration-300 bg-gray-900 rounded-lg shadow-sm opacity-0 tooltip max-w-56 whitespace-normal"
         />
      </>
   );
};

export default Tooltip;
