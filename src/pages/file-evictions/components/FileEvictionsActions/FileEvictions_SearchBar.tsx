import React, { ChangeEvent, useEffect, useState } from "react";
import { useFileEvictionsContext } from "../../FileEvictionsContext";
import SingleLineSearch from "components/common/singleLineSearch/SingleLineSearch"; // Assuming SingleLineSearch is the new component
import { useAuth } from "context/AuthContext";
import { UserRole } from "utils/enum";

type FileEvictions_SearchBarProp = {
   activeTab?: string;
};

const FileEvictions_SearchBar = (props: FileEvictions_SearchBarProp) => {
   const [searchQuery, setSearchQuery] = useState<string>("");
   const {
      fileEvictions,
      setFileEvictions,
      getFileEvictions,
      evictionAutomationApprovalsQueue,
      setEvictionAutomationApprovalsQueue,
      getEvictionAutomationApprovalsQueue
   } = useFileEvictionsContext();
   const { userRole } = useAuth();

   useEffect(() => {
      setSearchQuery(
        props.activeTab === "Ready to Sign"
          ? fileEvictions.searchParam ?? "" // Default to empty string if undefined
          : props.activeTab === "EA - Ready to Confirm"
          ? evictionAutomationApprovalsQueue.searchParam ?? "" // Default to empty string if undefined
          : ""
      );
    }, [props.activeTab, fileEvictions.searchParam, evictionAutomationApprovalsQueue.searchParam]);    

   const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
   };

   const handleSearchIconClick = () => {
      if (props.activeTab === "Ready to Sign") {
         getFileEvictions(1, 100, fileEvictions.isViewAll ?? true, searchQuery.trim(),fileEvictions.companyId);
         setFileEvictions((prev) => ({ ...prev, searchParam: searchQuery.trim() }));
      } else {
         getEvictionAutomationApprovalsQueue(1, 100, false, true, searchQuery.trim());
         setEvictionAutomationApprovalsQueue((prev) => ({ ...prev, searchParam: searchQuery.trim() }));
      }
   };

   const handleClearFilters = () => {
      setSearchQuery('');
      if (props.activeTab === "Ready to Sign") {
         getFileEvictions(1, 100, fileEvictions.isViewAll ?? true, "","");
         setFileEvictions((prev) => ({ ...prev, searchParam: '', companyId: "" }));
      } else {
         getEvictionAutomationApprovalsQueue(1, 100, false, true, "");
         setEvictionAutomationApprovalsQueue((prev) => ({ ...prev, searchParam: '' }));
      }
   };

   useEffect(() => {
      setSearchQuery('');
      setFileEvictions((prev) => ({ ...prev, searchParam: '' }));
      setEvictionAutomationApprovalsQueue((prev) => ({ ...prev, searchParam: '' }));
   }, [props.activeTab]);

   return (
      <SingleLineSearch
         value={searchQuery}
         handleInputChange={handleInputChange}
         handleSearchIconClick={handleSearchIconClick}
         showClearSearch={userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) ? false : true}
         clearSearchFilters={handleClearFilters}
         clearSearchClasses="bg-[#8e8e8e] hover:bg-[#737171] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded inline-flex gap-x-1.5 items-center mb-1 font-semibold font-semibold"
      />
   );
};

export default FileEvictions_SearchBar;
