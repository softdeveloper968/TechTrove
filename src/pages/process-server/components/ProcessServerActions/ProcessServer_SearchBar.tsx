import React, { ChangeEvent, useEffect, useState } from "react";
import SingleLineSearch from "components/common/singleLineSearch/SingleLineSearch";
import { useProcessServerContext } from "pages/process-server/ProcessServerContext";

const ProcessServer_SearchBar = () => {
   const { setProcessServerCases, getProcessServerCases, processServerCases } = useProcessServerContext();
   const [searchQuery, setSearchQuery] = useState<string>('');

   // On component mount, set the initial search query from context
   useEffect(() => {
      setSearchQuery(processServerCases.searchParam ?? "");
   }, [processServerCases.searchParam]);

   useEffect(() => {
      setSearchQuery(processServerCases.searchParam ?? "");
   }, [processServerCases]);

   // Handle input change in the search input
   const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
   };

   // Handle the search icon click
   const handleSearchIconClick = () => {
      const trimmedSearchParam = searchQuery.trim();
      // Trigger the search only if the query is non-empty
      // if (trimmedSearchParam.length) {
      //    getProcessServerCases(1, 100, trimmedSearchParam, processServerCases.serverName, processServerCases.serviceMethod, processServerCases.dateRange);
      //    setProcessServerCases((prev) => ({
      //       ...prev,
      //       searchParam: trimmedSearchParam,
      //    }));
      // }

         getProcessServerCases(1, 100, trimmedSearchParam, processServerCases.serverName, processServerCases.serviceMethod, processServerCases.dateRange);
         setProcessServerCases((prev) => ({
            ...prev,
            searchParam: trimmedSearchParam,
         }));
   };

   // Handle the cross icon click (clear search)
   const handleClearFilters = () => {
      setSearchQuery('');
      getProcessServerCases(1, 100, "", processServerCases.serverName, processServerCases.serviceMethod, processServerCases.dateRange);
      setProcessServerCases((prev) => ({
         ...prev,
         searchParam: "",
      }));
   };

   return (
      <SingleLineSearch
         value={searchQuery}
         handleInputChange={handleChange}
         handleSearchIconClick={handleSearchIconClick}
         showClearSearch={false}
         clearSearchFilters={handleClearFilters}
         clearSearchClasses="bg-[#8e8e8e] hover:bg-[#737171] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded inline-flex gap-x-1.5 items-center mb-1 font-semibold"
      />
   );
};

export default ProcessServer_SearchBar;
