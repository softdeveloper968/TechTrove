import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EvictionQueueProvider } from "./EvictionQueueContext";
import AllTask_SearchFilters from "./components/EvictionQueueTask_SearchFilters";
import EvictionQueueTask_SearchBar from "./components/EvictionQueueTask_SearchBar";
import EvictionQueueTabs from "./components/EvictionQueue_Tabs";
import EvictionQueueButtons from "./components/EvictionQueueButtons";
import { CasesQueueButtonsList } from "utils/constants";

type EvictionQueueProps = {};

const EvictionQueueService = (props: EvictionQueueProps) => {
   const [showEvictionQueueTaskGrid, setShowEvictionQueueTaskGrid] = useState<boolean>(false);
   const navigate = useNavigate(); // Initialize useNavigate

   const handleShowTask = () => {
      setShowEvictionQueueTaskGrid(true);
      navigate("/queue-management/tasks"); // Update URL when showEvictionQueueTaskGrid is true
   };

   const handleClose = () => {
      setShowEvictionQueueTaskGrid(false);
      navigate("/queue-management"); // Update URL when closing task grid
   };

   return (
      <EvictionQueueProvider>
         <div>
            {/* {!showEvictionQueueTaskGrid ? (
                    <EvictionQueueGrid handleShowTask={handleShowTask} />
                ) : ( */}
            <div>
               <div className="relative flex flex-wrap items-center md:mb-2">
                  <EvictionQueueTask_SearchBar />
                  <EvictionQueueButtons
                     buttons={CasesQueueButtonsList}
                     handleClick={() => { }}
                  />
               </div>
               <AllTask_SearchFilters />
               <div className="queue_grid">
               <EvictionQueueTabs />
               </div>
               
            </div>
            {/* )} */}
         </div>
      </EvictionQueueProvider>
   );
};

export default EvictionQueueService;
