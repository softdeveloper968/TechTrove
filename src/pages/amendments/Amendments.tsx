import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AmendmentsButtonsList } from "utils/constants";
import { AmendmentsProvider } from "./AmendmentsContext";
import ReviewSign from "./ReviewSign";
import TabComponent from "components/common/tabs/tabs";
import { AmendmentsButtons } from "./components/AmendmentsButtons";
import UnsignedAmendmentGrid from "./components/UnsignedAmendmentGrid";
import SignedAmendmentGrid from "./components/SignedAmendmentGrid";
import AmendmentsSearchBar from "./components/AmendmentsActions/Amendments_SearchBar";
import UnservedAmendmentGrid from "./components/UnservedAmendmentGrid";

const Amendments = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isSigned = queryParams.get("signed") === "true";

  const [tabName, setTabName] = useState("Ready to Sign");
  const [showReviewSign, setShowReviewSign] = useState<boolean>(false);

  useEffect(() => {
    setTabName(isSigned ? "Signed" : "Ready to Sign");
  }, [isSigned, location]);

  return (
    <>
      <AmendmentsProvider>
        {/* 
         amendments Container contains the main logic and UI for the amendments page.
         It is wrapped with AmendmentsProvider to provide the necessary context to its children.
       */}
        {!showReviewSign ? (
          <>
            {/* <div className="flex items-center justify-between">
              <h2 className="text-2xl mb-2"> Amendments </h2>
            </div> */}
            <div className="relative flex flex-wrap items-center mb-1.5">
              <AmendmentsSearchBar activeTab={tabName} />
              <AmendmentsButtons
                activeTab={tabName}
                buttons={AmendmentsButtonsList}
                handleReviewSign={() => {
                  setShowReviewSign(true);
                }}
              />
            </div>
          <div className="amend_grid">
          {/* <AmendmentsGrid /> */}
            <TabComponent
              selectedTabIndex={tabName === "Ready to Sign" ? 0 : tabName === "Signed" ? 1 : 2}
              onTabSelect={(index: number) => {
                // Set the tab name based on the selected index
                if (index === 0) setTabName("Ready to Sign");
                else if (index === 1) setTabName("Signed");
                // else if (index === 2) setTabName("Unserved Amendments");
              }}
              tabs={[
                {
                  id: 0,
                  name: "Ready to Sign",
                  content: <UnsignedAmendmentGrid activeTab={tabName} />,
                },
                {
                  id: 1,
                  name: "Signed",
                  content: <SignedAmendmentGrid />,
                },
                // {
                //   id: 2,
                //   name: "Unserved Amendments",
                //   content: <UnservedAmendmentGrid />,
                // },
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
      </AmendmentsProvider>
    </>
  );
};

export default Amendments;
