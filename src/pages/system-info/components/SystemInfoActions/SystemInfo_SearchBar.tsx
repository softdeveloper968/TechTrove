import React, { ChangeEvent, useEffect, useState } from "react";
import { useDebounce } from "hooks/useDebounce";
import MultiLineSearch from "components/common/multiLineSearch/MultiLineSearch";
import { useSystemInfoContext } from "pages/system-info/SystemInfoContext";

const SystemInfo_SearchBar = () => {
   const { systemInfo, setSystemInformationRecords, getSystemInformationRecords } = useSystemInfoContext();
   const [searchQuery, setSearchQuery] = useState<string>('');
   const [searchedApiQuery, setSearchedApiQuery] = useState<string>('');

   let debouncedSearch = useDebounce(searchQuery, 500, 3);

   useEffect(() => {
      setSearchQuery(systemInfo.searchParam ?? "");
      debouncedSearch = systemInfo.searchParam ?? "";

   }, []);

   // Search on the basis of property name, property address, tenant name, case number, or filer email
   const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.target;
      setSearchQuery(value);
      // setSelectedAllCasesId([]);
      // setBulkRecords([]);
   };

   const handleCrossClick = () => {
      setSearchQuery('');
      getSystemInformationRecords(1, 100, "");
      setSystemInformationRecords((prev) => ({ ...prev, searchParam: "" }));
   };

   const handleSearchIconClick = () => {
      const trimmedSearchParam = searchQuery.trim();
      getSystemInformationRecords(1, 100, trimmedSearchParam);
      setSystemInformationRecords((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
   };

   useEffect(() => {
      const trimmedSearchParam = debouncedSearch.trim();
      setSystemInformationRecords(prev => ({ ...prev, searchParam: trimmedSearchParam }));
      if (trimmedSearchParam) {
         if(searchedApiQuery  == "")
            {
               setSearchedApiQuery(trimmedSearchParam);
            }
            getSystemInformationRecords(1, 100, trimmedSearchParam);
      }
      if(trimmedSearchParam.length < searchedApiQuery.length)
         {
            setSearchedApiQuery(trimmedSearchParam);
            getSystemInformationRecords(1, 100, trimmedSearchParam);
         }
   }, [debouncedSearch]);
   // useEffect(() => {
   //    const trimmedSearchParam = debouncedSearch.trim();
   //    setAllPaymentRecords(prev => ({ ...prev, searchParam: trimmedSearchParam }));
   //    if (trimmedSearchParam && trimmedSearchParam.length >= 3) {
   //       if(searchedApiQuery  == "")
   //          {
   //             setSearchedApiQuery(trimmedSearchParam);
   //          }
   //       getAllPaymentRecords(1, 100, trimmedSearchParam);
   //    }
   //    if(trimmedSearchParam.length < searchedApiQuery.length)
   //       {
   //          setSearchedApiQuery(trimmedSearchParam);
   //          getAllPaymentRecords(1, 100, trimmedSearchParam);
   //       }
   // }, [debouncedSearch]);

   useEffect(() => {
      if (!systemInfo.searchParam?.length) {
         setSearchQuery('');
      }
   }, [systemInfo.searchParam]);

   return (
      <MultiLineSearch
         value={searchQuery}
         handleInputChange={handleInputChange}
         handleSearchIconClick={handleSearchIconClick}
         handleCrossIconClick={handleCrossClick}
      />
   );
};

export default SystemInfo_SearchBar;
