import React, { ChangeEvent, useEffect, useState } from "react";
import { useServiceTrackerContext } from "../../ServiceTrackerContext";
import SingleLineSearch from "components/common/singleLineSearch/SingleLineSearch";

type ServiceTracker_SearchBarProps = {
  activeTab?: string;
};

const ServiceTracker_SearchBar = (props: ServiceTracker_SearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const {
    setServiceTracker,
    getServiceTracker,
    setUnservedQueue,
    getUnservedQueue,
    getAllUnservedAmendment,
    setAllUnservedAmendment
  } = useServiceTrackerContext();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchIconClick = () => {
    const trimmedSearchQuery = searchQuery.trim();
    
    if (props.activeTab === "Tracker") {
      getServiceTracker(1, 100, trimmedSearchQuery);
      setServiceTracker((prev) => ({
        ...prev,
        searchParam: trimmedSearchQuery,
      }));
    } else if (props.activeTab === "Unserved Evictions") {
      getUnservedQueue(1, 100, trimmedSearchQuery);
      setUnservedQueue((prev) => ({
        ...prev,
        searchParam: trimmedSearchQuery,
      }));
    }
    else if (props.activeTab === "Unserved Amendments") {
      getAllUnservedAmendment(1, 100, trimmedSearchQuery);
      setAllUnservedAmendment((prev) => ({
        ...prev,
        searchParam: trimmedSearchQuery,
      }));
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    if (props.activeTab === "Tracker") {
      getServiceTracker(1, 100, "");
      setServiceTracker((prev) => ({
        ...prev,
        searchParam: "",
      }));
    } else if(props.activeTab === "Unserved Evictions") {
      getUnservedQueue(1, 100, "");
      setUnservedQueue((prev) => ({
        ...prev,
        searchParam: "",
      }));
    } else if(props.activeTab === "Unserved Amendments") {
      getAllUnservedAmendment(1, 100, "");
      setAllUnservedAmendment((prev) => ({
        ...prev,
        searchParam: "",
      }));
    }
  };

  useEffect(() => {
    // Reset search query and parameters when the active tab changes
    setSearchQuery("");
    setServiceTracker((prev) => ({
      ...prev,
      searchParam: "",
    }));
    setUnservedQueue((prev) => ({
      ...prev,
      searchParam: "",
    }));
    setAllUnservedAmendment((prev) => ({
      ...prev,
      searchParam: "",
    }));
  }, [props.activeTab]);

  return (
    <>
      <SingleLineSearch
        value={searchQuery}
        handleInputChange={handleInputChange}
        handleSearchIconClick={handleSearchIconClick}
        showClearSearch={true}
        clearSearchFilters={handleClearFilters}
        clearSearchClasses="bg-[#8e8e8e] hover:bg-[#737171] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded inline-flex gap-x-1.5 items-center mb-1 font-semibold"
      />
    </>
  );
};

export default ServiceTracker_SearchBar;
