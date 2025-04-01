import React from "react";
import { ChangeEvent } from "react";
import IconSearch from "assets/images/icons-search.png";
import Button from "../button/Button";

// Props type for the Search component
type Props = {
  classes?: string; // Additional CSS classes for styling (optional)
  searchQuery: string; // Value of the search input
  handleChange: (event: ChangeEvent<HTMLInputElement>) => void; // Change event handler for input
  handleKeyPress?: (event: React.KeyboardEvent<HTMLInputElement>) => void; // Optional key press event handler
  handleIconClick: () => void;
};

// Search component: A reusable search input with customizable properties
const Search = (props: Props) => {
  // Default classes for styling the search input
  const defaultClasses =
    "w-full rounded-full h-9 md:h-10 outline-0 px-3.5 md:px-5 !pr-8 text-xs md:text-sm border resize-none";

  return (
    <div className="flex relative max-w-sm mx-auto w-full">
      <input
        type="text"
        value={props.searchQuery} // Set the value of the search input
        onChange={props.handleChange} // Attach change event handler
        onKeyDown={props.handleKeyPress} // Attach key press event handler if provided
        className={props.classes ? `${props.classes}` : `${defaultClasses}`}
      />
      <Button
        type="button"
        classes="absolute top-0 bottom-0 right-2.5"
        isRounded={false}
        title={""}
        handleClick={props.handleIconClick}
      >
        <img src={IconSearch} alt="search" className="h-4 md:h-5 w-4 md:w-5" />
      </Button>
    </div>
  );
};

export default Search;
