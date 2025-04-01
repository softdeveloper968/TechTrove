import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import C2CGrid from "./c2c-fees/C2CFeesGrid";
import WalletGrid from "./wallet/WalletGrid";
import TransactionGrid from "./transaction/TransactionGrid";
import InvoicesGrid from "./invoices/InvoicesGrid";
import BillingGrid from "./billing/BillingGrid";
import EvictionCourtSheriffFees from "./eviction-court-sheriff-fees/EvictionCourtSheriffFees";
import GarnishmentCourtSheriffFees from "./garnishment-court-sheriff-fees/GarnishmentCourtSheriffFees";
import AccountingDashboard from "./dashboard/AccountingDashboard";
import AccountingSearchBar from "./Accounting_SearchBar";
import AccountingSearchFilter from "./Accounting_SearchFilter";
import TabComponent from "components/common/tabs/tabs";
import { accountingTabMappings } from "utils/constants";
import { UserRole } from "utils/enum";
import { AccountingProvider } from "./AccountingContext";
import { useAuth } from "context/AuthContext";

const Accounting = () => {
   const navigate = useNavigate();
   const location = useLocation();
   const { userRole,selectedStateValue } = useAuth();
   const queryParams = new URLSearchParams(location.hash.substring(1));
   const invoicesTab = queryParams.has("code") ? "invoices" : "";
   const [tabName, setTabName] = useState<string>(invoicesTab == "invoices" ? "invoices" : "");

   useEffect(() => {
      const currentPath = location.pathname.split("/").pop() || "";
      const currentTab = accountingTabMappings.find(tab => tab.path.includes(currentPath));
      if (currentTab) {
         setTabName(currentTab.tabName);
      } else {
         const defaultTab = accountingTabMappings.find((tab) =>
            userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)  ? tab.index === 0 : tab.index === 1
         );
         if (defaultTab && invoicesTab !== "invoices") {
            setTabName(defaultTab.tabName);
         } else {
            setTabName("invoices");
         }
      }
   }, [location, invoicesTab, userRole]);

   const isVisibleForUserRole = (allowedRoles: string[]) => {
      return allowedRoles.some((role) => userRole.includes(role));
   };

   const selectedTabIndex = accountingTabMappings.findIndex(tab => tab.tabName === tabName);

   const tabs = [
      {
         id: 1,
         name: "Dashboard",
         content: <AccountingDashboard />, //<EvictionCourtSheriffFees />
         isVisible: isVisibleForUserRole([UserRole.C2CAdmin,UserRole.ChiefAdmin]),
      },
      {
         id: 2,
         name: "Wallets",
         content: (
            <>
               <div className="relative flex flex-wrap items-center mt-2 z-[1]">
                  {/* <AccountingSearchBar activeTab={tabName} /> */}
                  {(userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin) )&& (
                     <AccountingSearchBar activeTab={tabName} />
                  )}
               </div>
               <WalletGrid />
            </>
         ),
         isVisible: isVisibleForUserRole([UserRole.C2CAdmin,UserRole.ChiefAdmin, UserRole.Admin]),
      },
      {
         id: 3,
         name: "Transactions",
         content: (
            <>
               <div className="relative flex flex-wrap items-center mt-2 trans_filter">
                  <AccountingSearchBar activeTab={tabName} />
                  <AccountingSearchFilter />
               </div>{" "}
               <TransactionGrid />
            </>
         ),
         isVisible: isVisibleForUserRole([UserRole.C2CAdmin,UserRole.ChiefAdmin, UserRole.Admin]),
      },
      {
         id: 4,
         name: "Billing",
         content: (
            <>
               <BillingGrid />
            </>
         ),
         isVisible: false,
      },
      {
         id: 5,
         name: "Invoices",
         content: (
            <>
               <div className="relative flex flex-wrap items-center mt-2 z-[1]">
                  <AccountingSearchBar activeTab={tabName} />
               </div>
               <InvoicesGrid />
            </>
         ),
        isVisible: isVisibleForUserRole([UserRole.C2CAdmin,UserRole.ChiefAdmin, UserRole.Admin]) && ((!userRole.includes(UserRole.C2CAdmin) || !userRole.includes(UserRole.ChiefAdmin)) && selectedStateValue.toUpperCase()!=="TX"),
      },
      //  {
      //    id: 5,
      //    name: "Customers",
      //    content: (
      //      <>
      //        <div className="relative flex flex-wrap items-center mt-2 z-[1]">
      //          <AccountingSearchBar activeTab={tabName} />
      //        </div>
      //        <CustomerGrid/>
      //      </>
      //    ),
      //    isVisible: isVisibleForUserRole([UserRole.C2CAdmin]),
      //  },
      {
         id: 6,
         name: "Setup Eviction Court Sheriff Fees",
         content: <EvictionCourtSheriffFees />, //<EvictionCourtSheriffFees />
         isVisible: isVisibleForUserRole([UserRole.C2CAdmin,UserRole.ChiefAdmin]),
      },
      {
         id: 7,
         name: "Setup C2C Fees",
         content: <C2CGrid />,
         isVisible: isVisibleForUserRole([UserRole.C2CAdmin,UserRole.ChiefAdmin]),
      },
      {
         id: 8,
         name: "Setup Garnishment Court Sheriff Fees",
         content: <GarnishmentCourtSheriffFees />, //<GarnishmentCourtSheriffFees />,
         isVisible: isVisibleForUserRole([UserRole.C2CAdmin,UserRole.ChiefAdmin]),
      },
   ];

   return (
      <div className="accounting_grids">
         <AccountingProvider>
            <TabComponent
               selectedTabIndex={selectedTabIndex}
               onTabSelect={(index: number) => {
                  // Assuming 'index' is the variable you want to check
                  const selectedTab = accountingTabMappings.find(
                     (mapping) => mapping.index === index
                  );

                  if (selectedTab) {
                     const { tabName, path } = selectedTab;
                     setTabName(tabName);
                     navigate(path);
                  }
               }}
               tabs={tabs}
            ></TabComponent>
         </AccountingProvider>
      </div>
   );
};

export default Accounting;
