import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { WritsOfPossessionButtonsList } from "utils/constants";
import { UserRole } from "utils/enum";
import { WritsOfPossessionProvider } from "./WritsOfPossessionContext";
import { useAuth } from "context/AuthContext";
import ReviewSign from "./ReviewSign";
import SignedGrid from "./components/SignedGrid";
import UnSignedGrid from "./components/UnSignedGrid";
import TabComponent from "components/common/tabs/tabs";
import { WriteOfPossessionButtons } from "./components/WritsOfPossessionButtons";
import WritsOfPossessionSearchBar from "./components/WritsOfPossessionActions/WritsOfPossession_SearchBar";
import WritsOfPossession_AddtoWritLaborModal from "./components/WritsOfPossessionActions/WritsOfPossession_WritLaborModal";

const WritsOfPossession = () => {
  const { userRole } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isSigned = queryParams.get("signed") === "true";
  
  const [tabName, setTabName] = useState(isSigned || userRole.includes(UserRole.WritLabor) ? "Signed" : "Ready to Sign");
  const [showReviewSign, setShowReviewSign] = useState<boolean>(false);
  const [showWritLaborModal, setShowWritLaborModal] = useState<boolean>(false);

  useEffect(() => {
    setTabName(isSigned ? "Signed" : "Ready to Sign");
  }, [isSigned, location]);


  return (
    <>
      {/* 
        Additional layout or components for the writs of possession page can be added here.
        These could include headers, navigation, or any other page-specific elements.
      */}
      <WritsOfPossessionProvider>
        {/* 
          WritsOfPossession Container contains the main logic and UI for the writs of possession page.
          It is wrapped with WritsOfPossessionProvider to provide the necessary context to its children.
        */}
        {!(showReviewSign || showWritLaborModal) ? (
          <>
            {/* Main Content */}
            <div className="relative flex flex-wrap items-center mb-1.5">
              <WritsOfPossessionSearchBar activeTab={tabName} />
              <WriteOfPossessionButtons
                buttons={WritsOfPossessionButtonsList}
                activeTab={tabName}
                handleReviewSign={() => {
                  setShowReviewSign(true);
                }}
                handleWritLaborModal={() => {
                  setShowWritLaborModal(true);
                }}
              />
            </div>
          <div className="writs_grid">
          <TabComponent
              selectedTabIndex={tabName === "Ready to Sign" ? 0 : 1}
              onTabSelect={(index: number) => {
                // Set the tab name based on the selected index
                if (index === 0) setTabName("Ready to Sign");
                else if (index === 1) setTabName("Signed");
              }}
              tabs={[
                ...(userRole.includes(UserRole.WritLabor)
                  ? []
                  : [
                    {
                      id: 1,
                      name: "Ready to Sign",
                      content: <UnSignedGrid />,
                    },
                  ]),
                {
                  id: 2,
                  name: "Signed",
                  isVisible: (userRole.includes(UserRole.WritLabor)) ? false : true,
                  content: <SignedGrid />,
                }
              ]}
            />
          </div>
            
          </>
        ) : (
          // Review Sign or Modal
          <>
            {!showWritLaborModal ? (
              <ReviewSign
                handleBack={() => {
                  setShowReviewSign(false);
                }}
              />
            ) : (
              <WritsOfPossession_AddtoWritLaborModal
                showAddtoWritLaborModalPopup={showWritLaborModal}
                handleClose={() => {
                  setShowWritLaborModal(false);
                }}
              />
            )}
          </>
        )}
      </WritsOfPossessionProvider>
    </>
  );
};

export default WritsOfPossession;
