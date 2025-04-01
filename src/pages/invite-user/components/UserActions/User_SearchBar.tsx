import React from "react";
import { ChangeEvent, useEffect, useState } from "react";
import MultiLineSearch from "components/common/multiLineSearch/MultiLineSearch";
import { useDebounce } from "hooks/useDebounce";
import { useUserContext } from "../../UserContext";

const User_SearchBar = () => {
   // State for holding the search query
   const [searchQuery, setSearchQuery] = useState<string>("");
   const [searchedApiQuery, setSearchedApiQuery] = useState<string>('');

   // Debounce the search query
   const debouncedSearch = useDebounce(searchQuery, 800);

   // Get necessary functions from the context
   const {
      users,
      setUserList,
      getListOfUsers,
   } = useUserContext();

   // Search on the basis of property name, property address, tenant name, case number, or filer email
   const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
      const { value } = event.target;
      setSearchQuery(value);
   };

   const handleCrossClick = () => {
      setSearchQuery('');
      getListOfUsers(1, 100, "");
      setUserList((prev) => ({ ...prev, searchParam: "" }));
   };

   const handleSearchIconClick = () => {
      const trimmedSearchParam = searchQuery.trim();
      getListOfUsers(1, 100, trimmedSearchParam);
      setUserList((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
   };

   useEffect(() => {
      const trimmedSearchParam = debouncedSearch.trim();
      setUserList(prev => ({ ...prev, searchParam: trimmedSearchParam }));
      if (trimmedSearchParam && trimmedSearchParam.length >= 3) {
         if(searchedApiQuery  == "")
            {
               setSearchedApiQuery(trimmedSearchParam);
            }
         getListOfUsers(1, 100, trimmedSearchParam);
      }
      if(trimmedSearchParam.length < searchedApiQuery.length)
         {
            setSearchedApiQuery(trimmedSearchParam);
            getListOfUsers(1, 100, trimmedSearchParam);
            setUserList((prev) => ({ ...prev, searchParam: "" }));
         }

   }, [debouncedSearch]);

   useEffect(() => {
      if (!users.searchParam?.length) {
         setSearchQuery('');
      }
   }, [users.searchParam]);

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

export default User_SearchBar;
