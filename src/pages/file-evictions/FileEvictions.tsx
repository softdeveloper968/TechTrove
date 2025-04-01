// FileEvictions.tsx
import React, { useEffect } from "react";
import { useState } from "react";
import FileEvictionsSearchBar from "./components/FileEvictionsActions/FileEvictions_SearchBar";
import { FileEvictionsButtons } from "./components/FileEvictionsButtons";
import FileEvictionsGrid from "./components/FIleEvictionsGrid";
import FileEvictionsSearchFilter from "./components/FileEvictionsSearchFilter";
import EvictionAutomationApprovalGrid from "./components/EvictionAutomationApprovalGrid";
import { FileEvictionsButtonsList } from "utils/constants";
import { UserRole } from "utils/enum";
import { FileEvictionsProvider } from "./FileEvictionsContext";
import { useAuth } from "context/AuthContext";
import ReviewSign from "./ReviewSign";
import TabComponent from "components/common/tabs/tabs";
import { useLocation } from "react-router-dom";

const FileEvictions = () => {
   const { userRole } = useAuth();
   const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const approvedParam = queryParams.get("isApproved");
  const isApproved = approvedParam === "true";
  const eviction= queryParams.get("eviction");

  const [showReviewSign, setShowReviewSign] = useState<boolean>(false);
  const [tabName, setTabName] = useState(isApproved?"Ready to Sign":"EA - Ready to Confirm");
  const [tabIndex, setTabIndex] = useState(isApproved?1:0);

  useEffect(() => {
   if (approvedParam !== null) {
      if (isApproved) {
         setTabName("Ready to Sign");
         setTabIndex(1);
       } else {
         setTabName("EA - Ready to Confirm");
         setTabIndex(0);
       }
   }
   else if(eviction){
    setTabName("EA - Ready to Confirm");
    setTabIndex(0);
   }
    else {
      setTabName("Ready to Sign");
      setTabIndex(1);
   }

  }, [approvedParam, isApproved]);

  return (
    <>
      {/* 
        Additional layout or components for the File Evictions page can be added here.
        These could include headers, navigation, or any other page-specific elements.
      */}
      <FileEvictionsProvider>
        {/* 
          FileEvictions Container contains the main logic and UI for the File evictions page.
          It is wrapped with FileEvictionsProvider to provide the necessary context to its children.
        */}
        {showReviewSign === false ? (
          <>
            <div className="relative flex flex-wrap items-center">
              <FileEvictionsSearchBar activeTab={tabName}/>
              <FileEvictionsButtons
                activeTab={tabName}
                buttons={FileEvictionsButtonsList}
                handleReviewSign={() => {
                  setShowReviewSign(true);
                }}
              />
            </div>
             <div className="eviction_grid">
             {(userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin)) && <FileEvictionsSearchFilter activeTab={tabName}/>}
            {/* <FileEvictionsGrid /> */}
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
                          content: <EvictionAutomationApprovalGrid/>,                         
                        },
                        {
                          id: 1,
                          name: "Ready to Sign",
                          content: <FileEvictionsGrid />,
                        },                       
                      ]}
                    />
            </div>
          </>
        ) : (
          <ReviewSign
            handleBack={() => {
              setShowReviewSign(false);
            }}
          />
        )}
      </FileEvictionsProvider>
    </>
  );
};

export default FileEvictions;
