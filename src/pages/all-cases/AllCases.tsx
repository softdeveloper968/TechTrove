import React, { useState } from "react";
import { AllCasesProvider } from "./AllCasesContext";
import { AllCaseButtonsList } from "utils/constants";
import AllCases_SearchBar from "./components/AllCasesActions/AllCases_SearchBar";
import { AllCasesButtons } from "./components/AllCasesButtons";
import AllCasesGrid from "./components/AllCasesGrid";
import AllCases_SearchFilters from "./components/AllCases_SearchFilters";
import ReviewSign from "./ReviewSign";
import { useAuth } from "context/AuthContext";

const AllCases = () => {
   const { 
      selectedStateValue
    } = useAuth();
   const [typeVal, setType] = useState<string>("");
   const [showReviewSign, setShowReviewSign] = useState<boolean>(false);

   return (
      <>
         <AllCasesProvider>
            {!showReviewSign && (
               <>
                  <div className="relative flex flex-wrap items-center md:mb-2">
                     <AllCases_SearchBar />

                     <AllCasesButtons 
                        buttons={ selectedStateValue === "GA" ? AllCaseButtonsList : []}
                        handleFileDismissalReviewSign={() => {
                           setShowReviewSign(true);
                           setType("dismissal");
                        }}
                        handleFileWritsReviewSign={() => {
                           setShowReviewSign(true);
                           setType("writ");
                        }}
                        handleFileAmendmentReviewSign={() => {
                           setShowReviewSign(true);
                           setType("amendment");
                        }}
                     />

                  </div>
                  <AllCases_SearchFilters />
                  <div className="cases_grid">
                     <AllCasesGrid />
                  </div>
               </>
            )}
            
            {showReviewSign && (
               <ReviewSign
                  filingType={typeVal}
                  handleBack={() => setShowReviewSign(false)}
               />
            )}
         </AllCasesProvider>
      </>
   );
};

export default AllCases;
