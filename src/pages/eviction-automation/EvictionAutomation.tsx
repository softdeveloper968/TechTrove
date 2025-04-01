import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { EvictionAutomationQueueProvider } from "./EvictionAutomationContext";
import { useAuth } from "context/AuthContext";
import EvictionAutomationSearchBar from "./components/EvictionAutomationActions/EvictionAutomation_SearchBar";
import EvictionAutomationButtons from "./components/EvictionAutomationButtons";
import TabComponent from "components/common/tabs/tabs";
import EvictionAutomationApprovalGrid from "./components/EvictionAutomationApprovalGrid";
import EvictionAutomationApprovedGrid from "./components/EvictionAutomationApprovedGrid";
import EvictionAutomationStatusGrid from "./components/EvictionAutomationStatusGrid";
import EvictionAutomationSettingsGrid from "./components/EvictionAutomationSettingsGrid";
import EvictionAutomationDismissalsApprovalGrid from "./components/EvictionAutomationDismissalsApprovalGrid";
import EvictionAutomationDismissalsApprovedGrid from "./components/EvictionAutomationDismissalsApprovedGrid";
import { EvictionAutomationButtonList } from "utils/constants";
import { UserRole } from "utils/enum";
import { IEvictionAutomationQueueItem } from "interfaces/eviction-automation.interface";
import EvictionAutomationService from "services/eviction-automation.service";
import ReviewSign from "./ReviewSign";
import CreateNotice from "./CreateNotice";
import EvictionAutomationPropexoGrid from "./components/EvictionAutomationPropexoGrid";
import EAEvictionsGrid from "./components/EAEvictionsGrid";
import EANoticesGrid from "./components/EANoticesGrid";
import EADismissalsGrid from "./components/EADismissalsGrid";
import TransactionCodesGrid from "./components/TransactionCodesGrid";
import EASettingsGrid from "pages/settings/ea-settings/EASettingsGrid";
import EvictionAutomationIntegrationsGrid from "./components/EvictionAutomationIntegrations/EvictionAutomationYardiGrid";
import EvictionAutomationCRMSettingsGrid from "./components/EvictionAutomationCRMSettingsGrid";
import EvictionAutomationYardiGrid from "./components/EvictionAutomationIntegrations/EvictionAutomationYardiGrid";
import EvictionAutomationRealPageGrid from "./components/EvictionAutomationIntegrations/EvictionAutomationRealPageGrid";
import EvictionAutomationTransactionCodesGrid from "./components/EvictionAutomationTransactionCodesGrid";

type EvictionAutomationQueueProps = {};

