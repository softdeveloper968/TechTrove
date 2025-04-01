import React, { SetStateAction, useEffect, useRef, useState } from "react";
import { HttpStatusCode } from "axios";
import { FaEye, FaUserEdit } from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import { toast } from "react-toastify";
import { ReactComponent as MyIcon } from "../../../assets/images/resendEmail.svg";
import Grid from "components/common/grid/GridWithToolTip";
import GridCheckbox from "components/formik/GridCheckBox";
import Spinner from "components/common/spinner/Spinner";
import Pagination from "components/common/pagination/Pagination";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import InviteUsers from "../components/InviteUser";
import Tooltip from "../../../components/common/tooltip/Tooltip";
import { IUserItems, IUsers } from "interfaces/all-users.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { ICourtDropdownList } from "interfaces/court.interface";
import { ICommonSelectOptions } from "interfaces/common.interface";
import AllUsersService from "services/all-users.service";
import CourtService from "services/court.service";
import { useUserContext } from "../UserContext";
import { useAuth } from "context/AuthContext";
import { UserRole } from "utils/enum";
import { getUserInfoFromToken, toCssClassName } from "utils/helper";
import IconButton from "components/common/button/IconButton";
import { IPropertyItems } from "interfaces/user.interface";

type UsersGridProps = {};

