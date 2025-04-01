import axios from "middlewares/axiosInstance";
import { AxiosResponse } from "axios";
import { ICompanyItems, IWritLabor, IWritlaborItems } from "interfaces/writ-labor-interface";


const getAllWritLabors = async (
    pageNumber: number,
    pageSize: number,
    searchParam?: string
  ) => {
    
    const url: string = searchParam
    ? `/api/WritLabor/GetWritLabor/${pageNumber}/${pageSize}?searchParam=${searchParam}`
    : `/api/WritLabor/GetWritLabor/${pageNumber}/${pageSize}`;
    const response: AxiosResponse<IWritLabor> = await axios<IWritLabor>({
      method: "GET",
      url: url,
    });
  
    return response as AxiosResponse<IWritLabor>;
  };

  const getAllCompaniesList = async () => {
  
    const response: AxiosResponse<ICompanyItems[]> = await axios<ICompanyItems[]>({
      method: "GET",
      url: "/api/Account/Companies",
    });
  
    return response as AxiosResponse<ICompanyItems[]>;
  };
  const editWritLabor = async (id:string|undefined,writLabor: IWritlaborItems) => {
  
    writLabor.id=id;
    const response: AxiosResponse<IWritlaborItems> =
      await axios<IWritlaborItems>({
        method: "PUT",
        url: `api/WritLabor/UpdateWritLabor`,
        data: writLabor,
      });
  
    return response as AxiosResponse;
  };
  const createWritLabor = async (writLabor: IWritlaborItems) => {
  
    const response: AxiosResponse<IWritlaborItems> =
      await axios<IWritlaborItems>({
        method: "POST",
        url: `api/WritLabor/CreateWritLabor`,
        data: writLabor,
      });
  
    return response as AxiosResponse<IWritlaborItems>;
  };
  const removeWritLabor = async (writLaborId: string) => {
    const response: AxiosResponse = await axios.delete(
      `/api/WritLabor/DeleteWritLabor/${writLaborId}`
    );
  
    return response;
  };
  
  const WritLaborService = {
    getAllWritLabors,
    getAllCompaniesList,
    editWritLabor,
    createWritLabor,
    removeWritLabor
  };
  export default WritLaborService;