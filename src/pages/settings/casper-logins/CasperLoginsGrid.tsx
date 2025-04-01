import React, { useState, useEffect, useRef } from "react";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { FaPlus, FaTrash, FaUserEdit } from "react-icons/fa";
import { useCasperLoginsContext } from "./CasperLoginsContext";
import { ICasperUser, ICasperUserItem, CasperFormMode } from "interfaces/casper.interface";
import { IGridHeader } from "interfaces/grid-interface";
import Button from "components/common/button/Button";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import ConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import IconButton from "components/common/button/IconButton";
import CasperLoginsModal from "./CasperLoginsModal";
import CasperService from "services/casper.service";
import { toCssClassName } from "utils/helper";

type CasperLoginsGridProps = {};

const initialColumnMapping: IGridHeader[] = [
   { columnName: "actions", label: "Action", className: "action" },
   { columnName: "name", label: "Account" },
   { columnName: "userName", label: "Username" },
   { columnName: "isC2CCard", label: "Payment Account" },
   { columnName: "isDefault", label: "IsDefault" },
   // { columnName: "lastName", label: "LastName" },
];

const CasperLoginsGrid = (props: CasperLoginsGridProps) => {
   const {
      showSpinner,
      casperUsers,
      getCasperUsers
   } = useCasperLoginsContext();
   const isMounted = useRef(true);
   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   const [casperUserList, setCasperUserList] = useState<ICasperUser>(casperUsers);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(casperUserList.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(casperUserList.totalPages > 1);
   const [confirmation, setConfirmation] = useState<boolean>(false);
   const [openCasperModal, setOpenCasperModal] = useState<boolean>(false);
   const [formMode, setFormMode] = useState<CasperFormMode>('create');
   const [selectedUser, setSelectedUser] = useState<ICasperUserItem | null>(null);

   useEffect(() => {
      if (isMounted.current) {
         getCasperUsers(1, 100);
         isMounted.current = false;
      }

   }, []);

   const deleteCasperUser = async () => {
      if (selectedUser && selectedUser.id) {
         const response = await CasperService.deleteCasperLoginUser(selectedUser.id);
         if (response.status === HttpStatusCode.Ok) {
            getCasperUsers(1, 100);
            setSelectedUser(null);
            toast.success(response.data.message);
         } else {
            toast.error(response.data.message);
         }
         setConfirmation(false);
      }
   };

   const handleFrontButton = () => {
      if (casperUserList.currentPage < casperUserList.totalPages) {
         const updatedCurrentPage = casperUserList.currentPage + 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(updatedCurrentPage > 1);
         // back button get late notices
         getCasperUsers(
            updatedCurrentPage,
            casperUserList.pageSize
         );
      }
   };

   const handleBackButton = () => {
      if (
         casperUserList.currentPage > 1 &&
         casperUserList.currentPage <= casperUserList.totalPages
      ) {
         const updatedCurrentPage = casperUserList.currentPage - 1;
         // Update current page and enable/disable 'Back' button
         setCanPaginateBack(casperUserList.currentPage > 1);
         // back button get late notices
         getCasperUsers(
            updatedCurrentPage,
            casperUserList.pageSize
         );
      }
   };

   const handleCellRendered = (cellIndex: number, data: ICasperUserItem, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         actions: () => (
            <div className="flex items-center gap-1.5">
               <IconButton
                  type={"button"}
                  className="cursor-pointer text-[#2472db]"
                  disabled={!casperUsers.totalCount}
                  icon={<FaUserEdit className="h-4 w-4" />}
                  handleClick={() => {
                     setSelectedUser(data);
                     setFormMode('edit');
                     setOpenCasperModal(true);
                  }}
               />
               <IconButton
                  type={"button"}
                  className="cursor-pointer text-[#E61818]"
                  disabled={!casperUsers.totalCount}
                  icon={<FaTrash className="h-4 w-4" />}
                  handleClick={() => {
                     setSelectedUser(data);
                     setConfirmation(true);
                  }}
               />
            </div>
         ),
         userName: () => formattedCell(cellValue),
         isDefault: () => formatIsDefaultCell(cellValue),
         isC2CCard: () => formatIsC2CCard(cellValue),
      };

      const renderer = renderers[propertyName] || (() => formattedCell(cellValue));

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

   const formattedCell = (value: any) => (
      <span>{value ? value : ""}</span>
   );
   const formatIsC2CCard = (value: any) => (
      <span>{value ? "C2C" : "Client"}</span>
   );
   const formatIsDefaultCell = (value: any) => (
      <span>{value ? "Yes" : "No"}</span>
   );

   return (
      <>
         <div className="mt-2.5">
            <div className="text-end mb-2">
               <Button
                  title={"Add New Cobb User"}
                  classes={
                     "bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 py-1.5 font-medium text-[11px] text-white rounded-md shadow-lg inline-flex items-center font-semibold"
                  }
                  type={"button"}
                  isRounded={false}
                  icon={<FaPlus className="fa-solid fa-plus mr-1 text-xs" />}
                  key={0}
                  handleClick={() => {
                     setFormMode('create');
                     setOpenCasperModal(true);
                     setSelectedUser(null);
                  }}
               ></Button>
            </div>
            <div className="relative -mr-0.5">
            {showSpinner ? (
               <Spinner />
            ) : (
               <>
                  <Grid
                     columnHeading={visibleColumns}
                     rows={casperUsers.items}
                     cellRenderer={(data: ICasperUserItem, rowIndex: number, cellIndex: number) => {
                        return handleCellRendered(cellIndex, data, rowIndex);
                     }}
                  />
                  {/* Render the Pagination component with relevant props */}
                  <Pagination
                     numberOfItemsPerPage={casperUserList.pageSize}
                     currentPage={casperUserList.currentPage}
                     totalPages={casperUserList.totalPages}
                     totalRecords={casperUsers.totalCount}
                     handleFrontButton={handleFrontButton}
                     handleBackButton={handleBackButton}
                     canPaginateBack={canPaginateBack}
                     canPaginateFront={canPaginateFront}
                  />
               </>
            )}
            </div>
         </div>
         {openCasperModal &&
            <CasperLoginsModal
               open={openCasperModal}
               setOpen={(open: boolean) => setOpenCasperModal(open)}
               mode={formMode}
               selectedUser={selectedUser}
               setSelectedUser={(user: ICasperUserItem | null) => setSelectedUser(null)}
            />
         }
         {confirmation &&
            <ConfirmationBox
               heading={"Confirmation"}
               message={"Are you sure you want to delete this casper user?"}
               showConfirmation={confirmation}
               confirmButtonTitle="OK"
               closePopup={() => setConfirmation(false)}
               handleSubmit={deleteCasperUser}
            />
         }
      </>
   );
};

export default CasperLoginsGrid;