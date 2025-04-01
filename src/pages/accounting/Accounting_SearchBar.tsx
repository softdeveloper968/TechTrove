import React, { useEffect, useState } from "react";
import { ChangeEvent } from "react";
import { useAccountingContext } from "./AccountingContext";
import SingleLineSearch from "components/common/singleLineSearch/SingleLineSearch";

type Accounting__SearchBarProps = {
   activeTab?: string;
};

const Accounting_SearchBar = (props: Accounting__SearchBarProps) => {
   const {
      wallet,
      getAllWallet,
      setAllWallet,
      invoices,
      getInvoices,
      setInvoices,
      transaction,
      getAllTransaction,
      setAllTransaction,
      customerDetails,
      getCustomerDetails,
      setCustomerDetails
   } = useAccountingContext();
   const [searchQuery, setSearchQuery] = useState<string>('');

   useEffect(() => {
      if (props.activeTab === "transaction") {
         setSearchQuery(transaction.searchParam ?? "");
      } else if (props.activeTab === "wallets") {
         setSearchQuery(wallet.searchParam ?? "");
      } else if (props.activeTab === "customers") {
         setSearchQuery(customerDetails.searchParam ?? "");
      } else if (props.activeTab === "invoices") {
         setSearchQuery(invoices.searchParam ?? "");
      }

   }, [transaction.searchParam, wallet.searchParam, customerDetails.searchParam, invoices.searchParam]);

   const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
   };

   const updateAllRecords = () => {
      const trimmedSearchParam = searchQuery.trim();
      // if (trimmedSearchParam) {
      //    if (props.activeTab === "transaction") {
      //       getAllTransaction(1, 100, trimmedSearchParam, transaction.fromDate, transaction.toDate, transaction.companyId?.toString(), transaction.isC2CCard);
      //       setAllTransaction((prevAllTrans) => ({ ...prevAllTrans, searchParam: trimmedSearchParam }));
      //    } else if (props.activeTab === "wallets") {
      //       getAllWallet(1, 100, trimmedSearchParam);
      //       setAllWallet((prevAllWallet) => ({ ...prevAllWallet, searchParam: trimmedSearchParam }));
      //    } else if (props.activeTab === "customers") {
      //       getCustomerDetails(1, 100, trimmedSearchParam);
      //       setCustomerDetails((prevAllCustomers) => ({ ...prevAllCustomers, searchParam: trimmedSearchParam }));
      //    } else if (props.activeTab === "invoices") {
      //       getInvoices(1, 100, trimmedSearchParam);
      //       setInvoices((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
      //    }
      // }
         if (props.activeTab === "transaction") {
            getAllTransaction(1, 100, trimmedSearchParam, transaction.fromDate, transaction.toDate, transaction.companyId?.toString(), transaction.isC2CCard);
            setAllTransaction((prevAllTrans) => ({ ...prevAllTrans, searchParam: trimmedSearchParam }));
         } else if (props.activeTab === "wallets") {
            getAllWallet(1, 100, trimmedSearchParam);
            setAllWallet((prevAllWallet) => ({ ...prevAllWallet, searchParam: trimmedSearchParam }));
         } else if (props.activeTab === "customers") {
            getCustomerDetails(1, 100, trimmedSearchParam);
            setCustomerDetails((prevAllCustomers) => ({ ...prevAllCustomers, searchParam: trimmedSearchParam }));
         } else if (props.activeTab === "invoices") {
            getInvoices(1, 100, trimmedSearchParam);
            setInvoices((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
         }
   };

   const handleSearchIconClick = () => {
      updateAllRecords();
   };

   const handleClearFilters = () => {
      setSearchQuery('');
      if (props.activeTab === "transaction") {
         getAllTransaction(1, 100, '', transaction.fromDate, transaction.toDate, transaction.companyId?.toString(), transaction.isC2CCard);
         setAllTransaction((prevAllTrans) => ({ ...prevAllTrans, searchParam: '' }));
      } else if (props.activeTab === "wallets") {
         getAllWallet(1, 100, '');
         setAllWallet((prevAllWallet) => ({ ...prevAllWallet, searchParam: '' }));
      } else if (props.activeTab === "customers") {
         getCustomerDetails(1, 100, '');
         setCustomerDetails((prevAllCustomers) => ({ ...prevAllCustomers, searchParam: '' }));
      } else if (props.activeTab === "invoices") {
         getInvoices(1, 100, '');
         setInvoices((prev) => ({ ...prev, searchParam: '' }));
      }
   };

   useEffect(() => {
      // Reset search parameters when the component mounts or the active tab changes
      setAllWallet((prevAllWallet) => ({ ...prevAllWallet, searchParam: '' }));
      setAllTransaction((prevAllTrans) => ({ ...prevAllTrans, searchParam: '' }));
      setCustomerDetails((prevAllCustomers) => ({ ...prevAllCustomers, searchParam: '' }));
      setInvoices((prev) => ({ ...prev, searchParam: '' }));

      if (props.activeTab === "transaction") {
         setSearchQuery(transaction.searchParam ?? "");
      } else if (props.activeTab === "wallets") {
         setSearchQuery(wallet.searchParam ?? "");
      } else if (props.activeTab === "customers") {
         setSearchQuery(customerDetails.searchParam ?? "");
      } else if (props.activeTab === "invoices") {
         setSearchQuery(invoices.searchParam ?? "");
      }

   }, [props.activeTab]); // Add activeTab to dependency array

   return (
      <SingleLineSearch
         value={searchQuery}
         handleInputChange={handleInputChange}
         handleSearchIconClick={handleSearchIconClick}
         showClearSearch={props.activeTab === "transaction" ? false : true}
         clearSearchFilters={handleClearFilters}
         clearSearchClasses="bg-[#8e8e8e] hover:bg-[#737171] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded inline-flex gap-x-1.5 items-center mb-1 font-semibold"
      />
   );
};

export default Accounting_SearchBar;
