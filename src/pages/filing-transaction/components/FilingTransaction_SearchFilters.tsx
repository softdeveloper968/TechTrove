import React from "react";
import { ChangeEvent, useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import { FaTimes } from "react-icons/fa";
import { ISelectOptions } from "interfaces/all-cases.interface";
import arrow from "assets/images/select_arrow.png";
import DropdownPresentation from "components/common/dropdown/DropDown";
import ClearFilters from "components/common/button/ClearFilters";
import { useFilingTransactionContext } from "../FilingTransactionContext";
import { OperationTypeEnum } from "utils/enum";
import { FilingBlankTypeList, StatusList } from "utils/constants";
import { MultiSelect } from 'primereact/multiselect';
import { string } from "yup";
import { useAuth } from "context/AuthContext";

const initialSelectOption: ISelectOptions = { id: '', value: '' };

type FilingTransaction_SearchBarProps = {
   activeTab?: string;
};
const FilingTransaction_SearchFilters = (props: FilingTransaction_SearchBarProps) => {
   const [selectedCompany, setSelectedCompany] = useState<ISelectOptions>(initialSelectOption);
   const [companyList, setCompanyList] = useState<ISelectOptions[]>([]);
   const [typeList, setTypeList] = useState<ISelectOptions[]>([]);
   const [selectedCounty, setSelectedCounty] = useState<ISelectOptions>(initialSelectOption);
   const [selectedType, setSelectedType] = useState<ISelectOptions>(initialSelectOption);
   const [selectedBlankType, setSelectedBlankType] = useState<ISelectOptions[]>([]);
   const [selectedNonBlankType, setSelectedNonBlankType] = useState<ISelectOptions[]>([]);
   const [countyList,setCountyList]=useState<ISelectOptions[]>([]);

   const [payrollDate, setPayrollDate] = useState<[Date | null, Date | null]>([null, null])
   const [commissionDate, setCommissionDate] = useState<[Date | null, Date | null]>([null, null])
   const [searchParm, setSearchParm] = useState<string>("")
   const [blankType, setBlankType] = useState<string[]>([]);
   const [nonBlankType, setNonBlankType] = useState<string[]>([]);
   const [county, setCounty] = useState<string>("")
   const {selectedStateValue}=useAuth();

   const { filingTransactions, getFilingTransactions, setFilingTransactions, filingType,
      aosFilingTransactions, dismissalsFilingTransactions,writsFilingTransactions,amendmentsFilingTransactions,
      setAOSFilingTransactions,setDismissalsFilingTransactions,setWritsFilingTransactions,setAmendmentsFilingTransactions,
      setFilingType, allCompanies, companyId, setCompanyId,
      setShowSpinner,
      setSelectedFilingTransactionId, setBulkRecords,
      dateFiled, datePaid, setDateFiled, setDatePaid
      , getAccountingQueue, setAccountingQueue, accountingQueue, allCounties,
      setAOSBulkRecords,setDismissalBulkRecords,setWritBulkRecords,setAmendmentBulkRecords,setSelectedFilteredFilingTransactionId
    } = useFilingTransactionContext();

   useEffect(() => {
      switch(filingType){
         case "Eviction":
            setSearchParm(filingTransactions.searchParam ?? "");
            break;
         case "AOS":
            setSearchParm(aosFilingTransactions.searchParam ?? "");
            break;
         case "Dismissal":
            setSearchParm(dismissalsFilingTransactions.searchParam ?? "");
            break;
         case "Writ":
            setSearchParm(writsFilingTransactions.searchParam ?? "");
            break;
         case "Amendment":
            setSearchParm(amendmentsFilingTransactions.searchParam ?? "");
            break;
         default :
      }
      const typeList = Object.entries(OperationTypeEnum)
         .filter(([key, value]) => typeof value === 'number') // Keep only numeric values
         .map(([key, value]) => ({
            id: value, // Numeric value
            value: key // Enum name as string
         }));

      setTypeList(typeList);
   }, []);

   useEffect(()=>{
      var list = allCounties.filter(x=>x.stateName.trim().toLowerCase()==selectedStateValue.trim().toLowerCase()).map((item) => ({
         id: item.countyName,
         value: item.countyName
       })); 
        setCountyList(list);
      },[allCounties]);
   useEffect(() => {
      var companyList = allCompanies.map((item) => ({
         id: item.id,
         value: item.companyName
      }));
      // var newList = companyList.filter((item) => item.value != "Super Company");
      const userInfo= JSON.parse(localStorage.getItem("userDetail")??"")
    const clientID = (`${userInfo?.ClientID}`).toLowerCase();
     var newList = companyList.filter((item) => item.id.toLowerCase() != clientID);

      setCompanyList(newList);
   }, [allCompanies]);
   useEffect(() => {
      setSelectedCompany(initialSelectOption);
         switch(filingType){
            case "Eviction":
               setSearchParm(filingTransactions.searchParam ?? "");
               break;
            case "AOS":
               setSearchParm(aosFilingTransactions.searchParam ?? "");
               break;
            case "Dismissal":
               setSearchParm(dismissalsFilingTransactions.searchParam ?? "");
               break;
            case "Writ":
               setSearchParm(writsFilingTransactions.searchParam ?? "");
               break;
            case "Amendment":
               setSearchParm(amendmentsFilingTransactions.searchParam ?? "");
               break;
            default :
         }
   }, [filingType]);

   useEffect(() => {
      setAccountingQueue((prevAll) => ({
         ...prevAll, fromDatePaid: null, toDatePaid: null, type: ''
         , fromDatePayroll: null, toDatePayroll: null, fromDateCommission: null, toDateCommission: null, blankOption: [], nonBlankOption: [] , county: ''
      }));
      setFilingTransactions((prevAll) => ({ ...prevAll, type: filingType, companyId: '', fromDate: null, toDate: null, datePaidFromDate: null, datePaidToDate: null, blankOption: [], nonBlankOption: [], county: '' }));
      setAOSFilingTransactions((prevAll) => ({ ...prevAll, type: filingType, companyId: '', fromDate: null, toDate: null, datePaidFromDate: null, datePaidToDate: null, blankOption: [], nonBlankOption: [], county: '' }));
      setDismissalsFilingTransactions((prevAll) => ({ ...prevAll, type: filingType, companyId: '', fromDate: null, toDate: null, datePaidFromDate: null, datePaidToDate: null, blankOption: [], nonBlankOption: [], county: '' }));
      setWritsFilingTransactions((prevAll) => ({ ...prevAll, type: filingType, companyId: '', fromDate: null, toDate: null, datePaidFromDate: null, datePaidToDate: null, blankOption: [], nonBlankOption: [], county: '' }));
      setAmendmentsFilingTransactions((prevAll) => ({ ...prevAll, type: filingType, companyId: '', fromDate: null, toDate: null, datePaidFromDate: null, datePaidToDate: null, blankOption: [], nonBlankOption: [], county: '' }));

      setCounty("");
      setSelectedType(initialSelectOption);
      setSelectedCounty(initialSelectOption);
      setCommissionDate([null, null]);
      setPayrollDate([null, null]);
      setSelectedBlankType([]);
      setSelectedNonBlankType([]);
      setBlankType([]);
      setNonBlankType([]);
   }, [props.activeTab]);

   const updateTask = (companyId?: string, fromDate?: Date | null,
      toDate?: Date | null , datePaidFromDate?: Date | null, datePaidToDate?: Date | null, blankOption?: string[], nonBlankOption?: string[], county?: string) => {
         var searchParam = "";
         switch(filingType){
            case "Eviction":
               setFilingTransactions(prevLogs => ({
                  ...prevLogs,
            companyId: companyId,
            fromDate: fromDate,
            toDate: toDate,
            datePaidFromDate: datePaidFromDate,
            datePaidToDate: datePaidToDate,
            blankOption: blankOption,
            nonBlankOption: nonBlankOption,
            county: county,
               }));
               searchParam = filingTransactions.searchParam ?? "";
               break;
               case "AOS":
               setAOSFilingTransactions(prevLogs => ({
                  ...prevLogs,
                  companyId: companyId,
            fromDate: fromDate,
            toDate: toDate,
            datePaidFromDate: datePaidFromDate,
            datePaidToDate: datePaidToDate,
            blankOption: blankOption,
            nonBlankOption: nonBlankOption,
            county: county,
               }));
               searchParam = aosFilingTransactions.searchParam ?? "";
               break;
               case "Dismissal":
               setDismissalsFilingTransactions(prevLogs => ({
                  ...prevLogs,
                  companyId: companyId,
            fromDate: fromDate,
            toDate: toDate,
            datePaidFromDate: datePaidFromDate,
            datePaidToDate: datePaidToDate,
            blankOption: blankOption,
            nonBlankOption: nonBlankOption,
            county: county,
               }));
               searchParam = dismissalsFilingTransactions.searchParam ?? "";
               break;
               case "Writ":
               setWritsFilingTransactions(prevLogs => ({
                  ...prevLogs,
                  companyId: companyId,
            fromDate: fromDate,
            toDate: toDate,
            datePaidFromDate: datePaidFromDate,
            datePaidToDate: datePaidToDate,
            blankOption: blankOption,
            nonBlankOption: nonBlankOption,
            county: county,
               }));
               searchParam = writsFilingTransactions.searchParam ?? "";
               break;
               case "Amendment":
               setAmendmentsFilingTransactions(prevLogs => ({
                  ...prevLogs,
                  companyId: companyId,
            fromDate: fromDate,
            toDate: toDate,
            datePaidFromDate: datePaidFromDate,
            datePaidToDate: datePaidToDate,
            blankOption: blankOption,
            nonBlankOption: nonBlankOption,
            county: county,
               }));
               searchParam = amendmentsFilingTransactions.searchParam ?? "";
               break;
         }
         getFilingTransactions(1, 100,searchParam, filingType, companyId, fromDate, toDate, datePaidFromDate, datePaidToDate, blankOption,nonBlankOption,county);
   };

   const getDataResponse = async (fromDate: Date | null, toDate: Date | null) => {
      setSelectedFilingTransactionId([]);
      setBulkRecords([]);
      setAOSBulkRecords([]);
      setDismissalBulkRecords([]);
      setWritBulkRecords([]);
      setAmendmentBulkRecords([]);
      setSelectedFilteredFilingTransactionId([]);
      if (fromDate && toDate) {
         // switch (filingType) {
         //    case "Eviction":
         //       setFilingTransactions((prevAll) => ({ ...prevAll, type: filingType, fromDate: fromDate, toDate: toDate }));
         //       break;
         //    case "AOS":
         //       setAOSFilingTransactions((prevAll) => ({ ...prevAll, type: filingType, fromDate: fromDate, toDate: toDate }));
         //       break;
         //    case "Dismissal":
         //       setDismissalsFilingTransactions((prevAll) => ({ ...prevAll, type: filingType, fromDate: fromDate, toDate: toDate }));
         //       break;
         //    case "Writ":
         //       setWritsFilingTransactions((prevAll) => ({ ...prevAll, type: filingType, fromDate: fromDate, toDate: toDate }));
         //       break;
         //    case "Amendment":
         //       setAmendmentsFilingTransactions((prevAll) => ({ ...prevAll, type: filingType, fromDate: fromDate, toDate: toDate }));
         //       break;
         //    default:
         // }
         updateTask(companyId, fromDate, toDate, datePaid[0], datePaid[1], blankType,nonBlankType,county);
         // getFilingTransactions(1, 100, searchParm, filingType, companyId, fromDate, toDate, datePaid[0], datePaid[1], filingTransactions.blankOption,filingTransactions.nonBlankOption,filingTransactions.county);
      }
      else if (fromDate == null && toDate == null) {
         // switch (filingType) {
         //    case "Eviction":
         //       setFilingTransactions((prevAll) => ({ ...prevAll, type: filingType, fromDate: null, toDate: null }));
         //       break;
         //    case "AOS":
         //       setAOSFilingTransactions((prevAll) => ({ ...prevAll, type: filingType, fromDate: null, toDate: null }));
         //       break;
         //    case "Dismissal":
         //       setDismissalsFilingTransactions((prevAll) => ({ ...prevAll, type: filingType, fromDate: null, toDate: null }));
         //       break;
         //    case "Writ":
         //       setWritsFilingTransactions((prevAll) => ({ ...prevAll, type: filingType, fromDate: null, toDate: null }));
         //       break;
         //    case "Amendment":
         //       setAmendmentsFilingTransactions((prevAll) => ({ ...prevAll, type: filingType, fromDate: null, toDate: null }));
         //       break;
         //    default:
         // }
         // getFilingTransactions(1, 100,searchParm, filingType, companyId, null, null, datePaid[0], datePaid[1], filingTransactions.blankOption,filingTransactions.nonBlankOption,filingTransactions.county);
         updateTask(companyId, null, null, datePaid[0], datePaid[1], blankType,nonBlankType,county);
         // setFilingTransactions((prevAll) => ({ ...prevAll, type: filingType, fromDate: null, toDate: null }));
      }
   };

   const getDatePaidDataResponse = async (fromDate: Date | null, toDate: Date | null) => {
      setSelectedFilingTransactionId([]);
      setBulkRecords([]);
      setAOSBulkRecords([]);
      setDismissalBulkRecords([]);
      setWritBulkRecords([]);
      setAmendmentBulkRecords([]);
      setSelectedFilteredFilingTransactionId([]);
      if (fromDate && toDate) {
         if (props.activeTab != "Accounting Queue") {
            // getFilingTransactions(1, 100, searchParm, filingType, companyId, dateFiled[0], dateFiled[1], fromDate, toDate, filingTransactions.blankOption,filingTransactions.nonBlankOption,filingTransactions.county);
            updateTask(companyId, dateFiled[0], dateFiled[1], fromDate, toDate, blankType,nonBlankType,county);
            // setFilingTransactions((prevAll) => ({ ...prevAll, type: filingType, datePaidFromDate: fromDate, datePaidToDate: toDate }));
         }
         else {
            getAccountingQueue(1, 100, accountingQueue.searchParam, fromDate, toDate, accountingQueue.type
               , accountingQueue.fromDatePayroll, accountingQueue.toDatePayroll, accountingQueue.fromDateCommission, accountingQueue.toDateCommission, accountingQueue.blankOption,accountingQueue.nonBlankOption,accountingQueue.county);
            setAccountingQueue((prevAll) => ({ ...prevAll, fromDatePaid: fromDate, toDatePaid: toDate }));
         }
      }
      else if (fromDate == null && toDate == null) {
         if (props.activeTab != "Accounting Queue") {
            // getFilingTransactions(1, 100, searchParm, filingType, companyId, dateFiled[0], dateFiled[1], null, null, filingTransactions.blankOption,filingTransactions.nonBlankOption,filingTransactions.county);
            updateTask(companyId, dateFiled[0], dateFiled[1], null, null, blankType,nonBlankType,county);
            // setFilingTransactions((prevAll) => ({ ...prevAll, type: filingType, datePaidFromDate: null, datePaidToDate: null }));
         }
         else {
            getAccountingQueue(1, 100, accountingQueue.searchParam, null, null, accountingQueue.type
               , accountingQueue.fromDatePayroll, accountingQueue.toDatePayroll, accountingQueue.fromDateCommission, accountingQueue.toDateCommission, accountingQueue.blankOption,accountingQueue.nonBlankOption,accountingQueue.county);
            setAccountingQueue((prevAll) => ({ ...prevAll, fromDatePaid: null, toDatePaid: null }));
         }
      }
      
   };

   const handleCountyChange = (event: ChangeEvent<HTMLSelectElement>) => {
      setSelectedFilingTransactionId([]);
      setBulkRecords([]);
      setAOSBulkRecords([]);
      setDismissalBulkRecords([]);
      setWritBulkRecords([]);
      setAmendmentBulkRecords([]);
      setSelectedFilteredFilingTransactionId([]);
      const county = event.target.value as string;
      setSelectedCounty({ id: county, value: county });
      setCounty(county);
      if (props.activeTab != "Accounting Queue") {
         updateTask(companyId, dateFiled[0], dateFiled[1], datePaid[0], datePaid[1], blankType,nonBlankType,county);
         // setFilingTransactions((prevAll) => ({ ...prevAll, county: county  }));
      }
      else {
         getAccountingQueue(1, 100, accountingQueue.searchParam, accountingQueue.fromDatePaid, accountingQueue.toDatePaid, accountingQueue.type
            , accountingQueue.fromDatePayroll, accountingQueue.toDatePayroll, accountingQueue.fromDateCommission, accountingQueue.toDateCommission, accountingQueue.blankOption,accountingQueue.nonBlankOption,county);
         setAccountingQueue((prevAll) => ({ ...prevAll, county: county }));
      }
  };

   const getPayrollDataResponse = async (fromDate: Date | null, toDate: Date | null) => {
      setSelectedFilingTransactionId([]);
      setBulkRecords([]);
      setAOSBulkRecords([]);
      setDismissalBulkRecords([]);
      setWritBulkRecords([]);
      setAmendmentBulkRecords([]);
      setSelectedFilteredFilingTransactionId([]);
      if (fromDate && toDate) {
         getAccountingQueue(1, 100, accountingQueue.searchParam
            , accountingQueue.fromDatePaid, accountingQueue.toDatePaid, accountingQueue.type, fromDate, toDate
            , accountingQueue.fromDateCommission, accountingQueue.toDateCommission, accountingQueue.blankOption,accountingQueue.nonBlankOption,accountingQueue.county);
         setAccountingQueue((prevAll) => ({ ...prevAll, fromDatePayroll: fromDate, toDatePayroll: toDate }));
      }
      else if (fromDate == null && toDate == null) {
         getAccountingQueue(1, 100, accountingQueue.searchParam
            , accountingQueue.fromDatePaid, accountingQueue.toDatePaid, accountingQueue.type, null, null
            , accountingQueue.fromDateCommission, accountingQueue.toDateCommission, accountingQueue.blankOption,accountingQueue.nonBlankOption,accountingQueue.county);
         setAccountingQueue((prevAll) => ({ ...prevAll, fromDatePayroll: null, toDatePayroll: null }));
      }
   };

   const getCommissionDateResponse = async (fromDate: Date | null, toDate: Date | null) => {
      setSelectedFilingTransactionId([]);
      setBulkRecords([]);
      setAOSBulkRecords([]);
      setDismissalBulkRecords([]);
      setWritBulkRecords([]);
      setAmendmentBulkRecords([]);
      setSelectedFilteredFilingTransactionId([]);
      if (fromDate && toDate) {
         getAccountingQueue(1, 100, accountingQueue.searchParam
            , accountingQueue.fromDatePaid, accountingQueue.toDatePaid, accountingQueue.type
            , accountingQueue.fromDatePayroll, accountingQueue.toDatePayroll, fromDate, toDate, accountingQueue.blankOption,accountingQueue.nonBlankOption,accountingQueue.county);
         setAccountingQueue((prevAll) => ({ ...prevAll, fromDateCommission: fromDate, toDateCommission: toDate }));
      }
      else if (fromDate == null && toDate == null) {
         getAccountingQueue(1, 100, accountingQueue.searchParam
            , accountingQueue.fromDatePaid, accountingQueue.toDatePaid, accountingQueue.type
            , accountingQueue.fromDatePayroll, accountingQueue.toDatePayroll, null, null, accountingQueue.blankOption,accountingQueue.nonBlankOption,accountingQueue.county);
         setAccountingQueue((prevAll) => ({ ...prevAll, fromDateCommission: null, toDateCommission: null }));
      }
   };

   const handleCompanyChange = async (event: ChangeEvent<HTMLSelectElement>) => {
      setSelectedFilingTransactionId([]);
      setBulkRecords([]);
      setAOSBulkRecords([]);
      setDismissalBulkRecords([]);
      setWritBulkRecords([]);
      setAmendmentBulkRecords([]);
      setSelectedFilteredFilingTransactionId([]);
      setSelectedFilingTransactionId([]);
      setBulkRecords([]);
      setSelectedCompany({ id: event.target.value, value: companyList.find(x => x.id === event.target.value)?.value || '' });
      setCompanyId(event.target.value);
      // getFilingTransactions(1, 100, searchParm, filingType, event.target.value, dateFiled[0], dateFiled[1], datePaid[0], datePaid[1], filingTransactions.blankOption,filingTransactions.nonBlankOption,filingTransactions.county);
      updateTask(event.target.value, dateFiled[0], dateFiled[1], datePaid[0], datePaid[1], blankType,nonBlankType,county);
      // setFilingTransactions((prevAll) => ({ ...prevAll, type: filingType, companyId: event.target.value }));
   };

   const handleBlankTypeChange = (selectedOptions: ISelectOptions[]) => {
      setSelectedFilingTransactionId([]);
      setBulkRecords([]);
      setAOSBulkRecords([]);
      setDismissalBulkRecords([]);
      setWritBulkRecords([]);
      setAmendmentBulkRecords([]);
      setSelectedFilteredFilingTransactionId([]);
      // Update the selected blank type with multiple values
      setSelectedBlankType(selectedOptions);
      const selectedValues = selectedOptions.map(option => option.value);

      const values = selectedOptions.join(",")
      const valuesList: string[] = values.split(',').map(value => value.trim());
      const selectedIds = FilingBlankTypeList
         .filter(item => selectedOptions.some(option => option.value === item.value)) // Check for matching values
         .map(item => item.id); // Extract the corresponding ids
         setBlankType(valuesList);
      if (props.activeTab != "Accounting Queue") {
         // Call the API or function with updated parameters
         // getFilingTransactions(1, 100, searchParm, filingType, filingTransactions.companyId, dateFiled[0], dateFiled[1], datePaid[0], datePaid[1], valuesList,filingTransactions.nonBlankOption,filingTransactions.county);
         updateTask(companyId, dateFiled[0], dateFiled[1], datePaid[0], datePaid[1], valuesList,nonBlankType,county);
         // setFilingTransactions((prevAll) => ({
         //    ...prevAll,
         //    blankOption: valuesList,
         // }));
      }
      else {
         getAccountingQueue(1, 100, accountingQueue.searchParam
            , accountingQueue.fromDatePaid, accountingQueue.toDatePaid, accountingQueue.type
            , accountingQueue.fromDatePayroll, accountingQueue.toDatePayroll
            , accountingQueue.fromDateCommission, accountingQueue.toDateCommission, valuesList,accountingQueue.nonBlankOption,accountingQueue.county);
         setAccountingQueue((prevAll) => ({ ...prevAll, blankOption: valuesList }));
      }
   };

   const handleNonBlankTypeChange = (selectedOptions: ISelectOptions[]) => {
      setSelectedFilingTransactionId([]);
      setBulkRecords([]);
      setAOSBulkRecords([]);
      setDismissalBulkRecords([]);
      setWritBulkRecords([]);
      setAmendmentBulkRecords([]);
      setSelectedFilteredFilingTransactionId([]);
      // Update the selected blank type with multiple values
      setSelectedNonBlankType(selectedOptions);
      const selectedValues = selectedOptions.map(option => option.value);

      const values = selectedOptions.join(",")
      const valuesList: string[] = values.split(',').map(value => value.trim());
      const selectedIds = FilingBlankTypeList
         .filter(item => selectedOptions.some(option => option.value === item.value)) // Check for matching values
         .map(item => item.id); // Extract the corresponding ids

      setNonBlankType(valuesList);

      if (props.activeTab != "Accounting Queue") {
         // Call the API or function with updated parameters
         // getFilingTransactions(1, 100,searchParm, filingType, filingTransactions.companyId, dateFiled[0], dateFiled[1], datePaid[0], datePaid[1], filingTransactions.blankOption,valuesList,filingTransactions.county);

         updateTask(companyId, dateFiled[0], dateFiled[1], datePaid[0], datePaid[1], blankType,valuesList,county);
         // setFilingTransactions((prevAll) => ({
         //    ...prevAll,
         //    nonBlankOption: valuesList
         // }));
      }
      else {
         getAccountingQueue(1, 100, accountingQueue.searchParam
            , accountingQueue.fromDatePaid, accountingQueue.toDatePaid, accountingQueue.type
            , accountingQueue.fromDatePayroll, accountingQueue.toDatePayroll
            , accountingQueue.fromDateCommission, accountingQueue.toDateCommission,accountingQueue.blankOption,valuesList ,accountingQueue.county);
         setAccountingQueue((prevAll) => ({ ...prevAll, nonBlankOption: valuesList}));
      }
   };

   const handleTypeChange = async (event: ChangeEvent<HTMLSelectElement>) => {
      setSelectedFilingTransactionId([]);
      setBulkRecords([]);
      setAOSBulkRecords([]);
      setDismissalBulkRecords([]);
      setWritBulkRecords([]);
      setAmendmentBulkRecords([]);
      setSelectedFilteredFilingTransactionId([]);
      const selectedId = Number(event.target.value); // Convert to number
      const selectedType = typeList.find(x => x.id === selectedId);

      setSelectedType({
         id: selectedId,
         value: selectedType?.value || ''
      });

      const value = selectedType?.value || '';
      getAccountingQueue(1, 100, accountingQueue.searchParam, accountingQueue.fromDatePaid, accountingQueue.toDatePaid
         , value, accountingQueue.fromDatePayroll, accountingQueue.toDatePayroll, accountingQueue.fromDateCommission, accountingQueue.toDateCommission, accountingQueue.blankOption,accountingQueue.nonBlankOption,accountingQueue.county);
      setAccountingQueue((prevAll) => ({ ...prevAll, type: value }));
   };

   const clearSearchFilters = () => {
      setSelectedFilingTransactionId([]);
      setBulkRecords([]);
      setAOSBulkRecords([]);
      setDismissalBulkRecords([]);
      setWritBulkRecords([]);
      setAmendmentBulkRecords([]);
      setSelectedFilteredFilingTransactionId([]);
      setSelectedCompany(initialSelectOption);
      setCompanyId("");
      setDateFiled([null, null]);
      setDatePaid([null, null]);
      setSelectedType(initialSelectOption);
      setSelectedCounty(initialSelectOption);
      setCommissionDate([null, null]);
      setPayrollDate([null, null]);
      setSelectedBlankType([]);
      setSelectedNonBlankType([]);
      setBlankType([]);
      setNonBlankType([]);
      setCounty("");
      if (props.activeTab !== "Accounting Queue") {
         getFilingTransactions(1, 100, "", filingType);
         setFilingTransactions((prevAll) => ({
            ...prevAll,
            searchParam: '',
            type: filingType,
            companyId: '',
            fromDate: null,
            toDate: null,
            datePaidFromDate: null,
            datePaidToDate: null,
            blankOption: [],
            nonBlankOption: [],
            county: '',
         }));
         setAOSFilingTransactions((prevAll) => ({
            ...prevAll,
            searchParam: '',
            type: filingType,
            companyId: '',
            fromDate: null,
            toDate: null,
            datePaidFromDate: null,
            datePaidToDate: null,
            blankOption: [],
            nonBlankOption: [],
            county: '',
         }));
         setDismissalsFilingTransactions((prevAll) => ({
            ...prevAll,
            searchParam: '',
            type: filingType,
            companyId: '',
            fromDate: null,
            toDate: null,
            datePaidFromDate: null,
            datePaidToDate: null,
            blankOption: [],
            nonBlankOption: [],
            county: '',
         }));
         setWritsFilingTransactions((prevAll) => ({
            ...prevAll,
            searchParam: '',
            type: filingType,
            companyId: '',
            fromDate: null,
            toDate: null,
            datePaidFromDate: null,
            datePaidToDate: null,
            blankOption: [],
            nonBlankOption: [],
            county: '',
         }));
         setAmendmentsFilingTransactions((prevAll) => ({
            ...prevAll,
            searchParam: '',
            type: filingType,
            companyId: '',
            fromDate: null,
            toDate: null,
            datePaidFromDate: null,
            datePaidToDate: null,
            blankOption: [],
            nonBlankOption: [],
            county: '',
         }));
      }
      else {
         getAccountingQueue(1, 100, '');
         setAccountingQueue((prevAll) => ({
            ...prevAll,
            searchParam: '',
            fromDatePaid: null,
            toDatePaid: null,
            type: '',
            fromDatePayroll: null,
            toDatePayroll: null,
            fromDateCommission: null,
            toDateCommission: null,
            blankOption: [],
            nonBlankOption: [],
            county: '',
         }));
      }
   };


   return (
      <>
         <div className="flex items-center filterSec">
         <DropdownPresentation
                heading=""
                selectedOption={selectedCounty}
                handleSelect={handleCountyChange}
                options={countyList}                
                placeholder="Filter by County"
            />
            {props.activeTab != "Accounting Queue" && <>
               <DropdownPresentation
                  heading=""
                  selectedOption={selectedCompany}
                  handleSelect={handleCompanyChange}
                  options={companyList}
                  placeholder="Select Company"
               />
               <div className="mr-1.5">
                  <DatePicker
                     className="bg-calendar peer !placeholder-gray-500 outline-none py-1.5 md:py-2 p-2.5 !pr-7 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_right_10px]"
                     selectsRange={true}
                     startDate={dateFiled[0]}
                     endDate={dateFiled[1]}
                     onChange={(update: [Date | null, Date | null]) => {
                        setSelectedFilingTransactionId([]);
                        setBulkRecords([]);
                        setDateFiled(update);
                        getDataResponse(update[0], update[1]);
                     }}
                     maxDate={new Date()}
                     placeholderText={"Select FiledDate"}
                  />
               </div>
            </>}
            <div className="mr-[0.375rem]">
               <DatePicker
                  className="bg-calendar peer !placeholder-gray-500 outline-none py-2 md:py-2.5 p-3 !pr-7 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_right_10px]"
                  selectsRange={true}
                  startDate={datePaid[0]}
                  endDate={datePaid[1]}
                  onChange={(update: [Date | null, Date | null]) => {
                     setSelectedFilingTransactionId([]);
                     setBulkRecords([]);
                     setDatePaid(update);
                     getDatePaidDataResponse(update[0], update[1]);
                  }}
                  maxDate={new Date()}
                  placeholderText={"Select DatePaid"}
               />
            </div>
            {props.activeTab == "Accounting Queue" &&
               <>
                  <DropdownPresentation
                     heading=""
                     selectedOption={selectedType}
                     handleSelect={handleTypeChange}
                     options={typeList}
                     placeholder="Select ActionType"
                  />
                  <div className="mr-[0.375rem]">
                     <DatePicker
                        className="bg-calendar peer !placeholder-gray-500 outline-none py-2 md:py-2.5 p-3 !pr-7 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_right_10px]"
                        selectsRange={true}
                        startDate={payrollDate[0]}
                        endDate={payrollDate[1]}
                        onChange={(update: [Date | null, Date | null]) => {
                           setPayrollDate(update);
                           getPayrollDataResponse(update[0], update[1]);
                        }}
                        maxDate={new Date()}
                        placeholderText={"Select PayrollDate"}
                     />
                  </div>
                  <div className="mr-[0.375rem]">
                     <DatePicker
                        className="bg-calendar peer !placeholder-gray-500 outline-none py-2 md:py-2.5 p-3 !pr-7 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_right_10px]"
                        selectsRange={true}
                        startDate={commissionDate[0]}
                        endDate={commissionDate[1]}
                        onChange={(update: [Date | null, Date | null]) => {
                           setCommissionDate(update);
                           getCommissionDateResponse(update[0], update[1]);
                        }}
                        maxDate={new Date()}
                        placeholderText={"Select CommissionDate"}
                     />
                  </div>
               </>}
            <MultiSelect
               value={selectedBlankType}
               options={props.activeTab === "Accounting Queue" ? FilingBlankTypeList : FilingBlankTypeList.filter(item => item.id === "DatePaid" || item.id === "InvoiceNo" || item.id === "OfficeCheckedDate")}
               optionLabel="value" // Assuming "value" is the display label of the options
               placeholder="Filter by Blanks"
               className="w-full md:w-[13rem] mr-[0.375rem]"
               display="chip" // To show selected options as chips
               onChange={(e) => handleBlankTypeChange(e.value)}  // Pass the new selected values
               selectAllLabel="Select All"
            />
            <MultiSelect
               value={selectedNonBlankType}
               options={props.activeTab === "Accounting Queue" ? FilingBlankTypeList : FilingBlankTypeList.filter(item => item.id === "DatePaid" || item.id === "InvoiceNo" || item.id === "OfficeCheckedDate")}
               optionLabel="value" // Assuming "value" is the display label of the options
               placeholder="Filter by Non Blanks"
               className="w-full md:w-[13rem] mr-[0.375rem]"
               display="chip" // To show selected options as chips
               onChange={(e) => handleNonBlankTypeChange(e.value)}  // Pass the new selected values
               selectAllLabel="Select All"
            />
            <ClearFilters
               type="button"
               isRounded={false}
               title="Clear Filters"
               handleClick={clearSearchFilters}
               icon={<FaTimes />}
            />
         </div>
      </>
   );
};

export default FilingTransaction_SearchFilters;