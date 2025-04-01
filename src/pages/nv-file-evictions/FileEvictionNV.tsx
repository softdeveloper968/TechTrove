import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FileEvictionNVButtonsList } from "utils/constants";
import FileEvictionNV_SearchBar from "./components/FileEvictionNVActions/FileEvictionNV_SearchBar";
import {FileEvictionNV_Buttons} from "./components/FileEvictionNV_Buttons"
import TabComponent from "components/common/tabs/tabs";
import {FileEvictionNVProvider} from "./FileEvictionNVContext";
import ConfirmedEvictionGrid from "./components/ConfirmedEvictionGrid";
import PendingEvictionGrid from "./components/PendingEvictionGrid";

const FileEvicitonNV = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isSigned = queryParams.get("signed") === "true";
  const eviction= queryParams.get("eviction");
  const navigate = useNavigate();
  // const [tabName, setTabName] = useState( "Pending Eviction Confirmations");
  const [tabName, setTabName] = useState("Ready to Sign");

  useEffect(() => {
    if(eviction){
      setTabName("EA - Ready to Confirm");
     }
  },[])


  return (  
    <>
      <FileEvictionNVProvider>
      <div className="relative flex flex-wrap items-center mb-1.5">
                <FileEvictionNV_SearchBar activeTab={tabName} />
                <FileEvictionNV_Buttons
                  buttons={FileEvictionNVButtonsList}
                  tabName={tabName}
                />
          </div>
          <div className="dismisal_grid">
                  <TabComponent
                        selectedTabIndex={tabName === "EA - Ready to Confirm" ? 0 : 1}
                        onTabSelect={(index: number) => {
                          // Set the tab name based on the selected index
                          if (index === 0) setTabName("EA - Ready to Confirm");
                          else if (index === 1) setTabName("Ready to Sign");
                        }}
                        tabs={[
                          {
                            id: 0,
                            // name: "Pending Eviction Confirmations",
                            name: "EA - Ready to Confirm",
                            content: <PendingEvictionGrid/>,
                          },
                          {
                            id: 1,
                            // name: "Confirmed Evictions",
                            name: "Ready to Sign",
                            content: <ConfirmedEvictionGrid/>,
                          },
                        ]}
                      />
              </div>
      </FileEvictionNVProvider>
    </>
  );
};

export default FileEvicitonNV;
