import React, { ChangeEvent, useState, useEffect } from "react";
import { useWritsOfPossessionContext } from "../../WritsOfPossessionContext";
import SingleLineSearch from "components/common/singleLineSearch/SingleLineSearch";

type WritsOfPossession__SearchBarProps = {
   activeTab?: string;
};

const WritsOfPossession_SearchBar = (props: WritsOfPossession__SearchBarProps) => {
   // State for holding the search query
   const [searchQuery, setSearchQuery] = useState<string>("");

   // Get necessary functions from the context
   const {
      getAllWritsOfPossession,
      setAllUnsignedWrits,
      unsignedWrits,
      signedWrits,
      setAllSignedWrits,
      setSelectedWritsOfPossessionId
   } = useWritsOfPossessionContext();

   // Handle change in the search input
   const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
      setSelectedWritsOfPossessionId([]);
   };

   // Handle search icon click (API call triggered here)
   const handleSearchIconClick = () => {
      const trimmedSearchParam = searchQuery.trim();
      // if (!trimmedSearchParam) return;
      setAllSignedWrits((prev) => ({
         ...prev,
         searchParam: trimmedSearchParam,
      }));
      setAllUnsignedWrits((prev) => ({
         ...prev,
         searchParam: trimmedSearchParam,
      }));

      getAllWritsOfPossession(1, 100, props.activeTab === "Ready to Sign" ? false : true, [], trimmedSearchParam);
   };

   // Handle clear search functionality
   const handleClearFilters = () => {
      // Clear the search query
      setSearchQuery("");

      // Reset search params in context
      setAllSignedWrits((prev) => ({
         ...prev,
         sortings: [],
         searchParam: "",
      }));
      setAllUnsignedWrits((prev) => ({
         ...prev,
         sortings: [],
         searchParam: "",
      }));

      // Fetch the data without any search filters
      getAllWritsOfPossession(1, 100, props.activeTab === "Ready to Sign" ? false : true, [], "");

      // Clear the selected writs of possession IDs if any were selected
      setSelectedWritsOfPossessionId([]);
   };

   useEffect(() => {
      if (searchQuery && searchQuery.length)
         handleClearFilters();

   }, [props.activeTab]);

   return (
      <SingleLineSearch
         value={searchQuery}
         handleInputChange={handleChange}
         handleSearchIconClick={handleSearchIconClick}
         showClearSearch={true}
         clearSearchFilters={handleClearFilters}
         clearSearchClasses="bg-[#8e8e8e] hover:bg-[#737171] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded inline-flex gap-x-1.5 items-center mb-1 font-semibold"
      />
   );
};

export default WritsOfPossession_SearchBar;
