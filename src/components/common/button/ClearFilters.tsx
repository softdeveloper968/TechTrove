import React, { ReactElement, ReactNode } from "react";

// Props type for the Button component
type Props = {
  isRounded: Boolean; // To check wether the button should be rounded or not
  title: string; // Text to display on the button
  type: "submit" | "button"; // Type of the button: submit or regular button
  handleClick?: () => void; // Optional click event handler
  classes?: string; // Additional CSS classes for styling (optional)
  icon?: ReactElement<any, any>; // To show icon inside button
  children?: ReactNode;
  disabled?: boolean;
};

// Button component: A reusable button with customizable properties
const ClearFilters = (props: Props) => {
  // Default classes for styling the button
  const defaultClasses =
    "bg-[#8e8e8e] hover:bg-[#737171] px-3.5 md:px-4 py-1.5 font-medium text-[11px] md:text-xs text-white rounded inline-flex gap-x-1.5 items-center h-8 md:h-[34px] font-semibold text-nowrap";

  return (
    <button
      // Use additional classes if provided, otherwise, use default classes
      className={
        props.classes
          ? `${props.isRounded ? "rounded-full " : ""}${props.classes}`
          : `${props.isRounded ? "rounded-full " : ""}${defaultClasses}`
      }
      type={props.type} // Set the type of the button
      onClick={props.handleClick} // Attach click event handler if provided
      disabled={props.disabled}
    >
      {props.title} {/* Display the button text */}
      {props.children}
      {props.icon && <>{props.icon}</>}
    </button>
  );
};

export default ClearFilters;
