import React, { useState, useEffect } from "react";
import { ChangeEvent } from "react";
import { FaTimes } from "react-icons/fa";
import { ISelectOptions } from "interfaces/all-cases.interface";
import DropdownPresentation from "components/common/dropdown/DropDown";
import ClearFilters from "components/common/button/ClearFilters";
import { useEmailQueueContext } from "../EmailQueueContext";
import "react-datepicker/dist/react-datepicker.css";
import { CourtLists, ExpeditedLists, TaskStatusList } from "utils/constants";
import { useAuth } from "context/AuthContext";
import TylerService from "services/tyler.service";
import { HttpStatusCode } from "axios";
import { DataList } from "interfaces/tyler.interface";

const defaultPageSize = 300;
const initialSelectOption: ISelectOptions = { id: '', value: '' };

const EmailQueue_SearchFilters = () => {
    const [selectedCounty, setSelectedCounty] = useState<ISelectOptions>(initialSelectOption);
    const [selectedCompany, setSelectedCompany] = useState<ISelectOptions>(initialSelectOption);
    const [selectedServer, setSelectedServer] = useState<ISelectOptions>(initialSelectOption);
    const {
      getEmailQueues,
      emailQueues,
      setSelectedEmailQueueIds,
      allCompanies,
      servers,
      setEmailQueues,
      allCounties,
      setBulkRecords,
      setShowSpinner
    } = useEmailQueueContext(); 
    const {selectedStateValue}=useAuth();
    const [companyList,setCompanyList]=useState<ISelectOptions[]>([]); 
    const [serverList,setServerList]=useState<ISelectOptions[]>([]);   
    const [selectedExpedited, setSeletedExpedited] = useState<ISelectOptions>(initialSelectOption);
    const [selectedCourt, setSeletedCourt] = useState<ISelectOptions>(initialSelectOption);
    const [isStateCourt,setIsStateCourt]=useState<boolean>(false);
    const [countyList,setCountyList]=useState<ISelectOptions[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<ISelectOptions>(initialSelectOption);
    const [selectedTaskStatus, setSelectedTaskStatus] = useState<ISelectOptions>(initialSelectOption);
     const [courtList,setCourtList]=useState<ISelectOptions[]>([]);
    useEffect(()=>{
        
        var companyList = allCompanies.map((item) => ({
            id: item.id,
            value: item.companyName
          })); 
          setCompanyList(companyList);

        var serverList=servers.map((item)=>({
            id:item.email,
            value:item.email
        }));
        var sortedServerList = serverList.sort((a, b) => a.value.localeCompare(b.value));
        setServerList(sortedServerList);
    },[allCompanies,servers]);
    useEffect(()=>{
        
        if(selectedStateValue.toLowerCase()=="tx")
            handleSetCourtValues(selectedStateValue,false)
        else{
            const courtOptions = CourtLists.map((item: ISelectOptions) => {
                return {
                   id: item.id,
                   value: item.value
                } as ISelectOptions;
             });
             setCourtList(courtOptions);
        }
        var list = allCounties.filter(x=>x.stateName.trim().toLowerCase()==selectedStateValue.trim().toLowerCase()).map((item) => ({
            id: item.countyName,
            value: item.countyName
          })); 
          setCountyList(list);
    },[allCounties,selectedStateValue]);

    const updateEmailQueue = (companyId: string, county: string, serverId:string,isExpedited:number,isStateCourt:number,status:string,taskStatus:number,clearFilter: boolean,court:string) => {
        let search = clearFilter === true ? "" : emailQueues.searchParam;
        setEmailQueues(prev => ({
            ...prev,
            companyId,
            searchParam:search,
            county,
            serverId,
            isExpedited,
            isStateCourt,
            status,
            taskStatus,
            court
        }));
        if(selectedStateValue.toLowerCase().trim()=="tx")
            getEmailQueues(1, defaultPageSize, search,companyId ,county ,serverId,0,0,status,taskStatus,court);
        else
            getEmailQueues(1, defaultPageSize, search,companyId ,county ,serverId,isExpedited,isStateCourt,status,taskStatus,"");
    };

    const handleCountyChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const county = event.target.value as string;
        setSelectedCounty({ id: county, value: county });
        setSelectedEmailQueueIds([]);
        setBulkRecords([]);
        updateEmailQueue(selectedCompany.id as string,event.target.value as string,selectedServer.id as string,selectedExpedited.id? parseInt(selectedExpedited.id.toString(),10):0,selectedCourt.id? parseInt(selectedCourt.id.toString(),10):0,selectedStatus.id as string,selectedTaskStatus.id ? parseInt(selectedTaskStatus.id.toString(), 10) : 0,false,selectedCourt.value)

        //setAllCases((prevAllCases) => ({ ...prevAllCases, county: county }));
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
              var data = await getDropdownValues(state, "", "", "", fileIntoExistingCase,"");
              const courtOptions = data.map((item: DataList) => {
                 return {
                    id: item.name,
                    value: item.name
                 } as ISelectOptions;
              });
              setCourtList(courtOptions);
     
           } finally {
           }
     
        };
    const clearSearchFilters = () => {
        setSelectedCompany(initialSelectOption);
        setSelectedServer(initialSelectOption);
        setSelectedCounty(initialSelectOption);
        setSeletedExpedited(initialSelectOption);
        setSeletedCourt(initialSelectOption);
        setSelectedStatus(initialSelectOption);
        setSelectedTaskStatus(initialSelectOption);
       setSelectedEmailQueueIds([]);
       setBulkRecords([]);
        setIsStateCourt(false);
        updateEmailQueue("", "", "",0,0,"",0,true,"");
    };
   // const [selectedOption, setSelectedOption] = useState<ISearchSelectOptions|null>();

    const handleCompanyChange = (event: ChangeEvent<HTMLSelectElement>) => {  
        setSelectedEmailQueueIds([]);
        setBulkRecords([]);
        setSelectedCompany({ id: event.target.value, value: companyList.find(x => x.id === event.target.value)?.value || '' }); 
        updateEmailQueue(event.target.value,selectedCounty.id as string,selectedServer.id as string,selectedExpedited.id? parseInt(selectedExpedited.id.toString(),10):0,selectedCourt.id? parseInt(selectedCourt.id.toString(),10):0,selectedStatus.id as string,selectedTaskStatus.id ? parseInt(selectedTaskStatus.id.toString(), 10) : 0,false,selectedCourt.value);

    };
    const handleServerChange = (event: ChangeEvent<HTMLSelectElement>) => {  
        setSelectedEmailQueueIds([]);
        setBulkRecords([]);
        // setSelectedOption(null);
        setSelectedServer({ id: event.target.value, value: serverList.find(x => x.id === event.target.value)?.value || '' }); 
        updateEmailQueue(selectedCompany.id as string,selectedCounty.id as string,event.target.value,selectedExpedited.id? parseInt(selectedExpedited.id.toString(),10):0,selectedCourt.id? parseInt(selectedCourt.id.toString(),10):0,selectedStatus.id as string,selectedTaskStatus.id ? parseInt(selectedTaskStatus.id.toString(), 10) : 0,false,selectedCourt.value);       
    };

    const handleExpeditedChange = (event: ChangeEvent<HTMLSelectElement>) => {  
        setSelectedEmailQueueIds([]);
        setBulkRecords([]);
        const selectedExpeditedId = parseInt(event.target.value, 10) || 0;
        setSeletedExpedited({ id: selectedExpeditedId.toString(), value: ExpeditedLists.find(x => x.id === selectedExpeditedId)?.value || '' });
        updateEmailQueue(selectedCompany.id as string,selectedCounty.id as string,selectedServer.id as string,selectedExpeditedId,selectedCourt.id? parseInt(selectedCourt.id.toString(),10):0,selectedStatus.id as string,selectedTaskStatus.id ? parseInt(selectedTaskStatus.id.toString(), 10) : 0,false,selectedCourt.value);       
    };
    const handleCourtChange = (event: ChangeEvent<HTMLSelectElement>) => {  
        
        setSelectedEmailQueueIds([]);
        setBulkRecords([]);
        if(selectedStateValue.toLowerCase().trim()=="tx"){
            setSeletedCourt({ id: event.target.value, value: event.target.value });
            updateEmailQueue(selectedCompany.id as string,selectedCounty.id as string,selectedServer.id as string,selectedExpedited.id? parseInt(selectedExpedited.id.toString(),10):0,0,selectedStatus.id as string,selectedTaskStatus.id ? parseInt(selectedTaskStatus.id.toString(), 10) : 0,false,event.target.value);  
        }
        else{
            const selectedCourtId = parseInt(event.target.value, 10) || 0;
            setSeletedCourt({ id: selectedCourtId.toString(), value: ExpeditedLists.find(x => x.id === selectedCourtId)?.value || '' });
            updateEmailQueue(selectedCompany.id as string,selectedCounty.id as string,selectedServer.id as string,selectedExpedited.id? parseInt(selectedExpedited.id.toString(),10):0,selectedCourtId,selectedStatus.id as string,selectedTaskStatus.id ? parseInt(selectedTaskStatus.id.toString(), 10) : 0,false,"");  
        }
        
             
    };
    const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
        
        const status = event.target.value as string;        
        setSelectedEmailQueueIds([]);
        setBulkRecords([]);
        setSelectedStatus({ id: status, value: status });
        updateEmailQueue(selectedCompany.id as string,selectedCounty.id as string,selectedServer.id as string,selectedExpedited.id? parseInt(selectedExpedited.id.toString(),10):0,selectedCourt.id? parseInt(selectedCourt.id.toString(),10):0,status,selectedTaskStatus.id ? parseInt(selectedTaskStatus.id.toString(), 10) : 0,false,selectedCourt.value);   
    };
    const handleTaskStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {   
        setSelectedEmailQueueIds([]);
        const selectedTaskStatusId = parseInt(event.target.value, 10) || 0;
        setSelectedTaskStatus({ id: selectedTaskStatusId.toString(), value: TaskStatusList.find(x => x.id === selectedTaskStatusId)?.value || '' });
        updateEmailQueue(selectedCompany.id as string,selectedCounty.id as string,selectedServer.id as string,selectedExpedited.id? parseInt(selectedExpedited.id.toString(),10):0,selectedCourt.id? parseInt(selectedCourt.id.toString(),10):0,selectedStatus.id as string,selectedTaskStatusId,false,selectedCourt.value);   
    };
    return (
        <div className="flex items-end filterSec logsFilter"> 
        <div>
            {selectedStateValue!="TX" && <DropdownPresentation
                heading={""}
                selectedOption={selectedStatus}
                handleSelect={(event) => handleStatusChange(event)}
                options={[
                    { id: "Submitted", value: "Submitted" },
                    { id: "Amended", value: "Amended" }
                 ]}
                placeholder="Filter by status"
            />}
        </div>
        <div>
        <DropdownPresentation
                heading=""
                selectedOption={selectedTaskStatus}
                handleSelect={handleTaskStatusChange}
                options={TaskStatusList}                
                placeholder="Filter by TaskStatus"
            />
        </div>
        <div className="relative ">             
        <DropdownPresentation
                heading=""
                selectedOption={selectedCompany}
                handleSelect={handleCompanyChange}
                options={companyList}                
                placeholder="Select Company"
            />
        </div>
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
                    selectedOption={selectedServer}
                    handleSelect={(event) => handleServerChange(event)}
                    options={serverList}
                    placeholder="Select Server"
                />
            </div>
            <div className="relative ">
                {selectedStateValue!="TX" && <DropdownPresentation
                heading=""
                selectedOption={selectedExpedited}
                handleSelect={handleExpeditedChange}
                options={ExpeditedLists}                
                placeholder="Select Expedited"
            />}
        
        </div>
        <div className="relative ">
        <DropdownPresentation
                heading=""
                selectedOption={selectedCourt}
                handleSelect={handleCourtChange}
                options={selectedStateValue.toLowerCase()=="tx"?courtList: CourtLists}                
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

export default EmailQueue_SearchFilters;
