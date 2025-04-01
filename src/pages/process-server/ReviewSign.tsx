import React, { useCallback, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FormikHelpers } from "formik";
import Spinner from "components/common/spinner/Spinner";
import ReviewSignDocument from "components/common/documentReview/ReviewSign";
import Spinner2 from "components/common/spinner/Spinner2";
import ProcessServerService from "services/process-server.service";
import { HttpStatusCode, UserRole } from "utils/enum";
import { IReviewSignAOS, IReviewSignAOSResource, ISignAOSResource, ISignedAOSResource } from "interfaces/process-server.interface";
import { useAuth } from "context/AuthContext";
import { useProcessServerContext } from "./ProcessServerContext";

import Modal from "components/common/popup/PopUp";
import { FaExclamationTriangle } from "react-icons/fa";
import { catchError, forkJoin, from, of } from "rxjs";

type ReviewSignProps = {
   dispoIds: string[];
   casesIds: string[];
   serverCasesIds: string[];
   showReviewSign: boolean;
   setShowReviewSign: (show: boolean) => void;
   isSignInput: boolean;
   reviewSignResource: IReviewSignAOS[];
   handleBack: () => void;
};

const ReviewSign = (props: ReviewSignProps) => {
   const {
      processServerCases,
      getProcessServerCases,
      setSelectedProcessServerId,
      setFilteredRecords,
      isBackClick,setIsBackClick,
setBulkRecords
   } = useProcessServerContext();
   const navigate = useNavigate();
   const { userRole } = useAuth();
   const isMounted = useRef(true);
   const [pdfLink, setPdfLink] = useState<string>("");
   const [pdfCount, setPdfCount] = useState<number>(0);
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [showSigningSpinner, setShowSigningSpinner] = useState<boolean>(false);

   const location = useLocation();

   useEffect(() => {
      setIsBackClick(false);
      if (isMounted.current) {
         getDocumentsForSignature();
         isMounted.current = false;
      }

      return () => {
         isMounted.current = false;
      };

   }, []);

   const getDocumentsForSignature = async () => {
      try {
         setShowSpinner(true);
         // const response = await ProcessServerService.getDocumentsForSignature(props.dispoIds,props.isSignInput);
         // const response = await ProcessServerService.getDocumentsForSignature(props.reviewSignResource,props.isSignInput,props.casesIds);
         const response = await ProcessServerService.getDocumentsForSignature(props.serverCasesIds,props.isSignInput);
         if (response.status === HttpStatusCode.OK) {
            if(response.data.isSuccess === false) {
               if(props.isSignInput && response.data.message != null && response.data.message != "")
               {
                  toast.error(response.data.message);
               }
               else
               {
               toast.info("No AOS documents were found, or the case may have already been signed.");
               }
            }
            setPdfLink(response?.data?.combinedPdfUrl);
            setPdfCount(response.data.pdfCount);
         } else {
            console.error("Failed to fetch documents for signature");
         }
      } catch (error) {
         console.error("An error occurred while fetching documents for signature", error);
      } finally {
         setShowSpinner(false);
      }
   };

   const handleSignature = useCallback(async (formValues: any) => {
      try {
         setShowSigningSpinner(true);
         setShowSpinner(true);
         const signValue = formValues?.sign.toString() || "";
         const batchSize = 10;
         const batches = [];
         for (let index = 0; index < props.serverCasesIds.length; index += batchSize) {
            batches.push(props.serverCasesIds.slice(index, index + batchSize));
         }
         let hasError = false;
         let responseMessage = "";
         for (let index = 0; index < batches.length; index += 3) {
            const batchGroup = batches.slice(index, index + 3);
            const apiCalls$ = batchGroup.map((batch) => {
               const resource: ISignedAOSResource = {
                  sign: signValue,
                  serverCasesIds: batch,
               };
               return from(ProcessServerService.signAOSDocuments(resource)).pipe(
                  catchError((err) => {
                     hasError = true;
                     return of({
                        status: HttpStatusCode.InternalServerError,
                        data: { message: err.message },
                     });
                  })
               );
            });
            const responses = await forkJoin(apiCalls$).toPromise();
            console.log(responses);
            if (responses?.some((response: any) => response.status !== HttpStatusCode.OK)) {
               hasError = true;
               const firstError = responses.find((response: any) => response.status !== HttpStatusCode.OK);
               responseMessage = firstError?.data?.message;
               break;
            } else {
               responseMessage = responses?.[responses.length - 1]?.data?.message;
            }
         }
         if (!hasError) {
            setPdfCount(0);
            setPdfLink("");
            toast.success(responseMessage);
            props.setShowReviewSign(false);
            if (
               location.pathname === "/process-server" &&
               (userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin))
            ) {
               getProcessServerCases(
                  1,
                  100,
                  processServerCases.searchParam,
                  processServerCases.serverName,
                  processServerCases.serviceMethod,
                  processServerCases.dateRange
               );
               setIsBackClick(true);
               setBulkRecords([]);
               setFilteredRecords([]);
               setSelectedProcessServerId([]);
               navigate("/process-server");
            } else if (
               userRole.includes(UserRole.C2CAdmin) ||
               userRole.includes(UserRole.ChiefAdmin)
            ) {
               navigate("/all-cases");
            } else {
               navigate("/home");
            }
         } else {
            toast.error(responseMessage);
         }
      } catch (error) {
         console.log(error);
      } finally {
         setShowSigningSpinner(false);
         setShowSpinner(false);
      }
   }, []);


   // const handleSignature = useCallback(async (formValues: any) => {
   //    try {
   //       setShowSigningSpinner(true);
   //       setShowSpinner(true);
   //       // Ensure formValues is a string
   //       const signValue = formValues?.sign.toString() || "";

   //       // const resource: ISignAOSResource = {
   //       //    sign: signValue,
   //       //    dispoIds: props.dispoIds
   //       // };

   //       // const resource: IReviewSignAOSResource = {
   //       //    sign: signValue,
   //       //    casesRecords: props.reviewSignResource,
   //       //    casesIds:props.casesIds
   //       // };

   //       const resource: ISignedAOSResource = {
   //          sign: signValue,
   //          serverCasesIds:props.serverCasesIds
   //       };
   //       const response = await ProcessServerService.signAOSDocuments(resource);
   //       if (response.status === HttpStatusCode.OK) {
   //          setPdfCount(0);
   //          setPdfLink("");
   //          toast.success(response.data.message);
   //          props.setShowReviewSign(false);
   //          if (location.pathname === "/process-server" && ( userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin))) {
   //             getProcessServerCases(1, 100, processServerCases.searchParam, processServerCases.serverName, processServerCases.serviceMethod, processServerCases.dateRange);
   //             setBulkRecords([]);
   //             setFilteredRecords([]);
   //             setSelectedProcessServerId([]);
   //             navigate("/process-server"); 
   //          }
   //          else if(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin))
   //             navigate("/all-cases");
   //          else
   //             navigate("/home");
   //       } else {
   //          toast.error(response.data.message);
   //       }
   //    } catch (error) {
   //       console.log(error);
   //    } finally {
   //       setShowSigningSpinner(false);
   //       setShowSpinner(false);
   //    }

   // }, []);

   const handleBack = () => {
      props.setShowReviewSign(false);
      if (location.pathname === "/process-server" && (userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) )) {
         setIsBackClick(true);
         navigate("/process-server"); 
         // props.handleBack();
      }
      else if(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin))
         navigate("/all-cases");
      else
         navigate("/home");
   };

   return (
      <>
         {(showSpinner) && <Spinner />}

         {showSigningSpinner && <Spinner2
            showLabel={showSigningSpinner}
            labelText={"Your cases are being submitted to the court. This may take a few moments. Kindly stay with us until the process is complete."}
         ></Spinner2>}

         <ReviewSignDocument
            handleBack={handleBack}
            handleSignature={(values: {
               sign: string;
            }, formikHelpers: FormikHelpers<{
               sign: string;
            }>) => handleSignature(values)}
            pdfLink={pdfLink}
            pdfCount={pdfCount}
            showSpinner={showSigningSpinner}
            hideSignInput={props.isSignInput}
         />
      </>
   );
}

export default ReviewSign;