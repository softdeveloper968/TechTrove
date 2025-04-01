import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import InputMask from "react-input-mask";
import "react-datepicker/dist/react-datepicker.css";
import "react-datepicker/dist/react-datepicker.css";
import Grid from "components/common/grid/GridWithToolTip";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import Spinner from "components/common/spinner/Spinner";
import GridCheckbox from "components/formik/GridCheckBox";
import { IGridHeader } from "interfaces/grid-interface";
import { IEvictionAutomationQueueItem } from "interfaces/eviction-automation.interface";
import {
  IImportCsvRowError,
  IImportCsvFieldError,
} from "interfaces/common.interface";
import { useEvictionAutomationContext } from "pages/eviction-automation/EvictionAutomationContext";
import { useAuth } from "context/AuthContext";
import EvictionAutomationService from "services/eviction-automation.service";
import dollarImage from "assets/images/dollar-sign.svg";
import { adjustDateSystemTimezone, convertAndFormatDate, handlePostalCodeKeyDown, toCssClassName } from "utils/helper";
import { DaysOfWeekOptions } from "utils/constants";
import { UserRole } from "utils/enum";
// import MultiSelect from "components/formik/MultiSelect";
import { MultiSelect } from 'primereact/multiselect';
        
import 'primereact/resources/themes/saga-blue/theme.css';  // Theme CSS
import 'primereact/resources/primereact.min.css';           // Core CSS
import 'primeicons/primeicons.css';                         // Icons CSS

type EvictionAutomationBulkEditProps = {
  showFileEvictionPopup: boolean;
  handleClose: () => void;
};

const validationSchema = yup.object({
  bccEmails: yup
    .string()
    //.required("Email is required")
    .email("Please enter valid Bcc Email address"),
  attorneyEmail: yup
    .string()
    //.required("Email is required")
    .email("Please enter a valid Attorney Email address"),
  // ccEmails: yup
  //   .string()
  //   //.required("Email is required")
  //   .email("Please enter a valid Email address"),
  ccEmails: yup
    .string()
    .test("valid-emails", "Invalid email format. Enter in johndoe@gmail.com, sarahjane@yahoo.com, etc format", (value) => {
      if (!value) return true; // Allow empty value
      const emails = value.split(",").map((email) => email.trim());
      const isValid = emails.every((email) =>
        yup.string().email().isValidSync(email)
      );
      return isValid;
    }),
  confirmReportEmail: yup
    .string()
    .required("Eviction Confirm Email is required")
    .email("Please enter a valid Eviction Confirm Email"),
  evictionFilerEmail: yup
    .string()
    //.required("Email is required")
    .email("Please enter a valid Eviction Filer Email"),
  prescreenConfirmEmail: yup
    .string()
    //.required("Email is required")
    .email("Please enter a valid Prescreen Email"),
  propertyEmail: yup
    .string()
    //.required("Email is required")
    .email("Please enter a valid Property Email"),
  signerEmail: yup
    .string()
    .required("Signer Email is required")
    .email("Please enter a valid Signer Email "),
  daysToFileAfterNoticeDelivery: yup.string().required("Please enter daysToFileAfterNoticeDelivery."),
  // evictionFilingDate: yup.string().required("Please enter EvictionDelinquencyDate"),
  // evictionFilingDays: yup.string().required("Please enter EvictionDelinquencyDate"),
  evictionFilingDays: yup
      .number()
      .transform(value => (value === "" ? null : value))
      .typeError("Eviction Filing Days must be a valid number")
      .required("Please enter Eviction Delinquency Date")
      .min(1, "Eviction Filing Days must be at least 1")
      .max(31, "Eviction Filing Days cannot exceed 31"),
  propertyZip: yup
    .string()
    .nullable()
    .notRequired()
    .matches(/^$|^\d{5}$/, 'Zip must be 5 digits or blank'),
  ownerZip: yup
    .string()
    .nullable()
    .notRequired()
    .matches(/^$|^\d{5}$/, 'Zip must be 5 digits or blank'),
// noticeDelinquencyDate: yup.string().required("Please enter noticeDelinquencyDate"),
    // noticeDismissalDate: yup.string().required("Please enter noticeDismissalDate"),
    // noticeConfirmEmail:yup.string().required("Please enter noticeConfirmEmail"),
    // noticeSignerEmail:yup.string().required("Please enter noticeSignerEmail"),
    noticeDelinquencyDate: yup.string().nullable().when("noticesRequired", {
      is: true, // Only make email required if noticesRequired is true
      then: (schema) => schema.required("Notice Delinquency Date is required."),
    }),
  noticeDismissalDate: yup.string().nullable().when("noticesRequired", {
      is: true, // Only make email required if noticesRequired is true
      then: (schema) => schema.required("Notice Dismissal Date is required."),
    }),
  noticeConfirmEmail: yup.string().email("Please enter a valid Email address").when("noticesRequired", {
      is: true, // Only make email required if noticesRequired is true
      then: (schema) => schema.required("Notice Confirm Email is required."),
    }),
  noticeSignerEmail: yup.string().email("Please enter a valid Email address").when("noticesRequired", {
      is: true, // Only make email required if noticesRequired is true
      then: (schema) => schema.required("Notice Signer Email is required."),
    }),
    confirmationPin:yup.string().required("Please enter Confirmation Pin"),
    filingThresholdAdjustment: yup
         .string().required("Minimum Filing Amount is required.")
         .test(
            "isCurrency",
            "Filing Threshold Adjustment must be a valid currency amount",
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^-?\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         ),
         // .test(
         //    "maxAmount",
         //    "filingThresholdAdjustment must be less than or equal to $99999",
         //    (value) => {
         //       if (!value) return true; // Skip if undefined or empty
         //       const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
         //       return numericValue <= 99999;
         //    }
         // ),
    minimumFilingAmount: yup
         .string().required("Minimum Filing Amount is required.")
         .test(
            "isCurrency",
            "Minimum Filing Amount must be a valid currency amount",
            (value) => {
               if (!value) return true; // Skip if undefined or empty
               const regex = /^\$?\d{1,}(,\d{3})*(\.\d{1,2})?$/;
               return regex.test(value);
            }
         ),
         // .test(
         //    "maxAmount",
         //    "minimumFilingAmount must be less than or equal to $99999",
         //    (value) => {
         //       if (!value) return true; // Skip if undefined or empty
         //       const numericValue = parseFloat(value.replace(/[^0-9.]/g, ""));
         //       return numericValue <= 99999;
         //    }
         // ),
});


