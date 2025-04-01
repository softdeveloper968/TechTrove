import React, { useState, ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaAngleLeft } from "react-icons/fa";
import { useAuth } from "context/AuthContext";
import { useAosQueueContext } from "../AosQueueContext";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import Pagination from "components/common/pagination/Pagination";
import HighlightedText from "components/common/highlightedText/HighlightedText";
import Button from "components/common/button/Button";
import ToggleSwitch from "components/common/toggle/ToggleSwitch";
import { IGridHeader } from "interfaces/grid-interface";
import { IAosQueueTaskItem } from "interfaces/aos.interface";
import { toCssClassName } from "utils/helper";

type AosQueueGridProps = {};

const initialColumnMapping: IGridHeader[] = [
  { columnName: "name", label: "Name", isSort: true },
  { columnName: "status", label: "Status" },
  { columnName: "disabled", label: "Disabled" }
];

const AosQueueTaskGrid = (props: AosQueueGridProps) => {
  const { queueId } = useParams();
  const { userRole } = useAuth();
  const navigate = useNavigate();
  const {
    showSpinner,
    setShowSpinner,
    aosQueueTasks,
    setAosQueueTasks,
    getAosQueueTasks
  } = useAosQueueContext();

  const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(aosQueueTasks.currentPage > 1);
  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(aosQueueTasks.totalPages > 1);

  const handleDisableChange = (
    taskId: string,
    isDisabled: boolean,
    selectedRowIndex: number,
  ) => {
    setAosQueueTasks((prev) => ({
      ...prev,
      items: prev.items.map((item, index) => {
        if (selectedRowIndex === index) {
          return {
            ...item,
            disabled: isDisabled,
          };
        }
        return item;
      }),
    }));
  };

  const handleFrontButton = () => {
    if (aosQueueTasks.currentPage < aosQueueTasks.totalPages) {
      const updatedCurrentPage = aosQueueTasks.currentPage + 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(updatedCurrentPage > 1);
    }
  };

  const handleBackButton = () => {
    if (
      aosQueueTasks.currentPage > 1 &&
      aosQueueTasks.currentPage <= aosQueueTasks.totalPages
    ) {
      const updatedCurrentPage = aosQueueTasks.currentPage - 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(aosQueueTasks.currentPage > 1);
    }
  };

  const handleSorting = (columnName: string, order: string) => {
    // Copy the current process server cases array to avoid mutating the state directly
    const sortedQueues = [...aosQueueTasks.items];

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
    setAosQueueTasks((prev) => ({
      ...prev,
      items: sortedQueues
    }));
  };

  const handleCellRendered = (cellIndex: number, data: IAosQueueTaskItem, rowIndex: number) => {
    const columnName = visibleColumns[cellIndex]?.label;
    const propertyName = visibleColumns[cellIndex]?.columnName;
    const cellValue = (data as any)[propertyName];

    const renderers: Record<string, () => JSX.Element> = {
      name: () => <HighlightedText text={cellValue ?? ''} query={aosQueueTasks.searchParam ?? ''} />,
      disabled: () => <>
        <ToggleSwitch
          value={cellValue}
          label={""}
          handleChange={(event: ChangeEvent<HTMLInputElement>) => {
            handleDisableChange(data.id, event.target.checked, rowIndex);
          }}
        ></ToggleSwitch>
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
        <div className="mb-3">
          <Button
            isRounded={false}
            title={"Back"}
            type={"button"}
            icon={<FaAngleLeft className="h-3.5 h-3.5 mr-1" />}
            handleClick={() => navigate('/aos-queue')}
            classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-1.5 px-3 text-slate-900 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
          ></Button>
        </div>
        <>
          <Grid
            columnHeading={visibleColumns}
            rows={aosQueueTasks.items}
            cellRenderer={(data: IAosQueueTaskItem, rowIndex: number, cellIndex: number) => {
              return handleCellRendered(cellIndex, data, rowIndex);
            }}
            handleSorting={handleSorting}
          />
          {/* Render the Pagination component with relevant props */}
          <Pagination
            numberOfItemsPerPage={aosQueueTasks.pageSize}
            currentPage={aosQueueTasks.currentPage}
            totalPages={aosQueueTasks.totalPages}
            totalRecords={aosQueueTasks.totalCount}
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
export default AosQueueTaskGrid;