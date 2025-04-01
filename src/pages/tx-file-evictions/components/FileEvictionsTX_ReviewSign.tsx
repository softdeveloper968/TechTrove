import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import { UserRole } from "utils/enum";
import * as yup from "yup";
import Grid from "components/common/grid/GridWithToolTip";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import Spinner from "components/common/spinner/Spinner";
import Drawer from "components/common/drawer/Drawer";
import { useFileEvictionsTXContext } from "../FileEvictionsTXContext";
import { IFileEvictionsTXItems, IFileEvictionTXImportCsv, UploadedDocuments } from "interfaces/file-evictions-tx.interface";
import { IGridHeader } from "interfaces/grid-interface";
import { useAuth } from "context/AuthContext";
import { ErrorMessage, Field, Form, Formik, useFormik } from "formik";
import ConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import HelperViewPdfService from "services/helperViewPdfService";
import { IFileEvictionSign } from "interfaces/file-evictions.interface";
import FileEvictionService from "services/file-evictions.service";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { toCssClassName } from "utils/helper";

type AddtoReviewSignProps = {
    showFileEvictionPopup: boolean;
    handleClose: () => void;
};

const FileEvictionsTX_ReviewSign = (props: AddtoReviewSignProps) => {
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const validateBulkRecords = (records:IFileEvictionsTXItems[]) => {
        
        return records.every(record => {
          // Check if tenant1Phone or tenant1Email has a value
          const hasPhoneOrEmail = record.tenant1Phone||record.tenant1Email ;
          const isTXstate=record.tenantState.toLowerCase()=="tx";
          // Check if Attachments array contains at least one BatchUpload or Petition type
          const hasRequiredAttachmentType = record.attachments?.some(
            (attachment) => attachment.type === 'BatchUpload' || attachment.type === 'Petition'
          );
      
          // Return true if both conditions are satisfied
          return hasPhoneOrEmail && hasRequiredAttachmentType && isTXstate;
        });
      };
    // Open confirmation modal
    const handleFileClick = () => {
        
        if(validateBulkRecords(bulkRecords))
            setShowConfirmationModal(true);
        else
            toast.error("These case(s) have incomplete pending information that needs to be filled before proceeding with filing the case(s). Please check and try again")
    };
    const initialColumnMapping: IGridHeader[] = [
        { columnName: "county", label: "County" },
        { columnName: "court", label: "Court" },
        { columnName: "tenant1Last", label: "Tenant1Last" },
        { columnName: "tenant1First", label: "Tenant1First" },
        { columnName: "tenant1MI", label: "Tenant1MI" },
        { columnName: "tenant1Phone", label: "Tenant1Phone" },
        { columnName: "tenant1Email", label: "Tenant1Email" },
        { columnName: "andAllOtherOccupants", label: "AndAllOtherOccupants" },
        {
            columnName: "tenantAddress",
            label: "TenantAddress",
            className: "TenantAddress",
        },
        { columnName: "tenantUnit", label: "TenantUnit" },
        { columnName: "tenantCity", label: "TenantCity" },
        { columnName: "tenantState", label: "TenantState" },
        { columnName: "tenantZip", label: "TenantZip" },
        { columnName: "tenant2Last", label: "Tenant2Last" },
        { columnName: "tenant2First", label: "Tenant2First" },
        { columnName: "tenant2MI", label: "Tenant2MI" },
        { columnName: "tenant2Phone", label: "Tenant2Phone" },
        { columnName: "tenant2Email", label: "Tenant2Email" },
        { columnName: "tenant3Last", label: "Tenant3Last" },
        { columnName: "tenant3First", label: "Tenant3First" },
        { columnName: "tenant3MI", label: "Tenant3MI" },
        { columnName: "tenant3Phone", label: "Tenant3Phone" },
        { columnName: "tenant3Email", label: "Tenant3Email" },
        { columnName: "tenant4Last", label: "Tenant4Last" },
        { columnName: "tenant4First", label: "Tenant4First" },
        { columnName: "tenant4MI", label: "Tenant4MI" },
        { columnName: "tenant4Phone", label: "Tenant4Phone" },
        { columnName: "tenant4Email", label: "Tenant4Email" },
        { columnName: "tenant5Last", label: "Tenant5Last" },
        { columnName: "tenant5First", label: "Tenant5First" },
        { columnName: "tenant5MI", label: "Tenant5MI" },
        { columnName: "tenant5Phone", label: "Tenant5Phone" },
        { columnName: "tenant5Email", label: "Tenant5Email" },
        { columnName: "propertyCode", label: "PropertyCode" },
        { columnName: "propertyName", label: "PropertyName" },
        { columnName: "propertyPhone", label: "PropertyPhone" },
        {
            columnName: "propertyEmail",
            label: "PropertyEmail",
            className: "PropertyEmail",
        },
        {
            columnName: "propertyAddress",
            label: "PropertyAddress",
            className: "PropertyAddress",
        },
        { columnName: "propertyCity", label: "PropertyCity" },
        { columnName: "propertyState", label: "PropertyState" },
        { columnName: "propertyZip", label: "PropertyZip" },
        { columnName: "attorneyName", label: "AttorneyName" },
        { columnName: "attorneyBarNo", label: "AttorneyBarNo" },
        { columnName: "filerBusinessName", label: "FilerBusinessName" },
        { columnName: "evictionFilerEMail", label: "EvictionFilerEmail" },
        { columnName: "clientReferenceId", label: "ClientReferenceId" },
        { columnName: "courtesyCopies", label: "CourtesyCopies" },
        { columnName: "BatchUpload", label: "BatchUpload" },
      { columnName: "Petition", label: "Petition" },
      { columnName: "Notice", label: "Notice" },
      { columnName: "SCRAReport", label: "SCRAReport" },
      { columnName: "SCRAAffidavit", label: "SCRAAffidavit" },
      { columnName: "Lease", label: "Lease" },
      { columnName: "SupplementalDocuments1", label: "SupplementalDocuments1" },
      { columnName: "SupplementalDocuments2", label: "SupplementalDocuments2" },
        // { columnName: "Documents", label: "Documents" },
    ];
    const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
    const {
        bulkRecords,
        showSpinner,
        selectedFileEvictionId,
        getFileEvictions,
        fileEvictions
    } = useFileEvictionsTXContext();

    const handleSubmit = async () => {
        try {
            let request: IFileEvictionSign = {
                sign: "N/A",
                evictionIds: selectedFileEvictionId,
            };
            const apiResponse = await FileEvictionService.signFileEvictionTX(request);
            if (apiResponse.status === HttpStatusCode.Ok) {
                toast.success("Summon(s) successfully Filed", {
                    position: toast.POSITION.TOP_RIGHT,
                });
                props.handleClose();
                getFileEvictions(1, 100,fileEvictions.isViewAll??true, fileEvictions.searchParam);
            }
        }
        catch (error) {

        }
    };
    const handleCellRendered = (
        cellIndex: number,
        data: IFileEvictionsTXItems,
        rowIndex: number
    ) => {
        const columnName = visibleColumns[cellIndex]?.label;
        const propertyName = visibleColumns[cellIndex]?.columnName;
        const cellValue = (data as any)[propertyName];
        const renderers: Record<string, () => JSX.Element> = {
            BatchUpload:()=>renderSingleDocument(data.attachments.find(x => x.type === "BatchUpload")??null),
            Petition:()=>renderSingleDocument(data.attachments.find(x => x.type === "Petition")??null),
            Notice:()=>renderSingleDocument(data.attachments.find(x => x.type === "Notice")??null),
            SCRAReport:()=>renderSingleDocument(data.attachments.find(x => x.type === "SCRAReport")??null),
            SCRAAffidavit:()=>renderSingleDocument(data.attachments.find(x => x.type === "SCRAAffidavit")??null),
            Lease:()=>renderSingleDocument(data.attachments.find(x => x.type === "Lease")??null),
            SupplementalDocuments1:()=>renderSingleDocument(data.attachments.find(x => x.type === "SCRAReport")??null),
            SupplementalDocuments2:()=>renderSingleDocument(data.attachments.find(x => x.type === "SCRAReport")??null),
            //Documents: () => renderSingleDocuments(data.attachments ?? null),
        };

        const renderSingleDocument = (data: UploadedDocuments| null) => {
            if (data) {
                return (
                    <div className="flex flex-wrap">
                        <div
                                key={data.id}
                                className="relative"
                            >
                                <h1
                                    onClick={() => handleDocumentClick(data.uri ?? '')}
                                    className="underline text-[#2472db] mr-5"
                                    style={{ cursor: 'pointer' }}
                                >
                                    {data.fileName}
                                </h1>
                            </div>
                    </div>
                )
            }
            return <></>
        }
        const renderer = renderers[propertyName ?? ""] || (() => formattedCell(cellValue));

        // Check if the column exists in visibleColumns and render the cell value
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
    const handleDocumentClick = async (url: string) => {
        
        HelperViewPdfService.GetPdfView(url);
    };
    const renderDocuments = (data: UploadedDocuments[] | null) => {
        if (data) {
            return (
                <div className="flex flex-wrap">
                    {data.map((item) => (
                        <div
                            key={item.id}
                            className="relative"
                        >
                            <h1
                                onClick={() => handleDocumentClick(item.uri ?? '')}
                                className="underline text-[#2472db] mr-5"
                                style={{ cursor: 'pointer' }}
                            >
                                {item.type}
                            </h1>
                        </div>
                    ))}
                </div>
            )
        }
        return <></>
    }
    const formattedCell = (value: any) => (
        <span>{value !== null ? value : ""}</span>
    );
    return (
        <>
            <Drawer
                openDrawer={props.showFileEvictionPopup}
                onClose={() => {
                    props.handleClose();
                    //  resetSelectedRows();
                }}
            >
                {showSpinner && <Spinner />}
                {/* Container for the content */}
                <div id="fullPageContent">
                    <div className="bg-white pb-1.5 pt-4 p-3.5 md:p-5 !pb-1">
                        <div className="md:flex md:items-center justify-between text-center md:text-left mb-1.5 -mt-1.5">
                            <h3
                                className="leading-5 text-gray-900 text-[16px] md:text-xl mb-0"
                                id="modal-title"
                            >
                                File Evictions
                            </h3>
                        </div>

                        {/* Display the grid*/}
                        <div className="relative pt-1 writlabor-writofpossession-grid">
                            <Grid
                                columnHeading={initialColumnMapping}
                                rows={bulkRecords}
                                showInPopUp={true}
                                cellRenderer={(
                                    data: IFileEvictionsTXItems,
                                    rowIndex: number,
                                    cellIndex: number
                                ) => {
                                    return handleCellRendered(cellIndex, data, rowIndex);
                                }}
                            ></Grid>
                            <div className="py-2.5 flex justify-between mt-1.5 items-center">
                                <p className="font-semibold text-[10px] md:text-xs">Total record(s): {bulkRecords?.length}</p>

                                <div className="flex space-x-2">
                                    {/* Cancel Button */}
                                    <Button
                                        handleClick={props.handleClose} // Pass the function reference here
                                        title="Cancel"
                                        isRounded={false}
                                        type={"button"}
                                        classes="text-[11px] md:text-xs bg-gray-500 inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                                    ></Button>
                                    {/* File Button */}
                                    <Button
                                        handleClick={handleFileClick}
                                        title="File"
                                        isRounded={false}
                                        type={"button"}
                                        disabled={!bulkRecords.length}
                                        classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                                    ></Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Confirmation Modal */}
                {showConfirmationModal && (
                    <div>
                        <ConfirmationBox
                            heading={"File Eviction"}
                            message={`Are you sure you want to file ${bulkRecords.length} case(s)?`}
                            showConfirmation={showConfirmationModal}
                            confirmButtonTitle="Yes"
                            cancelButtonTitle="No"
                            closePopup={() => {
                                setShowConfirmationModal(false);
                            }}
                            handleSubmit={() => {
                                setShowConfirmationModal(false);
                                handleSubmit();
                                props.handleClose();
                            }}
                        ></ConfirmationBox>
                    </div>
                )}
            </Drawer>
        </>
    );
};

export default FileEvictionsTX_ReviewSign;