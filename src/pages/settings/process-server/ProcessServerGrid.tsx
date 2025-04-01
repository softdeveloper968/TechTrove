import React, { useState, useEffect, useRef } from "react";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { FaEdit, FaExclamationTriangle, FaPlus, FaTrash, FaUserEdit } from "react-icons/fa";
import { useProcessServerContext } from "./ProcessServerContext";
import { useAuth } from "context/AuthContext";
import { IProcessServerUser, IProcessServerUserItem, ProcessServerFormMode } from "interfaces/process-server.interface";
import { IGridHeader } from "interfaces/grid-interface";
import Button from "components/common/button/Button";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import ConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import GridCheckbox from "components/formik/GridCheckBox";
import Modal from "components/common/popup/PopUp";
import ProcessServerModal from "./ProcessServerModal";
import ProcessServerService from "services/process-server.service";
import ProcessServerBulkEdit from "./ProcessServerBulkEdit";
import { UserRole } from "utils/enum";
import { toCssClassName } from "utils/helper";

type ProcessServerGridProps = {};

// const initialColumnMapping: IGridHeader[] = [
// 	{ columnName: "actions", label: "Action", className: "action"  },
// 	{ columnName: "isChecked", label: "", controlType: "checkbox" },
// 	{ columnName: "email", label: "ProcessServerEmail", className: "gridHeaderEmail" },
// 	{ columnName: "county", label: "County", isSort: true },
// 	{ columnName: "state", label: "State", isSort: true },
// 	{ columnName: "zip", label: "Zip", isSort: true },
// 	{ columnName: "city", label: "City", isSort: true },
// 	{ columnName: "alternateCity", label: "AlternateCity" },
// ];

