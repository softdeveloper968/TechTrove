import React from 'react';
import { useState, useEffect } from "react";
import * as yup from "yup";
import { HttpStatusCode } from 'axios';
import { toast } from 'react-toastify';
import { Formik, Form } from "formik";
import Modal from "components/common/popup/PopUp";
import FormikControl from "components/formik/FormikControl";
import Button from 'components/common/button/Button';
import { IAllCasesItems } from 'interfaces/all-cases.interface';
import CloudflareCaptcha from './CloudflareCaptcha';
import { useEvictionAnswerContext } from '../EvictionAnswerContext';
import EvictionAnswerService from 'services/eviction-answer.service';

const validationSchema = yup.object({
   caseNo: yup
      .string()
      .required("Please enter case number"),
});

const SearchCaseModal = () => {
   const { setEvictionAnswerCase } = useEvictionAnswerContext();
   const [openInfoModal, setInfoModal] = useState<boolean>(false);
   const [openForm, setFormModal] = useState<boolean>(false);
   const [showFillingFormModal, setShowFormModal] = useState<Boolean>(false);
   const [caseData, setCaseData] = useState<IAllCasesItems>();
   const [captchaToken, setCaptchaToken] = useState<string>('');
   const [isCaptchaVerified, setIsCaptchaVerified] = useState<boolean>(false);

   const handleCaptchaVerify = async (token: string) => {
      setCaptchaToken(token);

      try {
         // const response = await axios.post('/api/Account/verify', { token });
const response = await EvictionAnswerService.verifyCaptcha(token);
         if (response.data.success) {
            setIsCaptchaVerified(true);
            toast.success('CAPTCHA verified successfully!', {
               position: toast.POSITION.TOP_RIGHT,
            });
            // alert('CAPTCHA verified successfully!');
         } else {
            setIsCaptchaVerified(false);
            toast.error('CAPTCHA verification failed!', {
               position: toast.POSITION.TOP_RIGHT,
            });
            // alert('CAPTCHA verification failed!');
         }
      } catch (error) {
         setIsCaptchaVerified(false);
         console.error('CAPTCHA verification error:', error);
         toast.error('An error occurred during CAPTCHA verification.', {
            position: toast.POSITION.TOP_RIGHT,
         });
         // alert('An error occurred during CAPTCHA verification.');
      }
   };

   const initialValues = {
      caseNo: "",
   };

   useEffect(() => {
      setInfoModal(true);
   }, []);

   const handleCaseEnter = async (caseNo: string) => {
      if (isCaptchaVerified) {
         const response = await EvictionAnswerService.getEvictionAnswerCaseByCaseNumber(caseNo);

         if (response.status === HttpStatusCode.Ok) {
            const records = response.data;
            setEvictionAnswerCase(response.data);
            setCaseData(response.data);
            setFormModal(true);
            setInfoModal(false);
         }
         else {
            toast.error("No case found with this case number", {
               position: toast.POSITION.TOP_RIGHT,
            });
            setInfoModal(true);
            setFormModal(false);
         }
      }
      else {
         toast.error("CAPTCHA is not verified", {
            position: toast.POSITION.TOP_RIGHT,
         });
      }
      //  setIsCaptchaVerified(false);
   };

   return (
      <>

         {/* {openForm && caseData && !openInfoModal && ( // Ensure caseData is not null before rendering FillingForm
            <EvictionAnswerForm
               showFillingFormModal={openForm}
               handleFormModal={(value: boolean) => {
                  setInfoModal(!value)
               }}
               caseData={caseData} // Pass caseData as a prop to FillingForm
            />
         )} */}
         <Modal showModal={openInfoModal} onClose={() => setFormModal(false)} width="max-w-xs">
            <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
               <div className="sm:flex sm:items-start">
                  <div className="text-center sm:text-left">
                     <h3 className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5 -mt-2" id="modal-title">
                        Search Case Number:
                     </h3>
                  </div>
               </div>
               <Formik
                  initialValues={initialValues}
                  validationSchema={validationSchema}
                  onSubmit={(values) => handleCaseEnter(values.caseNo)}
               >
                  {(formik) => (
                     <Form className="pt-1">
                        <div className="mb-3">
                           <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="text"
                                 label={"Case Number"}
                                 name={"caseNo"}
                                 placeholder={"Enter Case Number"}
                              />
                           </div>
                        </div>
                        <div className='flex justify-center scale-110'>
                           <CloudflareCaptcha onVerify={handleCaptchaVerify} />
                        </div>

                        <div className="mt-2 md:mt-0 pt-4 flex justify-end items-center">
                           {/* <Button
                              type="button"
                              isRounded={false}
                              title="Cancel"
                              handleClick={() => setInfoModal(false)}
                              classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                           ></Button> */}
                           <Button
                              title={"Submit"}
                              type={"submit"}
                              isRounded={false}
                              classes="py-2 md:py-2.5 px-4 inline-flex justify-center items-center gap-x-1.5 text-xs font-semibold rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                           ></Button>
                        </div>
                     </Form>
                  )}
               </Formik>
            </div>
         </Modal>
      </>
   );
};

export default SearchCaseModal;
