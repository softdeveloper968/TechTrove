import axios from "middlewares/axiosInstance";
import { AxiosResponse } from "axios";
import { IWalletItems } from "interfaces/wallet.interface";
/**
 * Get a paginated list of all wallet.
 * @param pageNumber The page number.
 * @param pageSize The number of items per page.
 * @returns AxiosResponse containing the list of wallet.
 */
const getAllWallet = async (pageNumber: number, pageSize: number,searchParam:string) => {
    const response: AxiosResponse = await axios.get(
      `/api/Accounting/GetWalletDetails/${pageNumber}/${pageSize}?searchParam=${searchParam}`
    );  
    return response;
  };
  const addAmount = async (walletItem: IWalletItems) => {
   
    const response: AxiosResponse<IWalletItems> =
    await axios<IWalletItems>({
      method: "PUT",
      url: `api/Accounting/AddAmount`,
      data: walletItem,
    });
    return response as AxiosResponse;
  };


  const getClientWalletDetail = async () => {
    
    const url = `/api/Accounting/GetClientWalletDetail`;
    const response: AxiosResponse = await axios.get(url);
    return response;
  };

  const WalletService = {
   getAllWallet,
   addAmount,
   getClientWalletDetail
  };
  
  export default WalletService;