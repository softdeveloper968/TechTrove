import React, { useEffect, useState } from "react";
import { ChangeEvent } from "react";
import { FaTimes } from "react-icons/fa";
import { TaskActionList, TaskStatusList } from "utils/constants";
import { ISelectOptions, ISearchSelectOptions } from "interfaces/all-cases.interface";
import DropdownPresentation from "components/common/dropdown/DropDown";
import ClearFilters from "components/common/button/ClearFilters";
import { useEvictionQueueContext } from "../EvictionQueueContext";

const initialSelectOption: ISelectOptions = { id: '', value: '' };

const AllTask_SearchFilters = () => {
   const [selectedCompany, setSelectedCompany] = useState<ISelectOptions>(initialSelectOption);
   const [selectedType, setSelectedType] = useState<ISelectOptions>(initialSelectOption);
   const [selectedStatus, setSeletedStatus] = useState<ISelectOptions>(initialSelectOption);
   const [selectedCounty, setSelectedCounty] = useState<ISelectOptions>(initialSelectOption);
   const [companyList, setCompanyList] = useState<ISelectOptions[]>([]);
   const {
      evictionQueue1Tasks,
      setEvictionQueue1Tasks,
      evictionQueue2Tasks,
      setEvictionQueue2Tasks,
      evictionQueue3Tasks,
      setEvictionQueue3Tasks,
      evictionQueue4Tasks,
      setEvictionQueue4Tasks,
      evictionQueue5Tasks,
      setEvictionQueue5Tasks,
      getEvictionQueueTasks,
      selectEvictionQueueId,
      allCounties,
      allCompanies,
      setBulkRecords,
      setSelectedEvictionId,
   } = useEvictionQueueContext();

   const [countyList, setCountyList] = useState<ISelectOptions[]>([]);
   useEffect(() => {
      setSelectedCompany(initialSelectOption );
      setSeletedStatus(initialSelectOption );
      setSelectedCounty(initialSelectOption );
      setSelectedType(initialSelectOption );

      switch(selectEvictionQueueId){
         case 1:
            setEvictionQueue1Tasks((p) => ({
               ...p,
               status: 0,
               actiontype: 0,
               county: "",
               company: ""
            }))
            break;
            case 2:
            setEvictionQueue2Tasks((p) => ({
               ...p,
               status: 0,
               actiontype: 0,
               county: "",
               company: ""
            }))
            break;
            case 3:
            setEvictionQueue3Tasks((p) => ({
               ...p,
               status: 0,
               actiontype: 0,
               county: "",
               company: ""
            }))
            break;
            case 4:
            setEvictionQueue4Tasks((p) => ({
               ...p,
               status: 0,
               actiontype: 0,
               county: "",
               company: ""
            }))
            break;
            case 5:
            setEvictionQueue5Tasks((p) => ({
               ...p,
               status: 0,
               actiontype: 0,
               county: "",
               company: ""
            }))
            break;
      }
   }, [selectEvictionQueueId]);

   const updateTask = (type: number, status: number, county: string, company: string, searchParam: string) => {
      if (selectEvictionQueueId !== 0) {
         switch(selectEvictionQueueId){
            case 1:
               setEvictionQueue1Tasks(prevLogs => ({
                  ...prevLogs,
                  searchParam: searchParam,
                  actiontype: type,
                  status: status,
                  county: county,
                  company: company
               }));
               break;
               case 2:
               setEvictionQueue2Tasks(prevLogs => ({
                  ...prevLogs,
                  searchParam: searchParam,
                  actiontype: type,
                  status: status,
                  county: county,
                  company: company
               }));
               break;
               case 3:
               setEvictionQueue3Tasks(prevLogs => ({
                  ...prevLogs,
                  searchParam: searchParam,
                  actiontype: type,
                  status: status,
                  county: county,
                  company: company
               }));
               break;
               case 4:
               setEvictionQueue4Tasks(prevLogs => ({
                  ...prevLogs,
                  searchParam: searchParam,
                  actiontype: type,
                  status: status,
                  county: county,
                  company: company
               }));
               break;
               case 5:
               setEvictionQueue5Tasks(prevLogs => ({
                  ...prevLogs,
                  searchParam: searchParam,
                  actiontype: type,
                  status: status,
                  county: county,
                  company: company
               }));
               break;
         }
         getEvictionQueueTasks(1, 100, selectEvictionQueueId, type, status, "", county, company);
      }
   };

   useEffect(() => {
      const userInfo= JSON.parse(localStorage.getItem("userDetail")??"")
    const clientID = (`${userInfo?.ClientID}`).toLowerCase();
      // var companyList = allCompanies.filter(x => x.companyName != "Super Company").map((item) => ({
      //    id: item.id,
      //    value: item.companyName
      // }));
      var companyList = allCompanies.filter(x => x.id.toLowerCase() != clientID).map((item) => ({
         id: item.id,
         value: item.companyName
      }));
      setCompanyList(companyList);
      var list = allCounties
         .filter((item) => item.countyName.toLowerCase() !== "cobb")
         .map((item) => ({
            id: item.countyName,
            value: item.countyName
         }));

      setCountyList(list);

   }, [allCounties, allCompanies]);

   const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
      setBulkRecords([]);
      setSelectedEvictionId([]);
      const selectedTypeId = parseInt(event.target.value, 10) || 0;
      setSelectedType({ id: selectedTypeId.toString(), value: TaskActionList.find(x => x.id === selectedTypeId)?.value || '' });
      switch(selectEvictionQueueId){
         case 1:
            updateTask(
               selectedTypeId,
               selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               selectedCounty.id as string,
               selectedCompany.id as string,
               evictionQueue1Tasks.searchParam ?? ''
            );
            setEvictionQueue1Tasks((p) => ({
               ...p,
               status: selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               actiontype: selectedTypeId,
               county: selectedCounty.id as string,
               company: selectedCompany.id as string
            }))
            break;
            case 2:
            updateTask(
               selectedTypeId,
               selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               selectedCounty.id as string,
               selectedCompany.id as string,
               evictionQueue2Tasks.searchParam ?? ''
            );
            setEvictionQueue2Tasks((p) => ({
               ...p,
               status: selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               actiontype: selectedTypeId,
               county: selectedCounty.id as string,
               company: selectedCompany.id as string
            }))
            break;
            case 3:
            updateTask(
               selectedTypeId,
               selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               selectedCounty.id as string,
               selectedCompany.id as string,
               evictionQueue3Tasks.searchParam ?? ''
            );
            setEvictionQueue3Tasks((p) => ({
               ...p,
               status: selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               actiontype: selectedTypeId,
               county: selectedCounty.id as string,
               company: selectedCompany.id as string
            }))
            break;
            case 4:
            updateTask(
               selectedTypeId,
               selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               selectedCounty.id as string,
               selectedCompany.id as string,
               evictionQueue4Tasks.searchParam ?? ''
            );
            setEvictionQueue4Tasks((p) => ({
               ...p,
               status: selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               actiontype: selectedTypeId,
               county: selectedCounty.id as string,
               company: selectedCompany.id as string
            }))
            break;
            case 5:
            updateTask(
               selectedTypeId,
               selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               selectedCounty.id as string,
               selectedCompany.id as string,
               evictionQueue5Tasks.searchParam ?? ''
            );
            setEvictionQueue5Tasks((p) => ({
               ...p,
               status: selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               actiontype: selectedTypeId,
               county: selectedCounty.id as string,
               company: selectedCompany.id as string
            }))
            break;
      }
   };

   const [selectedOption, setSelectedOption] = useState<ISearchSelectOptions | null>();

   const handleCountyChange = (event: ChangeEvent<HTMLSelectElement>) => {
      setBulkRecords([]);
      setSelectedEvictionId([]);
      setSelectedOption(null);
      setSelectedCounty({ id: event.target.value, value: event.target.value });
      // if(event.target.value)      {
      switch(selectEvictionQueueId){
         case 1:
            updateTask(
               selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
               selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               event.target.value,
               selectedCompany.id as string,
               evictionQueue1Tasks.searchParam ?? ''
            );
            break;
            case 2:
            updateTask(
               selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
               selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               event.target.value,
               selectedCompany.id as string,
               evictionQueue2Tasks.searchParam ?? ''
            );
            break;
            case 3:
            updateTask(
               selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
               selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               event.target.value,
               selectedCompany.id as string,
               evictionQueue3Tasks.searchParam ?? ''
            );
            break;
            case 4:
            updateTask(
               selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
               selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               event.target.value,
               selectedCompany.id as string,
               evictionQueue4Tasks.searchParam ?? ''
            );
            break;
            case 5:
               updateTask(
                  selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
                  selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
                  event.target.value,
                  selectedCompany.id as string,
                  evictionQueue5Tasks.searchParam ?? ''
               );
               break;
      }
      // } 
   };

   const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
      setBulkRecords([]);
      setSelectedEvictionId([]);
      const selectedStatusId = parseInt(event.target.value, 10) || 0;
      setSeletedStatus({ id: selectedStatusId.toString(), value: TaskStatusList.find(x => x.id === selectedStatusId)?.value || '' });
      switch(selectEvictionQueueId){
         case 1:
            updateTask(
               selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
               selectedStatusId,
               selectedCounty.id as string,
               selectedCompany.id as string,
               evictionQueue1Tasks.searchParam ?? ''
            );
            setEvictionQueue1Tasks((p) => ({
               ...p,
               status: selectedStatusId,
               actiontype: selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
               county: selectedCounty.id as string,
               company: selectedCompany.id as string
            }))
            break;
            case 2:
               updateTask(
                  selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
                  selectedStatusId,
                  selectedCounty.id as string,
                  selectedCompany.id as string,
                  evictionQueue2Tasks.searchParam ?? ''
               );
               setEvictionQueue2Tasks((p) => ({
                  ...p,
                  status: selectedStatusId,
                  actiontype: selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
                  county: selectedCounty.id as string,
                  company: selectedCompany.id as string
               }))
               break;
               case 3:
                  updateTask(
                     selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
                     selectedStatusId,
                     selectedCounty.id as string,
                     selectedCompany.id as string,
                     evictionQueue3Tasks.searchParam ?? ''
                  );
                  setEvictionQueue3Tasks((p) => ({
                     ...p,
                     status: selectedStatusId,
                     actiontype: selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
                     county: selectedCounty.id as string,
                     company: selectedCompany.id as string
                  }))
                  break;
                  case 4:
                     updateTask(
                        selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
                        selectedStatusId,
                        selectedCounty.id as string,
                        selectedCompany.id as string,
                        evictionQueue4Tasks.searchParam ?? ''
                     );
                     setEvictionQueue4Tasks((p) => ({
                        ...p,
                        status: selectedStatusId,
                        actiontype: selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
                        county: selectedCounty.id as string,
                        company: selectedCompany.id as string
                     }))
                     break;
                     case 5:
                     updateTask(
                        selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
                        selectedStatusId,
                        selectedCounty.id as string,
                        selectedCompany.id as string,
                        evictionQueue5Tasks.searchParam ?? ''
                     );
                     setEvictionQueue5Tasks((p) => ({
                        ...p,
                        status: selectedStatusId,
                        actiontype: selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
                        county: selectedCounty.id as string,
                        company: selectedCompany.id as string
                     }))
                     break;
      }
   };

   const handleCompanyChange = (event: ChangeEvent<HTMLSelectElement>) => {
      setBulkRecords([]);
      setSelectedEvictionId([]);
      const selectedCompanyId = event.target.value;
      setSelectedCompany({ id: event.target.value, value: companyList.find(x => x.id === event.target.value)?.value || '' });
      switch(selectEvictionQueueId){
         case 1:
            updateTask(
               selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
               selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               selectedCounty.id as string,
               event.target.value as string,
               evictionQueue1Tasks.searchParam ?? ''
            );
            setEvictionQueue1Tasks((p) => ({
               ...p,
               status: selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               actiontype: selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
               county: selectedCounty.id as string,
               company: selectedCompanyId
            }))
            break;
            case 2:
            updateTask(
               selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
               selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               selectedCounty.id as string,
               event.target.value as string,
               evictionQueue2Tasks.searchParam ?? ''
            );
            setEvictionQueue2Tasks((p) => ({
               ...p,
               status: selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               actiontype: selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
               county: selectedCounty.id as string,
               company: selectedCompanyId
            }))
            break;
            case 3:
            updateTask(
               selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
               selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               selectedCounty.id as string,
               event.target.value as string,
               evictionQueue3Tasks.searchParam ?? ''
            );
            setEvictionQueue3Tasks((p) => ({
               ...p,
               status: selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               actiontype: selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
               county: selectedCounty.id as string,
               company: selectedCompanyId
            }))
            break;
            case 4:
            updateTask(
               selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
               selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               selectedCounty.id as string,
               event.target.value as string,
               evictionQueue4Tasks.searchParam ?? ''
            );
            setEvictionQueue4Tasks((p) => ({
               ...p,
               status: selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               actiontype: selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
               county: selectedCounty.id as string,
               company: selectedCompanyId
            }))
            break;
            case 5:
            updateTask(
               selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
               selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               selectedCounty.id as string,
               event.target.value as string,
               evictionQueue5Tasks.searchParam ?? ''
            );
            setEvictionQueue5Tasks((p) => ({
               ...p,
               status: selectedStatus.id ? parseInt(selectedStatus.id.toString(), 10) : 0,
               actiontype: selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
               county: selectedCounty.id as string,
               company: selectedCompanyId
            }))
            break;
      }
   };

   const clearSearchFilters = () => {
      setBulkRecords([]);
      setSelectedEvictionId([]);
      setSelectedType(initialSelectOption);
      setSeletedStatus(initialSelectOption);
      setSelectedCounty(initialSelectOption);
      setSelectedCompany(initialSelectOption);
      setSelectedOption(null);
      updateTask(0, 0, '', '', '');
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
         <div className="relative ">
            {selectEvictionQueueId !== 1 && <DropdownPresentation
               heading=""
               selectedOption={selectedCounty}
               handleSelect={handleCountyChange}
               options={countyList}
               placeholder="Select County"
            />}
         </div>
         {selectEvictionQueueId !== 4 && 
            <DropdownPresentation
               heading=""
               selectedOption={selectedStatus}
               handleSelect={handleStatusChange}
               options={selectEvictionQueueId == 1 ?
                  TaskStatusList.filter(x => x.value != "Tyler Error" && x.value != "System Error" && x.value != "Receipted" && x.value != "Correction" && x.value != "Denied" && x.value != "Granted" && x.value != "Moot" && x.value != "Under-Review" && x.value != "Reviewed" && x.value != "Deferred" && x.value != "Failed") :
                  TaskStatusList.filter(x => x.value != "Error")}
               placeholder="Filter by status"
            />
         }
         <DropdownPresentation
            heading=""
            selectedOption={selectedType}
            handleSelect={handleTypeChange}
            options={TaskActionList}
            placeholder="Filter by action type"
         />
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

export default AllTask_SearchFilters;