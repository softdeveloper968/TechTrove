import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import DropdownPresentation from "components/common/dropdown/DropDown";
import { CheckCasesProvider } from "./CheckCasesContext";
import { useAuth } from "context/AuthContext";
import { CountyListExternalLink,CountyListExternalLinkTX } from "utils/constants";
import CheckCaseStatusGrid from "./CheckCaseStatusGrid";
import { useDebounce } from "hooks/useDebounce";
import { ISelectOptions } from "interfaces/late-notices.interface";
import CheckCaseStatusSearch from "./CheckCaseStatusSearch";

type Props = {};

const CheckCaseStatus = (props: Props) => {
  //to get the value of query param
  const { query } = useParams();
  // // multi select search
  const [searchQuery, setSearchQuery] = useState<string>(query || "");

  const debouncedSearch = useDebounce(searchQuery, 500, 3);

  // will help in filtering cases on the basis of county
  const [selectedCounty, setSelectedCounty] = useState<ISelectOptions>();
  const [countyExternalLinks, setCountyExternalLinks] = useState<ISelectOptions[]>([]);

  // will help in setting data in grid.
  // const [gridData, setGridData] = useState<IPropertyInfoAddress[]>();

  // will use this to show spinner while fetching data from api
  const [showSpinner, setShowSpinner] = useState<Boolean>(true);
  const {selectedStateValue} = useAuth();
  useEffect(()=>{
      switch(selectedStateValue.toLowerCase()){
        case "ga":
          setCountyExternalLinks(CountyListExternalLink);
          break;
        case "tx":
          setCountyExternalLinks(CountyListExternalLinkTX);
          break;
        default:
          setCountyExternalLinks([]);
      }
  },[selectedStateValue])
  // handle change for search field
  // const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
  //   setSearchQuery(event.target.value);
  // };

  // set the state of selected dropdown
  const handleDropdownChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (event.target.value !== "") {
      setShowSpinner(true);
      let countyList = countyExternalLinks.find(
        (item) => item.id === event.target.value
      );
      setSelectedCounty(countyList);
      window.open(countyList?.id.toString(), "_blank");
    } else {
      setSelectedCounty({ id: "", value: "" });
    }
  };

  // const fetchData = useCallback(async () => {
  //   try {
  //     setShowSpinner(true);
  //     let searchCaseRequest: ISearchCasesRequest = {
  //       searchParam: debouncedSearch.replace(/\n/g, ""),
  //     };
  //     await getCases(searchCaseRequest);
  //   } catch (error) {
  //     // Handle errors here
  //     console.error("Error fetching data:", error);
  //   }
  // }, [debouncedSearch]);

  // useEffect(() => {
  //   // Check if there is data in the query and there are changes in debouncedSearch
  //   fetchData();
  // }, [debouncedSearch, fetchData]);

  /**
   * fetching data from the api
   * @param searchCaseRequest is a object which contains userId,client ID, search param,county
   * @returns set list of cases based on above search result in setGridData hook
   */
  // const getCases = async (searchCaseRequest: ISearchCasesRequest) => {
  //   try {
  //     let response = await CaseStatusService.searchCases(searchCaseRequest);
  //     if (response.status === HttpStatusCode.Ok) {
  //       setGridData(response.data);
  //     }
  //   } finally {
  //     setShowSpinner(false);
  //   }
  // };



  return (
    <>
    <CheckCasesProvider>
      <div className="search-box text-center w-full relative flex justify-start mb-1.5 sm:mb-2 items-center case_status">
        {/* <MultiLineSearch
          value={searchQuery}
          handleInputChange={handleChange}
          handleSearchIconClick={() => {
            setSearchQuery('');
            fetchData();
          }}
        /> */}
        <CheckCaseStatusSearch/>
        <DropdownPresentation
          heading={"Check the court's system:"}
          selectedOption={selectedCounty}
          handleSelect={handleDropdownChange}
          options={countyExternalLinks}
          placeholder="Select an option"
          disabled={false}
        />
      </div>
      <div className="bg-white p-3 md:p-3.5 pb-4 rounded-md shadow-lg shadow-slate-300 mb-1.5 case_grid">
        {/* {searchQuery.length === 0 ? (
          <h1 className="text-center text-gray-700 p-2 md:p-4 pt-3 md:pt-6 mb-0 text-md md:text-lg w-full max-w-[610px] m-auto">
            Please <b>search</b> cases on the basis of case name in the search
            box to get cases
          </h1>
        ) : showSpinner === true ? (
          <Spinner></Spinner>
        ) : (
          <CaseStatusGrid rows={gridData}></CaseStatusGrid>
          
        )} */}
        <CheckCaseStatusGrid/>
      </div>
      </CheckCasesProvider>
    </>
  );
};

export default CheckCaseStatus;
