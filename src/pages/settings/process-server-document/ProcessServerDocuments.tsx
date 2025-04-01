import React from "react";
import { ProcessServerDocumentProvider } from "./ProcessServerDocumentsContext";
import ProcessServerDocumentsGrid from "./ProcessServerDocumentsGrid";

type ProcessServerDocumentsProps = {};

const ProcessServerDocuments = (props: ProcessServerDocumentsProps) => {
    return (
        <ProcessServerDocumentProvider>
            <div className="server_doc">
                <ProcessServerDocumentsGrid />
            </div>

        </ProcessServerDocumentProvider>
    );
};

export default ProcessServerDocuments;