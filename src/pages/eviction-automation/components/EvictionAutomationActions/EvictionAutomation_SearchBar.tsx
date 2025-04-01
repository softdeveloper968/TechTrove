import React, { ChangeEvent, useState } from "react";
import { useEvictionAutomationContext } from "pages/eviction-automation/EvictionAutomationContext";
import { IEvictionAutomationStatusQueue } from "interfaces/eviction-automation.interface";
import SingleLineSearch from "components/common/singleLineSearch/SingleLineSearch";

type User_SearchBarProps = {
   activeTab: string;
};

const User_SearchBar = ({ activeTab }: User_SearchBarProps) => {
   const [searchQuery, setSearchQuery] = useState<string>('');

   const {
      evictionAutomationApprovedQueue,
      setEvictionAutomationApprovedQueue,
      evictionAutomationApprovalsQueue,
      setEvictionAutomationApprovalsQueue,
      getEvictionAutomationApprovalsQueue,
      evictionAutomationQueue,
      setEvictionAutomationQueue,
      getEvictionAutomationQueue,
      evictionAutomationStatusQueue,
      setEvictionAutomationStatusQueue,
      evictionAutomationStatusAllQueueData,
      setEvictionAutomationStatusAllQueueData,
      evictionAutomationDismissalApprovalsQueue,
      evictionAutomationDismissalApprovedQueue,
      getEvictionAutomationDismissalApprovalsQueue,
      setEvictionAutomationDismissalApprovalsQueue,
      setEvictionAutomationDismissalApprovedQueue,
      getEvictionAutomationNotices,
      setEvictionAutomationNotices,
      getEvictionAutomationIntegrationsQueue,
      evictionAutomationNotices,
      transactionCodes,
      getTransactionCodes,
      setTransactionCodes
   } = useEvictionAutomationContext();

   const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setSearchQuery(value);
   };

   const resetSearch = () => {
      if (activeTab === "Settings") {
         getEvictionAutomationQueue(1, 100, "", evictionAutomationQueue.companyId, evictionAutomationQueue.county, evictionAutomationQueue.isExpedited, evictionAutomationQueue.isStateCourt);
         setEvictionAutomationQueue((prev) => ({ ...prev, searchParam: "" }));
      } else if (activeTab === "Transaction Codes") {
         getTransactionCodes(1, 100, "", transactionCodes.companyId, transactionCodes.propertyId);
         setTransactionCodes((prev) => ({ ...prev, searchParam: "" }));
      } else if (activeTab === "Confirm Delinquencies") {
         getEvictionAutomationApprovalsQueue(1, 100, false, evictionAutomationApprovalsQueue.isViewAll, "");
         setEvictionAutomationApprovalsQueue((prev) => ({ ...prev, searchParam: "" }));
      } else if (activeTab === "EA - Notices") {
         getEvictionAutomationNotices(1, 100, "");
         setEvictionAutomationNotices((prev) => ({ ...prev, searchParam: "" }));
      } else if (activeTab === "Sign Evictions") {
         getEvictionAutomationApprovalsQueue(1, 100, true, evictionAutomationApprovedQueue.isViewAll, "");
         setEvictionAutomationApprovedQueue((prev) => ({ ...prev, searchParam: "" }));
      } else if (activeTab === "Status") {
         const data = evictionAutomationStatusAllQueueData.items;
         const TotalCount = data.length;
         setEvictionAutomationStatusQueue(prev => ({ ...prev, items: data, searchParam: "", totalCount: TotalCount }));
      } else if (activeTab === "Confirm Dismissals") {
         getEvictionAutomationDismissalApprovalsQueue(1, 100, false, evictionAutomationDismissalApprovalsQueue.isViewAll, "");
         setEvictionAutomationDismissalApprovalsQueue((prev) => ({ ...prev, searchParam: "" }));
      } else if (activeTab === "Sign Dismissals") {
         getEvictionAutomationDismissalApprovalsQueue(1, 100, true, evictionAutomationDismissalApprovedQueue.isViewAll, "");
         setEvictionAutomationDismissalApprovedQueue((prev) => ({ ...prev, searchParam: "" }));
      }
      else if (activeTab === "RealPage") {
         getEvictionAutomationIntegrationsQueue(1, 100, "RealPage", "");
      }
      else if (activeTab === "Yardi") {
         getEvictionAutomationIntegrationsQueue(1, 100, "Yardi", "");
      }
   };

   const handleSearchIconClick = () => {
      const trimmedSearchParam = searchQuery.trim();
      if (!trimmedSearchParam) return; // Prevent empty search

      // Perform search based on active tab
      if (activeTab === "Settings") {
         getEvictionAutomationQueue(1, 100, trimmedSearchParam, evictionAutomationQueue.companyId, evictionAutomationQueue.county, evictionAutomationQueue.isExpedited, evictionAutomationQueue.isStateCourt);
         setEvictionAutomationQueue((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
      } else if (activeTab === "Transaction Codes") {
         getTransactionCodes(1, 100, trimmedSearchParam, transactionCodes.companyId, transactionCodes.propertyId);
         setTransactionCodes((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
      } else if (activeTab === "Confirm Delinquencies") {
         getEvictionAutomationApprovalsQueue(1, 100, false, evictionAutomationApprovalsQueue.isViewAll, trimmedSearchParam);
         setEvictionAutomationApprovalsQueue((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
      } else if (activeTab === "EA - Notices") {
         getEvictionAutomationNotices(1, 100, trimmedSearchParam);
         setEvictionAutomationNotices((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
      } else if (activeTab === "Sign Evictions") {
         getEvictionAutomationApprovalsQueue(1, 100, true, evictionAutomationApprovedQueue.isViewAll, trimmedSearchParam);
         setEvictionAutomationApprovedQueue((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
      } else if (activeTab === "Status") {
         const data = evictionAutomationStatusAllQueueData.items.filter(item =>
            item.name.toLowerCase().includes(trimmedSearchParam.toLowerCase()) ||
            item.ownerId.toLowerCase().includes(trimmedSearchParam.toLowerCase()) ||
            item.propertyId.toLowerCase().includes(trimmedSearchParam.toLowerCase()) ||
            new Date(item.pullDate).toLocaleString().includes(trimmedSearchParam.toLowerCase()) ||
            item.status.toLowerCase().includes(trimmedSearchParam.toLowerCase()) ||
            item.batchId.toLowerCase().includes(trimmedSearchParam.toLowerCase()) ||
            item.docUrl.toLowerCase().includes(trimmedSearchParam.toLowerCase())
         );

         const TotalCount = data.length;
         setEvictionAutomationStatusQueue(prev => ({ ...prev, items: data, searchParam: trimmedSearchParam, totalCount: TotalCount }));
      } else if (activeTab === "Confirm Dismissals") {
         getEvictionAutomationDismissalApprovalsQueue(1, 100, false, evictionAutomationDismissalApprovalsQueue.isViewAll, trimmedSearchParam);
         setEvictionAutomationDismissalApprovalsQueue((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
      } else if (activeTab === "Sign Dismissals") {
         getEvictionAutomationDismissalApprovalsQueue(1, 100, true, evictionAutomationDismissalApprovedQueue.isViewAll, trimmedSearchParam);
         setEvictionAutomationDismissalApprovedQueue((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
      }
      else if (activeTab === "RealPage") {
         getEvictionAutomationIntegrationsQueue(1, 100, "RealPage", trimmedSearchParam);
      }
      else if (activeTab === "Yardi") {
         getEvictionAutomationIntegrationsQueue(1, 100, "Yardi", trimmedSearchParam);
      }
   };

   const handleClearFilters = () => {
      setSearchQuery('');
      resetSearch();
   };

   return (
      <SingleLineSearch
         value={searchQuery}
         handleInputChange={handleInputChange}
         handleSearchIconClick={handleSearchIconClick}
         showClearSearch={true}
         clearSearchFilters={handleClearFilters}
         clearSearchClasses="bg-[#8e8e8e] hover:bg-[#737171] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded inline-flex gap-x-1.5 items-center mb-1 font-semibold"
      />
   );
};

export default User_SearchBar;
