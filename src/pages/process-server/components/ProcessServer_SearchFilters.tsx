import React, { useEffect, ChangeEvent, useState } from "react";
import DatePicker from "react-datepicker";
import { FaTimes } from "react-icons/fa";
import { UserRole } from "utils/enum";
import { ServiceMethodList } from "utils/constants";
import { useAuth } from "context/AuthContext";
import { useProcessServerContext } from "../ProcessServerContext";
import { ICommonSelectOptions } from "interfaces/common.interface";
import DropdownPresentation from "components/common/dropdown/DropDown";
import ClearFilters from "components/common/button/ClearFilters";

const initialSelectOption: ICommonSelectOptions = { id: '', value: '' };

const ProcessServerSearchFilters = () => {
   const { userRole } = useAuth();
   const {
      processServerCases,
      getProcessServerCases,
      setProcessServerCases,
      setSelectedProcessServerId,
      setSelectedFilteredProcessServerId,
      setBulkRecords,
      allProcessServerUsers,
      isBackClick,
      setIsBackClick,
      serviceDateRange,
      setServiceDateRange
   } = useProcessServerContext();

   const [serverNameOptions, setServerNameOptions] = useState<ICommonSelectOptions[]>([]);
   const [selectedServerName, setSelectedServerName] = useState<ICommonSelectOptions>(initialSelectOption);
   const [selectedServiceMethod, setSelectedServiceMethod] = useState<ICommonSelectOptions>(initialSelectOption);
   const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([null, null]);

   useEffect(() => {
      const options = getServerNameOptions(allProcessServerUsers);
      setServerNameOptions(options);

  }, [allProcessServerUsers]);
  useEffect(() => {
   if(isBackClick)
   {
   setSelectedServerName({ id: processServerCases.serverName ?? "", value: processServerCases.serverName ?? "" });
   setSelectedServiceMethod({ id: processServerCases.serviceMethod ?? "", value: processServerCases.serviceMethod ?? "" });
   setDateRange([serviceDateRange[0],serviceDateRange[1]])
   }
}, [isBackClick]);

   const getServerNameOptions = (users: typeof allProcessServerUsers): ICommonSelectOptions[] => {
      // return users.map(item => {
      //     const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim();
      //     const displayValue = fullName || item.email;
      //     return {
      //         id: displayValue,
      //         value: displayValue,
      //     };
      // });
      var list = users.map(item => {
         const fullName = `${item.firstName || ''} ${item.lastName || ''}`.trim();
         const displayValue = fullName || item.email;
         return {
             id: displayValue,
             value: displayValue,
         };
     });
     var sorted = list.sort((a, b) => a.value.localeCompare(b.value));

     return sorted;
  };

   const handleServerNameChange = (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value as string;
      setSelectedServerName({ id: value, value: value });
      setSelectedProcessServerId([]);
      setSelectedFilteredProcessServerId([]);
      setBulkRecords([]);
      getProcessServerCases(
         1,
         100,
         processServerCases.searchParam,
         value,
         processServerCases.serviceMethod,
         processServerCases.dateRange
      );
      setProcessServerCases((prev) => ({
         ...prev,
         serverName: value
      }));
   };

   const handleServiceMethodChange = (event: ChangeEvent<HTMLSelectElement>) => {
      const value = event.target.value as string;
      setSelectedServiceMethod({ id: value, value: value });
      setSelectedProcessServerId([]);
      setSelectedFilteredProcessServerId([]);
      setBulkRecords([]);
      getProcessServerCases(
         1,
         100,
         processServerCases.searchParam,
         processServerCases.serverName,
         value,
         processServerCases.dateRange
      );
      setProcessServerCases((prev) => ({
         ...prev,
         serviceMethod: value
      }));
   };

   const handleDateRangeChange = (fromDate: Date | null, toDate: Date | null) => {
      setServiceDateRange([fromDate,toDate]);
      setSelectedProcessServerId([]);
      setSelectedFilteredProcessServerId([]);
      setBulkRecords([]);
      if (fromDate instanceof Date && toDate instanceof Date) {
         const formattedDateRange = `${fromDate.toISOString()}/${toDate.toISOString()}`;

         getProcessServerCases(
            1,
            100,
            processServerCases.searchParam,
            processServerCases.serverName,
            processServerCases.serviceMethod,
            formattedDateRange
         );

         setProcessServerCases((prev) => ({
            ...prev,
            dateRange: formattedDateRange
         }));
      }
       else if (fromDate == null && toDate == null) {
         getProcessServerCases(
            1,
            100,
            processServerCases.searchParam,
            processServerCases.serverName,
            processServerCases.serviceMethod
         );

         setProcessServerCases((prev) => ({
            ...prev,
            dateRange: ""
         }));
       }
   };

   const handleClearFilters = () => {
      setSelectedServerName(initialSelectOption);
      setSelectedServiceMethod(initialSelectOption);
      setDateRange([null, null]);
      setServiceDateRange([null,null]);
      setSelectedProcessServerId([]);
      setSelectedFilteredProcessServerId([]);
      setBulkRecords([]);
      // getProcessServerCases(1, 100);
      // setProcessServerCases((prev) => ({
      //    ...prev,
      //    searchParam: "",
      //    serverName: "",
      //    serviceMethod: "",
      //    dateRange: ""
      // }));
      getProcessServerCases(1, 100, "");
      setProcessServerCases((prev) => ({
         ...prev,
         searchParam: "",
         serverName: "",
         serviceMethod: "",
         dateRange: "",
         sortings: []
      }));
   };

   return (
      <>
         {!userRole.includes(UserRole.Viewer) ?
            <div className="flex items-center filterSec">
               <DropdownPresentation
                  heading={""}
                  selectedOption={selectedServerName}
                  handleSelect={(event) => handleServerNameChange(event)}
                  options={serverNameOptions}
                  placeholder="Filter by Server Name"
               />
               <DropdownPresentation
                  heading=""
                  selectedOption={selectedServiceMethod}
                  handleSelect={(event) => handleServiceMethodChange(event)}
                  options={ServiceMethodList}
                  placeholder="Filter by Service Method"
               />
               <div className="md:mr-2">
                  <DatePicker
                     className="bg-calendar peer !placeholder-gray-500 outline-none p-3 !pr-8 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_right_10px]"
                     selectsRange={true}
                     startDate={dateRange[0]}
                     endDate={dateRange[1]}
                     onChange={(newDate: any) => {
                        setDateRange(newDate);
                        handleDateRangeChange(newDate[0], newDate[1]);
                     }}
                     maxDate={new Date()}
                     // placeholderText={"Filter by Date Range"}
                     placeholderText={"Filter by Service Date"}

                  />
               </div>
               <ClearFilters
                  type="button"
                  isRounded={false}
                  title="Clear Filters"
                  handleClick={handleClearFilters}
                  icon={<FaTimes />}
               />
            </div>
            : null}
      </>
   );
};

export default ProcessServerSearchFilters;