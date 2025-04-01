import React, { ChangeEvent, useEffect, useState } from "react";
import { usePaymentContext } from "pages/single-payment/PaymentContext";
import SingleLineSearch from "components/common/singleLineSearch/SingleLineSearch";

const Payment_SearchBar = () => {
   const { paymentRecords, setAllPaymentRecords, getAllPaymentRecords } = usePaymentContext();
   const [searchQuery, setSearchQuery] = useState<string>('');

   useEffect(() => {
      // Initialize searchQuery from paymentRecords.searchParam
      setSearchQuery(paymentRecords.searchParam ?? "");
   }, [paymentRecords.searchParam]);

   const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
   };

   const handleSearchIconClick = () => {
      const trimmedSearchParam = searchQuery.trim();
      // Perform the search when the search icon is clicked
      getAllPaymentRecords(1, 100, trimmedSearchParam);
      setAllPaymentRecords((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
   };

   const handleClearFilters = () => {
      // Clear the search query and reset payment records
      setSearchQuery('');
      getAllPaymentRecords(1, 100, "");
      setAllPaymentRecords((prev) => ({ ...prev, searchParam: "" }));
   };

   return (
      <SingleLineSearch
         value={searchQuery}
         handleInputChange={handleInputChange}
         handleSearchIconClick={handleSearchIconClick}
         showClearSearch={true}
         clearSearchFilters={handleClearFilters}
         clearSearchClasses="bg-[#8e8e8e] hover:bg-[#737171] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded inline-flex gap-x-1.5 items-center mb-1 font-semibold font-semibold"
      />
   );
};

export default Payment_SearchBar;
