import React from "react";
import { useEvictionAnswerContext } from "../EvictionAnswerContext";
import SearchCaseModal from "./SearchCaseModal";
import EvictionAnswerForm from "./EvictionAnswerForm";
import ReviewSignDocument from "../ReviewSign";

const EvictionAnswerScreen = () => {
   const {
      showSpinner,
      setShowSpinner,
      evictionAnswerCase,
      getEvictionAnswerCase,
      setEvictionAnswerCase,
      activeStep,
      setActiveStep,
      pdfLink
   } = useEvictionAnswerContext();

   return (
      <>
         {!evictionAnswerCase.caseNo.length ? (
            <SearchCaseModal />
         ) : null}

         {evictionAnswerCase.caseNo.length && activeStep !== 3 ? (
            <EvictionAnswerForm
               handleCancel={() => {
                  setEvictionAnswerCase((prev) => ({
                     ...prev,
                     caseNo: ""
                  }));
               }} />
         ) : null}

         {activeStep === 3 && pdfLink?.length ? (
            <ReviewSignDocument pdfLink={pdfLink} />
         ) : null}

      </>
   )
};

export default EvictionAnswerScreen;