const EvictionAutomation_BulkEdit = (
  props: EvictionAutomationBulkEditProps
) => {
  const { userRole,selectedStateValue } = useAuth();
  const initialColumnMapping: IGridHeader[] = [
    {
      columnName: "isChecked",
      label: "Bulk Edit",
      controlType: "checkbox",
      toolTipInfo: "This checkbox represents bulk update only",
    },
    ...userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) ? [{ columnName: "notes", label: "EANotes"}] : [],
    // { columnName: "notes", label: "EANotes"},
    { columnName: "company", label: "Company" },
    ...userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) ? [{ columnName: "disabled", label: "Disabled" }] : [],
    // { columnName: "disabled", label: "Disabled" },
    {columnName:"crmName",label:"CrmName"},
    { columnName: "ownerId", label: "OwnerId" },
    { columnName: "propertyId", label: "PropertyId" },
    { columnName: "confirmationPin", label: "ConfirmationPin" },
    { columnName: "county", label: "County" },
    { columnName: "filerBusinessName", label: "FilerBusinessName" },
    { columnName: "propertyName", label: "PropertyName" },
    // { columnName: "evictionFilingDate", label: "EvictionDelinquencyDate" },
    { columnName: "evictionFilingDays", label: "EvictionDelinquencyDate" },

    { columnName: "dismissalNotificationDay", label: "DismissalNotificationDay" },
    { columnName: "expedited", label: "Expedited" },
    ...selectedStateValue.toLowerCase()=="tx"?[{ columnName: "courtName", label: "CourtName" }]:[{ columnName: "stateCourt", label: "StateCourt" }],
    { columnName: "confirmReportEmail", label: "EvictionConfirmEmail" },
    { columnName: "signerEmail", label: "EvictionSignerEmail" },
    { columnName: "ccEmails", label: "CcEmails" },
    { columnName: "noticeDelinquencyDate", label: "NoticeDelinquencyDate" },
    { columnName: "noticeDismissalDate", label: "NoticeDismissalDate" },
    { columnName: "noticeConfirmEmail", label: "NoticeConfirmEmail" },
    { columnName: "noticeSignerEmail", label: "NoticeSignerEmail" },
    { columnName: "propertyEmail", label: "PropertyEmail" },
    { columnName: "evictionFilerEmail", label: "EvictionFilerEmail" },
    { columnName: "attorneyEmail", label: "AttorneyEmail" },
    { columnName: "attorneyName", label: "AttorneyName" },
    { columnName: "attorneyBarNo", label: "AttorneyBarNo" },
    { columnName: "evictionAffiantIs", label: "EvictionAffiantIs" },
    { columnName: "processServer", label: "ProcessServer" },
    { columnName: "andAllOtherOccupants", label: "AndAllOtherOccupants" },
    ...userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) ? [{ columnName: "tenantAddressConfig", label: "TenantAddressConfig" }] : [],
    // { columnName: "tenantAddressConfig", label: "TenantAddressConfig" },
    ...userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) ? [{ columnName: "unitsUsePropertyAddress", label: "UnitsUsePropertyAddress" }] : [],
    // { columnName: "unitsUsePropertyAddress", label: "UnitsUsePropertyAddress" },
    { columnName: "propertyAddress", label: "PropertyAddress" },
    { columnName: "propertyCity", label: "PropertyCity" },
    { columnName: "propertyState", label: "PropertyState" },
    { columnName: "propertyZip", label: "PropertyZip" },
    { columnName: "propertyPhone", label: "PropertyPhone" },
    { columnName: "ownerName", label: "OwnerName" },
    { columnName: "ownerAddress", label: "OwnerAddress" },
    { columnName: "ownerCity", label: "OwnerCity" },
    { columnName: "ownerState", label: "OwnerState" },
    { columnName: "ownerZip", label: "OwnerZip" },
    { columnName: "ownerEmail", label: "OwnerEmail" },
    { columnName: "ownerPhone", label: "OwnerPhone" },
    ...userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) ? [{ columnName: "noticesRequired", label: "NoticesRequired" }] : [],
    // { columnName: "noticesRequired", label: "NoticesRequired" },
    ...userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) ? [{
      columnName: "daysToFileAfterNoticeDelivery",
      label: "DaysToFileAfterNoticeDelivery",
    }] : [],
    // {
    //   columnName: "daysToFileAfterNoticeDelivery",
    //   label: "DaysToFileAfterNoticeDelivery",
    // },
    // { columnName: "allowMultipleImports", label: "AllowMultipleImports" },
    {
      columnName: "filingThresholdAdjustment",
      label: "FilingThresholdAdjustment",
    },
    { columnName: "minimumFilingAmount", label: "MinimumFilingAmount" },
    ...userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) ? [{ columnName: "prescreenSignEmail", label: "PrescreenSignEmail" }] : [],
    // { columnName: "prescreenSignEmail", label: "PrescreenSignEmail" },
    ...userRole.includes(UserRole.C2CAdmin) ||userRole.includes(UserRole.ChiefAdmin) ? [{ columnName: "prescreenConfirmEmail", label: "PrescreenConfirmEmail" }] : [],
    // { columnName: "prescreenConfirmEmail", label: "PrescreenConfirmEmail" },
    { columnName: "bccEmails", label: "BccEmails" },  
  ];
  const {
    setShowSpinner,
    showSpinner,
    evictionAutomationQueue,
    getEvictionAutomationQueue,
    setEvictionAutomationQueue,
    selectedEvictionAutomationQueueIds,
    setSelectedEvictionAutomationQueueIds,
    filteredRecords,
    setFilteredRecords,
    bulkEditRecords,
    setBulkEditRecords,
  } = useEvictionAutomationContext();
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const [visibleColumns] = useState<IGridHeader[]>(initialColumnMapping);
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [columnErrors, setColumnErrors] = useState<
    Record<string, { rowIndex: number; errorMessage: string }[]>[]
  >([]);

  const [rowErrors, setRowErrors] = useState<IImportCsvRowError[]>([]);
  const [selectFilteredAll, setSelectFilteredAll] = useState<boolean>(false);

  const [selectedFilteredRows, setSelectedFilteredRows] = useState<
    Array<boolean>
  >(Array(filteredRecords?.length).fill(false));

  const [canPaginateBack, setCanPaginateBack] = useState<boolean>(
    evictionAutomationQueue.currentPage > 1
  );
  const [canPaginateFront, setCanPaginateFront] = useState<boolean>(
    evictionAutomationQueue.totalPages > 1
  );
  const [lastClickedFilteredRowIndex, setLastClickedFilteredRowIndex] =
    useState<number>(-1);
  const [shiftKeyPressed, setShiftKeyPressed] = useState<boolean>(false);
  const [newSelectedRows] = useState<boolean[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    
    // const records = bulkEditRecords.filter((item) =>
    //   selectedEvictionAutomationQueueIds.includes(item.id || "")
    // );
    
    let uniqueRecords: { [key: string]: any } = {};
    let records = bulkEditRecords.filter((item) => {
      const id = item.id || "";
      if (!selectedEvictionAutomationQueueIds.includes(id) || uniqueRecords[id]) {
        return false;
      }
      uniqueRecords[id] = true;
      return true;
    }).map((item) => {
      // Create a deep copy of each item to prevent modification of bulkRecords
      return JSON.parse(JSON.stringify(item));
    });
    
    records.forEach(item => {
      item.noticeDelinquencyDate = convertAndFormatDate(item.noticeDelinquencyDate);
      item.noticeDismissalDate = convertAndFormatDate(item.noticeDismissalDate);
    });
    
    setFilteredRecords(records);
    // setFilteredRecords(records);
    setSelectedFilteredRows(Array(filteredRecords?.length).fill(false));
    setSelectFilteredAll(false);

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
  }, []);

  const handleInputChange = async (
    columnName: string,
    updatedValue: string | boolean,
    selectedRowIndex: number
  ) => {
    // If any row is selected, perform bulk update
    if (selectedFilteredRows[selectedRowIndex]) {
      setFilteredRecords((prevRows) =>
        prevRows.map((row, rowIndex) => {
          if (
            selectedFilteredRows[rowIndex] ===
            selectedFilteredRows[selectedRowIndex]
          ) {
            if (columnName === "expedited" || columnName === "stateCourt") {
            }
            // If the row is selected, update the specified column
            const updatedRow = {
              ...row,
              [columnName]: updatedValue,
            };
            // Perform validation for the updated row
            validateRow(updatedRow, rowIndex);
            return updatedRow;
          } else {
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
              ? {
                ...row,
                [columnName]: updatedValue,
              }
              : row;
          // Perform validation for the updated row
          validateRow(updatedRow, rowIndex);
          return updatedRow;
        })
      );
    }
  };

  const validateRow = (row: IEvictionAutomationQueueItem, rowIndex: number) => {
    const recordErrors: Record<
      string,
      { rowIndex: number; errorMessage: string }[]
    > = {};
    const fields: IImportCsvFieldError[] = [];

    try {
      // Validate the updated row against the schema
      validationSchema.validateSync(row, { abortEarly: false });
    } catch (error: any) {
      if (error.inner) {
        // Collect validation errors for each property
        error.inner.forEach((detailError: any) => {
          const propertyName = detailError.path || "unknown";
          const errorMessage = `${detailError.message}`;

          // Get the row index from your record, adjust this based on your data structure
          const rowIndex = detailError.rowIndex || -1;

          fields.push({
            fieldName: propertyName,
            message: errorMessage,
          });

          // Check if the property already has errors, if not, initialize an array
          if (!recordErrors[propertyName]) {
            recordErrors[propertyName] = [];
          }

          // Push the error object with rowIndex to the array
          recordErrors[propertyName].push({
            rowIndex,
            errorMessage,
          });
        });
      }
    }

    // Update row errors for the specific row
    setRowErrors((prevErrors) => {
      const updatedRowErrors = [...prevErrors];
      updatedRowErrors[rowIndex] = { rowIndex, fields };
      return updatedRowErrors;
    });

    // If there are errors for the record, update the columnErrors state
    setColumnErrors((prevErrors) => [
      ...prevErrors.slice(0, rowIndex),
      recordErrors,
      ...prevErrors.slice(rowIndex + 1),
    ]);
  };

  const handleCheckBoxChange = (index: number, checked: boolean) => {
    if (
      shiftKeyPressed &&
      lastClickedFilteredRowIndex !== -1 &&
      filteredRecords
    ) {
      const start = Math.min(index, lastClickedFilteredRowIndex);
      const end = Math.max(index, lastClickedFilteredRowIndex);
      setSelectedFilteredRows(
        Array.from({ length: end + 1 }, (_, i) =>
          i >= start && i <= end
            ? (selectedFilteredRows[i] = true)
            : newSelectedRows[i]
        )
      );
      setSelectedFilteredRows(selectedFilteredRows);
      const selectedIds = (filteredRecords || [])
        .filter((_, rowIndex) => selectedFilteredRows[rowIndex])
        .map((item) => item.id)
        .filter((id): id is string => typeof id === "string");
      setSelectedEvictionAutomationQueueIds(selectedIds);
    } else {
      const updatedSelectedRows = [...selectedFilteredRows];
      updatedSelectedRows[index] = checked;
      setSelectedFilteredRows(updatedSelectedRows);
      if (
        filteredRecords.length ===
        updatedSelectedRows.filter((item) => item).length
      ) {
        setSelectAll(true);
      } else {
        setSelectAll(false);
      }
      const selectedIds = (filteredRecords || [])
        .filter((_, rowIndex) => updatedSelectedRows[rowIndex])
        .map((item) => item.id)
        .filter((id): id is string => typeof id === "string");

      setSelectedEvictionAutomationQueueIds(selectedIds);
    }
    setLastClickedFilteredRowIndex(index);
  };

  const handleSelectAllChange = (checked: boolean) => {
    const newSelectAll = !selectAll;
    const allIds: string[] = filteredRecords
      .map((item) => item.id)
      .filter((id): id is string => typeof id === "string");
    if (checked) {
      setSelectedEvictionAutomationQueueIds(allIds);
    } else {
      setSelectedEvictionAutomationQueueIds([]);
    }

    setSelectAll((prevSelectAll) => {
      // Update selectedRows state
      setSelectedFilteredRows(Array(allIds.length).fill(newSelectAll));
      return newSelectAll;
    });
  };

  const handleSubmit = async () => {
    try {
      
      const requestPayload = filteredRecords.map((item) => {
        const noticeDelinquencyDate =
        item.noticeDelinquencyDate != null
        ? new Date(item.noticeDelinquencyDate)
        : null;
        
        const noticeDismissalDate =
        item.noticeDismissalDate != null
        ? new Date(item.noticeDismissalDate)
        : null;
        return {
          ...item,
          expedited: item.expedited ? true : false,
          stateCourt: item.stateCourt ? true : false,
          evictionFilingDays: item.evictionFilingDays,
          noticeConfirmEmail: item.noticeConfirmEmail ?? "",
          noticeSignerEmail: item.noticeSignerEmail ?? "",
          // Adjusting for timezone offset
          noticeDelinquencyDate:
            noticeDelinquencyDate != null
              ? new Date(
                  noticeDelinquencyDate.getTime() +
                    noticeDelinquencyDate.getTimezoneOffset() * 60000
                )
              : null,
          noticeDismissalDate:
            noticeDismissalDate != null
              ? new Date(
                  noticeDismissalDate.getTime() +
                    noticeDismissalDate.getTimezoneOffset() * 60000
                )
              : null,
        };
      });
      const response =
        await EvictionAutomationService.updateEvictionAutomationQueues(
          requestPayload
        );
      if (response.status === HttpStatusCode.Ok) {
        // Display a success toast message
        toast.success("Eviction info successfully updated.");
        // Close the popup
        props.handleClose();
      } else {
        // Handle other status codes if needed
        // For example, display an error message toast
        toast.error("Failed to update eviction info.");
        props.handleClose();
      }
      //setFilteredRecords([]);
      //setSelectAll(false);
      //setSelectedFileEvictionId([]);
      setBulkEditRecords(filteredRecords);
    } finally {

      getEvictionAutomationQueue(1, 100,evictionAutomationQueue.searchParam,evictionAutomationQueue.companyId,evictionAutomationQueue.county,evictionAutomationQueue.isExpedited,evictionAutomationQueue.isStateCourt);
      setFilteredRecords([]);
      // setBulkEditRecords([]);
      setShowSpinner(false);
      // setSelectedEvictionAutomationQueueIds([]);
    }
  };

  const handleModalClose = () => {
    props.handleClose();
  };
  const mapDaysToOptions = (daysString: string): { name: string, code: string }[] => {
    const daysArray = daysString.split(', ').map(day => day.trim());
    return DaysOfWeekOptions.filter(option => daysArray.includes(option.code));
  };
  const dayTemplate = (option:any) => {
    return (
        <div className="flex align-items-center">
            <img alt={option.name} src="https://primefaces.org/cdn/primereact/images/flag/flag_placeholder.png" className={`mr-2 flag flag-${option.code.toLowerCase()}`} style={{ width: '18px' }} />
            <div>{option.name}</div>
        </div>
    );
};
const panelFooterTemplate = (data:IEvictionAutomationQueueItem) => {
  const length = data.dismissalNotificationDay ? data.dismissalNotificationDay.split(",").length : 0;

  return (
      <div className="py-2 px-3">
          <b>{length}</b> item{length > 1 ? 's' : ''} selected.
      </div>
  );
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
    data: IEvictionAutomationQueueItem,
    rowIndex: number
  ) => {
    
    const columnName = visibleColumns[cellIndex]?.label;
    const propertyName = visibleColumns[cellIndex]?.columnName;
    const cellValue = (data as any)[propertyName];
    const selectedDays = mapDaysToOptions(data.dismissalNotificationDay);
    const renderers: Record<string, () => JSX.Element> = {
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
      dismissalNotificationDay: () => (
        <MultiSelect
          value={selectedDays}
          options={DaysOfWeekOptions}
          optionLabel="name"
          placeholder="Choose options"
          className="w-full md:w-[14rem]"
          display="chip"
          onChange={(e) => {handleMultiSelectChange(e.value, data.id as string);}}  // Update with the new values
        />
      ),
      // allowMultipleImports: () =>
      //   renderCheckboxCell(cellValue, columnName, propertyName, rowIndex),
      disabled: () =>
        renderCheckboxCell(cellValue, columnName, propertyName, rowIndex),
      noticesRequired: () =>
        renderCheckboxCell(cellValue, columnName, propertyName, rowIndex),
      prescreenSignEmail: () =>
        renderCheckboxCell(cellValue, columnName, propertyName, rowIndex),
      unitsUsePropertyAddress: () =>
        renderCheckboxCell(cellValue, columnName, propertyName, rowIndex),
      expedited: () =>
        renderExpeditedCell(cellValue, columnName, propertyName, rowIndex),
      stateCourt: () =>
        renderStateCourtCell(cellValue, columnName, propertyName, rowIndex),
      company: () => <span className="disabled">{cellValue}</span>,
      propertyId: () => <span className="disabled">{cellValue}</span>,
      ownerId: () => <span className="disabled">{cellValue}</span>,
      crmName: () => <span className="disabled">{cellValue}</span>,
      propertyPhone: () => (
        <>
          <div>
            <InputMask
              mask="(999) 999-9999"
              maskChar=" "
              value={cellValue as any}
              onChange={(e: any) =>
                handleInputChange?.(propertyName, e.target.value, rowIndex)
              }
              onBlur={(e: any) =>
                handleInputChange?.(propertyName, e.target.value, rowIndex)
              }
              name={propertyName}
              id={propertyName + rowIndex}
              className="peer outline-none p-2.5 block border w-full border-gray-200 rounded-lg text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]" // Custom class for styling
            />
            {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
              <div key={index} className="text-red-500">
                {error.errorMessage}
              </div>
            ))}
          </div>
        </>
      ),
      ownerPhone: () => (
        <>
          <div>
            <InputMask
              mask="(999) 999-9999"
              maskChar=" "
              value={cellValue as any}
              onChange={(e: any) =>
                handleInputChange?.(propertyName, e.target.value, rowIndex)
              }
              onBlur={(e: any) =>
                handleInputChange?.(propertyName, e.target.value, rowIndex)
              }
              name={propertyName}
              id={propertyName + rowIndex}
              className="peer outline-none p-2.5 block border w-full border-gray-200 rounded-lg text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]" // Custom class for styling
            />
            {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
              <div key={index} className="text-red-500">
                {error.errorMessage}
              </div>
            ))}
          </div>
        </>
      ),

      noticeDelinquencyDate:()=>(<div className="datePicker">
        <DatePicker
           selected={
              cellValue && Date.parse(cellValue as string)
                 ? new Date(cellValue as string)
                 : null // new Date()
           }
           onChange={(date: any) => {
              handleInputChange?.(propertyName, date, rowIndex);
             // handleSetOutCompletedDateChange(date, rowIndex);
           }}
           //dateFormat="MM/dd/yyyy"
           dateFormat="MM/dd/yyyy"
           placeholderText="mm/dd/yyyy"
           className="bg-calendar bg-no-repeat bg-[center_right_11px] peer placeholder-gray-500 outline-none p-1.5 pr-7 min-w-28 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
        />
         {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
               <div key={index} className="text-red-500">
                  {error.errorMessage}
               </div>
            ))}
     </div>),
     noticeDismissalDate:()=>(<div className="datePicker">
      <DatePicker
         selected={
            cellValue && Date.parse(cellValue as string)
               ? new Date(cellValue as string)
               : null // new Date()
         }
         onChange={(date: any) => {
            handleInputChange?.(propertyName, date, rowIndex);
           // handleSetOutCompletedDateChange(date, rowIndex);
         }}
         //dateFormat="MM/dd/yyyy"
         dateFormat="MM/dd/yyyy"
         placeholderText="mm/dd/yyyy"
         className="bg-calendar bg-no-repeat bg-[center_right_11px] peer placeholder-gray-500 outline-none p-1.5 pr-7 min-w-28 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
      />
       {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
             <div key={index} className="text-red-500">
                {error.errorMessage}
             </div>
          ))}
   </div>),
     minimumFilingAmount: () => (
      <>
         <div>
            <input
               type={"number"}
               value={cellValue}
               style={{
                backgroundImage: `url(${dollarImage})`,
              }}
               className={`peer outline-none p-1.5 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_left_9px] !pl-6 number_filed  `}
               onChange={(e) =>
                  handleInputChange?.(propertyName, e.target.value, rowIndex)
               }
            />
            {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
               <div key={index} className="text-red-500">
                  {error.errorMessage}
               </div>
            ))}
         </div>
      </>
   ),
   filingThresholdAdjustment: () => (
    <>
       <div>
          <input
             type={"number"}
             min={-100000}
             value={cellValue}
             style={{
              backgroundImage: `url(${dollarImage})`,
            }}
            className={`peer outline-none p-1.5 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_left_9px] !pl-6 number_filed `}
            onChange={(e) =>
                handleInputChange?.(propertyName, e.target.value, rowIndex)
             }
          />
          {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
             <div key={index} className="text-red-500">
                {error.errorMessage}
             </div>
          ))}
       </div>
    </>
 ),
