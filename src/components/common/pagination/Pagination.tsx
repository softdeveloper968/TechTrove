import React from "react";
import Button from "../button/Button";

// Define a generic Props type for Pagination component
type PaginationProps = {
   numberOfItemsPerPage: number;
   currentPage: number;
   totalPages: number;
   totalRecords: number;
   handleFrontButton: () => void;
   handleBackButton: () => void;
   canPaginateBack: boolean; // Use lowercase 'boolean' for primitive types
   canPaginateFront: boolean; // Use lowercase 'boolean' for primitive types
};

// Define Pagination component with generic Props
const Pagination: React.FC<PaginationProps> = (props) => {
   return (
      <>
         {/* Render pagination only if there are multiple pages */}
         {props.totalPages > 0 && (
            <div className="pagination flex items-center justify-between mt-1.5 pr-0.5">
               <div>
                  <span className="text-gray mx-2.5 text-[11px]">
                     Total Record{props.totalRecords === 1 ? "" : "s"}: {props.totalRecords}
                  </span>
               </div>
               <div>
                  {/* Button for navigating to the previous page */}
                  {props.currentPage > 1 && (
                     <Button
                        classes="text-xs bg-white	inline-flex justify-center items-center rounded-md text-sm font-semibold py-1.5 px-3.5 text-slate-900 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15  	 shadow-lg"
                        handleClick={props.handleBackButton}
                        isRounded={false}
                        title={"Previous"}
                        type={"submit"}
                        disabled={!props.canPaginateBack}
                     ></Button>
                  )}
                  {/* Display current page and total pages */}
                  <span className="text-gray mx-2.5 text-[11px]">
                     Page {props.currentPage} of {props.totalPages}
                  </span>
                  {/* Button for navigating to the next page */}
                  {props.currentPage < props.totalPages && (
                     <Button
                        classes="text-xs bg-white	inline-flex justify-center items-center rounded-md font-semibold py-1.5 px-3.5 text-slate-900 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15  	 shadow-lg"
                        handleClick={props.handleFrontButton}
                        isRounded={false}
                        title={"Next"}
                        type={"button"}
                        disabled={!props.canPaginateFront}
                     ></Button>
                  )}
               </div>
            </div>
         )}
      </>
   );
};

export default Pagination;
