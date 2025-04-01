import React, { ChangeEvent } from "react";
import { FaTimes } from "react-icons/fa";
import IconSearch from "assets/images/icons-search.png";
import Button from "../button/Button";
import ClearFilters from "../button/ClearFilters";

type SingleLineSearchProps = {
   value: string;
   handleInputChange: (event: ChangeEvent<HTMLInputElement>) => void; // Updated to HTMLInputElement
   handleSearchIconClick: () => void;
   isVisible?: boolean;
   showClearSearch: boolean;
   clearSearchFilters: () => void;
   clearSearchClasses?: string;
};

const SingleLineSearch: React.FC<SingleLineSearchProps> = (props) => {
   const defaultClasses =
      "w-full rounded-full h-9 md:h-10 outline-0 px-5 border resize-none text-xs py-1.5 pt-2.5 mb-1 pr-[40px]";

   // Handler for key press (specifically Enter key)
   const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Enter") {
         props.handleSearchIconClick();
      }
   };

   return (
      <>
         <div className="flex relative w-full md:w-[auto] min-w-[60%] md:min-w-[31%] lg:min-w-[22%] md:mr-1.5 mb-1 md:mb-0">
            {props.isVisible !== false ? (
               <>
                  <input
                     id="singleLineInput"
                     value={props.value}
                     onChange={props.handleInputChange}
                     onKeyDown={handleKeyDown}
                     className={defaultClasses}
                  />
                  <Button
                     type="button"
                     classes="absolute top-0 bottom-0 right-[12px] mb-0.5"
                     isRounded={false}
                     title={""}
                     handleClick={props.handleSearchIconClick}
                  >
                     <img src={IconSearch} alt="search" className="h-4 w-4 md:h-5 md:w-5" />
                  </Button>
               </>
            ) : (
               <div className="h-10" />
            )}
         </div>
         {props.showClearSearch && (
            <ClearFilters
               type="button"
               isRounded={false}
               title="Clear Filters"
               handleClick={props.clearSearchFilters}
               icon={<FaTimes />}
               classes={props.clearSearchClasses}
            />
         )}
      </>
   );
};

export default SingleLineSearch;