//  evictionFilingDate:()=>(<div className="datePicker">
//   <DatePicker
//      selected={
//         cellValue && Date.parse(cellValue as string)
//            ? new Date(cellValue as string)
//            : null // new Date()
//      }
//      onChange={(date: any) => {
//         handleInputChange?.(propertyName, date, rowIndex);
//        // handleSetOutCompletedDateChange(date, rowIndex);
//      }}
//      //dateFormat="MM/dd/yyyy"
//      dateFormat="MM/dd/yyyy"
//      placeholderText="mm/dd/yyyy"
//      className="bg-calendar bg-no-repeat bg-[center_right_11px] peer placeholder-gray-500 outline-none p-1.5 pr-7 min-w-28 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
//   />
//    {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
//          <div key={index} className="text-red-500">
//             {error.errorMessage}
//          </div>
//       ))}
// </div>),
//  evictionFilingDay: () => (
//   <>
//      <div>
//         <input
//            type={"number"}
//            value={cellValue}
//            className={`peer outline-none p-2 py-1 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]`}
//            onChange={(e) =>
//               handleInputChange?.(propertyName, e.target.value, rowIndex)
//            }
//         />
//         {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
//            <div key={index} className="text-red-500">
//               {error.errorMessage}
//            </div>
//         ))}
//      </div>
//   </>
// ),

