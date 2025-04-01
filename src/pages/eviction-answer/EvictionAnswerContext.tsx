import React, {
   Dispatch,
   useContext,
   createContext,
   useState,
   SetStateAction
} from "react";
import { HttpStatusCode } from "utils/enum";
import EvictionAnswerService from "services/eviction-answer.service";
import { IAllCasesItems } from "interfaces/all-cases.interface";
import { IEvictionAnswerItems } from "interfaces/eviction-answer.interface";


export type EvictionAnswerContextType = {
   showSpinner: boolean;
   setShowSpinner: Dispatch<SetStateAction<boolean>>;
   activeStep: number;
   setActiveStep: Dispatch<SetStateAction<number>>;
   pdfLink: string;
   setPdfLink: Dispatch<SetStateAction<string>>;
   evictionAnswerCase: IAllCasesItems;
   evictionAnswerFormInfo: IEvictionAnswerItems;
   setEvictionAnswerCase: Dispatch<SetStateAction<IAllCasesItems>>;
   setEvictionAnswerFormInfo: Dispatch<SetStateAction<IEvictionAnswerItems>>;
   getEvictionAnswerCase: (caseNumber: string) => void;
};

const initialEvictionAnswerContextValue: EvictionAnswerContextType = {
   showSpinner: false,
   setShowSpinner: () => { },
   activeStep: 1,
   setActiveStep: () => {},
   pdfLink: "",
   setPdfLink: () => { },
   evictionAnswerCase: {
      isChecked: false,
      id: "",
      status: "",
      caseNo: "",
      documents: [],
      militaryStatusDoc: [],
      tenantNames: [],
      propertyName: "",
      county: "",
      tenantFirstName: "",
      tenantLastName: "",
      unit: "",
      address: "",
      city: "",
      state: "",
      zip: "",
      attorneyBarNo: "",
      evictionDateFiled: null,
      evictionServiceDate: null,
      answerBy: null,
      evictionServiceMethod: "",
      courtDate: null,
      dismissalFileDate: null,
      writFiledDate: null,
      attorneyName: "",
      evictionAffiantSignature: "",
      answerDate: null,
      writSignDate: null,
      noticeCount: 0,
      evictionCount: 0,
      amendmentAffiantSignature: "",
      amendedBy: "",
      reason: "",
      companyName: "",
      ownerName: "",
      monthlyRent: "",
      totalRent: "",
      evictionAffiantIs: "",
      andAllOtherOccupants: "",
      envelopeNo: "",
      createdAt: "",
      crmInfo: {
         id: "",
         crmName: "",
         status: "",
         statusDate: null,
      },
      clientReferenceId:"",
      issueDate: null,
      isDismissal: null
   },
   evictionAnswerFormInfo: {
      isDefendant: false,
      isNotDefendant: false,
      noRelationship: false,
      noNotice: false,
      wrongTermination: false,
      noRent: false,
      refusedRent: false,
      refusedRentCost: false,
      failedRepair: false,
      noEntitled: false,
      noMoney: false,
      otherAnswer: false,
      otherAnswerText: "",
      counterclaim: false,
      counterclaimAmount: 0,
      counterclaimReason: "",
      failedRepairProperty: false,
      repairValueReduction: 0
      , reductionMonths: 0,
      repairCostCheck: false,
      repairCost: 0,
      damageAmountCheck: false,
      damageAmount: 0,
      otherCounterclaim: false,
      otherCounterclaimText: "",
      signature: "",
      email: "",
      phone: "",
      defendantName: "",
      caseNo: "",
      pdfUrl: "",
      disposId: ""
   },
   setEvictionAnswerCase: () => { },
   setEvictionAnswerFormInfo: () => { },
   getEvictionAnswerCase: () => { },
};

export const EvictionAnswerContext = createContext<EvictionAnswerContextType>(initialEvictionAnswerContextValue);

export const EvictionAnswerProvider: React.FC<{ children: any }> = ({ children }) => {
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [activeStep, setActiveStep] = useState<number>(1);
   const [pdfLink, setPdfLink] = useState<string>('');
   const [evictionAnswerCase, setEvictionAnswerCase] = useState<IAllCasesItems>(
      initialEvictionAnswerContextValue.evictionAnswerCase
   );
   const [evictionAnswerFormInfo, setEvictionAnswerFormInfo] = useState<IEvictionAnswerItems>(
      initialEvictionAnswerContextValue.evictionAnswerFormInfo
   );

   const getEvictionAnswerCase = async (caseNumber: string) => {
      try {
         setShowSpinner(true);

         const response = await EvictionAnswerService.getEvictionAnswerCaseByCaseNumber(caseNumber);
         if (response.status === HttpStatusCode.OK) {
            setEvictionAnswerCase(response.data);
            setActiveStep(2);
         }
      } catch (error) {
         console.log(error);
      } finally {
         setShowSpinner(false);
      }
   };

   return (
      <EvictionAnswerContext.Provider
         value={{
            showSpinner,
            setShowSpinner,
            activeStep,
            setActiveStep,
            pdfLink,
            setPdfLink,
            evictionAnswerCase,
            evictionAnswerFormInfo,
            setEvictionAnswerFormInfo,
            setEvictionAnswerCase,
            getEvictionAnswerCase
         }}
      >
         {children}
      </EvictionAnswerContext.Provider>
   );
}

export const useEvictionAnswerContext = (): EvictionAnswerContextType => {
   // Get the context value using useContext
   const context = useContext(EvictionAnswerContext);
   // If the context is not found, throw an error
   if (!context) {
      throw new Error(
         "useEvictionAnswerContext must be used within a EvictionAnswerProvider"
      );
   }

   return context;
};