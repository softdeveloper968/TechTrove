import React from "react";
import { CasperLoginsProvider } from "./CasperLoginsContext";
import CasperLoginsGrid from "./CasperLoginsGrid";

type CasperLoginsProps = {};

const CasperLogins = (props: CasperLoginsProps) => {
    return (
        <CasperLoginsProvider>
            <div>
                <CasperLoginsGrid />
            </div>

        </CasperLoginsProvider>
    );
};

export default CasperLogins;