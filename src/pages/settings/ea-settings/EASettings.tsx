import React from "react";
import EASettingsGrid from "./EASettingsGrid";
import { EASettingsProvider } from "./EASettingsContext";


type EASettingsProps = {};

const EASettings = (props: EASettingsProps) => {
    return (
        <EASettingsProvider>
            <div>
                <EASettingsGrid />
            </div>

        </EASettingsProvider>
    );
};

export default EASettings;