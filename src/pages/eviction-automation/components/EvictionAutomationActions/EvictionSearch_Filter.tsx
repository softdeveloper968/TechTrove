import React, { useState, useEffect } from "react";
import { ChangeEvent } from "react";
import { FaTimes } from "react-icons/fa";
import { ISelectOptions } from "interfaces/all-cases.interface";
import DropdownPresentation from "components/common/dropdown/DropDown";
import ClearFilters from "components/common/button/ClearFilters";
import { useEvictionAutomationContext } from "pages/eviction-automation/EvictionAutomationContext";
import { useAuth } from "context/AuthContext";
import "react-datepicker/dist/react-datepicker.css";
import { CourtLists, ExpeditedLists } from "utils/constants";
import { UserRole } from "utils/enum";

const initialSelectOption: ISelectOptions = { id: '', value: '' };

const Eviction_SearchFilters = () => {
    const [selectedCounty, setSelectedCounty] = useState<ISelectOptions>(initialSelectOption);
    const [selectedCompany, setSelectedCompany] = useState<ISelectOptions>(initialSelectOption);
    const { allCompanies, allCounties,getEvictionAutomationQueue,setEvictionAutomationQueue,evictionAutomationQueue 
        ,setSelectedEvictionAutomationQueueIds,setBulkEditRecords
    } = useEvictionAutomationContext();
    const [companyList, setCompanyList] = useState<ISelectOptions[]>([]);
    const [selectedExpedited, setSeletedExpedited] = useState<ISelectOptions>(initialSelectOption);
    const [selectedCourt, setSeletedCourt] = useState<ISelectOptions>(initialSelectOption);
    const [isStateCourt, setIsStateCourt] = useState<boolean>(false);
    const [countyList, setCountyList] = useState<ISelectOptions[]>([]);
    useEffect(() => {

        var companyList = allCompanies.map((item) => ({
            id: item.id,
            value: item.companyName
        }));
        setCompanyList(companyList);

    }, [allCompanies]);
    useEffect(() => {
        var list = allCounties.map((item) => ({
            id: item.countyName,
            value: item.countyName
        }));
        setCountyList(list);
    }, [allCounties]);
    const{userRole}=useAuth();
    const updateEmailQueue = (companyId: string, county: string,isExpedited: number, isStateCourt: number) => {

        setEvictionAutomationQueue(prev => ({
            ...prev,
            companyId,
            county,            
            isExpedited,
            isStateCourt
        }));
        getEvictionAutomationQueue(1, 100, evictionAutomationQueue.searchParam,companyId ,county ,isExpedited,isStateCourt);

    };

    const handleCountyChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedEvictionAutomationQueueIds([]);
        setBulkEditRecords([]);
        const county = event.target.value as string;
        setSelectedCounty({ id: county, value: county });
        updateEmailQueue(selectedCompany.id as string, event.target.value as string,selectedExpedited.id ? parseInt(selectedExpedited.id.toString(), 10) : 0, selectedCourt.id ? parseInt(selectedCourt.id.toString(), 10) : 0)

        //setAllCases((prevAllCases) => ({ ...prevAllCases, county: county }));
    };
    const clearSearchFilters = () => {
        // setSelectedEvictionAutomationQueueIds([]);
        // setBulkEditRecords([]);
        setSelectedCompany(initialSelectOption);
        setSelectedCounty(initialSelectOption);
        setSeletedExpedited(initialSelectOption);
        setSeletedCourt(initialSelectOption);

        setIsStateCourt(false);
        updateEmailQueue("", "", 0, 0);
    };
    // const [selectedOption, setSelectedOption] = useState<ISearchSelectOptions|null>();

    const handleCompanyChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedEvictionAutomationQueueIds([]);
        setBulkEditRecords([]);
        setSelectedCompany({ id: event.target.value, value: companyList.find(x => x.id === event.target.value)?.value || '' });
        updateEmailQueue(event.target.value, selectedCounty.id as string, selectedExpedited.id ? parseInt(selectedExpedited.id.toString(), 10) : 0, selectedCourt.id ? parseInt(selectedCourt.id.toString(), 10) : 0);

    };
    

    const handleExpeditedChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedEvictionAutomationQueueIds([]);
        setBulkEditRecords([]);
        const selectedExpeditedId = parseInt(event.target.value, 10) || 0;
        setSeletedExpedited({ id: selectedExpeditedId.toString(), value: ExpeditedLists.find(x => x.id === selectedExpeditedId)?.value || '' });
        updateEmailQueue(selectedCompany.id as string, selectedCounty.id as string, selectedExpeditedId, selectedCourt.id ? parseInt(selectedCourt.id.toString(), 10) : 0);
    };
    const handleCourtChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedEvictionAutomationQueueIds([]);
        setBulkEditRecords([]);
        const selectedCourtId = parseInt(event.target.value, 10) || 0;
        setSeletedCourt({ id: selectedCourtId.toString(), value: ExpeditedLists.find(x => x.id === selectedCourtId)?.value || '' });
        updateEmailQueue(selectedCompany.id as string, selectedCounty.id as string, selectedExpedited.id ? parseInt(selectedExpedited.id.toString(), 10) : 0, selectedCourtId);
    };

    return (
        <div className="flex items-end filterSec logsFilter">
            {
                (userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)) && <>
                <div className="relative ">
                <DropdownPresentation
                    heading=""
                    selectedOption={selectedCompany}
                    handleSelect={handleCompanyChange}
                    options={companyList}
                    placeholder="Select Company"
                />
            </div>
                </>
            }            
            <div className="relative ">
                <DropdownPresentation
                    heading=""
                    selectedOption={selectedCounty}
                    handleSelect={handleCountyChange}
                    options={countyList}
                    placeholder="Select County"
                />
            </div>
            <div className="relative ">
                <DropdownPresentation
                    heading=""
                    selectedOption={selectedExpedited}
                    handleSelect={handleExpeditedChange}
                    options={ExpeditedLists}
                    placeholder="Select Expedited"
                />
            </div>
            <div className="relative ">
                <DropdownPresentation
                    heading=""
                    selectedOption={selectedCourt}
                    handleSelect={handleCourtChange}
                    options={CourtLists}
                    placeholder="Select Court"
                />
            </div>
            <div>
                <ClearFilters
                    type="button"
                    isRounded={false}
                    title="Clear Filters"
                    handleClick={clearSearchFilters}
                    icon={<FaTimes />}
                />
            </div>
        </div>
    );
};

export default Eviction_SearchFilters;
