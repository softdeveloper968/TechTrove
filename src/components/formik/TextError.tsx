import React from "react";

type Props = {
  children?: React.ReactNode; // Prop type definition for children
};

// TextError component: Displays an error message in red text
const TextError = ({ children }: Props) => {
  return (
    <div className="text-[11px] text-aidonicRed text-red-500">
      {children} {/* Render the error message passed as children */}
    </div>
  );
};

export default TextError;
