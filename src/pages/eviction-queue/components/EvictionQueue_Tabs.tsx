import React from "react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "context/AuthContext";
import { useEvictionQueueContext } from "../EvictionQueueContext";
import Spinner from "components/common/spinner/Spinner";
import TabComponent from "components/common/tabs/tabs";
import EvictionQueueTasksGrid from "../EvictionQueueTasksGrid";
import { IEvictionQueueTasks } from "interfaces/eviction-queue.intreface";

type EvictionQueueTabsProps = {
   //handleBack:()=>void;
};

const EvictionQueueTabs = (props: EvictionQueueTabsProps) => {
   const { userRole } = useAuth();
   const {
      showSpinner,
      evictionQueue1Tasks,
      evictionQueue2Tasks,
      evictionQueue3Tasks,
      evictionQueue4Tasks,
      evictionQueuesData,
      getEvictionQueuesData,
      getEvictionQueueTasks,
      setSelectedEvictionQueueId,
      setSelectedEvictionId,

      setFilteredRecords,
      getAllCounties,
      getAllCompanies
   } = useEvictionQueueContext();

   useEffect(()=>{
      switch(evictionQueuesData.items[selectedTabIndex].id){
         case 1:
            setEvictionQueueTasks(evictionQueue1Tasks);
            break;
            case 2:
               setEvictionQueueTasks(evictionQueue2Tasks);
               break;
            case 3:
               setEvictionQueueTasks(evictionQueue3Tasks);
               break;
            case 4:
               setEvictionQueueTasks(evictionQueue4Tasks);
               break;
            default:
               setEvictionQueueTasks(
               {
                  items: [],
                  currentPage: 0,
                  pageSize: 0,
                  totalCount: 0,
                  totalPages: 0,
                  actiontype: 0,
                  status: 0,
                  searchParam: "",
                  county: "",
                  company: "",
                  sortings:[]
              });
               break;
      }     

   },[evictionQueue1Tasks,evictionQueue2Tasks,evictionQueue3Tasks,evictionQueue4Tasks]);
   const isMounted = useRef(true);
   const [evictionQueueTasks,setEvictionQueueTasks]=useState<IEvictionQueueTasks>({
      items: [],
      currentPage: 0,
      pageSize: 0,
      totalCount: 0,
      totalPages: 0,
      actiontype: 0,
      status: 0,
      searchParam: "",
      county: "",
      company: "",
      sortings:[]
  });

   useEffect(() => {
      if (
         evictionQueuesData &&
         evictionQueuesData.items[selectedTabIndex] &&
         evictionQueuesData.items[selectedTabIndex].id
      ) {
         getEvictionQueueTasks(1, 100, evictionQueuesData.items[selectedTabIndex].id, evictionQueueTasks.actiontype ?? 0, evictionQueueTasks.status ?? 0, evictionQueueTasks.searchParam, evictionQueueTasks.county, evictionQueueTasks.company);
         setSelectedEvictionQueueId(evictionQueuesData.items[selectedTabIndex].id);
      }
   }, [evictionQueuesData, userRole]);

   useEffect(() => {
      if (isMounted.current) {
         getEvictionQueuesData(1, 100);
         getAllCounties();
         getAllCompanies();
         isMounted.current = false;
      }
   }, [userRole]);

   const [tabName, setTabName] = useState("");
   const [selectedTabIndex, setSelectedTabIndex] = useState(0);

   return (
      <div className="relative -mr-0.5">
         {showSpinner && <Spinner />}
         <>
            <div className="mb-1.5">
               {<TabComponent
                  selectedTabIndex={selectedTabIndex}
                  onTabSelect={(index: number) => {
                     setTabName(evictionQueuesData.items[index].name)
                     setSelectedTabIndex(index)
                     setSelectedEvictionQueueId(evictionQueuesData.items[index].id)
                     setSelectedEvictionId([])
                     setFilteredRecords([])
                  }}
                  tabs={evictionQueuesData.items.map((tab, index) => ({
                     id: tab.id,
                     name: tab.name,
                     content: <EvictionQueueTasksGrid activeTab={tab.name}></EvictionQueueTasksGrid>
                  }))}
               ></TabComponent>}
            </div>
         </>
      </div>
   );
}
export default EvictionQueueTabs;
