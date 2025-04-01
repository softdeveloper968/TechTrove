export interface IAosQueueItem {
    id: string;
    name: string;
    status: boolean;
    task: string;
};

export interface IAosQueue {
    items: IAosQueueItem[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    searchParam?: string;
};

export interface IAosQueueTaskItem {
    id: string;
    name: string;
    status: string;
    task: string;
    disabled: boolean;
};

export interface IAosQueueTask {
    items: IAosQueueTaskItem[];
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    searchParam?: string;
};

export interface IAosQueueStatusRequest {
    id: string;
    status: boolean;
};

export interface IAosQueueDisableRequest {
    id: string;
    disabled: boolean;
};