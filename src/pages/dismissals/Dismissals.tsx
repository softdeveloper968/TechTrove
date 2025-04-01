import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DimissalsButtonsList } from "utils/constants";
import { DismissalsProvider } from "./DismissalsContext";
import DismissalsSearchBar from "./components/DismissalsActions/Dismissals_SearchBar";
import { DismissalsButtons } from "./components/DismissalsButtons";
import TabComponent from "components/common/tabs/tabs";
import UnsignedGrid from "./components/UnsignedGrid";
import SignedDismissalsGrid from "./components/SignedGrid";
import ReviewSign from "./ReviewSign";
import EvictionAutomationDismissalsApprovalGrid from "./components/EvictionAutomationDismissalsApprovalGrid"
import { useAuth } from "context/AuthContext";
import { UserRole } from "utils/enum";

const Dismissals = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const signedParam = queryParams.get("signed");
  const isManager=queryParams.get("isManager");
  const isSigned = signedParam === "true";

  const navigate = useNavigate();
  const [tabName, setTabName] = useState("Ready to Sign");
  const [tabIndex, setTabIndex] = useState(1);
  const [showReviewSign, setShowReviewSign] = useState<boolean>(false);
  const { userRole} = useAuth();
  useEffect(() => {
    
   // Check if the signed query parameter exists
   if (signedParam !== null) {
     // If `signed` is true, set the tab to "Signed Dismissals"
     if (isSigned) {
       setTabName("Signed Dismissals");
       setTabIndex(2);
     }  
   }
   else if(isManager){
    setTabName("EA - Ready to Confirm");
    setTabIndex(0);
   } 
   else{
    setTabName("Ready to Sign");
    setTabIndex(1);
   }
   // else {
   //   // Set default tab if `signed` parameter does not exist
   //   setTabName("EA - Ready to Confirm");
   //   setTabIndex(0);
   // }
 }, [signedParam, isSigned,isManager]);

  return (  
    <>
      <DismissalsProvider>
        {!showReviewSign ? (
          <>
            <div className="relative flex flex-wrap items-center mb-1.5">
              <DismissalsSearchBar activeTab={tabName} />
              <DismissalsButtons
                buttons={DimissalsButtonsList}
                activeTab={tabName}
                handleReviewSign={() => {
                  setShowReviewSign(true);
                  navigate("ReviewSign");
                }}
              />
              {/* <Dismissals_SearchFilters activeTab={tabName} /> */}
            </div>
            <div className="dismisal_grid">
                <TabComponent
                      selectedTabIndex={tabIndex}
                      onTabSelect={(index: number) => {
                        
                        // Set the tab name based on the selected index
                        if (index === 0) {
                          setTabName("EA - Ready to Confirm");setTabIndex(0);}
                        else if (index === 1){ setTabName("Ready to Sign");setTabIndex(1);} 
                        else if (index === 2){ setTabName("Signed Dismissals");setTabIndex(2);}                      
                      }}
                      tabs={[
                        {
                          id: 0,
                          name: "EA - Ready to Confirm",
                          content: <EvictionAutomationDismissalsApprovalGrid/>,
                          // isVisible: (["GA"].includes(selectedStateValue)) ? true : false
                        },
                        {
                          id: 1,
                         // name: "Unsigned",
                          name:"Ready to Sign",
                          content: <UnsignedGrid activeTab={tabName}/>,
                          // isVisible: (["GA"].includes(selectedStateValue)) ? true : false
                        },
                        {
                          id: 2,
                          //name: "Signed",
                          name:"Signed Dismissals",
                          content: <SignedDismissalsGrid />,
                          isVisible:userRole.includes(UserRole.PropertyManager)? false : true
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
            activeTab={tabName}
          />
        )}
      </DismissalsProvider>
    </>
  );
};

export default Dismissals;
