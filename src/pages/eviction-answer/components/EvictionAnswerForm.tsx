import React, { useEffect, useRef, useState } from 'react';
import * as yup from "yup";
import { Formik, Form, FormikProps } from "formik";
import InputMask from "react-input-mask";
import Modal from 'components/common/popup/PopUp';
import Button from 'components/common/button/Button';
import FormikControl from 'components/formik/FormikControl';
import { IEvictionAnswerItems } from 'interfaces/eviction-answer.interface';
import EvictionAnswerService from 'services/eviction-answer.service';
import { HttpStatusCode } from 'utils/enum';
import { useEvictionAnswerContext } from '../EvictionAnswerContext';

const validationSchema = yup.object({
   defendantName: yup
      .string()
      .max(50, "Sign must not exceed 50 characters")
      .required("Please enter Defendant Name"),
   phone: yup.string().matches(/^\(\d{3}\) \d{3}-\d{4}$/, "Please enter a valid  phone number"),
   email: yup
      .string()
      .email("Please enter a valid Email address")
      .required("Please enter your Email")
      .max(50, "The Email must not exceed 50 characters"),
});

type FillingFormProps = {
   handleCancel: () => void;
};

const EvictionAnswerForm = (props: FillingFormProps) => {
   const { evictionAnswerCase, setActiveStep, setPdfLink, evictionAnswerFormInfo, setEvictionAnswerFormInfo } = useEvictionAnswerContext();
   const [openInfoModal, setInfoModal] = useState<boolean>(false);
   const [otherAnswerValue, setOtherAnswerValue] = useState<string>();
   const [showModal, setShowModal] = useState<boolean>(false);
   const [otherCounterClaimAnswerValue, setOtherCounterClaimAnswerValue] = useState<string>();
   const tenantNamesString = evictionAnswerCase.tenantNames
      .map(tenant => `${tenant.firstName} ${tenant.lastName}`)
      .join(', ');
   const textareaRef1 = useRef<HTMLTextAreaElement>(null);
   const textareaRef2 = useRef<HTMLTextAreaElement>(null);

   const adjustHeight = (textarea: HTMLTextAreaElement | null) => {
      if (textarea) {
         textarea.style.height = 'auto';
         textarea.style.height = `${textarea.scrollHeight}px`;
      }
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>, formik: FormikProps<IEvictionAnswerItems>) => {
      const { value } = e.target;
      setOtherAnswerValue(value);
      adjustHeight(textareaRef1.current);


      formik.setFieldValue('otherAnswerText', value as string);
   };

   const handleCounterInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>, formik: FormikProps<IEvictionAnswerItems>) => {
      const { value } = e.target;
      setOtherCounterClaimAnswerValue(value);
      adjustHeight(textareaRef2.current);

      formik.setFieldValue('otherCounterclaimText', value);
   };

   const initialValues: IEvictionAnswerItems = {
      isDefendant:evictionAnswerFormInfo? evictionAnswerFormInfo.isDefendant: false,
      isNotDefendant: evictionAnswerFormInfo? evictionAnswerFormInfo.isNotDefendant:  false,
      noRelationship: evictionAnswerFormInfo? evictionAnswerFormInfo.noRelationship: false,
      noNotice:evictionAnswerFormInfo? evictionAnswerFormInfo.noNotice:  false,
      wrongTermination: evictionAnswerFormInfo? evictionAnswerFormInfo.wrongTermination: false,
      noRent: evictionAnswerFormInfo? evictionAnswerFormInfo.noRent:  false,
      refusedRent:evictionAnswerFormInfo? evictionAnswerFormInfo.refusedRent:  false,
      refusedRentCost:evictionAnswerFormInfo? evictionAnswerFormInfo.refusedRentCost: false,
      failedRepair:evictionAnswerFormInfo? evictionAnswerFormInfo.failedRepair: false,
      noEntitled:evictionAnswerFormInfo? evictionAnswerFormInfo.noEntitled: false,
      noMoney:evictionAnswerFormInfo? evictionAnswerFormInfo.noMoney: false,
      otherAnswer:evictionAnswerFormInfo? evictionAnswerFormInfo.otherAnswer: false,
      otherAnswerText:evictionAnswerFormInfo? evictionAnswerFormInfo.otherAnswerText:  "",
      counterclaim: evictionAnswerFormInfo? evictionAnswerFormInfo.counterclaim: false,
      counterclaimAmount:evictionAnswerFormInfo? evictionAnswerFormInfo.counterclaimAmount: 0,
      counterclaimReason:evictionAnswerFormInfo? evictionAnswerFormInfo.counterclaimReason: "",
      failedRepairProperty:evictionAnswerFormInfo? evictionAnswerFormInfo.failedRepairProperty: false,
      repairValueReduction:evictionAnswerFormInfo? evictionAnswerFormInfo.repairValueReduction: 0
      , reductionMonths:evictionAnswerFormInfo? evictionAnswerFormInfo.reductionMonths: 0,
      repairCostCheck:evictionAnswerFormInfo? evictionAnswerFormInfo.repairCostCheck: false,
      repairCost:evictionAnswerFormInfo? evictionAnswerFormInfo.repairCost: 0,
      damageAmountCheck:evictionAnswerFormInfo? evictionAnswerFormInfo.damageAmountCheck: false,
      damageAmount:evictionAnswerFormInfo? evictionAnswerFormInfo.damageAmount: 0,
      otherCounterclaim:evictionAnswerFormInfo? evictionAnswerFormInfo.otherCounterclaim: false,
      otherCounterclaimText:evictionAnswerFormInfo? evictionAnswerFormInfo.otherCounterclaimText: "",
      signature:evictionAnswerFormInfo? evictionAnswerFormInfo.signature: "",
      email:evictionAnswerFormInfo? evictionAnswerFormInfo.email:"",
      phone:evictionAnswerFormInfo? evictionAnswerFormInfo.phone: "",
      defendantName:evictionAnswerFormInfo? evictionAnswerFormInfo.defendantName: "",
      caseNo: evictionAnswerCase.caseNo,
      pdfUrl: "",
      disposId: "",
   };

   useEffect(() => {
      adjustHeight(textareaRef1.current);
      adjustHeight(textareaRef2.current);
   }, []);

   

   const handleContinue = async (formValues: IEvictionAnswerItems) => {
      try {
         // setShowModal(true);
         // setInfoModal(true);
         // formValues.counterclaimAmount = formValues.counterclaim ? formValues.counterclaimAmount : 0;
         // formValues.counterclaimReason = formValues.counterclaim ? formValues.counterclaimReason : "";
         // formValues.repairValueReduction = formValues.failedRepairProperty ? formValues.repairValueReduction : 0;
         // formValues.reductionMonths = formValues.failedRepairProperty ? formValues.reductionMonths : 0;
         // formValues.repairCost = formValues.repairCostCheck ? formValues.repairCost : 0;
         // formValues.damageAmount = formValues.damageAmountCheck ? formValues.damageAmount : 0;
         // formValues.otherAnswerText = (formValues.otherAnswer && otherAnswerValue) ? otherAnswerValue : "";
         // otherAnswerTextformValues.otherCounterclaimText = (formValues.otherCounterclaim && otherCounterClaimAnswerValue) ? otherCounterClaimAnswerValue : "";
         setOtherCounterClaimAnswerValue(formValues.otherCounterclaimText);
         formValues.signature ="";
         formValues.disposId= evictionAnswerCase.id;
         const response = await EvictionAnswerService.getEvictionAnswerDocumentForSign(formValues);
         setEvictionAnswerFormInfo(formValues);
         if (response.status === HttpStatusCode.OK) {
            setPdfLink(response.data.pdfUrl);
         }
         const currentDate = new Date(); // Thu Jun 20 2024 12:05:20 GMT-0700 (Pacific Daylight Time)

         // Check if answerDate is not null before proceeding
         if (evictionAnswerCase.answerDate !== null) {
             const answerDate = new Date(evictionAnswerCase.answerDate);        
             // Convert to UTC for comparison
             const currentDateUTC = new Date(currentDate.toISOString());       
             if (answerDate < currentDateUTC) {
                 console.log("Last Date to answer has passed");
                 setInfoModal(true);
             } else {
                 console.log("Last date to answer has not passed");
                 setActiveStep(3);
             }
         } else {
             console.log("Answer date is null");
             setActiveStep(3);
         }

      } catch (error) {
         console.error("Error:", error);
      }
   };

   const openPayPalModal = () => {
      // setShowModal(true);
      // setInfoModal(true);
      setActiveStep(3);
   };

   const closeModal = () => {
      setShowModal(false);
   };

   const handleCancelClick = () => {
      evictionAnswerFormInfo.caseNo="";
      evictionAnswerFormInfo.isDefendant= false;
      evictionAnswerFormInfo.isNotDefendant=  false;
      evictionAnswerFormInfo.noRelationship= false;
      evictionAnswerFormInfo.noNotice=  false;
      evictionAnswerFormInfo.wrongTermination= false;
      evictionAnswerFormInfo.noRent=  false;
      evictionAnswerFormInfo.refusedRent=  false;
      evictionAnswerFormInfo.refusedRentCost= false;
      evictionAnswerFormInfo.failedRepair= false;
      evictionAnswerFormInfo.noEntitled= false;
      evictionAnswerFormInfo.noMoney= false;
      evictionAnswerFormInfo.otherAnswer= false;
      evictionAnswerFormInfo.otherAnswerText=  "";
      evictionAnswerFormInfo.counterclaim= false;
      evictionAnswerFormInfo.counterclaimAmount= 0;
      evictionAnswerFormInfo.counterclaimReason= "";
      evictionAnswerFormInfo.failedRepairProperty= false;
      evictionAnswerFormInfo.repairValueReduction= 0;
      evictionAnswerFormInfo.reductionMonths= 0;
      evictionAnswerFormInfo.repairCostCheck= false;
      evictionAnswerFormInfo.repairCost= 0;
      evictionAnswerFormInfo.damageAmountCheck= false;
      evictionAnswerFormInfo.damageAmount= 0;
      evictionAnswerFormInfo.otherCounterclaim= false;
      evictionAnswerFormInfo.otherCounterclaimText= "";
      evictionAnswerFormInfo.signature= "";
      evictionAnswerFormInfo.email= "";
      evictionAnswerFormInfo.phone= "";
      evictionAnswerFormInfo.defendantName= "";
      evictionAnswerFormInfo.disposId= "";
      props.handleCancel()
   }

   return (
      <>
            <div className='bg-[#edf2f9] p-5 ans_form'>
               <div className="max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
                  <div className='text-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3'>
                     <div className='flex gap-2 '>
                        <span className='font-medium'>County</span>
                        <h2>{evictionAnswerCase.county}</h2>
                     </div>
                     <div className='gap-2 text-center'>
                        <h2><span className='font-medium'>{evictionAnswerCase.stateCourt?.length ? "State Court" : "Magistrate Court"}</span></h2>
                     </div>
                     <div className='gap-2 text-right'>
                        {/* <span className='font-medium'>Case #</span> */}
                        <h2>{evictionAnswerCase.caseNo}</h2>
                     </div>
                  </div>
                  <div className="mb-3">
                     <h3 className="text-sm font-semibold px-3 py-1.5 bg-[#2472db] text-white my-2">Plaintiff Information (from Case)</h3>
                     <div className="grid grid-cols-1 gap-2">
                        <div className='flex items-center'>
                           <label className="block font-medium text-sm min-w-44">Plaintiff Name</label>
                           <input type="text" readOnly value={evictionAnswerCase.ownerName} className="peer outline-none px-2.5 py-1.5 block border w-full border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" />

                        </div>
                        <div className='flex items-center'>
                           <label className="block font-medium text-sm min-w-44">Plaintiff Address</label>
                           <input type="text" readOnly value={evictionAnswerCase.propertyAddress} className="peer outline-none px-2.5 py-1.5 block border w-full border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" />

                        </div>
                        <div className='flex items-center'>
                           <label className="block font-medium text-sm min-w-44">Plaintiff City, State Zip</label>
                           <input type="text" readOnly value={evictionAnswerCase.propertyCity + ", " + evictionAnswerCase.propertyState + " " + evictionAnswerCase.propertyZip} className="peer outline-none px-2.5 py-1.5 block border w-full border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" />

                        </div>
                        <div className='flex items-center'>
                           <label className="block font-medium text-sm min-w-44">Plaintiff Phone/Email</label>
                           <input type="text" readOnly value={evictionAnswerCase.propertyPhone + " " + evictionAnswerCase.propertyEmail} className="peer outline-none px-2.5 py-1.5 block border w-full border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" />

                        </div>
                     </div>
                  </div>
                  <div className="mb-4">
                     <h3 className="text-sm font-semibold px-3 py-1.5 bg-[#2472db] text-white my-2">Defendant Information (from Case)</h3>
                     <div className="grid grid-cols-1 gap-2">
                        <div className='flex items-center'>
                           <label className="block font-medium text-sm min-w-44">Defendant Name</label>
                           {/* <input type="text" value={evictionAnswerCase.tenantFirstName + " " + evictionAnswerCase.tenantLastName} className="peer outline-none px-2.5 py-1.5 block border w-full border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" /> */}
                           <input type="text" readOnly value={tenantNamesString + `${evictionAnswerCase.andAllOtherOccupants?.length ? " and " : ""}${evictionAnswerCase.andAllOtherOccupants ?? ""}`} className="peer outline-none px-2.5 py-1.5 block border w-full border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" />


                        </div>
                        <div className='flex items-center'>
                           <label className="block font-medium text-sm min-w-44">Defendant Address</label>
                           <input type="text" readOnly value={evictionAnswerCase.address} className="peer outline-none px-2.5 py-1.5 block border w-full border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" />

                        </div>
                        <div className='flex items-center'>
                           <label className="block font-medium text-sm min-w-44">Defendant City, State Zip</label>
                           <input type="text" readOnly value={evictionAnswerCase.city + ", " + evictionAnswerCase.state + " " + evictionAnswerCase.zip} className="peer outline-none px-2.5 py-1.5 block border w-full border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" />

                        </div>
                     </div>
                  </div>
                  <div className="mb-4">
                     <h3 className="text-sm font-semibold px-3 py-1.5 bg-[#2472db] text-white my-2">Instructions</h3>
                     <p className='text-sm text-justify'>Please check all statements that apply to your answer. If applicable, fill in the corresponding text box with the information needed to complete the statement you have selected. Place your e-signature at the bottom and press continue to pay. Once you have paid, your answer will be filed with the court. Thank you.</p>
                     {/* <p className='text-red-600 text-sm'>* - Indicates a required field</p> */}
                  </div>
                  <div className="mb-3 answer_sec">
                     <h3 className="text-sm font-semibold px-3 py-1.5 bg-[#2472db] text-white my-2">Answer</h3>
                     <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleContinue}
                     >
                        {(formik) => (
                           <Form>
                              <div className='flex items-center flex-row-reverse gap-2 justify-end mb-1'>
                                 <FormikControl
                                    control="checkbox"
                                    type="checkbox"
                                    label={"I am the defendant. I am filing an Answer. I state the following in response to Plaintiff's claim:"}
                                    name={"isDefendant"}
                                    onChange={(value: boolean) => {
                                       formik.setFieldValue("isDefendant", value);
                                    }}
                                    checked={formik.values.isDefendant}
                                 />
                              </div>
                              <div className='flex items-center flex-row-reverse gap-2 justify-end mb-1'>
                                 <FormikControl
                                    control="checkbox"
                                    type="checkbox"
                                    label={"I am not the defendant, but I am affected by this action."}
                                    name={"isNotDefendant"}
                                    onChange={(value: boolean) => {
                                       formik.setFieldValue("isNotDefendant", value);
                                    }}
                                    checked={formik.values.isNotDefendant}
                                 />
                              </div>
                              <div className='flex items-center flex-row-reverse gap-2 justify-end mb-1'>
                                 <>
                                    <FormikControl
                                       control="checkbox"
                                       type="checkbox"
                                       label={"I do not have a landlord-tenant relationship with the plaintiff."}
                                       name={"noRelationship"}
                                       onChange={(value: boolean) => {
                                          formik.setFieldValue("noRelationship", value);
                                       }}
                                       checked={formik.values.noRelationship}
                                    />
                                 </>
                                 {/* <input type="checkbox" id="no-relationship" className="mr-2 mb-1" /><label htmlFor="no-relationship">I do not have a landlord-tenant relationship with the plaintiff.</label> */}
                              </div>
                              <div className='flex items-center flex-row-reverse gap-2 justify-end mb-1'>
                                 <>
                                    <FormikControl
                                       control="checkbox"
                                       type="checkbox"
                                       label={"My landlord did not give me proper notice that my lease or rental agreement was terminated or that I had to move before filing this lawsuit."}
                                       name={"noNotice"}
                                       onChange={(value: boolean) => {
                                          formik.setFieldValue("noNotice", value);
                                       }}
                                       checked={formik.values.noNotice}
                                    />
                                 </>
                                 {/* <input type="checkbox" id="no-notice" className="mr-2 mb-1" /><label htmlFor="no-notice">My landlord did not give me proper notice that my lease or rental agreement was terminated or that I had to move before filing this lawsuit.</label> */}
                              </div>
                              <div className='flex items-center flex-row-reverse gap-2 justify-end mb-1'>
                                 <>
                                    <FormikControl
                                       control="checkbox"
                                       type="checkbox"
                                       label={"My landlord terminated my lease without a valid reason."}
                                       name={"wrongTermination"}
                                       onChange={(value: boolean) => {
                                          formik.setFieldValue("wrongTermination", value);
                                       }}
                                       checked={formik.values.wrongTermination}
                                    />
                                 </>
                                 {/* <input type="checkbox" id="wrong-termination" className="mr-2 mb-1" /><label htmlFor="wrong-termination">My landlord terminated my lease without a valid reason.</label> */}
                              </div>
                              <div className='flex items-center flex-row-reverse gap-2 justify-end mb-1'>
                                 <>
                                    <FormikControl
                                       control="checkbox"
                                       type="checkbox"
                                       label={"I do not owe any rent to my landlord."}
                                       name={"noRent"}
                                       onChange={(value: boolean) => {
                                          formik.setFieldValue("noRent", value);
                                       }}
                                       checked={formik.values.noRent}
                                    />
                                 </>
                                 {/* <input type="checkbox" id="no-rent" className="mr-2 mb-1" /><label htmlFor="no-rent">I do not owe any rent to my landlord.</label> */}
                              </div>
                              <div className='flex items-center flex-row-reverse gap-2 justify-end mb-1'>
                                 <>
                                    <FormikControl
                                       control="checkbox"
                                       type="checkbox"
                                       label={"I offered and had the money to pay my rent on or before the date I usually pay, but my landlord refused to accept it."}
                                       name={"refusedRent"}
                                       onChange={(value: boolean) => {
                                          formik.setFieldValue("refusedRent", value);
                                       }}
                                       checked={formik.values.refusedRent}
                                    />
                                 </>
                                 {/* <input type="checkbox" id="refused-rent" className="mr-2 mb-1" /><label htmlFor="refused-rent">I offered and had the money to pay my rent on or before the date I usually pay, but my landlord refused to accept it.</label> */}
                              </div>
                              <div className='flex items-center flex-row-reverse gap-2 justify-end mb-1'>
                                 <>
                                    <FormikControl
                                       control="checkbox"
                                       type="checkbox"
                                       label={"My landlord would not accept my rent and the cost of this warrant."}
                                       name={"refusedRentCost"}
                                       onChange={(value: boolean) => {
                                          formik.setFieldValue("refusedRentCost", value);
                                       }}
                                       checked={formik.values.refusedRentCost}
                                    />
                                 </>
                                 {/* <input type="checkbox" id="refused-rent-cost" className="mr-2 mb-1" /><label htmlFor="refused-rent-cost">My landlord would not accept my rent and the cost of this warrant.</label> */}
                              </div>
                              <div className='flex items-center flex-row-reverse gap-2 justify-end mb-1'>
                                 <>
                                    <FormikControl
                                       control="checkbox"
                                       type="checkbox"
                                       label={"My landlord failed to repair the property. This failure has lowered its value or resulted in other damages more than the rent claimed."}
                                       name={"failedRepair"}
                                       onChange={(value: boolean) => {
                                          formik.setFieldValue("failedRepair", value);
                                       }}
                                       checked={formik.values.failedRepair}
                                    />
                                 </>
                                 {/* <input type="checkbox" id="failed-repair" className="mr-2 mb-1" /><label htmlFor="failed-repair">My landlord failed to repair the property. This failure has lowered its value or resulted in other damages more than the rent claimed.</label> */}
                              </div>
                              <div className='flex items-center flex-row-reverse gap-2 justify-end mb-1'>
                                 <>
                                    <FormikControl
                                       control="checkbox"
                                       type="checkbox"
                                       label={"My landlord is not entitled to evict me or secure a money judgement for the following reason:"}
                                       name={"noEntitled"}
                                       onChange={(value: boolean) => {
                                          formik.setFieldValue("noEntitled", value);
                                       }}
                                       checked={formik.values.noEntitled}
                                    />
                                 </>
                                 {/* <input type="checkbox" id="no-entitled" className="mr-2 mb-1" /><label htmlFor="no-entitled">My landlord is not entitled to evict me or secure a money judgement for the following reason:</label> */}
                              </div>
                              <div className='flex items-center flex-row-reverse gap-2 justify-end mb-1'>
                                 <>
                                    <FormikControl
                                       control="checkbox"
                                       type="checkbox"
                                       label={"I was unable to pay my rent because I did not have the money."}
                                       name={"noMoney"}
                                       onChange={(value: boolean) => {
                                          formik.setFieldValue("noMoney", value);
                                       }}
                                       checked={formik.values.noMoney}
                                    />
                                 </>
                                 {/* <input type="checkbox" id="no-money" className="mr-2 mb-1" /><label htmlFor="no-money">I was unable to pay my rent because I did not have the money.</label> */}
                              </div>
                              <div className='flex items-center gap-2 mb-1'>
                                 <>
                                    <div className='flex items-center flex-row-reverse gap-2 justify-end'>
                                       <FormikControl
                                          control="checkbox"
                                          type="checkbox"
                                          label={"Other:"}
                                          name={"otherAnswer"}
                                          onChange={(value: boolean) => {
                                             formik.setFieldValue("otherAnswer", value);
                                             formik.setFieldValue("otherAnswerText", "");
                                          }}
                                          checked={formik.values.otherAnswer}
                                       />
                                    </div>

                                    {formik.values.otherAnswer && (
                                       <textarea
                                          rows={1}
                                          cols={115}
                                          id="multilineInput"
                                          ref={textareaRef1}
                                          name={"otherAnswerText"}
                                          value={formik.values.otherAnswerText}
                                          onChange={(e) => handleInputChange(e, formik)}
                                          className="peer outline-none p-2 md:p-2.5 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                       />
                                    )}
                                 </>
                              </div>
                              <div className="mb-3">
                                 <h3 className="text-sm font-semibold px-3 py-1.5 bg-[#2472db] text-white my-2">Counterclaim</h3>
                                 <div className='flex items-center gap-1.5 mb-1.5'>
                                    <div className='flex items-center gap-2'>
                                       <div className='flex items-center'>
                                          <FormikControl
                                             control="checkbox"
                                             type="checkbox"
                                             name={"counterclaim"}
                                             onChange={(value: boolean) => {
                                                formik.setFieldValue("counterclaim", value);
                                                formik.setFieldValue("counterclaimAmount", 0);
                                                formik.setFieldValue("counterclaimReason", "");
                                             }}
                                             checked={formik.values.counterclaim}
                                          />
                                          <div className='flex items-center text-sm gap-1 ml-2 text-nowrap'>
                                             <FormikControl
                                                control="number"
                                                type="number"
                                                label={"My landlord owes me"}
                                                name={"counterclaimAmount"}
                                                placeholder={"Amount"}
                                                disabled={!formik.values.counterclaim}
                                             />
                                          </div>
                                       </div>

                                       <div className='flex items-center text-sm gap-1 text-nowrap'>
                                          <FormikControl
                                             control="input"
                                             type={"text"}
                                             label={"for the following reason(s)"}
                                             name={"counterclaimReason"}
                                             disabled={!formik.values.counterclaim}
                                          />
                                       </div>
                                    </div>
                                    {/* <input type="checkbox" />
                                                <div className='flex items-center text-sm gap-1'>
                                                    <label className='text-nowrap'>My landlord owes me $</label>
                                                    <input type="text" className="peer outline-none px-2.5 py-1 block border w-full border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" placeholder="Amount" />
                                                </div>
                                                <div className='flex items-center text-sm gap-1'>
                                                    <label className='text-nowrap'>for the following reason(s)</label>
                                                    <input type="text" className="peer outline-none px-2.5 py-1 block border w-full border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" />
                                                </div> */}
                                 </div>
                                 <div className='flex items-center gap-1.5 flex-wrap mb-1.5'>
                                    <div className='flex items-center'>
                                       <FormikControl
                                          control="checkbox"
                                          type="checkbox"
                                          name={"failedRepairProperty"}
                                          onChange={(value: boolean) => {
                                             formik.setFieldValue("failedRepairProperty", value);
                                             formik.setFieldValue("repairValueReduction", 0);
                                             formik.setFieldValue("reductionMonths", 0);
                                          }}
                                          checked={formik.values.failedRepairProperty}
                                       />
                                       <div className='flex items-center text-sm gap-2 text-nowrap ml-2'>
                                          <FormikControl
                                             control="number"
                                             type="number"
                                             label={"My landlord failed to repair my property. Due to this failure, its value has been reduced $"}
                                             name={"repairValueReduction"}
                                             placeholder={"Amount"}
                                             disabled={!formik.values.failedRepairProperty}
                                          />
                                       </div>
                                    </div>
                                    <div className='flex items-center text-sm gap-2 text-nowrap'>
                                       <FormikControl
                                          control="input"
                                          type={"number"}
                                          label={"each month for"}
                                          placeholder={"Months"}
                                          name={"reductionMonths"}
                                          disabled={!formik.values.failedRepairProperty}
                                       />months.
                                    </div>
                                    {/* <input type="checkbox" />
                                                <div className='flex items-center text-sm gap-1'>
                                                    <label className='text-nowrap'>My landlord failed to repair my property. Due to this failure, its value has been reduced $</label>
                                                    <input type="text" className="peer outline-none px-2.5 py-1 block border w-full border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" placeholder="Amount" />
                                                </div>
                                                <div className='flex items-center text-sm gap-1'>
                                                    <label className='text-nowrap'>each month for</label>
                                                    <input type="text" className="peer outline-none px-2.5 py-1 block border w-full border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" placeholder="Months" /> months.
                                                </div> */}
                                 </div>
                                 <div className='flex items-center gap-2 mb-1.5'>
                                    <div className='flex items-center'>
                                       <FormikControl
                                          control="checkbox"
                                          type="checkbox"
                                          name={"repairCostCheck"}
                                          onChange={(value: boolean) => {
                                             formik.setFieldValue("repairCostCheck", value);
                                             formik.setFieldValue("repairCost", 0);
                                          }}
                                          checked={formik.values.repairCostCheck}
                                       />
                                    </div>

                                    <div className='flex items-center text-sm gap-2 text-nowrap'>
                                       <FormikControl
                                          control="number"
                                          type="number"
                                          label={"Since my landlord failed to make requested repairs, I made these repairs that cost $"}
                                          name={"repairCost"}
                                          placeholder={"Amount"}
                                          disabled={!formik.values.repairCostCheck}
                                       />
                                    </div>
                                    {/* <input type="checkbox" />
                                                <div className='flex items-center text-sm gap-1'>
                                                    <label className='text-nowrap'>Since my landlord failed to make requested repairs, I made these repairs that cost $</label>
                                                    <input type="text" className="peer outline-none px-2.5 py-1 block border w-full border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" placeholder="Amount" />
                                                </div> */}
                                 </div>
                                 <div className='flex items-center gap-1.5 mb-1.5'>
                                    <div className='flex items-center gap-2'>
                                       <div className='flex items-center'>
                                          <FormikControl
                                             control="checkbox"
                                             type="checkbox"
                                             name={"damageAmountCheck"}
                                             onChange={(value: boolean) => {
                                                formik.setFieldValue("damageAmountCheck", value);
                                                formik.setFieldValue("damageAmount", 0);
                                             }}
                                             checked={formik.values.damageAmountCheck}
                                          />
                                       </div>
                                       <div className='flex items-center text-nowrap gap-2'>
                                          <FormikControl
                                             control="number"
                                             type="number"
                                             label={"My landlord's failure to repair resulted in damage of $"}
                                             name={"damageAmount"}
                                             placeholder={"Amount"}
                                             disabled={!formik.values.damageAmountCheck}
                                          />
                                       </div>
                                       <p className='text-nowrap text-sm'>to my person/property.</p>
                                    </div>
                                    {/* <input type="checkbox" />
                                                <div className='flex items-center text-sm gap-1'>
                                                    <label className='text-nowrap'>My landlord's failure to repair resulted in damage of $</label>
                                                    <input type="text" className="peer outline-none px-2.5 py-1 block border w-full border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" placeholder="Amount" />
                                                    <label className='text-nowrap'>to my person/property.</label>
                                                </div> */}
                                 </div>
                                 <div className='flex items-center gap-2 mb-1.5'>
                                    <>
                                       <div className='flex items-center gap-2 flex-row-reverse'>
                                          <FormikControl
                                             control="checkbox"
                                             type="checkbox"
                                             label={"Other:"}
                                             name={"otherCounterclaim"}
                                             onChange={(value: boolean) => {
                                                formik.setFieldValue("otherCounterclaim", value);
                                                formik.setFieldValue("otherCounterclaimText", "");
                                             }}
                                             checked={formik.values.otherCounterclaim}
                                          />
                                       </div>

                                       {formik.values.otherCounterclaim && (
                                          <textarea
                                             rows={1}
                                             cols={115}
                                             id="multilineInput"
                                             ref={textareaRef2}
                                             name={'otherCounterclaimText'}
                                             value={formik.values.otherCounterclaimText}
                                             onChange={(event) => handleCounterInputChange(event, formik)}
                                             className="peer outline-none p-2 md:p-2.5 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                          />
                                       )}
                                    </>
                                    {/* <input type="checkbox" />
                                                <div className='flex items-center text-sm gap-1'>
                                                    <label className='text-nowrap'>Other:</label> */}
                                    {/* <input type="text" className="peer outline-none px-2.5 py-1 block border w-full border-gray-200 rounded text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" /> */}
                                    {/* <textarea
                                                        rows={1}
                                                        cols={115}
                                                        id="multilineInput"
                                                        ref={textareaRef2}
                                                        onInput={() => adjustHeight(textareaRef2.current)}
                                                        className="peer outline-none p-2 md:p-2.5 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
                                                    />
                                                </div> */}
                                 </div>
                              </div>
                              <div className="mb-3">
                                 <h3 className="text-sm font-semibold px-3 py-1.5 bg-[#2472db] text-white my-2">Defendant Personal Information</h3>
                                 <div className='flex justify-between items-start'>
                                    <div className="flex flex-col gap-1.5 info_box">
                                       <div className="relative flex items-center text-nowrap gap-1.5">
                                          <FormikControl
                                             control="input"
                                             type="text"
                                             label={"Defendant Full Name"}
                                             name={"defendantName"}
                                             placeholder={"Enter defendant name"}
                                             showAsteric={true}
                                          />
                                       </div>
                                       <div className="relative flex items-center text-nowrap gap-1.5">
                                          <FormikControl
                                             control="input"
                                             type="text"
                                             label={"Email Address"}
                                             name={"email"}
                                             placeholder={"Enter email address"}
                                             showAsteric={true}
                                          />
                                       </div>
                                       <div className="relative flex items-center text-nowrap gap-1.5">
                                          <label
                                             htmlFor={"role"}
                                             className="text-gray-600 text-[11px] md:text-xs font-medium"
                                          >
                                             Phone Number
                                          </label>
                                          <InputMask
                                             mask="(999) 999-9999"
                                             maskChar=" "
                                             value={formik.values.phone}
                                             onChange={formik.handleChange}
                                             onBlur={formik.handleBlur}
                                             name="phone"
                                             id="phone"
                                             placeholder="Enter Phone Number"
                                             className="peer outline-none p-2.5 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none   " // Custom class for styling
                                          />
                                          {formik.touched.phone && formik.errors.phone ? (
                                             <div className="text-[11px] text-aidonicRed text-red-500">{formik.errors.phone}</div>
                                          ) : null}
                                       </div>
                                    </div>
                                 </div>
                              </div>
                              <div className="flex justify-center items-center gap-2 mt-5">
                                 <Button
                                    type="button"
                                    isRounded={false}
                                    title="Cancel"
                                    handleClick={handleCancelClick}
                                    classes="text-[13px] md:text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                                 ></Button>
                                 <Button
                                    title={"Continue"}
                                    type={"submit"}
                                    isRounded={false}
                                    classes="text-[11px] md:text-xs bg-[#2472db] hover:bg-[#0d5ecb] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                                 ></Button>
                              </div>
                           </Form>
                        )}
                     </Formik>
                  </div>
               </div>
            </div>
         

         <Modal showModal={openInfoModal} onClose={() => setInfoModal(false)} width="max-w-md">
            <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
               <div className="sm:flex sm:items-start">
                  <h3 className="text-base mt-3" id="modal-title">
                  Answers submitted after the 7-day deadline may not be accepted by the court. Click 'Ok' below to continue with your answer submission.
                     {/* This is a late answer and may not be accepted by the court. Submitting this answer does not constitute acceptance by the court. Are you pretty comfortable with that? */}
                  </h3>
               </div>
               <div className="mt-2 md:mt-0 pt-4 flex justify-end items-center">
                  <Button
                     type="button"
                     isRounded={false}
                     title="Cancel"
                     handleClick={() => setInfoModal(false)}
                     classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                  ></Button>
                  <Button
                     title={"Ok"}
                     type={"submit"}
                     isRounded={false}
                     handleClick={openPayPalModal}
                     classes="py-2 md:py-2.5 px-4 inline-flex justify-center items-center gap-x-1.5 text-xs font-semibold rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                  ></Button>
               </div>
            </div>
         </Modal>
      </>
   );
};

export default EvictionAnswerForm;

