import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DismissalNVButtonsList } from "utils/constants";
import DismissalNV_SearchBar from "./components/DismissalNVActions/DismissalNV_SearchBar";
import {DismissalNV_Buttons} from "./components/DismissalNV_Buttons"
import TabComponent from "components/common/tabs/tabs";
import {DismissalNVProvider} from "./DismissalNVContext";
import PendingDismissalNV from "./components/PendingDismissalNV";
import ConfirmedDismissalNV from "./components/ConfirmedDismissalNV";
import SignedDismissalNVGrid from "./components/SignedDismissalNV";

const DismissalNV = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isSigned = queryParams.get("signed") === "true";

  const navigate = useNavigate();
  const [tabName, setTabName] = useState("Ready to Sign");

  return (  
    <>
     <DismissalNVProvider>
     <div className="relative flex flex-wrap items-center mb-1.5">
              <DismissalNV_SearchBar activeTab={tabName} />
              <DismissalNV_Buttons
                buttons={DismissalNVButtonsList}
                tabName={tabName}
              />
        </div>
        <div className="dismisal_grid">
                <TabComponent
                      selectedTabIndex={tabName === "EA - Ready to Confirm" ? 0 : tabName === "Ready to Sign" ? 1 : 2}
                      onTabSelect={(index: number) => {
                        // Set the tab name based on the selected index
                        if (index === 0) setTabName("EA - Ready to Confirm");
                        else if (index === 1) setTabName("Ready to Sign");
                        else if (index === 2) setTabName("Signed Dismissals");
                      }}
                      tabs={[
                        {
                          id: 0,
                          // name: "Pending Dismissal Confirmations",
                          name: "EA - Ready to Confirm",
                          content: <PendingDismissalNV/>,
                        },
                        {
                          id: 1,
                          // name: "Confirmed Dismissals",
                          name: "Ready to Sign",
                          content: <ConfirmedDismissalNV/>,
                        },
                        {
                          id: 2,
                          // name: "Confirmed Dismissals",
                          name: "Signed Dismissals",
                          content: <SignedDismissalNVGrid/>,
                        },
                      ]}
                    />
            </div>

     </DismissalNVProvider>  
    </>
  );
};

export default DismissalNV;
