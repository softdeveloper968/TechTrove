import React, { useEffect, useRef, useState } from "react";
import Grid from "components/common/grid/GridWithToolTip";
import Spinner from "components/common/spinner/Spinner";
import Pagination from "components/common/pagination/Pagination";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import { usePaymentContext } from "../PaymentContext";
import { IGridHeader } from "interfaces/grid-interface";
import { ISinglePaymentItems } from "interfaces/single-payment.interface";
import { convertUtcToEst, formattedDate, toCssClassName } from "utils/helper";

type PaymentGridProps = {};

const PaymentGrid = (props: PaymentGridProps) => {
//   const { userRole } = useAuth();
  const isMounted = useRef(true);
  const { showSpinner, paymentRecords, getAllPaymentRecords, setAllPaymentRecords} = usePaymentContext();
  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(paymentRecords.currentPage > 1);
  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(paymentRecords.totalPages > 1);
  const [allPaymentRecords, setAllPaymentsRecords] = useState<ISinglePaymentItems[]>([]);
  const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
    Array(paymentRecords?.items.length).fill(false)
 );
 const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
const initialColumnMapping: IGridHeader[] = [      
    { columnName: "payerName", label: "PayerName"},
    { columnName: "type", label: "Type" },
    { columnName: "transactionId", label: "TransactionId" },
    { columnName: "amount", label: "Amount" , className:'text-right'},
    { columnName: "createdDate", label: "CreatedDate"},
 ];
  const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(initialColumnMapping);

useEffect(() => {
    if (!paymentRecords.totalCount) {
       if (isMounted.current) {
          getAllPaymentRecords(1, 100); 
          isMounted.current = false;            
       };
    };

 }, []);


//   // useEffect to update pagination and grid data when 'rows' or 'numberOfItemsPerPage' changes
  useEffect(() => {
    const paymentsRecords = paymentRecords.items.map((item: any) => {
      return {
        ...item, // Spread existing properties
      };
    });

    setAllPaymentsRecords(paymentsRecords);
    // Enable/disable pagination buttons based on the number of total pages
    setCanPaginateBack(paymentRecords.currentPage > 1);
    setCanPaginateFront(paymentRecords.totalPages > 1);
    setSelectedRows(Array(paymentRecords.items?.length).fill(false));
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

  }, [paymentRecords]);

  // Event handler for the 'Back' button
  const handleBackButton = () => {
    if (
        paymentRecords.currentPage > 1 &&
        paymentRecords.currentPage <= paymentRecords.totalPages
    ) {
      const updatedCurrentPage = paymentRecords.currentPage - 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(paymentRecords.currentPage > 1);
      // back button get dismissals
      getAllPaymentRecords(
        updatedCurrentPage,
        paymentRecords.pageSize,
        paymentRecords.searchParam
      );
    }
  };

  // // Event handler for the 'Next' button
  const handleFrontButton = () => {
    if (paymentRecords.currentPage < paymentRecords.totalPages) {
      const updatedCurrentPage = paymentRecords.currentPage + 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(updatedCurrentPage > 1);
      // back button get dismissals
      getAllPaymentRecords(
        updatedCurrentPage,
        paymentRecords.pageSize,
        paymentRecords.searchParam
      );
    }
  };


  const handleCellRendered = (
    cellIndex: number,
    data: ISinglePaymentItems,
    rowIndex: number
  ) => {
    const columnName = visibleColumns[cellIndex]?.label;
    //const propertyName = (initialColumnMapping as any)[columnName];
    const propertyName = visibleColumns[cellIndex]?.columnName;
    const cellValue = (data as any)[propertyName];
    const renderers: Record<string, () => JSX.Element> = {
    //   action: () => renderActionsCell(data.id ?? ""),
    payerName: () => formattedCell(cellValue),
      type: () => formattedCell(cellValue),
      transactionId: () => renderHighlightedCell(cellValue), 
      amount: () => formattedAmount(cellValue),
      createdDate: () => formattedDateCell(cellValue),
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


const formattedDateCell = (value: any) => (
    // <span>{value !== null ? formattedDate(value) : ""}</span>
    <span>{value !== null ? convertUtcToEst(value).date : ""}</span>
 );

  // const formattedCell = (value: any) => (
  //   <span><HighlightedText text={value !== null ? value : ""} query={paymentRecords.searchParam ??''} /></span>
  // );

  const formattedCell = (value: any) => (
    <span>{value !== null ? value : ""}</span>
 );
 

 const renderHighlightedCell = (value: any) => (
    <HighlightedText text={value as string ?? ''} query={paymentRecords.searchParam ?? ''} />
 );

  const formattedAmount = (value: any) => (
    <span>$<HighlightedText text={value !== null ? value : ""} query={paymentRecords.searchParam ??''} /></span>
  );

  return (
    <div className="my-1.5 bg-white p-3 md:p-3.5 pb-3.5 md:pb-4 rounded-md shadow-md shadow-slate-300">
      <div className="relative -mr-0.5">
        {/* Render the Grid component with column headings and grid data */}
        {showSpinner === true ? (
          <Spinner />
        ) : (
          <>
            <Grid
              columnHeading={visibleColumns}
              rows={paymentRecords.items}
              cellRenderer={(
                data: ISinglePaymentItems,
                rowIndex: number,
                cellIndex: number
              ) => {
                return handleCellRendered(cellIndex, data, rowIndex);
              }}
            />
            {/* Render the Pagination component with relevant props */}
            <Pagination
              numberOfItemsPerPage={paymentRecords.pageSize}
              currentPage={paymentRecords.currentPage}
              totalPages={paymentRecords.totalPages}
              totalRecords={paymentRecords.totalCount}
              handleFrontButton={handleFrontButton}
              handleBackButton={handleBackButton}
              canPaginateBack={canPaginateBack}
              canPaginateFront={canPaginateFront}
            />
          </>
        )}
      </div>
    </div>
  );

};

export default PaymentGrid;


