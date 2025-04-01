import React, { ChangeEvent, useState } from "react";
import { useParams } from "react-router-dom";
import { useAllCheckCasesContext } from "./CheckCasesContext";
import SingleLineSearch from "components/common/singleLineSearch/SingleLineSearch";

const AllCheckCases_SearchBar = () => {
   const { query } = useParams();
   const [searchQuery, setSearchQuery] = useState<string>(query || "");
   const { setAllCheckCases, getAllCheckCases } = useAllCheckCasesContext();

   const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
   };

   const handleSearchIconClick = () => {
      // Search will happen on icon click without any minimum character restriction
      getAllCheckCases(1, 100, searchQuery);
      setAllCheckCases((prev) => ({ ...prev, searchParam: searchQuery }));
   };

   const handleClearFilters = () => {
      setSearchQuery('');
      getAllCheckCases(1, 100, "");
      setAllCheckCases((prev) => ({ ...prev, searchParam: "" }));
   };

   return (
      <SingleLineSearch
         value={searchQuery}
         handleInputChange={handleInputChange}
         handleSearchIconClick={handleSearchIconClick}
         showClearSearch={true}
         clearSearchFilters={handleClearFilters}
         clearSearchClasses="bg-[#8e8e8e] hover:bg-[#737171] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded inline-flex gap-x-1.5 items-center mb-1 font-semibold w-[155px] font-semibold"
      />
   );
};

export default AllCheckCases_SearchBar;
