import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { Form, Formik } from "formik";
import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import DropdownPresentation from "components/common/dropdown/DropDown";
import { ISelectOptions } from "interfaces/all-cases.interface";
import { IEvictionAutomationQueueItem } from "interfaces/eviction-automation.interface";
import { useEvictionAutomationContext } from "pages/eviction-automation/EvictionAutomationContext";
import { DaysOfWeekOptions, StateCode } from "utils/constants";
import { handlePostalCodeKeyDown } from "utils/helper";
import EvictionAutomationService from "services/eviction-automation.service";
import { useAuth } from "context/AuthContext";

// Validation schema for the form


const initialSelectOption: ISelectOptions = { id: '', value: '' };

type EASettingProps = {
    showPopup: boolean;
    closePopup: (shouldRefresh: string) => void;
    isEditMode: boolean;
    // initialValues: any;
    onSubmit: (formValues: any) => void;
};

const EvictionAutomationSettingFormPopup: React.FC<EASettingProps> = ({
    showPopup,
    closePopup,
    isEditMode,
    // initialValues,
    onSubmit,
}) => {
    const validationSchema = yup.object({
        bccEmails: yup
            .string()
            //.required("Email is required")
            .email("Please enter a valid Email address"),
        attorneyEmail: yup
            .string()
            //.required("Email is required")
            .email("Please enter a valid Email address"),
        // ccEmails: yup
        //     .string()
        //     //.required("Email is required")
        //     .email("Please enter a valid Email address"),
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
            .required("Email is required")
            .email("Please enter a valid Email address"),
        evictionFilerEmail: yup
            .string()
            //.required("Email is required")
            .email("Please enter a valid Email address"),
        prescreenConfirmEmail: yup
            .string()
            //.required("Email is required")
            .email("Please enter a valid Email address"),
        propertyEmail: yup
            .string()
            //.required("Email is required")
            .email("Please enter a valid Email address"),
        signerEmail: yup
            .string()
            .required("Email is required")
            .email("Please enter a valid Email address"),
        clientId: yup.string().required("Company is required"),
        crmName: yup.string().required("CrmName is required"),
        ownerId: yup.string().required("OwnerId is required"),
        propertyId: yup.string().required("PropertyId is required"),
        daysToFileAfterNoticeDelivery: yup.string().required("Please enter daysToFileAfterNoticeDelivery."),
        // evictionFilingDate: yup.string().required("Please enter EvictionDelinquencyDate"),
    //     evictionFilingDate: yup
    //   .number()
    //   .required("Please enter EvictionDelinquencyDate"),
    evictionFilingDays: yup
      .number()
      .required("Please enter EvictionDelinquencyDate")
      .min(1, "Eviction Filing Days must be at least 1")
      .max(31, "Eviction Filing Days cannot exceed 31"),

        propertyZip: yup.string()
            .nullable()
            .notRequired()
            .matches(/^$|^\d{5}$/, 'Zip must be 5 digits or blank'),
        ownerZip: yup.string()
            .nullable()
            .notRequired()
            .matches(/^$|^\d{5}$/, 'Zip must be 5 digits or blank'),
    // noticeDelinquencyDate: yup.string().required("NoticeDelinquencyDate is required."),
        // noticeDismissalDate: yup.string().required("NoticeDismissalDate is required."),
        minimumFilingAmount: yup.string().required("MinimumFilingAmount is required."),
        filingThresholdAdjustment: yup.string().required("FilingThresholdAdjustment is required."),
        confirmationPin: yup.string().required("ConfirmationPin is required."),
        // noticeConfirmEmail: yup.string().required("NoticeConfirmEmail is required."),
        // noticeSignerEmail: yup.string().required("NoticeSignerEmail is required."),
        noticesRequired: yup.boolean(),
        // noticeDelinquencyDate: yup.string().when('noticesRequired', (noticesRequired, schema) => {
        //     return noticesRequired ? schema.required('NoticeDelinquencyDate is required.') : schema;
        // }),
        noticeDelinquencyDate: yup.string().nullable().when("noticesRequired", {
            is: true, // Only make email required if noticesRequired is true
            then: (schema) => schema.required("NoticeDelinquencyDate is required."),
          }),
        noticeDismissalDate: yup.string().nullable().when("noticesRequired", {
            is: true, // Only make email required if noticesRequired is true
            then: (schema) => schema.required("NoticeDismissalDate is required."),
          }),
        noticeConfirmEmail: yup.string().email("Please enter a valid Email address").when("noticesRequired", {
            is: true, // Only make email required if noticesRequired is true
            then: (schema) => schema.required("NoticeConfirmEmail is required."),
          }),
        noticeSignerEmail: yup.string().email("Please enter a valid Email address").when("noticesRequired", {
            is: true, // Only make email required if noticesRequired is true
            then: (schema) => schema.required("NoticeSignerEmail is required."),
          })
    });


    const [selectedCompany, setSelectedCompany] = useState<ISelectOptions>(initialSelectOption);
    const [selectedPropertyState, setSelectedPropertyState] = useState<ISelectOptions>(initialSelectOption);
    const [selectedOwnerState, setSelectedOwnerState] = useState<ISelectOptions>(initialSelectOption);
    const [companyList, setCompanyList] = useState<ISelectOptions[]>([]);
    const { allCompanies } = useEvictionAutomationContext();
    const [days,setDaysOptions]=useState<ISelectOptions[]>([]);
    const {selectedStateValue}=useAuth();
    const [initialValues, SetInitialValues] = useState<IEvictionAutomationQueueItem>({
        company: "",
        clientId: "",
        evictionAffiantIs: "",
        andAllOtherOccupants: "",
        allowMultipleImports: false,
        attorneyBarNo: "",
        attorneyEmail: "",
        attorneyName: "",
        bccEmails: "",
        ccEmails: "",
        tenantAddressConfig: "",
        confirmReportEmail: "",
        county: "",
        courtName:"",
        daysToFileAfterNoticeDelivery: 0,
        disabled: false,
        dismissalNotificationDay: "",
        dismissalNotificationDayMultiselect: [],
        expedited: false,
        filerBusinessName: "",
        evictionFilerEmail: "",
        evictionFilingDate: null,
        filingThresholdAdjustment: null,
        minimumFilingAmount: null,
        notes: "",
        noticesRequired: false,
        ownerId: "",
        ownerName: "",
        prescreenConfirmEmail: "",
        processServer: "",
        propertyAddress: "",
        propertyCity: "",
        propertyEmail: "",
        propertyId: "",
        propertyName: "",
        propertyPhone: "",
        propertyState: "",
        propertyStreetNo: "",
        propertyZip: "",
        prescreenSignEmail: false,
        signerEmail: "",
        stateCourt: false,
        unitsUsePropertyAddress: false,
        confirmationPin: "",
        ownerAddress: "",
        ownerCity: "",
        ownerState: "",
        ownerZip: "",
        ownerEmail: "",
        ownerPhone: "",
        crmName: "",
        noticeDelinquencyDate: null,
        noticeDismissalDate: null,
        noticeConfirmEmail: "",
        noticeSignerEmail: "",
        integrationId: "",
        xPropertyId: "",
        evictionFilingDays:0
    });
    useEffect(() => {
        var days=DaysOfWeekOptions.map((item)=>({id:item.name,value:item.name}));
        setDaysOptions(days);
        const list = allCompanies.map((item) => ({
            id: item.id,
            value: item.companyName,
        }));
        setCompanyList(list);
        if (isEditMode) {
            setFormData();
        }
    }, []);
    const [data, setData] = useState<boolean>(false);
    const setFormData = async () => {
        const response = await EvictionAutomationService.GetEvictionAutomationSettingByClient();
        if (response.status === HttpStatusCode.Ok) {

            setSelectedCompany({
                id: response.data.clientId,
                value: companyList.find(x => x.id === response.data.clientId)?.value || '',
            });
            setSelectedPropertyState({
                id: response.data.propertyState,
                value: StateCode.find(x => x.id === response.data.propertyState)?.value || '',
            });
            SetInitialValues(response.data);
            setData(true);
        }
    }

    const formContent = (
        <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
    >
        {(formik) => (
            <Form className="flex flex-col">
                <div className="add_eviction_form">
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2.5 md:gap-3.5">
                    {!isEditMode && <>
                        <div className="relative text-left">
                            {companyList.length &&
                                <FormikControl
                                    control="select"
                                    type="select"
                                    label={"Company"}
                                    name={"clientId"}
                                    defaultOption={"Select"}
                                    placeholder={"Process Server Email"}
                                    options={companyList}
                                //onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSelectInputChange(e, formik)}
                                />
                            }
                        </div>
                    </>}
                   
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="CrmName"
                            name="crmName"
                        />
                    </div>

                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="OwnerId"
                            name="ownerId"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="OwnerName"
                            name="ownerName"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="OwnerEmail"
                            name="ownerEmail"
                        />
                    </div>
                    <div className="relative">
                        <label className="text-gray-600 text-[11px] md:text-xs font-medium">OwnerPhone</label>
                        <FormikControl
                            control="maskedInput"
                            type="text"
                            label="OwnerPhone"
                            name="ownerPhone"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="OwnerAddress"
                            name="ownerAddress"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="OwnerCity"
                            name="ownerCity"
                        />
                    </div>
                    <div className="relative text-left">
                        <label className="text-gray-600 text-[11px] md:text-xs font-medium">OwnerState</label>
                        <DropdownPresentation
                            heading=""
                            selectedOption={selectedOwnerState}
                            handleSelect={(event) => {
                                formik.setFieldValue("ownerState", event.target.value);
                                setSelectedOwnerState({
                                    id: event.target.value,
                                    value: StateCode.find(x => x.id === event.target.value)?.value || '',
                                });
                            }}
                            options={StateCode}
                            placeholder="Select State"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="OwnerZip"
                            name="ownerZip"
                            maxlength={5}
                            onKeyDown={handlePostalCodeKeyDown}
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="PropertyId"
                            name="propertyId"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="PropertyName"
                            name="propertyName"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="PropertyEmail"
                            name="propertyEmail"
                        />
                    </div>
                    <div className="relative">
                        <label className="text-gray-600 text-[11px] md:text-xs font-medium">PropertyPhone</label>
                        <FormikControl
                            control="maskedInput"
                            type="text"
                            label="PropertyPhone"
                            name="propertyPhone"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="PropertyAddress"
                            name="propertyAddress"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="PropertyCity"
                            name="propertyCity"
                        />
                    </div>
                    <div className="relative text-left">
                        <label className="text-gray-600 text-[11px] md:text-xs font-medium">PropertyState</label>
                        <DropdownPresentation
                            heading=""
                            selectedOption={selectedPropertyState}
                            handleSelect={(event) => {
                                formik.setFieldValue("propertyState", event.target.value);
                                setSelectedPropertyState({
                                    id: event.target.value,
                                    value: StateCode.find(x => x.id === event.target.value)?.value || '',
                                });
                            }}
                            options={StateCode}
                            placeholder="Select State"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="PropertyZip"
                            name="propertyZip"
                            maxlength={5}
                            onKeyDown={handlePostalCodeKeyDown}
                        />
                    </div>                        
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="County"
                            name="county"
                        />
                    </div>
                    {selectedStateValue.toLowerCase()=="tx" && <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="CourtName"
                            name="courtName"
                        />
                    </div>}                    
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="ConfirmationPin"
                            name="confirmationPin"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="FilerBusinessName"
                            name="filerBusinessName"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="EvictionFilerEmail"
                            name="evictionFilerEmail"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="EvictionConfirmEmail"
                            name="confirmReportEmail"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="EvictionSignerEmail"
                            name="signerEmail"
                        />
                    </div>
                    <div className="relative">
                        {/* <FormikControl
                            control="number"
                            type="number"
                            label={"EvictionDelinquencyDate"}
                            name={"evictionFilingDate"}
                            placeholder={"EvictionDelinquencyDate"}
                        /> */}
                        <FormikControl
                            control="input"
                            type="number"
                            label={"EvictionDelinquencyDate"}
                            name={"evictionFilingDays"}
                            placeholder={"EvictionDelinquencyDate"}
                        />
                        {/* <label className="text-gray-600 text-[11px] md:text-xs font-medium">
                        EvictionDelinquencyDate
                        </label> */}

                        {/* <input type="number" name="evictionFilingDay" className="peer outline-none p-2 md:p-2.5 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" /> */}
                        {/* <FormikControl
                            control="input"
                            type="text"
                            label="EvictionFilingDay"
                            name="evictionFilingDay"
                        /> */}
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="date"
                            type="date"
                            label={"NoticeDelinquencyDate"}
                            name={"noticeDelinquencyDate"}
                            placeholder={"NoticeDelinquencyDate"}
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="date"
                            type="date"
                            label={"NoticeDimissalDate"}
                            name={"noticeDismissalDate"}
                            placeholder={"NoticeDismissalDate"}
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="multiselect"
                            type="select"
                            label={"DismissalNotificationDay"}
                            name={"dismissalNotificationDayMultiselect"}
                            defaultOption={"Select"}
                            placeholder={"DismissalNotificationDay"}
                            options={days}
                            selected={initialValues.dismissalNotificationDayMultiselect}
                        />
                        {/* <FormikControl
                            control="input"
                            type="text"
                            label="DismissalNotificationDay"
                            name="dismissalNotificationDay"
                        /> */}
                    </div>                                               
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="NoticeConfirmEmail"
                            name="noticeConfirmEmail"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="NoticeSignerEmail"
                            name="noticeSignerEmail"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="CcEmails"
                            name="ccEmails"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="BccEmails"
                            name="bccEmails"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="ProcessServer"
                            name="processServer"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="AttorneyName"
                            name="attorneyName"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="AttorneyBarNo"
                            name="attorneyBarNo"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="AttorneyEmail"
                            name="attorneyEmail"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="EvictionAffiantIs"
                            name="evictionAffiantIs"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="AndAllOtherOccupants"
                            name="andAllOtherOccupants"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="TenantAddressConfig"
                            name="tenantAddressConfig"
                        />
                    </div>

                    <div className="relative">
                        <label className="text-gray-600 text-[11px] md:text-xs font-medium">
                            DaysToFileAfterNoticeDelivery
                        </label>
                        <input type="number" name="daysToFileAfterNoticeDelivery" className="peer outline-none p-2 md:p-2.5 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none" />
                        {/* <FormikControl
                            control="input"
                            type="text"
                            label="DaysToFileAfterNoticeDelivery"
                            name="daysToFileAfterNoticeDelivery"
                        /> */}
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="number"
                            type="number"
                            min={-100000}
                            label="FilingThresholdAdjustment"
                            name="filingThresholdAdjustment"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="number"
                            type="number"
                            label="MinimumFilingAmount"
                            name="minimumFilingAmount"
                        />
                    </div>
                    <div className="relative">
                        <FormikControl
                            control="input"
                            type="text"
                            label="PrescreenConfirmEmail"
                            name="prescreenConfirmEmail"
                        />
                    </div>
                </div>
                <div className="md:flex my-2.5 md:my-3 gap-3.5">
                    <div className="relative relative md:w-4/12 mb-2.5 md:mb-0">
                        <FormikControl
                            control="textarea"
                            type="text"
                            label="EANotes"
                            name="notes"
                        />
                    </div>

                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-1.5 md:w-8/12 md:pt-5 md:pl-1">
                        <div className="relative flex items-center gap-1.5">
                            <input
                                className="h-3.5 w-3.5"
                                type="checkbox"
                                name="expedited"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    formik.setFieldValue("expedited", e.target.checked);
                                }}
                                checked={formik.values.expedited as boolean}
                            />
                            <label className="text-gray-600 text-[11px] md:text-xs font-medium">Expedited</label>
                        </div>
                        <div className="relative flex items-center gap-1.5">
                            <input
                                className="h-3.5 w-3.5"
                                type="checkbox"
                                name="unitsUsePropertyAddress"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    formik.setFieldValue("unitsUsePropertyAddress", e.target.checked);
                                }}
                                checked={formik.values.unitsUsePropertyAddress}
                            />
                            <label className="text-gray-600 text-[11px] md:text-xs font-medium">UnitsUsePropertyAddress</label>
                        </div>
                        <div className="relative flex items-center gap-1.5 xl:pl-2.5">
                            <input
                                className="h-3.5 w-3.5"
                                type="checkbox"
                                name="stateCourt"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    formik.setFieldValue("stateCourt", e.target.checked);
                                }}
                                checked={formik.values.stateCourt as boolean}
                            />
                            <label className="text-gray-600 text-[11px] md:text-xs font-medium">StateCourt</label>
                        </div>
                        <div className="relative flex items-center gap-1.5">
                            <input
                                className="h-3.5 w-3.5"
                                type="checkbox"
                                name="noticesRequired"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    formik.setFieldValue("noticesRequired", e.target.checked);
                                }}
                                checked={formik.values.noticesRequired}
                            />
                            <label className="text-gray-600 text-[11px] md:text-xs font-medium">NoticesRequired</label>
                        </div>
                        <div className="relative flex items-center gap-1.5">
                            <input
                                className="h-3.5 w-3.5"
                                type="checkbox"
                                name="prescreenSignEmail"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    formik.setFieldValue("prescreenSignEmail", e.target.checked);
                                }}
                                checked={formik.values.prescreenSignEmail}
                            />
                            <label className="text-gray-600 text-[11px] md:text-xs font-medium">PrescreenSignEmail</label>
                        </div>
                        {/* <div className="relative flex items-center gap-1.5">
                        <input
                            className="h-4 w-4"
                            type="checkbox"
                            name="allowMultipleImports"
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                formik.setFieldValue("allowMultipleImports", e.target.checked);
                            }}
                            checked={formik.values.allowMultipleImports}
                        />
                        <label>AllowMultipleImports</label>
                    </div> */}
                        <div className="relative flex items-center gap-1.5 xl:pl-2.5">
                            <input
                                className="h-3.5 w-3.5"
                                type="checkbox"
                                name="disabled"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    formik.setFieldValue("disabled", e.target.checked);
                                }}
                                checked={formik.values.disabled}
                            />
                            <label className="text-gray-600 text-[11px] md:text-xs font-medium">Disabled</label>
                        </div>
                    </div>
                </div>
                </div>
                

                <div className="py-2.5 flex justify-end mt-1.5">
                    {!isEditMode ? <><Button
                        type="button"
                        isRounded={false}
                        title="Cancel"
                        handleClick={() => closePopup("noRefresh")}
                        classes="text-[11px] md:text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg"
                    />
                        <Button
                            type="submit"
                            isRounded={false}
                            title="Save"
                            classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                        /></> : <><Button
                            type="submit"
                            isRounded={false}
                            title="Update"
                            classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                        /></>}

                </div>
            </Form>
        )}
    </Formik>
    );

    return (
        <>
            {isEditMode && data ? (
                <div className="pt-4 px-2 setting_tab">
                    {formContent}
                </div>
            ) : (
                showPopup && (
                    <Modal
                        showModal={showPopup}
                        onClose={() => closePopup("noRefresh")}
                        width="max-w-4xl"
                    >
                        <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                            <div className="sm:flex sm:items-start">
                                <div className="text-center sm:text-left">
                                    <h3
                                        className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                                        id="modal-title"
                                    >
                                        {isEditMode ? "Detail" : "Add"}
                                    </h3>
                                </div>
                            </div>
                            <div className="relative pt-1 md:pt-1.5 flex-auto">
                                {formContent}
                            </div>
                        </div>
                    </Modal>
                )
            )}
        </>
    );
};

export default EvictionAutomationSettingFormPopup;
