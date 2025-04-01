import React, { ChangeEvent, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { AllNoticeStatusList, FilingType, NoticeStatus } from "utils/constants";
import { ISelectOptions } from "interfaces/all-cases.interface";
import DropdownPresentation from "components/common/dropdown/DropDown";
import ClearFilters from "components/common/button/ClearFilters";
import { useLateNoticesContext } from "../LateNoticesContext";
import { useAuth } from "context/AuthContext";
import { UserRole } from "utils/enum";

const initialSelectOption: ISelectOptions = { id: '', value: '' };

const LateNotices_SearchFilters = () => {
    const [selectedFiling, setSelectedFiling] = useState<ISelectOptions>(initialSelectOption);
    const [selectedStatus, setSelectedStatus] = useState<ISelectOptions>(initialSelectOption);
    // will get data from api and set that in the updateAllCases
    const {confirmDelinquenciesQueue, getConfirmDelinquenciesQueue, setConfirmDelinquenciesQueue, 
        setSelectedLateNoticeId,setSelectedConfirmDelinquenciesId,selectedTab,
        lateNotices,setLateNotices,getLateNotices} = useLateNoticesContext();
    const { userRole } = useAuth();
    const [countyList,setCountyList]=useState<ISelectOptions[]>([]);
   
    const handleFilingChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const filing = event.target.value as string;
        setSelectedFiling({ id: filing, value: filing });
        setSelectedLateNoticeId([]);
        setSelectedConfirmDelinquenciesId([]);
        if(selectedTab=="Ready to Sign"){
            getConfirmDelinquenciesQueue(1, 100,true,true, confirmDelinquenciesQueue.searchParam,event.target.value=="1");
            setConfirmDelinquenciesQueue((prevAllCases) => ({ ...prevAllCases,filingType:event.target.value=="1"}));
        }
        else{
            getLateNotices(1,100,lateNotices.searchParam,event.target.value=="1",lateNotices.status);
            setLateNotices((prevAllCases) => ({ ...prevAllCases,filingType:event.target.value=="1"}));
        }
        
    };
    const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const selectedStatusId = parseInt(event.target.value, 10) || 0;
        setSelectedStatus({ id: selectedStatusId.toString(), value: AllNoticeStatusList.find(x => x.id === selectedStatusId)?.value || '' });
        setSelectedLateNoticeId([]);
        setSelectedConfirmDelinquenciesId([]);
        getLateNotices(1,100,lateNotices.searchParam,lateNotices.filingType,selectedStatusId);
        setLateNotices((prevAllCases) => ({ ...prevAllCases,status:selectedStatusId}));
    };

    const clearSearchFilters = () => { 
            setSelectedFiling(initialSelectOption);
            setSelectedStatus(initialSelectOption);
            setSelectedLateNoticeId([]);
            setSelectedConfirmDelinquenciesId([]);
            if(selectedTab=="Ready to Sign"){
                getConfirmDelinquenciesQueue(1,100,true,true,"",null)
                setConfirmDelinquenciesQueue((prevAllCases) => ({ ...prevAllCases, searchParam: '',filingType:null }));
            }
           else{
            getLateNotices(1, 100, '',null,0);
            setLateNotices((prevAllCases) => ({ ...prevAllCases, searchParam: '',filingType:null,isServed:null }));
           }
    };

    return (
        <div className="flex items-center filterSec mb-3">
        {!userRole.includes(UserRole.PropertyManager) && <>
            <DropdownPresentation
                heading={""}
                selectedOption={selectedFiling}
                handleSelect={(event) => handleFilingChange(event)}
                options={FilingType}
                placeholder="Filter by EvictionType"
            />
            {
            selectedTab=="All Notices" &&
                <DropdownPresentation
                    heading=""
                    selectedOption={selectedStatus}
                    handleSelect={handleStatusChange}
                    options={AllNoticeStatusList}                
                    placeholder="Filter by status"
                />
            } 
            <ClearFilters
                type="button"
                isRounded={false}
                title="Clear Filters"
                handleClick={clearSearchFilters}
                icon={<FaTimes />}
            />
        </> }
        </div>
    );
};

export default LateNotices_SearchFilters;