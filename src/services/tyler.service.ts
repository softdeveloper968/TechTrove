import { AxiosResponse } from "axios";
import axios from "middlewares/axiosInstance";
import { ConfigStatusResource, ITylerConfigRequest, ITylerLoginRequest, ITylerUserItems } from "interfaces/tyler.interface";

const createTylerLogin = async (payload: ITylerLoginRequest) => {
    const response: AxiosResponse =
        await axios({
            method: "POST",
            url: `api/TylerUser/CreateTylerUser`,
            data: payload,
        });

    return response as AxiosResponse;
};

// TODO: Adjust the payload and url once api is ready
const getTylerUsers = async (currentPage: number, pageSize: number, searchParam: string = '') => {
    // const queryParams = `?search=${searchParam}`;
    const response: AxiosResponse =
        await axios({
            method: "GET",
            url: `api/TylerUser/GetTylerUsers/${currentPage}/${pageSize}`,
        });

    return response as AxiosResponse;
};

// TODO: Adjust the payload and url once api is ready
const editTylerLogin = async (payload: ITylerLoginRequest) => {
    const response: AxiosResponse =
        await axios({
            method: "PUT",
            url: `api/TylerUser/UpdateTylerUser`,
            data: payload,
        });

    return response as AxiosResponse;
};

// TODO: Adjust the payload and url once api is ready
const deleteTylerLogin = async (id: string) => {
    const response: AxiosResponse =
        await axios({
            method: "DELETE",
            url: `api/TylerUser/DeleteTylerUser?tylerUserId=${id}`,
        });

    return response as AxiosResponse;
};

// TODO: Adjust the payload and url once api is ready
const getTylerConfigs = async (currentPage: number, pageSize: number, searchParam: string = '', county: string = '') => {
    // const queryParams = `?search=${searchParam}`;
    const response: AxiosResponse =
        await axios({
            method: "GET",
            url: `api/TylerConfig/GetTylerCofig/${currentPage}/${pageSize}?searchParam=${searchParam}&county=${county}`,
        });

    return response as AxiosResponse;
};

const createTylerConfig = async (payload: ITylerConfigRequest) => {
    // const queryParams = `?search=${searchParam}`;
    const response: AxiosResponse =
        await axios({
            method: "POST",
            url: `api/TylerConfig/CreateTylerConfig`,
            data: payload
        });

    return response as AxiosResponse;
};

const deleteTylerConfig = async (id: string) => {
    // const queryParams = `?search=${searchParam}`;
    const response: AxiosResponse =
        await axios({
            method: "DELETE",
            url: `api/TylerConfig/DeleteTylerConfig?tylerConfigId=${id}`,
        });

    return response as AxiosResponse;
};

const getAllTylerUsersList = async () => {  
    const response: AxiosResponse<ITylerUserItems[]> = await axios<ITylerUserItems[]>({
      method: "GET",
      url: "/api/TylerUser/GetAllTylerUser",
    });
  
    return response as AxiosResponse<ITylerUserItems[]>;
  };

  const editTylerConfig = async (payload: ITylerConfigRequest) => {
    
    const response: AxiosResponse =
        await axios({
            method: "PUT",
            url: `api/TylerConfig/UpdateTylerConfig`,
            data: payload,
        });

    return response as AxiosResponse;
};
const getAllTylerConfigCourt = async () => {
    const url = `/api/TylerConfig/GetAllTylerCofig`;
    const response: AxiosResponse = await axios.get(url);
    return response;
  };

const getCourtsByState=async(state:string,court:string,caseType:string,filingCode:string,fileIntoExistingCase:boolean,category:string)=>{

    const payload: any = {
        state: state,
        court: court,
        CaseType: caseType,
        filingCode:filingCode,
        fileIntoExistingCase:fileIntoExistingCase,
        caseCategory:category ?? ""
    };
    const response: AxiosResponse =
    await axios({
        method: "POST",
        url: `api/TylerConfig/GetCourtsByState`,
        data: payload,
    });

return response as AxiosResponse;
};
const updateConfigStatus = async (payload:ConfigStatusResource) => {
    const response: AxiosResponse = await axios({
        method: "PUT",
        url: `api/TylerConfig/UpdateConfigStatus`,
        data: payload
    });

    return response as AxiosResponse;
};


const TylerService = {
    createTylerLogin,
    editTylerLogin,
    deleteTylerLogin,
    getTylerUsers,
    getTylerConfigs,
    createTylerConfig,
    deleteTylerConfig,
    getAllTylerUsersList,
    editTylerConfig,
    getAllTylerConfigCourt,
    getCourtsByState,
    updateConfigStatus
};

export default TylerService;