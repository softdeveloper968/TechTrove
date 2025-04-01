import React from "react";
import { useEffect, useState } from "react";
import Grid from "components/common/grid/Grid";
import GridCheckbox from "components/formik/GridCheckBox";
import Spinner from "components/common/spinner/Spinner";
import Pagination from "components/common/pagination/Pagination";
import { useWritsOfPossessionContext } from "../WritsOfPossessionContext";
import { IWritsOfPossessionItems } from "interfaces/writs-of-possession.interface";
import { ITenant } from "interfaces/all-cases.interface";
import { formattedDate, toCssClassName } from "utils/helper";

// Define the props interface with a  type 'IWritsOfPossession'
type WritsOfPossessionGridProps = {};
const initialColumnMapping = {
  isChecked: "isChecked",
  "Case No": "caseNo",
  "Writ PDFs": "WritPDFs",
  "Property Name": "propertyName",
  County: "county",
  // "First Name": "firstName",
  // "Last Name": "lastName",
  TenantOne: "tenantOne",
  TenantTwo: "tenantTwo",
  TenantThree: "tenantThree",
  TenantFour: "tenantFour",
  TenantFive: "tenantFive",
  // Unit: "unit",
  Address: "address",
  // City: "city",
  // State: "state",
  // Zip: "zip",
  "Eviction Date Filed": "evictionDateFiled",
  "Eviction Service Date": "evictionServiceDate",
  EvictionLastDayToAnswer : "lastDaytoAnswer",
  "Court Date": "courtDate",
  "Writ File Date": "writFileDate",
  "Writ Labor Name": "writLaborName",
  "Writ Affiant Signature": "writAffiantSignature",
  Amended: "amended",
};
// React functional component 'WritsOfPossessionGrid' with a generic type 'IWritsOfPossession'
const WritsOfPossessionGrid = (props: WritsOfPossessionGridProps) => {
  //  integrated Writs Of Possession here
  const {
    writsOfPossession,
    getAllWritsOfPossession,
    showSpinner,
    setSelectedWritsOfPossessionId,
  } = useWritsOfPossessionContext();

  // State variables for pagination for next and previous button
  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
    writsOfPossession.currentPage > 1
  );
  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
    writsOfPossession.totalPages > 1
  );
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<Array<boolean>>(
    Array(writsOfPossession.items?.length).fill(false)
  );
  const [WritsOfPossessionRecords, setWritsOfPossessionRecords] = useState<
    IWritsOfPossessionItems[]
  >([]);

  const [visibleColumns] = useState<string[]>(
    Object.keys(initialColumnMapping)
  );

  const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
  const [lastClickedRowIndex, setLastClickedRowIndex] = useState<number>(-1);
  // useEffect to update pagination and grid data when 'rows' or 'numberOfItemsPerPage' changes
  useEffect(() => {
    
    const writsOfPssessionRecords = writsOfPossession.items.map((item: any) => {
      return {
        isChecked: false, // Add the new property
        ...item, // Spread existing properties
      };
    });
    setWritsOfPossessionRecords(writsOfPssessionRecords);
    // Enable/disable pagination buttons based on the number of total pages
    setCanPaginateBack(writsOfPossession.currentPage > 1);
    setCanPaginateFront(writsOfPossession.totalPages > 1);
    setSelectedRows(Array(writsOfPossession.items?.length).fill(false));

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
  }, [writsOfPossession]);

  // Event handler for the 'Back' button
  const handleBackButton = () => {
    if (
      writsOfPossession.currentPage > 1 &&
      writsOfPossession.currentPage <= writsOfPossession.totalPages
    ) {
      const updatedCurrentPage = writsOfPossession.currentPage - 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(writsOfPossession.currentPage > 1);
      // back button get writs of possession
      // getAllWritsOfPossession(
      //   updatedCurrentPage,
      //   writsOfPossession.pageSize,
      //   writsOfPossession.searchParam
      // );
    }
  };

  // // Event handler for the 'Next' button
  const handleFrontButton = () => {
    if (writsOfPossession.currentPage < writsOfPossession.totalPages) {
      const updatedCurrentPage = writsOfPossession.currentPage + 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(updatedCurrentPage > 1);
      // back button get writs of possession
      // getAllWritsOfPossession(
      //   updatedCurrentPage,
      //   writsOfPossession.pageSize,
      //   writsOfPossession.searchParam
      // );
    }
  };

  // const handleCheckBoxChange = (index: number, checked: boolean) => {
  //   const updatedSelectedRows = [...selectedRows];
  //   updatedSelectedRows[index] = checked;
  //   setSelectedRows(updatedSelectedRows);
  //   const selectedIds = (writsOfPossession.items || [])
  //     .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
  //     .map((item) => item.id)
  //     .filter((id): id is string => typeof id === "string");
  //   setSelectedWritsOfPossessionId(selectedIds);
  // };

  const [newSelectedRows, setNewSelectedRows] = useState<boolean[]>([]);

  const handleCheckBoxChange = (index: number, checked: boolean) => {
    if (
      shiftKeyPressed &&
      lastClickedRowIndex !== -1 &&
      writsOfPossession.items
    ) {
      const start = Math.min(index, lastClickedRowIndex);
      const end = Math.max(index, lastClickedRowIndex);
      setSelectedRows(
        Array.from({ length: selectedRows.length }, (_, i) =>
          i >= start && i <= end ? (selectedRows[i] = true) : newSelectedRows[i]
        )
      );
      setSelectedRows(selectedRows);
      const selectedIds = (writsOfPossession.items || [])
        .filter((_, rowIndex) => selectedRows[rowIndex])
        .map((item) => item.id)
        .filter((id): id is string => typeof id === "string");
      setSelectedWritsOfPossessionId(selectedIds);
    } else {
      const updatedSelectedRows = [...selectedRows];
      updatedSelectedRows[index] = checked;
      setSelectedRows(updatedSelectedRows);

      if (writsOfPossession.items.length === updatedSelectedRows.filter(item => item).length) {
        setSelectAll(true);
      } else {
        setSelectAll(false);
      }

      const selectedIds = (writsOfPossession.items || [])
        .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
        .map((item) => item.id)
        .filter((id): id is string => typeof id === "string");

      setSelectedWritsOfPossessionId(selectedIds);
    }
    setLastClickedRowIndex(index);
  };

  const handleSelectAllChange = (checked: boolean) => {
    const newSelectAll = !selectAll;
    const allIds: string[] = writsOfPossession.items
      .map((item) => item.id)
      .filter((id): id is string => typeof id === "string");
    if (checked) {
      setSelectedWritsOfPossessionId(allIds);
    } else {
      setSelectedWritsOfPossessionId([]);
    }

    setSelectAll((prevSelectAll) => {
      // Update selectedRows state
      setSelectedRows(Array(allIds.length).fill(newSelectAll));
      return newSelectAll;
    });
  };

  /**
   * Render each cell of a table
   * @param cellIndex  : cell of table
   * @param data  :data of cell
   * @param rowIndex : row index
   * @returns render cell
   */
  const handleCellRendered = (
    cellIndex: number,
    data: IWritsOfPossessionItems,
    rowIndex: number
  ) => {
    const columnName = visibleColumns[cellIndex];
    const propertyName = (initialColumnMapping as any)[columnName];
    const cellValue = (data as any)[propertyName];

    const renderers: Record<string, () => JSX.Element> = {
      evictionDateFiled: () => formattedDateCell(cellValue),
      evictionServiceDate: () => formattedDateCell(cellValue),
      lastDaytoAnswer: () => formattedDateCell(cellValue),
      courtDate: () => formattedDateCell(cellValue),
      writFileDate: () => formattedDateCell(cellValue),
      isChecked: () => (
        <GridCheckbox
          checked={selectedRows[rowIndex]}
          onChange={(checked: boolean) =>
            handleCheckBoxChange(rowIndex, checked)
          }
          label=""
        />
      ),
      // WritPDFs: () =>
      //   cellValue ? (
      //     <Link to={cellValue} className="underline text-[#2472db]">
      //       Download
      //     </Link>
      //   ) : (
      //     <></>
      //   ),
      WritPDFs: () => {
        const linkText = `Writs.{${data.id}}.PDF`;
        return cellValue ? (
          <a
            href={cellValue}
            download={linkText}
            className="underline text-[#2472db]"
          >
            {linkText}
          </a>
        ) : (
          <></>
        );
      },
      address: () => formattedAddressCell(data),
      propertyName: () => formattedCell(data.propertyName),
      tenantOne: () => formattedTenantFullName(data?.tenantNames[0]),
      tenantTwo: () => formattedTenantFullName(data?.tenantNames[1]),
      tenantThree: () => formattedTenantFullName(data?.tenantNames[2]),
      tenantFour: () => formattedTenantFullName(data?.tenantNames[3]),
      tenantFive: () => formattedTenantFullName(data?.tenantNames[4]),
    };

    const renderer =
      renderers[propertyName] || (() => formattedCell(cellValue));

    if (visibleColumns.includes(columnName)) {
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

  const formattedTenantFullName = (tenant: ITenant | null | undefined) => (
   <span>{`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`}</span>
  );

  const formattedDateCell = (value: any) => (
    <span>{value !== null ? formattedDate(value) : ""}</span>
  );

  const formattedFullNameCell = (firstName: string, lastName: string) => (
    <span>{`${firstName} ${lastName}`}</span>
  );

  const formattedCell = (value: any) => (
    <span>{value !== null ? value : ""}</span>
  );

  const formattedAddressCell = (value: IWritsOfPossessionItems) => (
    <span>
      {value != null
        ? `(${value.address})(${value.unit})(${value.city})(${value.state})(${value.zip})`
        : ""}
    </span>
  );
  // JSX structure for rendering the component
  return (
    <div className="mt-3">
      <div className="relative -mr-0.5">
        {/* Render the Grid component with column headings and grid data */}
        {showSpinner === true ? (
          <Spinner />
        ) : (
          <>
            <Grid
              columnHeading={visibleColumns}
              rows={WritsOfPossessionRecords}
              handleSelectAllChange={handleSelectAllChange}
              selectAll={selectAll}
              // cellRenderer={(
              //   data: IWritsOfPossessionItems,
              //   rowIndex: number,
              //   cellIndex: number
              // ) => {
              //   const columnNames = visibleColumns[cellIndex];
              //   const columnName = columnNames[cellIndex];
              //   const propertyName =
              //     (
              //       initialColumnMapping as Record<
              //         string,
              //         keyof IWritsOfPossessionItems
              //       >
              //     )[columnName] ||
              //     (columnName as keyof IWritsOfPossessionItems);

              //   const cellValue = data[propertyName];

              //   if (columnName === "isChecked") {
              //     return (
              //       <GridCheckbox
              //         checked={selectedRows[rowIndex]}
              //         onChange={(checked: boolean) =>
              //           handleCheckBoxChange(rowIndex, checked)
              //         }
              //         label={""}
              //       />
              //     );
              //   } else if (
              //     columnName === "evictionDateFiled" ||
              //     columnName === "evictionServiceDate" ||
              //     columnName === "lastDaytoAnswer" ||
              //     columnName === "courtDate" ||
              //     columnName === "writFileDate"
              //   ) {
              //     return (
              //       <span>
              //         {cellValue !== null
              //           ? formattedDate(cellValue as string)
              //           : ""}
              //       </span>
              //     );
              //   } else {
              //     return cellValue;
              //   }
              // }}
              cellRenderer={(
                data: IWritsOfPossessionItems,
                rowIndex: number,
                cellIndex: number
              ) => {
                return handleCellRendered(cellIndex, data, rowIndex);
              }}
            />
            {/* Render the Pagination component with relevant props */}
            <Pagination
              numberOfItemsPerPage={writsOfPossession.pageSize}
              currentPage={writsOfPossession.currentPage}
              totalPages={writsOfPossession.totalPages}
              totalRecords={writsOfPossession.totalCount}
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

// Export the component as the default export
export default WritsOfPossessionGrid;
