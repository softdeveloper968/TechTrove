import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import {
   IAllCasesItems,
   ISelectOptions,
   IAllCasesReason,
   ITenant,
   IDismissalReason,
} from "interfaces/all-cases.interface";
import { IGridHeader } from "interfaces/grid-interface";
// import Grid from "components/common/grid/Grid";
import Grid from "components/common/grid/GridWithToolTip";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import Spinner from "components/common/spinner/Spinner";
import DropdownPresentation from "components/common/dropdown/DropDown";
import GridCheckbox from "components/formik/GridCheckBox";
import { ReasonList } from "utils/constants";
import { UserRole } from "utils/enum";
import { convertToISOString, convertUtcToEst, formattedDate, mapDismissalReasonToEnum, toCssClassName } from "utils/helper";
import { useAuth } from "context/AuthContext";
import { useAllCasesContext } from "../../AllCasesContext";
import AllCasesService from "services/all-cases.service";
import AuthService from "services/auth.service";

type AddtoDismissalProps = {
   showAddtoDismissalPopup: boolean;
   handleClose: () => void;
   handleReviewSign: () => void;
   errorMsg: string;
   handleShowUnFindCases: () => void;
};

const initialColumnMapping: IGridHeader[] = [
   { columnName: "isChecked", label: "Bulk Edit", controlType: "checkbox", toolTipInfo: "This checkbox represents bulk update only" },
   { columnName: "county", label: "County" },
   { columnName: "caseNo", label: "CaseNo", toolTipInfo: "The unique number or code associated with your case, as assigned by the court. " },
   { columnName: "propertyVsTenants", label: "PropertyName Vs. Tenants" },
   //   {columnName:"tenantOne",label:"TenantOne"},
   //   {columnName:"tenantTwo",label:"TenantTwo"},
   //   {columnName:"tenantThree",label:"TenantThree"},
   //   {columnName:"tenantFour",label:"TenantFour"},
   //   {columnName:"tenantFive",label:"TenantFive"},
   { columnName: "address", label: "TenantAddressCombined" },
   { columnName: "reason", label: "DismissalReason", toolTipInfo: "The reason you are filing for dismissal." },
   { columnName: "propertyName", label: "PropertyName" },
   { columnName: "evictionDateFiled", label: "EvictionDateFiled", toolTipInfo: "The day the eviction case was accepted by the court." },
   { columnName: "evictionServiceDate", label: "EvictionServiceDate", toolTipInfo: "The date the case documents were delivered to the tenant by sheriff or private process server." },
   { columnName: "evictionAffiantSignature", label: "EvictionAffiantSignature", toolTipInfo: "The name that was used to sign the Eviction case document(s)." },
];

