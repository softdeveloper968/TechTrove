import React, { FC } from "react";
import { ISelectOptions } from "interfaces/late-notices.interface";
import arrow from "../../../assets/images/select_arrow.png";

// Props type for DropdownPresentation component
type DropdownPresentationProps<T> = {
  heading: string; // Text to display as the heading above the dropdown
  selectedOption: T | undefined; // Currently selected option from the dropdown
  handleSelect: (event: React.ChangeEvent<HTMLSelectElement>) => void; // Event handler for option selection
  options: T[]; // List of options to populate the dropdown
  placeholder?: string; // Placeholder text for the default/empty state of the dropdown
  classes?: string;
  disabled?: boolean;
  sort?: boolean;
  isVisible?: boolean;
  handleClick?: (event: React.MouseEvent<HTMLSelectElement>) => void;
};

// DropdownPresentation component: A simple dropdown UI presentation
const DropdownPresentation: FC<DropdownPresentationProps<ISelectOptions>> = ({
  heading,
  selectedOption,
  handleSelect,
  options,
  placeholder,
  classes,
  disabled,
  sort=true,
  isVisible=true,
  handleClick
}) => {
  const defaultClasses = `select-option w-full rounded-md h-9 md:h-10 outline-0 px-3 pr-[22px] border min-w-[48%] text-xs bg-no-repeat bg-[center_right_10px] appearance-none`;
  if (!isVisible) {
    return null; // Return null if not visible
  }

  const sortedOptions = sort ? [...options].sort((a, b) => a.value.localeCompare(b.value)) : options;

  return (
    <div className="flex w-full justify-end items-center select-box">
      {/* Heading for the dropdown */}
      {heading && <h3 className="mb-0 text-left text-md my-0 mr-1.5 text-[11px] sm:text-xs">{heading}</h3>}
      {/* Dropdown container */}
      <div
        className={`${
          classes ? "pt-2.5" : ""
        } flex relative w-full max-w-[180px] `}
      >
        {/* Select dropdown */}
        <select
          name="search"
          value={selectedOption?.id || ""}
          onChange={handleSelect}
          onClick={handleClick}
          style={{ backgroundImage: `url(${arrow})` }}
          disabled={disabled}
          className={`${classes ? classes : defaultClasses}`}          
        >
          {/* Placeholder option */}

          {placeholder && placeholder.length && <option disabled={disabled === false ? false : true} value="">{placeholder}</option>}
          {/* Map over options and render each as an option in the dropdown */}
          {sortedOptions.map((option: ISelectOptions) => (
            <option key={option.id} value={option.id}>
              {option.value}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DropdownPresentation;
