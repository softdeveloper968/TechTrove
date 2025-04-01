import React, { useState, useContext, createContext, Dispatch, SetStateAction } from "react";
import { HttpStatusCode } from "axios";
import ProcessServerService from "services/process-server.service";
import { IProcessServerDocumentInfo } from "interfaces/process-server.interface";

export type ProcessServerDocumentContextType = {
    showSpinner: boolean;
    setShowSpinner: Dispatch<SetStateAction<boolean>>;
    processServerDocuments: IProcessServerDocumentInfo;
    setProcessServerDocuments: Dispatch<SetStateAction<IProcessServerDocumentInfo>>;
    getProcessServerDocuments: (currentPage: number, pageSize: number, search?: string) => void;
};

const initialCasperLoginsContextValue: ProcessServerDocumentContextType = {
    showSpinner: false,
    setShowSpinner: () => { },
    processServerDocuments: {
        items: [{
            name:"",
            email:"",
            documents:[]
        }],
        currentPage: 1,
        pageSize: 1,
        totalCount: 0,
        totalPages: 1,
    },
    setProcessServerDocuments: () => { },
    getProcessServerDocuments: () => { }
 };

 export const ProcessServerDocumentContext = createContext<ProcessServerDocumentContextType>(initialCasperLoginsContextValue);

 export const ProcessServerDocumentProvider: React.FC<{ children: any }> = ({ children }) => {
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const [processServerDocuments, setProcessServerDocuments] = useState<IProcessServerDocumentInfo>(initialCasperLoginsContextValue.processServerDocuments);
 
    const getProcessServerDocuments = async (currentPage: number, pageSize: number, searchParams?: string) => {
        try {
            setShowSpinner(true);
            const response = await ProcessServerService.getProcessServerDocuments(currentPage, pageSize, searchParams);
            if (response.status === HttpStatusCode.Ok) {
                setProcessServerDocuments((prev) => ({
                    ...prev,
                    items: response.data.items,
                    currentPage: response.data.currentPage,
                    pageSize: response.data.pageSize,
                    totalCount:response.data.totalCount,
                    totalPages: response.data.totalPages,
                }));
            }
        } catch (error) {
            console.log("🚀 ~ getProcessServerDocuments ~ error:", error);
        } finally {
            setShowSpinner(false);
        }
    };
 
    return (
        <ProcessServerDocumentContext.Provider
            value={{
                showSpinner,
                setShowSpinner,
                processServerDocuments,
                setProcessServerDocuments,
                getProcessServerDocuments
            }}
        >
            {children}
        </ProcessServerDocumentContext.Provider>
    );
 }
 
 export const useProcessServerDocumentContext = (): ProcessServerDocumentContextType => {
    // Get the context value using useContext
    const context = useContext(ProcessServerDocumentContext);
    // If the context is not found, throw an error
    if (!context) {
        throw new Error(
            "Error occured in ProcessServerDocument"
        );
    }
 
    return context;
 };