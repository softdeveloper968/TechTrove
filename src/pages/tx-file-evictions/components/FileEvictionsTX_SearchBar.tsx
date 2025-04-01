// import React, { ChangeEvent, useEffect, useState } from "react";
// import { useDebounce } from "hooks/useDebounce";
// import MultiLineSearch from "components/common/multiLineSearch/MultiLineSearch";
// import { useFileEvictionsTXContext } from "../FileEvictionsTXContext";
// type FileEvictionsTX_SearchBarProp = {
//     activeTab?: string;
// };
// const FileEvictionsTX_SearchBar = (props: FileEvictionsTX_SearchBarProp) => {
//     const [searchQuery, setSearchQuery] = useState<string>("");
//     const [searchedApiQuery, setSearchedApiQuery] = useState<string>('');

//     const debouncedSearch = useDebounce(searchQuery, 500, 3);

//     const { 
//         fileEvictions, 
//         setFileEvictions, 
//         getFileEvictions,
//         evictionAutomationApprovalsQueue,
//       setEvictionAutomationApprovalsQueue,
//       getEvictionAutomationApprovalsQueue

//     } = useFileEvictionsTXContext();

//     // useEffect(() => {
//     //     setSearchQuery(fileEvictions.searchParam ?? "");

//     // }, []);

//     // useEffect(() => {
//     //     setSearchQuery(fileEvictions.searchParam ?? "");
//     //     getFileEvictions(1, 100, fileEvictions.isViewAll ?? true, "");
//     // }, [])

//     useEffect(() => {
//         setSearchQuery(
//           props.activeTab === "Ready to Sign"
//             ? fileEvictions.searchParam ?? "" // Default to empty string if undefined
//             : props.activeTab === "EA - Ready to Confirm"
//             ? evictionAutomationApprovalsQueue.searchParam ?? "" // Default to empty string if undefined
//             : ""
//         );
//       }, [props.activeTab, fileEvictions.searchParam, evictionAutomationApprovalsQueue.searchParam]);   

//     const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
//         setSearchQuery(event.target.value);
//     };

//     const updateFileEvictions = (searchParam: string) => {
//         const trimmedSearchParam = searchParam.trim();
//         if (trimmedSearchParam.length >= 3) {
//             getFileEvictions(1, 100, fileEvictions.isViewAll ?? true, trimmedSearchParam);
//             setFileEvictions((prev) => ({
//                 ...prev,
//                 searchParam: trimmedSearchParam,
//             }));
//         }
//     };

//     const handleSearchIconClick = () => {
//         // getFileEvictions(1, 100, fileEvictions.isViewAll ?? true, searchQuery.trim());
//         // setFileEvictions((prev) => ({ ...prev, searchParam: searchQuery }));
//         if (props.activeTab === "Ready to Sign") {
//              getFileEvictions(1, 100, fileEvictions.isViewAll ?? true, searchQuery.trim());
//              setFileEvictions((prev) => ({ ...prev, searchParam: searchQuery }));
//          } else {
//             getEvictionAutomationApprovalsQueue(1, 100, false, true, searchQuery.trim());
//             setEvictionAutomationApprovalsQueue((prev) => ({ ...prev, searchParam: searchQuery.trim() }));
//          }
//     };

//     const handleCrossIconClick = () => {
//         // setSearchQuery('');
//         // getFileEvictions(1, 100, fileEvictions.isViewAll ?? true, "");
//         // setFileEvictions((prev) => ({ ...prev, searchParam: debouncedSearch }));
//         setSearchQuery('');
//       if (props.activeTab === "Ready to Sign") {
//          getFileEvictions(1, 100, fileEvictions.isViewAll ?? true, "","");
//          setFileEvictions((prev) => ({ ...prev, searchParam: '', companyId: "" }));
//       } else {
//          getEvictionAutomationApprovalsQueue(1, 100, false, true, "");
//          setEvictionAutomationApprovalsQueue((prev) => ({ ...prev, searchParam: '' }));
//       }
//     };

//     // useEffect(() => {

