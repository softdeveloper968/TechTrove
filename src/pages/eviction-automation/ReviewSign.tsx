import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { Document, Page, pdfjs } from "react-pdf";
import { Formik, Form } from "formik";
import { FaAngleLeft } from "react-icons/fa";
import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";
import ConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import Spinner from "components/common/spinner/Spinner";
import Spinner2 from "components/common/spinner/Spinner2";
import EvictionAutomationService from "services/eviction-automation.service";
import FileEvictionService from "services/file-evictions.service";
import AuthService from "services/auth.service";
import AllCasesService from "services/all-cases.service";
import { useEvictionAutomationContext } from "./EvictionAutomationContext";
import { useAuth } from "context/AuthContext";
import { IAllCasesReason, IAllCasesSign } from "interfaces/all-cases.interface";
import { mapDismissalReasonToEnum } from "utils/helper";

type ReviewSignProps = {
  handleBack: () => void;
  activeTab:string;
};

const ReviewSign = (props: ReviewSignProps) => {
  /* select file eviction from the list */
  const {
    selectedEvictionApprovalId,
    setSelectedEvictionApprovalId,
    selectedEvictionApprovedId,
    setSelectedEvictionApprovedId,
    selectedEvictionDismissalApprovalId,
    setSelectedEvictionDismissalApprovalId,
    selectedEvictionDismissalApprovedId,
    setSelectedEvictionDismissalApprovedId,
    evictionAutomationApprovalsQueue,
    evictionAutomationApprovedQueue,
    evictionAutomationDismissalApprovalsQueue,
    evictionAutomationDismissalApprovedQueue,
    setEvictionAutomationDismissalApprovalsQueue,
    setEvictionAutomationDismissalApprovedQueue,
    getEvictionAutomationDismissalApprovalsQueue,
    setEvictionAutomationApprovalsQueue,
    setEvictionAutomationApprovedQueue,
    getEvictionAutomationApprovalsQueue,
    selectedReason
  } = useEvictionAutomationContext();
  const navigate = useNavigate();
  const { setUnsignedEvictionApprovalCount,setUnsignedEvictionDismissalCount} = useAuth();
  const isMounted = useRef(true);
  /** display error message when no eviction is selected */
  const [showMessage, setShowMessage] = useState<Boolean>(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [toggleConfirmation, setToggleConfirmation] = useState<boolean>(false);
  //spinner
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [showSigningSpinner, setShowSigningSpinner] = useState<boolean>(false);
  const [pdfLink, setPdfLink] = useState<string>("");
  const [apiResponseData, setApiResponseData] = useState<any>(null);
  const[totalWarrant,setTotalWarrant]=useState<number>(0);
  
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

  const initialValues = {
    sign: "",
  };
  const validationSchema = yup.object({
    sign: yup
      .string()
      .max(50, "Sign must not exceed 50 characters")
      .required("Please enter sign"),
  });

  useEffect(() => {
    setShowSpinner(true);
    /** check whether eviction is selected or not. If no eviction selected then show message */
    if (props.activeTab=="Confirm Delinquencies" && selectedEvictionApprovalId.length === 0) {
      setShowMessage(true);
    } 
    else if(props.activeTab=="Sign Evictions" && selectedEvictionApprovedId.length === 0) {
        setShowMessage(true);
      } 
    else {
      if (isMounted.current) {
        handleReviewSign();
        isMounted.current = false;
      }
    }
  }, []);

  const handleReviewSign = async () => {
    try {
      setShowSpinner(true);
      const dismissalItems = selectedReason.map((item: IAllCasesReason) => ({
        dispoId: item.dispoId,
        reason: item.reason ? mapDismissalReasonToEnum(item.reason) : undefined,
     }));

      if(selectedEvictionDismissalApprovalId.length || selectedEvictionDismissalApprovedId.length)
        {

          const apiResponse = await AllCasesService.getDismissalsDocumentForSign(
            dismissalItems
          )
          if (apiResponse.status === HttpStatusCode.Ok) {
            setTotalWarrant(
            dismissalItems.length
            )
            setPdfLink(apiResponse.data.combinedPdfUrl);
          } else {
            toast.error("Something went wrong. Please try again!", {
              position: toast.POSITION.TOP_RIGHT,
            });
          }
          handleUnsignedCaseCount();
      }
      else{
        const apiResponse = await FileEvictionService.getFileEvictionDocumentForSign(
            props.activeTab === "Confirm Delinquencies" 
                ? selectedEvictionApprovalId 
                : selectedEvictionApprovedId
        );
        if (apiResponse.status === HttpStatusCode.Ok) {
          setTotalWarrant(props.activeTab === "Confirm Delinquencies" 
            ? selectedEvictionApprovalId.length 
            : selectedEvictionApprovedId.length)
          setPdfLink(apiResponse.data.combinedPDFUrl);
        } else {
          toast.error("Something went wrong. Please try again!", {
            position: toast.POSITION.TOP_RIGHT,
          });
        }
      }

    } finally {
      setShowSpinner(false);
    }
  };

  const resetFileEvictions = () => {
    if(props.activeTab=="Confirm Delinquencies"){
        evictionAutomationApprovalsQueue.items = evictionAutomationApprovalsQueue.items.filter(
            (item) => !selectedEvictionApprovalId.includes(item.id ?? "")
          );
          setEvictionAutomationApprovalsQueue((prev) => ({
            ...prev,
            items: evictionAutomationApprovalsQueue.items,
            totalCount: prev.totalCount - selectedEvictionApprovalId.length
          }));
    }
    else{
        evictionAutomationApprovedQueue.items = evictionAutomationApprovedQueue.items.filter(
            (item) => !selectedEvictionApprovedId.includes(item.id ?? "")
          );
          setEvictionAutomationApprovedQueue((prev) => ({
            ...prev,
            items: evictionAutomationApprovedQueue.items,
            totalCount: prev.totalCount - selectedEvictionApprovedId.length
          }));
    }
    
  };

  const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  /**
   * @param formValues passing signature
   * @returns handle
   */
  const handleSignature = async (formValues: any) => {
    
    try {
      setShowSigningSpinner(true);
      setShowSpinner(true);
      if(props.activeTab=="Confirm Dismissals" || props.activeTab=="Sign Dismissals" ){
        let request: IAllCasesSign = {
          signature: formValues.sign,
          dispoIds: props.activeTab=="Confirm Dismissals" ? selectedEvictionDismissalApprovalId : selectedEvictionDismissalApprovedId,
       };
       const apiResponse =await EvictionAutomationService.signDismissals(request);
       if (apiResponse.status === HttpStatusCode.Ok) {     
        toast.success("Summon(s) successfully signed", {
          position: toast.POSITION.TOP_RIGHT,
        });
        handleUnsignedCaseCount();
        navigate("/dismissals?signed=true");
      }
      }
      else{
        const apiResponse = await EvictionAutomationService.SignApproveCases(
          formValues.sign.trim(),props.activeTab=="Confirm Delinquencies"? selectedEvictionApprovalId:selectedEvictionApprovedId,
       );
  
        if (apiResponse.status === HttpStatusCode.Ok) {     
          toast.success("Summon(s) successfully signed", {
            position: toast.POSITION.TOP_RIGHT,
          });
          handleUnsignedCaseCount();
          navigate("/all-cases");
        }
      }
      
      
    } finally {
      setShowSigningSpinner(false);
      setShowSpinner(false);
    }
  };
  const handleUnsignedCaseCount = async () => {
    try {
      const response = await AuthService.getUnsignedCaseCount();
      if(response.status === HttpStatusCode.Ok){
        setUnsignedEvictionApprovalCount(response.data.unsignedEvictionApprovalCount);
        setUnsignedEvictionDismissalCount(response.data.unsignedEvictionDismissalCount);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const tabletBreakpoint = 1024; // Breakpoint for tablet and iOS devices

  // Determine the scale based on the window's width
  const windowWidth = window.innerWidth;
  var scale = 1;
  
  if (windowWidth <= tabletBreakpoint) {
     scale = 1; // Scale for tablet and iOS devices
  } else {
     scale = 1.5; // Higher scale for desktops
  }

  return (
    <>   
      <div>
      {/* {showSpinner && <Spinner ></Spinner>} */}
      {showSpinner && <Spinner></Spinner>}
        {/* {showSigningSpinner && <Spinner2 
        showLabel={showSigningSpinner}
        labelText={"Your cases are submitting to the court. This may take a few moments. Please remain on this screen until the process is complete."}
        ></Spinner2>} */}
        <Button
          isRounded={false}
          title={"Back"}
          type={"button"}
          icon={<FaAngleLeft className="h-3.5 h-3.5 mr-1" />}
          handleClick={() => {
            props.handleBack();
          }}
          classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-1.5 px-3 text-slate-900 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
        ></Button>
        <div className="pt-4">
          <p className="text-xs italic font-medium text-blue-600">
            By affixing this electronic verification, oath, or affidavit to the
            pleading(s) submitted to the court and attaching my electronic
            signature hereon, I do hereby swear or affirm that the statements
            set forth in the below pleading(s) are true and correct.
          </p>
        </div>
        <div className="relative pt-1.5 flex-auto overflow-y-auto flex items-center justify-start flex-wrap sm:flex-nowrap">
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSignature}
          >
            {(formik) => (
              <Form>
                <div className="flex flex-row items-center justify-between pb-1">
                  <div className="flex flex-row">
                    <div className="relative">
                      <FormikControl
                        control="input"
                        type="text"
                        label={"Signature"}
                        name={"sign"}
                        placeholder={"Sign"}
                      />
                    </div>

                    <div className="py-6 ml-1.5 md:ml-3.5">
                      <Button
                        type="submit"
                        isRounded={false}
                        title="Sign"
                        classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                      ></Button>
                    </div>
                    
                  </div>
                </div>
              </Form>
            )}
          </Formik>
          <p className="font-semibold w-full sm:w-auto sm:ml-1.5 md:ml-4 mb-1.5 md:mb-0 text-[#2472db] md:pr-6 text-xs md:text-sm" >{}Total{" "}{(totalWarrant>1)? "Warrants" : "Warrant"}{" "} :{" "} <span className="text-slate-900">
                        {totalWarrant}
                      </span></p>
        </div>
        {pdfLink && (
<div className="overflow-auto">
          <Document file={pdfLink} onLoadSuccess={handleLoadSuccess} className="my-3">
            {Array.from(new Array(numPages || 0), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                scale={scale}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                className="my-2.5"
              />
            ))}
          </Document>
</div>
        )}
        {toggleConfirmation && (
          <div>
            <ConfirmationBox
              heading={"Success"}
              message={
                "Your cases have been successfully submitted to the court"
              }
              showConfirmation={toggleConfirmation}
              confirmButtonTitle="OK"
              closePopup={() => {
                resetFileEvictions();
                setToggleConfirmation(false);
                getEvictionAutomationApprovalsQueue(1, 100,false,evictionAutomationApprovalsQueue.isViewAll, evictionAutomationApprovalsQueue.searchParam);
              }}
              handleSubmit={() => {
                resetFileEvictions();
                setToggleConfirmation(false);
                setSelectedEvictionApprovalId([]);
                setSelectedEvictionApprovedId([]);
                props.handleBack();
                if(props.activeTab=="Confirm Delinquencies")
                    getEvictionAutomationApprovalsQueue(1, 100,false,evictionAutomationApprovedQueue.isViewAll, evictionAutomationApprovalsQueue.searchParam);
                else
                    getEvictionAutomationApprovalsQueue(1, 100,true,evictionAutomationApprovalsQueue.isViewAll, evictionAutomationApprovalsQueue.searchParam);
            }}
            ></ConfirmationBox>
          </div>
        )}
      </div>
      {/* </>
      )} */}
    </>
  );
};

export default ReviewSign;
