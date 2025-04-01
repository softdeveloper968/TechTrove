import React from "react";

type Props = {
   showLabel?: Boolean;
   labelText?: string;
}; // The Spinner component does not require any props

// Spinner component: A simple loading spinner animation
const Spinner2 = (props: Props) => {
   return (
      <div className="fixed top-0 right-0 bottom-0 left-0 m-auto z-40 flex items-center flex-col justify-center bg-[rgb(0_0_0_/_25%)]">
         <div className="bg-white px-4 py-5 rounded-md text-center shadow-[0_0_15px_#00000040]">
            <div
               className="animate-spin inline-block w-8 h-8 border-[3px] border-current border-t-transparent
       text-blue-600 rounded-full"
               role="status" // ARIA role for accessibility
               aria-label="loading" // ARIA label for accessibility
            >
               {/* Screen reader-only text for accessibility */}
            </div>
            <span className="sr-only">Loading...</span>{" "}
            {props.showLabel && (
               <p className="text-blue-600 text-[13px] text-center max-w-[350px] font-medium mt-1">{props.labelText}</p>
            )}
         </div>
      </div>
   );
};

export default Spinner2;
