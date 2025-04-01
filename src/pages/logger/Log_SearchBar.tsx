import React, { useEffect, useState } from "react";
import { ChangeEvent } from "react";
import { useLogsContext } from "./LogsContext";
import SingleLineSearch from "components/common/singleLineSearch/SingleLineSearch";

const Log_SearchBar = () => {
   const { logs, setLogs, getLogs } = useLogsContext();
   const [searchQuery, setSearchQuery] = useState<string>('');

   useEffect(() => {
      setSearchQuery(logs.searchParam ?? '');

   }, [logs.searchParam]);

   const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
   };

   const handleSearchIconClick = () => {
      const trimmedSearchParam = searchQuery.trim();
      if (trimmedSearchParam) {
         getLogs(1, 100, trimmedSearchParam, logs.event, logs.type, logs.fromDate, logs.toDate, logs.userId ?? "", logs.companyId ?? "");
         setLogs((prevAllLog) => ({ ...prevAllLog, searchParam: trimmedSearchParam }));
      }
   };

   const handleClearFilters = () => {
      setSearchQuery('');
      getLogs(1, 100, '', logs.event, logs.type, logs.fromDate, logs.toDate, logs.userId ?? "", logs.companyId ?? "");
      setLogs((prevAllLog) => ({ ...prevAllLog, searchParam: '' }));
   };

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

export default Log_SearchBar;
