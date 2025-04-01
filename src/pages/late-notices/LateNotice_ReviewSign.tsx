import React, { useEffect, useRef, useState } from "react";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { Document, Page, pdfjs } from "react-pdf";
import { Formik, Form } from "formik";
import { FaAngleLeft } from "react-icons/fa";
import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";
import ConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import Spinner from "components/common/spinner/Spinner";

import { useLateNoticesContext } from "./LateNoticesContext";
import LateNoticeService from "services/late-notices.service";

type ReviewSignProps = {
  handleBack: () => void;
};

const ReviewSign = (props: ReviewSignProps) => {
  /* select file eviction from the list */
  const {
    selectedLateNoticeId,
    setSelectedLateNoticeId,
    setBulkRecords,
    bulkRecords,
    setLateNotices,
    getLateNotices,
    setSignProofInfo,
    signProofInfo,    
  } = useLateNoticesContext();
  const navigate = useNavigate();
  const isMounted = useRef(true);
  /** display error message when no eviction is selected */
  const [showMessage, setShowMessage] = useState<Boolean>(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [toggleConfirmation, setToggleConfirmation] = useState<boolean>(false);
  //spinner
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [pdfLink, setPdfLink] = useState<string>("");
  const [apiResponseData, setApiResponseData] = useState<any>(null);
  
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
    if (selectedLateNoticeId.length === 0) {
      setShowMessage(true);
    } else {
      if (isMounted.current) {
        handleReviewSign();
        isMounted.current = false;
      }
    }
  }, []);

  const handleReviewSign = async () => {
    
    try {
    setShowSpinner(true);  
    const deliveryDate = new Date(signProofInfo.deliveryDate??"");
   
         // Adjust to local timezone offset
         signProofInfo.deliveryDate = new Date(deliveryDate.getTime() - (deliveryDate.getTimezoneOffset() * 60000));
    const response = await LateNoticeService.getSignProofDoc(signProofInfo);
      if (response.status === HttpStatusCode.Ok) {
        
        setPdfLink(response.data);
      }
      else{
        toast.error("Something went wrong. Please try again!")
    }
    } finally {
      setShowSpinner(false);
    }
  };

  const resetFileEvictions = () => {
    // fileEvictions.items = fileEvictions.items.filter(
    //   (item) => !selectedFileEvictionId.includes(item.id ?? "")
    // );
    // setFileEvictions((prev) => ({
    //   ...prev,
    //   items: fileEvictions.items,
    //   totalCount: prev.totalCount - selectedFileEvictionId.length
    // }));
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
      setShowSpinner(true);
      signProofInfo.signature=formValues.sign;
      setToggleConfirmation(true);
      // let request: IFileEvictionSign = {
      //   sign: formValues.sign,
      //   evictionIds: selectedFileEvictionId,
      // };

      // const apiResponse = await LateNoticeService.signInProofEmail(signProofInfo);
      // if (apiResponse.status === HttpStatusCode.Ok) {
     
      //   toast.success("Summon(s) successfully signed", {
      //     position: toast.POSITION.TOP_RIGHT,
      //   });

      //   navigate("/all-cases");
      // }
    } finally {
      setShowSpinner(false);
    }
  };

  const signDocument=async () => {
    
    try {
      setShowSpinner(true);        
      const apiResponse = await LateNoticeService.signInProofEmail(signProofInfo);
      if (apiResponse.status === HttpStatusCode.Ok) {
        getLateNotices(1, 100,""); 
        toast.success("Summon(s) successfully signed", {
          position: toast.POSITION.TOP_RIGHT,
        });
        
      }
    } finally {
      setShowSpinner(false);
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
      {/* {showMessage === true ? (
        <p>Please select notices</p>
      ) : (
        <> */}

      <div>
        {showSpinner && <Spinner></Spinner>}

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
          <p className="font-semibold w-full sm:w-auto sm:ml-1.5 md:ml-4 mb-1.5 md:mb-0 text-[#2472db] md:pr-6 text-xs md:text-sm" >{}Total{" "}{selectedLateNoticeId.length > 1? "Warrants" : "Warrant"}{" "} :{" "} <span className="text-slate-900">
                        {selectedLateNoticeId.length}
                      </span></p>
        </div>
        {pdfLink && (
<div className="overflow-auto">
          <Document file={pdfLink} onLoadSuccess={handleLoadSuccess} className="my-2.5">
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
              heading={"Confirmation"}
              message={
                "Are you sure you want to sign proofs of service?"
              }
              showConfirmation={toggleConfirmation}
              confirmButtonTitle="Yes"
              closePopup={() => {
               // resetFileEvictions();
                setToggleConfirmation(false);                
              }}
              handleSubmit={() => {
                
                //resetFileEvictions();
                signDocument();                  
                setToggleConfirmation(false);
                setSelectedLateNoticeId([]);
                setBulkRecords([]);                            
                props.handleBack();
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
