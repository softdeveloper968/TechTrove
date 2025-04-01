import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { routeLinks } from "utils/constants";
import { HttpStatusCode, UserRole } from "utils/enum";
import AuthService from "services/auth.service";
import { useAuth } from "context/AuthContext";

type Props = {
  toggleMenu: string;
};

export default function SideBar(props: Props) {
  // Used to get the current screen name from the location
  const location = useLocation();
  const { 
    userRole, 
    unsignedAmendmentCount,
    setUnsignedAmendmentCount, 
    unsignedDismissalCount, 
    setUnsignedDismissalCount,
    unsignedWritCount,
    setUnsignedWritCount,
    unsignedEvictionApprovalCount,
    setUnsignedEvictionApprovalCount,
    unsignedEvictionDismissalCount,
    setUnsignedEvictionDismissalCount,
    permittedStates,
    selectedStateValue
  } = useAuth();
  // Used to determine and set the active link with an 'activeLink' state
  const [activeLink, setActiveLink] = useState<string>("");
  const queryParams = new URLSearchParams(location.search);
  const dismissal=queryParams.get("isManager");
  const eviction=queryParams.get("eviction");
  useEffect(() => {

    // Set active link on component mount and on route change
    const { pathname } = location;
    const splitLocation = pathname.split("/");
    setActiveLink(splitLocation[1]);
    
  }, [location]);

  const handleUnsignedCaseCount = async () => {
    try {
      const response = await AuthService.getUnsignedCaseCount();
      if(response.status === HttpStatusCode.OK){
        setUnsignedAmendmentCount(response.data.unsignedAmendment);
        setUnsignedDismissalCount(response.data.unsignedDismissal);
        setUnsignedWritCount(response.data.unsignedWrit);
        setUnsignedEvictionApprovalCount(response.data.unsignedEvictionApprovalCount);
        setUnsignedEvictionDismissalCount(response.data.unsignedEvictionDismissalCount);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // const filteredRouteLinks = routeLinks.filter(item => userRole.some(role => item.access.includes(role)) && (item.states.includes(selectedStateValue)||userRole.some(role=> role ===UserRole.C2CAdmin)) && (item.states.includes("NV") && !userRole.includes(UserRole.Signer) && item.title=="Eviction Automation"));
  const filteredRouteLinks = routeLinks.filter(item => {    
    // Check if the user has access to the item based on their role
    const isAccessible = userRole.some(role => item.access.includes(role)) && item.states.includes(selectedStateValue);
    // for NV state
    if(selectedStateValue === "NV")
    {
      // if(item.title === "Eviction Automation"){
      //   if(userRole.includes(UserRole.Admin) || userRole.includes(UserRole.C2CAdmin)) 
      //     return true;
      //   return false;
      // }
      if(item.title === "Eviction Automation"){
        if(userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin)) 
          return true;
        return false;
      }
      else if(eviction){
        if(item.to==="nv-file-eviction")
          return true;
        else
          return false;
      }
      else if(item.title !== "Notices" && item.title !== "Home" && item.to!=="nv-file-eviction" && item.to!=="nv-dismissals"){
        return false;
      }
      // return isAccessible;
    }

    else if (selectedStateValue === "TX") {
      if(eviction){
        if(item.to==="tx-file-eviction")
          return true;
        else
          return false;
      }
    }
    
    // for GA state
    else
    {
      if(item.title === "Notices" || item.to==="nv-file-eviction" ||  item.to==="nv-dismissals"){
        return false;
      }
      if(dismissal && item.title!="Dismissals"){
        return false;
      }
      if(eviction && item.title!="File Eviction"){
        return false;
      }
      // const isStateAllowed = item.states.includes(selectedStateValue) || userRole.includes(UserRole.C2CAdmin);    
      // return isAccessible && isStateAllowed;
    }
    
    return isAccessible;
});



  return (
    <div
      className={` ${props.toggleMenu} app-sidebar sidebar-shadow text-white left-0 overflow-y-auto fixed top-[50px] w-[14rem] min-w-[14rem] h-[calc(100%_-_50px)] z-10`}
    >
      <div className="scrollbar-sidebar">
        <div className="app-sidebar__inner">
          <ul className="vertical-nav-menu py-2.5 px-1.5">
          {filteredRouteLinks.map((item, index) => (
              <li
                className={`${activeLink === item.to ? "bg-[#2472db] shadow-lg text-white" : "text-gray-600"} rounded-md text-[11px] font-medium`}
                key={index}
                onClick={handleUnsignedCaseCount}
              >
                {item.to !== "" ? (
                  <Link
                    to={`/${item.to}`}
                    title={`${item.title}`}
                    className={`${activeLink === item.to ? "rounded-md" : ""} text-[11px] font-medium py-2 px-1 block text-center relative bg-[inherit] text-[inherit]`}
                  >
                    {item.title}
                    {item.to === 'amendments' && unsignedAmendmentCount !== 0 && (
                      <span className={activeLink === item.to ? "text-white ml-0.5 font-semibold" : "text-[#E61818] ml-0.5 font-semibold"}>({unsignedAmendmentCount} Unsigned)</span>
                    )}
                    {item.to === 'dismissals' && unsignedDismissalCount !== 0 && (
                      <span className={activeLink === item.to ? "text-white ml-0.5 font-semibold" : "text-[#E61818] ml-0.5 font-semibold"}>({unsignedDismissalCount} Unsigned)</span>
                    )}
                    {item.to === 'writs-of-possession' && unsignedWritCount !== 0 && !userRole.includes(UserRole.WritLabor) && (
                      <span className={activeLink === item.to ? "text-white ml-0.5 font-semibold" : "text-[#E61818] ml-0.5 font-semibold"}>({unsignedWritCount} Unsigned)</span>
                    )}
                    {item.to === 'eviction-automation' && selectedStateValue!=="NV" && selectedStateValue!=="TX" && (unsignedEvictionApprovalCount !== 0 || unsignedEvictionDismissalCount !== 0) && (
                      <span className={activeLink === item.to ? "text-white ml-0.5 font-semibold" : "text-[#E61818] ml-0.5 font-semibold"}>({unsignedEvictionApprovalCount+unsignedEvictionDismissalCount} Unsigned)</span>
                    )}
                  </Link>
                ) : (
                  <Link
                    to={``}
                    title={`${item.title}`}
                    className="text-[11px] font-medium py-2 p-3.5 block text-center"
                  >
                    {item.title}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
