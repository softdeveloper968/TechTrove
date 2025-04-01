import React, { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import CustomerModal from './CustomerModal';
import Spinner from 'components/common/spinner/Spinner';
import Grid from "components/common/grid/GridWithToolTip";
import HighlightedText from 'components/common/highlightedText/HighlightedText';
import Pagination from 'components/common/pagination/Pagination';
import Button from 'components/common/button/Button';
import { toCssClassName } from "utils/helper";
import { UserRole } from 'utils/enum';
import { IGridHeader } from "interfaces/grid-interface";
import { CustomerFormMode, ICustomerItems } from 'interfaces/customer.interface';
import { useAccountingContext } from '../AccountingContext';
import { useAuth } from 'context/AuthContext';
const initialColumnMapping: IGridHeader[] = [
   { columnName: "companyName", label: "CompanyName" },
   { columnName: "email", label: "Email" },
   { columnName: "refId", label: "RefId" },
 ];
type CustomerGridProps = {};

const CustomerGrid: React.FC = (props: CustomerGridProps) => {
   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [openCustomerModal, setOpenCustomerModal] = useState<boolean>(false);
	const [formMode, setFormMode] = useState<CustomerFormMode>('create');
	const [selectedUser, setSelectedUser] = useState<ICustomerItems | null>(null);
   const { userRole } = useAuth();

   const {
      customerDetails,
      getCustomerDetails,
      setCustomerDetails
    } = useAccountingContext();

    useEffect(() => {
      try {
        setCustomerDetails((prevAllCustomer) => ({ ...prevAllCustomer, searchParam: "" }));
  
        if (userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)) {
          getCustomerDetails(1, 100, "");
        } else {
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }, []);
    const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
      customerDetails.currentPage > 1
    );
    const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
      customerDetails.totalPages > 1
    );
    const handleCellRendered = (
      cellIndex: number,
      data: ICustomerItems,
      rowIndex: number
    ) => {
      const columnName = visibleColumns[cellIndex]?.label;
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
        isNoLimit: () => <span>{cellValue ? "Yes" : "No"}</span>,
      };
      const renderer =
        renderers[propertyName] || (() => formattedCell(cellValue));
      if (visibleColumns.find((x) => x.label === columnName)) {
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
  
    /**
     * @param value value to be shown in the cell
     * @returns span
     */
    const formattedCell = (value: any) => (
      //<span>{value !== null ? value : ""}</span>
      <HighlightedText
        text={value !== null ? value : ""}
        query={customerDetails.searchParam ?? ""}
      />
    );
  
    const handleFrontButton = () => {
      if (customerDetails.currentPage < customerDetails.totalPages) {
        const updatedCurrentPage = customerDetails.currentPage + 1;
        setCustomerDetails({
          ...customerDetails,
          currentPage: updatedCurrentPage,
        });
        // Update current page and enable/disable 'Back' button
        setCanPaginateBack(updatedCurrentPage > 1);
        // back button get late notices
        getCustomerDetails(updatedCurrentPage, customerDetails.pageSize);
      }
    };
  
    // Event handler for the 'Back' button
    const handleBackButton = () => {
      if (customerDetails.currentPage > 1 && customerDetails.currentPage <= customerDetails.totalPages) {
        const updatedCurrentPage = customerDetails.currentPage - 1;
        setCustomerDetails({
          ...customerDetails,
          currentPage: updatedCurrentPage,
        });
        // Update current page and enable/disable 'Back' button
        setCanPaginateBack(customerDetails.currentPage > 1);
        // back button get late notices
        getCustomerDetails(updatedCurrentPage, customerDetails.pageSize);
      }
    };


    return (
      <> 
      <div className="pt-1.5 lg:pt-2 accounting_grid invoices_grid">
				<div className="flex justify-end mb-3 gap-2 flex-wrap">
					<Button
						title={"Add New Customer"}
						classes={
							"bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 py-1.5 font-medium text-[11px] text-white rounded-md shadow-lg inline-flex items-center font-semibold relative z-[1]"
						}
						type={"button"}
						isRounded={false}
						icon={<FaPlus className="fa-solid fa-plus  mr-1 text-xs" />}
						key={0}
						handleClick={() => {
							setFormMode('create');
							setOpenCustomerModal(true);
							setSelectedUser(null);
						}}
					></Button>
				</div>
				<div className="relative -mr-0.5">
				{/* Render the Grid component with column headings and grid data */}
        {showSpinner === true && <Spinner />}
              <Grid
                columnHeading={visibleColumns}
                rows={customerDetails.items}
                cellRenderer={(
                  data: ICustomerItems,
                  rowIndex: number,
                  cellIndex: number
                ) => {
                  return handleCellRendered(cellIndex, data, rowIndex);
                }}
              />
              {customerDetails && (
                <Pagination
                  numberOfItemsPerPage={customerDetails.pageSize}
                  currentPage={customerDetails.currentPage}
                  totalPages={customerDetails.totalPages}
                  totalRecords={customerDetails.totalCount}
                  handleFrontButton={handleFrontButton}
                  handleBackButton={handleBackButton}
                  canPaginateBack={canPaginateBack}
                  canPaginateFront={canPaginateFront}
                />
              )}
				</div>
			</div>
      {openCustomerModal &&
				<CustomerModal
          open={openCustomerModal}
          setOpen={(open) => setOpenCustomerModal(open)}
          mode={formMode}
          setSelectedUser={(user) => setSelectedUser(null)} selectedUser={null}				/>
			}
      </>
    );

}

export default CustomerGrid;
