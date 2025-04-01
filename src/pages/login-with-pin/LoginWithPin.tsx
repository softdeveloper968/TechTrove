import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "context/AuthContext";
import Button from "components/common/button/Button";
import EvictionAutomationService from "services/eviction-automation.service";
import { HttpStatusCode } from "utils/enum";

const LoginWithPin = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const email=queryParams.get("email");
    const propertyName=queryParams.get("property");
    const casesList=queryParams.get("cases");
    const isDismissal=queryParams.get("isDismissal");
    const isNotice=queryParams.get("isNotice");
    // const isGA=(queryParams.get("isGA") || "false").toLowerCase()=="true";
    const state=(queryParams.get("state")||"").toUpperCase().trim();
    const propertyEmail = queryParams.get("propertyEmail");
    const propertyId = queryParams.get("propertyId");
    const ownerId = queryParams.get("ownerId");
   //s const isNoticeConfirmed=queryParams.get("isNoticeConfirmed");
    //const [propertyName,setPropertyName]=useState<string|null>("");
   // const[email,setEmail]=useState<string|null>();
    const navigate = useNavigate();
    const [pin, setPin] = useState('');
    const [isValid, setIsValid] = useState(true);

    const {setloginInfo,setSelectedStateValue,selectedStateValue}=useAuth();
    
    const handleInputChange = (e:any) => {
        setPin(e.target.value);
        if (!isValid) {
            setIsValid(true);
        }
    };

    const handlePinLogin = async() => { 
               
        if (pin.trim() === '') {
            setIsValid(false);
        } else {
            const response=await EvictionAutomationService.loginWithPin(email as string,pin);
            if (response.status === HttpStatusCode.OK) {
                const { data } = response;                    
                localStorage.setItem("casesList",casesList??""); 
                localStorage.setItem("confirmPin",pin.trim()); 
                localStorage.setItem("isDismissal",isDismissal??"");
                localStorage.setItem("isNotice",isNotice??"");
                localStorage.setItem("ownerId", ownerId ?? "");
                localStorage.setItem("propertyEmail", propertyEmail ?? "");
                localStorage.setItem("propertyId", propertyId ?? "");
              //  localStorage.setItem("isNoticeConfirmed",isNoticeConfirmed??"");
                localStorage.setItem("seletedState",state??"");
                // if(isNotice=="true" || !isGA)
                //     localStorage.setItem("seletedState","NV");
                // else
                //     localStorage.setItem("seletedState","GA");  
                if(isDismissal){
                    setloginInfo(data,true,"/dismissals?isManager="+true);  
                }  
                else if(isNotice)
                    setloginInfo(data,true,"/notices");  
                else{
                    switch(state){
                        case "GA":
                            setloginInfo(data,true,"/file-eviction?eviction="+true);
                            break;
                        case "NV":
                            setloginInfo(data,true,"/nv-file-eviction?eviction="+true);
                            break;
                        case "TX":
                                setloginInfo(data,true,"/tx-file-eviction?eviction="+true);
                                break;
                    }   
                }
                toast.success("Successfully logged in using pin.");
            }           
        }
    };
    return (
        <>
        <div className="bg-login bg-center bg-cover bg-no-repeat flex p-3.5 justify-center items-center">
            <div className="rounded-md bg-white p-3.5 md:p-6 text-center shadow-xl max-w-sm w-full">
                <h1 className="block text-xl font-bold text-gray-800 mb-1">Connect2Court</h1>
                <h1 className="mb-3 tracking-tight text-gray-900 text-base">Please Enter Pin for <span className="font-semibold">{propertyName}</span></h1>
                <input
                          type="password"
                          value={pin}
                          onChange={handleInputChange}
                          className={`peer outline-none p-2 md:p-2.5 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none ${!isValid ? 'border-red-500' : ''}`}
                      />
                    {!isValid && (
                          <p className="text-red-500 text-sm mt-1.5">Pin is required</p>
                      )}
                      <div className="pt-2.5 pb-1.5">
                      <Button
                      classes="rounded-full uppercase w-full py-2.5 px-3.5 inline-flex justify-center items-center gap-x-1.5 text-xs font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                    isRounded={false}
                    title={"Continue with Pin"}
                    type={"button"}
                    handleClick={handlePinLogin}
                ></Button>
                      </div>
                      {/* <a className="text-blue-600 decoration-2 hover:underline font-medium   " href="/login">User Login</a> */}
            </div>
            
        </div>
        </>
    );
};

export default LoginWithPin;