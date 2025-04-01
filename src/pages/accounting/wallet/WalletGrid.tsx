import React, { useEffect, useState } from "react";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { FaPlus, FaCreditCard, FaMoneyBillWave } from "react-icons/fa";
import WalletForm from "./WalletModal";
import Card from "../dashboard/Card";
import Spinner from "components/common/spinner/Spinner";
import Pagination from "components/common/pagination/Pagination";
import Grid from "components/common/grid/GridWithToolTip";
import Button from "components/common/button/Button";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import { UserRole } from "utils/enum";
import WalletService from "services/wallet.service";
import { IWalletItems } from "interfaces/wallet.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { useAccountingContext } from "../AccountingContext";
import { useAuth } from "context/AuthContext";
import { toCssClassName } from "utils/helper";

const initialColumnMapping: IGridHeader[] = [
  { columnName: "companyName", label: "CompanyName" },
  { columnName: "balance", label: "Amount" , className:'text-right' },
  { columnName: "limit", label: "Limit", className:'text-right'  },
  { columnName: "isNoLimit", label: "NoLimit" },
];
const Wallet = () => {
  const {
    wallet,
    setAllWallet,
    getAllWallet,
    clientWallet,
    getClientWallet,
    showSpinner,
    setShowSpinner,
    // getAllCompanies
  } = useAccountingContext();

  const { userRole } = useAuth();

  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
    wallet.currentPage > 1
  );
  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
    wallet.totalPages > 1
  );
  const [showWalletForm, setShowWalletForm] = useState<Boolean>(false);
  //visible columns
  const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);

  useEffect(() => {
    setAllWallet((prevAllWallet) => ({ ...prevAllWallet, searchParam: "" }));

    if (userRole.includes(UserRole.C2CAdmin)||userRole.includes(UserRole.ChiefAdmin) ) {
      getAllWallet(1, 100, "");
    } else {
      getClientWallet();
    }
  }, []);

  /**
   * Render each cell of a table
   * @param cellIndex  : cell of table
   * @param data  :data of cell
   * @param rowIndex : row index
   * @returns render cell
   */
  const handleCellRendered = (
    cellIndex: number,
    data: IWalletItems,
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
      query={wallet.searchParam ?? ""}
    />
  );

  const handleFrontButton = () => {
    if (wallet.currentPage < wallet.totalPages) {
      const updatedCurrentPage = wallet.currentPage + 1;
      setAllWallet({
        ...wallet,
        currentPage: updatedCurrentPage,
      });
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(updatedCurrentPage > 1);
      // back button get late notices
      getAllWallet(updatedCurrentPage, wallet.pageSize);
    }
  };

  // Event handler for the 'Back' button
  const handleBackButton = () => {
    if (wallet.currentPage > 1 && wallet.currentPage <= wallet.totalPages) {
      const updatedCurrentPage = wallet.currentPage - 1;
      setAllWallet({
        ...wallet,
        currentPage: updatedCurrentPage,
      });
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(wallet.currentPage > 1);
      // back button get late notices
      getAllWallet(updatedCurrentPage, wallet.pageSize);
    }
  };
  const handleAddAmount = async (formValues: IWalletItems) => {
    try {
      setShowSpinner(true);
      // Attempt to delete the county
      const response = await WalletService.addAmount(formValues);
      // Check if the deletion was successful
      if (response.status === HttpStatusCode.Ok) {
        // Show success message
        toast.success("Amount added successfully.", {
          position: toast.POSITION.TOP_RIGHT,
        });
        setShowWalletForm(false);
        getAllWallet(wallet.currentPage, wallet.pageSize);
      }
    } catch (error) {
      // Handle errors if needed
      console.error(error);
    } finally {
      // Hide the spinner regardless of the outcome
      setShowSpinner(false);
    }
  };

  const cardData = [
    { title: "Credit Remaining", amount: clientWallet.balance ?? 0, icon: <FaCreditCard className="text-[#2472DB] text-2xl"/>, className: 'Wallet' },
    { title: "Estimated Monthly Burn", amount: 0, icon: <FaMoneyBillWave className="text-[#df5555] text-3xl"/>, className: 'Burn' },
  ];

  return (
    <div>
      {userRole.includes(UserRole.Admin) && (
        <div className="App pt-3">
          <div className="card-list grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xxl:grid-cols-4 gap-3 lg:gap-4 mb-3 lg:mb-4">
            {cardData.map((card, index) => (
              <Card
                key={index}
                title={card.title}
                amount={card.amount}
                icon={card.icon}
                className={card.className}
              />
            ))}
          </div>
          {/* {cardData.map((card, index) => (
            <Card key="" title="" amount="" icon="" className="" />
          ))} */}
        </div>
      )}

      {(userRole.includes(UserRole.C2CAdmin)|| userRole.includes(UserRole.ChiefAdmin)) && (
        <div className="pt-1.5 lg:pt-2 accounting_grid wallet_grid">
          <div className="relative -mr-0.5">
            <div className="text-right">
              <Button
                isRounded={false}
                classes="bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 py-1.5 font-semibold text-xs text-white rounded shadow-lg inline-flex items-center relative z-[1]"
                title={"Add Amount"}
                handleClick={() => {
                  setShowWalletForm(true);
                }}
                icon={<FaPlus className="mr-1.5"></FaPlus>}
                type={"button"}
              ></Button>
            </div>
            <div className="mt-1.5">
              {/* Render the Grid component with column headings and grid data */}
              {showSpinner === true && <Spinner />}
              <Grid
                columnHeading={visibleColumns}
                rows={wallet.items}
                cellRenderer={(
                  data: IWalletItems,
                  rowIndex: number,
                  cellIndex: number
                ) => {
                  return handleCellRendered(cellIndex, data, rowIndex);
                }}
              />
              {wallet && (
                <Pagination
                  numberOfItemsPerPage={wallet.pageSize}
                  currentPage={wallet.currentPage}
                  totalPages={wallet.totalPages}
                  totalRecords={wallet.totalCount}
                  handleFrontButton={handleFrontButton}
                  handleBackButton={handleBackButton}
                  canPaginateBack={canPaginateBack}
                  canPaginateFront={canPaginateFront}
                />
              )}
            </div>
            {showWalletForm && (
              <WalletForm
                showPopup={showWalletForm}
                closePopup={(shouldRefresh: string) => {
                  if (shouldRefresh === "refresh") {
                    getAllWallet(wallet.currentPage, wallet.totalPages);
                  }
                  setShowWalletForm(false);
                }}
                onSubmit={(formValues: IWalletItems) => {
                  handleAddAmount(formValues);
                }}
                showSpinner={showSpinner}
              ></WalletForm>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default Wallet;
