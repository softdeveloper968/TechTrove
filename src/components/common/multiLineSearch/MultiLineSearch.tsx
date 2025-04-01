import React from "react";
import { ChangeEvent } from "react";
import { FaTimes } from "react-icons/fa";
import IconSearch from "assets/images/icons-search.png";
import Button from "../button/Button";

// Define the Props type for MultiLineSearch component
type MultiLineSearchProps = {
  value: string;
  handleInputChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  handleSearchIconClick: () => void;
  handleCrossIconClick: () => void;
  isVisible?: boolean; // Optional prop to control visibility
};

// MultiLineSearch component receives value and handleInputChange as props
const MultiLineSearch: React.FC<MultiLineSearchProps> = (props) => {
  // Define default classes for the textarea
  const defaultClasses =
    "w-full rounded-full h-9 md:h-10 outline-0 px-5 pr-6 border resize-none text-xs py-1.5 pt-2.5 mb-1";

  return (
    <div className="flex relative w-full md:w-[auto] min-w-[60%] md:min-w-[31%] lg:min-w-[22%] md:mr-1.5 mb-1 md:mb-0">
      {props.isVisible !== false ? ( // Default to visible unless explicitly set to false
        <>
          {/* Multiline textarea input */}
          <textarea
            id="multilineInput"
            value={props.value}
            onChange={props.handleInputChange}
            className={defaultClasses}
          />

          {/* Search button */}
          <Button
            type="button"
            classes="absolute top-0 bottom-0 right-[10px] mb-0.5"
            isRounded={false}
            title={""}
            handleClick={props.value ? props.handleCrossIconClick : props.handleSearchIconClick}
          >
            {props.value ? (
              <FaTimes className="h-3.5 w-3.5" />
            ) : (
              <img src={IconSearch} alt="search" className="h-4 w-4 md:h-5 md:w-5" />
            )}
          </Button>
        </>
      ) : (
        <div className="h-10" /> // Placeholder to maintain space when hidden
      )}
    </div>
  );
};

export default MultiLineSearch;
