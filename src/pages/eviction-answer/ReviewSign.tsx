import React from "react";
import { useState } from "react";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import { FaAngleLeft } from "react-icons/fa";
import { Formik, Form } from "formik";
import { Document, Page, pdfjs } from "react-pdf";
import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";
import ConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import PayPalModal from "./components/PayPalModal";
import PayPalButton from "./components/PayPalButton";
import { useEvictionAnswerContext } from "./EvictionAnswerContext";

type ReviewSignProps = {
   pdfLink: string;
};

const ReviewSignDocument = (props: ReviewSignProps) => { 
   const navigate = useNavigate();
   const [numPages, setNumPages] = useState<number | null>(null);
   const [pdfLink, setpdfLink] = useState<string>(props.pdfLink);
   const [toggleConfirmation, setToggleConfirmation] = useState<boolean>(false);
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
     const { setPdfLink ,setActiveStep, evictionAnswerFormInfo} = useEvictionAnswerContext();
    const [showPayPalModal, setShowPayPalModal] = useState<boolean>(false);

    const [showModal, setShowModal] = useState<boolean>(false);
    const clientId = process.env.REACT_APP_PAYPAL_CLIENT_ID ?? "";
    
    const initialValues = {
        sign: "",
    };
    const validationSchema = yup.object({
        sign: yup
            .string()
            .max(50, "Sign must not exceed 50 characters")
            .required("Please enter sign"),
    });

    const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
  };

//   const openPayPalModal = () => {
//     setShowPayPalModal(true);
//    // setInfoModal(true);
// };
const openPayPalModal = async (formValue: any) => {
    try {
        evictionAnswerFormInfo.signature=formValue.sign;
        evictionAnswerFormInfo.pdfUrl = pdfLink;
           setShowPayPalModal(true);
    // setInfoModal(true);

    } catch (error) {
       console.error("Error:", error);
    }
 };

const closePayPalModal = () => {
    setShowPayPalModal(false);

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
   return(
      <>
         <div className='bg-[#edf2f9] p-5 min-h-lvh'>
         <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
                {/* {showSpinner && <Spinner></Spinner>} */}
                <Button
                    isRounded={false}
                    title={"Back"}
                    type={"button"}
                    icon={<FaAngleLeft className="h-3.5 h-3.5 mr-1" />}
                    // handleClick={() => {navigate('/eviction-answer')}}
                    handleClick={() => {setActiveStep(2)}}
                    classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-1.5 px-3 text-slate-900 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                ></Button>

                {/* <div className="pt-5">
                    <p className="text-xs italic font-medium text-blue-600">
                       By affixing this electronic verification, oath, or affidavit to the pleading(s) submitted to the court and attaching my electronic signature hereon, I do hereby swear or affirm that the statements set forth in the above pleading(s) are true and correct.
                     </p>
                </div> */}
                {/* <div className="relative pt-1.5 flex-auto overflow-y-auto flex items-center justify-start flex-wrap sm:flex-nowrap">
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(sign) => {openPayPalModal(sign)}}
                    // onSubmit={
                    //     props.handleSignature(values);
                    // }}
                    >
                        {(formik) => (
                            <Form>
                                <div className="flex flex-row">
                                    <div className="relative  mt-3">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"Signature"}
                                            name={"sign"}
                                            placeholder={"Sign"}
                                        />
                                    </div>

                                    <div className="py-6 ml-2 md:ml-4  mt-3">
                                        <Button
                                            type="submit"
                                            isRounded={false}
                                            title="Sign"
                                            classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                                        ></Button>
                                    </div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div> */}
                {/* <div>
                    <p className="text-xs italic font-medium text-blue-600">Please use your full name as signature.</p>
                </div> */}
                {pdfLink && (
                    <div className="overflow-hidden ">
                        <Document file={pdfLink} onLoadSuccess={handleLoadSuccess}>
                            {Array.from(new Array(numPages || 0), (el, index) => (
                                <Page 
                                    key={`page_${index + 1}`} 
                                    pageNumber={index + 1} scale={scale} 
                                    renderAnnotationLayer={false} 
                                    renderTextLayer={false}
                                    className="my-2.5 border border-solid border-gray-300 rounded-lg overflow-hidden flex justify-center" 
                                />
                            ))}
                        </Document>
                    </div>
                )}
                <div className="px-6 max-w-[840px] mx-auto">

                
                  <div className="pt-4">
                    <p className="text-xs italic font-medium text-blue-600">
                       By affixing this electronic verification, oath, or affidavit to the pleading(s) submitted to the court and attaching my electronic signature hereon, I do hereby swear or affirm that the statements set forth in the above pleading(s) are true and correct.
                     </p>
                   </div>
                    <div className="relative pt-3 flex justify-between">
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={(value) => {openPayPalModal(value)}}
                    // onSubmit={
                    //     props.handleSignature(values);
                    // }}
                    >
                        {(formik) => (
                            <Form className="max-w-72 w-full">
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

                                    <div className="pt-6 ml-2 md:ml-4 ">
                                        <Button
                                            type="submit"
                                            isRounded={false}
                                            title="Sign"
                                            classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                                        ></Button>
                                    </div>
                                </div>
                                <p className="text-xs italic font-medium text-blue-600">Please use your full name as signature.</p>
                            </Form>
                        )}
                    </Formik>
                    <div className="relative max-w-72 w-full">
                        <label className="text-gray-600 text-[11px] md:text-xs font-medium">Defendant Phone </label>
                        <input type="text"value={evictionAnswerFormInfo.phone}  readOnly
                        className={`peer outline-none p-2 md:p-2.5 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none`} />                        
                    </div>
                </div>
                <div className="relative py-4 flex justify-between">
                    <div className="relative max-w-72 w-full">
                        <label className="text-gray-600 text-[11px] md:text-xs font-medium">Date</label>
                        <input type="text" 
                        value={new Date().toLocaleDateString()}  readOnly
                        className={`peer outline-none p-2 md:p-2.5 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none`} 
                        />
                    </div>
                    <div className="relative max-w-72 w-full">
                        <label className="text-gray-600 text-[11px] md:text-xs font-medium">Defendant Email</label>
                        <input type="text" 
                        value={evictionAnswerFormInfo.email} readOnly
                        className={`peer outline-none p-2 md:p-2.5 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none`} 
                        />
                    </div>
                </div>

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
                              //   props.handleBack();
                            }}
                        ></ConfirmationBox>
                    </div>
                )}
                </div>
            </div>
            </div>

            <PayPalModal show={showPayPalModal} onClose={closePayPalModal}>
                <PayPalButton amount={20.00} currency="USD" clientId={clientId} handleCancel={function (): void {
                   setShowPayPalModal(false);
               } } />
            </PayPalModal>
      </>
   )
}

export default ReviewSignDocument;