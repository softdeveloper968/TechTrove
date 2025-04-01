import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { HttpStatusCode } from "axios";
import { FaFileExport } from "react-icons/fa";
import { Column } from "react-table";
import Spinner from "components/common/spinner/Spinner";
import Pagination from "components/common/pagination/Pagination";
import ExpandableGrid from "components/common/grid/ExpandableGrid";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import Button from "components/common/button/Button";
import { UserRole } from "utils/enum";
import { convertUtcToEst, formatCurrency } from "utils/helper";
import TransactionService from "services/transaction.service";
import {
  ITransactionItems,
  ICaseTransHistroryItems,
  IExportTransaction,
} from "interfaces/transaction.interface";
import { useAccountingContext } from "../AccountingContext";
import { useAuth } from "context/AuthContext";
interface MyData {
  Category: string;
  Name: string;
  Quantity: number;
}
type ExtendedColumn<T extends object> = Column<T> & {
  Cell?: ({ value, row }: { value: any; row: T }) => JSX.Element;
};
const Transaction = () => {
  const { transaction, getAllTransaction, setAllTransaction, showSpinner } =
    useAccountingContext();

  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
    transaction.currentPage > 1
  );
  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
    transaction.totalPages > 1
  );
  const { userRole } = useAuth();
  useEffect(() => {
    getAllTransaction(1, 100, "");
  }, []);
  const formattedDateCell = (value: any) => (
    <span>{value !== null ? `${convertUtcToEst(value).date}, ${convertUtcToEst(value).time}` : ""}</span>
  );
  const createColumns = (userRole: string[]): ExtendedColumn<ITransactionItems>[] => {
    const commonColumns: ExtendedColumn<ITransactionItems>[] = [
      
      // {
      //   Header: "DateTime",
      //   accessor: "createdDate",
      //   Cell: ({ value }: { value: any }) => (
      //     <span>{value ? new Date(value).toLocaleString() : ""}</span>
      //   ),
      // },
      {
        Header: "DateTime",
        accessor: "createdDate",
        Cell: ({ value }: { value: any }) => formattedDateCell(value),
      },
      {
        Header: "Description",
        accessor: "description",
        Cell: ({ value }: { value: any }) => (
          <span>
            <HighlightedText text={value ?? ""} query={transaction.searchParam ?? ""} />
          </span>
        ),
      },
      {
        Header: "CheckNumber",
        accessor: "checkNumber",
        Cell: ({ value }: { value: any }) => (
          <span>
            <HighlightedText text={value ?? ""} query={transaction.searchParam ?? ""} />
          </span>
        ),
      },
      {
        Header: 'ReferenceId',
        accessor: 'transactionReferenceId',
        Cell: ({ value }: { value: any }) => (
          <span>
            <HighlightedText text={value as string ?? ''} query={transaction.searchParam ?? ''} />
          </span>
        ),
      },
      {
        Header: "Amount",
        accessor: "amount",
        Cell: ({ row }: { row: any }) => {
          const { amount, isDebit } = row.original;
          const formattedAmount = `${!isDebit ? "+" : "-"}${amount}`;
          const color = !isDebit ? "#4DB452" : "#E61818";
          return <span style={{ color }}>{formattedAmount ?? ""}</span>;
        },
      },
      // { Header: "RemainingAmount", accessor: "remainingAmount" },
      { Header: "RemainingAmount", 
        accessor: "remainingAmount", 
        Cell: ({ value }: { value: any }) => (
          <span>{value ? formatCurrencyCell(value) : ""}</span>
        ),
      },
    ];
  
    if ((userRole.includes(UserRole.C2CAdmin) || userRole.includes(UserRole.ChiefAdmin))) {
      return [
        ...commonColumns.slice(0, 2),
        {
          Header: "CompanyName",
          accessor: "companyName",
          Cell: ({ value }: { value: any }) => (
            <span>
              <HighlightedText text={value ?? ""} query={transaction.searchParam ?? ""} />
            </span>
          ),
        },
        ...commonColumns.slice(2),
      ];
    }
  
    return commonColumns;
  };
  
  const formatCurrencyCell = (value: number) => (
    <span>{value !== null ? formatCurrency(value) : ""}</span>
 );
  const columnsForExpandedGrid: ExtendedColumn<ICaseTransHistroryItems>[] = [
    {
      Header: "CaseNo",
      accessor: "caseNo",
    },
    {
      Header: "Filing Type",
      accessor: "caseType",
    },
    {
      Header: "County",
      accessor: "county",
    },
    {
      Header: "Property",
      accessor: "propertyName",
    },
    {
      Header: "PaymentAccount",
      accessor: "isC2CCard",
      Cell: ({ value }: { value: any }) => (
        <span>{value ? "C2C" : "Client"}</span>
      ),
    },
    {
      Header: "CaseType",
      accessor: "isExpedited",
      Cell: ({ value }: { value: any }) => (
        <span>{value ? "Expedited" : "Regular"}</span>
      ),
    },
    {
      Header: "Amount",
      accessor: "amount",
      Cell: ({ row }: { row: any }) => (
        <span style={row.isC2CCard ? { fontWeight: "bold" } : {}}>
          {/* {row.amount} */}
          {formatCurrencyCell(row.amount)}
        </span>
      ),
    },
  ];

  const handleExpand = async (id: string) => {
    const apiResponse = await TransactionService.getCaseTransactionHistory(id);
    if (apiResponse.status === HttpStatusCode.Ok) {
      return apiResponse.data;
    }
  };

  const handleFrontButton = () => {
    if (transaction.currentPage < transaction.totalPages) {
      const updatedCurrentPage = transaction.currentPage + 1;
      setAllTransaction({
        ...transaction,
        currentPage: updatedCurrentPage,
      });
      setCanPaginateBack(updatedCurrentPage > 1);
      getAllTransaction(updatedCurrentPage, transaction.pageSize,transaction.searchParam,transaction.fromDate,transaction.toDate,transaction.companyId?.toString(),transaction.isC2CCard);

    }
  };

  const convertToCSV = <T extends Record<string, any>>(json: T[]): string => {
    const items = json;
    const replacer = (key: string, value: any) => (value === null ? "" : value);

    // Get the headers and capitalize the first letter of each
    const header = Object.keys(items[0]).map(
      (fieldName) => fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
    );

    // Create the CSV rows
    let csv = items.map((row) =>
      header
        .map((fieldName) =>
          JSON.stringify(
            row[fieldName.charAt(0).toLowerCase() + fieldName.slice(1)],
            replacer
          )
        )
        .join(",")
    );

    // Add the headers to the CSV
    csv.unshift(header.join(","));
    return csv.join("\r\n");
  };

  const exportToExcel = async (): Promise<any> => {
    try {
      const response = await TransactionService.exportTransactions(
        transaction.searchParam ?? "",
        transaction.fromDate ?? null,
        transaction.toDate ?? null,
        transaction.companyId ?? "",
        transaction.isC2CCard ?? null
      );
  
      // Ensure response.data is of type IExportTransaction[]
      const data: IExportTransaction[] = response.data;

      // Format transactionDate to only include the date (MM/DD/YYYY)
    const formattedData = data.map((entry) => ({
      ...entry,
      transactionDate: entry.transactionDate
        ? `${convertUtcToEst(entry.transactionDate).date}, ${convertUtcToEst(entry.transactionDate).time} ` // Only include the date part
        : "",
    }));
  
      // Check user role and remove the company field if user role is Admin
      let modifiedData: Partial<IExportTransaction>[] = formattedData;
      if (userRole.includes(UserRole.Admin)) {
        modifiedData = data.map(({ company, ...rest }) => rest);
      }
  
      // Convert JSON to CSV
      const csvData = convertToCSV<Partial<IExportTransaction>>(modifiedData);
  
      // Create a Blob from the CSV data
      const blob = new Blob([csvData], { type: "text/csv" });
  
      // Create a URL for the Blob
      const url = window.URL.createObjectURL(blob);
  
      // Create a link element
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "transactions.csv");
  
      // Append the link to the document body
      document.body.appendChild(link);
  
      // Trigger the download
      link.click();
  
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error:any) {
      // Handle error (e.g., display an error message)
      throw new Error("Error fetching transactions data: " + error.message);
    }
  };
  

  

  const handleBackButton = () => {
    if (
      transaction.currentPage > 1 &&
      transaction.currentPage <= transaction.totalPages
    ) {
      const updatedCurrentPage = transaction.currentPage - 1;
      setAllTransaction({
        ...transaction,
        currentPage: updatedCurrentPage,
      });
      setCanPaginateBack(transaction.currentPage > 1);
      // getAllTransaction(updatedCurrentPage, transaction.pageSize);
      getAllTransaction(updatedCurrentPage, transaction.pageSize,transaction.searchParam,transaction.fromDate,transaction.toDate,transaction.companyId?.toString(),transaction.isC2CCard);

    }
  };

  return (
    <div className="pt-1.5 lg:pt-2 accounting_grid">
      <div className="relative -mr-0.5">
        <div className="text-right">
          <Button
            isRounded={false}
            classes="bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 py-1.5 font-semibold text-xs text-white rounded shadow-lg inline-flex items-center"
            title={"Export"}
            handleClick={() => {
              // exportToExcel();  // Invoke the function here
              if (transaction.fromDate == null && transaction.toDate == null)
                toast.info(
                  "Please select a date range for exporting the transactions."
                );
              else exportToExcel();
            }}
            icon={<FaFileExport className="mr-1.5"></FaFileExport>}
            type={"button"}
          ></Button>
        </div>
        <div className="mt-1.5">
        {showSpinner ? (
               <Spinner />
            ) : (
               <>
                   <ExpandableGrid
  data={transaction.items}
  columns={createColumns(userRole)}
  onExpand={handleExpand}
  expandedColumns={columnsForExpandedGrid}
/>
          {transaction && (
            <Pagination
              numberOfItemsPerPage={transaction.pageSize}
              currentPage={transaction.currentPage}
              totalPages={transaction.totalPages}
              totalRecords={transaction.totalCount}
              handleFrontButton={handleFrontButton}
              handleBackButton={handleBackButton}
              canPaginateBack={canPaginateBack}
              canPaginateFront={canPaginateFront}
            />
          )}
               </>
            )}
        </div>
      </div>
    </div>
  );
};

export default Transaction;