// evictionFilingDays: () => (
//   <>
//      <div>
//         <input
//            type={"number"}
//            value={cellValue}
//            min={1} // Minimum value set to 1
//            max={31} // Maximum value set to 31
//            className={`peer outline-none p-2 py-1 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]`}
//            onChange={(e) =>
//               handleInputChange?.(propertyName, e.target.value, rowIndex)
//            }
//         />
//         {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
//            <div key={index} className="text-red-500">
//               {error.errorMessage}
//            </div>
//         ))}
//      </div>
//   </>
// ),
evictionFilingDays: () => (
  <div>
    <input
      type="number"
      value={cellValue} // Controlled input allows empty value
      min={1} // Minimum value set to 1
      max={31} // Maximum value set to 31
      className={`peer outline-none p-2 py-1 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]`}
      onChange={(e) => {
        const value = e.target.value; // Get the string value of the input
        
        // Allow empty input or a number within the range
        if (value === '' || (Number(value) >= 1 && Number(value) <= 31)) {
          handleInputChange?.(propertyName, value, rowIndex); // Pass the value as is (string)
        }
      }}
    />
    {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
      <div key={index} className="text-red-500">
        {error.errorMessage}
      </div>
    ))}
  </div>
),

daysToFileAfterNoticeDelivery: () => (
  <>
     <div>
        <input
           type={"number"}
           value={cellValue}
           className={`peer outline-none p-2 py-1 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]`}
           onChange={(e) =>
              handleInputChange?.(propertyName, e.target.value, rowIndex)
           }
        />
        {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
           <div key={index} className="text-red-500">
              {error.errorMessage}
           </div>
        ))}
     </div>
  </>
),
ownerZip: () => (
  <>
     <input
        type={"text"}
        value={cellValue as string}
        className={
           "peer outline-none p-2 py-1 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]"
        }
        onChange={(e) =>
           handleInputChange?.(propertyName, e.target.value, rowIndex)
        }
        maxLength={5}
        onKeyDown={handlePostalCodeKeyDown}
     />
     {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
        <div key={index} className="text-red-500">
           {error.errorMessage}
        </div>
     ))}
  </>
),
propertyZip: () => (
  <>
     <input
        type={"text"}
        value={cellValue as string}
        className={
           "peer outline-none p-2 py-1 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none h-[30px]"
        }
        onChange={(e) =>
           handleInputChange?.(propertyName, e.target.value, rowIndex)
        }
        maxLength={5}
        onKeyDown={handlePostalCodeKeyDown}
     />
     {columnErrors[rowIndex]?.[propertyName]?.map((error, index) => (
        <div key={index} className="text-red-500">
           {error.errorMessage}
        </div>
     ))}
  </>
),

    };

    const renderer =
      renderers[propertyName] ||
      (() => formattedCell(cellValue, columnName, propertyName, rowIndex));

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
  const handleMultiSelectChange = (
    selectedOptions: { name: string; code: string }[],
    id: string
  ) => {
    // Convert selected options to a comma-separated string
    const selectedDaysCodes = selectedOptions.map(option => option.code).join(', ');
    
    // Update records based on selection
    setFilteredRecords(prevRows =>
      prevRows.map((row, rowIndex) => {
        // Check if the row is selected
        if (selectedFilteredRows[rowIndex]) {
          // Update all selected rows
          return {
            ...row,
            dismissalNotificationDay: selectedDaysCodes,
          };
        } else if (row.id === id) {
          // Update the specific row if not part of the selection
          return {
            ...row,
            dismissalNotificationDay: selectedDaysCodes,
          };
        } else {
          // Return original row if not selected or not the specific row
          return row;
        }
      })
    );
  };
  
  

  const getFieldsErrorMessages = (rowIndex: number, propertyName: string) => {
    const errorMessages: string[] = [];
    rowErrors.filter((error) => {
      if (!error.fields.length) return null;
      if (error.rowIndex === rowIndex && error.fields.length) {
        error.fields.forEach((f) => {
          if (f.fieldName.toLowerCase() === propertyName.toLowerCase()) {
            errorMessages.push(f.message);
          }
        });
      }
    });

    return errorMessages;
  };

  const formattedCell = (
    value: any,
    columnName: any,
    propertyName: any,
    rowIndex: number
  ) => {
    return (
      <>
        <input
          type={"text"}
          value={value as string}
          name={columnName}
          className={
            "peer outline-none p-2.5 py-1.5 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
          }
          onChange={(e) =>
            handleInputChange?.(propertyName, e.target.value, rowIndex)
          }
        />
        {/* {columnErrors[rowIndex]?.[fieldName]?.map((error, index) => (
               <div key={index} className="text-red-500">
                  {error.errorMessage}
               </div>
            ))} */}
        {getFieldsErrorMessages(rowIndex, propertyName).map(
          (message, index) => (
            <div key={index} className="text-red-500 whitespace-normal">
              {message}
            </div>
          )
        )}
      </>
    );
  };

  const renderCheckboxCell = (
    value: any,
    columnName: any,
    fieldName: any,
    rowIndex: number
  ) => {
    return (
      <div className="editRowCheckbox">
        <input
          type={"checkbox"}
          name={columnName}
          className="!w-3.5 !h-3.5 cursor-pointer"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleInputChange(fieldName, e.target.checked, rowIndex)
          }
          checked={value ?? false}
        />
      </div>
    );
  };

  const renderExpeditedCell = (
    value: any,
    columnName: any,
    fieldName: any,
    rowIndex: number
  ) => {
    return (
      <input
        type={"text"}
        name={columnName}
        className={
          "peer outline-none p-2.5 py-1.5 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
        }
        value={typeof value === "boolean" ? (value ? "X" : "") : value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          value = e.target.value as string;
          handleInputChange(fieldName, e.target.value, rowIndex);
        }}
      />
    );
  };

  const renderStateCourtCell = (
    value: any,
    columnName: any,
    fieldName: any,
    rowIndex: number
  ) => {
    return (
      <input
        type={"text"}
        name={columnName}
        className={
          "peer outline-none p-2.5 py-1.5 block border w-full rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    "
        }
        value={
          typeof value === "boolean" ? (value ? "State Court" : "") : value
        }
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          handleInputChange(fieldName, e.target.value, rowIndex)
        }
      />
    );
  };

  const handleConfirmEviction = () => {
    const errors: Record<
      string,
      { rowIndex: number; errorMessage: string }[]
    >[] = [];
    const rowErrors: IImportCsvRowError[] = [];
    // Iterate through gridData with index
    filteredRecords.forEach((record, index: number) => {
      const recordErrors: Record<
        string,
        { rowIndex: number; errorMessage: string }[]
      > = {};
      const fields: IImportCsvFieldError[] = [];
      try {
        validationSchema.validateSync(record, { abortEarly: false });
      } catch (error: any) {
        if (error.inner) {
          error.inner.forEach((detailError: any, i: number) => {
            const propertyName = detailError.path || "unknown";
            const errorMessage = `${detailError.message}`;

            // Use original index for rowIndex
            const rowIndex: number = index;
            // const rowIndex = detailError.rowIndex || -1;

            fields.push({
              fieldName: propertyName,
              message: errorMessage,
            });

            if (!recordErrors[propertyName]) {
              recordErrors[propertyName] = [];
            }

            recordErrors[propertyName].push({
              rowIndex,
              errorMessage,
            });
          });
        }
      }

      if (Object.keys(recordErrors).length > 0) {
        errors.push(recordErrors);
      }

      rowErrors.push({
        rowIndex: index, // here index is rowIndex
        fields: fields,
      });
    });

    setRowErrors(rowErrors);
    setColumnErrors(errors);

    if (errors.length === 0) {
      setShowConfirm(true);
    }
  };

  return (
    <>
      <Modal
        showModal={props.showFileEvictionPopup}
        onClose={handleModalClose}
        width="max-w-5xl bulkEditModal"
      >
        {showSpinner && <Spinner />}
        {/* Container for the content */}
        <div id="fullPageContent">
          <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
            <div className="sm:flex sm:items-start">
              <div className="text-center sm:text-left">
                <h3
                  className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                  id="modal-title"
                >
                  Edit Eviction
                </h3>
              </div>
            </div>

            {/* Display the grid*/}
            <div className="relative pt-2 writlabor-writofpossession-grid">
              <Grid
                columnHeading={visibleColumns}
                rows={filteredRecords}
                handleSelectAllChange={handleSelectAllChange}
                selectAll={selectAll}
                showInPopUp={true}
                cellRenderer={(
                  data: IEvictionAutomationQueueItem,
                  rowIndex: number,
                  cellIndex: number
                ) => {
                  
                  return handleCellRendered(cellIndex, data, rowIndex);
                }}
              ></Grid>
              <div className="py-2.5 flex justify-between mt-1.5 items-center">
                <p className="font-semibold text-[10px] md:text-xs">
                  Total records: {filteredRecords.length}
                </p>
                <Button
                  handleClick={() => handleConfirmEviction()}
                  title="Save"
                  isRounded={false}
                  type={"button"}
                ></Button>
              </div>
            </div>
            {columnErrors.some((errors) => Object.keys(errors).length > 0) && (
              <p className="text-red-500 text-center">
                Please validate your data
              </p>
            )}
          </div>
        </div>
      </Modal>
      <div>
        <Modal
          showModal={showConfirm}
          onClose={handleModalClose}
          width="max-w-md"
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
                  Are you sure you want to update the eviction information ?
                </h3>
              </div>
            </div>
            <div className="flex justify-end m-2">
              <Button
                type="button"
                isRounded={false}
                title="No"
                handleClick={handleModalClose}
                classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg "
              ></Button>
              <Button
                handleClick={() => handleSubmit()}
                title="Yes"
                isRounded={false}
                type={"button"}
                classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
              ></Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default EvictionAutomation_BulkEdit;
