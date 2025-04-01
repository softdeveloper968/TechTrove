import React, { useEffect, useState } from "react";
import { ChangeEvent } from "react";
import DatePicker from "react-datepicker";
import { FaTimes } from "react-icons/fa";
import DropdownPresentation from "components/common/dropdown/DropDown";
import ClearFilters from "components/common/button/ClearFilters";
import { PaymentAccount } from "utils/constants";
import { ISelectOptions } from "interfaces/all-cases.interface";
import { useAccountingContext } from "./AccountingContext";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "context/AuthContext";
import { UserRole } from "utils/enum";

const initialSelectOption: ISelectOptions = { id: '', value: '' };

const Accounting_SearchFilters = () => {
   const [selectedAccount, setSelectedAccount] = useState<ISelectOptions>(initialSelectOption);
   const [selectedCompany, setSelectedCompany] = useState<ISelectOptions>(initialSelectOption);
   const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
   const { transaction, setAllTransaction, getAllTransaction, allCompanies } = useAccountingContext();
   const [companyList, setCompanyList] = useState<ISelectOptions[]>([]);

   const updateTransactions = (fromDate: Date | null, toDate: Date | null, companyId: string, isC2CCard: boolean | null, searchParam: string) => {
      setAllTransaction(prevTrans => ({...prevTrans, searchParam, fromDate, toDate, companyId, isC2CCard}));
      getAllTransaction(1, 100, searchParam, fromDate, toDate, companyId, isC2CCard);
   };

   const {userRole}=useAuth();
   useEffect(() => {
      var list = allCompanies.map((item) => ({
         id: item.id,
         value: item.companyName
      }));
      setCompanyList(list);
   }, [allCompanies]);

   const handleAccountChange = (event: ChangeEvent<HTMLSelectElement>) => {
      const selectedAccount = parseInt(event.target.value, 10) || 0;
      setSelectedAccount({ id: selectedAccount, value: PaymentAccount.find(x => x.id === selectedAccount)?.value || '' });
      updateTransactions(dateRange[0], dateRange[1], selectedCompany.id.toString(), selectedAccount === 1, transaction.searchParam ?? "")
   };
   const handleCompanyChange = (event: ChangeEvent<HTMLSelectElement>) => {

      setSelectedCompany({ id: event.target.value, value: companyList.find(x => x.id === event.target.value)?.value || '' });
      if (event.target.value) {
         var account = selectedAccount.id === "" ? null : selectedAccount.id == 1;
         updateTransactions(dateRange[0], dateRange[1], event.target.value.toString(), account, transaction.searchParam ?? "")
      }
   };

   const clearSearchFilters = () => {
      setSelectedAccount(initialSelectOption);
      setSelectedCompany(initialSelectOption);
      setDateRange([null, null]);
      updateTransactions(null, null, "", null, "");
   };

   return (
      <div className="flex items-end filterSec logsFilter">
         {(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)) && 
          <div className="relative ">
          <DropdownPresentation
             heading=""
             selectedOption={selectedCompany}
             handleSelect={handleCompanyChange}
             options={companyList}
             placeholder="Select Company"
          />
       </div>
         }        
         <DropdownPresentation
            heading=""
            selectedOption={selectedAccount}
            handleSelect={handleAccountChange}
            options={PaymentAccount}
            placeholder="Select PaymentAccount"
         />

         <div className="md:mr-2">
            {/* <div><span className="text-xs sm:text-sm block">Select date range</span></div> */}
            <DatePicker
               className="bg-calendar peer placeholder-gray-500 outline-none p-3 !pr-8 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none     bg-no-repeat bg-[center_right_10px]"
               selectsRange={true}
               startDate={dateRange[0]}
               endDate={dateRange[1]}
               onChange={(update: any) => {
                  setDateRange(update);
                  var account = selectedAccount.id === "" ? null : selectedAccount.id == 1;
                  updateTransactions(update[0], update[1], selectedCompany.id.toString(), account, transaction.searchParam ?? "")
                  //updateTransactions(selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0, selectedEvent.id ? parseInt(selectedEvent.id.toString(), 10) : 0, update[0], update[1],selectedUserId,selectedCompany.id as string);
               }}
               maxDate={new Date()}
               placeholderText={"Select DateRange"}
            />
         </div>
         <div>
            <ClearFilters
               type="button"
               isRounded={false}
               title="Clear Filters"
               handleClick={clearSearchFilters}
               icon={<FaTimes />}
            />
         </div>
      </div>
   );
};

export default Accounting_SearchFilters;
