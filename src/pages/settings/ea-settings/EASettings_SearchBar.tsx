import React, { ChangeEvent, useEffect, useState } from "react";
import MultiLineSearch from "components/common/multiLineSearch/MultiLineSearch";
import { useDebounce } from "hooks/useDebounce";
import { IEvictionAutomationStatusQueue } from "interfaces/eviction-automation.interface";
import { useEASettingsContext } from "./EASettingsContext";

type EASettings_SearchBarProps = {
};

const EASettings_SearchBar = () => {
   const [searchQuery, setSearchQuery] = useState<string>('');
   const [searchedApiQuery, setSearchedApiQuery] = useState<string>('');
   const debouncedSearch = useDebounce(searchQuery, 500, 3);

   const {
    eaSettingsQueue,
    getEASettingsQueue,
    setEASettingsQueue,
 } = useEASettingsContext();

   // Search on the basis of property name, property address, tenant name, case number, or filer email
   const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.target;
      setSearchQuery(value);
   };

   const handleCrossClick = () => {
      setSearchQuery('');
        getEASettingsQueue(1, 100, "");
        setEASettingsQueue((prev) => ({ ...prev, searchParam: "" }));
   };

   const handleSearchIconClick = () => {   
      const trimmedSearchParam = searchQuery.trim();
        getEASettingsQueue(1, 100, trimmedSearchParam);
        setEASettingsQueue((prev) => ({ ...prev, searchParam: trimmedSearchParam }));  
   };


   useEffect(() => {
      
      const trimmedSearchParam = debouncedSearch.trim();
      var filteredData: IEvictionAutomationStatusQueue;

        setEASettingsQueue(prev => ({ ...prev, searchParam: trimmedSearchParam }));

      if (trimmedSearchParam) {
         if(searchedApiQuery  == "")
            {
               setSearchedApiQuery(trimmedSearchParam);
            }
            getEASettingsQueue(1, 100, trimmedSearchParam);
      }
      if(trimmedSearchParam.length < searchedApiQuery.length)
         {
            setSearchedApiQuery(trimmedSearchParam);
                getEASettingsQueue(1, 100, trimmedSearchParam);
                setEASettingsQueue((prev) => ({ ...prev, searchParam: "" }));
         }
   }, [debouncedSearch]);



   useEffect(() => {
      if (!eaSettingsQueue.searchParam?.length) {
         setSearchQuery('');
      }
   }, [eaSettingsQueue.searchParam]);


   return (
      <MultiLineSearch
         value={searchQuery}
         handleInputChange={handleInputChange}
         handleSearchIconClick={handleSearchIconClick}
         handleCrossIconClick={handleCrossClick}
      />
   );
};

export default EASettings_SearchBar;
