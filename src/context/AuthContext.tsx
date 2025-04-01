import React, {
  createContext, FC,
  ReactNode, useContext,
  useEffect,
  useState
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { HttpStatusCode, UserRole } from "utils/enum";
import { getUserInfoFromToken } from "utils/helper";
import AuthService from "services/auth.service";
import { IUserLogin } from "interfaces/user.interface";

// Define the type for the context value
type AuthContextValue = {
  isAuthenticated: boolean;
  setIsAuthenticated: React.Dispatch<React.SetStateAction<boolean>>;
  login: (formData: IUserLogin) => void;
  logout: () => void;
  spinner: boolean;
  userRole: string[];
  permittedStates:string[];
  company: string;
  setCompany: React.Dispatch<React.SetStateAction<string>>;
  setSpinner: React.Dispatch<React.SetStateAction<boolean>>;
  unsignedAmendmentCount: number;
  setUnsignedAmendmentCount: React.Dispatch<React.SetStateAction<number>>;
  unsignedDismissalCount: number;
  setUnsignedDismissalCount: React.Dispatch<React.SetStateAction<number>>;
  unsignedWritCount: number;
  setUnsignedWritCount: React.Dispatch<React.SetStateAction<number>>;
  unsignedEvictionApprovalCount: number;
  setUnsignedEvictionApprovalCount: React.Dispatch<React.SetStateAction<number>>;
  unsignedEvictionDismissalCount: number;
  setUnsignedEvictionDismissalCount: React.Dispatch<React.SetStateAction<number>>;
  setloginInfo:(data: any,isPin:boolean,navLocation?:string) => void;
  selectedStateValue:string;
  setSelectedStateValue:React.Dispatch<React.SetStateAction<string>>
};

// Create the context with an initial value
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Create a custom provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    localStorage.getItem("user") !== null ? true : false
  );
  // Hook for redirection
  const navigate = useNavigate();
  const [spinner, setSpinner] = useState(false);
  const [userRole, setUserRole] = useState<string[]>([]);
  const [permittedStates, setPermittedStates] = useState<string[]>([]);
  const [company, setCompany] = useState<string>("");
  const [selectedStateValue, setSelectedStateValue] = useState<string>(localStorage.getItem("seletedState") ||"");
  const [unsignedAmendmentCount, setUnsignedAmendmentCount] = useState<number>(
    // Retrieve the count from localStorage or default to 0
    parseInt(localStorage.getItem("unsignedAmendmentCount") || "0", 10)
  );
  const [unsignedDismissalCount, setUnsignedDismissalCount] = useState<number>(
    // Retrieve the count from localStorage or default to 0
    parseInt(localStorage.getItem("unsignedDismissalCount") || "0", 10)
  );
  const [unsignedWritCount, setUnsignedWritCount] = useState<number>(
    // Retrieve the count from localStorage or default to 0
    parseInt(localStorage.getItem("unsignedWritCount") || "0", 10)
  );

  const [unsignedEvictionApprovalCount, setUnsignedEvictionApprovalCount] = useState<number>(
    // Retrieve the count from localStorage or default to 0
    parseInt(localStorage.getItem("unsignedEvictionApprovalCount") || "0", 10)
  );

  const [unsignedEvictionDismissalCount, setUnsignedEvictionDismissalCount] = useState<number>(
    // Retrieve the count from localStorage or default to 0
    parseInt(localStorage.getItem("unsignedEvictionDismissalCount") || "0", 10)
  );
  

  const login = async (loginRequest: IUserLogin) => {
    try {
      setSpinner(true);
      const loginResponse = await AuthService.login(loginRequest);
      if (loginResponse.status === HttpStatusCode.OK) {
        const { data } = loginResponse;
  
        if (data && !data.isActive) {
          toast.warning("Activation Required, kindly reach out to your administrator for assistance.");
          return;
        }
        setloginInfo(data,false);
        // const stringToStore = JSON.stringify(data);
        // await AuthService.handleAuthToken(stringToStore);
  
        // const loggedInUserDetail = await getUserInfoFromToken();
        // const userRoles: string[] = JSON.parse(loggedInUserDetail?.UserRoles?.toString() || "[]");

        // setUserRole(userRoles);
        // setIsAuthenticated(true);
        // setUnsignedAmendmentCount(data.unsignedAmendmentCount ?? 0);
        // setUnsignedDismissalCount(data.unsignedDismissalCount ?? 0);
        // setUnsignedWritCount(data.unsignedWritCount ?? 0);      
        // navigate("/home");
        // const company: string = loggedInUserDetail?.UserCompany || "";
        // setCompany(company);
      } else {
        // Handle non-OK status (e.g., show an error message)
      }
    } catch (error) {
      console.error("An error occurred during login:", error);
    } finally {
      setSpinner(false);
    }
  };

  const getRoleOfLoggedInUser = async () => {
    const loggedInUserDetail = await getUserInfoFromToken();
    // Parse the JSON string in "UserRoles" to an array or default to an empty array
    const userRoles: string[] = JSON.parse(
      loggedInUserDetail?.UserRoles.toString() || "[]"
    );
    const permittedStates : string[] =JSON.parse(loggedInUserDetail?.PermittedStates?.toString() || "[]");
    setUserRole(userRoles);
    if(permittedStates.length>0)
      {
        setPermittedStates(permittedStates);
        //localStorage.setItem("seletedState",permittedStates[0] ??"");  
      }
  };

  useEffect(() => {
    getRoleOfLoggedInUser();
    var recentlySelected=localStorage.getItem("seletedState");
    if(recentlySelected!=="")
      {
        setSelectedStateValue(recentlySelected??"");
       // navigate("/home");
      }
  }, []);

  const logout = () => {
    // Perform logout logic here
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("userDetail");
    localStorage.removeItem("unsignedAmendmentCount");
    localStorage.removeItem("unsignedDismissalCount");
    localStorage.removeItem("unsignedWritCount");
    localStorage.removeItem("unsignedEvictionApprovalCount");
    localStorage.removeItem("unsignedEvictionDismissalCount");
    localStorage.removeItem("casesList");
    localStorage.removeItem("confirmPin");
    localStorage.removeItem("isDismissal");
    localStorage.removeItem("isNotice");
    // localStorage.removeItem("permittedStates");
    localStorage.removeItem("seletedState");
    setSelectedStateValue("");
  };

  const setloginInfo=async (data:any,isPin:boolean,navLocation?:string)=>{
    
    const stringToStore = JSON.stringify(data);
    await AuthService.handleAuthToken(stringToStore);

    const loggedInUserDetail = await getUserInfoFromToken();
    const userRoles: string[] = JSON.parse(loggedInUserDetail?.UserRoles?.toString() || "[]");
    const permittedStates : string[] =JSON.parse(loggedInUserDetail?.PermittedStates?.toString() || "[]");
    setUserRole(userRoles);
    setPermittedStates(permittedStates);
    setIsAuthenticated(true);
    setUnsignedAmendmentCount(data.unsignedAmendmentCount ?? 0);
    setUnsignedDismissalCount(data.unsignedDismissalCount ?? 0);
    setUnsignedWritCount(data.unsignedWritCount ?? 0);   
    setUnsignedEvictionApprovalCount(data.unsignedEvictionApprovalCount ?? 0);
    setUnsignedEvictionDismissalCount(data.unsignedEvictionDismissalCount ?? 0);   
     if (!isPin && !userRoles.includes(UserRole.PropertyManager)) {
         // Get the saved intended URL or default to home
         const intendedURL = localStorage.getItem("intendedURL") || "/home";
         localStorage.removeItem("intendedURL");
         navigate(intendedURL);
     }
     else if(userRoles.includes(UserRole.PropertyManager)) {
        if(navLocation){
          navigate(navLocation);
        }
        // if(localStorage.getItem("seletedState")=="NV")
        //   navigate("/notices");
        // else
        //   navigate("/eviction-automation");
     }
    const company: string = loggedInUserDetail?.UserCompany || "";
    setCompany(company);
    if(!localStorage.getItem("seletedState")){
      // setSelectedStateValue(permittedStates[0]);
      localStorage.setItem("seletedState",permittedStates[0]);
      setSelectedStateValue(permittedStates[0]);      
    }
    else{
      setSelectedStateValue(localStorage.getItem("seletedState")??"");
    }
    
  }
  
  const contextValue: AuthContextValue = {
    isAuthenticated,
    spinner,
    setSpinner,
    setIsAuthenticated,
    userRole,
    login,
    logout,
    company,
    setCompany,
    unsignedAmendmentCount,
    setUnsignedAmendmentCount,
    unsignedDismissalCount,
    setUnsignedDismissalCount,
    unsignedWritCount,
    setUnsignedWritCount,
    unsignedEvictionApprovalCount,
    setUnsignedEvictionApprovalCount,
    unsignedEvictionDismissalCount,
    setUnsignedEvictionDismissalCount,
    setloginInfo,
    permittedStates, 
    selectedStateValue,
    setSelectedStateValue
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// Create a custom hook to consume the context
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
