import React, { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import { useAosQueueContext } from "../AosQueueContext";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import ToggleSwitch from "components/common/toggle/ToggleSwitch";
import { IGridHeader } from "interfaces/grid-interface";
import { IAosQueueItem } from "interfaces/aos.interface";
import { toCssClassName } from "utils/helper";

type AosQueueGridProps = {
  // handleShowTask: () => void;
};

const initialColumnMapping: IGridHeader[] = [
  { columnName: "name", label: "Name", isSort: true },
  { columnName: "status", label: "Status" },
  { columnName: "task", label: "" },
];

const AosQueueGrid = (props: AosQueueGridProps) => {
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const {
    showSpinner,
    setShowSpinner,
    aosQueues,
    setAosQueues,
    getAosQueues
  } = useAosQueueContext();

  const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(aosQueues.currentPage > 1);
  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(aosQueues.totalPages > 1);

  const handleFrontButton = () => {
    if (aosQueues.currentPage < aosQueues.totalPages) {
      const updatedCurrentPage = aosQueues.currentPage + 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(updatedCurrentPage > 1);
    }
  };

  const handleBackButton = () => {
    if (
      aosQueues.currentPage > 1 &&
      aosQueues.currentPage <= aosQueues.totalPages
    ) {
      const updatedCurrentPage = aosQueues.currentPage - 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(aosQueues.currentPage > 1);
    }
  };

  const handleSorting = (columnName: string, order: string) => {
    // Copy the current process server cases array to avoid mutating the state directly
    const sortedQueues = [...aosQueues.items];

    // Define a compare function based on the column name and order
    const compare = (a: any, b: any) => {
      // Extract values for comparison based on the column name
      let valueA: any = a[columnName];
      let valueB: any = b[columnName];

      // Implement sorting logic based on the order (ascending or descending)
      if (order === 'asc') {
        if (valueA < valueB) return -1;
        if (valueA > valueB) return 1;
        return 0;
      } else {
        if (valueA > valueB) return -1;
        if (valueA < valueB) return 1;
        return 0;
      }
    };

    // Sort the cases array using the compare function
    sortedQueues.sort(compare);

    // Update the state with sorted cases
    setAosQueues((prev) => ({
      ...prev,
      items: sortedQueues
    }));
  };

  const handleStatusChange = async (
    aosQueueId: string,
    status: boolean,
    selectedRowIndex: number,
  ) => {
    setAosQueues((prev) => ({
      ...prev,
      items: prev.items.map((item, index) => {
        if (selectedRowIndex === index) {
          return {
            ...item,
            status: status,
          };
        }
        return item;
      }),
    }));
  };

  const handleCellRendered = (cellIndex: number, data: IAosQueueItem, rowIndex: number) => {
    const columnName = visibleColumns[cellIndex]?.label;
    const propertyName = visibleColumns[cellIndex]?.columnName;
    const cellValue = (data as any)[propertyName];

    const renderers: Record<string, () => JSX.Element> = {
      name: () => <HighlightedText text={cellValue ?? ''} query={aosQueues.searchParam ?? ''} />,
      status: () => <>
        <ToggleSwitch
          value={cellValue}
          label={cellValue ? "Running" : "Stopped"}
          handleChange={(event: ChangeEvent<HTMLInputElement>) => {
            handleStatusChange(data.id, event.target.checked, rowIndex);
          }}
        ></ToggleSwitch>
      </>,
      task: () => <>
        <button
          onClick={() => navigate(`/aos-queue/${data.id}`)}
          className="bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 md:px-4 py-2 font-medium text-[12px] md:text-[13px] text-white rounded-md shadow-lg inline-flex items-center text-nowrap">
          View Tasks
        </button>
      </>,
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

  return (
    <div className="my-1.5 bg-white p-3 md:p-3.5 pb-3.5 md:pb-4 rounded-md shadow-md shadow-slate-300">
      <div className="relative -mr-0.5">
        {showSpinner && <Spinner />}
        <>
          <Grid
            columnHeading={visibleColumns}
            rows={aosQueues.items}
            cellRenderer={(data: IAosQueueItem, rowIndex: number, cellIndex: number) => {
              return handleCellRendered(cellIndex, data, rowIndex);
            }}
            handleSorting={handleSorting}
          />
          {/* Render the Pagination component with relevant props */}
          <Pagination
            numberOfItemsPerPage={aosQueues.pageSize}
            currentPage={aosQueues.currentPage}
            totalPages={aosQueues.totalPages}
            totalRecords={aosQueues.totalCount}
            handleFrontButton={handleFrontButton}
            handleBackButton={handleBackButton}
            canPaginateBack={canPaginateBack}
            canPaginateFront={canPaginateFront}
          />
        </>
      </div>
    </div>
  );

};

export default AosQueueGrid;