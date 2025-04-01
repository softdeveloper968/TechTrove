import React, { ChangeEvent, useEffect, useState } from "react";
import { useDissmissalsContext } from "../../DismissalsContext";
import SingleLineSearch from "components/common/singleLineSearch/SingleLineSearch";

type Dismissals_SearchBarProps = {
   activeTab?: string;
};

const Dismissals_SearchBar = (props: Dismissals_SearchBarProps) => {
   // State for holding the search query
   const [searchQuery, setSearchQuery] = useState<string>("");

   // Get necessary functions from the context
   const { 
      setAllSignedDismissals, 
      setAllUnsignedDismissals, 
      getAllDismissals, 
      unsignedDismissals, 
      signedDismissals,
      evictionAutomationDismissalApprovalsQueue,
      setEvictionAutomationDismissalApprovalsQueue,
      getEvictionAutomationDismissalApprovalsQueue
   } = useDissmissalsContext();

   // Update dismissals when the search query changes
   const updateDismissals = (searchParam: string) => {
      const trimmedSearchParam = searchParam.trim();
      // if (!trimmedSearchParam.length) return;

      if (props.activeTab === "Ready to Sign") {
         getAllDismissals(1, 100, false, trimmedSearchParam, "", unsignedDismissals.isViewAll ?? true);
      } else if (props.activeTab === "Signed Dismissals") {
         getAllDismissals(1, 100, true, trimmedSearchParam, "");
      } else if (props.activeTab === "EA - Ready to Confirm") {
         getEvictionAutomationDismissalApprovalsQueue(1, 100, false, true, trimmedSearchParam);
      }

      // Update search parameters in context
      setAllUnsignedDismissals((prevDismissals) => ({
         ...prevDismissals,
         searchParam: trimmedSearchParam
      }));
      setAllSignedDismissals((prevDismissals) => ({
         ...prevDismissals,
         searchParam: trimmedSearchParam
      }));
      if (props.activeTab === "EA - Ready to Confirm") {
         setEvictionAutomationDismissalApprovalsQueue((prevDismissals) => ({
            ...prevDismissals,
            searchParam: trimmedSearchParam
         }));
      }
   };

   const handleSearchIconClick = () => {
      updateDismissals(searchQuery);
   };

   // Clear the search query and reset the dismissals
   const handleClearFilters = () => {
      setSearchQuery("");
      if (props.activeTab === "Ready to Sign") {
         getAllDismissals(1, 100, false, '', "", unsignedDismissals.isViewAll ?? true);
      } else if (props.activeTab === "Signed Dismissals") {
         getAllDismissals(1, 100, true, '', "");
      } else if (props.activeTab === "EA - Ready to Confirm") {
         getEvictionAutomationDismissalApprovalsQueue(1, 100, false, true, '');
      }

      // if (props.activeTab === "Ready to Sign") {
         setAllUnsignedDismissals((prevDismissals) => ({
            ...prevDismissals,
            searchParam: ''
         }));
      // }

      // if (props.activeTab === "Signed Dismissals") {
         setAllSignedDismissals((prevDismissals) => ({
            ...prevDismissals,
            searchParam: ''
         }));
      // }

      // if (props.activeTab === "EA - Ready to Confirm") {
         setEvictionAutomationDismissalApprovalsQueue((prevDismissals) => ({
            ...prevDismissals,
            searchParam: ''
         }));
      // }
   };

   // Effect to reset search query based on active tab
   useEffect(() => {
      setSearchQuery("");
      // if (props.activeTab === "Ready to Sign") {
         setAllUnsignedDismissals((prevDismissals) => ({
            ...prevDismissals,
            searchParam: ''
         }));
      // }

      // if (props.activeTab === "Signed Dismissals") {
         setAllSignedDismissals((prevDismissals) => ({
            ...prevDismissals,
            searchParam: ''
         }));
      // }

      // if (props.activeTab === "EA - Ready to Confirm") {
         setEvictionAutomationDismissalApprovalsQueue((prevDismissals) => ({
            ...prevDismissals,
            searchParam: ''
         }));
      // }
   }, [props.activeTab]);

   // Render the SingleLineSearch component
   return (
      <SingleLineSearch
         value={searchQuery}
         handleInputChange={(event: ChangeEvent<HTMLInputElement>) => setSearchQuery(event.target.value)}
         handleSearchIconClick={handleSearchIconClick}
         showClearSearch={true}
         clearSearchFilters={handleClearFilters}
         clearSearchClasses="bg-[#8e8e8e] hover:bg-[#737171] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded inline-flex gap-x-1.5 items-center mb-1 font-semibold"
      />
   );
};

export default Dismissals_SearchBar;
