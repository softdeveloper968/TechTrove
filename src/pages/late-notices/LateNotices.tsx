// LateNotices.tsx
import React, { useEffect } from "react";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { LateNoticesProvider } from "./LateNoticesContext";
import { useAuth } from "context/AuthContext";
import { LateNoticesButtonsList } from "utils/constants";
import { UserRole } from "utils/enum";
import LateNoticesSearchBar from "./components/LateNoticesActions/LateNotices_SearchBar";
import { LateNoticesButtons } from "./components/LateNoticesButtons";
import LateNoticesGrid from "./components/LateNoticesGrid";
import TabComponent from "components/common/tabs/tabs";
import ConfirmDelinquenciesGrid from "./components/ConfirmDelinquenciesGrid";
import PendingNoticesGrid from "./components/PendingNoticesGrid";
import ReviewSend from "./ReviewSend";
import ReviewSign from "./LateNotice_ReviewSign";
// LateNotices component serves as the main entry point for the Late Notices page
const LateNotices = () => {
  const location = useLocation();
  const {userRole}=useAuth();
  const queryParams = new URLSearchParams(location.search);
  const isConfirmed = queryParams.get("isConfirmed") === "true";
  //const casesList=queryParams.get("cases");
  const [tabName, setTabName] =useState(isConfirmed?"Ready to Sign":userRole.includes(UserRole.ProcessServer)?"All Notices": "EA - Ready to Confirm");
  const [selectedTabIndex, setSelectedTabIndex] = useState(isConfirmed ?1:userRole.includes(UserRole.ProcessServer)?2:0);
  const [showReviewSign, setShowReviewSign] = useState<boolean>(false);
  const [showSignProof, setShowSignProof] = useState<boolean>(false);
  useEffect(()=>{
    if(isConfirmed){
      setTabName("Ready to Sign");
      setSelectedTabIndex(1);
    }
   if(userRole.includes(UserRole.ProcessServer)){
    setTabName("All Notices");
    setSelectedTabIndex(2);
   }
  },[]);
  return (
    <>
      <LateNoticesProvider>
      {showReviewSign === false && showSignProof==false ? (
          <>
          <div className="relative flex flex-wrap items-center mb-1.5">
          <LateNoticesSearchBar activeTab={tabName} />
          <LateNoticesButtons
            buttons={LateNoticesButtonsList}
            tabName={tabName}
            handleReviewSend={() => {
              setShowReviewSign(true);
            }}
            handleSignProof={()=>{
              
              setShowSignProof(true);
            }}
          />          
        </div>
      <div className="notices_grid">
        <TabComponent
          selectedTabIndex={selectedTabIndex}
          onTabSelect={(index: number) => {
            if (index === 0) {
              setSelectedTabIndex(0)
              setTabName("EA - Ready to Confirm");
            }
            if (index === 1) {
              setSelectedTabIndex(1)
              setTabName("Ready to Sign");
            }
            if (index === 2) {
              setSelectedTabIndex(2)
              setTabName("All Notices");
            }
            // else if (index === 3) {
            //   setTabName("Signed Proofs");
            //   setSelectedTabIndex(3)
            // }
          }}
          tabs={[
            {
              id: 0,
             // name: "Pending Notice Confirmations",
              name:"EA - Ready to Confirm",
              content: <PendingNoticesGrid/>,
              isVisible:userRole.includes(UserRole.ProcessServer)?false:true
            },
            {
              id: 1,
            ///  name: "Confirmed Notices",
              name:"Ready to Sign",
              content: <ConfirmDelinquenciesGrid/>,
              isVisible:userRole.includes(UserRole.ProcessServer)?false:true
            },
            {
              id: 2,
              name: "All Notices",
              content: <LateNoticesGrid></LateNoticesGrid>,
              isVisible:userRole.includes(UserRole.PropertyManager)?false:true
            },
            // {
            //   id: 3,
            //   name: "Signed Proofs",
            //   content: <SignProofs></SignProofs>,
            // },
          ]}
        ></TabComponent>
      </div>
          </>
        ) : (showSignProof?<ReviewSign
            handleBack={
              ()=>{
                setShowSignProof(false);
              }
            }
            />:
          <ReviewSend
              handleBack={() => {
                setShowReviewSign(false);
              } } activeTab={""}          />
        )}       
      </LateNoticesProvider>
    </>
  );
};

export default LateNotices;
