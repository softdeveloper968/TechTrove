import React, { useEffect, useState } from "react";
import { ChangeEvent } from "react";
import { useEvictionQueueContext } from "../EvictionQueueContext";
import SingleLineSearch from "components/common/singleLineSearch/SingleLineSearch";

const EvictionQueueTask_SearchBar = () => {
   const [searchQuery, setSearchQuery] = useState<string>('');
   const {
      selectEvictionQueueId,
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
      getEvictionQueueTasks
   } = useEvictionQueueContext();

   useEffect(() => {
      switch(selectEvictionQueueId){
         case 1:
            setSearchQuery(evictionQueue1Tasks.searchParam ?? "");
            break;
            case 2:
            setSearchQuery(evictionQueue2Tasks.searchParam ?? "");
            break;
            case 3:
            setSearchQuery(evictionQueue3Tasks.searchParam ?? "");
            break;
            case 4:
            setSearchQuery(evictionQueue4Tasks.searchParam ?? "");
            break;
            case 5:
            setSearchQuery(evictionQueue5Tasks.searchParam ?? "");
            break;
      }
     

   }, [evictionQueue1Tasks.searchParam,evictionQueue2Tasks.searchParam,evictionQueue3Tasks.searchParam,evictionQueue4Tasks.searchParam,evictionQueue5Tasks.searchParam]);

   // Handle input change for search query
   const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
   };

   // Function to update eviction queue tasks based on the search query
   const updateAllTasks = () => {
      const trimmedSearchParam = searchQuery.trim();
      if (selectEvictionQueueId !== 0) {
         switch(selectEvictionQueueId){
            case 1:
               getEvictionQueueTasks(
                  1, // pageNumber
                  100, // pageSize
                  selectEvictionQueueId,
                  evictionQueue1Tasks.actiontype ?? 0,
                  evictionQueue1Tasks.status ?? 0,
                  trimmedSearchParam,
                  evictionQueue1Tasks.county,
                  evictionQueue1Tasks.company
               );
               setEvictionQueue1Tasks((prevAllLog) => ({
                  ...prevAllLog,
                  searchParam: trimmedSearchParam
               }));
               break;
               case 2:
                  getEvictionQueueTasks(
                     1, // pageNumber
                     100, // pageSize
                     selectEvictionQueueId,
                     evictionQueue2Tasks.actiontype ?? 0,
                     evictionQueue2Tasks.status ?? 0,
                     trimmedSearchParam,
                     evictionQueue2Tasks.county,
                     evictionQueue2Tasks.company
                  );
                  setEvictionQueue2Tasks((prevAllLog) => ({
                     ...prevAllLog,
                     searchParam: trimmedSearchParam
                  }));
                  break;
                  case 3:
                     getEvictionQueueTasks(
                        1, // pageNumber
                        100, // pageSize
                        selectEvictionQueueId,
                        evictionQueue3Tasks.actiontype ?? 0,
                        evictionQueue3Tasks.status ?? 0,
                        trimmedSearchParam,
                        evictionQueue3Tasks.county,
                        evictionQueue3Tasks.company
                     );
                     setEvictionQueue3Tasks((prevAllLog) => ({
                        ...prevAllLog,
                        searchParam: trimmedSearchParam
                     }));
                     break;
                     case 4:
                        getEvictionQueueTasks(
                           1, // pageNumber
                           100, // pageSize
                           selectEvictionQueueId,
                           evictionQueue4Tasks.actiontype ?? 0,
                           evictionQueue4Tasks.status ?? 0,
                           trimmedSearchParam,
                           evictionQueue4Tasks.county,
                           evictionQueue4Tasks.company
                        );
                        setEvictionQueue4Tasks((prevAllLog) => ({
                           ...prevAllLog,
                           searchParam: trimmedSearchParam
                        }));
                        break;
                        case 5:
                        getEvictionQueueTasks(
                           1, // pageNumber
                           100, // pageSize
                           selectEvictionQueueId,
                           evictionQueue5Tasks.actiontype ?? 0,
                           evictionQueue5Tasks.status ?? 0,
                           trimmedSearchParam,
                           evictionQueue5Tasks.county,
                           evictionQueue5Tasks.company
                        );
                        setEvictionQueue5Tasks((prevAllLog) => ({
                           ...prevAllLog,
                           searchParam: trimmedSearchParam
                        }));
                        break;
         }
      }
   };

   const handleSearchIconClick = () => {
      updateAllTasks(); // Perform the search when the search icon is clicked
   };

   const handleClearFilters = () => {
      setSearchQuery('');
      if (selectEvictionQueueId !== 0) {
         switch(selectEvictionQueueId){
            case 1:
               getEvictionQueueTasks(
                  1,
                  100,
                  selectEvictionQueueId,
                  evictionQueue1Tasks.actiontype ?? 0,
                  evictionQueue1Tasks.status ?? 0,
                  "",
                  evictionQueue1Tasks.county,
                  evictionQueue1Tasks.company
               );
               setEvictionQueue1Tasks((prevAllLog) => ({
                  ...prevAllLog,
                  searchParam: ""
               }));
               break;
               case 2:
               getEvictionQueueTasks(
                  1,
                  100,
                  selectEvictionQueueId,
                  evictionQueue2Tasks.actiontype ?? 0,
                  evictionQueue2Tasks.status ?? 0,
                  "",
                  evictionQueue2Tasks.county,
                  evictionQueue2Tasks.company
               );
               setEvictionQueue2Tasks((prevAllLog) => ({
                  ...prevAllLog,
                  searchParam: ""
               }));
               break;
               case 3:
               getEvictionQueueTasks(
                  1,
                  100,
                  selectEvictionQueueId,
                  evictionQueue3Tasks.actiontype ?? 0,
                  evictionQueue3Tasks.status ?? 0,
                  "",
                  evictionQueue3Tasks.county,
                  evictionQueue3Tasks.company
               );
               setEvictionQueue3Tasks((prevAllLog) => ({
                  ...prevAllLog,
                  searchParam: ""
               }));
               break;
               case 4:
               getEvictionQueueTasks(
                  1,
                  100,
                  selectEvictionQueueId,
                  evictionQueue4Tasks.actiontype ?? 0,
                  evictionQueue4Tasks.status ?? 0,
                  "",
                  evictionQueue4Tasks.county,
                  evictionQueue4Tasks.company
               );
               setEvictionQueue4Tasks((prevAllLog) => ({
                  ...prevAllLog,
                  searchParam: ""
               }));
               break;
               case 5:
               getEvictionQueueTasks(
                  1,
                  100,
                  selectEvictionQueueId,
                  evictionQueue5Tasks.actiontype ?? 0,
                  evictionQueue5Tasks.status ?? 0,
                  "",
                  evictionQueue5Tasks.county,
                  evictionQueue5Tasks.company
               );
               setEvictionQueue5Tasks((prevAllLog) => ({
                  ...prevAllLog,
                  searchParam: ""
               }));
               break;
         }
      }
   };

   // Clear search when a new queue is selected
   useEffect(() => {
      setSearchQuery('');
      getEvictionQueueTasks(
         1, // pageNumber
         100, // pageSize
         selectEvictionQueueId
      )
      switch(selectEvictionQueueId){
         case 1:
            setEvictionQueue1Tasks((prevAllLog) => ({
               ...prevAllLog,
               searchParam: ''
            }));
            break;
            case 2:
            setEvictionQueue2Tasks((prevAllLog) => ({
               ...prevAllLog,
               searchParam: ''
            }));
            break;
            case 3:
            setEvictionQueue3Tasks((prevAllLog) => ({
               ...prevAllLog,
               searchParam: ''
            }));
            break;
            case 4:
            setEvictionQueue4Tasks((prevAllLog) => ({
               ...prevAllLog,
               searchParam: ''
            }));
            break;
            case 5:
            setEvictionQueue5Tasks((prevAllLog) => ({
               ...prevAllLog,
               searchParam: ''
            }));
            break;
      }
     

   }, [selectEvictionQueueId]);

   return (
      <SingleLineSearch
         value={searchQuery}
         handleInputChange={handleInputChange}
         handleSearchIconClick={handleSearchIconClick}
         showClearSearch={false}
         clearSearchFilters={handleClearFilters}
         clearSearchClasses="bg-[#8e8e8e] hover:bg-[#737171] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded inline-flex gap-x-1.5 items-center mb-1 font-semibold"
      />
   );
};

export default EvictionQueueTask_SearchBar;
