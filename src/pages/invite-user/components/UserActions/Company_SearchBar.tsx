import React from "react";
import { ChangeEvent, useEffect, useState } from "react";
import MultiLineSearch from "components/common/multiLineSearch/MultiLineSearch";
import { useDebounce } from "hooks/useDebounce";
import { useUserContext } from "../../UserContext";

const Company_SearchBar = () => {
   // State for holding the search query
   const [searchQuery, setSearchQuery] = useState<string>("");
   const [searchedApiQuery, setSearchedApiQuery] = useState<string>('');

   // Debounce the search query
   const debouncedSearch = useDebounce(searchQuery, 800);

   // Get necessary functions from the context
   const {
      companies,
      setCompanyList,
      getListOfCompany,
   } = useUserContext();

   // Search on the basis of property name, property address, tenant name, case number, or filer email
   const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.target;
      setSearchQuery(value);
   };

   const handleCrossClick = () => {
      setSearchQuery('');
      getListOfCompany(1, 100, "");
      setCompanyList((prev) => ({ ...prev, searchParam: "" }));
   };

   const handleSearchIconClick = () => {
      const trimmedSearchParam = searchQuery.trim();
      getListOfCompany(1, 100, trimmedSearchParam);
      setCompanyList((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
   };

   useEffect(() => {
      ;
      const trimmedSearchParam = debouncedSearch.trim();
      setCompanyList(prev => ({ ...prev, searchParam: trimmedSearchParam }));
      if (trimmedSearchParam && trimmedSearchParam.length >= 3) {
         if(searchedApiQuery  == "")
            {
               setSearchedApiQuery(trimmedSearchParam);
            }
         getListOfCompany(1, 100, trimmedSearchParam);
      }
      if(trimmedSearchParam.length < searchedApiQuery.length)
         {
            setSearchedApiQuery(trimmedSearchParam);
            getListOfCompany(1, 100, trimmedSearchParam);
            setCompanyList((prev) => ({ ...prev, searchParam: "" }));
         }

   }, [debouncedSearch]);

   useEffect(() => {
      if (!companies.searchParam?.length) {
         setSearchQuery('');
      }
   }, [companies.searchParam]);

   // Render the MultiLineSearch component
   return (
      <>
         <MultiLineSearch
            value={searchQuery}
            handleInputChange={handleInputChange}
            handleSearchIconClick={handleSearchIconClick}
            handleCrossIconClick={handleCrossClick}
         />
      </>
   );
};

export default Company_SearchBar;
