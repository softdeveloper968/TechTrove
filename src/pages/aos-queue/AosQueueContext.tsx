import React, {
    Dispatch,
    useContext,
    createContext,
    useState,
    SetStateAction
} from "react";
import { HttpStatusCode } from "axios";
import { IAosQueue, IAosQueueTask } from "interfaces/aos.interface";
import AosQueueService from "services/aos.service";

export type AosQueueContextType = {
    showSpinner: boolean;
    setShowSpinner: Dispatch<SetStateAction<boolean>>;
    aosQueues: IAosQueue,
    setAosQueues: Dispatch<SetStateAction<IAosQueue>>
    getAosQueues: (currentPage: number, pageSize: number, search?: string) => void;
    aosQueueTasks: IAosQueueTask,
    setAosQueueTasks: Dispatch<SetStateAction<IAosQueueTask>>
    getAosQueueTasks: (currentPage: number, pageSize: number, search?: string) => void;
};

const initialAosQueueContextValue: AosQueueContextType = {
    showSpinner: false,
    setShowSpinner: () => { },
    aosQueues: {
        items: [
            {
                id: "123456789",
                name: "COBB",
                status: false,
                task: "File eviction"
            },
        ],
        currentPage: 1,
        pageSize: 1,
        totalCount: 0,
        totalPages: 1,
    },
    setAosQueues: () => { },
    getAosQueues: () => { },
    aosQueueTasks: {
        items: [
            {
                id: "abcdefgh",
                name: "new task",
                status: "completed",
                task: "abc123",
                disabled: false
            },
            {
                id: "abcdefgh",
                name: "new task",
                status: "completed",
                task: "abc123",
                disabled: true
            },
        ],
        currentPage: 1,
        pageSize: 1,
        totalCount: 0,
        totalPages: 1,
    },
    setAosQueueTasks: () => { },
    getAosQueueTasks: () => { }
};

export const AosQueueContext = createContext<AosQueueContextType>(initialAosQueueContextValue);

export const AosQueueProvider: React.FC<{ children: any }> = ({ children }) => {
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const [aosQueues, setAosQueues] = useState<IAosQueue>(initialAosQueueContextValue.aosQueues);
    const [aosQueueTasks, setAosQueueTasks] = useState<IAosQueueTask>(initialAosQueueContextValue.aosQueueTasks);

    const getAosQueues = async (currentPage: number, pageSize: number, searchParams?: string) => {
        try {
            setShowSpinner(true);
            const response = await AosQueueService.getAosQueues(currentPage, pageSize, searchParams);
            if (response.status === HttpStatusCode.Ok) {
                setAosQueues((prev) => ({
                    ...prev,
                    items: response.data.items,
                }));
            }
        } catch (error) {
            console.log("🚀 ~ getAosQueues ~ error:", error);
        } finally {
            setShowSpinner(false);
        }
    };

    const getAosQueueTasks = async (currentPage: number, pageSize: number, searchParams?: string) => {
        try {
            setShowSpinner(true);
            const response = await AosQueueService.getAosQueueTasks(currentPage, pageSize, searchParams);
            if (response.status === HttpStatusCode.Ok) {
                setAosQueueTasks((prev) => ({
                    ...prev,
                    items: response.data.items,
                }));
            }
        } catch (error) {
            console.log("🚀 ~ getAosQueueTasks ~ error:", error);
        } finally {
            setShowSpinner(false);
        }
    };

    return (
        <AosQueueContext.Provider
            value={{
                showSpinner,
                setShowSpinner,
                aosQueues,
                setAosQueues,
                getAosQueues,
                aosQueueTasks,
                setAosQueueTasks,
                getAosQueueTasks
            }}
        >
            {children}
        </AosQueueContext.Provider>
    );
};

export const useAosQueueContext = (): AosQueueContextType => {
    // Get the context value using useContext
    const context = useContext(AosQueueContext);
    // If the context is not found, throw an error
    if (!context) {
        throw new Error(
            "useAosQueueContext must be used within a AosQueueProvider"
        );
    }

    return context;
};