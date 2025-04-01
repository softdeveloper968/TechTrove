import React from "react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaCog, FaQuestionCircle, FaSignOutAlt, FaUser, FaUsers } from "react-icons/fa";
import useOnClickOutside from "hooks/useOnClickOutside";
import hamburger from "assets/images/hamburger.png";
import User from "assets/images/user.png";
import Connect2CourtLogo from "assets/svg/Connect2CourtLogo.svg";
import DollarIcon from "assets/images/dollar_icon.svg";
import { routeLinks } from "utils/constants";
import Button from "components/common/button/Button";
import DropdownPresentation from "components/common/dropdown/DropDown";
import IconButton from "components/common/button/IconButton";
import Modal from "components/common/popup/PopUp";
import { UserRole } from "utils/enum";
import { useAuth } from "context/AuthContext";
import { ISelectOptions } from "interfaces/all-cases.interface";
import Tooltip from "../../../components/common/tooltip/Tooltip";
import SystemInfoGrid from "pages/system-info/components/SystemInfoGrid";
type Props = {
  handleHamburgerClick: () => void;
};

export default function Header(props: Props) {

  const {
    permittedStates,
    setSelectedStateValue,
    selectedStateValue
  } = useAuth();
  // toggle option for user
  const [toggleLogout, setToggleLogout] = useState<Boolean>(false);
  const [showUserGuide, setShowUserGuide] = useState<Boolean>(false);
  const [showPanel, setShowPanel] = useState<boolean>(false);

  const initialSelectOption: ISelectOptions = { id: '', value: '' };

  const popupRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  // set heading in header
  const [heading, setHeading] = useState<string>("");
  //const [selectedStateValue, setSelectedStateValue] = useState<string | undefined>("");
  const [openStateDropdown, setOpenStateDropdown] = useState<boolean>(false);
  const { userRole, company, setCompany, logout } = useAuth();
  const [selectedState, setSelectedState] = useState<ISelectOptions>({ id: selectedStateValue ?? "", value: selectedStateValue ?? "" });
  const [stateList, setStateList] = useState<ISelectOptions[]>([]);
  useEffect(() => {
    setSelectedState({ id: selectedStateValue, value: selectedStateValue })
  }, [selectedStateValue])
  useEffect(() => {

    var list = permittedStates.map((item) => ({
      id: item,
      value: item
    }));
    setStateList(list);
  }, [permittedStates])
  useEffect(() => {
    // Check if the company name is not already set
    if (!company.length) {
      // Retrieve data from local storage
      const userDetail = localStorage.getItem("userDetail");

      if (userDetail) {
        // Parse the data as JSON
        const parsedUserDetail = JSON.parse(userDetail);

        // Check if companyName exists in parsed data
        const companyName = parsedUserDetail.UserCompany || "";

        // Update state with the company name
        setCompany(companyName);
        // var list = states.map((item) => ({
        //   id: item.stateId,
        //   value: item.stateId
        // })); 
        // setStateList(list);
        // setStateList(states.map(state => ({ id: state.stateId, value: state.stateName })));
      }
    }
  }, [company]);

  useEffect(() => {

    let pathName = location.pathname;
    // Split the path using '/' as the delimiter
    const pathParts = pathName.split("/");
    // Extract the relevant part (e.g., the second part in the array)
    const headingPart = pathParts[1];

    const route = routeLinks.find(x => x.to === headingPart);

    // Safely access the title, or provide a fallback value like an empty string
    const title = route ? route.title : ""; // or use any fallback you prefer
    if (title == "Notices") {
      setHeading("Late Notices")
    }
    else {
      setHeading(title);
    }
    // Replace hyphens with spaces
    // const headingWithoutHyphens = headingPart.replace(/-/g, " ");
    // // Capitalize the first letter of the modified part
    // const capitalizedHeading =
    //   headingWithoutHyphens.charAt(0).toUpperCase() +
    //   headingWithoutHyphens.slice(1);
    // if (capitalizedHeading === "Notices") setHeading("Late Notices");

    // // if (capitalizedHeading === "Aos queue") setHeading("AOS in Queue");
    // // if (capitalizedHeading === "Eviction queue") setHeading("Evictions in Queue");
    // // Set the heading
    // else setHeading(capitalizedHeading);
  }, [location]);

  /**
   * set toggle so that we can hide/display side bar
   */
  const handleButtonClick = () => {
    setToggleLogout(!toggleLogout);
  };
  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>) => {

    setSelectedState({ id: event.target.value, value: event.target.value })
    // setSelectedReprocessingOption({ id: 0, value:"Reprocess" });
    setSelectedStateValue(event.target.value)
    setSelectedState({ id: event.target.value ?? "", value: event.target.value ?? "" })
    setOpenStateDropdown(false);
    localStorage.setItem("seletedState", event.target.value ?? "");
    var recentlySelected = localStorage.getItem("seletedState");
    navigate("/home");
    // setSelectedCompany({ id: event.target.value, value: companyList.find(x => x.id === event.target.value)?.value || '' }); 
    // if(event.target.value)      {
    //     var account=selectedAccount.id==""?null:selectedAccount.id==1;
    //     updateTransactions(dateRange[0], dateRange[1],event.target.value.toString(),account)
    // } 
  };
  useOnClickOutside(
    popupRef,
    () => {
      if (toggleLogout === true) setToggleLogout(false);
    },
    null
  );