const EvictionAutomation = (props: EvictionAutomationQueueProps) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isApproved = queryParams.get("isApproved") === "true";
  const isdismissal = queryParams.get("isDismissal") === "true"
  // const isNotice = queryParams.get("isNotice") === "true"

  //  const casesList=queryParams.get("cases");

  useEffect(() => {
    // if(selectedStateValue=="NV")
    //   setTabName("Settings");
    // else if (localStorage.getItem("isDismissal")) {
    //   setTabName("Confirm Dismissals");
    // }
    // else if (isdismissal) {
    //   setTabName("Sign Dismissals");
    // }
    // else if (localStorage.getItem("isNotice") && selectedStateValue == "NV") {
    //   setTabName("Confirm Notices");
    // }
    // else if(isNotice && selectedStateValue=="NV"){      
    //   setTabName("Confirm Notices");
    // }  
    // else if (localStorage.getItem("isNoticeConfirmed") && selectedStateValue=="NV") {
    //   setTabName("Confirmed Notices");
    // }
    // else if (isNotice) {
    //   localStorage.setItem("seletedState", "NV");
    //   setSelectedStateValue("NV");
    //   setTabName("Confirmed Notices");

    // }
    // else if (selectedStateValue == "NV" || userRole.includes(UserRole.C2CAdmin)) {
    //   setTabName("Confirm Notices");
    // }

  }, []);

  const [showReviewSign, setShowReviewSign] = useState<boolean>(false);
  const [showCreateNotice, setShowCreateNotice] = useState<boolean>(false);

  const { userRole,
    unsignedEvictionApprovalCount,
    setUnsignedEvictionApprovalCount,
    unsignedEvictionDismissalCount,
    selectedStateValue,
    setUnsignedEvictionDismissalCount, setSelectedStateValue } = useAuth();

  // const [tabName, setTabName] = useState(isApproved ? "Sign Evictions" : "Confirm Delinquencies");
  const [tabName, setTabName] = useState((["NV"].includes(selectedStateValue)) ? "EA - Notices" : "EA - Evictions");

  // const [tabName, setTabName] = useState("Confirm Delinquencies");

  const handleUpdateEASetting = async (formValues: IEvictionAutomationQueueItem) => {
    try {

      // Attempt to delete the county
      const response = await EvictionAutomationService.UpdateEvictionAutomationSetting(formValues);

      // Check if the deletion was successful
      if (response.status === HttpStatusCode.Ok) {
        // Show success message
        toast.success("Record updated successfully", {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    } catch (error) {
      // Handle errors if needed
      console.error("Error updating record:", error);
    }
  };
  // const setEvictionTabName = () => {
  //   return <span>Sign Evictions {unsignedEvictionApprovalCount}</span>;
  // };

  // const selectedIndex = (tabName: string) => {
  //   switch (tabName) {
  //     case "Confirm Delinquencies":
  //       return 0;
  //     case "Sign Evictions":
  //       return 1;
  //     case "Confirm Dismissals":
  //       return 2;
  //     case "Sign Dismissals":
  //       return 3;
  //     case "Status":
  //       return 4;
  //     case "Settings":
  //       return 5;
  //     case "CRMProperties":
  //       return 6;
  //     // case "Confirm Notices":
  //     //   return 0;
  //     // case "Confirmed Notices":
  //     //   return 1;
  //   }
  // };
  const selectedIndex = (tabName: string) => {
    switch (tabName) {
      case "EA - Notices":
        return 0;
      case "EA - Evictions":
        return 1;
            case "EA - Dismissals":
        return 2;
      case "Status":
        return 3;
      case "Hott Settings":
        return 4;
      case "CRM Settings":
        return 5;
      case "Yardi":
         return 6;
      case "RealPage":
        return 7;
      case "Propexo (Deprecated)":
        return 8;
      case "Transaction Codes (Deprecated)":
        return 9;
      case "Transaction Codes":
        return 10;
      // case "Settings":
      //   return 7;
     
      // case "Confirm Notices":
      //   return 0;
      // case "Confirmed Notices":
      //   return 1;
    }
  };

  return (

    <EvictionAutomationQueueProvider>
      {showReviewSign === false && showCreateNotice === false ? (
        <>
          <div className="relative flex flex-wrap items-center mb-1.5">
          {tabName!="Propexo (Deprecated)" && <EvictionAutomationSearchBar activeTab={tabName} />}
            <EvictionAutomationButtons
              activeTab={tabName}
              buttons={EvictionAutomationButtonList}
              handleClick={() => { }}
              handleReviewSign={() => {
                setShowReviewSign(true);
              }}
              handleCreateNotice={() => {
                setShowCreateNotice(true);
              }}
            />
          </div>
          <div className="automation_grid">
            <TabComponent
              selectedTabIndex={selectedIndex(tabName)}
              onTabSelect={(index: number) => {
                // Set the tab name based on the selected index
                // if (index === 0) setTabName("Confirm Delinquencies");
                // else if (index === 1) setTabName("Sign Evictions");
                // else if (index === 2) setTabName("Confirm Dismissals");
                // else if (index === 3) setTabName("Sign Dismissals");
                if (index === 0) setTabName("EA - Notices");
                else if (index === 1) setTabName("EA - Evictions");
                else if (index === 2) setTabName("EA - Dismissals");
                else if (index === 3) setTabName("Status");
                else if (index === 4) setTabName("Hott Settings");
                else if (index === 8) setTabName("Propexo (Deprecated)");
                else if (index === 9) setTabName("Transaction Codes (Deprecated)");
                // else if (index === 7) setTabName("Settings");
                else if (index === 5) setTabName("CRM Settings");
                else if (index === 6) setTabName("Yardi");
                else if (index === 7) setTabName("RealPage");
                else if (index === 10) setTabName("Transaction Codes")
                // else if (index === 0) setTabName("Confirm Notices");
                // else if (index === 1) setTabName("Confirmed Notices");
              }}
              // tabs={[
              //   // {
              //   //   id: 0,
              //   //   name: "Confirm Notices",
              //   //   content: <EvictionAutomationConfirmGrid />,
              //   //   isVisible: (userRole.includes(UserRole.C2CAdmin) || ["NV"].includes(selectedStateValue)) ? true : false,
              //   // },
              //   // {
              //   //   id: 1,
              //   //   name: "Confirmed Notices",
              //   //   content: <EvictionAutomationConfirmedGrid />,
              //   //   isVisible: (userRole.includes(UserRole.C2CAdmin) || ["NV"].includes(selectedStateValue)) ? true : false,
              //   // },
              //   {
              //     id: 0,
              //     name: "Confirm Delinquencies",
              //     content: <EvictionAutomationApprovalGrid />,
              //     isVisible: (["GA"].includes(selectedStateValue)) ? true : false
              //   },
              //   {
              //     id: 1,
              //     //  name: `Sign Evictions (${signedApprovalCount})`,
              //     name: unsignedEvictionApprovalCount !== 0 ? `Sign Evictions (${unsignedEvictionApprovalCount})` : "Sign Evictions",
              //     content: <EvictionAutomationApprovedGrid />,
              //     isVisible: (["GA"].includes(selectedStateValue)) ? true : false
              //   },
              //   {
              //     id: 2,
              //     name: "Confirm Dismissals",
              //     content: <EvictionAutomationDismissalsApprovalGrid />,
              //     isVisible: (["GA"].includes(selectedStateValue)) ? true : false
              //   },
              //   {
              //     id: 3,
              //     // name: "Sign Dismissals",
              //     name: unsignedEvictionDismissalCount !== 0 ? `Sign Dismissals (${unsignedEvictionDismissalCount})` : "Sign Dismissals",
              //     content: <EvictionAutomationDismissalsApprovedGrid />,
              //     isVisible: (["GA"].includes(selectedStateValue)) ? true : false
              //   },
              //   {
              //     id: 4,
              //     name: "Status",
              //     content: <EvictionAutomationStatusGrid />,
              //     isVisible: userRole.includes(UserRole.C2CAdmin) ? true : false,
              //   },
              //   {
              //     id: 5,
              //     name: "Settings",
              //     content: <>
              //       {/* {userRole.includes(UserRole.C2CAdmin) ? <EvictionAutomationSettingsGrid /> : <><EvicitonAutomationAddSetting
              //     showPopup={false}
              //     closePopup={(shouldRefresh: string) => {

              //     }}
              //     isEditMode={true}
              //     onSubmit={(formValues: IEvictionAutomationQueueItem) => {
              //       handleUpdateEASetting(formValues);
              //     }}
              //   /></>} */}
              //       <EvictionAutomationSettingsGrid />
              //     </>,
              //     // isVisible: userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.Admin) ? true : false,
              //     isVisible: userRole.includes(UserRole.C2CAdmin) ? true : false,

              //   },
              //   {
              //     id: 6,
              //     name: "CRMProperties",
              //     content: <EvictionAutomationPropexoGrid />,
              //     isVisible: userRole.includes(UserRole.C2CAdmin) ? true : false,
              //   }
              // ]}
              tabs={[
                {
                  id: 0,
                  name: "EA - Notices",
                  content: <EANoticesGrid />,
                  isVisible: (userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin))&& (["NV"].includes(selectedStateValue)) ? true : false,
                },
                {
                      id: 1,
                      name: "EA - Evictions",
                      content: <EAEvictionsGrid />,
                      isVisible: (userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin)) && (["GA","TX"].includes(selectedStateValue)) ? true : false
                    },
                    {
                          id: 2,
                          name: "EA - Dismissals",
                          content: <EADismissalsGrid />,
                          isVisible: (userRole.includes(UserRole.C2CAdmin)|| userRole.includes(UserRole.ChiefAdmin)) && (["GA"].includes(selectedStateValue)) ? true : false
                        },
                {
                  id: 3,
                  name: "Status",
                  content: <EvictionAutomationStatusGrid />,
                  isVisible: (userRole.includes(UserRole.C2CAdmin)|| userRole.includes(UserRole.ChiefAdmin)) ? true : false,
                },
                {
                  id: 4,
                  name: "Hott Settings",
                  content: <>
                    {/* {userRole.includes(UserRole.C2CAdmin) ? <EvictionAutomationSettingsGrid /> : <><EvicitonAutomationAddSetting
                  showPopup={false}
                  closePopup={(shouldRefresh: string) => {

                  }}
                  isEditMode={true}
                  onSubmit={(formValues: IEvictionAutomationQueueItem) => {
                    handleUpdateEASetting(formValues);
                  }}
                /></>} */}
                    <EvictionAutomationSettingsGrid />
                  </>,
                  // isVisible: userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.Admin) ? true : false,
                  isVisible: (userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)) ? true : false,

                },
                {
                  id: 5,
                  name: "CRM Settings",
                  content: <EvictionAutomationCRMSettingsGrid />,
                  isVisible: (userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)) ? true : false,
                },
                {
                  id: 6,
                  name: "Yardi",
                  content: <EvictionAutomationYardiGrid />,
                  isVisible: (userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)) ? true : false,
                },
                {
                  id: 7,
                  name: "RealPage",
                  content: <EvictionAutomationRealPageGrid />,
                  isVisible: (userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)) ? true : false,
                },
                {
                  id: 10,
                  name: "Transaction Codes",
                  content: <EvictionAutomationTransactionCodesGrid />,
                  isVisible: (userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)) ? true : false,
                },
                {
                  id: 8,
                  name: "Propexo (Deprecated)",
                  content: <EvictionAutomationPropexoGrid />,
                  isVisible: (userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)) ? true : false,
                },
                {
                  id: 9,
                  name: "Transaction Codes (Deprecated)",
                  content: <TransactionCodesGrid />,
                  isVisible: (userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)) ? true : false,
                },
                
                // {
                //   id: 7,
                //   name: "Settings",
                //   content: <>
                //     {/* {userRole.includes(UserRole.C2CAdmin) ? <EvictionAutomationSettingsGrid /> : <><EvicitonAutomationAddSetting
                //   showPopup={false}
                //   closePopup={(shouldRefresh: string) => {

                //   }}
                //   isEditMode={true}
                //   onSubmit={(formValues: IEvictionAutomationQueueItem) => {
                //     handleUpdateEASetting(formValues);
                //   }}
                // /></>} */}
                //     <EASettingsGrid />
                //   </>,
                //   // isVisible: userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.Admin) ? true : false,
                //   isVisible: (userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)) ? true : false,

                // },
              ]}
            />
          </div>
        </>) : showReviewSign ? (<><ReviewSign
          handleBack={() => {
            setShowReviewSign(false);
          }}
          activeTab={tabName}
        /></>) :
        (<><CreateNotice
          handleBack={() => {
            setShowCreateNotice(false);
          }}
          activeTab={tabName}
        /></>)}

    </EvictionAutomationQueueProvider>
  );
};

export default EvictionAutomation;



