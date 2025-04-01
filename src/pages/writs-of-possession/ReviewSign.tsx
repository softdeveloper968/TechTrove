import React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { FormikHelpers } from "formik";


import Spinner from "components/common/spinner/Spinner";
import ReviewSignDocument from "components/common/documentReview/ReviewSign";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import Spinner2 from "components/common/spinner/Spinner2";

import AllCasesService from "services/all-cases.service";
import AuthService from "services/auth.service";

import { useWritsOfPossessionContext } from "./WritsOfPossessionContext";
import { useAuth } from "context/AuthContext";
import { IAllCasesSign, IWritCasesSign, IWritsCase, IWritsUnsignedCase } from "interfaces/all-cases.interface";
import { convertToEasternISOString } from "utils/helper";
type ReviewSignProps =
   {
      handleBack: () => void;
   }

const ReviewSign = (props: ReviewSignProps) => {
   const { setUnsignedWritCount } = useAuth();
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [showSigningSpinner, setShowSigningSpinner] = useState<boolean>(false);
   const [showPopUpWhenSign, setShowPopUpWhenSign] =
      useState<boolean>(false);
   // selected signed dismisal id
   const {
      selectedWritsOfPossessionId,
      setSelectedUnSignedWritsId,
      unsignedWrits,
      setAllUnsignedWrits,
      getAllWritsOfPossession,
      setSelectedWritsOfPossessionId
   } = useWritsOfPossessionContext();
   const navigate = useNavigate();
   const isMounted = useRef(true);
   // set pdflink
   const [pdfLink, setPdfLink] = useState<string>("");
   const [pdfCount, setPdfCount] = useState<number>(0);

   const handleReviewSign = async () => {
      try {
         setShowSpinner(true);
         // const fileWritsIds: IWritsUnsignedCase[] = selectedWritsOfPossessionId.map(id => ({ caseId: id }));
         const writRequest = previewWritPayloadRequest();
         const apiResponse = await AllCasesService.getWritsDocumentForSign(writRequest);
         if (apiResponse.status === HttpStatusCode.Ok) {
            setPdfLink(apiResponse.data.combinedPdfUrl);
            setPdfCount(apiResponse.data.pdfCount);
         } else {
            toast.error("Something went wrong. Please try again!", {
               position: toast.POSITION.TOP_RIGHT,
            });
         }
      } finally {
         setShowSpinner(false);
      }
   };

   const handleOkClick = async () => {
      // const userInfo = JSON.parse(localStorage.getItem("userDetail") ?? "");
      // if (unsignedWrits.items.some(x => x.id && !selectedWritsOfPossessionId.includes(x.id))) {
      //    getAllWritsOfPossession(1, 100, false);
      //    setShowPopUpWhenSign(false)
      //    props.handleBack();
      // }
      var count= unsignedWrits.totalCount - selectedWritsOfPossessionId.length;
      if (unsignedWrits.totalCount - selectedWritsOfPossessionId.length > 0) {
            getAllWritsOfPossession(1, 100, false, [], '');
         setShowPopUpWhenSign(false)
         props.handleBack();
      }
      else {
         getAllWritsOfPossession(1, 100, true, [], '');
         navigate(`/writs-of-possession?signed=true`);
         setShowPopUpWhenSign(false)
         props.handleBack();
      }
      setSelectedWritsOfPossessionId([]);
   };

   const previewWritPayloadRequest = () => {
      const selectedWritsForSign = unsignedWrits.items.filter((item) =>
         selectedWritsOfPossessionId.includes(item.id ?? "")
      );
      const writsRequest = selectedWritsForSign.map((item) => ({
         caseId: item.id,
         reason: parseInt(item.reason ?? '0', 10),
         writOrderDate: item.writOrderDate ?? null,
         paymentAmountOwned: parseFloat(item.paymentAmountOwned ?? '0'),
         paymentDueOn: item.paymentDueOn ?? null,
         writComment: item.writComment ?? "",
         hasSSN: item.hasSSN,
         isCorporation: item.isCorporation,
         writApplicantIs: item.writApplicantIs,
         writApplicantPhone: item.writApplicantPhone,
         writLaborId: item.writLaborId
      } as IWritsCase));

      return writsRequest;
   }

   const signWritPayloadRequest = (formValues: any) => {
      const selectedWritsForSign = unsignedWrits.items.filter((item) =>
         selectedWritsOfPossessionId.includes(item.id ?? "")
      );
      const writsRequest = selectedWritsForSign.map((item) => ({
         caseId: item.id,
         reason: parseInt(item.reason ?? '0', 10),
         writOrderDate: item.writOrderDate ?? null,
         paymentAmountOwned: parseFloat(item.paymentAmountOwned ?? '0'),
         paymentDueOn: item.paymentDueOn ?? null,
         writComment: item.writComment ?? "",
         hasSSN: item.hasSSN,
         isCorporation: item.isCorporation,
         writApplicantIs: item.writApplicantIs,
         writApplicantPhone: item.writApplicantPhone,
         writLaborId: item.writLaborId
      } as IWritsCase));

      const request: IWritCasesSign = {
         signature: formValues.sign,
         writs: writsRequest,
      };
      
      return request;
   };

   const handleSignature = async (formValues: any) => {
      try {
         setShowSigningSpinner(true);
         // setShowSpinner(true);
         setShowPopUpWhenSign(true);
         let request: IAllCasesSign = {
            signature: formValues.sign,
            dispoIds: selectedWritsOfPossessionId,
         };
         const apiResponse = await AllCasesService.signWritsOfPossession(signWritPayloadRequest(formValues));
         if (apiResponse.status === HttpStatusCode.Ok) {
            //  setToggleConfirmation(true);
            unsignedWrits.items = unsignedWrits.items.filter((item) =>
               !selectedWritsOfPossessionId.includes(item.id ?? "")
            );
            setAllUnsignedWrits((prev) => ({
               ...prev,
               items: unsignedWrits.items,
               totalCount: prev.totalCount - selectedWritsOfPossessionId.length
            }));
            // getAllWritsOfPossession(1, 100, true);
            toast.success("Writ(s) have been successfully signed");
         }
         // setSelectedUnSignedWritsId([]);
         // set unsigned writs count
         handleUnsignedCaseCount();
         // navigate(`/writs-of-possession?signed=true`);
         // props.handleBack();
      } finally {
         setShowSigningSpinner(false);
         // setShowSpinner(false);
      }
   };

   const handleUnsignedCaseCount = async () => {
      try {
         const response = await AuthService.getUnsignedCaseCount();
         if (response.status === HttpStatusCode.Ok) {
            setUnsignedWritCount(response.data.unsignedWrit);
         }
      } catch (error) {
         console.log(error);
      }
   };

   useEffect(() => {
      if (isMounted.current) {
         handleReviewSign();
         isMounted.current = false;
      };

   }, []);

   return (
      <>
         {showSpinner && <Spinner ></Spinner>}
         {/* {showSigningSpinner && <Spinner2 
        showLabel={showSigningSpinner}
        labelText={"Your cases are submitting to the court. This may take a few moments. Please remain on this screen until the process is complete."}
        ></Spinner2>} */}
         <ReviewSignDocument
            handleBack={() => {
               setSelectedUnSignedWritsId([]);
               props.handleBack();
            }}
            handleSignature={(values: {
               sign: string;
            }, formikHelpers: FormikHelpers<{
               sign: string;
            }>) => handleSignature(values)}
            pdfLink={pdfLink}
            pdfCount={pdfCount}
            showSpinner={showSigningSpinner}
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
                              {/* <Button
                            type="button"
                            isRounded={false}
                            title="Cancel"
                            handleClick={() => {
                              setShowPopUpWhenSign(false);
                            }}
                            classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2.5 px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                          ></Button> */}
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
