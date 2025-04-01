import React, { ChangeEvent, useEffect, useState } from "react";
import { useAllCasesContext } from "../../AllCasesContext";
import SingleLineSearch from "components/common/singleLineSearch/SingleLineSearch"; // Replace with SingleLineSearch import

const AllCases_SearchBar = () => {
   const { allCases, setAllCases, getAllCases, setSelectedAllCasesId, setBulkRecords } = useAllCasesContext();
   const [searchQuery, setSearchQuery] = useState<string>('');

   useEffect(() => {
      setSearchQuery(allCases.searchParam ?? "");
   }, [allCases.searchParam]);

   const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setSearchQuery(value);
      // setSelectedAllCasesId([]);
      // setBulkRecords([]);
   };

   const handleSearchIconClick = () => {
      const trimmedSearchParam = searchQuery.trim();
      getAllCases(1, 100, trimmedSearchParam, allCases.status, allCases.county, allCases.filingType);
      setAllCases((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
   };

   const handleClearFilters = () => {
      getAllCases(1, 100, '', '', '', null);
      setAllCases((prev) => ({ ...prev, searchParam: '', county: '', status: '', filingType: null }));
   };

   return (
      <SingleLineSearch
         value={searchQuery}
         handleInputChange={handleInputChange}
         handleSearchIconClick={handleSearchIconClick}
         isVisible={true}
         showClearSearch={false}
         clearSearchFilters={handleClearFilters}
      />
   );
};

export default AllCases_SearchBar;
