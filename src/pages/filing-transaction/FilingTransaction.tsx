import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import FilingTransaction_SearchBar from "./components/FilingTransactionActions/FilingTransaction_SearchBar";
import FilingTransaction_SearchFilters from "./components/FilingTransaction_SearchFilters";
import TabComponent from "components/common/tabs/tabs";
import FilingAOSGrid from "./components/FilingAOSGrid";
import FilingDismissalGrid from "./components/FilingDismissalGrid";
import FilingWritGrid from "./components/FilingWritGrid";
import FilingAmendmentGrid from "./components/FilingAmendmentGrid";
import { FilingTransactionButtons } from "./components/FilingTransactionButtons";
import FilingDispossessoryGrid from "./components/FilingDispossessory";
import { FilingTransactionProvider } from "./FilingTransactionContext";
import { useAuth } from "context/AuthContext";
import { FilingTransactionButtonsList } from "utils/constants";
import AccountingQueueGrid from "./components/AccountingQueueGrid";

// Filling Transaction component serves as the main entry point for the payment page

type FilingTransactionProps = {};

const FilingTransaction = (props: FilingTransactionProps) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  //  const casesList=queryParams.get("cases");
  useEffect(() => {

  }, []);
  const { userRole,selectedStateValue } = useAuth();
  const [tabName, setTabName] = useState("Accounting Queue");


  return (

    <FilingTransactionProvider>
          <div className="relative flex flex-wrap items-center mb-1.5">
            <FilingTransaction_SearchBar activeTab={tabName}/>
            <FilingTransactionButtons
                buttons={FilingTransactionButtonsList}
                activeTab={tabName}
              />
          </div>
          <FilingTransaction_SearchFilters activeTab={tabName}/>
          <div className="filing_trans_grid">
            <TabComponent
              selectedTabIndex={tabName === "Accounting Queue" ? 0 :tabName === "Billing Evictions" ? 1 : tabName === "Billing AOS" ? 2 : tabName === "Billing Dismissals" ? 3 : tabName === "Billing Writs" ? 4 : 5}
              onTabSelect={(index: number) => {
                // Set the tab name based on the selected index
                 if (index === 0) setTabName("Accounting Queue");
                 else if (index === 1) setTabName("Billing Evictions");
                else if (index === 2) setTabName("Billing AOS");
                else if (index === 3) setTabName("Billing Dismissals");
                else if (index === 4) setTabName("Billing Writs");
                else if (index === 5) setTabName("Billing Amendments");
                // else if (index === 5) setTabName("Accounting Queue");
              }}
              tabs={[
                {
                  id: 0,
                  name: "Accounting Queue",
                  content: <AccountingQueueGrid />,
                  isVisible:selectedStateValue=="GA"||selectedStateValue=="TX"
                },
                {
                  id: 1,
                  name: "Billing Evictions",
                  content: <FilingDispossessoryGrid />,
                  isVisible:selectedStateValue=="GA"||selectedStateValue=="TX"
                },
                {
                  id: 2,
                  name: "Billing AOS",
                  content: <FilingAOSGrid />,
                  isVisible:selectedStateValue=="GA"
                },
                {
                  id: 3,
                  name:"Billing Dismissals" ,
                  content: <FilingDismissalGrid />,
                  isVisible:selectedStateValue=="GA"
                },
                {
                  id: 4,
                  name: "Billing Writs",
                  content: <FilingWritGrid />,
                  isVisible:selectedStateValue=="GA"
                },
                {
                  id: 5,
                  name: "Billing Amendments",
                  content: <FilingAmendmentGrid />,
                  isVisible:selectedStateValue=="GA"
                },
                // {
                //   id: 5,
                //   name: "Accounting Queue",
                //   content: <AccountingQueueGrid />,
                // },
              ]}
            />
          </div>

    </FilingTransactionProvider>
  );
};

export default FilingTransaction;


