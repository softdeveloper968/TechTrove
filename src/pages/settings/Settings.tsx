import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import TabComponent from "components/common/tabs/tabs";
import { tabMappings } from "utils/constants";
import { UserRole } from "utils/enum";
import Court from "./court/Court";
import County from "./county/County";
import WritLabor from "./writ-labor/WritLabor";
import { useAuth } from "context/AuthContext";
import TylerLogins from "./tyler-logins/TylerLogins";
import TylerConfig from "./tyler-config/TylerConfig";
import ProcessServer from "./process-server/ProcessServer";
import Notary from "./notary/Notary";
import CasperLogins from "./casper-logins/CasperLogins";
import ProcessServerDocuments from "./process-server-document/ProcessServerDocuments";
import FilingType from "./filing-type/FilingType";
import EASettings from "./ea-settings/EASettings";
import Attorney from "./attorney/Attorney";

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userRole ,selectedStateValue} = useAuth();
  const [tabName, setTabName] = useState<string>("");

  useEffect(() => {
   const currentPath = location.pathname.split("/").pop() || "";
   const currentTab = tabMappings.find(tab => tab.path.includes(currentPath));
   if (currentTab) {
     setTabName(currentTab.tabName);
   } else {
     const defaultTab = tabMappings.find(tab => tab.index === 0);
     if (defaultTab) {
       setTabName(defaultTab.tabName);
     }
   }
 }, [location]);

  const isVisibleForUserRole = (allowedRoles: string[]) => {
    return allowedRoles.some((role) => userRole.includes(role));
  };

  const selectedTabIndex = tabMappings.findIndex(tab => tab.tabName === tabName);

  const tabs = [
    {
      id: 1,
      name: "Setup County",
      content: <County />,
      isVisible: isVisibleForUserRole([UserRole.C2CAdmin,UserRole.ChiefAdmin]),
    },
    {
      id: 2,
      name: "Setup Court",
      content: <Court />,
      isVisible: isVisibleForUserRole([UserRole.C2CAdmin,UserRole.ChiefAdmin]),
    },  
    {
      id: 3,
      name: "Writ Labor",
      content: <WritLabor />,
      isVisible:!["NV", "TX"].includes(selectedStateValue) ?isVisibleForUserRole([UserRole.Admin, UserRole.C2CAdmin,UserRole.ChiefAdmin]):false,
    },
    {
      id: 4,
      name: "EA Settings",
      content: <EASettings />,
      isVisible:isVisibleForUserRole([UserRole.Admin]),
    },
    {
      id: 5,
      name: "Tyler Logins",
      content: <TylerLogins />,
      isVisible: isVisibleForUserRole([UserRole.C2CAdmin,UserRole.ChiefAdmin]),
    },
    {
      id: 6,
      name: "Tyler Config",
      content: <TylerConfig />,
      isVisible: isVisibleForUserRole([UserRole.C2CAdmin,UserRole.ChiefAdmin]),
    },
    {
      id: 7,
      name: "Process Server",
      content: <ProcessServer />,
      isVisible: ((["GA", "TX"].includes(selectedStateValue)) && (userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin))) || (selectedStateValue=="NV" && 
        (userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)|| userRole.includes(UserRole.Admin))),
    },
    {
      id: 8,
      name: "Notary Config",
      content: <Notary />,
      isVisible: isVisibleForUserRole([UserRole.C2CAdmin,UserRole.ChiefAdmin]),
    },
    {
      id: 9,
      name: "Cobb Users",
      content: <CasperLogins />,
      isVisible: !["NV", "TX"].includes(selectedStateValue) ?isVisibleForUserRole([UserRole.C2CAdmin,UserRole.ChiefAdmin]) :false,
    },
    {
      id: 10,
      name: "Process Server Documents",
      content: <ProcessServerDocuments />,
      isVisible: !["NV", "TX"].includes(selectedStateValue) ?isVisibleForUserRole([UserRole.C2CAdmin,UserRole.ChiefAdmin]) :false,
    },
    {
      id: 11,
      name: "Setup Filing Type",
      content: <FilingType />,
      isVisible: isVisibleForUserRole([UserRole.C2CAdmin,UserRole.ChiefAdmin]),
    },
    {
      id: 12,
      name: "Setup Attorney",
      content: <Attorney />,
      isVisible: isVisibleForUserRole([UserRole.C2CAdmin,UserRole.ChiefAdmin]),
    }
  ];

  return (
    <div className="settings_grid">
      <TabComponent
        selectedTabIndex={selectedTabIndex}
        onTabSelect={(index: number) => {
          // Assuming 'index' is the variable you want to check
          const selectedTab = tabMappings.find(
            (mapping) => mapping.index === index
          );

          if (selectedTab) {
            const { tabName, path } = selectedTab;
            setTabName(tabName);
            navigate(path);
          }
        }}
        tabs={tabs.filter((tab) => tab.isVisible)}
      ></TabComponent>
    </div>
  );
};

export default Settings;
