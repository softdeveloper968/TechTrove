// ServiceTracker.tsx
import React, { useState } from "react";
import ServiceTrackerSearchBar from "./components/ServiceTrackerActions/ServiceTracker_SearchBar";
import ServiceTrackerGrid from "./components/ServiceTrackerGrid";
import ServiceTrackerButtons from "./components/ServiceTrackerActions/ServiceTracker_Button";
import TabComponent from "components/common/tabs/tabs";
import UnservedQueueGrid from "./components/UnservedQueueGrid";
import { ServiceTrackerProvider } from "./ServiceTrackerContext";
import UnservedAmendmentQueueGrid from "./components/UnservedAmendmentQueueGrid";

const ServiceTracker = () => {

   const [selectedTabIndex, setSelectedTabIndex] = useState(0);
   const [tabName, setTabName] = useState<string>("Tracker");

   return (
      <>
         {/* 
        Additional layout or components for the service tracker page can be added here.
        These could include headers, navigation, or any other page-specific elements.
      */}
         <ServiceTrackerProvider>
            {/* 
          ServiceTracker Container contains the main logic and UI for the service tracker page.
          It is wrapped with ServiceTrackerProvider to provide the necessary context to its children.
        */}
            <>
               <div className="relative flex flex-wrap items-center mb-1.5">
                  <ServiceTrackerSearchBar activeTab={tabName} />
                  <ServiceTrackerButtons activeTab={tabName} />
               </div>
               <div className="tracker_grid">
                  <TabComponent
                     selectedTabIndex={selectedTabIndex}
                     onTabSelect={(index: number) => {
                        if (index === 0) {
                           setSelectedTabIndex(0)
                           setTabName("Tracker");
                        }
                        if (index === 1) {
                           setSelectedTabIndex(1)
                           setTabName("Unserved Evictions");
                        }
                        if (index === 2){ 
                           setSelectedTabIndex(2)
                           setTabName("Unserved Amendments");
                        }

                     }}
                     tabs={[
                        {
                           id: 0,
                           name: "Tracker",
                           content: <ServiceTrackerGrid />,
                        },
                        {
                           id: 1,
                           name: "Unserved Evictions",
                           content: <UnservedQueueGrid />,
                        },
                        {
                           id: 2,
                           name: "Unserved Amendments",
                           content: <UnservedAmendmentQueueGrid />,
                         },
                     ]}
                  ></TabComponent>
                  {/* <ServiceTrackerGrid /> */}
               </div>

            </>
         </ServiceTrackerProvider>
      </>
   );
};

export default ServiceTracker;
