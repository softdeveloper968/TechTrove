import React, { ChangeEvent, useEffect, useState } from "react";
import { useEmailQueueContext } from "../../EmailQueueContext";
import SingleLineSearch from "components/common/singleLineSearch/SingleLineSearch";

type EmailQueue_SearchBarProps = {
   activeTab?: string;
};

const EmailQueue_SearchBar = (props: EmailQueue_SearchBarProps) => {
   const { 
      emailQueues, 
      setEmailQueues, 
      getEmailQueues,
      setServerEmailLogs,
      getServerEmailLogs,
      getMailManagementQueue,
      setMailManagementQueue,
      serverEmailLogs,
      mailManagementQueue,

   } = useEmailQueueContext();

   const [searchQuery, setSearchQuery] = useState<string>('');
   const defaultPageSize = 300;

   // Handle input change in the search input
   const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
   };

   // Handle the search icon click
   const handleSearchIconClick = () => {
      
      const trimmedSearchParam = searchQuery.trim();
      // if (trimmedSearchParam) {
         // Set the search parameter in the context
         setEmailQueues((prev) => ({
            ...prev,
            searchParam: trimmedSearchParam
         }));

         // Trigger the appropriate search based on the active tab
         if (props.activeTab === "Process Evictions") {
            getEmailQueues(1, defaultPageSize, trimmedSearchParam, emailQueues.companyId, emailQueues.county, emailQueues.serverId, emailQueues.isExpedited, emailQueues.isStateCourt,emailQueues.status,emailQueues.taskStatus,emailQueues.court??"");
         } else if (props.activeTab === "Process Server Eviction") {
            getServerEmailLogs(1, 100, trimmedSearchParam);
         } else if (props.activeTab === "Mail Management") {
            getMailManagementQueue(1, 100, trimmedSearchParam);
         }
      // }
   };

   // Handle the cross icon click (clear search)
   const handleClearFilters = () => {
      setSearchQuery('');
      setEmailQueues((prev) => ({ ...prev, searchParam: '' }));
      setServerEmailLogs((prev) => ({ ...prev, searchParam: '' }));
      setMailManagementQueue((prev) => ({ ...prev, searchParam: '' }));

      if (props.activeTab === "Process Evictions") {
         getEmailQueues(1, defaultPageSize, '', emailQueues.companyId, emailQueues.county, emailQueues.serverId, emailQueues.isExpedited, emailQueues.isStateCourt,emailQueues.status,emailQueues.taskStatus,emailQueues.court??"");
      } else if (props.activeTab === "Process Server Eviction") {
         getServerEmailLogs(1, 100, '');
      } else if (props.activeTab === "Mail Management") {
         getMailManagementQueue(1, 100, '');
      }
   };

   useEffect(() => {
      // Reset search query when active tab changes
      setSearchQuery('');
      setEmailQueues((prev) => ({ ...prev, searchParam: '' }));
      setServerEmailLogs((prev) => ({ ...prev, searchParam: '' }));
      setMailManagementQueue((prev) => ({ ...prev, searchParam: '' }));
   }, [props.activeTab]);

   useEffect(() => {
      // Reset search query if the search parameter 
      if (!emailQueues.searchParam?.length) {
         setSearchQuery('');
      }
   }, [emailQueues.searchParam]);
   useEffect(() => {
      // Reset search query if the search parameter in the accounting queue changes
      if (!serverEmailLogs.searchParam?.length) {
         setSearchQuery('');
      }
   }, [serverEmailLogs.searchParam]);
   useEffect(() => {
      // Reset search query if the search parameter in the accounting queue changes
      if (!mailManagementQueue.searchParam?.length) {
         setSearchQuery('');
      }
   }, [mailManagementQueue.searchParam]);

   return (
      <SingleLineSearch
         value={searchQuery}
         handleInputChange={handleInputChange}
         handleSearchIconClick={handleSearchIconClick}
         showClearSearch={props.activeTab == "Process Evictions"? false:true}
         clearSearchFilters={handleClearFilters}
         clearSearchClasses="bg-[#8e8e8e] hover:bg-[#737171] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded inline-flex gap-x-1.5 items-center mb-1 font-semibold"
      />
   );
};

export default EmailQueue_SearchBar;
