import React, { ChangeEvent, useEffect, useState } from "react";
import { useUserContext } from "../UserContext";
import SingleLineSearch from "components/common/singleLineSearch/SingleLineSearch";

type User_SearchBarProps = {
   activeTab: string;
};

const User_SearchBar = ({ activeTab }: User_SearchBarProps) => {
   const [searchQuery, setSearchQuery] = useState<string>('');
   const {
      users,
      setUserList,
      getListOfUsers,
      companies,
      setCompanyList,
      getListOfCompany,
      properties,
      getProperties,
      setProperties
   } = useUserContext();

   // Handle input change without initiating search
   const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const { value } = event.target;
      setSearchQuery(value.trim()); // Trim input to avoid leading/trailing spaces
   };

   const handleSearchIconClick = () => {
      const trimmedSearchParam = searchQuery.trim(); // Use the trimmed search query
      if (activeTab === "Users") {
         getListOfUsers(1, 100, trimmedSearchParam);
         setUserList((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
      } else if (activeTab === "Company") {
         getListOfCompany(1, 100, trimmedSearchParam);
         setCompanyList((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
      } else if (activeTab === "Properties") {
         getProperties(1, 100, trimmedSearchParam);
         setProperties((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
      }
   };

   const handleClearFilters = () => {
      setSearchQuery('');
      if (activeTab === "Users") {
         getListOfUsers(1, 100, "");
         setUserList((prev) => ({ ...prev, searchParam: "" }));
      } else if (activeTab === "Company") {
         getListOfCompany(1, 100, "");
         setCompanyList((prev) => ({ ...prev, searchParam: "" }));
      } else if (activeTab === "Properties") {
         getProperties(1, 100, "");
         setProperties((prev) => ({ ...prev, searchParam: "" }));
      }
   };

   useEffect(() => {
      // Clear search when activeTab changes
      setSearchQuery('');
      setUserList((prev) => ({ ...prev, searchParam: '' }));
      setCompanyList((prev) => ({ ...prev, searchParam: '' }));
      setProperties((prev) => ({ ...prev, searchParam: '' }));

   }, [activeTab]);

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
