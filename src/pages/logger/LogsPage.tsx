import React from "react";
import LogsGrid from "./LogsGrid";
import { LogsProvider } from "./LogsContext";
import Log_SearchFilter from "./Log_SearchFilters";
import Log_SearchBar from "./Log_SearchBar";
type LogsProps = {};

const LogsPage = (props: LogsProps) => {
    return (
        <LogsProvider>
            <div className="relative flex flex-wrap items-center md:mb-2">
            <Log_SearchBar/>
            </div>
         
            <div className="logs_grid">
                <Log_SearchFilter/>
                <LogsGrid />
            </div>
        </LogsProvider>
    );
};

export default LogsPage;