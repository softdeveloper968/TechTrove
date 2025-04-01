import React, { ReactElement } from "react";

// Props type for the Button component
type IconButtonProps = {
   type: "submit" | "button"; // Type of the button: submit or regular button
   handleClick?: () => void; // Optional click event handler
   className?: string; // Additional CSS classes for styling (optional)
   icon?: ReactElement<any, any>; // To show icon inside button
   disabled?: boolean;
   title?:string;
};

// IconButton component: A reusable button with customizable properties
const IconButton = (props: IconButtonProps) => {
   // Default classes for styling the button
   const defaultClasses = "bg-[#2472db] hover:bg-[#0d5ecb] px-6 py-2 font-semibold text-sm text-white rounded-md shadow-lg";

   return (
      <button
         // Use additional classes if provided, otherwise, use default classes
         className={props.className ? props.className : defaultClasses}
         type={props.type} // Set the type of the button
         onClick={props.handleClick} // Attach click event handler if provided
         disabled={props.disabled}
         title={props.title}
      >
         {props.icon && <>{props.icon}</>}
      </button>
   );
};

export default IconButton;