const ProcessServerGrid = (props: ProcessServerGridProps) => {
   const {
      showSpinner,
      processServers,
      setProcessServers,
      getProcessServers,
      setBulkRecords,
      getProcessServerUsers,
      selectedProcessServerIds,
      setSelectedProcessServerIds
   } = useProcessServerContext();
   const { userRole } = useAuth();

   const initialColumnMapping: IGridHeader[] = [
      { columnName: "isChecked", label: "", controlType: "checkbox" },
      { columnName: "actions", label: "Action", className: "action" },
      { columnName: "email", label: "ProcessServerEmail", className: "gridHeaderEmail", isSort: true },
      { columnName: "county", label: "County", isSort: true },
      { columnName: "state", label: "State", isSort: true },
      { columnName: "zip", label: "Zip", isSort: true, className: 'text-right' },
      { columnName: "city", label: "City", isSort: true },
      { columnName: "alternateCity", label: "AlternateCity" },
      ...(userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin)
         ? [{
            columnName: "companyName",
            label: "CompanyName"
         }]
         : []
      ),
   ];

   const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(initialColumnMapping);

   useEffect(() => {
      if ((userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin)) && !visibleColumns.some(x => x.columnName === "companyName")) {
         setVisibleColumns((prev) => (
            [
               ...prev,
               {
                  columnName: "companyName",
                  label: "CompanyName"
               }
            ]));
      }

   }, [userRole]);

   // const [processServerUserList, setProcessServerUserList] = useState<IProcessServerUser>(processServerUsers);
   const [canPaginateBack, setCanPaginateBack] = useState<boolean>(processServers.currentPage > 1);
   const [canPaginateFront, setCanPaginateFront] = useState<boolean>(processServers.totalPages > 1);
   const [confirmation, setConfirmation] = useState<boolean>(false);
   const [openProcessServerModal, setOpenProcessServerModal] = useState<boolean>(false);
   const [formMode, setFormMode] = useState<ProcessServerFormMode>('create');
   const [selectedUser, setSelectedUser] = useState<IProcessServerUserItem | null>(null);

   const [selectAll, setSelectAll] = useState<boolean>(false);
   // const [selectedProcessServerIds, setSelectedProcessServerIds] = useState<string[]>([]);
   const [newRowsSelected] = useState<boolean[]>([]);
   const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
      Array(processServers.items.length).fill(false)
   );
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [lastClickedFilteredRowIndex, setLastClickedFilteredRowIndex] = useState<number>(-1);
   const [openInfoModal, setInfoModal] = useState<boolean>(false);
   const [openBulkEditModal, setOpenBulkEditModal] = useState<boolean>(false);
   const isMounted = useRef(true);

   useEffect(() => {
      if (isMounted.current) {
         // serviceTracker.items.map((item: any) => {
         // 	return {
         // 	   isChecked: false, // Add the new property
         // 	   ...item, // Spread existing properties
         // 	};
         //  });
         processServers.items.map((item: any) => {
            return {
               isChecked: false,
               ...item,
            }
         })
         setSelectedProcessServerIds([]);
         getProcessServers(1, 100, '', []);
         getProcessServerUsers();
         isMounted.current = false;
      }

   }, []);

   useEffect(() => {
      // Enable/disable pagination buttons based on the number of total pages
      setCanPaginateBack(processServers.currentPage > 1);
      setCanPaginateFront(processServers.totalPages > 1);
      setSelectedRows(Array(processServers.items?.length).fill(false));
   }, [processServers]);

   useEffect(() => {
      setSelectAll(false);
      const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === "Shift") {
            setShiftKeyPressed(true);
         }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
         if (e.key === "Shift") {
            // Reset selected rows to the top (index 0)
            setShiftKeyPressed(false);
         }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);

      return () => {
         window.removeEventListener("keydown", handleKeyDown);
         window.removeEventListener("keyup", handleKeyUp);
      };

   }, []);

   const deleteProcessServerUser = async () => {
      if (selectedUser && selectedUser.id) {
         const response = await ProcessServerService.deleteProcessServerUser(selectedUser.id);
         if (response.status === HttpStatusCode.Ok) {
            const indexToRemove = processServers.items.findIndex(item => item.id === selectedUser.id);

            if (indexToRemove !== -1) {
               processServers.items.splice(indexToRemove, 1);
            }
            setSelectedUser(null);
            toast.success(response.data.message);
         } else {
            toast.error(response.data.message);
         }
         setConfirmation(false);
      }
   };

   // const handleSelectAllChange = (checked: boolean) => {
   // 	const selectedAll = !selectAll;
   // 	const allIds: string[] = processServers.items
   // 		.map((item) => item.id)
   // 		.filter((id): id is string => typeof id === "string");
   // 	if (checked) {
   // 		setSelectedProcessServerIds(allIds);
   // 	} else {
   // 		setSelectedProcessServerIds([]);
   // 	}

   // 	setSelectAll((prev) => {
   // 		// Update selectedRows state
   // 		setSelectedRows(Array(allIds.length).fill(selectedAll));
   // 		return selectedAll;
   // 	});
   // };

   const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectAll;
      const allIds: string[] = processServers.items
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         processServers.items
            .map((item) => setBulkRecords((prev) => [...prev, item]));
         setSelectedProcessServerIds(prevIds => [...new Set([...prevIds, ...allIds])]);
      } else {
         processServers.items.forEach((item) => {
            setBulkRecords(prevItems => prevItems.filter(record => record.id !== item.id));
            setSelectedProcessServerIds(prevIds => prevIds.filter(id => id !== item.id));
         });
      }

      setSelectAll((prevSelectAll) => {
         // Update selectedRows state
         setSelectedRows(Array(allIds.length).fill(newSelectAll));
         return newSelectAll;
      });
   };

   // const handleCheckboxChange = (index: number, checked: boolean) => {
   // 	if (shiftKeyPressed && lastClickedFilteredRowIndex !== -1 && processServers.items) {
   // 		const start = Math.min(index, lastClickedFilteredRowIndex);
   // 		const end = Math.max(index, lastClickedFilteredRowIndex);
   // 		setSelectedRows(Array.from({ length: end + 1 }, (_, i) =>
   // 			i >= start && i <= end ? selectedRows[i] = true : newRowsSelected[i]
   // 		));
   // 		setSelectedRows(selectedRows);
   // 		const selectedIds = (processServers.items || [])
   // 			.filter((_, rowIndex) => selectedRows[rowIndex])
   // 			.map((item) => item.id)
   // 			.filter((id): id is string => typeof id === "string");

   // 		setSelectedProcessServerIds(selectedIds);
   // 	}
   // 	else {
   // 		const updatedSelectedRows = [...selectedRows];
   // 		updatedSelectedRows[index] = checked;
   // 		setSelectedRows(updatedSelectedRows);

   // 		if (processServers.items.length === updatedSelectedRows.filter(item => item).length) {
   // 			setSelectAll(true);
   // 		} else {
   // 			setSelectAll(false);
   // 		};

   // 		const selectedIds = (processServers.items || [])
   // 			.filter((_, rowIndex) => updatedSelectedRows[rowIndex])
   // 			.map((item) => item.id)
   // 			.filter((id): id is string => typeof id === "string");

   // 		setSelectedProcessServerIds(selectedIds);
   // 	}
   // 	setLastClickedFilteredRowIndex(index);
   // };

   const handleCheckBoxChange = (index: number, id: string, checked: boolean) => {
      if (shiftKeyPressed && lastClickedFilteredRowIndex !== -1 && processServers.items) {
         const start = Math.min(index, lastClickedFilteredRowIndex);
         const end = Math.max(index, lastClickedFilteredRowIndex);
         //   setSelectedRows(Array.from({ length: selectedRows.length }, (_, i) =>
         // 	i >= start && i <= end ? selectedRows[i] = true : newRowsSelected[i]
         //   ));
         setSelectedRows(Array.from({ length: end + 1 }, (_, i) =>
            i >= start && i <= end ? selectedRows[i] = true : newRowsSelected[i]
         ));
         setSelectedRows(selectedRows);
         const selectedIds = (processServers.items || [])
            .filter((_, rowIndex) => selectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         processServers.items.filter((_, rowIndex) => selectedRows[rowIndex]).map((item) => {
            setBulkRecords(prevItems => {
               const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
               uniqueItems.add(JSON.stringify(item)); // Add the new item
               return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            });
            //  setBulkRecords((prev)=>[...prev,item]);
         })
         setSelectedProcessServerIds(prevIds => [...new Set([...prevIds, ...selectedIds])]);
      } else {
         const updatedSelectedRows = [...selectedRows];
         updatedSelectedRows[index] = checked;
         setSelectedRows(updatedSelectedRows);

         if (processServers.items.length === updatedSelectedRows.filter(item => item).length) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }

         var selectedIds = processServers.items.filter(item => item.id == id).map((item) => item.id)
            .filter((id): id is string => typeof id === "string");
         // const selectedIds = (fileEvictions.items || [])
         //   .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
         //   .map((item) => item.id)
         //   .filter((id): id is string => typeof id === "string");

         if (!checked) {
            // Remove the item from filteredRecords if unchecked        
            setBulkRecords(prevItems => prevItems.filter(item => item.id !== id));
            setSelectedProcessServerIds(prevIds => prevIds.filter(item => item !== id));
         } else {

            setBulkRecords(prevItems => {
               const uniqueItems = new Set(prevItems.map(item => JSON.stringify(item)));
               uniqueItems.add(JSON.stringify(processServers.items.filter(x => x.id === id)[0])); // Add the new item
               return Array.from(uniqueItems).map(item => JSON.parse(item)); // Convert Set back to array
            });
            //setBulkRecords((prev)=>[...prev,allCasesRecords.filter(x=>x.id===id)[0]]);
            // if (selectedItem)
            //   settingData(selectedItem);
            setSelectedProcessServerIds(prevIds => [...new Set([...prevIds, ...selectedIds])]);
         }

      }

      setLastClickedFilteredRowIndex(index);
   };

   const handleBulkEditClick = () => {
      const lengeth = selectedProcessServerIds.length;
      if (selectedProcessServerIds.length === 0) {
         setInfoModal(true);
      } else {
         setOpenBulkEditModal(true);
      }
      // if (selectedRows.some(item => item)) {
      // 	setOpenBulkEditModal(true);
      // } else {
      // 	setInfoModal(true);
      // };
   };

   const handleSorting = (columnName: string, order: string) => {
      // Update the sortings state with the new sorting option, ensuring no duplicates
      setProcessServers(prev => {
         const existingSort = prev.sortings.find(sort => sort.sortColumn === columnName);

         const updatedSortings = existingSort
            ? prev.sortings.map(sort =>
               sort.sortColumn === columnName
                  ? { ...sort, isAscending: order === "asc" } // Update existing sort
                  : sort
            )
            : [...prev.sortings, { sortColumn: columnName, isAscending: order === "asc" }]; // Add new sort

         // Fetch the data with the updated sortings
         getProcessServers(
            prev.currentPage,
            prev.pageSize,
            prev.searchParam,
            updatedSortings
         );

         // Return the updated state
         return {
            ...prev,
            sortings: updatedSortings
         };
      });
   };

   const handleFrontButton = () => {
      if (processServers.currentPage < processServers.totalPages) {
         const updatedCurrentPage = processServers.currentPage + 1;
         setCanPaginateBack(updatedCurrentPage > 1);
         getProcessServers(
            updatedCurrentPage,
            processServers.pageSize,
            '',
            processServers.sortings
         );
      }
   };

   const handleBackButton = () => {
      if (
         processServers.currentPage > 1 &&
         processServers.currentPage <= processServers.totalPages
      ) {
         const updatedCurrentPage = processServers.currentPage - 1;
         setCanPaginateBack(processServers.currentPage > 1);
         getProcessServers(
            updatedCurrentPage,
            processServers.pageSize,
            '',
            processServers.sortings
         );
      }
   };

   const handleCellRendered = (cellIndex: number, data: IProcessServerUserItem, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         isChecked: () => (
            <GridCheckbox
               checked={selectedProcessServerIds.includes(data.id as string)}
               onChange={(checked: boolean) =>
                  handleCheckBoxChange(rowIndex, data.id, checked)}
               label=""
            />
         ),
         county: () => formattedCell(cellValue),
         state: () => formattedCell(cellValue),
         zip: () => formattedCell(cellValue),
         email: () => formattedCell(cellValue),
         actions: () => (
            <>
               <div className="flex items-center gap-2">
                  <FaUserEdit
                     className="h-4 w-4 cursor-pointer fill-[#2472db]"
                     onClick={() => {
                        setSelectedUser(data);
                        setFormMode('edit');
                        setOpenProcessServerModal(true);
                     }}
                  />
                  <FaTrash
                     className="h-4 w-4 cursor-pointer fill-[#E61818]"
                     onClick={() => {
                        setSelectedUser(data);
                        setConfirmation(true);
                     }}
                  ></FaTrash>
               </div></>
         )
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
      <span>{value !== null ? value : ""}</span>
   );

   const checkIfAllIdsExist = (
      processserverUsers: IProcessServerUserItem[],
      selectedProcessServerIds: string[]
   ): boolean | undefined => {
      if (processserverUsers.length === 0) {
         return false;
      }
      return processserverUsers.every(record =>
         selectedProcessServerIds.includes(record.id as string)
      );
   };

   // const checkIfAllIdsExist = (
   // 	processserverUsers: IProcessServerUserItem[],
   // 	selectedProcessServerIds: string[]
   //   ): boolean | undefined => {
   // 	return processserverUsers.every(record =>
   // 		selectedProcessServerIds.includes(record.id as string)
   // 	);
   //   };

   return (
      <>
         <div className="mt-2.5">
            <div className="flex justify-end mb-2 gap-2 flex-wrap">
               <Button
                  title={"Edit"}
                  classes={
                     "bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 py-1.5 font-medium text-[11px] text-white rounded-md shadow-lg inline-flex items-center font-semibold"
                  }
                  type={"button"}
                  isRounded={false}
                  icon={<FaEdit className="fa-solid fa-plus  mr-1 text-xs" />}
                  key={0}
                  handleClick={handleBulkEditClick}
               ></Button>
               <Button
                  title={"Add New Process Server"}
                  classes={
                     "bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 py-1.5 font-medium text-[11px] text-white rounded-md shadow-lg inline-flex items-center font-semibold"
                  }
                  type={"button"}
                  isRounded={false}
                  icon={<FaPlus className="fa-solid fa-plus  mr-1 text-xs" />}
                  key={0}
                  handleClick={() => {
                     setFormMode('create');
                     setOpenProcessServerModal(true);
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
                        rows={processServers.items}
                        handleSelectAllChange={handleSelectAllChange}
                        selectAll={checkIfAllIdsExist(processServers.items, selectedProcessServerIds)}
                        cellRenderer={(data: IProcessServerUserItem, rowIndex: number, cellIndex: number) => {
                           return handleCellRendered(cellIndex, data, rowIndex);
                        }}
                        handleSorting={handleSorting}
                        activeSortingMap={processServers.sortings}
                     />
                     {/* Render the Pagination component with relevant props */}
                     <Pagination
                        numberOfItemsPerPage={processServers.pageSize}
                        currentPage={processServers.currentPage}
                        totalPages={processServers.totalPages}
                        totalRecords={processServers.totalCount}
                        handleFrontButton={handleFrontButton}
                        handleBackButton={handleBackButton}
                        canPaginateBack={canPaginateBack}
                        canPaginateFront={canPaginateFront}
                     />

                  </>
               )}
            </div>
         </div>
         {openProcessServerModal &&
            <ProcessServerModal
               open={openProcessServerModal}
               setOpen={(open) => setOpenProcessServerModal(open)}
               mode={formMode}
               selectedUser={selectedUser}
               setSelectedUser={(user) => setSelectedUser(null)}
            />
         }
         {confirmation &&
            <ConfirmationBox
               heading={"Confirmation"}
               message={"Are you sure you want to delete this Process Server?"}
               showConfirmation={confirmation}
               confirmButtonTitle="OK"
               closePopup={() => setConfirmation(false)}
               handleSubmit={deleteProcessServerUser}
            />
         }
         {openBulkEditModal &&
            <ProcessServerBulkEdit
               open={openBulkEditModal}
               setOpen={() => setOpenBulkEditModal(false)}
               selectedIds={selectedProcessServerIds}
               setSelectedIds={() => {
                  setSelectAll(false);
                  setSelectedProcessServerIds([]);
                  setSelectedRows(Array(processServers.items.length).fill(false));
               }}
            />
         }
         {openInfoModal &&
            <Modal
               showModal={openInfoModal}
               onClose={() => setInfoModal(false)}
               width="max-w-md"
            >
               <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                  <div className="text-center py-8">
                     <div className="mx-auto flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-red-100 mx-auto">
                        <FaExclamationTriangle className="h-5 w-5 text-red-600" />
                     </div>
                     <div className="mt-2.5 text-center ">
                        <p className="text-xs text-gray-500 text-center font-medium text-gray-600 text-md">
                           Please select at least 1 record.
                        </p>
                     </div>
                  </div>
               </div>
            </Modal>
         }
      </>
   );
};

export default ProcessServerGrid;