//     //     const trimmedSearchParam = debouncedSearch.trim();
//     //     setFileEvictions((prev) => ({ ...prev, searchParam: trimmedSearchParam }));
//     //     if (trimmedSearchParam) {
//     //         if (searchedApiQuery == "") {
//     //             setSearchedApiQuery(trimmedSearchParam);
//     //         }
//     //         getFileEvictions(1, 100, fileEvictions.isViewAll ?? true, trimmedSearchParam);
//     //     }
//     //     else if (trimmedSearchParam.length < searchedApiQuery.length) {
//     //         setSearchedApiQuery(trimmedSearchParam);
//     //         getFileEvictions(1, 100, fileEvictions.isViewAll ?? true, trimmedSearchParam);
//     //     } else {
//     //         updateFileEvictions("");
//     //     }
//     // }, [debouncedSearch]);
//     useEffect(() => {
//         setSearchQuery('');
//         setFileEvictions((prev) => ({ ...prev, searchParam: '' }));
//         setEvictionAutomationApprovalsQueue((prev) => ({ ...prev, searchParam: '' }));
//      }, [props.activeTab]);

//     useEffect(() => {
//         if (!searchQuery) {
//             updateFileEvictions('');
//         }
//     }, [searchQuery]);

//     useEffect(() => {
//         setSearchQuery('');
//         setFileEvictions((prev) => ({ ...prev, searchParam: '' }));
//     }, []);

//     return (
//         <MultiLineSearch
//             value={searchQuery}
//             handleInputChange={handleChange}
//             handleSearchIconClick={handleSearchIconClick}
//             handleCrossIconClick={handleCrossIconClick}
//         />
//     );
// };

// export default FileEvictionsTX_SearchBar;

import React, { ChangeEvent, useEffect, useState } from "react";
import { useFileEvictionsTXContext } from "../FileEvictionsTXContext";
import SingleLineSearch from "components/common/singleLineSearch/SingleLineSearch"; // Assuming SingleLineSearch is the new component
import { useAuth } from "context/AuthContext";
import { UserRole } from "utils/enum";

type FileEvictions_SearchBarProp = {
   activeTab?: string;
};

const FileEvictions_SearchBar = (props: FileEvictions_SearchBarProp) => {
   const [searchQuery, setSearchQuery] = useState<string>("");
   const {
      fileEvictions,
      setFileEvictions,
      getFileEvictions,
      evictionAutomationApprovalsQueue,
      setEvictionAutomationApprovalsQueue,
      getEvictionAutomationApprovalsQueue
   } = useFileEvictionsTXContext();
   const { userRole } = useAuth();

   useEffect(() => {
      setSearchQuery(
        props.activeTab === "Ready to Sign"
          ? fileEvictions.searchParam ?? "" // Default to empty string if undefined
          : props.activeTab === "EA - Ready to Confirm"
          ? evictionAutomationApprovalsQueue.searchParam ?? "" // Default to empty string if undefined
          : ""
      );
    }, [props.activeTab, fileEvictions.searchParam, evictionAutomationApprovalsQueue.searchParam]);    

   const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(event.target.value);
   };

   const handleSearchIconClick = () => {
      if (props.activeTab === "Ready to Sign") {
         getFileEvictions(1, 100, fileEvictions.isViewAll ?? true, searchQuery.trim(),fileEvictions.clientId);
         setFileEvictions((prev) => ({ ...prev, searchParam: searchQuery.trim() }));
      } else {
         getEvictionAutomationApprovalsQueue(1, 100, false, true, searchQuery.trim());
         setEvictionAutomationApprovalsQueue((prev) => ({ ...prev, searchParam: searchQuery.trim() }));
      }
   };

   const handleClearFilters = () => {
      setSearchQuery('');
      if (props.activeTab === "Ready to Sign") {
         getFileEvictions(1, 100, fileEvictions.isViewAll ?? true, "","");
         setFileEvictions((prev) => ({ ...prev, searchParam: '', companyId: "" }));
      } else {
         getEvictionAutomationApprovalsQueue(1, 100, false, true, "");
         setEvictionAutomationApprovalsQueue((prev) => ({ ...prev, searchParam: '' }));
      }
   };

   useEffect(() => {
      setSearchQuery('');
      setFileEvictions((prev) => ({ ...prev, searchParam: '' }));
      setEvictionAutomationApprovalsQueue((prev) => ({ ...prev, searchParam: '' }));
   }, [props.activeTab]);

   return (
      <SingleLineSearch
         value={searchQuery}
         handleInputChange={handleInputChange}
         handleSearchIconClick={handleSearchIconClick}
         showClearSearch={userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) ? false : true}
         clearSearchFilters={handleClearFilters}
         clearSearchClasses="bg-[#8e8e8e] hover:bg-[#737171] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded inline-flex gap-x-1.5 items-center mb-1 font-semibold font-semibold"
      />
   );
};

export default FileEvictions_SearchBar;
