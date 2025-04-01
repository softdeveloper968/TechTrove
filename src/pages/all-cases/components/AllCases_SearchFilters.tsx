import React, { ChangeEvent, useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import {FilingType, StatusList } from "utils/constants";
import { UserRole } from "utils/enum";
import { ISelectOptions } from "interfaces/all-cases.interface";
import DropdownPresentation from "components/common/dropdown/DropDown";
import ClearFilters from "components/common/button/ClearFilters";
import { useAllCasesContext } from "../AllCasesContext";
import { useAuth } from "context/AuthContext";
import TylerService from "services/tyler.service";
import { HttpStatusCode } from "axios";
import { DataList } from "interfaces/tyler.interface";

const initialSelectOption: ISelectOptions = { id: '', value: '' };

const AllCases_SearchFilters = () => {
    const {selectedStateValue}=useAuth();
    const [selectedStatus, setSelectedStatus] = useState<ISelectOptions>(initialSelectOption);
    const [selectedCounty, setSelectedCounty] = useState<ISelectOptions>(initialSelectOption);
    const [selectedFiling, setSelectedFiling] = useState<ISelectOptions>(initialSelectOption);
    const [selectedCourt, setSelectedCourt] = useState<ISelectOptions>(initialSelectOption);
    // will get data from api and set that in the updateAllCases
    const { allCases, setAllCases, getAllCases, setSelectedAllCasesId ,allCounties,setShowSpinner} = useAllCasesContext();
    const { userRole } = useAuth();
    const [countyList,setCountyList]=useState<ISelectOptions[]>([]);
    const [courtList,setCourtList]=useState<ISelectOptions[]>([]);
    const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const status = event.target.value as string;
        setSelectedStatus({ id: status, value: status });
        setSelectedAllCasesId([]);

        getAllCases(1, 100, allCases.searchParam, status, selectedCounty.id.toString(),selectedFiling && selectedFiling.id != ""?selectedFiling.id==1:null,selectedCourt.id.toString());

        setAllCases((prevAllCases) => ({ ...prevAllCases, status: status }));
    };
    const handleFilingChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const filing = event.target.value as string;
        setSelectedFiling({ id: filing, value: filing });
        setSelectedAllCasesId([]);

        getAllCases(1, 100, allCases.searchParam, selectedStatus.id.toString(), selectedCounty.id.toString(),event.target.value=="1",selectedCourt.id.toString());
        setAllCases((prevAllCases) => ({ ...prevAllCases,filingType:event.target.value=="1"}));
    };
     const getDropdownValues = async (state: string, court: string, caseType: string, filingCode: string, fileIntoExistingCase: boolean,category:string) => {
    
          const apiResponse = await TylerService.getCourtsByState(state, court, caseType, filingCode, fileIntoExistingCase,category);
          if (apiResponse.status === HttpStatusCode.Ok) {
             return apiResponse.data as DataList[];
          }
          else
             return [];
       };
       const handleSetCourtValues = async (state: string, fileIntoExistingCase: boolean) => {       
             try {
                setShowSpinner(true);
                var data = await getDropdownValues(state, "", "", "", fileIntoExistingCase,"");
                const courtOptions = data.map((item: DataList) => {
                   return {
                      id: item.name,
                      value: item.name
                   } as ISelectOptions;
                });
                setCourtList(courtOptions);
       
             } finally {
                setShowSpinner(false);
             }
       
          };
    useEffect(() => {
        if(selectedStateValue.toLowerCase()=="tx")        
            handleSetCourtValues(selectedStateValue,false);
        // Filter counties based on the selectedStateValue
        const filteredList = allCounties
          .filter(item => item.stateName === selectedStateValue) // Filter by state
          .map(item => ({
            id: item.countyName,
            value: item.countyName
          }));
        
        setCountyList(filteredList);

        // const filteredCourtList = courts// Filter by state
        //   .map(item => ({
        //     id: item.name,
        //     value: item.name
        //   }));
        
        // setCourtList(filteredCourtList);
      }, [allCounties, selectedStateValue]);
      
    const handleCountyChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const county = event.target.value as string;
        setSelectedCounty({ id: county, value: county });
        setSelectedAllCasesId([]);
        getAllCases(1, 100, allCases.searchParam, selectedStatus.id.toString(), county,selectedFiling && selectedFiling.id != ""?selectedFiling.id==1:null,selectedCourt.id.toString());
        setAllCases((prevAllCases) => ({ ...prevAllCases, county: county }));
    };
    const handleCourtChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const court = event.target.value as string;
        setSelectedCourt({ id: court, value: court });
        setSelectedAllCasesId([]);
        getAllCases(1, 100, allCases.searchParam, selectedStatus.id.toString(), selectedCounty.id.toString(),selectedFiling && selectedFiling.id != ""?selectedFiling.id==1:null,court);
        setAllCases((prevAllCases) => ({ ...prevAllCases, courtType: court }));
    };

    const clearSearchFilters = () => {
        // if(allCases.searchParam?.length || selectedStatus.value.length || selectedCounty.value.length){
            setSelectedStatus(initialSelectOption);
            setSelectedCounty(initialSelectOption);
            setSelectedFiling(initialSelectOption);
            setSelectedCourt(initialSelectOption);
            setSelectedAllCasesId([]);
            // getAllCases(1, 100, '', '', '',null);
            // setAllCases((prevAllCases) => ({ ...prevAllCases, searchParam: '', status: '', county: '',filingType:null }));
            getAllCases(1, 100, '', '', '', null,'');
            setAllCases((prevAllCases) => ({ ...prevAllCases, searchParam: '', county: '', status: '', filingType:null ,courtType:'', sortings: [] }));
        // }
    };

    return (
        <>
        {!userRole.includes(UserRole.Viewer) ?
        <div className="flex items-center filterSec">
            
              <DropdownPresentation
              heading={""}
              selectedOption={selectedStatus}
              handleSelect={(event) => handleStatusChange(event)}
              options={StatusList}  
              placeholder="Filter by status"
              isVisible = {selectedStateValue === "GA" ? true:false}
              sort= {false}

            />
            <DropdownPresentation
                heading=""
                selectedOption={selectedCounty}
                handleSelect={handleCountyChange}
                options={countyList}                
                placeholder="Filter by county"
            />
             <DropdownPresentation
                heading={""}
                selectedOption={selectedCourt}
                handleSelect={handleCourtChange}
                options={courtList}
                placeholder="Filter by Court"
                isVisible = {selectedStateValue === "TX" ? true:false}
            />
            <DropdownPresentation
                heading={""}
                selectedOption={selectedFiling}
                handleSelect={(event) => handleFilingChange(event)}
                options={FilingType}
                placeholder="Filter by EvictionType"
                isVisible = {selectedStateValue === "GA" ? true:false}
            />           
            <ClearFilters
                type="button"
                isRounded={false}
                title="Clear Filters"
                handleClick={clearSearchFilters}
                icon={<FaTimes />}
            />
        </div>
        : <></>}
        </>
    );
};

export default AllCases_SearchFilters;