const AllCases_AddtoDismissals = (props: AddtoDismissalProps) => {
   const { userRole, setUnsignedDismissalCount } = useAuth();
   const navigate = useNavigate();
   const {
      allCases,
      setAllCases,
      selectedReason,
      setSelectedReason,
      selectedAllCasesId,
      setSelectedFilteredCasesId,
      bulkRecords,
      setBulkRecords,
      selectedCaseIdsForFiling,
      setSelectedCaseIdsForFiling,
      proceedWithDismissals
   } = useAllCasesContext();

   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [showConfirm, setShowConfirm] = useState<boolean>(false);
   const [filteredRecords, setFilteredRecords] = useState<IAllCasesItems[]>([]);
   const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
   const [selectedFilteredRows, setSelectedFilteredRows] = useState<Array<boolean>>(
      Array(filteredRecords?.length).fill(false)
   );

   useEffect(() => {
      // const allCasesRecords = bulkRecords.map((item: any, index: number) => ({
      //    ...item,

      //    reason: selectedReason[index]?.reason || "Without Prejudice",
      // }));
      const allCasesRecords = bulkRecords.map((item: any, index: number) => {
         // Convert evictionDateFiled if it exists
         const evictionFiled = item.evictionDateFiled
            ? convertUtcToEst(item.evictionDateFiled.toString()) // Convert Date to ISO string
            : null;

         const evictionDateFiled = evictionFiled
            ? convertToISOString(evictionFiled.date, evictionFiled.time)
            : null;

         // Convert evictionServiceDate if it exists
         const evictionService = item.evictionServiceDate
            ? convertUtcToEst(item.evictionServiceDate.toString()) // Convert Date to ISO string
            : null;

         const evictionServiceDate = evictionService
            ? convertToISOString(evictionService.date, evictionService.time)
            : null;

         return {
            ...item,
            reason: selectedReason[index]?.reason || "Without Prejudice",
            evictionDateFiled: evictionDateFiled,
            evictionServiceDate: evictionServiceDate
         };
      });
      let records: React.SetStateAction<IAllCasesItems[]> = [];
      const selectedIds = selectedCaseIdsForFiling.length
         ? selectedCaseIdsForFiling
         : selectedAllCasesId;

      records = allCasesRecords.filter((item) =>
         selectedIds.includes(item.id || "") && item.caseNo?.length
         && (proceedWithDismissals || !item.isDismissal)
      );

      setFilteredRecords(records);
      setSelectAll(false);
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

   }, [allCases.items, selectedAllCasesId]);

   // set the state of selected dropdown
   const handleDropdownChange = (
      event: React.ChangeEvent<HTMLSelectElement>,
      rowId: string | undefined | null
   ) => {
      try {
         setShowSpinner(true);

         // Update only the specific row where the dropdown is changed
         const updatedGridData = filteredRecords.map((record) => {
            if (record.id === rowId) {
               return {
                  ...record,
                  reason: event.target.value,
               };
            }
            return record;
         });
         setFilteredRecords(updatedGridData);
      } catch (error) {
         toast.error("Something went wrong");
      } finally {
         setShowSpinner(false);
      }
   };

   const handleSignature = async () => {
      try {
         setShowSpinner(true);
         const updatedReasonList: IAllCasesReason[] = filteredRecords
            .filter((record) => record.id && record.reason) // Filter out records with undefined id or reason
            .map((record) => ({
               dispoId: record.id || "", // Assign a default value for undefined id
               reason: record.reason || "", // Assign a default value for undefined reason
            }));
         setSelectedReason(updatedReasonList);
         props.handleReviewSign();
      } finally {
         setShowSpinner(false);
      }
   };

   // This function executes in case of NonSigner
   const handleConfirmation = () => {
      const updatedReasonList: IAllCasesReason[] =
         filteredRecords
            .filter((record) => record.id && record.reason) // Filter out records with undefined id or reason
            .map((record) => ({
               dispoId: record.id || "", // Assign a default value for undefined id
               reason: record.reason || "", // Assign a default value for undefined reason
            }));
      setSelectedReason(updatedReasonList);
      setShowConfirm(true);
   };

   const fileDismissalsAsNonSigner = async () => {
      try {
         setShowConfirm(true);
         setShowSpinner(true);
         const dismissalPayload: IDismissalReason[] = selectedReason.map(item => ({
            dispoId: item.dispoId,
            reason: item.reason ? mapDismissalReasonToEnum(item.reason) : undefined
         }));

         const response = await AllCasesService.nonSignFileDismissal(dismissalPayload);
         if (response.status === HttpStatusCode.Ok) {
            setShowSpinner(false);
            navigate(`/dismissals?signed=false`);
            // set unsigned dismissal count
            handleUnsignedCaseCount();
            toast.success("These cases have been added to dismissals tab", {
               position: toast.POSITION.TOP_RIGHT,
            });
            props.handleClose();
         }
      } catch (error) {
         toast.success("Something went wrong");
      } finally {
         setShowSpinner(false);
      }
   };

   const handleUnsignedCaseCount = async () => {
      try {
         const response = await AuthService.getUnsignedCaseCount();
         if (response.status === HttpStatusCode.Ok) {
            setUnsignedDismissalCount(response.data.unsignedDismissal);
         }
      } catch (error) {
         console.log(error);
      }
   };

   const resetSelectedRows = () => {
      setFilteredRecords([]);
      // setSelectedAllCasesId([]);
      // setBulkRecords([]);
      setAllCases((prev) => {
         return {
            ...prev,
            items: prev.items.map((item) => ({
               ...item,
               isChecked: false,
            })),
            searchParam: allCases.searchParam
         };
      });
   };

   const [newSelectedRows] = useState<boolean[]>([]);
   const [lastClickedFilteredRowIndex, setLastClickedFilteredRowIndex] = useState<number>(-1);
   const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
   const [selectAll, setSelectAll] = useState<boolean>(false);

   const handleCheckBoxChange = (index: number, checked: boolean) => {
      if (shiftKeyPressed && lastClickedFilteredRowIndex !== -1 && filteredRecords) {
         const start = Math.min(index, lastClickedFilteredRowIndex);
         const end = Math.max(index, lastClickedFilteredRowIndex);
         setSelectedFilteredRows(Array.from({ length: end + 1 }, (_, i) =>
            i >= start && i <= end ? selectedFilteredRows[i] = true : newSelectedRows[i]
         ));
         setSelectedFilteredRows(selectedFilteredRows);
         const selectedIds = (filteredRecords || [])
            .filter((_, rowIndex) => selectedFilteredRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");
         setSelectedFilteredCasesId(selectedIds);
      }
      else {
         const updatedSelectedRows = [...selectedFilteredRows];
         updatedSelectedRows[index] = checked;
         setSelectedFilteredRows(updatedSelectedRows);
         if (filteredRecords.length === updatedSelectedRows.filter(item => item).length) {
            setSelectAll(true);
         } else {
            setSelectAll(false);
         }
         const selectedIds = (filteredRecords || [])
            .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
            .map((item) => item.id)
            .filter((id): id is string => typeof id === "string");

         setSelectedFilteredCasesId(selectedIds);

      }
      setLastClickedFilteredRowIndex(index);
   };

   const handleSelectAllChange = (checked: boolean) => {
      const newSelectAll = !selectAll;
      const allIds: string[] = filteredRecords
         .map((item) => item.id)
         .filter((id): id is string => typeof id === "string");
      if (checked) {
         setSelectedFilteredCasesId(allIds);
      } else {
         setSelectedFilteredCasesId([]);
      }

      setSelectAll((prevSelectAll) => {
         // Update selectedRows state
         setSelectedFilteredRows(Array(allIds.length).fill(newSelectAll));
         return newSelectAll;
      });
   };

   const handleInputChange = async (
      columnName: string,
      updatedValue: string | boolean,
      selectedRowIndex: number
   ) => {

      // If any row is selected, perform bulk update
      if (selectedFilteredRows[selectedRowIndex]) {
         setFilteredRecords((prevRows) =>
            prevRows.map((row, rowIndex) => {
               if (selectedFilteredRows[rowIndex] === selectedFilteredRows[selectedRowIndex]) {
                  // If the row is selected, update the specified column
                  const updatedRow = { ...row, [columnName]: updatedValue };
                  // Perform validation for the updated row         
                  return updatedRow;
               }

               else {
                  // If the row is not selected, return the original row
                  return row;
               }

            })
         );
      } else {

         // If no row is selected, update only the selected row
         setFilteredRecords((prevRows) =>
            prevRows.map((row, rowIndex) => {
               const updatedRow =
                  rowIndex === selectedRowIndex
                     ? { ...row, [columnName]: updatedValue }
                     : row;
               // Perform validation for the updated row          
               return updatedRow;
            })
         );
      }
   };

   const closeFileDismissalModal = () => {
      setSelectedReason([]);
      // if (selectedCaseIdsForFiling.length) {
      //    setSelectedCaseIdsForFiling([]);
      //    let records: React.SetStateAction<IAllCasesItems[]> = [];

      //    records = bulkRecords.filter((item) =>
      //       !selectedCaseIdsForFiling.includes(item.id || "") && item.caseNo?.length
      //    );
      //    setBulkRecords(records);
      // };

      resetSelectedRows();
      props.handleClose();
   };

   /**
    * Render each cell of a table
    * @param cellIndex  : cell of table
    * @param data  :data of cell
    * @param rowIndex : row index
    * @returns render cell
    */
   const handleCellRendered = (cellIndex: number, data: IAllCasesItems, rowIndex: number) => {
      const columnName = visibleColumns[cellIndex]?.label;
      //const propertyName = (initialColumnMapping as any)[columnName];
      const propertyName = visibleColumns[cellIndex]?.columnName;
      const cellValue = (data as any)[propertyName];
      const renderers: Record<string, () => JSX.Element> = {
         evictionDateFiled: () => formattedDateCell(cellValue),
         evictionServiceDate: () => formattedDateCell(cellValue),
         lastDaytoAnswer: () => formattedDateCell(cellValue),
         courtDate: () => formattedDateCell(cellValue),
         dismissalFileDate: () => formattedDateCell(cellValue),
         writFileDate: () => formattedDateCell(cellValue),
         answerDate: () => formattedDateCell(cellValue),
         writSignDate: () => formattedDateCell(cellValue),
         // tenantOne: () => formattedTenantFullName(data?.tenantNames[0]),
         // tenantTwo: () => formattedTenantFullName(data?.tenantNames[1]),
         // tenantThree: () => formattedTenantFullName(data?.tenantNames[2]),
         // tenantFour: () => formattedTenantFullName(data?.tenantNames[3]),
         // tenantFive: () => formattedTenantFullName(data?.tenantNames[4]),
         reason: () => (
            <DropdownPresentation
               heading={""}
               options={ReasonList}
               selectedOption={{
                  id: cellValue,
                  value: cellValue,
               } as ISelectOptions}
               handleSelect={(event) => {
                  handleDropdownChange(event, data.id);
                  handleInputChange?.(propertyName, event.target.value, rowIndex);
               }}
            />
         ),
         document: () =>
            cellValue ? (
               <Link to={cellValue} className="underline text-[#2472db]">
                  Download
               </Link>
            ) : (
               <></>
            ),
         address: () => formattedAddressCell(data),
         propertyName: () => formattedCell(cellValue),
         propertyVsTenants: () => renderPropertyVsTenants(data),
         isChecked: () => (
            <div className="selectRowCheckbox">
               <GridCheckbox
                  checked={selectedFilteredRows[rowIndex]}
                  onChange={(checked: boolean) =>
                     handleCheckBoxChange(rowIndex, checked)
                  }
                  label=""
               />
            </div>
         ),
      };
      const renderer =
         renderers[propertyName] || (() => formattedCell(cellValue));

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

   const renderPropertyVsTenants = (data: IAllCasesItems) => (
      <>
         {data.propertyName ?? ''}
         <strong className="font-semibold text-gray-900">
            {data.propertyName && data.tenantNames?.length ? " Vs. " : ""}
         </strong>
         <br />
         {data.tenantNames.map((tenant, index) => (
            <span key={index}>
               {`${tenant.firstName} ${tenant.middleName ? tenant.middleName + ' ' : ''}${tenant.lastName}${index !== data.tenantNames.length - 1 ? ',' : data.andAllOtherOccupants?.length ? ',' : ''}`}
               <br />
            </span>
         ))}
         {`${data.andAllOtherOccupants?.length ? "and " : ""}${data.andAllOtherOccupants ?? ""}`}
      </>
   );

   const formattedTenantFullName = (tenant: ITenant) => (
      <span>{`${tenant?.firstName ?? ''} ${tenant?.middleName ?? ""} ${tenant?.lastName ?? ''}`}</span>
   );

   const formattedDateCell = (value: any) => (
      <span>{value !== null ? formattedDate(value) : ""}</span>
   );

   const formattedCell = (value: any) => (
      <span>{value !== null ? value : ""}</span>
   );

   const formattedAddressCell = ({ address = "", unit = "", city = "", state = "", zip = "" }: IAllCasesItems) => (
      <span>
         {[address, unit, city, state, zip].filter(Boolean).join(" ")}
      </span>
   );

   return (
      <>
         <Modal
            showModal={props.showAddtoDismissalPopup}
            onClose={() => closeFileDismissalModal()}
            classes="relative z-40 modal-box"
            width="max-w-5xl"
         >
            {showSpinner && <Spinner></Spinner>}
            {/* Container for the content */}
            <div id="fullPageContent">
               <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                  <div className="sm:flex sm:items-start">
                     <div className="text-center sm:text-left">
                        <h3
                           className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                           id="modal-title"
                        >
                           File Dismissals
                        </h3>
                     </div>
                  </div>

                  {/* Display the grid with late notices */}
                  <div className="relative pt-2 writlabor-writofpossession-grid">
                     <Grid
                        columnHeading={visibleColumns}
                        rows={filteredRecords}
                        handleSelectAllChange={handleSelectAllChange}
                        selectAll={selectAll}
                        showInPopUp={true}
                        cellRenderer={(
                           data: IAllCasesItems,
                           rowIndex: number,
                           cellIndex: number
                        ) => {
                           return handleCellRendered(cellIndex, data, rowIndex);
                        }}
                     ></Grid>
                     <p className="text-[10px] md:text-xs text-[#E61818] font-medium mt-2">
                        {props.errorMsg && (
                           <>
                              {props.errorMsg}{' '}
                              <a
                                 href="#"
                                 onClick={(e) => {
                                    e.preventDefault();
                                    props.handleShowUnFindCases();
                                 }}
                                 className="cursor-pointer text-blue-600 hover:underline" // Underline only on hover
                                 aria-label="View unmatched cases"
                              >
                                 View
                              </a>
                           </>
                        )}
                     </p>
                     <div className="py-2.5 flex justify-between mt-1.5 items-center">
                        <p className="font-semibold text-[10px] md:text-xs">Total record(s): {filteredRecords?.length}</p>
                        {userRole.includes(UserRole.Admin) ||
                           userRole.includes(UserRole.C2CAdmin) ||
                           userRole.includes(UserRole.ChiefAdmin) ||
                           userRole.includes(UserRole.Signer) &&
                           !userRole.includes(UserRole.NonSigner) ? (
                           <Button
                              handleClick={handleSignature}
                              title="Review & Sign"
                              isRounded={false}
                              type={"button"}
                              classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                           ></Button>
                        ) : (
                           <Button
                              handleClick={handleConfirmation}
                              title="Confirm"
                              isRounded={false}
                              type={"button"}
                              classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                           ></Button>
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </Modal>

         {showConfirm && (
            <Modal
               showModal={showConfirm}
               onClose={() => {
                  //props.handleClose();
                  // resetSelectedRows();
                  setShowConfirm(false);
               }}
               width="max-w-md confirm_modal"
            >
               {showSpinner && <Spinner />}
               {/* Container for the content */}
               <div id="fullPageContent">
                  <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                     <div className="text-center pr-4 sm:text-left">
                        <h3
                           className="text-sm font-semibold leading-5 text-gray-900"
                           id="modal-title"
                        >
                           Are you sure you like to confirm these case(s) for dismissal?
                        </h3>
                     </div>
                  </div>
                  <div className="flex justify-end m-2">
                     <Button
                        type="button"
                        isRounded={false}
                        title="No"
                        handleClick={() => {
                           //props.handleClose();
                           // resetSelectedRows();
                           setShowConfirm(false);
                        }}
                        classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg "
                     ></Button>
                     <Button
                        handleClick={fileDismissalsAsNonSigner}
                        title="Yes"
                        isRounded={false}
                        type={"button"}
                        classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                        disabled={showSpinner}
                     ></Button>
                  </div>
               </div>
            </Modal>
         )}
      </>
   );
};

export default AllCases_AddtoDismissals;
