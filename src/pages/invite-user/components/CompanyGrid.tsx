import React from "react";
import { useEffect, useRef, useState, SetStateAction } from "react";
import {
  FaUserEdit
} from "react-icons/fa";
import { FaPlus } from "react-icons/fa";
import Grid from "components/common/grid/GridWithToolTip";
import Spinner from "components/common/spinner/Spinner";
import Pagination from "components/common/pagination/Pagination";
import Company from "../components/Company";
import Button from "components/common/button/Button";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import { ICompanyItems, ICompany } from "interfaces/all-users.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { useUserContext } from "../UserContext";
import { toCssClassName } from "utils/helper";

// Define the props interface with a  type 'IFileEvictions'
type CompanyGridProps = {};
const initialColumnMapping:IGridHeader[] = [
  {columnName:"action",label:"Action", className: "action" },
 // {columnName:"id",label:"Id"},
  {columnName:"companyName",label:"Company"},
  {columnName:"phone",label:"Phone"},
  {columnName:"clientType",label:"Company Type"},
  {columnName:"addressLine1",label:"Address"},
  {columnName:"addressLine2",label:"Address Line2"},
  {columnName:"email",label:"Email"},
  {columnName:"notes",label:"Notes"},
  // Company: "companyName",
  // Phone: "phone",
  // "Company Type": "clientType",
  // "Address": "addressLine1",
  // "Alternative Address": "addressLine2",
  // // City:"city",
  // // State:"state",
  // // Zip: "postalCode",
  // Email: "email",
  // Notes: "notes",
  // Actions: "action",
];
// React functional component 'CompanyGrid' with a generic type 'ICompany'
const CompanyGrid = (props: CompanyGridProps) => {
  // show add company modal
  const [showCompanyModal, setShowCompanyModal] =
    useState<Boolean>(false);
    const isMounted = useRef(true);
  const {
    companies,
    getListOfCompany,
    getAllCompanies,
    editCompany,
    setEditCompany,
    // setUserList,
    showSpinner,
    getAllTylerUsers,
    getAllCasperUsers
  } = useUserContext();
  const [allCompanyRecords, setAllCompanyRecords] = useState<ICompanyItems[]>([]);
  const [companyList, setCompanyList] = useState<ICompany>(companies);
  const [currentUpdatedPage, setcurrentUpdatedPage] = useState<number>(0);
  // State variables for pagination for next and previous button
  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
    companyList.currentPage > 1
  );
  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
    companyList.totalPages > 1
  );
  const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
    Array(companyList.items?.length).fill(false)
  );

  const [visibleColumns] = useState<IGridHeader[]>(
    initialColumnMapping
  );
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
  const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
  const [scrolledRows, setScrolledRows] = useState<number>(0);
  useEffect(() => {
    if (isMounted.current) {
      getListOfCompany(1, 100, "");
    getAllTylerUsers();
    getAllCasperUsers();
       isMounted.current = false;
    }
      getAllCompanies();
 }, []);
  useEffect(() => {
    setCompanyList(companies);
    setCanPaginateBack(companies.currentPage > 1);
    setCanPaginateFront(companies.totalPages > 1);
    setcurrentUpdatedPage(companies.currentPage);
    // //getListOfUsers();
    // const allCompanies = companies.items.map((item: any) => {
    //   return {      
    //     ...item, // Spread existing properties
    //   };
    // });
    // setAllCompanyRecords(allCompanies);
  }, [companies]);


  // const getListOfUsers = async () => {
  //   try {
  //     const response = await AllUsersService.getAllUser( 1,
  //       100,
  //       "");
  //     if (response.status === HttpStatusCode.Ok) {
  //       setShowSpinner(false);
  //       setUserList({
  //         ...userList,
  //         items: response.data.items,
  //       });
  //     }
  //   } catch (error) {
  //     setShowSpinner(true);
  //   }
  // };
  // useEffect to update pagination and grid data when 'rows' or 'numberOfItemsPerPage' changes
  //     useEffect(() => {
  //       const userListRecords = userList.items.map((item: any) => {
  //         return {
  //           isChecked: false, // Add the new property
  //           ...item, // Spread existing properties
  //         };
  //       });
  //       setUserList({...userList,items:userListRecords});
  //     //   // Enable/disable pagination buttons based on the number of total pages
  //     //   setCanPaginateBack(fileEvictions.currentPage > 1);
  //     //   setCanPaginateFront(fileEvictions.totalPages > 1);
  //     //   setSelectedRows(Array(fileEvictions.items?.length).fill(false));

  //       const handleKeyDown = (e: KeyboardEvent) => {
  //         if (e.key === "Shift") {
  //           setShiftKeyPressed(true);
  //         }
  //       };

  //       const handleKeyUp = (e: KeyboardEvent) => {
  //         if (e.key === "Shift") {
  //           // Reset selected rows to the top (index 0)
  //           setShiftKeyPressed(false);
  //         }
  //       };

  //       window.addEventListener("keydown", handleKeyDown);
  //       window.addEventListener("keyup", handleKeyUp);

  //       return () => {
  //         window.removeEventListener("keydown", handleKeyDown);
  //         window.removeEventListener("keyup", handleKeyUp);
  //       };
  //     }, [fileEvictions]);

  //   Event handler for the 'Back' button
  const handleBackButton = () => {
    if (
      companyList.currentPage > 1 &&
      companyList.currentPage <= companyList.totalPages
    ) {
      const updatedCurrentPage = companyList.currentPage - 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(companyList.currentPage > 1);
      // back button get late notices
      getListOfCompany(
        updatedCurrentPage,
        companyList.pageSize,
        companies.searchParam
      );
      setcurrentUpdatedPage(companies.currentPage);
    }
  };

  //     // // Event handler for the 'Next' button
  const handleFrontButton = () => {
    if (companyList.currentPage < companyList.totalPages) {
      const updatedCurrentPage = companyList.currentPage + 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(updatedCurrentPage > 1);
      // back button get late notices
      getListOfCompany(
        updatedCurrentPage,
        companyList.pageSize,
        companies.searchParam
      );
      setcurrentUpdatedPage(companies.currentPage);
    }
  };

  //   const handleCheckBoxChange = (index: number, checked: boolean) => {
  //     // Clone the current user list
  //     const updatedUserList = [...userList.items];
  //     // Update the 'isActive' property of the user at the specified index
  //     updatedUserList[index].isActive = checked;
  //     // Update the state with the modified user list
  //     setUserList({
  //       ...userList,
  //       items: updatedUserList,
  //     });
  //   };

  const handleEditComapny = (id: string | undefined) => {

    let data = companyList.items.find((item) => item.id === id);
    if (data)
      setEditCompany(data);
    setShowCompanyModal(true);
  }

  const formattedAddressCell = (value: ICompanyItems) => (
    <span>{value != null ? `${value.addressLine1 == null ? "" : `(${value.addressLine1})`}${value.city == null ? "" : `(${value.city})`}${value.state == null ? "" : `(${value.state})`}${value.postalCode == null ? "" : `(${value.postalCode})`}` : ""}</span>
  );
  const handleCellRendered = (
    cellIndex: number,
    data: ICompanyItems,
    rowIndex: number
  ) => {
    const columnName = visibleColumns[cellIndex]?.label;
    const propertyName = visibleColumns[cellIndex]?.columnName;
    const cellValue = (data as any)[propertyName];
    const renderers: Record<string, () => JSX.Element> = {
        // name: () => formattedCell(data),
      //   email: () => formattedCell(cellValue),
      //isActive: () => formattedActiveCell(cellValue),
      //   isActive: () => (
      //     <GridCheckbox
      //       checked={cellValue}
      //       onChange={(checked: boolean) =>
      //         handleCheckBoxChange(rowIndex, checked)
      //       }
      //       label=""
      //     />
      //   ),
      companyName:()=> <HighlightedText text={`${cellValue ?? ''} `} query={ companies.searchParam?? ''} />,
      email:()=><HighlightedText text={`${cellValue ?? ''} `} query={ companies.searchParam?? ''} />,
      addressLine2:()=><HighlightedText text={`${cellValue ?? ''} `} query={ companies.searchParam?? ''} />,
      addressLine1: () => (
        <span>
          <HighlightedText text={`${data.addressLine1 ?? ''} ${data.city ?? ''} ${data.state  ?? ''} ${data.postalCode ?? ''}`} query={ companies.searchParam?? ''} />
         
        </span>
      ),
      //  addressLine1: () => formattedAddressCell(data),
      action: () => (
        <>
          <div className="flex">
            <FaUserEdit style={{
              height: 20,
              width: 20,
              color: "#2472db",
              paddingRight: 2,
              cursor: "pointer",
            }} onClick={() => handleEditComapny(data.id)} />
            {/* <FaTrash
                style={{
                  height: 20,
                  width: 20,
                  color: "#2472db",
                }}
                // onClick={() => handleCrossClick(rowIndex)}
              ></FaTrash> */}
          </div></>
      ),
    };

    const renderer =
      renderers[propertyName] || (() => formattedCell(cellValue));

      if (visibleColumns.find(x=>x.label===columnName)){
        
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

  //   const formattedFullNameCell = (data: ICompanyItems) => (
  //     <span>{`${data.firstName} ${data.lastName}`}</span>
  //   );
  //   const formattedActiveCell = (cellValue: boolean) => {
  //     return <span>{`${cellValue}`}</span>;
  //   };
  const formattedCell = (value: any) => (
    <span>{value !== null ? value : ""}</span>
  );
  const handleClick = () => {
    setEditCompany({} as SetStateAction<ICompanyItems>);
    setShowCompanyModal(true);
  };
  // JSX structure for rendering the component
  return (
    <>
      <div className="mt-2">
        {showCompanyModal && (
          <Company
            showInviteUserModal={showCompanyModal}
            handleCompanyModal={(value: boolean) => {
              setShowCompanyModal(value);
              (Object.keys(editCompany).length !== 0) ?
              getListOfCompany(
                currentUpdatedPage,
                companyList.pageSize,
                companies.searchParam
              ) : getListOfCompany(
                1,
                100,
                companies.searchParam
              );
            }}
          ></Company>
        )}


      </div>

      <div className="mt-2.5">
        {/* <Company_SearchBar/> */}
        <div className="text-end mb-2">
          <Button
            title={"Add New Client Company"}
            classes={
              "bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 py-1.5 font-medium text-[11px] text-white rounded-md shadow-lg inline-flex items-center font-semibold"
            }
            type={"button"}
            isRounded={false}
            icon={<FaPlus className="fa-solid fa-plus  mr-1 text-xs" />}
            key={0}
            handleClick={() => handleClick()}
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
                rows={companyList.items}
                //   handleSelectAllChange={handleSelectAllChange}
                //   selectAll={selectAll}
                cellRenderer={(
                  data: ICompanyItems,
                  rowIndex: number,
                  cellIndex: number
                ) => {
                  return handleCellRendered(cellIndex, data, rowIndex);
                }}
              />
              {/* Render the Pagination component with relevant props */}
              <Pagination
                numberOfItemsPerPage={companyList.pageSize}
                currentPage={companyList.currentPage}
                totalPages={companyList.totalPages}
                totalRecords={companies.totalCount}
                handleFrontButton={handleFrontButton}
                handleBackButton={handleBackButton}
                canPaginateBack={canPaginateBack}
                canPaginateFront={canPaginateFront}
              />
            </>
          )}
        </div>
      </div>



    </>

  );
};

// Export the component as the default export
export default CompanyGrid;
