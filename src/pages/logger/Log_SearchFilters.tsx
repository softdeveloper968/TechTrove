import React, { useEffect, useState } from "react";
import { ChangeEvent } from "react";
import DatePicker from "react-datepicker";
import { FaTimes } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import Select from 'react-select';
import { EventList, TypeList } from "utils/constants";
import { ISelectOptions, ISearchSelectOptions } from "interfaces/all-cases.interface";
import DropdownPresentation from "components/common/dropdown/DropDown";
import ClearFilters from "components/common/button/ClearFilters";
import { useLogsContext } from "./LogsContext";

const initialSelectOption: ISelectOptions = { id: '', value: '' };

const Logger_SearchFilters = () => {
   const [selectedType, setSelectedType] = useState<ISelectOptions>(initialSelectOption);
   const [selectedEvent, setSelectedEvent] = useState<ISelectOptions>(initialSelectOption);
   const [selectedCompany, setSelectedCompany] = useState<ISelectOptions>(initialSelectOption);
   const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);
   const [userslist, setUserslist] = useState<ISearchSelectOptions[]>([]);
   const { logs, setLogs, getLogs, getUsers, users, setUsers, allCompanies } = useLogsContext();
   const [companyList, setCompanyList] = useState<ISelectOptions[]>([]);

   const updateLogs = (type: number, event: number, fromDate: Date | null, toDate: Date | null, userId: string, companyId: string, searchParam: string) => {
      setLogs(prevLogs => ({
         ...prevLogs,
         searchParam,
         type,
         event,
         fromDate,
         toDate,
         userId,
         companyId
      }));

      getLogs(
         1,
         100,
         searchParam,
         event,
         type,
         fromDate,
         toDate,
         userId,
         companyId
      );
   };

   useEffect(() => {
      var data = users?.map(user => ({
         value: user.id ?? "",
         label: `${user.firstName} ${user.lastName} ${user.email ? `(${user.email})` : ""}`
      }));

      if (data) {
         data.sort((a, b) => a.label.localeCompare(b.label));
      }
      setUserslist(data);
   }, [users]);

   useEffect(() => {
      var list = allCompanies.map((item) => ({
         id: item.id,
         value: item.companyName
      }));
      setCompanyList(list);
   }, [allCompanies]);

   const handleEventChange = (event: ChangeEvent<HTMLSelectElement>) => {
      const selectedEventId = parseInt(event.target.value, 10) || 0;
      setSelectedEvent({ id: selectedEventId.toString(), value: EventList.find(x => x.id === selectedEventId)?.value || '' });
      updateLogs(
         selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
         selectedEventId,
         dateRange[0],
         dateRange[1],
         logs.userId ?? "",
         selectedCompany.id as string,
         logs.searchParam ?? ''
      );
   };

   const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
      const selectedTypeId = parseInt(event.target.value, 10) || 0;
      setSelectedType({ id: selectedTypeId.toString(), value: TypeList.find(x => x.id === selectedTypeId)?.value || '' });
      updateLogs(
         selectedTypeId,
         selectedEvent.id ? parseInt(selectedEvent.id.toString(), 10) : 0,
         dateRange[0],
         dateRange[1],
         logs.userId ?? "",
         selectedCompany.id as string,
         logs.searchParam ?? ''
      );
   };

   const handleCompanyChange = (event: ChangeEvent<HTMLSelectElement>) => {
      setSelectedOption(null);
      setSelectedCompany({ id: event.target.value, value: companyList.find(x => x.id === event.target.value)?.value || '' });
      // if(event.target.value)      {
      updateLogs(
         selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
         selectedEvent.id ? parseInt(selectedEvent.id.toString(), 10) : 0,
         dateRange[0],
         dateRange[1],
         logs.userId ?? "",
         event.target.value,
         logs.searchParam ?? ''
      );
      getUsers("", event.target.value);
      // } 
   };

   const clearSearchFilters = () => {
      setSelectedOption(null);
      setSelectedType(initialSelectOption);
      setSelectedEvent(initialSelectOption);
      setSelectedCompany(initialSelectOption);
      setDateRange([null, null]);
      updateLogs(0, 0, null, null, "", "", "");
      getUsers("", "");
   };

   const [selectedOption, setSelectedOption] = useState<ISearchSelectOptions | null>();

   const handleChange = (selectedOption: any) => {
      setSelectedOption(selectedOption);
      // setselectedUserId(selectedEvent.id.toString());
      updateLogs(
         selectedType.id ? parseInt(selectedEvent.id.toString(), 10) : 0,
         selectedEvent.id ? parseInt(selectedEvent.id.toString(), 10) : 0,
         dateRange[0],
         dateRange[1],
         selectedOption.value ?? "",
         selectedCompany.id as string,
         logs.searchParam ?? ''
      );
   };

   const handleInputChange = (inputValue: string) => {
      getUsers(inputValue, selectedCompany.id as string);
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
         <div className="z-[11] mr-2 w-245">
            <Select className="custom-select"
               value={selectedOption}
               onChange={handleChange}
               onInputChange={handleInputChange}
               options={userslist}
               isSearchable={true}
               placeholder="Search users"
            />
         </div>
         <DropdownPresentation
            heading=""
            selectedOption={selectedEvent}
            handleSelect={handleEventChange}
            options={EventList}
            placeholder="Filter by Event"
         />
         <DropdownPresentation
            heading=""
            selectedOption={selectedType}
            handleSelect={handleTypeChange}
            options={TypeList}
            placeholder="Filter by type"
         />
         <div className="md:mr-2">
            {/* <div><span className="text-xs sm:text-sm block">Select date range</span></div> */}
            <DatePicker
               className="bg-calendar peer !placeholder-gray-500 outline-none p-3 !pr-8 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_right_10px]"
               selectsRange={true}
               startDate={dateRange[0]}
               endDate={dateRange[1]}
               onChange={(update: any) => {
                  setDateRange(update);
                  updateLogs(
                     selectedType.id ? parseInt(selectedType.id.toString(), 10) : 0,
                     selectedEvent.id ? parseInt(selectedEvent.id.toString(), 10) : 0,
                     update[0],
                     update[1],
                     logs.userId ?? "",
                     selectedCompany.id as string,
                     logs.searchParam ?? ''
                  );
               }}
               maxDate={new Date()}
               placeholderText={"Select date range"}
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

export default Logger_SearchFilters;
