import React from "react";

type Props = {
  // showLabel?: Boolean; 
  // labelText?: string;
}; // The Spinner component does not require any props

// Spinner component: A simple loading spinner animation
const Spinner = (props: Props) => {
  return (
    <div className="fixed top-1/2 left-1/2 m-auto z-40 flex items-center flex-col justify-center translate-[translate(-50%,_-50%)]">
      <div
      className="animate-spin inline-block w-5 h-5 border-[2px] border-current border-t-transparent
       text-blue-600 rounded-full"
      role="status" // ARIA role for accessibility
      aria-label="loading" // ARIA label for accessibility
    >
           {/* Screen reader-only text for accessibility */}
    </div>
       <span className="sr-only">Loading...</span>{" "}
      {/* {props.showLabel && (
                       <p className="text-blue-600 text-[13px] text-center max-w-[470px] font-medium">{props.labelText}</p>
                 )} */}
    </div>
    
    
  );
};

export default Spinner;
