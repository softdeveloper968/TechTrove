import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ProcessServerProvider } from "./ProcessServerContext";
import { useAuth } from "context/AuthContext";
import ProcessServerGrid from "./components/ProcessServerGrid";
import ProcessServerSearchBar from "./components/ProcessServerActions/ProcessServer_SearchBar";
import ProcessServerButtons from "./components/ProcessServerButtons";
import ProcessServerSearchFilters from "./components/ProcessServer_SearchFilters";
import { ProcessServerButtonsList } from "utils/constants";
import { UserRole } from "utils/enum";
import ReviewSign from "./ReviewSign";
import { IReviewSignAOS } from "interfaces/process-server.interface";

type ProcessServerProps = {};

const ProcessServer = (props: ProcessServerProps) => {
   const { userRole } = useAuth();
   const location = useLocation();
   const [dispoIds, setDispoIds] = useState<string[]>([]);
   const [casesIds, setCasesIds] = useState<string[]>([]);
   const [serverCasesIds, setServerCasesIds] = useState<string[]>([]);
   const [reviewSignResource, setReviewSignResource] = useState<IReviewSignAOS[]>([]);
   const [showReviewSign, setShowReviewSign] = useState<boolean>(false);
   const [isSignInput, setIsSignInput] = useState<boolean>(false);

   useEffect(() => {
      const searchParams = new URLSearchParams(location.search);
      // if (location.pathname === "/process-server-sign" && searchParams.has('dispoIds')) {
      //    setShowReviewSign(true);
      //    setDispoIds(searchParams.get('dispoIds')?.split(',') || []);
      // }
      if (location.pathname === "/process-server-sign" && searchParams.has('casesIds')) {
         setShowReviewSign(true);
         // setCasesIds(searchParams.get('casesIds')?.split(',') || []);
         setServerCasesIds(searchParams.get('casesIds')?.split(',') || []);

      }
      // if (location.pathname === "/process-server-sign" && searchParams.has('casesIds')) {
      //    setShowReviewSign(true);

      //    // Extract and decode the serverCaseInfo from URL
      //    const serverCaseInfoJson = searchParams.get('casesIds');
      //    if (serverCaseInfoJson) {
      //       // Parse the JSON string into an array of objects
      //       const serverCaseInfo = JSON.parse(decodeURIComponent(serverCaseInfoJson));

      //       // Map the array to match the IReviewSignAOS interface
      //       const reviewSignData = serverCaseInfo.map((item: { DispoId: string; FilingType: string; ServiceMethod: string; ServiceDate: string | number | Date; ServerName: string; }) => ({
      //          dispoId: item.DispoId,
      //          filingType: item.FilingType,
      //          serviceMethod: item.ServiceMethod,
      //          serviceDate: new Date(item.ServiceDate), // Convert string to Date object
      //          serverName: item.ServerName
      //       }));

      //       // Set the parsed data into state
      //       setReviewSignResource(reviewSignData);
      //    }
      // }
   }, [location.pathname, location.search]);

   return (
      <ProcessServerProvider>
         {!showReviewSign && (
            <>
               <div className="relative flex flex-wrap items-center mb-1.5">
                  <ProcessServerSearchBar />
                  <ProcessServerButtons
                     buttons={ProcessServerButtonsList}
                     handleClick={() => { }}
                     // handleReviewSign={(dispoId: string[], isSignInput: boolean) => {
                     //    setShowReviewSign(true);
                     //    // setDispoIds(dispoIds.length === 0 ? dispoId : dispoIds)
                     //    setDispoIds(dispoId.length === 0 ? dispoIds : dispoId)
                     //    setIsSignInput(isSignInput);
                     //  }}
                      handleReviewSign={(serverCaseId: string[], isSignInput: boolean) => {
                        setShowReviewSign(true);
                        // setDispoIds(dispoIds.length === 0 ? dispoId : dispoIds)
                        setServerCasesIds(serverCaseId.length === 0 ? serverCasesIds : serverCaseId)
                        setIsSignInput(isSignInput);
                      }}
                     //  handleReviewSign={(reviewSignAOSArray: IReviewSignAOS[], isSignInput: boolean) => {
                     //    setShowReviewSign(true);
                     //    // setDispoIds(dispoIds.length === 0 ? dispoId : dispoIds)
                     //    setDispoIds(dispoIds.length === 0 ? reviewSignAOSArray.map(x=>x.dispoId) : dispoIds)
                     //    setReviewSignResource(reviewSignAOSArray.length === 0 ? reviewSignResource : reviewSignAOSArray)
                     //    setIsSignInput(isSignInput);
                     //  }}
                  />
               </div>
               {userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin)? <ProcessServerSearchFilters /> : null}
               <div className="process_grid">
                  <ProcessServerGrid />
               </div>
            </>
         )}

         {showReviewSign && (
            <ReviewSign
               dispoIds={dispoIds}
               casesIds={casesIds}
               reviewSignResource={reviewSignResource}
               showReviewSign={showReviewSign}
               setShowReviewSign={() => 
                  {setShowReviewSign(false) ;
                     setIsSignInput(false)}}
               isSignInput={isSignInput}
               serverCasesIds={serverCasesIds}
               handleBack={() => {
                  setShowReviewSign(false);
                }}
            />
         )}

      </ProcessServerProvider>
   );
};

export default ProcessServer;