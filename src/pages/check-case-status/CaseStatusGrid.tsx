import React from "react";
import { useEffect, useState } from "react";
import Grid from "components/common/grid/Grid";
import Pagination from "components/common/pagination/Pagination";

import { IPropertyInfoAddress } from "interfaces/case.interface";

// Define the props interface with a generic type 'T'
interface CaseStatusGridProps {
  rows: IPropertyInfoAddress[] | undefined;
}

// React functional component 'CaseStatusGrid' with a generic type 'T'
const CaseStatusGrid = (props: CaseStatusGridProps) => {
  
  // State variables for pagination
  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numberOfItemsPerPage, setNumberOfItemsPerPage] = useState<number>(100);
  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(false);
  // State variable for displaying data in the grid
  const [gridData, setGridData] = useState<IPropertyInfoAddress[] | undefined>(
    props.rows
  );


  // useEffect to update pagination and grid data when 'rows' or 'numberOfItemsPerPage' changes
  useEffect(() => {
    // Calculate total pages based on the number of items and items per page
    const totalPages = props.rows
      ? Math.ceil(props.rows.length / numberOfItemsPerPage)
      : 0;
    setTotalPages(totalPages);

    // Reset to the first page
    setCurrentPage(1);

    // Enable/disable pagination buttons based on the number of total pages
    setCanPaginateBack(false);
    setCanPaginateFront(totalPages > 1);

    // Calculate the range of items to display for the current page
    const indexOfLastItem = currentPage * numberOfItemsPerPage;
    const indexOfFirstItem = indexOfLastItem - numberOfItemsPerPage;

    // Slice the 'rows' array to get the data for the current page
    const records =
      props.rows && props.rows.slice(indexOfFirstItem, indexOfLastItem);

    // Update the grid data with the sliced records
    setGridData(records);
  }, [props.rows, numberOfItemsPerPage]);

  // Event handler for the 'Back' button
  const handleBackButton = () => {
    if (currentPage > 1 && currentPage <= totalPages) {
      const updatedCurrentPage = currentPage - 1;

      // Update current page and enable/disable 'Back' button
      setCurrentPage(updatedCurrentPage);
      setCanPaginateBack(updatedCurrentPage > 1);

      // Calculate the range of items to display for the updated current page
      const indexOfLastItem = updatedCurrentPage * numberOfItemsPerPage;
      const indexOfFirstItem = indexOfLastItem - numberOfItemsPerPage;

      // Slice the 'rows' array to get the data for the updated current page
      const records =
        props.rows && props.rows.slice(indexOfFirstItem, indexOfLastItem);

      // Update the grid data with the sliced records
      setGridData(records);
    }
  };

  // Event handler for the 'Next' button
  const handleFrontButton = () => {
    if (currentPage < totalPages) {
      const updatedCurrentPage = currentPage + 1;

      // Update current page and enable/disable 'Back' button
      setCurrentPage(updatedCurrentPage);
      setCanPaginateBack(updatedCurrentPage > 1);

      // Calculate the range of items to display for the updated current page
      const indexOfLastItem = updatedCurrentPage * numberOfItemsPerPage;
      const indexOfFirstItem = indexOfLastItem - numberOfItemsPerPage;

      // Slice the 'rows' array to get the data for the updated current page
      const records =
        props.rows && props.rows.slice(indexOfFirstItem, indexOfLastItem);

      // Update the grid data with the sliced records
      setGridData(records);
    }
  };

  // JSX structure for rendering the component
  return (
    <div className="pt-3">
      <div className="relative -mr-0.5">
        {/* Render the Grid component with column headings and grid data */}
        <Grid
          columnHeading={[
            "Property Name",
            "Street1",
            "Street2",
            "City",
            "State Code",
            "Zip Code",
            "Name",
            "Filer Email",
            "Case Number",
          ]}
          rows={gridData}
          cellRenderer={(data: any, rowIndex: number, cellIndex: number) => {
            const columnNames = Object.keys(data);
            const columnName = columnNames[cellIndex];
            const cellValue = data[columnName];

            return cellValue;
          }}
        />
        {/* Render the Pagination component with relevant props */}
        <Pagination
          numberOfItemsPerPage={numberOfItemsPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          totalRecords={0}
          handleFrontButton={handleFrontButton}
          handleBackButton={handleBackButton}
          canPaginateBack={canPaginateBack}
          canPaginateFront={canPaginateFront}
        />
      </div>
    </div>
  );
};

// Export the component as the default export
export default CaseStatusGrid;
