import React, { useState, useEffect } from "react";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { FaPlus, FaTrash, FaUserEdit } from "react-icons/fa";
import { useTylerLoginsContext } from "./TylerLoginsContext";
import { ITylerUser, ITylerUserItems, TylerFormMode } from "interfaces/tyler.interface";
import { IGridHeader } from "interfaces/grid-interface";
import Button from "components/common/button/Button";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import ConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import TylerLoginsModal from "./TylerLoginsModal";
import TylerService from "services/tyler.service";
import { toCssClassName } from "utils/helper";

type TylerLoginsGridProps = {};

const initialColumnMapping:IGridHeader[] = [
	{columnName:"actions",label:"Action", className: "action" },
	{columnName:"state",label:"State"},
	{columnName:"userName",label:"Username",className:"gridHeaderEmail"},
	// {columnName:"paymentName",label:"PaymentName"},
	{columnName:"firstName",label:"FirstName"},
	{columnName:"lastName",label:"LastName"},
	{columnName:"hasAttorney",label:"HasAttorney"},
	{columnName:"isDefaultPayment",label:"IsDefaultPayment"},
	// "Username": "userName",
	// "First Name": "firstName",
	// "Last Name": "lastName",
	// "Payment Name": "paymentName",
	// "Has Attorney": "hasAttorney",
	// "Actions": "actions",
];

const TylerLoginsGrid = (props: TylerLoginsGridProps) => {
	const { 
      showSpinner, 
      tylerUsers, 
      getTylerUsers,
      getAllCourt,
      getFilingTypeList
   } = useTylerLoginsContext();
	const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
	const [tylerUserList, setTylerUserList] = useState<ITylerUser>(tylerUsers);
	const [canPaginateBack, setCanPaginateBack] = useState<boolean>(tylerUserList.currentPage > 1);
	const [canPaginateFront, setCanPaginateFront] = useState<boolean>(tylerUserList.totalPages > 1);
	const [confirmation, setConfirmation] = useState<boolean>(false);
	const [openTylerModal, setOpenTylerModal] = useState<boolean>(false);
	const [formMode, setFormMode] = useState<TylerFormMode>('create');
	const [selectedUser, setSelectedUser] = useState<ITylerUserItems | null>(null);

	useEffect(() => {
		getTylerUsers(1, 100);
		getAllCourt();
      getFilingTypeList();
	}, []);

	const deleteTylerUser = async () => {
		if (selectedUser && selectedUser.id) {
			const response = await TylerService.deleteTylerLogin(selectedUser.id);
			if (response.status === HttpStatusCode.Ok) {
				getTylerUsers(1, 100);
				setSelectedUser(null);
				toast.success(response.data.message);
			} else {
				toast.error(response.data.message);
			}
			setConfirmation(false);
		}
	};

	const handleFrontButton = () => {
		if (tylerUserList.currentPage < tylerUserList.totalPages) {
			const updatedCurrentPage = tylerUserList.currentPage + 1;
			// Update current page and enable/disable 'Back' button
			setCanPaginateBack(updatedCurrentPage > 1);
			// back button get late notices
			getTylerUsers(
				updatedCurrentPage,
				tylerUserList.pageSize
			);
		}
	};

	const handleBackButton = () => {
		if (
			tylerUserList.currentPage > 1 &&
			tylerUserList.currentPage <= tylerUserList.totalPages
		) {
			const updatedCurrentPage = tylerUserList.currentPage - 1;
			// Update current page and enable/disable 'Back' button
			setCanPaginateBack(tylerUserList.currentPage > 1);
			// back button get late notices
			getTylerUsers(
				updatedCurrentPage,
				tylerUserList.pageSize
			);
		}
	};

	const handleCellRendered = (cellIndex: number, data: ITylerUserItems, rowIndex: number) => {
		const columnName = visibleColumns[cellIndex]?.label;
		const propertyName = visibleColumns[cellIndex]?.columnName;
		const cellValue = (data as any)[propertyName];
		const renderers: Record<string, () => JSX.Element> = {
			userName: () => formattedCell(cellValue),
			paymentName: () => formattedCell(cellValue),
			state: () => formattedCell(cellValue),
			hasAttorney: () => (<>{data.hasAttorney ? "Yes" : "No"}</>),
			isDefaultPayment: () => (<>{data.isDefaultPayment ? "Yes" : "No"}</>),
			actions: () => (
				<>
					<div className="flex items-center gap-2">
						<FaUserEdit
							className="h-4 w-4 cursor-pointer fill-[#2472db]"
							onClick={() => {
								setSelectedUser(data);
								setFormMode('edit');
								setOpenTylerModal(true);
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

	const formattedCell = (value: any) => (
		<span>{value !== null ? value : ""}</span>
	);

	return (
		<>
			<div className="mt-2.5">
				<div className="text-end mb-2">
					<Button
						title={"Add New Tyler"}
						classes={
							"bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 py-1.5 font-medium text-[11px] text-white rounded-md shadow-lg inline-flex items-center font-semibold"
						}
						type={"button"}
						isRounded={false}
						icon={<FaPlus className="fa-solid fa-plus  mr-1 text-xs" />}
						key={0}
						handleClick={() => {
							setFormMode('create');
							setOpenTylerModal(true);
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
							rows={tylerUsers.items}
							// handleSelectAllChange={handleSelectAllChange}
							// selectAll={selectAll}
							cellRenderer={(data: ITylerUserItems, rowIndex: number, cellIndex: number) => {
								return handleCellRendered(cellIndex, data, rowIndex);
							}}
						/>
						{/* Render the Pagination component with relevant props */}
						<Pagination
							numberOfItemsPerPage={tylerUserList.pageSize}
							currentPage={tylerUserList.currentPage}
							totalPages={tylerUserList.totalPages}
                     totalRecords={tylerUsers.totalCount}
							handleFrontButton={handleFrontButton}
							handleBackButton={handleBackButton}
							canPaginateBack={canPaginateBack}
							canPaginateFront={canPaginateFront}
						/>
               </>
            )}
				</div>
			</div>
			{openTylerModal &&
				<TylerLoginsModal
					open={openTylerModal}
					setOpen={(open) => setOpenTylerModal(open)}
					mode={formMode}
					selectedUser={selectedUser}
					setSelectedUser={(user) => setSelectedUser(null)}
				/>
			}
			{confirmation &&
				<ConfirmationBox
					heading={"Confirmation"}
					message={"Are you sure you want to delete this tyler user?"}
					showConfirmation={confirmation}
					confirmButtonTitle="OK"
					closePopup={() => setConfirmation(false)}
					handleSubmit={deleteTylerUser}
				/>
			}
		</>
	);
};

export default TylerLoginsGrid;