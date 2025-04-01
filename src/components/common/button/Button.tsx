import React, { ReactElement, ReactNode, useState } from "react";

// Props type for the Button component
type Props = {
  isRounded: Boolean; // To check wether the button should be rounded or not
  title: string; // Text to display on the button
  type: "submit" | "button"; // Type of the button: submit or regular button
  handleClick?: () => void | Promise<void>; // Optional click event handler
  classes?: string; // Additional CSS classes for styling (optional)
  icon?: ReactElement<any, any>; // To show icon inside button
  children?: ReactNode;
  disabled?: boolean;
};

const Button = (props: Props) => {
  const [isExecuting, setIsExecuting] = useState(false);
  
  // Default classes for styling the button
  const defaultClasses =
    "bg-[#2472db] hover:bg-[#0d5ecb] px-5 py-2 font-semibold text-xs text-white rounded shadow-lg";

  const handleButtonClick  = () => {
	if (props.handleClick) {
      if (isExecuting) return;
      setIsExecuting(true);
      const result = props.handleClick();
	  if (result instanceof Promise) {
	   result.finally(() => setIsExecuting(false));
	  } else {
	    setIsExecuting(false);
	  }
	}
  };
  
  return (
    <button
      // Use additional classes if provided, otherwise, use default classes
      className={
        props.classes
          ? `${props.isRounded ? "rounded-full " : ""}${props.classes}`
          : `${props.isRounded ? "rounded-full " : ""}${defaultClasses}`
      }
      type={props.type} // Set the type of the button
      onClick={handleButtonClick} // Attach click event handler if provided
      disabled={props.disabled || isExecuting}
    >
      {props.icon && <>{props.icon}</>}
      {props.title} {/* Display the button text */}
      {props.children}
    </button>
  );
};

export default Button;
