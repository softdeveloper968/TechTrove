import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { FormikHelpers } from "formik";
import Spinner from "components/common/spinner/Spinner";
import ReviewSignDocument from "components/common/documentReview/ReviewSign";
import Spinner2 from "components/common/spinner/Spinner2";
import { convertToEasternISOString, formatZip, mapDismissalReasonToEnum } from "utils/helper";
import AllCasesService from "services/all-cases.service";
import { IAllCasesItems, IAllCasesReason, IAllCasesSign, IWritCasesSign, IWritsCase } from "interfaces/all-cases.interface";
import { useAllCasesContext } from "./AllCasesContext";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import { IAmendmentsSign } from "interfaces/amendments.interface";

type ReviewSignProps = {
   filingType: string;
   handleBack: () => void;

};

const ReviewSign = (props: ReviewSignProps) => {
   const {
      allCases,
      bulkRecords,
      setBulkRecords,
      selectedReason,
      filteredRecords,
      setFilteredRecords,
      selectedAllCasesId,
      setSelectedAllCasesId,
      selectedCaseIdsForFiling,
      setSelectedCaseIdsForFiling,
      setClickedFilingButton,
      proceedWithDismissals
   } = useAllCasesContext();
   const navigate = useNavigate();
   const isMounted = useRef(true);
   const [pdfLink, setPdfLink] = useState<string>("");
   const [pdfCount, setPdfCount] = useState<number>(0);
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [showSigningSpinner, setShowSigningSpinner] = useState<boolean>(false);
   const [showPopUpWhenSign, setShowPopUpWhenSign] =
      useState<boolean>(false);
   const handleReviewSign = async () => {
      try {
         setShowSpinner(true);
         let response;
         switch (props.filingType) {
            case "amendment":
               console.log(filteredRecords.map(i => i.monthlyRent))
               const amendmentItems = filteredRecords
                  // .filter((item) => selectedAllCasesId.includes(item.id || ""))
                  .map((item: IAllCasesItems) => ({
                     dispoId: item.id,
                     caseNo: item.caseNo,
                     propertyName: item.propertyName,
                     county: item.county,
                     tenantFirstName: item.tenantFirstName,
                     tenantLastName: item.tenantLastName,
                     unit: item.unit,
                     city: item.city,
                     state: item.state,               
                     // zip: item.zip,
                     zip: item.zip != null ? formatZip(item.zip) : "",
                     evictionServiceMethod: item.evictionServiceMethod,
                     attorneyName: item.attorneyName,
                     address: item.address,
                     ownerName: item.ownerName,
                     reason: item.reason ?? "",
                     monthlyRent: parseFloat(item.monthlyRent ?? 0),
                     totalRent: parseFloat(item.totalRent ?? 0),
                     evictionAffiantIs: item.evictionAffiantIs,
                     // Tenant1Last:item.tenantNames[0]?.lastName,
                     // Tenant1First:item.tenantNames[0]?.firstName,
                     // Tenant1MI:item.tenantNames[0]?.middleName,
                     // Tenant2Last:item.tenantNames[1]?.lastName,
                     // Tenant2First:item.tenantNames[1]?.firstName,
                     // Tenant2MI:item.tenantNames[1]?.middleName,
                     // Tenant3Last:item.tenantNames[2]?.lastName,
                     // Tenant3First:item.tenantNames[2]?.firstName,
                     // Tenant3MI:item.tenantNames[2]?.middleName,
                     // Tenant4Last:item.tenantNames[3]?.lastName,
                     // Tenant4First:item.tenantNames[3]?.firstName,
                     // Tenant4MI:item.tenantNames[3]?.middleName,
                     // Tenant5Last:item.tenantNames[4]?.lastName,
                     // Tenant5First:item.tenantNames[4]?.firstName,
                     // Tenant5MI:item.tenantNames[4]?.middleName,
                     Tenant1Last: item.tenant1Last,
                     Tenant1First: item.tenant1First,
                     Tenant1MI: item.tenant1MI,
                     Tenant2Last: item.tenant2Last,
                     Tenant2First: item.tenant2First,
                     Tenant2MI: item.tenant2MI,
                     Tenant3Last: item.tenant3Last,
                     Tenant3First: item.tenant3First,
                     Tenant3MI: item.tenant3MI,
                     Tenant4Last: item.tenant4Last,
                     Tenant4First: item.tenant4First,
                     Tenant4MI: item.tenant4MI,
                     Tenant5Last: item.tenant5Last,
                     Tenant5First: item.tenant5First,
                     Tenant5MI: item.tenant5MI,
                     AndAllOtherOccupants: item.andAllOtherOccupants,
                     EvictionTotalRentDue: item.evictionTotalRentDue,
                     AllMonths: item.allMonths,
                     EvictionOtherFees: item.evictionOtherFees,
                     PropertyPhone: item.propertyPhone,
                     PropertyEmail: item.propertyEmail,
                     PropertyAddress: item.propertyAddress,
                     PropertyCity: item.propertyCity,
                     PropertyState: item.propertyState,
                     PropertyZip: item.propertyZip != null ? formatZip(item.propertyZip) : "",
                     // PropertyZip: item.propertyZip,
                     AttorneyBarNo: item.attorneyBarNo,
                     AttorneyEmail: item.attorneyEmail,
                     FilerBusinessName: item.filerBusinessName,
                     FilerPhone: item.filerPhone,
                     FilerEmail: item.filerEmail,
                     Expedited: item.expedited,
                     StateCourt: item.stateCourt
                  }));
               response = await AllCasesService.getAmendmentDocumentForSign(amendmentItems);
               break;

            case "dismissal":
               const dismissalItems = selectedReason.map((item: IAllCasesReason) => ({
                  dispoId: item.dispoId,
                  reason: item.reason ? mapDismissalReasonToEnum(item.reason) : undefined,
               }));
               response = await AllCasesService.getDismissalsDocumentForSign(dismissalItems);
               break;

            case "writ":
               const fileWritsRequest = filteredRecords.map((item: IAllCasesItems) => ({
                  caseId: item.id,
                  reason: item.selectedReason != null && item.selectedReason != "" ? parseInt(item.selectedReason ?? '0', 10) : null,
                  writOrderDate: item.writOrderDate ? convertToEasternISOString(item.writOrderDate as string) : null,
                  paymentAmountOwned: item.paymentAmountOwned != null && item.paymentAmountOwned != "" ? parseFloat(item.paymentAmountOwned ?? '0') : null,
                  paymentDueOn: item.paymentDueOn ? convertToEasternISOString(item.paymentDueOn as string) : null,
                  writComment: item.writComment ?? "",
                  hasSSN: item.hasSSN === "Yes" ? true : false,
                  isCorporation: item.isCorporation === "Yes" ? true : false,
                  writApplicantIs: item.writApplicantIS === "Other" ? item.otherApplicantIS : item.writApplicantIS,
                  writApplicantPhone: item.writApplicantPhone,
                  writLaborId: item.writLaborId
               } as IWritsCase));

               response = await AllCasesService.getWritsDocumentForSign(fileWritsRequest);
               break;

            default:
               throw new Error("Invalid type");
         }

         if (response?.status === HttpStatusCode.Ok && response.data) {
            setPdfLink(response.data.combinedPdfUrl);
            setPdfCount(response.data.pdfCount);
         }
         // else {
         //    toast.error("Something went wrong. Please try again!", {
         //       position: toast.POSITION.TOP_RIGHT,
         //    });
         // }
      } finally {
         setShowSpinner(false);
      }
   };

   const signWritPayloadRequest = (formValues: any) => {
      const fileWritsRequest = filteredRecords.map((item: IAllCasesItems) => ({
         caseId: item.id,
         reason: item.selectedReason != null && item.selectedReason != "" ? parseInt(item.selectedReason ?? '0', 10) : null,
         writOrderDate: item.writOrderDate ? convertToEasternISOString(item.writOrderDate as string) : null,
         paymentAmountOwned: parseFloat(item.paymentAmountOwned ?? '0'),
         paymentDueOn: item.paymentDueOn ? convertToEasternISOString(item.paymentDueOn as string) : null,
         writComment: item.writComment ?? "",
         hasSSN: item.hasSSN === "Yes" ? true : false,
         isCorporation: item.isCorporation === "Yes" ? true : false,
         writApplicantIs: item.writApplicantIS === "Other" ? item.otherApplicantIS : item.writApplicantIS,
         writApplicantPhone: item.writApplicantPhone,
         writLaborId: item.writLaborId
      } as IWritsCase));

      const request: IWritCasesSign = {
         signature: formValues.sign,
         writs: fileWritsRequest,
      };

      return request;
   };

   const handleOkClick = async () => {
      setShowPopUpWhenSign(false)
      setShowSigningSpinner(false);
      setShowSpinner(false);
      toast.success('Processing case(s) in background.');
      navigate(`/${props.filingType === 'writ' ? 'writs-of-possession' : `${props.filingType}s`}?signed=true`);
   };

   const getAmendmentItems = () : IAmendmentsSign[] => {
      return filteredRecords
      // .filter((item) => selectedAllCasesId.includes(item.id || ""))
      .map((item: IAllCasesItems) => ({
         dispoId: item.id,
         caseNo: item.caseNo,
         propertyName: item.propertyName,
         county: item.county,
         tenantFirstName: item.tenantFirstName,
         tenantLastName: item.tenantLastName,
         unit: item.unit,
         city: item.city,
         state: item.state,
         // zip: item.zip,
         zip: item.zip != null ? formatZip(item.zip) : "",
         evictionServiceMethod: item.evictionServiceMethod,
         attorneyName: item.attorneyName,
         address: item.address,
         ownerName: item.ownerName,
         reason: item.reason ?? "",
         monthlyRent: parseFloat(item.monthlyRent ?? 0),
         totalRent: parseFloat(item.totalRent ?? 0),
         evictionAffiantIs: item.evictionAffiantIs,
         // Tenant1Last:item.tenantNames[0]?.lastName,
         // Tenant1First:item.tenantNames[0]?.firstName,
         // Tenant1MI:item.tenantNames[0]?.middleName,
         // Tenant2Last:item.tenantNames[1]?.lastName,
         // Tenant2First:item.tenantNames[1]?.firstName,
         // Tenant2MI:item.tenantNames[1]?.middleName,
         // Tenant3Last:item.tenantNames[2]?.lastName,
         // Tenant3First:item.tenantNames[2]?.firstName,
         // Tenant3MI:item.tenantNames[2]?.middleName,
         // Tenant4Last:item.tenantNames[3]?.lastName,
         // Tenant4First:item.tenantNames[3]?.firstName,
         // Tenant4MI:item.tenantNames[3]?.middleName,
         // Tenant5Last:item.tenantNames[4]?.lastName,
         // Tenant5First:item.tenantNames[4]?.firstName,
         // Tenant5MI:item.tenantNames[4]?.middleName,
         Tenant1Last: item.tenant1Last,
         Tenant1First: item.tenant1First,
         Tenant1MI: item.tenant1MI,
         Tenant2Last: item.tenant2Last,
         Tenant2First: item.tenant2First,
         Tenant2MI: item.tenant2MI,
         Tenant3Last: item.tenant3Last,
         Tenant3First: item.tenant3First,
         Tenant3MI: item.tenant3MI,
         Tenant4Last: item.tenant4Last,
         Tenant4First: item.tenant4First,
         Tenant4MI: item.tenant4MI,
         Tenant5Last: item.tenant5Last,
         Tenant5First: item.tenant5First,
         Tenant5MI: item.tenant5MI,
         AndAllOtherOccupants: item.andAllOtherOccupants,
         EvictionTotalRentDue: item.evictionTotalRentDue,
         AllMonths: item.allMonths,
         EvictionOtherFees: item.evictionOtherFees,
         PropertyPhone: item.propertyPhone,
         PropertyEmail: item.propertyEmail,
         PropertyAddress: item.propertyAddress,
         PropertyCity: item.propertyCity,
         PropertyState: item.propertyState,
         PropertyZip: item.propertyZip != null ? formatZip(item.propertyZip) : "",
         // PropertyZip: item.propertyZip,
         AttorneyBarNo: item.attorneyBarNo,
         AttorneyEmail: item.attorneyEmail,
         FilerBusinessName: item.filerBusinessName,
         FilerPhone: item.filerPhone,
         FilerEmail: item.filerEmail,
         Expedited: item.expedited,
         StateCourt: item.stateCourt,
         tenant1Id: item.tenantNames[0]?.id,
         tenant2Id: item.tenantNames[1]?.id,
         tenant3Id: item.tenantNames[2]?.id,
         tenant4Id: item.tenantNames[3]?.id,
         tenant5Id: item.tenantNames[4]?.id,
      }));
   }

   const handleSignature = useCallback(async (formValues: any) => {
      try {
         setShowSigningSpinner(true);
         setShowSpinner(true);
         setShowPopUpWhenSign(true);

         let actionDescription =
            props.filingType === "dismissal"
               ? "Dismissal(s)"
               : props.filingType === "writ"
                  ? "Writ(s)"
                  : "Amendment(s)";

         const selectedIds = allCases.items
            .filter((item) => selectedAllCasesId.includes(item.id ?? "") && item.caseNo 
            && (proceedWithDismissals || !item.isDismissal)
         )
            .map((item) => item.id ?? "");

         let request: IAllCasesSign = {
            signature: formValues.sign,
            dispoIds: selectedCaseIdsForFiling.length ? selectedCaseIdsForFiling : selectedIds,
            resources: getAmendmentItems()
         };

         // Add properties specific to amendments if applicable
         if (props.filingType === "amendment") {
            // request.additionalProperty = value;
         }

         // Call the appropriate service based on the action type
         let apiResponse;

         switch (props.filingType) {
            case "dismissal":
               apiResponse = await AllCasesService.signDismissals(request);
               break;
            case "amendment":
               apiResponse = await AllCasesService.signAmendments(request);
               break;
            case "writ":
               apiResponse = await AllCasesService.signWritsOfPossession(signWritPayloadRequest(formValues));
               break;
            default:
               throw new Error("Invalid type");
         }

         if (apiResponse.status === HttpStatusCode.Ok) {
            toast.success(`${actionDescription} have been successfully signed`);
            setBulkRecords([]);
            setFilteredRecords([]);
            setSelectedAllCasesId([]);
            setSelectedCaseIdsForFiling([]);
            navigate(`/${props.filingType === 'writ' ? 'writs-of-possession' : `${props.filingType}s`}?signed=true`);
         }
         //  else {
         //    toast.error("Something went wrong. Please try again!");
         // }
      } finally {
         setShowSigningSpinner(false);
         setShowSpinner(false);
         setShowPopUpWhenSign(false);
      }
   }, []);

   const handleBack = () => {
      setClickedFilingButton(props.filingType);
      // if (selectedCaseIdsForFiling.length) {
      //    setSelectedCaseIdsForFiling([]);
      //    let records: React.SetStateAction<IAllCasesItems[]> = [];
      //    records = bulkRecords.filter((item) =>
      //       !selectedCaseIdsForFiling.includes(item.id || "") && item.caseNo?.length
      //    );
      //    setBulkRecords(records);
      // };

      // setFilteredRecords([]);
      props.handleBack();
   };

   useEffect(() => {
      if (isMounted.current) {
         handleReviewSign();
         isMounted.current = false;
      }

   }, []);

   return (
      <>
         {showSpinner && <Spinner></Spinner>}
         {/* {showSigningSpinner && <Spinner2 
        showLabel={showSigningSpinner}
        labelText={"Your cases are submitting to the court. This may take a few moments. Please remain on this screen until the process is complete."}
        ></Spinner2>} */}
         <ReviewSignDocument
            handleBack={handleBack}
            handleSignature={(values: { sign: string; }, formikHelpers: FormikHelpers<{ sign: string; }>) => handleSignature(values)}
            pdfLink={pdfLink}
            pdfCount={pdfCount}
            showSpinner={showSpinner}
         ></ReviewSignDocument>
         {showPopUpWhenSign && (
            <>
               <Modal
                  showModal={showPopUpWhenSign}
                  onClose={() => {
                     {
                        // setShowPopUpWhenSign(false);
                     }
                  }}
                  showCloseIcon={true}
                  width="max-w-md"
               >
                  {/* Container for the content */}
                  <div id="fullPageContent">
                     <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                        <div className="text-center pr-4 sm:text-left">
                           <h3
                              className="text-sm font-semibold leading-5 text-gray-900"
                              id="modal-title"
                           >
                              Cases are in progress. Once signing is completed, the cases will move to the Signed queue.
                           </h3>
                        </div>
                        {/* Display the grid with late notices */}
                        <div className="relative pt-2.5">
                           <div className="pt-2.5 flex justify-end mt-1.5">
                              <Button
                                 type="submit"
                                 isRounded={false}
                                 title={`Ok`}
                                 handleClick={() => {
                                    handleOkClick();
                                 }}
                                 classes="text-xs bg-[#2472db] hover:bg-[#0d5ecb] inline-flex justify-center items-center rounded-md font-semibold py-2.5 px-5 text-white"
                              ></Button>
                           </div>
                        </div>
                     </div>
                  </div>
               </Modal>
            </>
         )}
      </>
   );
};

export default ReviewSign;
