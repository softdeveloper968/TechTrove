import React, { ChangeEvent, useEffect, useState } from "react";
import MultiLineSearch from "components/common/multiLineSearch/MultiLineSearch";
import { useDebounce } from "hooks/useDebounce";
import { useDismissalNVContext } from "pages/nv-dismissals/DismissalNVContext";

type DismissalNVSearchBarProps = {
    activeTab: string;
  };

  const DismissalNV_SearchBar = (props: DismissalNVSearchBarProps) => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchedApiQuery, setSearchedApiQuery] = useState<string>('');
    const debouncedSearch = useDebounce(searchQuery, 800);

    const { 
      pendingDismissals, 
      getNVDismissals, 
      setPendingDismissals,
      setConfirmedDismissals,
      showSpinner,
      confirmedDismissals
    } = useDismissalNVContext();

    useEffect(() => {
      setSearchQuery(pendingDismissals.searchParam ?? "");

   }, []);
   useEffect(()=>{
    setSearchQuery(pendingDismissals.searchParam ?? "");
    if(props.activeTab=="EA - Ready to Confirm")
         getNVDismissals(1,100,false,"",null,0);
    else if(props.activeTab=="Ready to Sign")
      getNVDismissals(1,100,true,"",null,0);
    else
    {

    }
       
 },[props.activeTab])

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setSearchQuery(event.target.value);
      };

      const updateDismissals = (searchParam: string) => {
        const trimmedSearchParam = searchParam.trim();
        if (trimmedSearchParam.length >= 3) {
           if(props.activeTab=="EA - Ready to Confirm"){
            getNVDismissals(1,100,false,trimmedSearchParam,null,0);
              setPendingDismissals((prev) => ({
                 ...prev,
                 searchParam: trimmedSearchParam,
              }));
           }
           else if(props.activeTab=="Ready to Sign")
           {
            getNVDismissals(1,100,true,trimmedSearchParam,null,0);
              setConfirmedDismissals((prev) => ({
                 ...prev,
                 searchParam: trimmedSearchParam,
              }));
           }
           else{

           }
          
        }
     };
      useEffect(() => {
       
        const trimmedSearchParam = debouncedSearch.trim();
        if(props.activeTab=="EA - Ready to Confirm")
           setPendingDismissals((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
        else if(props.activeTab=="Ready to Sign")
        {
          setConfirmedDismissals((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
        }
        else
        {

        }
        if (trimmedSearchParam) {
           if(searchedApiQuery  == "")
           {
              setSearchedApiQuery(trimmedSearchParam);
           }
           if(props.activeTab=="EA - Ready to Confirm")
             getNVDismissals(1,100,false,trimmedSearchParam,null,0);
          else if(props.activeTab=="Ready to Sign")
          {
            getNVDismissals(1,100,true,trimmedSearchParam,null,0);
          }
           else
           {

           }
        } 
           else if(trimmedSearchParam.length < searchedApiQuery.length)
           {
              setSearchedApiQuery(trimmedSearchParam);
              if(props.activeTab=="EA - Ready to Confirm")
                getNVDismissals(1,100,false,trimmedSearchParam,null,0);
              else if(props.activeTab=="Ready to Sign")
              {
                getNVDismissals(1,100,true,trimmedSearchParam,null,0);
              }
              else
              {

              }
           }else {
           updateDismissals("");
        }
     }, [debouncedSearch]);

     useEffect(() => {
      if (!searchQuery) {
        updateDismissals('');
      }
   }, [searchQuery]);

      const handleSearchIconClick = () => {
        if(props.activeTab=="EA - Ready to Confirm"){
          getNVDismissals(1,100,false,searchQuery.trim(),null,0);
           setPendingDismissals((prev) => ({ ...prev, searchParam: searchQuery }));
        }
        else if(props.activeTab=="Ready to Sign")
        {
          getNVDismissals(1,100,true,searchQuery.trim(),null,0);
           setConfirmedDismissals((prev) => ({ ...prev, searchParam: searchQuery }));
        }
        else{
        }
        
     };
    
     const handleCrossIconClick = () => {
      setSearchQuery('');
      if(props.activeTab=="EA - Ready to Confirm"){
        getNVDismissals(1,100,false,"",null,0);
         setPendingDismissals((prev) => ({ ...prev, searchParam: debouncedSearch }));
      }
      else if(props.activeTab=="Ready to Sign")
      {
        getNVDismissals(1,100,true,"",null,0);
         setConfirmedDismissals((prev) => ({ ...prev, searchParam: debouncedSearch }));
      }
      else{
      }
      
   };

   useEffect(() => {
    setSearchQuery('');
    setPendingDismissals((prev) => ({ ...prev, searchParam: '' }));
    setConfirmedDismissals((prev) => ({ ...prev, searchParam: '' }));
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

  export default DismissalNV_SearchBar;