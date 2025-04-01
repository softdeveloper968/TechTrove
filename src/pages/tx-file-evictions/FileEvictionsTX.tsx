import React, { useState } from "react";
import { FileEvictionsTXProvider } from "./FileEvictionsTXContext";
import FileEvictionsTXGrid from "./components/FileEvictionsTXGrid";
import EA_EvictionGrid from "./components/EA_EvictionGrid";
import { FileEvictionsTXButtons } from "./components/FileEvictionsTX_Buttons";
import { FileEvictionsTXButtonsList } from "utils/constants";
import FileEvictionsTX_SearchBar from "./components/FileEvictionsTX_SearchBar";
import FileEvictionsTXSearchFilter from "./components/FileEvictionsTX_SearchFilters";
import { useAuth } from "context/AuthContext";
import { UserRole } from "utils/enum";
import TabComponent from "components/common/tabs/tabs";
import { useLocation } from "react-router-dom";

const FileEvictionTX = () => {
   const location = useLocation();
   const queryParams = new URLSearchParams(location.search);
   const eviction= queryParams.get("eviction");
   const [tabIndex, setTabIndex] = useState(eviction?0:1);
   const [tabName, setTabName] = useState(eviction?"EA - Ready to Confirm":"Ready to Sign");
   const { userRole} = useAuth();
   return (
      <>
         <FileEvictionsTXProvider>
            {(
               <>
                  <div className="relative flex flex-wrap items-center md:mb-2">
                     <FileEvictionsTX_SearchBar activeTab={tabName}/>
                     <FileEvictionsTXButtons
                        buttons={FileEvictionsTXButtonsList}
                        activeTab={tabName}
                     ></FileEvictionsTXButtons>
                  </div>
                  <div className="cases_grid">
                  {(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)) && < FileEvictionsTXSearchFilter activeTab={tabName}/>}
                     {/* <FileEvictionsTXGrid /> */}
                     <TabComponent
                      selectedTabIndex={tabIndex}
                      onTabSelect={(index: number) => {
                        
                        // Set the tab name based on the selected index
                        if (index === 0) {
                          setTabName("EA - Ready to Confirm");setTabIndex(0);}
                        else if (index === 1){ setTabName("Ready to Sign");setTabIndex(1);}                      
                      }}
                      tabs={[
                        {
                          id: 0,
                          name: "EA - Ready to Confirm",
                          content: <EA_EvictionGrid/>,                         
                        },
                        {
                          id: 1,
                          name: "Ready to Sign",
                          content: <FileEvictionsTXGrid />,
                        },                       
                      ]}
                    />
                  </div>
               </>
            )}
         </FileEvictionsTXProvider>
      </>
   );
};

export default FileEvictionTX