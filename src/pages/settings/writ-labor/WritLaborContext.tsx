import React, {
  Dispatch, SetStateAction,
  createContext,
  useContext,
  useState
} from "react";
import { HttpStatusCode } from "axios";
  
  import { IWritlaborItems, IWritLabor, ICompanyItems } from "interfaces/writ-labor-interface";
import WritLaborService from "services/writ-labor.service";

  export type WritLaborContextType = {
    showSpinner: boolean;
    setShowSpinner: Dispatch<SetStateAction<boolean>>;
    writLabors: IWritLabor; 
    setWritLaborList: Dispatch<SetStateAction<IWritLabor>>;
    getListOfWritLabor: (currentPage: number, pageSize: number, search?: string) => void;
    // companies: ICompany;
    //getListOfCompany:(currentPage: number, pageSize: number, search?: string) => void;
    //setCompanyList: Dispatch<SetStateAction<ICompany>>;
    allCompanies:ICompanyItems[],
    getAllCompanies:()=>void;
    setAllCompanies:Dispatch<SetStateAction<ICompanyItems[]>>;
    editWritLabor:IWritlaborItems;
    setEditWritLabor:Dispatch<SetStateAction<IWritlaborItems>>;
    // editCompany:ICompanyItems;
    // setEditCompany:Dispatch<SetStateAction<ICompanyItems>>;
  }

  const initialWritLaborContextValue: WritLaborContextType = {
    writLabors:{
        items:[{
            email: "",
            lastName: "",
            firstName: "",
            clientId:"",
            phone:"",
        }],
        currentPage: 1,
        pageSize: 1,
        totalCount: 0,
        totalPages: 1,
    },
    setWritLaborList: () => {},
    getListOfWritLabor: () => {},
    showSpinner: false,
    setShowSpinner: () => {},   
    allCompanies:[{
      id:"",
      companyName:"",
      phone:"",
      clientType: "",
      addressLine1:"",
      addressLine2:"",
      city:"",
      state:"",
      postalCode:"",
      email:"",
      notes:"",
      isProcessServer:false,
  }],
  getAllCompanies:()=>{},
  setAllCompanies:()=>{},
  editWritLabor:{   
    email: "",
    lastName: "",
    firstName: "",
    clientId:"",
    phone:"",
    },
    setEditWritLabor:()=>{},    
  }


  export const WritLaborContext = createContext<WritLaborContextType>(
    initialWritLaborContextValue
  );

  export const WritLaborProvider: React.FC<{ children: any }> = ({
    children,
  }) => {
    const [writLabors, setWritLaborList] = useState<IWritLabor>(
        initialWritLaborContextValue.writLabors
      );
    
    const [allCompanies, setAllCompanies] = useState<ICompanyItems[]>(
        initialWritLaborContextValue.allCompanies
      );
      const [editWritLabor, setEditWritLabor] = useState<IWritlaborItems>(
        initialWritLaborContextValue.editWritLabor
      );
     
    const [showSpinner, setShowSpinner] = useState<boolean>(false);

    const getListOfWritLabor = async (
      currentPage: number,
      pageSize: number,
      search?: string
  ) => {
    
    try {
      setShowSpinner(true);
      // get late notices
      const apiResponse = await WritLaborService.getAllWritLabors(currentPage,
        pageSize,
        search);
      if (apiResponse.status === HttpStatusCode.Ok) {
        setWritLaborList((prevLateNotices) => ({
          ...prevLateNotices,
          items: apiResponse.data.items,
          currentPage: apiResponse.data.currentPage,
          pageSize: apiResponse.data.pageSize,
          totalCount:apiResponse.data.totalCount,
          totalPages: apiResponse.data.totalPages,
        }));
      }
    } finally {
      setShowSpinner(false);
    }
  };


const getAllCompanies = async() => {

try {
  setShowSpinner(true);
  // get late notices
  const apiResponse = await WritLaborService.getAllCompaniesList();
  if (apiResponse.status === HttpStatusCode.Ok) {
    setAllCompanies(apiResponse.data);
  }
} finally {
  setShowSpinner(false);
}
};

  return (
    <WritLaborContext.Provider
      value={{
        showSpinner,
        writLabors,
        setWritLaborList,
        getListOfWritLabor,
        setShowSpinner,
        allCompanies,
        getAllCompanies,
        setAllCompanies,
        editWritLabor,
        setEditWritLabor,
      }}
    >
      {children}
    </WritLaborContext.Provider>
  );
  }


  export const useWritLaborContext = (): WritLaborContextType => {
    // Get the context value using useContext
    const context = useContext(WritLaborContext);
    // If the context is not found, throw an error
    if (!context) {
      throw new Error(
        "useWritLaborContext must be used within a WritLaborProvider"
      );
    }
    // Return the context value
    return context;
  };
  