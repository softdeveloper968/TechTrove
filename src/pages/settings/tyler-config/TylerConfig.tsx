import React from "react";
import { TylerConfigProvider } from "./TylerConfigContext";
import TylerConfigGrid from "./TylerConfigGrid";

type TylerConfigProps = {};

const TylerConfig = (props: TylerConfigProps) => {
    return (
        <TylerConfigProvider>
            <div>
                <TylerConfigGrid />
            </div>
        </TylerConfigProvider>
    );
};

export default TylerConfig;