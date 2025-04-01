import React, { useState } from "react";
import UsersGrid from "./components/UserGrid";
import CompanyGrid from "./components/CompanyGrid";
import TabComponent from "components/common/tabs/tabs";
import UserSearchBar from "./components/User_SearchBar";
import { UserProvider } from "./UserContext";
import { useAuth } from "context/AuthContext";
import { UserRole } from "utils/enum";
import PropertiesGrid from "./components/PropertiesGrid";

const Users: React.FC = () => {
   const { userRole,selectedStateValue } = useAuth();
   const [tabName, setTabName] = useState<string>("Company");

   const tabs = [
      {
         id: 0,
         name: "Company",
         content: <CompanyGrid />,
         isVisible: userRole.includes("C2CAdmin")||userRole.includes(UserRole.ChiefAdmin),
      },
      {
         id: 1,
         name: "Users",
         content: <UsersGrid />,
         isVisible: userRole.includes("C2CAdmin")||userRole.includes(UserRole.ChiefAdmin) || userRole.includes("Admin"),
      },
      {
         id: 2,
         name: "Properties",
         content: <PropertiesGrid />,
         isVisible: userRole.includes("C2CAdmin") ||userRole.includes(UserRole.ChiefAdmin)|| ((userRole.includes("Admin") || userRole.includes(UserRole.Signer) || userRole.includes(UserRole.NonSigner)||userRole.includes(UserRole.Viewer))&& selectedStateValue.toUpperCase()!=="TX"),
      }
   ];

   // Get the index of the selected tab by matching the tabName
   const selectedTabIndex = tabs.findIndex(tab => tab.name === tabName && tab.isVisible);

   return (
      <UserProvider>
         <div className="relative flex flex-wrap items-center mb-1.5">
            <UserSearchBar
               activeTab={userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin)? tabName : "Users"}
            />
         </div>
         <div className="users_grid">
            <TabComponent
               selectedTabIndex={selectedTabIndex !== -1 ? selectedTabIndex : 0}
               onTabSelect={(index: number) => {
                  const selectedTab = tabs[index];
                  setTabName(selectedTab ? selectedTab.name : "Company");
               }}
               tabs={tabs.filter(tab => tab.isVisible)}
            />
         </div>
      </UserProvider>
   );
};

export default Users;
