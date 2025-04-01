import React from "react";
import { TylerLoginsProvider } from "./TylerLoginsContext";
import TylerLoginsGrid from "./TylerLoginsGrid";

type TylerLoginsProps = {};

const TylerLogins = (props: TylerLoginsProps) => {
    return (
        <TylerLoginsProvider>
            {/* <div className="w-[25%]"></div> */}
            <div>
                <TylerLoginsGrid />
            </div>

        </TylerLoginsProvider>
    );
};

export default TylerLogins;