import React, { useEffect, useRef, useState } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { Formik, Form } from "formik";
import { FaAngleLeft } from "react-icons/fa";
import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";
import ConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import Spinner from "components/common/spinner/Spinner";

import Spinner2 from "components/common/spinner/Spinner2";
import Modal from "components/common/popup/PopUp";
import { useFileEvictionsContext } from "./FileEvictionsContext";
import { useAuth } from "context/AuthContext";
import FileEvictionService from "services/file-evictions.service";
import {
   IFileEvictionSign,
   IFileEvictionsItems,
} from "interfaces/file-evictions.interface";
import { UserRole } from "utils/enum";


type ReviewSignProps = {
   handleBack: () => void;
};

const ReviewSign = (props: ReviewSignProps) => {
   /* select file eviction from the list */
   const {
      selectedFileEvictionId,
      setSelectedFileEvictionId,
      setFilteredRecords,
      fileEvictions,
      setFileEvictions,
      getFileEvictions,
      allCompanies
   } = useFileEvictionsContext();
   const navigate = useNavigate();
   const isMounted = useRef(true);
   const { userRole } = useAuth();
   /** display error message when no eviction is selected */
   const [showMessage, setShowMessage] = useState<Boolean>(false);
   const [numPages, setNumPages] = useState<number | null>(null);
   const [toggleConfirmation, setToggleConfirmation] = useState<boolean>(false);
   //spinner
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [showSigningSpinner, setShowSigningSpinner] = useState<boolean>(false);
   const [pdfLink, setPdfLink] = useState<string>("");
   const [apiResponseData, setApiResponseData] = useState<any>(null);
   const [showPopUpWhenSign, setShowPopUpWhenSign] =
      useState<boolean>(false);

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
      if (selectedFileEvictionId.length === 0) {
         setShowMessage(true);
      } else {
         if (isMounted.current) {
            handleReviewSign();
            isMounted.current = false;
         }
      }
   }, []);

   const handleOkClick = async () => {
      getFileEvictions(1, 100,fileEvictions.isViewAll??true, fileEvictions.searchParam,fileEvictions.companyId);
      // const userInfo = JSON.parse(localStorage.getItem("userDetail") ?? "");
      // if (fileEvictions.items.some(x => x.id && !selectedFileEvictionId.includes(x.id))) {
      //    setShowPopUpWhenSign(false)
      //    props.handleBack();
      // }
     var count= fileEvictions.totalCount - selectedFileEvictionId.length;
      if (fileEvictions.totalCount - selectedFileEvictionId.length > 0) {
         setShowPopUpWhenSign(false)
         navigate("/all-cases");
         // props.handleBack();
      }
      else {
         navigate("/all-cases");
      }
      setSelectedFileEvictionId([]);
   };
   const handleReviewSign = async () => {
      try {
         setShowSpinner(true);
         const apiResponse =
            await FileEvictionService.getFileEvictionDocumentForSign(
               selectedFileEvictionId
            );
         if (apiResponse.status === HttpStatusCode.Ok) {
            setPdfLink(apiResponse.data.combinedPDFUrl);
         } else {
            toast.error("Something went wrong. Please try again!", {
               position: toast.POSITION.TOP_RIGHT,
            });
         }
      } finally {
         setShowSpinner(false);
         setShowSigningSpinner(false);
      }
   };

   const resetFileEvictions = () => {
      fileEvictions.items = fileEvictions.items.filter(
         (item) => !selectedFileEvictionId.includes(item.id ?? "")
      );
      setFileEvictions((prev) => ({
         ...prev,
         items: fileEvictions.items,
         totalCount: prev.totalCount - selectedFileEvictionId.length
      }));
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
         // setShowSigningSpinner(true);
         // setShowSpinner(true);
         setShowPopUpWhenSign(true);
         let request: IFileEvictionSign = {
            sign: formValues.sign,
            evictionIds: selectedFileEvictionId,
         };

         // redirect user to the All Cases the api calls should be in background
         // navigate("/all-cases");
         const apiResponse = await FileEvictionService.signFileEviction(request);
         if (apiResponse.status === HttpStatusCode.Ok) {
            //   const jsonData = JSON.stringify(apiResponse.data.data, null, 2);
            //   const blob = new Blob([jsonData], { type: "application/json" });
            //   const url = URL.createObjectURL(blob);
            //   window.open(url, '_blank');
            //   setApiResponseData(apiResponse.data.data);
            //   setToggleConfirmation(true);
            toast.success("Summon(s) successfully signed", {
               position: toast.POSITION.TOP_RIGHT,
            });
         }
      }
      catch (error) {

      }
      // finally {
      //    ;
      //    // setShowSigningSpinner(false);
      //    // setShowPopUpWhenSign(false);
      //    // setShowSpinner(false);
      // }
   };

   const selectedFileEvictions: IFileEvictionsItems[] =
      fileEvictions.items.filter((eviction) =>
         selectedFileEvictionId.includes(eviction.id || "")
      );
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
                                    disabled={!selectedFileEvictionId.length}
                                 ></Button>
                              </div>
                           </div>
                        </div>
                     </Form>
                  )}
               </Formik>
               <p className="font-semibold w-full sm:w-auto sm:ml-1.5 md:ml-4 mb-1.5 md:mb-0 text-[#2472db] md:pr-6 text-xs md:text-sm" >
                  { }Total{" "}{selectedFileEvictionId.length > 1 ? "Warrants" : "Warrant"}{" "} :{" "}
                  <span className="text-slate-900">{selectedFileEvictionId.length}</span>
               </p>
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
                     heading={"Success"}
                     message={
                        "Your cases have been successfully submitted to the court"
                     }
                     showConfirmation={toggleConfirmation}
                     confirmButtonTitle="OK"
                     closePopup={() => {
                        resetFileEvictions();
                        setToggleConfirmation(false);
                        getFileEvictions(1, 100,fileEvictions.isViewAll??true, fileEvictions.searchParam,fileEvictions.companyId);
                     }}
                     handleSubmit={() => {
                        resetFileEvictions();
                        setToggleConfirmation(false);
                        setSelectedFileEvictionId([]);
                        setFilteredRecords([]);
                        props.handleBack();
                        getFileEvictions(1, 100,fileEvictions.isViewAll??true, fileEvictions.searchParam,fileEvictions.companyId);
                     }}
                  ></ConfirmationBox>
               </div>
            )}
         </div>
         {/* </>
      )} */}
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
                              Cases are in progress. Once signing is completed, the cases will move to the All Cases queue.
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
