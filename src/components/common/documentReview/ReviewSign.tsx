import React from "react";
import { useState } from "react";
import { FaAngleLeft } from "react-icons/fa";
import { Document, Page, pdfjs } from "react-pdf";
import * as yup from "yup";
import { Formik, Form, FormikHelpers } from "formik";
import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";
import ConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import Spinner2 from "../spinner/Spinner2";

type ReviewSignProps = {
   activeTab?: string;
   handleBack: () => void;
   handleSignature: (values: { sign: string;}, formikHelpers: FormikHelpers<{ sign: string; }>) => void;
   pdfLink: string;
   pdfCount: number;
   hideSignInput?: boolean;
   showSpinner: boolean;
};
const ReviewSignDocument = (props: ReviewSignProps) => {
   const [numPages, setNumPages] = useState<number | null>(null);
   const [documentLoaded, setDocumentLoaded] = useState<boolean>(false); // Track if the document is loaded
   const [toggleConfirmation, setToggleConfirmation] = useState<boolean>(false);
   
   pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

   const initialValues = {
      sign: "",
   };
   
   const validationSchema = yup.object({
      // sign: yup
      //    .string()
      //    .max(50, "Sign must not exceed 50 characters")
      //    .required("Please enter sign"),
      sign: yup
    .string()
    .max(50, "Sign must not exceed 50 characters")
    .when([], {
      is: () => props.hideSignInput !== true, // Apply validation if hideSignInput is not true (false or null)
      then: (schema) => schema.required("Please enter sign"), // Make sign required if hideSignInput is not true
      otherwise: (schema) => schema.optional(), // Otherwise, make sign optional
    }),
   });

   const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setDocumentLoaded(true);
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
      <div>

      {/* {(!props.pdfCount || props.showSpinner || !documentLoaded) && <Spinner2 />} */}

         <Button
            isRounded={false}
            title={"Back"}
            type={"button"}
            icon={<FaAngleLeft className="h-3.5 h-3.5 mr-1" />}
            handleClick={() => props.handleBack()}
            classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-1.5 px-3 text-slate-900 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
            disabled={props.showSpinner}
        ></Button>

         <div className="pt-4">
            <p className="text-xs italic font-medium text-blue-600">By affixing this electronic verification, oath, or affidavit to the pleading(s) submitted to the court and attaching my electronic signature hereon, I do hereby swear or affirm that the statements set forth in the below pleading(s) are true and correct.</p>
         </div>
         <div className="relative pt-1.5 flex-auto overflow-y-auto flex items-center justify-start flex-wrap sm:flex-nowrap">
            <Formik
               initialValues={initialValues}
               validationSchema={validationSchema}
               onSubmit={props.handleSignature}
               // onSubmit={
               //     props.handleSignature(values);
               // }}
            >
               {(formik) => (
                  <Form>
                     <div className="flex flex-row">
                        {( props.hideSignInput == null || !props.hideSignInput) &&
                        <div className="relative  mt-2.5">
                           <FormikControl
                              control="input"
                              type="text"
                              label={"Signature"}
                              name={"sign"}
                              placeholder={"Sign"}
                              disabled={!props.pdfCount}
                           />
                        </div> }
                        <div className="py-6 ml-1.5 md:ml-3.5 mt-2.5">
                           <Button
                              type="submit"
                              isRounded={false}
                              title="Sign"
                              classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                              disabled={!props.pdfCount || props.showSpinner || !documentLoaded}
                           ></Button>
                        </div>
                     </div>
                  </Form>
               )}
            </Formik>
            <p className="font-semibold w-full sm:w-auto sm:mt-3 sm:ml-2 md:ml-8 mb-2 md:mb-0 text-[#2472db] md:pr-7 text-sm md:text-base">{ }Total {props.pdfCount > 1 ? "Warrants" : "Warrant"} : <span className="text-slate-900">{props.pdfCount}</span></p>
         </div>
         {props.pdfLink && props.pdfLink !== null && (
            <div className="overflow-auto">
               <Document file={props.pdfLink} onLoadSuccess={handleLoadSuccess}>
                  {Array.from(new Array(numPages || 0), (el, index) => (
                     <Page
                        key={`page_${index + 1}`}
                        pageNumber={index + 1} scale={scale}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                        className="my-3"
                     />
                  ))}
               </Document>
            </div>
         )}
         {toggleConfirmation === true && (
            <div>
               <ConfirmationBox
                  heading={"Success"}
                  message={"Your cases have been successfully submitted to the court"}
                  showConfirmation={toggleConfirmation}
                  confirmButtonTitle="OK"
                  closePopup={() => {
                     setToggleConfirmation(false);
                  }}
                  handleSubmit={() => {
                     setToggleConfirmation(false);
                     //    setSelectedAllCasesId([]);
                     props.handleBack();
                  }}
               ></ConfirmationBox>
            </div>
         )}
      </div>
   );
};

export default ReviewSignDocument;
