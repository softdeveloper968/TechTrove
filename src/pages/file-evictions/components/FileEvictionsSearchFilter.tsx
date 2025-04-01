import React, { useState, useEffect } from "react";
import { ChangeEvent } from "react";
import { FaTimes } from "react-icons/fa";
import { ISelectOptions } from "interfaces/all-cases.interface";
import DropdownPresentation from "components/common/dropdown/DropDown";
import ClearFilters from "components/common/button/ClearFilters";
import "react-datepicker/dist/react-datepicker.css";
import { useFileEvictionsContext } from "../FileEvictionsContext";

const initialSelectOption: ISelectOptions = { id: '', value: '' };
type FileEvictionsSearchFilterProps = {
   activeTab?: string;
};
const FileEvictionsSearchFilter = (props: FileEvictionsSearchFilterProps) => {
   const [selectedCompany, setSelectedCompany] = useState<ISelectOptions>(initialSelectOption);
   const {
      allCompanies,
      getAllCompanies,
      getFileEvictions,
      getEvictionAutomationApprovalsQueue,
      setSelectedFileEvictionId,
      setSelectedEvictionApprovalId,
      setBulkRecords,
      fileEvictions,
      setFileEvictions,
      evictionAutomationApprovalsQueue,
      setEvictionAutomationApprovalsQueue
   } = useFileEvictionsContext();
   const [companyList, setCompanyList] = useState<ISelectOptions[]>([]);

   useEffect(() => {
      getAllCompanies();
   }, [])

   useEffect(() => {
      var companyList = allCompanies.map((item) => ({
         id: item.id,
         value: item.companyName
      }));
      // var newList = companyList.filter((item) => item.value != "Super Company");

          const userInfo= JSON.parse(localStorage.getItem("userDetail")??"")
          const clientID = (`${userInfo?.ClientID}`).toLowerCase();
            var newList = companyList.filter((item) => item.id.toLowerCase() != clientID);

      setCompanyList(newList);
   }, [allCompanies]);

   const clearSearchFilters = () => {
      
      setSelectedFileEvictionId([]);
      setSelectedEvictionApprovalId([]);
      setBulkRecords([]);
      setSelectedCompany(initialSelectOption);
      if (props.activeTab === "Ready to Sign") {
         getFileEvictions(1, 100, fileEvictions.isViewAll ?? true, "", "");
         setFileEvictions(prev => ({...prev, searchParam: "",companyId: ""}));
      }
      else {
         getEvictionAutomationApprovalsQueue(1, 100, false, true, "", "");
         setEvictionAutomationApprovalsQueue(prev => ({...prev, searchParam: ""}));
      }
   };

   const handleCompanyChange = async (event: ChangeEvent<HTMLSelectElement>) => {
      setSelectedFileEvictionId([]);
      setSelectedEvictionApprovalId([]);
      setBulkRecords([]);
      setSelectedCompany({ id: event.target.value, value: companyList.find(x => x.id === event.target.value)?.value || '' });
      if (props.activeTab == "Ready to Sign")
      {
         getFileEvictions(1, 100, fileEvictions.isViewAll ?? true, fileEvictions.searchParam, event.target.value.toString());
         setFileEvictions(prev => ({...prev, companyId: event.target.value.toString()}));
      }

      else
         getEvictionAutomationApprovalsQueue(1, 100, false, true, evictionAutomationApprovalsQueue.searchParam, event.target.value.toString())
   };

   return (
      <div className="flex items-end filterSec logsFilter">
         <div className="relative ">
            <DropdownPresentation
               heading=""
               selectedOption={selectedCompany}
               handleSelect={handleCompanyChange}
               options={companyList}
               placeholder="Select Company"
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

export default FileEvictionsSearchFilter;
