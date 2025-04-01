import React from "react";
import { ChangeEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { homeScreenLinks } from "utils/constants";
import { UserRole } from "utils/enum";
import { IHomeScreenLinks } from "interfaces/route.interface";
import Search from "components/common/search/Search";
import { useAuth } from "context/AuthContext";
type Props = {};

const Home = (props: Props) => {
  const { userRole,selectedStateValue } = useAuth();
  // State for the search input box
  const [searchQuery, setSearchQuery] = useState<string>("");
  // State to display a welcome message with the logged-in user's name
  const [loggedInUsername, setLoggedInUserName] = useState<string>("");
  // Custom hook for search (if needed)
  // const debouncedSearchQuery = useDebounce(searchQuery, 700); // Adjust the delay as needed (in milliseconds)
  // Navigation hook for redirecting to another screen
  const navigate = useNavigate();

  // Update search query state
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handle search
  const handleSearch = (query: string) => {
    navigate(`/check-case-status/${query}`);
  };

  // Handle key press (Enter) for search
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      // Perform the search logic here
      handleSearch(searchQuery);
    }
  };

  // Fetch and set the logged-in user's information on component mount
  useEffect(() => {
    // const userInfo = getUserInfoFromToken();
    const userInfo= JSON.parse(localStorage.getItem("userDetail")??"")
    setLoggedInUserName(`${userInfo?.FirstName}`);
  }, []);

  const filteredLinks = homeScreenLinks.filter((item: IHomeScreenLinks) => item.states.includes(selectedStateValue));

  const renderSearchboxSection = () => {
    
    if(userRole.includes(UserRole.WritLabor) || userRole.includes(UserRole.ProcessServer)||userRole.includes(UserRole.PropertyManager)) {
      return null;
    }
    
    return(
      <div>
          <h4 className="fw-normal text-[14px] md:text-[16px] text-gray-700">
            To check the status of a case, enter the case information below.
          </h4>
          <h6 className="fw-normal text-[14px] md:text-[13px] mb-4 text-gray-600 mt-1.5">
            You can search property name, address, case number, tenant names, etc.
          </h6>
          <div className="border bg-slate-100 py-3.5 md:py-5 md:py-7 border-dashed border-gray-400 rounded-lg shadow-lg shadow-slate-100 p-3.5 mt-5 md:mt8 w-full max-w-[648px] m-auto">
            <div className="relative flex justify-end min-w-48%] mb-3.5">
              <Search
                searchQuery={searchQuery}
                handleChange={handleChange}
                handleKeyPress={handleKeyPress}
                handleIconClick={() => {
                  if (searchQuery.length !== 0)
                    navigate(`/check-case-status/${searchQuery}`);
                  else navigate("/check-case-status");
                }}
              ></Search>
            </div>
            <h4 className="fw-normal text-[12px] md:text-[15px] text-gray-800 mb-3.5">
              Or, choose from the following options to get started:
            </h4>
            <div className="flex flex-wrap gap-1.5 md:gap-3 justify-center pb-1.5 md:pb-5">
              {filteredLinks.map((item: IHomeScreenLinks, index: number) => (
               ( (userRole.includes(UserRole.Admin)|| userRole.includes(UserRole.Signer)||userRole.includes(UserRole.NonSigner)||userRole.includes(UserRole.Viewer)) && (item.to==="/notices" || item.to==="/service-tracker")) ?null:
                <Link
                  to={item.to}
                  key={index}
                  className="text-[11px] md:text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-1.5 px-3 text-slate-900 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb]"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt="track"
                      className="h-4 w-4 md:h-5 md:w-5 me-1.5 md:me-2.5 invert"
                    />
                  )}
                  {item.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
    )
  };

  return (
    <div className="md:mt-3.5 mb-2.5 text-center bg-white py-5 md:py-7 p-3.5 rounded-md shadow-lg shadow-slate-300">
      <h2 className="text-base md:text-xl mb-1.5 text-gray-800 ">
        Hi <b className="text-[#2472db]">{loggedInUsername}</b>, Welcome to your Connect2Court dashboard.
      </h2>
      {(["GA","TX"].includes(selectedStateValue) || userRole.some(role => role === UserRole.C2CAdmin || role===UserRole.ChiefAdmin)) && renderSearchboxSection()}
    </div>
  );
  
};

export default Home;
