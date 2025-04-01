import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { FormikHelpers } from "formik";
import { useDissmissalsContext } from "./DismissalsContext";
import { useAuth } from "context/AuthContext";
import AllCasesService from "services/all-cases.service";
import AuthService from "services/auth.service";
import { IAllCasesSign, IDismissalReason } from "interfaces/all-cases.interface";
import Spinner from "components/common/spinner/Spinner";
import ReviewSignDocument from "components/common/documentReview/ReviewSign";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import { mapDismissalReasonToEnum } from "utils/helper";

type ReviewSignProps = {
  handleBack: () => void;
  activeTab?:string
};

const ReviewSign = (props: ReviewSignProps) => {
  const { setUnsignedDismissalCount } = useAuth();
  const isMounted = useRef(true);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [showSigningSpinner, setShowSigningSpinner] = useState<boolean>(false);
  const [showPopUpWhenSign, setShowPopUpWhenSign] =
      useState<boolean>(false);
  // selected signed dismissal id
  const { 
    selectedUnSignedDismissalsId, 
    setSelectedUnSignedDismissalsId,
    setAllUnsignedDismissals,
    unsignedDismissals,
    getAllDismissals,
    selectedEvictionDismissalApprovalId,
    setSelectedEvictionDismissalApprovalId,
    setEvictionAutomationDismissalApprovalsQueue,
    evictionAutomationDismissalApprovalsQueue,
    getEvictionAutomationDismissalApprovalsQueue,
    selectedReason
  } = useDissmissalsContext();
  const navigate = useNavigate();
  // set pdflink
  const [pdfLink, setPdfLink] = useState<string>("");
  const [pdfCount, setPdfCount] = useState<number>(0);

  const handleReviewSign = async () => {
    
    try {
      setShowSpinner(true);
      const dismissalItems = unsignedDismissals.items.filter(item => selectedUnSignedDismissalsId.includes(item.id ?? ""))
      const dismissalPayload: IDismissalReason[] =props.activeTab!="EA - Ready to Confirm"? dismissalItems.map((item) => ({
         dispoId: item.id ?? "",
         reason: item.reason ? mapDismissalReasonToEnum(item.reason) : undefined,
      })):( selectedReason.map((item) => ({
        dispoId: item.dispoId ?? "",
        reason: item.reason ? mapDismissalReasonToEnum(item.reason) : undefined,
     })));

      const apiResponse = await AllCasesService.getDismissalsDocumentForSign(
         dismissalPayload
      );

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
      if (props.activeTab=="EA - Ready to Confirm" && (unsignedDismissals.totalCount - selectedUnSignedDismissalsId.length > 0)) {
           getAllDismissals(1, 100, false);
          setShowPopUpWhenSign(false)
          props.handleBack();
      }
      else if (props.activeTab=="EA - Ready to Confirm" &&  evictionAutomationDismissalApprovalsQueue.totalCount - selectedEvictionDismissalApprovalId.length > 0) {
        getEvictionAutomationDismissalApprovalsQueue(1, 100,false, false);
        setShowPopUpWhenSign(false)
        props.handleBack();
      }
    else {
       getAllDismissals(1, 100, true);
       navigate(`/dismissals?signed=true`);
       setShowPopUpWhenSign(false)
       props.handleBack();
    }
    setSelectedUnSignedDismissalsId([]);
    setSelectedEvictionDismissalApprovalId([]);
 };
  const handleSignature = async (formValues: any) => {
    try {
      setShowSigningSpinner(true);
      // setShowSpinner(true);
      setShowPopUpWhenSign(true);
      let request: IAllCasesSign = {
        signature: formValues.sign,
        dispoIds:props.activeTab=="EA - Ready to Confirm"?selectedEvictionDismissalApprovalId: selectedUnSignedDismissalsId,
      };
      const apiResponse = await AllCasesService.signDismissals(request);
      if (apiResponse.status === HttpStatusCode.Ok) {
        unsignedDismissals.items = unsignedDismissals.items.filter((item) => 
          !selectedUnSignedDismissalsId.includes(item.id ?? "")
        );
        handleUnsignedCaseCount();
        toast.success("Dismissal(s) have been successfully signed");
      };
      if(props.activeTab=="EA - Ready to Confirm"){
        setAllUnsignedDismissals((prev) => ({
          ...prev,
          items: unsignedDismissals.items,
          totalCount: prev.totalCount - selectedUnSignedDismissalsId.length
        }));
      }else{
        setAllUnsignedDismissals((prev) => ({
          ...prev,
          items: unsignedDismissals.items,
          totalCount: prev.totalCount - selectedUnSignedDismissalsId.length
        }));
      }
    } finally {
      setShowSigningSpinner(false);
    }
  };

  const handleUnsignedCaseCount = async () => {
    try {
      const response = await AuthService.getUnsignedCaseCount();
      if(response.status === HttpStatusCode.Ok){
        setUnsignedDismissalCount(response.data.unsignedDismissal);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if(isMounted.current){
      handleReviewSign();
      isMounted.current = false;
    };

  }, []);

  return (
    <>
     {showSpinner && <Spinner ></Spinner>}
      
      <ReviewSignDocument
        handleBack={() => {
         // setSelectedUnSignedDismissalsId([]);
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
