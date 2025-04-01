import React, { ChangeEvent, useEffect, useState } from "react";
import MultiLineSearch from "components/common/multiLineSearch/MultiLineSearch";
import { useDebounce } from "hooks/useDebounce";
import { useFileEvictionNVContext } from "pages/nv-file-evictions/FileEvictionNVContext";

type FileEvictionNVSearchBarProps = {
    activeTab: string;
  };

  const FileEvictionNV_SearchBar = (props: FileEvictionNVSearchBarProps) => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [searchedApiQuery, setSearchedApiQuery] = useState<string>('');
    const debouncedSearch = useDebounce(searchQuery, 800);
    const { 
      pendingEvictions, 
      getNVEvictions, 
      showSpinner,
      confirmedEvictions,
      setConfirmedEvictions,
      setPendingEvictions
    } = useFileEvictionNVContext();

    useEffect(() => {
      setSearchQuery(pendingEvictions.searchParam ?? "");

   }, []);
   useEffect(()=>{
    setSearchQuery(pendingEvictions.searchParam ?? "");
    if(props.activeTab=="EA - Ready to Confirm")
      getNVEvictions(1,100,false,"",null,0);
    else
    getNVEvictions(1,100,true,"",null,0);
 },[props.activeTab])

 const updateFileEvictions = (searchParam: string) => {
  const trimmedSearchParam = searchParam.trim();
  if (trimmedSearchParam.length >= 3) {
     if(props.activeTab=="EA - Ready to Confirm"){
      getNVEvictions(1,100,false,trimmedSearchParam,null,0);
        setPendingEvictions((prev) => ({
           ...prev,
           searchParam: trimmedSearchParam,
        }));
     }
     else{
      getNVEvictions(1,100,true,trimmedSearchParam,null,0);
        setConfirmedEvictions((prev) => ({
           ...prev,
           searchParam: trimmedSearchParam,
        }));
     }
    
  }
};
    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setSearchQuery(event.target.value);
      };
      const handleSearchIconClick = () => {
        if(props.activeTab=="EA - Ready to Confirm"){
          getNVEvictions(1,100,false,searchQuery.trim(),null,0);
           setPendingEvictions((prev) => ({ ...prev, searchParam: searchQuery }));
        }
        else{
           getNVEvictions(1,100,true,searchQuery.trim(),null,0);
           setConfirmedEvictions((prev) => ({ ...prev, searchParam: searchQuery }));
        }
        
     };
    
  const handleCrossIconClick = () => {
    setSearchQuery('');
    if(props.activeTab=="EA - Ready to Confirm"){
      getNVEvictions(1,100,false,"",null,0);
       setPendingEvictions((prev) => ({ ...prev, searchParam: debouncedSearch }));
    }
    else{
      getNVEvictions(1,100,true,"",null,0);
       setConfirmedEvictions((prev) => ({ ...prev, searchParam: debouncedSearch }));
    }
    
 };

 useEffect(() => {
       
  const trimmedSearchParam = debouncedSearch.trim();
  if(props.activeTab=="EA - Ready to Confirm")
     setPendingEvictions((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
  else
     setConfirmedEvictions((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
  if (trimmedSearchParam) {
     if(searchedApiQuery  == "")
     {
        setSearchedApiQuery(trimmedSearchParam);
     }
     if(props.activeTab=="EA - Ready to Confirm")
      getNVEvictions(1,100,false,trimmedSearchParam,null,0);
     else
     getNVEvictions(1,100,true,trimmedSearchParam,null,0);
  } 
     else if(trimmedSearchParam.length < searchedApiQuery.length)
     {
        setSearchedApiQuery(trimmedSearchParam);
        if(props.activeTab=="EA - Ready to Confirm")
          getNVEvictions(1,100,false,trimmedSearchParam,null,0);
        else
        getNVEvictions(1,100,true,trimmedSearchParam,null,0);
     }else {
     updateFileEvictions("");
  }
}, [debouncedSearch]);

useEffect(() => {
  if (!searchQuery) {
     updateFileEvictions('');
  }
}, [searchQuery]);

useEffect(() => {
  setSearchQuery('');
  setPendingEvictions((prev) => ({ ...prev, searchParam: '' }));
  setConfirmedEvictions((prev) => ({ ...prev, searchParam: '' }));
}, [props.activeTab])
    return (
        <MultiLineSearch
          value={searchQuery}
          handleInputChange={handleChange}
          handleSearchIconClick={handleSearchIconClick}
          handleCrossIconClick={handleCrossIconClick}
        />
      );
  };

  export default FileEvictionNV_SearchBar;