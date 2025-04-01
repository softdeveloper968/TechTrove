import axios from "middlewares/axiosInstance";
import { AxiosResponse } from "axios";
import { IUsers, IUserItems, ICompany, ICompanyItems, IChangePassword, IStatePermitted } from "interfaces/all-users.interface";
import { IProperties, IPropertyItems } from "interfaces/user.interface";
import { IEvictionAutomationPropexoGridItem } from "interfaces/eviction-automation.interface";

/**
 * fetch list of AllCases from api
 * @returns list of all AllCases
 */
// const getAllUser = async (pageNumber: number,
//   pageSize: number,
//   searchParam?: string) => {
//   
//   const url: string = `api/Account/Users`;
//   const response: AxiosResponse<IUsers> = await axios<IUsers>({
//     method: "GET",
//     url: url,
//   });

//   return response as AxiosResponse<IUsers>;
// };


const getAllUser = async (
   pageNumber: number,
   pageSize: number,
   searchParam?: string
) => {
   const queryParams = new URLSearchParams({
      pageIndex: pageNumber.toString(),
      pageSize: pageSize.toString(),
      searchParam: searchParam ? searchParam : "",
   });

   const response: AxiosResponse<IUsers> = await axios<IUsers>({
      method: "GET",
      url: `/api/Account/Users?${queryParams.toString()}`,
   });

   return response as AxiosResponse<IUsers>;
};

const createUser = async (user: IUserItems) => {

   const response: AxiosResponse<IUserItems> =
      await axios<IUserItems>({
         method: "POST",
         url: `api/Account/CreateUser`,
         data: user,
      });

   return response as AxiosResponse<IUserItems>;
};

const deleteUser = async (id: string) => {

   const response: AxiosResponse<IUserItems> =
      await axios<IUserItems>({
         method: "POST",
         url: `api/`,
         data: id,
      });

   return response as AxiosResponse;
};

const editUser = async (id: string | undefined, user: IUserItems) => {
   user.id = id;
   const response: AxiosResponse<IUserItems> =
      await axios<IUserItems>({
         method: "PUT",
         url: `api/Account/UpdateUser`,
         data: user,
      });

   return response as AxiosResponse;
};

const changePassword = async (changePassword: IChangePassword) => {

   const response: AxiosResponse<IChangePassword> =
      await axios<IChangePassword>({
         method: "POST",
         url: `api/Account/ChangePassword`,
         data: changePassword,
      });

   return response as AxiosResponse;
}

const getAllCompanies = async (
   pageNumber: number,
   pageSize: number,
   searchParam?: string
) => {

   const url: string = searchParam
      ? `/api/Account/Companies/${pageNumber}/${pageSize}?searchParam=${searchParam}`
      : `/api/Account/Companies/${pageNumber}/${pageSize}`;
   const response: AxiosResponse<ICompany> = await axios<ICompany>({
      method: "GET",
      url: url,
   });

   return response as AxiosResponse<ICompany>;
};

const getAllCompaniesList = async () => {
   const response: AxiosResponse<ICompanyItems[]> = await axios<ICompanyItems[]>({
      method: "GET",
      url: "/api/Account/Companies",
   });

   return response as AxiosResponse<ICompanyItems[]>;
};

const getAllPropertiesList = async () => {
   const response: AxiosResponse<IEvictionAutomationPropexoGridItem[]> = await axios<IEvictionAutomationPropexoGridItem[]>({
      method: "GET",
      url: "/api/Propexo/PropertyList",
   });

   return response as AxiosResponse<ICompanyItems[]>;
};

const createCompany = async (company: ICompanyItems) => {
   const response: AxiosResponse<ICompanyItems> =
      await axios<ICompanyItems>({
         method: "POST",
         url: `api/Account/AddEditCompany`,
         data: company,
      });

   return response as AxiosResponse<ICompanyItems>;
};

const editCompany = async (id: string | undefined, company: ICompanyItems) => {

   company.id = id ?? "";
   const response: AxiosResponse<ICompanyItems> =
      await axios<ICompanyItems>({
         method: "POST",
         url: `api/Account/AddEditCompany`,
         data: company,
      });

   return response as AxiosResponse;
};

const getCompanyById = async (id: string) => {

   const response: AxiosResponse<ICompanyItems> = await axios<ICompanyItems>({
      method: "GET",
      url: `/api/Account/GetCompanyById?companyId=${id}`,
   });

   return response as AxiosResponse<ICompanyItems>;
};

const resendLink = async (userId: string | undefined) => {
   const response: AxiosResponse =
      await axios({
         method: "POST",
         url: `api/Account/ResendLink?userId=${userId}`,
         // data: userId,
      });

   return response as AxiosResponse;
};

const fetchPermittedStates = async (companyId: string) => {

   const response: AxiosResponse<IStatePermitted[]> =
      await axios<IStatePermitted[]>({
         method: "GET",
         url: `api/Account/FetchPermittedStates?companyId=${companyId}`,
      });

   return response as AxiosResponse<IStatePermitted[]>;
};

const getProperties = async (
   pageNumber: number,
   pageSize: number,
   searchParam?: string
) => {
   const response: AxiosResponse<IProperties> = await axios<IProperties>({
      method: "GET",
      url: `/api/Property/GetCompanyProperties/${pageNumber}/${pageSize}?searchParam=${searchParam}`,
   });

   return response as AxiosResponse<IProperties>;
};


const addEditProperty = async (id: string | undefined, property: IPropertyItems) => {

   property.id = id ?? "";
   const response: AxiosResponse<IPropertyItems> =
      await axios<IPropertyItems>({
         method: "POST",
         url: `api/Property/AddEditCompanyProperty`,
         data: property,
      });

   return response as AxiosResponse;
};
const deleteCompanyProperty = async (id: string) => {
   const response: AxiosResponse = await axios.delete(
      `/api/Property/DeleteCompanyProperty/${id}`
   );
   return response as AxiosResponse;
};
const fetchCompanyProperties = async (companyId: string) => {
   const response: AxiosResponse<IPropertyItems[]> =
      await axios<IPropertyItems[]>({
         method: "GET",
         url: `api/Property/FetchCompanyProperties?companyId=${companyId}`,
      });

   return response as AxiosResponse<IPropertyItems[]>;
};
const fetchUserProperties = async (userId: string) => {
   const response: AxiosResponse<IPropertyItems[]> =
      await axios<IPropertyItems[]>({
         method: "GET",
         url: `api/Property/FetchUserProperties?userId=${userId}`,
      });

   return response as AxiosResponse<IPropertyItems[]>;
};

const AllUsersService = {
   getAllUser,
   createUser,
   getAllCompanies,
   getAllCompaniesList,
   getAllPropertiesList,
   createCompany,
   editUser,
   editCompany,
   getCompanyById,
   changePassword,
   resendLink,
   fetchPermittedStates,
   getProperties,
   addEditProperty,
   deleteCompanyProperty,
   fetchCompanyProperties,
   fetchUserProperties
};

export default AllUsersService;