// React functional component 'UsersGrid' with a generic type 'IUser'
const UsersGrid = (props: UsersGridProps) => {
   const { userRole,selectedStateValue } = useAuth();
   const [showConfirm, setShowConfirm] = useState<boolean>(false);
   const isMounted = useRef(true);
   const [showInviteUserModal, setShowInviteUserModal] = useState<Boolean>(false);
   const {
      users,      
      getListOfUsers,
      editUser,
      setEditUser,
      getAllCourt,
      getAllCounty,
      setUserList,
      getAllCompanies,
      showSpinner,
      allCompanies,
      // fetchPermittedStates,
      // fetchCompanyProperties,
   } = useUserContext();

   const initialColumnMapping: IGridHeader[] = [
      { columnName: "action", label: "Action", className: "action" },
      ...(selectedStateValue=="NV" || userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)) ? [{columnName:"userReferenceId",label:"UserReferenceId", className:'text-right'}] : [],
      { columnName: "name", label: "Name"},
      { columnName: "email", label: "Email" },
      { columnName: "phoneNumber", label: "Phone" },
      { columnName: "role", label: "Role" },
      ...(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin) ? [{ columnName: "companyName", label: "CompanyName",isSort:true }] : []),
      { columnName: "isActive", label: "Active" }
   ];
   const [showDetails, setShowDetails] = useState<boolean>(false);
   const [showForUser, setShowForUser] = useState<string>("");
   const [allUsersRecords, setAllUsersRecords] = useState<IUserItems[]>([]);
   // const [userList, setUserListData] = useState<IUsers>(users);
   const [currentUpdatedPage, setcurrentUpdatedPage] = useState<number>(0);
   const [propertyInfo, setPropertyInfo] = useState<string>("");
   // State variables for pagination for next and previous button
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
      users.currentPage > 1
   );
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
      users.totalPages > 1
   );
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
      Array(users.items?.length).fill(false)
   );
   const [checkActive, setCheckActive] = useState<boolean>(false);

   const [visibleColumns] = useState<IGridHeader[]>(
      initialColumnMapping
   );

   const [courtOptions, setCourtOptions] = useState<ICommonSelectOptions[]>([]);
   useEffect(() => {
      
      if (isMounted.current) {
         getListOfUsers(1, 100, "");
         getAllCounty();
         getAllCourt();
         isMounted.current = false;
      }
   }, []);

   useEffect(() => {    
      if(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)){
         var list = allCompanies.map((item) => ({
            id: item.id,
            value: item.companyName
         }));  
        // fetchPermittedStates(list[0].id);
         //fetchCompanyProperties(list[0].id);
      }
      else{
         const userInfo = getUserInfoFromToken();
         //fetchPermittedStates(userInfo?.ClientID??"");
         //fetchCompanyProperties(userInfo?.ClientID??"");
      }     
   }, [allCompanies]);

   useEffect(() => {
      
      //setUserListData(users)
      setCanPaginateBack(users.currentPage > 1);
      setCanPaginateFront(users.totalPages > 1);
      setcurrentUpdatedPage(users.currentPage);

   }, [users]);

   const handleConfirmation = async () => {
      await AllUsersService.editUser(editUser.id,
         editUser
      )
      // Update the 'isActive' property of the user at the specified index
      editUser.isActive ? toast.success("User Activated Successfully") : toast.success("User Deactivated Successfully");
      setEditUser({} as SetStateAction<IUserItems>)
      getListOfUsers(1, 100);
      setShowConfirm(false);
      // Update the state with the modified user list
   };

   const handleCheckBoxChange = (index: number, checked: boolean) => {
      const updatedUserList = [...users.items];
      updatedUserList[index].isActive = checked;
      setEditUser(updatedUserList[index]);
      setCheckActive(checked)
      setShowConfirm(true);
   };

   const handleEditUser = async (id: string | undefined) => {      
      let data = users.items.find((item) => item.id === id);     
      if (data) {
         //fetchCompanyProperties(data?.userCompanyId??"");
         await setCourtDropdownValues('GA');
         setEditUser(data);
         setShowInviteUserModal(true);
      }
   };

   const handleShowLink = async (id: string | undefined) => {
      let data = users.items.find((item) => item.id === id);
      if (data)
         console.log(data);
      const response = await AllUsersService.resendLink(data?.id);
      if (response.status === HttpStatusCode.Ok) {
         if (response.data.isSuccess == true) {
            toast.success(response.data.message);
         }
         else {
            toast.error(response.data.message);
         }
      }
      else {
         toast.error(response.data.message);
      }
   };

   const handleCellRendered = (
      cellIndex: number,
      data: IUserItems,
      rowIndex: number
   ) => {
      
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         action: () => renderActionCell(data),
         name: () => formattedFullNameCell(data),
         email: () => <span><HighlightedText text={cellValue} query={users.searchParam ?? ""} /></span>,
         companyName: () => (
            <div>
               {data && data.userCompany && data.userCompany.companyName ? (
                  <HighlightedText text={data.userCompany.companyName} query={users.searchParam ?? ""} />
               ) : (
                  <></>
               )}
            </div>
         ),
         isActive: () => formattedActiveCell(cellValue, rowIndex)
      };

      const renderer =
         renderers[propertyName] || (() => formattedCell(cellValue));

      if (visibleColumns.find(x => x.label === columnName)) {

         return (
            <td
               key={cellIndex}
               className={`px-1.5 py-2 md:py-2.5 font-normal text-[10.3px] md:text-[11px] text-[#2a2929]  ${toCssClassName(columnName)}`}
            >
               {renderer()}
            </td>
         );
      }

      return <></>;
   };

   const formattedFullNameCell = (data: IUserItems) => (
      <span>
         <HighlightedText text={`${data.firstName} ${data.lastName}`} query={users.searchParam ?? ""} />
      </span>
   );

   const formattedActiveCell = (cellValue: any, rowIndex: number) => (
      <GridCheckbox
         checked={cellValue}
         onChange={(checked: boolean) =>
            handleCheckBoxChange(rowIndex, checked)
         }
         label=""
      />
   );

   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );
   const handleShowDetails = async(id: string) => {
      const response = await AllUsersService.fetchUserProperties(id);
      if (response.status === HttpStatusCode.Ok) {
         
         if(response.data.length>0){         
            const formattedProperties = response.data
                .map((item:IPropertyItems) => {
                    return `<span class="font-medium mr-1">${item.propertyCode}</span>(${item.propertyName})`;
                })
                .join(", ");
            setPropertyInfo(formattedProperties);
         }else{
            setPropertyInfo("There are no properties assigned to this user.");
         }
         
      }
     
      setShowDetails(true);
   };
   const renderActionCell = (data: IUserItems) => (
      <div className="flex items-center gap-1 !justify-start">
         {(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin) || userRole.includes(UserRole.Admin)) && !data.isPasswordSet && (
            <Tooltip
               id="test"
               content={"Resend email"}
               children={
                  <MyIcon
                     className="text-blue-600 ml-1 h-4 w-4"
                     onClick={() => handleShowLink(data.id)}
                  />
               }
            />
         )}
         <FaUserEdit className="mx-0.5"
            style={{
               height: 17,
               width: 20,
               color: "#2472db",
               cursor: "pointer",
            }}
            onClick={() => handleEditUser(data.id)}
         />
         {
            data.userCompany?.isPropertySpecific && <IconButton
            type={"button"}
            className="cursor-pointer text-[#2472db]"
            disabled={false}
            icon={<FaEye className="h-4 w-4" />}
            handleClick={() => {setShowForUser(data.firstName+""+data.lastName);handleShowDetails(data.id??"");}}
         />
         }
          
      </div>
   );

   const handleAddNewUser = async () => {
      setEditUser({} as SetStateAction<IUserItems>);
      getAllCompanies();
      await setCourtDropdownValues('GA');
      setShowInviteUserModal(true);
   };

   const getCourtDropdownValues = async (state: string) => {
      const apiResponse = await CourtService.getCourtsByState(state);
      if (apiResponse.status === HttpStatusCode.Ok) {
         return apiResponse.data as ICourtDropdownList[];
      }
      else
         return [];
   }

   const setCourtDropdownValues = async (state: string) => {
      try {
         const data = await getCourtDropdownValues(state);
         let courtOptions = data.map((item) => ({
            id: item.code,
            value: item.name,
         }));
   
         // Remove any Cobb-related options
         courtOptions = courtOptions.filter(option => !option.value.toLowerCase().includes("cobb"));
         
         // Add the Magistrate Court option
         courtOptions = [{
            id: "Cobb County - Magistrate Court",
            value: "Cobb County - Magistrate Court"
         }, ...courtOptions];
   
         // Sort the court options alphabetically by name
         courtOptions.sort((a, b) => a.value.localeCompare(b.value));
         
         // Update state with sorted court options
         setCourtOptions(courtOptions);
      } catch (error) {
         console.error("Error setting court dropdown values:", error);
      }
   };
   

   const handleFrontButton = () => {
      if (users.currentPage < users.totalPages) {
         const updatedCurrentPage = users.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getListOfUsers(
            updatedCurrentPage,
            users.pageSize,
            users.searchParam
         );
         setcurrentUpdatedPage(users.currentPage);
      }
   };

   const handleBackButton = () => {
      if (
         users.currentPage > 1 &&
         users.currentPage <= users.totalPages
      ) {
         const updatedCurrentPage = users.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(users.currentPage > 1);
         // back button get late notices
         getListOfUsers(
            updatedCurrentPage,
            users.pageSize,
            users.searchParam
         );
         setcurrentUpdatedPage(users.currentPage);
      }
   };
   const handleSorting = (columnName: string, order: string) => {  
      // Copy the current user list to avoid mutating the state directly
      const sortedRecords = [...users.items];
   
      // Define a compare function based on the column name and order
      const compare = (a: any, b: any) => {
         // Extract values for comparison, specifically for the nested company name
         const aValue = a.userCompany?.companyName?.toLowerCase() || '';
         const bValue = b.userCompany?.companyName?.toLowerCase() || '';
   
         // Implement sorting logic based on the order (ascending or descending)
         if (order === 'asc') {
            return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
         } else {
            return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
         }
      };
   
      // Sort the records array using the compare function
      sortedRecords.sort(compare);
   
      // Update the state with the sorted records
      setUserList((prev) => ({
         ...prev,
         items: sortedRecords
      }));
   };
   

   return (
      <>
         <div className="mt-2">
            {showInviteUserModal && (
               <InviteUsers
                  courtOptions={courtOptions}
                  showInviteUserModal={showInviteUserModal}
                  handleModalClose={()=>setShowInviteUserModal(false)}
                  handleInviteUserModal={(value: boolean) => {
                     setShowInviteUserModal(value);
                     (Object.keys(editUser).length !== 0) ?
                     getListOfUsers(
                        currentUpdatedPage,
                        users.pageSize,
                        users.searchParam
                     ) : getListOfUsers(
                        1,
                        100,
                        users.searchParam
                     );
                  }}
               ></InviteUsers>
            )}
         </div>
         <div className="mt-2.5">
            <div className="text-end mb-2">
               {/* <User_SearchBar/> */}
               <Button
                  title={"Add New User"}
                  classes={
                     "bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 py-1.5 font-medium text-[11px] text-white rounded-md shadow-lg inline-flex items-center font-semibold"
                  }
                  type={"button"}
                  isRounded={false}
                  icon={<FaPlus className="fa-solid fa-plus  mr-1 text-xs" />}
                  key={0}
                  handleClick={() => handleAddNewUser()}
               ></Button>
            </div>
            <div className="relative -mr-0.5">
               {/* Render the Grid component with column headings and grid data */}
               {showSpinner ? (
                  <Spinner />
               ) : (
                  <>
                     <Grid
                        columnHeading={visibleColumns}
                        rows={users.items}
                        //   handleSelectAllChange={handleSelectAllChange}
                        //   selectAll={selectAll}
                        cellRenderer={(
                           data: IUserItems,
                           rowIndex: number,
                           cellIndex: number
                        ) => {
                           return handleCellRendered(cellIndex, data, rowIndex);
                        }}
                        handleSorting={handleSorting}
                     />
                     {/* Render the Pagination component with relevant props */}
                     <Pagination
                        numberOfItemsPerPage={users.pageSize}
                        currentPage={users.currentPage}
                        totalPages={users.totalPages}
                        totalRecords={users.totalCount}
                        handleFrontButton={handleFrontButton}
                        handleBackButton={handleBackButton}
                        canPaginateBack={canPaginateBack}
                        canPaginateFront={canPaginateFront}
                     />
                  </>
               )}
            </div>
         </div>
         <div>
            <Modal
               showModal={showConfirm}
               onClose={() => { getListOfUsers(1, 100); setShowConfirm(false); }}
               width="max-w-md"
            >
               {showSpinner && <Spinner />}
               {/* Container for the content */}
               <div id="fullPageContent">
                  <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                     <div className="text-center pr-4 sm:text-left">
                        <h3
                           className="text-sm font-semibold leading-5 text-gray-900"
                           id="modal-title"
                        >
                           Are you sure you want to {checkActive ? "activate " : "deactivate"} the user?
                        </h3>
                     </div>
                  </div>
                  <div className="flex justify-end m-2">
                     <Button
                        type="button"
                        isRounded={false}
                        title="No"
                        handleClick={() => { getListOfUsers(1, 100); setShowConfirm(false); }}
                        classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg "
                     ></Button>
                     <Button
                        handleClick={handleConfirmation}
                        title="Yes"
                        isRounded={false}
                        type={"button"}
                        classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                     ></Button>
                  </div>
               </div>
            </Modal>
         </div>
         {showDetails && 
         <>
         <Modal
               showModal={showDetails}
               onClose={() => setShowDetails(false)}
               width="max-w-3xl"
         >
               <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
                  <div className="sm:flex sm:items-start">
                     <div className="text-center sm:text-left">
                        <h3 className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5" id="modal-title">Properties Assigned to <span className="font-semibold">{showForUser}</span></h3>
                     </div>
                  </div>
                  <div className="border border-gray-200 rounded-md py-3 px-3.5 text-sm mt-2 leading-6 min-h-24">
                     <div dangerouslySetInnerHTML={{ __html: propertyInfo }} />                     
                  </div>
               </div>
            </Modal>
         
         </>}
      </>
   );
};

// Export the component as the default export
export default UsersGrid;
