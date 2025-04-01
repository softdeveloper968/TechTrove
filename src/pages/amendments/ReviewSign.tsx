import React from "react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { pdfjs } from "react-pdf";
import { FormikHelpers } from "formik";
import Spinner from "components/common/spinner/Spinner";
import ReviewSignDocument from "components/common/documentReview/ReviewSign";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import Spinner2 from "components/common/spinner/Spinner2";
import { useAmendmentsContext } from "./AmendmentsContext";
import { useAuth } from "context/AuthContext";
import AmendmentsService from "services/amendments.service";
import AllCasesService from "services/all-cases.service";
import AuthService from "services/auth.service";
import { IAmendmentsItems, IAmendmentsSign } from "interfaces/amendments.interface";

type ReviewSignProps = {
  handleBack: () => void;
};
const ReviewSign = (props: ReviewSignProps) => {
  /* select Amendments from the list */
  const { setUnsignedAmendmentCount } = useAuth();
  const {
    selectedAmendmentsId,
    unsignedAmendment,
    setAllUnsignedAmendment,
    setSelectedAmendmentsId,
    getAllAmendments
  } = useAmendmentsContext();
  const isMounted = useRef(true);
  const [filteredRecords, setFilteredRecords] = useState<IAmendmentsItems[]>([]);
  /** display error message when no amendments is selected */
  const [showMessage, setShowMessage] = useState<Boolean>(false);
  const [toggleConfirmation, setToggleConfirmation] = useState<boolean>(false);
  const [showPopUpWhenSign, setShowPopUpWhenSign] =
      useState<boolean>(false);
  //spinner
  const navigate = useNavigate();
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const [showSigningSpinner, setShowSigningSpinner] = useState<boolean>(false);
  const [pdfLink, setPdfLink] = useState<string>("");
  const [pdfCount, setPdfCount] = useState<number>(0);
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

  useEffect(() => {
    setShowSpinner(true);
    unsignedAmendment.items.filter((item) => selectedAmendmentsId.includes(item.id || ""))
    /** check whether case is selected or not. If no record selected then show message */
    if (selectedAmendmentsId.length === 0) {
      setShowMessage(true);
    }
  }, []);

  const handleReviewSign = async () => {
    
    try {
      setShowSpinner(true);
      const filteredCasesItems = unsignedAmendment.items.filter((item) => selectedAmendmentsId.includes(item.id || ""));

      const allAmendmentItems: IAmendmentsSign[] = filteredCasesItems.map((item: IAmendmentsItems) => {
        return {
          dispoId: item.id,
          caseNo: item.caseNo,
          propertyName: item.propertyName,
          county: item.county,
          //  tenantFirstName: item.tenantNames[0]?.firstName,
          //  tenantLastName: item.tenantNames[0]?.lastName,
          unit: item.unit,
          city: item.city,
          state: item.state,
          zip: item.zip,
          evictionServiceMethod: item.evictionServiceMethod,
          attorneyName: item.attorneyName,
          address: item.address,
          ownerName: item.ownerName,
          reason: item.reason ?? "",
          monthlyRent: parseFloat(item.monthlyRent),
          totalRent: parseFloat(item.totalRent),
          evictionAffiantIs: item.evictionAffiantIs,
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
          PropertyZip: item.propertyZip,
          AttorneyBarNo: item.attorneyBarNo,
          AttorneyEmail: item.attorneyEmail,
          FilerBusinessName: item.filerBusinessName,
          FilerPhone: item.filerPhone,
          FilerEmail: item.filerEmail,
          Expedited: item.expedited,
          StateCourt: item.stateCourt
        }
      })
      const apiResponse = await AmendmentsService.getAmendmentsDocumentForSign(allAmendmentItems);


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
    // getAllAmendments(1, 100, true);
    // const userInfo = JSON.parse(localStorage.getItem("userDetail") ?? "");
    // if (unsignedAmendment.items.some(x => x.id && !selectedAmendmentsId.includes(x.id))) {
    //   getAllAmendments(1, 100, false);
    //    setShowPopUpWhenSign(false)
    //    props.handleBack();
    // }
    var count= unsignedAmendment.totalCount - selectedAmendmentsId.length;
      if (unsignedAmendment.totalCount - selectedAmendmentsId.length > 0) {
           getAllAmendments(1, 100, false);
       setShowPopUpWhenSign(false)
       props.handleBack();
      }
    else {
      getAllAmendments(1, 100, true);
      navigate(`/amendments?signed=true`);
      setShowPopUpWhenSign(false)
       props.handleBack();
    }
    setSelectedAmendmentsId([]);
 };
  const handleSignature = async (formValues: any) => {
    try {
      setShowSigningSpinner(true);
      // setShowSpinner(true);
      setShowPopUpWhenSign(true);
      let request: any;
      request = {
        signature: formValues.sign,
        dispoIds: selectedAmendmentsId,
        // Add properties specific to amendments here
      };
      const apiResponse = await AllCasesService.signAmendments(request)
      if (apiResponse.status === HttpStatusCode.Ok) {
        unsignedAmendment.items = unsignedAmendment.items.filter((item) => !selectedAmendmentsId.includes(item.id ?? ""))
        setAllUnsignedAmendment((prev) => ({
          ...prev,
          items: unsignedAmendment.items
        }));
        // getAllAmendments(1, 100, true);
        setToggleConfirmation(true);
        // set unsigned amendment count
        handleUnsignedCaseCount();
        toast.success("Amendment(s) have been successfully signed", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
      // setSelectedAmendmentsId([]);
      // navigate(`/amendments?signed=true`);
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
        setUnsignedAmendmentCount(response.data.unsignedAmendment);
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
          // setSelectedAmendmentsId([]);
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












