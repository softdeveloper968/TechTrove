import React, { useState } from "react";
import { EmailQueueProvider } from "./EmailQueueContext";
import EmailQueueGrid from "./components/EmailQueueGrid";
import ServerEmailsLogs from "./components/ServerEmailsLogs";
import EmailQueueSearchBar from "./components/EmailQueueActions/EmailQueue_SearchBar";
import EmailQueueButtons from "./components/EmailQueueButtons";
import TabComponent from "components/common/tabs/tabs";
import { EmailQueueButtonList } from "utils/constants";
import MailManagementGrid from "./components/MailManagementGrid";
import { useAuth } from "context/AuthContext";

type EmailQueueProps = {};

const EmailQueue = (props: EmailQueueProps) => {
   const [selectedTabIndex, setSelectedTabIndex] = useState(0);
   const [tabName, setTabName] = useState<string>("Process Evictions");
   const {selectedStateValue}=useAuth();

   return (
      <EmailQueueProvider>
         <div className="relative flex flex-wrap items-center mb-1.5">
            <EmailQueueSearchBar activeTab={tabName} />
            <EmailQueueButtons
               buttons={EmailQueueButtonList}
               activeTab={tabName}
            />
         </div>
         <div className="email_queue_grid">
            <TabComponent
               selectedTabIndex={selectedTabIndex}
               onTabSelect={(index: number) => {
                  if (index === 0) {
                     setSelectedTabIndex(0)
                     setTabName("Process Evictions");
                  }
                  if (index === 1) {
                     setSelectedTabIndex(1)
                     setTabName("Process Server Eviction");
                  }
                  if (index === 2) {
                     setSelectedTabIndex(2)
                     setTabName("Mail Management");
                  }
               }}
               tabs={[
                  {
                     id: 0,
                     name: "Process Evictions",
                     content: <EmailQueueGrid />,
                     isVisible:(["GA","TX"].includes(selectedStateValue))
                  },
                  {
                     id: 1,
                     name: "Process Server Eviction",
                     content: <ServerEmailsLogs />,
                     isVisible: (["GA","TX"].includes(selectedStateValue))
                  },
                  {
                     id: 2,
                     name: "Mail Management",
                     content: <MailManagementGrid />,
                     isVisible:(["GA"].includes(selectedStateValue))
                  }
               ]}
            ></TabComponent>
         </div>
      </EmailQueueProvider>
   );
};

export default EmailQueue;