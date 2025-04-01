import React from "react";
import { ProcessServerProvider } from "./ProcessServerContext";
import ProcessServerGrid from "./ProcessServerGrid";

type ProcessServerProps = {};

const ProcessServer = (props: ProcessServerProps) => {
    return (
        <ProcessServerProvider>
            {/* <div className="w-[25%]"></div> */}
            <div>
                <ProcessServerGrid />
            </div>

        </ProcessServerProvider>
    );
};

export default ProcessServer;