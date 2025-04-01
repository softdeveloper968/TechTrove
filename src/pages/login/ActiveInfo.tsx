import React from "react";
import { ChangeEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { homeScreenLinks } from "utils/constants";
import { getUserInfoFromToken } from "utils/helper";
import { IHomeScreenLinks } from "interfaces/route.interface";
import Search from "components/common/search/Search";

type Props = {};

const ActiveInfo = (props: Props) => {
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
    const userInfo = getUserInfoFromToken();
    setLoggedInUserName(`${userInfo?.FirstName} ${userInfo?.LastName}`);
  }, []);

  return (
    <div className="mt-4 text-center bg-white py-8 p-4 rounded-md	 shadow-lg shadow-slate-300">
      <h2 className="text-xl md:text-2xl mb-2 text-gray-800 ">
        Hi <b className=" text-[#2472db]">{loggedInUsername}</b>, Welcome to
        your Connect2Court dashboard.
      </h2>
      <h4 className="fw-normal text-[17px] md:text-[20px] text-gray-700">
        To check the status of a case, enter the case information below.
      </h4>
      <h6 className=" fw-normal text-[14px] md:text-[16px] mb-5 text-gray-600 mt-2">
        You can search property name, address, case number, tenant names, etc.
      </h6>

      <div className="border bg-slate-100	 py-8 border-dashed border-gray-400 rounded-lg	 shadow-lg shadow-slate-100 p-4 mt-10 w-full max-w-[810px] m-auto">
        <div className="relative flex justify-end min-w-[60%] mb-4  ">
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
        <h4 className="fw-normal text-[18px] text-gray-800 mb-4">
          Or, choose from the following options to get started:
        </h4>
        <div className=" flex flex-wrap gap-4 justify-center pb-6">
          {/* Render links for home screen options*/}
          {homeScreenLinks.map((item: IHomeScreenLinks, index: number) => (
            <Link
              to={item.to}
              key={index}
              className="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-1.5 px-3 text-slate-900 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
            >
              {item.image && (
                <img
                  src={item.image}
                  alt="track"
                  className="h-5 w-5 md:h-6 md:w-6 me-2 md:me-3 invert"
                />
              )}
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActiveInfo;
