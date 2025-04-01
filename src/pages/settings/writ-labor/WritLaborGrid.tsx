import React from "react";
import { SetStateAction, useEffect, useState } from "react";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { FaPlus } from "react-icons/fa";
import {
  FaUserEdit,
  FaTrash
} from "react-icons/fa";
import Grid from "components/common/grid/GridWithToolTip";
import Spinner from "components/common/spinner/Spinner";
import Pagination from "components/common/pagination/Pagination";
import Button from "components/common/button/Button";
import ConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import { IWritlaborItems, IWritLabor } from "interfaces/writ-labor-interface";
import { IGridHeader } from "interfaces/grid-interface";
import { useWritLaborContext } from "./WritLaborContext";
import { useAuth } from "context/AuthContext";
import WritLaborModal from "./WritLaborModal";
import { UserRole } from "utils/enum";
import WritLaborService from "services/writ-labor.service";
// import User_SearchBar from "./UserActions/User_SearchBar";
import { toCssClassName } from "utils/helper";

type WritLaborGridProps = {};


// React functional component 'WritLaborGrid' with a generic type 'IWritLabor'
const WritLaborGrid = (props: WritLaborGridProps) => {
  const { userRole } = useAuth();
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  // show invite user modal
  const [showWritLaborModal, setShowWritLaborModal] =
    useState<Boolean>(false);
  const {
    writLabors,
    getListOfWritLabor,
    getAllCompanies,
    setEditWritLabor,
   showSpinner
  } = useWritLaborContext();
  const initialColumnMapping :IGridHeader[]= [
    {columnName:"action",label:"Action", className: "action" },
    {columnName:"name",label:"Name"},
    {columnName:"email",label:"Email",className:"gridHeaderEmail"},
    {columnName:"phone",label:"Phone"},
    ...(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)
      ? [{
        columnName: "companyName",
        label: "CompanyName",          
      }]
      : []
    ),
    // Name: "name",
    // Email: "email",
    // Phone: "phone",
    // ...(userRole.includes(UserRole.C2CAdmin) ?{ "Company Name":"companyName" } :null),
    // // "Company Name":"companyName",   
    // Actions: "action",
  ];
  const [writLaborRecord, setWritLaborRecord] = useState<[]>([]);
  const [writLaborList, setWritLaborList] = useState<IWritLabor>(writLabors);
  // State variables for pagination for next and previous button
  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
      writLaborList.currentPage> 1
  );
  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
    writLaborList.totalPages > 1
  );

  const [visibleColumns] = useState<IGridHeader[]>(
        initialColumnMapping
  );

  useEffect(() => {    
    getListOfWritLabor(1, 100,"");
    if(userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin))
          getAllCompanies();    
  }, []);
  useEffect(() => {  
     
    setWritLaborList(writLabors) 
   
  }, [writLabors]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<boolean>(false);
  const [deleteId, setDeleteId] = useState<string>("");
  const handleConfirmation=async(id:string)=>{
    setDeleteId("");
    const response = await WritLaborService.removeWritLabor(id);
    if (response.status === HttpStatusCode.Ok) {
      toast.success("Writ labor removed successfully", {
        position: toast.POSITION.TOP_RIGHT,
      });
      getListOfWritLabor(1,100);
    }
    else{
      toast.warning("Writ labor not removed", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
  }
  
  const handleEditWritLabor=(id:string|undefined)=>{
    
    let data = writLaborList.items.find((item) => item.id === id);
    if (data) 
      setEditWritLabor(data);
      setShowWritLaborModal(true);   
  }

  const handleCellRendered = (
    cellIndex: number,
    data: IWritlaborItems,
    rowIndex: number
  ) => {
    
    const columnName = visibleColumns[cellIndex]?.label;
    const propertyName = visibleColumns[cellIndex]?.columnName;
    const cellValue = (data as any)[propertyName];
    const renderers: Record<string, () => JSX.Element> = {
      name: () => formattedFullNameCell(data),
      email: () => formattedCell(cellValue),
      //isActive: () => formattedActiveCell(cellValue),
      companyName: () => {
        
        // const company = allCompanies.find(item => item.id === data.userCompanyId);
        return <span> {data && data.client && data.client.companyName}</span>;
      },
      
      action:()=>(
        <>
       <div className="flex items-center">
       <FaUserEdit className="h-4 w-4 cursor-pointer fill-[#2472db]" onClick={()=>handleEditWritLabor(data.id)} />
        <FaTrash
          style={{
            height: 14,
            width: 14,
            color: "#E61818",
            margin: 4,
            cursor:"pointer"
          }}
          onClick={() => {
            setDeleteId(data.id||"");
            setDeleteConfirmation(true);
          }}
        ></FaTrash>
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

  const formattedFullNameCell = (data: IWritlaborItems) => (
    <span>{`${data.firstName} ${data.lastName}`}</span>
  );

  const formattedCell = (value: any) => (
    <span>{value !== null ? value : ""}</span>
  );
  const handleClick = () => {
    setEditWritLabor({} as SetStateAction<IWritlaborItems>);
    //getAllCompanies()
    setShowWritLaborModal(true);
  };
  const handleFrontButton = () => {
    if (writLaborList.currentPage < writLaborList.totalPages) {
      const updatedCurrentPage = writLaborList.currentPage + 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(updatedCurrentPage > 1);
      // back button get late notices
      getListOfWritLabor(
        updatedCurrentPage,
        writLaborList.pageSize
      );
    }
  };

  const handleBackButton = () => {
    if (
        writLaborList.currentPage > 1 &&
        writLaborList.currentPage <= writLaborList.totalPages
    ) {
      const updatedCurrentPage = writLaborList.currentPage - 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(writLaborList.currentPage > 1);
      // back button get late notices
      getListOfWritLabor(
        updatedCurrentPage,
        writLaborList.pageSize
      );
    }
  };
  // JSX structure for rendering the component
  return (
    <>
      <div className="mt-2">
        {showWritLaborModal && (<WritLaborModal showWritLaborModal={showWritLaborModal}
            handleInviteUserModal={(value: boolean) => {
              setShowWritLaborModal(value);
            }}></WritLaborModal>     
        )}

      </div>
      <div className="mt-2.5">
        <div className="text-end mb-2">
        {/* <User_SearchBar/> */}
        <Button
          title={"Add New Writ Labor"}
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
                rows={writLaborList.items}
                //   handleSelectAllChange={handleSelectAllChange}
                //   selectAll={selectAll}
                cellRenderer={(
                  data: IWritlaborItems,
                  rowIndex: number,
                  cellIndex: number
                ) => {
                  return handleCellRendered(cellIndex, data, rowIndex);
                }}
              />
              {/* Render the Pagination component with relevant props */}
              <Pagination
                numberOfItemsPerPage={writLaborList.pageSize}
                currentPage={writLaborList.currentPage}
                totalPages={writLaborList.totalPages}
                totalRecords={writLaborList.totalCount}
                handleFrontButton={handleFrontButton}
                handleBackButton={handleBackButton}
                canPaginateBack={canPaginateBack}
                canPaginateFront={canPaginateFront}
              />
            </>
          )}
        </div>
      </div>
      {deleteConfirmation === true && (
          <div>
            <ConfirmationBox
              heading={"Confirmation"}
              message={"Are you sure you want to delete this writ labor?"}
              showConfirmation={deleteConfirmation}
              confirmButtonTitle="OK"
              closePopup={() => {
                setDeleteId("");
                setDeleteConfirmation(false);                
              }}
              handleSubmit={() => {
                setDeleteConfirmation(false);                
                handleConfirmation(deleteId);                
              }}
            ></ConfirmationBox>
          </div>
        )}
    </>
    
  );
};

// Export the component as the default export
export default WritLaborGrid;
