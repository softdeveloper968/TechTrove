import React, { useState } from "react";
import { SystemInfoProvider } from "./SystemInfoContext";
import SystemInfoGrid from "./components/SystemInfoGrid";
import SystemInfo_SearchBar from "./components/SystemInfoActions/SystemInfo_SearchBar";

// System Info component serves as the main entry point for the systemInfo page

const SystemInfo = () => {
  const [showPanel, setShowPanel] = useState<boolean>(true);

  return (
    <>
      {/* 
        Additional layout or components for the SystemInfo page can be added here.
        These could include headers, navigation, or any other page-specific elements.
      */}
      <SystemInfoProvider>
      <div className="relative flex flex-wrap items-center md:mb-2">
              <SystemInfo_SearchBar />
            </div>
        {/* 
          PaymentContainer contains the main logic and UI for the Payment page.
          It is wrapped with PaymentProvider to provide the necessary context to its children.
        */}
        <div className="system_info_grid">
        <SystemInfoGrid 
        showSystemInfoPopup={showPanel}
        handleClose={() => { setShowPanel(false); }}
        />
        </div>
            

      </SystemInfoProvider>
    </>
  );
};

export default SystemInfo;
