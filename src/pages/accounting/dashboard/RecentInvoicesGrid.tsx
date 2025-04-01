import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Spinner from 'components/common/spinner/Spinner';
import Grid from "components/common/grid/GridWithToolTip";
import Button from 'components/common/button/Button';
import { UserRole } from 'utils/enum';
import { convertUtcToEst, formattedDate, toCssClassName } from 'utils/helper';
import { IGridHeader } from 'interfaces/grid-interface';
import { RecentInvoicesItems } from 'interfaces/invoices.interface';
import { useAuth } from 'context/AuthContext';
import { useAccountingContext } from '../AccountingContext';

const initialColumnMapping: IGridHeader[] = [
  { columnName: "dueDate", label: "DueDate" },
  { columnName: "docNumber", label: "Invoice", className:'text-right' },
  { columnName: "status", label: "Status" },
  { columnName: "totalAmt", label: "TotalAmount", className: "TotalAmount" },
];
type RecentInvoicesGridProps = {};

const RecentInvoicesGrid: React.FC = (props: RecentInvoicesGridProps) => {
  const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
  const [showSpinner, setShowSpinner] = useState<boolean>(false);
  const { userRole } = useAuth();
  const navigate = useNavigate();


  const {
    recentInvoicesDetails,
    getRecentInvoices,
    setRecentInvoices
  } = useAccountingContext();

  useEffect(() => {
    if (userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin)) {
      getRecentInvoices();
    } else {
    }
  }, []);
  const handleCellRendered = (
    cellIndex: number,
    data: RecentInvoicesItems,
    rowIndex: number
  ) => {
    const columnName = visibleColumns[cellIndex]?.label;
    const propertyName = visibleColumns[cellIndex]?.columnName;
    const cellValue = (data as any)[propertyName];
    let cellClass = "";

    // if (propertyName === "docNumber") {
    //   cellClass = "blue-text";
    // }
   if (propertyName === "status") {
      if (cellValue === "Paid") {
        cellClass = "status-paid";
      } else if (cellValue === "Overdue") {
        cellClass = "status-overdue";
      } else if (cellValue === "Pending") {
        cellClass = "status-due";
      }
    }
    if(propertyName == "dueDate")
    {
      const value = convertUtcToEst(cellValue);
      console.log(value);
    }

    const renderers: Record<string, () => JSX.Element> = {
      isNoLimit: () => <span>{cellValue ? "Yes" : "No"}</span>,
      totalAmt: () =>cellValue ? <span>${cellValue}</span> : <span></span>,
      dueDate: () => cellValue ? <span>{formattedDate(cellValue)}</span> : <span></span>
      // dueDate: () => formattedDateCell(cellValue),
    };
    // const renderers: Record<string, () => JSX.Element> = {
    //   isNoLimit: () => <span>{cellValue ? "Yes" : "No"}</span>,
    //   status: () => <>{cellValue == "Due" ? getStatus(data) : cellValue}</>
    // };

    // const getStatus = (data: any) => {
    //   const currentDate = new Date(); // Get current date-time
    //   const parsedDueDate = new Date(data.dueDate || ""); // Parse due date, handling potential undefined
    //   const timeDiff = parsedDueDate.getTime() - currentDate.getTime(); // Calculate time difference in milliseconds
    //   const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24)); // Convert milliseconds to days and round up
    //   return daysLeft > 0 ? `${daysLeft} days left` : "Due today"; // Return formatted status
    // };


    const renderer =
      renderers[propertyName] || (() => formattedCell(cellValue));

    if (visibleColumns.find((x) => x.label === columnName)) {
      return (
        <td
          key={cellIndex}
          className={`px-1.5 py-2 md:py-2.5 font-normal text-[10.3px] md:text-[11px] text-[#2a2929] ${toCssClassName(columnName)} ${cellClass}`}
        >
          {renderer()}
        </td>
      );
    }
    return <></>;
  };

  const formattedDateCell = (value: any) => (
    <span>{value !== null ? convertUtcToEst(value).date : ""}</span>
 //   <span>{value !== null ? formattedDate(value) : ""}</span>
 );

  /**
   * @param value value to be shown in the cell
   * @returns span
   */
  const formattedCell = (cellValue: any) => {
    // Define formatting logic here
    return <span>{cellValue}</span>;
  };
  const handleClick = () => {
    // Navigate to the Invoices tab
    navigate("/accounting#code=invoices");
  };
  return (
    <>
      <div className='h-full rounded-md overflow-hidden bg-white shadow-[0px_0px_14px_#523F691A] w-full border-1 border-[#F1F1F1] accounting_grid'>
        <div className='flex gap-1.5 sm:gap-0 flex-col sm:flex-row items-center justify-between py-3 px-3.5 min-h-[62px] border-b border-[#F0F1F5]'>
          <h2 className='text-[#0E294E] text-[13px] xl:text-[15px] font-medium leading-tight'>Recent Invoices</h2>
          <div className='flex items-center gap-2'>
            <div>
              <Button
                title={"View All"}
                classes={
                  "hover:bg-[#e1e8f1] outline-none py-1.5 md:py-2 p-3.5 border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none disabled:bg-[#fcfcfc] disabled:text-[#a8aeb8] bg-no-repeat bg-[center_right_10px] text-[#2472DB] font-semibold"
                }
                type={"button"}
                isRounded={false}
                key={0}
                handleClick={handleClick}
              ></Button>
            </div>
          </div>
        </div>
        <div className='p-3 md:p-4 mx-auto'>
        {showSpinner ? (
               <Spinner />
            ) : (
               <>
                  <Grid
            columnHeading={visibleColumns}
            rows={recentInvoicesDetails}
            cellRenderer={(
              data: RecentInvoicesItems,
              rowIndex: number,
              cellIndex: number
            ) => {
              return handleCellRendered(cellIndex, data, rowIndex);
            }}
          />
               </>
            )}
        </div>
      </div>
    </>
  );

}

export default RecentInvoicesGrid;
