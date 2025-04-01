import { AxiosResponse } from "axios";
import axios from "middlewares/axiosInstance";
import {
    IAosQueueDisableRequest,
    IAosQueueStatusRequest
} from "interfaces/aos.interface";

// TODO: adjust the method when api get ready
const getAosQueues = async (currentPage: number, pageSize: number, searchParam: string = '') => {
    const queryParams = `?searchParam=${searchParam}`;
    const response: AxiosResponse =
        await axios({
            method: "GET",
            url: `api/AosQueue/${currentPage}/${pageSize}/${queryParams}`,
        });

    return response as AxiosResponse;
};

// TODO: adjust the method when api get ready
const getAosQueueTasks = async (currentPage: number, pageSize: number, searchParam: string = '') => {
    const queryParams = `?searchParam=${searchParam}`;
    const response: AxiosResponse =
        await axios({
            method: "GET",
            url: `api/AosQueue/AosQueTasks/${currentPage}/${pageSize}/${queryParams}`,
        });

    return response as AxiosResponse;
};

// TODO: adjust the method when api get ready
const updateAosQueueStatus = async (payload: IAosQueueStatusRequest) => {
    const response: AxiosResponse =
        await axios({
            method: "PUT",
            url: `api/AosQueue`,
            data: payload
        });

    return response as AxiosResponse;
};

// TODO: adjust the method when api get ready
const disableAosQueueTask = async (payload: IAosQueueDisableRequest) => {
    const response: AxiosResponse =
        await axios({
            method: "PUT",
            url: `api/AosQueue`,
            data: payload
        });

    return response as AxiosResponse;
};

const AosQueueService = {
    getAosQueues,
    getAosQueueTasks,
    updateAosQueueStatus,
    disableAosQueueTask
};

export default AosQueueService;