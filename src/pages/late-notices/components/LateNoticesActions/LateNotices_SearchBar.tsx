import React, { ChangeEvent, useEffect, useState } from "react";
import MultiLineSearch from "components/common/multiLineSearch/MultiLineSearch";
import { useDebounce } from "hooks/useDebounce";
import { useLateNoticesContext } from "../../LateNoticesContext";

type LateNoticesSearchBarProps = {
  activeTab: string;
};

const LateNotices_SearchBar = (props: LateNoticesSearchBarProps) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchedApiQuery, setSearchedApiQuery] = useState<string>('');
  const debouncedSearch = useDebounce(searchQuery, 800);

  const {
    setLateNotices,
    getLateNotices,
    getSignedLateNotices,
    setSelectedLateNoticeId,
    lateNotices,
    signedLateNotices,
    setSignedLateNotices,
    getConfirmDelinquenciesQueue,
    getEvictionAutomationNoticeQueue,
    setConfirmDelinquenciesQueue,
    setEvictionAutomationNoticesConfirmQueue,
    evictionAutomationNoticesConfirmQueue,
    confirmDelinquenciesQueue
  } = useLateNoticesContext();

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setSearchQuery(event.target.value);
    setSelectedLateNoticeId([]);
  };
  // useEffect(()=>{    
  //   setSearchQuery("");
  //   updateLateNotices("");
  // },[props.activeTab])

  const updateLateNotices = (searchParam: string) => {
    if (!searchParam.length) return;
    setSearchQuery("");
    if(props.activeTab == "EA - Ready to Confirm")
    {
      getEvictionAutomationNoticeQueue(1,100,false,evictionAutomationNoticesConfirmQueue.isViewAll,searchParam);
      setEvictionAutomationNoticesConfirmQueue((prev) => ({
        ...prev,
        searchParam: searchParam,
      }));
    }
    else if(props.activeTab =="Ready to Sign"){
      getConfirmDelinquenciesQueue(1,100,true,confirmDelinquenciesQueue.isViewAll,searchParam,confirmDelinquenciesQueue.filingType);
      setConfirmDelinquenciesQueue((prev) => ({
        ...prev,
        searchParam: searchParam,
      }));
    }
    else if(props.activeTab =="All Notices"){
      getLateNotices(1,100,searchParam,lateNotices.filingType);
      setLateNotices((prev) => ({
        ...prev,
        searchParam: searchParam,
      }));
    }
    // const apiCall = props.activeTab === "Signed_Proofs" ? getSignedLateNotices : getLateNotices;
    // apiCall(1, 100, searchParam);
    // if (props.activeTab === "Signed_Proofs") {
    //   setSignedLateNotices((prev) => ({
    //     ...prev,
    //     searchParam: searchParam,
    //   }));
    // } else {
    //   setLateNotices((prev) => ({
    //     ...prev,
    //     searchParam: searchParam,
    //   }));
    // }
  };

  const handleSearchIconClick = () => {
    if(props.activeTab == "EA - Ready to Confirm")
      {
        getEvictionAutomationNoticeQueue(1,100,false,evictionAutomationNoticesConfirmQueue.isViewAll,searchQuery);
        setEvictionAutomationNoticesConfirmQueue((prev) => ({
          ...prev,
          searchParam: searchQuery,
        }));
      }
      else if(props.activeTab =="Ready to Sign"){
        getConfirmDelinquenciesQueue(1,100,true,confirmDelinquenciesQueue.isViewAll,searchQuery,confirmDelinquenciesQueue.filingType);
        setConfirmDelinquenciesQueue((prev) => ({
          ...prev,
          searchParam: searchQuery,
        }));
      }
      else if(props.activeTab =="All Notices"){
        getLateNotices(1,100,searchQuery,lateNotices.filingType);
        setLateNotices((prev) => ({
          ...prev,
          searchParam: searchQuery,
        }));
      }

    // const apiCall = props.activeTab === "Signed_Proofs" ? getSignedLateNotices : getLateNotices;
    // setSignedLateNotices((prev) => ({
    //   ...prev,
    //   searchParam: searchQuery,
    // }));
    // setLateNotices((prev) => ({
    //   ...prev,
    //   searchParam: searchQuery,
    // }));
    // if (props.activeTab === "Signed Proofs") {
    //   apiCall(1, 100,searchQuery);

    // } else {
    //   apiCall(1, 100,searchQuery);
    // }
  };

  const handleCrossIconClick = () => {
    setSearchQuery("");
    if(props.activeTab == "EA - Ready to Confirm")
      {
        getEvictionAutomationNoticeQueue(1,100,false,evictionAutomationNoticesConfirmQueue.isViewAll,"");
        setEvictionAutomationNoticesConfirmQueue((prev) => ({
          ...prev,
          searchParam: "",
        }));
      }
      else if(props.activeTab =="Ready to Sign"){
        getConfirmDelinquenciesQueue(1,100,true,confirmDelinquenciesQueue.isViewAll,"",confirmDelinquenciesQueue.filingType);
        setConfirmDelinquenciesQueue((prev) => ({
          ...prev,
          searchParam: "",
        }));
      }
      else if(props.activeTab =="All Notices"){
        getLateNotices(1,100,"",lateNotices.filingType);
        setLateNotices((prev) => ({
          ...prev,
          searchParam: "",
        }));
      }

    // const apiCall = props.activeTab === "Signed_Proofs" ? getSignedLateNotices : getLateNotices;
    // setSignedLateNotices((prev) => ({
    //   ...prev,
    //   searchParam: "",
    // }));
    // setLateNotices((prev) => ({
    //   ...prev,
    //   searchParam: "",
    // }));
    // if (props.activeTab === "Signed_Proofs") {
    //   apiCall(1, 100,"");
      
    // } else {
    //   apiCall(1, 100,"");
    // }
  };

  // useEffect(() => {

  //   if(props.activeTab == "Pending Notice Confirmations")
  //     {
  //       setEvictionAutomationNoticesConfirmQueue((prev) => ({
  //         ...prev,
  //         searchParam: debouncedSearch,
  //       }));
  //     }
  //     else if(props.activeTab =="Confirmed Notices"){
  //       setConfirmDelinquenciesQueue((prev) => ({
  //         ...prev,
  //         searchParam: debouncedSearch,
  //       }));
  //     }
  //     else if(props.activeTab =="All Notices"){
  //       setLateNotices((prev) => ({
  //         ...prev,
  //         searchParam: debouncedSearch,
  //       }));
  //     }
  //   // if (props.activeTab === "Signed_Proofs") {
  //   //   setSignedLateNotices((prev) => ({
  //   //     ...prev,
  //   //     searchParam: debouncedSearch,
  //   //   }));
  //   // } else {
  //   //   setLateNotices((prev) => ({
  //   //     ...prev,
  //   //     searchParam: debouncedSearch,
  //   //   }));
  //   // }

  //    if (debouncedSearch && debouncedSearch.length >= 3) {
  //     if(props.activeTab == "Pending Notice Confirmations")
  //       {
  //         getEvictionAutomationNoticeQueue(1,100,false,evictionAutomationNoticesConfirmQueue.isViewAll,debouncedSearch);
          
  //       }
  //       else if(props.activeTab =="Confirmed Notices"){
  //         getConfirmDelinquenciesQueue(1,100,true,confirmDelinquenciesQueue.isViewAll,debouncedSearch,confirmDelinquenciesQueue.filingType);
         
  //       }
  //       else if(props.activeTab =="All Notices"){
  //         getLateNotices(1,100,debouncedSearch,lateNotices.filingType);
         
  //       }
  //     // const apiCall = props.activeTab === "Signed_Proofs" ? getSignedLateNotices : getLateNotices;
  //     // apiCall(1, 100,debouncedSearch);
  //   } else {
  //     updateLateNotices("");
  //   }
  // }, [debouncedSearch]);

  useEffect(() => {

    if(props.activeTab == "EA - Ready to Confirm")
      {
        setEvictionAutomationNoticesConfirmQueue((prev) => ({
          ...prev,
          searchParam: debouncedSearch,
        }));
      }
      else if(props.activeTab =="Ready to Sign"){
        setConfirmDelinquenciesQueue((prev) => ({
          ...prev,
          searchParam: debouncedSearch,
        }));
      }
      else if(props.activeTab =="All Notices"){
        setLateNotices((prev) => ({
          ...prev,
          searchParam: debouncedSearch,
        }));
      }
    // if (props.activeTab === "Signed_Proofs") {
    //   setSignedLateNotices((prev) => ({
    //     ...prev,
    //     searchParam: debouncedSearch,
    //   }));
    // } else {
    //   setLateNotices((prev) => ({
    //     ...prev,
    //     searchParam: debouncedSearch,
    //   }));
    // }

     if (debouncedSearch) {
      if(searchedApiQuery  == "")
        {
           setSearchedApiQuery(debouncedSearch);
        }
      if(props.activeTab == "EA - Ready to Confirm")
        {
          getEvictionAutomationNoticeQueue(1,100,false,evictionAutomationNoticesConfirmQueue.isViewAll,debouncedSearch);
          
        }
        else if(props.activeTab =="Ready to Sign"){
          getConfirmDelinquenciesQueue(1,100,true,confirmDelinquenciesQueue.isViewAll,debouncedSearch,confirmDelinquenciesQueue.filingType);
         
        }
        else if(props.activeTab =="All Notices"){
          getLateNotices(1,100,debouncedSearch,lateNotices.filingType);
         
        }
      // const apiCall = props.activeTab === "Signed_Proofs" ? getSignedLateNotices : getLateNotices;
      // apiCall(1, 100,debouncedSearch);
    }
    else if(debouncedSearch.length < searchedApiQuery.length)
      {
         setSearchedApiQuery(debouncedSearch);
         if(props.activeTab == "EA - Ready to Confirm")
          {
            getEvictionAutomationNoticeQueue(1,100,false,evictionAutomationNoticesConfirmQueue.isViewAll,debouncedSearch);
            
          }
          else if(props.activeTab =="Ready to Sign"){
            getConfirmDelinquenciesQueue(1,100,true,confirmDelinquenciesQueue.isViewAll,debouncedSearch,confirmDelinquenciesQueue.filingType);
           
          }
          else if(props.activeTab =="All Notices"){
            getLateNotices(1,100,debouncedSearch,lateNotices.filingType);
           
          }
         setSearchQuery('');
         setEvictionAutomationNoticesConfirmQueue((prev) => ({
          ...prev,
          searchParam: '',
        }));
        setConfirmDelinquenciesQueue((prev) => ({
          ...prev,
          searchParam: '',
        }));
        setLateNotices((prev) => ({
          ...prev,
          searchParam: '',
        }));
      } 
    else {
      updateLateNotices("");
    }
  }, [debouncedSearch]);

  useEffect(() => {
    if (!searchQuery) {
      updateLateNotices("");
    }
  }, [searchQuery]);

  useEffect(() => {
    setSearchQuery('');
    setEvictionAutomationNoticesConfirmQueue((prev) => ({
      ...prev,
      searchParam: '',
    }));
    setConfirmDelinquenciesQueue((prev) => ({
      ...prev,
      searchParam: '',
    }));
    setLateNotices((prev) => ({
      ...prev,
      searchParam: '',
    }));
 }, [props.activeTab]);

  return (
    <MultiLineSearch
      value={searchQuery}
      handleInputChange={handleChange}
      handleSearchIconClick={handleSearchIconClick}
      handleCrossIconClick={handleCrossIconClick}
    />
  );
};

export default LateNotices_SearchBar;
