import React, { ChangeEvent, useEffect, useState } from "react";
import MultiLineSearch from "components/common/multiLineSearch/MultiLineSearch";
import { useFilingTransactionContext } from "pages/filing-transaction/FilingTransactionContext";
import SingleLineSearch from "components/common/singleLineSearch/SingleLineSearch";

type FilingTransaction_SearchBarProps = {
   activeTab?: string;
};

const FilingTransaction_SearchBar = (props: FilingTransaction_SearchBarProps) => {
   const {
      filingTransactions,
      aosFilingTransactions,
      writsFilingTransactions,
      dismissalsFilingTransactions,
      amendmentsFilingTransactions,
      setFilingTransactions,
      setAOSFilingTransactions,
      setDismissalsFilingTransactions,
      setWritsFilingTransactions,
      setAmendmentsFilingTransactions,
      getFilingTransactions,
      filingType,
      companyId,
      dateFiled,
      datePaid,
      getAccountingQueue,
      setAccountingQueue,
      accountingQueue
   } = useFilingTransactionContext();
   
   const [searchQuery, setSearchQuery] = useState<string>('');

   useEffect(() => {
      setSearchQuery('');
      setFilingTransactions((prev) => ({ ...prev, searchParam: '' }));
      setAOSFilingTransactions((prev) => ({ ...prev, searchParam: '' }));
      setDismissalsFilingTransactions((prev) => ({ ...prev, searchParam: '' }));
      setWritsFilingTransactions((prev) => ({ ...prev, searchParam: '' }));
      setAmendmentsFilingTransactions((prev) => ({ ...prev, searchParam: '' }));
      setAccountingQueue((prev) => ({ ...prev, searchParam: '' }));
   }, [props.activeTab]);

   const updateSearch = ( searchParam: string) => {
         switch(filingType){
            case "Eviction":
               setFilingTransactions(prevLogs => ({
                  ...prevLogs,
                  searchParam: searchParam
               }));
               break;
               case "AOS":
               setAOSFilingTransactions(prevLogs => ({
                  ...prevLogs,
                  searchParam: searchParam
               }));
               break;
               case "Dismissal":
               setDismissalsFilingTransactions(prevLogs => ({
                  ...prevLogs,
                  searchParam: searchParam
               }));
               break;
               case "Writ":
               setWritsFilingTransactions(prevLogs => ({
                  ...prevLogs,
                  searchParam: searchParam
               }));
               break;
               case "Amendment":
               setAmendmentsFilingTransactions(prevLogs => ({
                  ...prevLogs,
                  searchParam: searchParam
               }));
               break;
         }
   };

   const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setSearchQuery(value);
   };

   const handleSearchIconClick = () => {
      const trimmedSearchParam = searchQuery.trim();
      if (props.activeTab !== "Accounting Queue") {
         getFilingTransactions(1, 100, trimmedSearchParam, filingType, companyId, dateFiled[0], dateFiled[1], datePaid[0], datePaid[1], filingTransactions.blankOption,filingTransactions.nonBlankOption,filingTransactions.county);
         updateSearch(trimmedSearchParam);
         // setFilingTransactions((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
      } else {
         getAccountingQueue(1, 100, trimmedSearchParam, accountingQueue.fromDatePaid, accountingQueue.toDatePaid,
            accountingQueue.type, accountingQueue.fromDatePayroll, accountingQueue.toDatePayroll,
            accountingQueue.fromDateCommission, accountingQueue.toDateCommission, accountingQueue.blankOption,accountingQueue.nonBlankOption,accountingQueue.county);
         setAccountingQueue((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
      }
   };

   const handleClearFilters = () => {
      setSearchQuery('');
      if (props.activeTab !== "Accounting Queue") {
         getFilingTransactions(1, 100, "", filingType, companyId, dateFiled[0], dateFiled[1], datePaid[0], datePaid[1], filingTransactions.blankOption,filingTransactions.nonBlankOption,filingTransactions.county);
         updateSearch("");
         // setFilingTransactions((prev) => ({ ...prev, searchParam: "" }));
      } else {
         getAccountingQueue(1, 100, "", accountingQueue.fromDatePaid, accountingQueue.toDatePaid,
            accountingQueue.type, accountingQueue.fromDatePayroll, accountingQueue.toDatePayroll,
            accountingQueue.fromDateCommission, accountingQueue.toDateCommission, accountingQueue.blankOption,accountingQueue.nonBlankOption,accountingQueue.county);
         setAccountingQueue((prev) => ({ ...prev, searchParam: "" }));
      }
   };

   useEffect(() => {
      // Reset search query if the search parameter in the context changes
      if (!filingTransactions.searchParam?.length) {
         setSearchQuery('');
      }
   }, [filingTransactions.searchParam]);
   useEffect(() => {
      // Reset search query if the search parameter in the context changes
      if (!aosFilingTransactions.searchParam?.length) {
         setSearchQuery('');
      }
   }, [aosFilingTransactions.searchParam]);
   useEffect(() => {
      // Reset search query if the search parameter in the context changes
      if (!writsFilingTransactions.searchParam?.length) {
         setSearchQuery('');
      }
   }, [writsFilingTransactions.searchParam]);
   useEffect(() => {
      // Reset search query if the search parameter in the context changes
      if (!dismissalsFilingTransactions.searchParam?.length) {
         setSearchQuery('');
      }
   }, [dismissalsFilingTransactions.searchParam]);
   useEffect(() => {
      // Reset search query if the search parameter in the context changes
      if (!amendmentsFilingTransactions.searchParam?.length) {
         setSearchQuery('');
      }
   }, [amendmentsFilingTransactions.searchParam]);

   useEffect(() => {
      // Reset search query if the search parameter in the accounting queue changes
      if (!accountingQueue.searchParam?.length) {
         setSearchQuery('');
      }
   }, [accountingQueue.searchParam]);

   return (
      <SingleLineSearch
         value={searchQuery}
         handleInputChange={handleInputChange}
         handleSearchIconClick={handleSearchIconClick}
         showClearSearch={false}
         clearSearchFilters={handleClearFilters}
         clearSearchClasses="bg-[#8e8e8e] hover:bg-[#737171] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded inline-flex gap-x-1.5 items-center mb-1 font-semibold"
      />
   );
};

export default FilingTransaction_SearchBar;
