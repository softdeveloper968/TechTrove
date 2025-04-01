import React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { FaCopy } from "react-icons/fa";
import { useProcessServerDocumentContext } from "./ProcessServerDocumentsContext";
import {
  IProcessServerDocumentInfoItems,
  IServerDocument,
} from "interfaces/process-server.interface";
import { IGridHeader } from "interfaces/grid-interface";
import HelperViewPdfService from "services/helperViewPdfService";
import Grid from "components/common/grid/GridWithToolTip";
import Spinner from "components/common/spinner/Spinner";
import Pagination from "components/common/pagination/Pagination";
import { convertUtcToEst, formattedDate, toCssClassName } from "utils/helper";

type ProcessServerDocumentsGridProps = {};

const initialColumnMapping: IGridHeader[] = [
  { columnName: "name", label: "ServerName" },
//   { columnName: "email", label: "Email" },
  { columnName: "court", label: "Court" },
  { columnName: "uploadedDate", label: "UploadedDate" },
  { columnName: "documents", label: "Document" },
];

const ProcessServerDocumentsGrid = (props: ProcessServerDocumentsGridProps) => {
  const { showSpinner, processServerDocuments, getProcessServerDocuments } =
    useProcessServerDocumentContext();
  const isMounted = useRef(true);
  const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
    processServerDocuments.currentPage > 1
  );
  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
    processServerDocuments.totalPages > 1
  );

  useEffect(() => {
    if (isMounted.current) {
      getProcessServerDocuments(1, 100);
      isMounted.current = false;
    }
  }, []);

  const handleFrontButton = () => {
    if (
      processServerDocuments.currentPage < processServerDocuments.totalPages
    ) {
      const updatedCurrentPage = processServerDocuments.currentPage + 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(updatedCurrentPage > 1);
      getProcessServerDocuments(
        updatedCurrentPage,
        processServerDocuments.pageSize
      );
    }
  };

  const handleBackButton = () => {
    if (
      processServerDocuments.currentPage > 1 &&
      processServerDocuments.currentPage <= processServerDocuments.totalPages
    ) {
      const updatedCurrentPage = processServerDocuments.currentPage - 1;
      // Update current page and enable/disable 'Back' button
      setCanPaginateBack(processServerDocuments.currentPage > 1);
      getProcessServerDocuments(
        updatedCurrentPage,
        processServerDocuments.pageSize
      );
    }
  };

  const handleCellRendered = (
    cellIndex: number,
    data: IProcessServerDocumentInfoItems,
    rowIndex: number
  ) => {
    const columnName = visibleColumns[cellIndex]?.label;
    const propertyName = visibleColumns[cellIndex]?.columnName;
    const cellValue = (data as any)[propertyName];
    const renderers: Record<string, () => JSX.Element> = {
      name: () => formattedCell(cellValue),
      email: () => formattedCell(cellValue),
      court: () => renderCourts(data.documents),
      uploadedDate: () => formattedDateCell(data?.documents[0]?.uploadedDate),
      documents: () => renderDocumentsCell(cellValue),
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
  // const formattedDateCell = (value: any) => (
  //   <span>{value !== null ? formattedDate(value) : ""}</span>
  // );
  const formattedDateCell = (value: any) => (
    <span>{value !== null ? convertUtcToEst(value).date : ""}</span>
 //   <span>{value !== null ? formattedDate(value) : ""}</span>
 );
  const formattedCell = (value: any) => <span>{value ? value : ""}</span>;
  const [hoveredDocumentId, setHoveredDocumentId] = useState<string | null>(null);
  const renderDocumentsCell = (cellValue: IServerDocument[]) => {
    const handleCopyClick = (url: string) => {      
      navigator.clipboard.writeText(url);
      toast.success("Document URL copied to clipboard!");
   };
    return (
      <div className="flex flex-wrap">
        {cellValue.map((item: IServerDocument) => (
          // <h1
          //   key={item.id}
          //   onClick={() => handleDocumentClick(item.url)}
          //   className="underline text-[#2472db] mr-1.5 hover:cursor-pointer"
          //   style={{ cursor: "pointer" }}
          // >
          //   {item.name}
          // </h1>
          <div
          key={item.id}
          className="relative"
          onMouseEnter={() => setHoveredDocumentId(item.id)}
          onMouseLeave={() => setHoveredDocumentId(null)}
        >
          <h1
            onClick={() => handleDocumentClick(item.url)}
            className="underline text-[#2472db] mr-5"
            style={{ cursor: 'pointer' }}
          >
            {item.name}
          </h1>
          {hoveredDocumentId === item.id && (
            <FaCopy
              className="w-4 h-4 text-gray-500 absolute right-0 top-0 cursor-pointer ml-9"
              onClick={() => handleCopyClick(item.url)}
            />
          )}
        </div>
        ))}
      </div>
    );
  };
  const renderCourts = (data: IServerDocument[]) => {
    if (!data || data.length === 0) {
      return <span>No court information available</span>;
    }

    const courtNames = data.map((doc) => doc.court).join(", ");

    return <span>{courtNames}</span>;
  };

  const handleDocumentClick = async (url: string) => {
    HelperViewPdfService.GetPdfView(url);
  };
  return (
    <>
      <div className="mt-2.5">
        <div className="relative -mr-0.5">
        {showSpinner ? (
               <Spinner />
            ) : (
               <>
                  <Grid
              columnHeading={visibleColumns}
              rows={processServerDocuments.items}
              cellRenderer={(
                data: IProcessServerDocumentInfoItems,
                rowIndex: number,
                cellIndex: number
              ) => {
                return handleCellRendered(cellIndex, data, rowIndex);
              }}
            />
            {/* Render the Pagination component with relevant props */}
            <Pagination
              numberOfItemsPerPage={processServerDocuments.pageSize}
              currentPage={processServerDocuments.currentPage}
              totalPages={processServerDocuments.totalPages}
              totalRecords={processServerDocuments.totalCount}
              handleFrontButton={handleFrontButton}
              handleBackButton={handleBackButton}
              canPaginateBack={canPaginateBack}
              canPaginateFront={canPaginateFront}
            />
               </>
            )}
        </div>
      </div>
    </>
  );
};

export default ProcessServerDocumentsGrid;
