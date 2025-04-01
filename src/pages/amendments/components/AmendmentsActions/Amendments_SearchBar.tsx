import React, { ChangeEvent, useEffect, useState } from "react";
import SingleLineSearch from "components/common/singleLineSearch/SingleLineSearch";
import { useAmendmentsContext } from "../../AmendmentsContext";

type Amendments_SearchBarProps = {
   activeTab?: string;
};

const Amendments_SearchBar = (props: Amendments_SearchBarProps) => {
   // State for holding the search query
   const [searchQuery, setSearchQuery] = useState<string>("");

   // Get necessary functions from the context
   const {
      signedAmendment,
      getAllAmendments,
      setAllUnsignedAmendment,
      setAllSignedAmendment,
      unsignedAmendment,
      unservedAmendment,
      getAllUnservedAmendment,
      setAllUnservedAmendment
   } = useAmendmentsContext();

   useEffect(() => {
      if (props.activeTab === "Ready to Sign") {
         setSearchQuery(unsignedAmendment.searchParam ?? "");
      } else if (props.activeTab === "Signed") {
         setSearchQuery(signedAmendment.searchParam ?? "");
      } else if (props.activeTab === "Unserved Amendments") {
         setSearchQuery(unservedAmendment.searchParam ?? "");
      }
   }, [props.activeTab]);

   // Handle change in the search input
   const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
   };

   const handleSearchIconClick = () => {
      const trimmedSearchParam = searchQuery.trim();

      // if (!trimmedSearchParam) return; // Prevent empty search

      if (props.activeTab === "Ready to Sign") {
         getAllAmendments(1, 100, false, trimmedSearchParam);
      } else if (props.activeTab === "Signed") {
         getAllAmendments(1, 100, true, trimmedSearchParam);
      } else if (props.activeTab === "Unserved Amendments") {
         getAllUnservedAmendment(1, 100, trimmedSearchParam);
      }

      setAllUnsignedAmendment((prevAmendments) => ({
         ...prevAmendments,
         searchParam: trimmedSearchParam,
      }));
      setAllSignedAmendment((prevAmendments) => ({
         ...prevAmendments,
         searchParam: trimmedSearchParam,
      }));
      setAllUnservedAmendment((prevAmendments) => ({
         ...prevAmendments,
         searchParam: trimmedSearchParam,
      }));
   };

   const handleClearFilters = () => {
      setSearchQuery("");
      setAllSignedAmendment((prev) => ({
         ...prev,
         searchParam: "",
      }));
      setAllUnsignedAmendment((prev) => ({
         ...prev,
         searchParam: "",
      }));
      setAllUnservedAmendment((prev) => ({
         ...prev,
         searchParam: "",
      }));

      getAllAmendments(1, 100, true, "");
      getAllAmendments(1, 100, false, "");
      getAllUnservedAmendment(1, 100, "");
   };

   useEffect(() => {
      if (!unsignedAmendment.searchParam?.length) {
         setSearchQuery('');
      }

      if (!signedAmendment.searchParam?.length) {
         setSearchQuery('');
      }
      if (!unservedAmendment.searchParam?.length) {
         setSearchQuery('');
      }
   }, [unsignedAmendment.searchParam, signedAmendment.searchParam, unservedAmendment.searchParam]);

   useEffect(() => {
      setSearchQuery('');
      setAllUnsignedAmendment((prevAmendments) => ({
         ...prevAmendments,
         searchParam: '',
      }));
      setAllSignedAmendment((prevAmendments) => ({
         ...prevAmendments,
         searchParam: '',
      }));
      setAllUnservedAmendment((prevAmendments) => ({
         ...prevAmendments,
         searchParam: '',
      }));
   }, [props.activeTab]);

   // Render the SingleLineSearch component
   return (
      <SingleLineSearch
         value={searchQuery}
         handleInputChange={handleChange}
         handleSearchIconClick={handleSearchIconClick}
         showClearSearch={true}
         clearSearchFilters={handleClearFilters}
         clearSearchClasses="bg-[#8e8e8e] hover:bg-[#737171] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded inline-flex gap-x-1.5 items-center mb-1 font-semibold" />
   );
};

export default Amendments_SearchBar;