const openPdf = async () => {
  setShowUserGuide(!showUserGuide);
};



  return (
    <>
    <div className="flex items-center px-[14px] md:px-5 py-[8px] justify-between border-white fixed w-full top-0 bg-[#1659b3] z-20 shadow-lg">
      <div className="flex items-center">
        <div className="app-header__logo flex items-center xl:w-[14.4rem] xl:min-w-[14.4rem]">
          <div className="header__pane pr-2.5 md:pr-7 flex items-center">
            <Button
              type="button"
              classes="hamburger close-sidebar-btn hamburger--elastic"
              data-className="closed-sidebar"
              isRounded={false}
              title={""}
              handleClick={() => props.handleHamburgerClick()}
            >
              <img src={hamburger} alt="Icon" className="h-3.5 w-5 md:h-[16px] md:w-[22.4px]" />
            </Button>
          </div>
          <div className="logo-src cursor-pointer">
            <img
              src={Connect2CourtLogo}
              alt="logo"
              className="h-6 md:h-[29px] w-auto"
              onClick={() => navigate("/home")}
            />
          </div>
        </div>
        <div className="flex items-center justify-between ps-2.5 sm:ps-3 xl:pl-0">
          {heading === "Eviction queue" ? (
            <h2 className="text-[12px] leading-[15.2px] md:leading-4 md:text-[16px] xl:text-[17.6px] m-0 text-white">Evictions in Queue</h2>
          ) : heading === "Aos queue" ? (
            <h2 className="text-[12px] leading-[15.2px] md:leading-4 md:text-[16px] xl:text-[17.6px] m-0 text-white">AOS in Queue</h2>
          ) : heading === "Queue management" ? <h2 className="text-[12px] leading-[15.2px] md:leading-4 md:text-[16px] xl:text-[17.6px] m-0 text-white">Cases Queue Management</h2>
            : (
              <h2 className="text-[12px] leading-[15.2px] md:leading-4 md:text-[16px] xl:text-[17.6px] m-0 text-white capitalize">{heading} </h2>
            )}
        </div>
      </div>

      <div className="flex justify-end md:w-4/12 lg:w-5/12 text-white text-xl font-bold">
        <div className="app-header-right">
          <div className="btn-group fw-sbold flex items-center">
            <h5 className="hidden lg:block pr-4 text-xs font-semibold text-white-500">
              {/* {company===""?"Main Street Management LLC":company.toUpperCase()} */}
              {company ? company.toUpperCase() : ""}
            </h5>
            {!userRole.includes(UserRole.PropertyManager) && (<div className="text-sm gap-1 flex items-center mr-3">
               <Button
              type="button"
              classes="inline-flex justify-center bg-transparent p-0 ml-1 md:ml-0"
              handleClick={openPdf}
              isRounded={false}
              title={""}
            > <FaQuestionCircle className="h-4 w-4 mr-0.5 mt-0.5" /> {"Help"}</Button>
            </div>)}
            <Button
              type="button"
              classes="inline-flex justify-center bg-transparent p-0 ml-1 md:ml-0"
              handleClick={handleButtonClick}
              isRounded={false}
              title={""}
            >
              {/* <Link
                to={""}
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                className="p-0 btn"
              > */}
              <img src={User} className="h-8 min-w-8 w-8 rounded-full" alt="user" />
              {/* </Link> */}
            </Button>
            <div
              className={`${toggleLogout ? "block" : "hidden"
                } " absolute top-full right-0 z-10 mb-1 w-36 origin-top-right rounded bg-white shadow-lg ring-0.5 ring-black ring-opacity-5 focus:outline-none mr-0.5 "`}
            >
              <div className="py-0 rounded dropdownMenu" ref={popupRef}>
                <>
                  {
                    !userRole.includes(UserRole.PropertyManager) && (
                      <Button
                        title={"Profile"}
                        type={"button"}
                        handleClick={() => {
                          setToggleLogout(false);
                          setTimeout(() => {
                            navigate("/profile");
                          }, 500);
                        }}
                        isRounded={true}
                        classes="text-gray-700 block w-full px-3 py-[8px] text-left text-xs inline-flex items-center font-medium border-b hover:bg-[#f1f3f7] !rounded-[0px]"
                        icon={<FaUser className="mr-1.5"></FaUser>}
                      ></Button>
                    )
                  }

                </>
                {(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)  || userRole.includes(UserRole.Admin)) && (
                  <>
                    <Button
                      title={"Settings"}
                      type={"button"}
                      handleClick={() => {
                        setToggleLogout(false);
                        setTimeout(() => {
                          navigate("/settings/county");
                        }, 500);
                      }}
                      isRounded={true}
                      classes="text-gray-700 block w-full px-3 py-[8px] text-left text-xs inline-flex items-center font-medium border-b hover:bg-[#f1f3f7] !rounded-[0px]"
                      icon={<FaCog className="mr-1.5"></FaCog>}
                    ></Button>
                  </>
                )}
                {(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)  || userRole.includes(UserRole.Admin)) && (
                  <>
                    <Button
                      title={"Accounting"}
                      type={"button"}
                      handleClick={() => {
                        setToggleLogout(false);
                        setTimeout(() => {
                          if (userRole.includes(UserRole.C2CAdmin)|| userRole.includes(UserRole.ChiefAdmin))
                            navigate("/accounting/dashboard");
                          else
                            navigate("/accounting/wallet");
                        }, 500);
                      }}
                      isRounded={true}
                      classes="text-gray-700 block w-full px-3 py-[8px] text-left text-xs inline-flex items-center font-medium border-b hover:bg-[#f1f3f7] !rounded-[0px]"
                      icon={<img src={DollarIcon} alt="search" className="h-[14px] w-[14px] me-1.5" />}
                    ></Button>
                  </>
                )}

                {((userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) || userRole.includes(UserRole.Admin)) || ((userRole.includes(UserRole.Signer) || userRole.includes(UserRole.NonSigner) || userRole.includes(UserRole.Viewer))&& selectedStateValue.toUpperCase()!=="TX"))&& (
                  <>
                    <Button
                      title={"Users"}
                      type={"button"}
                      handleClick={() => {
                        setToggleLogout(false);
                        setTimeout(() => {
                          navigate("/user-management");
                        }, 500);
                      }}
                      isRounded={true}
                      classes="text-gray-700 block w-full px-3 py-[8px] text-left text-xs inline-flex items-center font-medium border-b hover:bg-[#f1f3f7] !rounded-[0px]"
                      icon={<FaUsers className="mr-1.5 text-base"></FaUsers>}
                    ></Button>
                  </>
                )}
                {/* {(userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) || userRole.includes(UserRole.Admin) || userRole.includes(UserRole.Signer) || userRole.includes(UserRole.NonSigner) || userRole.includes(UserRole.Viewer)) && (
                  <>
                    <Button
                      title={"System Info"}
                      type={"button"}
                      handleClick={() => {
                        setToggleLogout(false);
                        setTimeout(() => {
                          // navigate("/system-info");
                          setShowPanel(true);
                        }, 500);
                      }}
                      isRounded={true}
                      classes="text-gray-700 block w-full px-3 py-[8px] text-left text-xs inline-flex items-center font-medium border-b hover:bg-[#f1f3f7] !rounded-[0px]"
                      icon={<FaQuestionCircle className="mr-1.5 text-base"></FaQuestionCircle>}
                    ></Button>
                  </>
                )} */}
                {!userRole.includes(UserRole.PropertyManager) && stateList.length > 0 && (
                  <div className="menu_dropdown">
                    <DropdownPresentation
                      heading=""
                      selectedOption={selectedState}
                      handleSelect={handleStateChange}
                      options={stateList}
                      // placeholder="States"
                      classes="text-gray-700 block w-full px-3 py-[8px] text-left text-xs inline-flex items-center font-medium border-b !rounded-[0px] bg-no-repeat bg-[center_right_10px] appearance-none"
                    />
                  </div>
                )}
                {/* {role === "Admin" && ( */}

                {/* )} */}
                <Button
                  title={"Logout"}
                  type={"button"}
                  // handleClick={() => {
                  //   setToggleLogoutConfirmation(true);
                  // }}
                  handleClick={logout}
                  isRounded={true}
                  classes="text-[#E61818] block w-full px-3 py-[8px] text-left text-xs inline-flex items-center font-medium hover:bg-[#f1f3f7] !rounded-[0px]"
                  icon={<FaSignOutAlt className="mr-1.5"></FaSignOutAlt>}
                ></Button>
              </div>
            </div>
            {/* <div className="text-sm gap-1 flex items-center ml-2">
               <Button
              type="button"
              classes="inline-flex justify-center bg-transparent p-0 ml-1 md:ml-0"
              handleClick={openPdf}
              isRounded={false}
              title={""}
            > <FaQuestionCircle className="h-4 w-4 mr-0.5 mt-0.5" /> {"Help"}</Button>
            </div> */}
          </div>
        </div>
      </div>
    </div>

    {showUserGuide && (
        <Modal showModal={showUserGuide} onClose={() => setShowUserGuide(false)} width="max-w-3xl">
          {/* Modal content without padding to ensure iframe takes full space */}
          <div className="bg-white h-[500px] w-full rounded-md">
            {/* iframe with toolbar disabled */}
            <iframe
              src="https://c2cdevfilestore.blob.core.windows.net/public/UserGuide/User%20Guide%20-%20Attorneys%20(1).pdf#toolbar=0"
              frameBorder="1"
              className="w-full h-full"
              title="User Guide"
            ></iframe>
          </div>
        </Modal>
      )}


{showPanel && (
        <div className="system_info_grid">
        <SystemInfoGrid 
        showSystemInfoPopup={showPanel}
        handleClose={() => { setShowPanel(false); }}
        />
        </div>
      )}
    </>
  );
}
