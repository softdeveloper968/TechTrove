import React, { ChangeEvent, useEffect, useState } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { Form, Formik } from "formik";
import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import DropdownPresentation from "components/common/dropdown/DropDown";
import { ISelectOptions } from "interfaces/all-cases.interface";
import { IEvictionAutomationIntegrationsGridItem, IEvictionAutomationPropexoGridItem, IEvictionAutomationQueueItem } from "interfaces/eviction-automation.interface";
import { useEvictionAutomationContext } from "pages/eviction-automation/EvictionAutomationContext";
import { DaysOfWeekOptions, StateCode } from "utils/constants";
import { handlePostalCodeKeyDown } from "utils/helper";
import EvictionAutomationService from "services/eviction-automation.service";
import CommonValidations from "utils/common-validations";
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

const EASettingFormPopup: React.FC<EASettingProps> = ({
    showPopup,
    closePopup,
    isEditMode,
    // initialValues,
    onSubmit,
}) => {
    const {selectedStateValue}=useAuth();
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
            .required("Confirm Report Email is required")
            .email("Please enter a valid Confirm Report Email address"),
        evictionFilerEmail: yup
            .string()
            //.required("Email is required")
            .email("Please enter a valid Eviction Filer Email address"),
        prescreenConfirmEmail: yup
            .string()
            //.required("Email is required")
            .email("Please enter a valid Prescreen Confirm Email address"),
        propertyEmail: yup
            .string()
            .nullable()
            //.required("Email is required")
            .email("Please enter a valid Property Email address"),
        signerEmail: yup
            .string()
            .required("Eviction Signer Email is required")
            .email("Please enter a valid Eviction Signer Email address"),
        clientId: yup.string().required("Company is required"),
        crmName: yup.string().required("Crm Name is required"),
        ownerId: yup.string().required("Owner Id is required"),
        ownerName: yup.string().required("Owner Name is required"),
        propertyId: yup.string().required("Property Id is required"),
        daysToFileAfterNoticeDelivery: yup.string().required("Please enter Days To File After Notice Delivery."),
         county: yup
                    .string()
                    .required("County is required"),
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
        minimumFilingAmount: yup.string().required("Minimum Filing Amount is required."),
        filingThresholdAdjustment: yup.string().required("Filing Threshold Adjustment is required."),
        confirmationPin: yup.string().required("Confirmation Pin is required."),
        // noticeConfirmEmail: yup.string().required("NoticeConfirmEmail is required."),
        // noticeSignerEmail: yup.string().required("NoticeSignerEmail is required."),
        noticesRequired: yup.boolean(),
        // noticeDelinquencyDate: yup.string().when('noticesRequired', (noticesRequired, schema) => {
        //     return noticesRequired ? schema.required('NoticeDelinquencyDate is required.') : schema;
        // }),
        noticeDelinquencyDate: yup.string().nullable().when("noticesRequired", {
            is: true, // Only make email required if noticesRequired is true
            then: (schema) => schema.required("Notice Delinquency Date is required."),
          }),
        noticeDismissalDate: yup.string().nullable().when("noticesRequired", {
            is: true, // Only make email required if noticesRequired is true
            then: (schema) => schema.required("Notice Dismissal Date is required."),
          }),
        noticeConfirmEmail: yup.string().email("Please enter a valid Notice Confirm Email address").when("noticesRequired", {
            is: true, // Only make email required if noticesRequired is true
            then: (schema) => schema.required("Notice Confirm Email is required."),
          }),
        noticeSignerEmail: yup.string().email("Please enter a Notice Signer Email address").when("noticesRequired", {
            is: true, // Only make email required if noticesRequired is true
            then: (schema) => schema.required("Notice Signer Email is required."),
          }),
    });

    const [selectedCompany, setSelectedCompany] = useState<ISelectOptions>(initialSelectOption);
    const [selectedPropertyState, setSelectedPropertyState] = useState<ISelectOptions>(initialSelectOption);
    const [selectedOwnerState, setSelectedOwnerState] = useState<ISelectOptions>(initialSelectOption);
    const [companyList, setCompanyList] = useState<ISelectOptions[]>([]);
    const [integrationList, setIntegrationList] = useState<ISelectOptions[]>([]);
    const { allCompanies, allIntegrations, allPMS, setShowSpinner,showSpinner } = useEvictionAutomationContext();
    const [days, setDaysOptions] = useState<ISelectOptions[]>([]);
    const [propertyList, setPropertyList] = useState<ISelectOptions[]>([]);
    const [ownerList, setOwnerList] = useState<ISelectOptions[]>([]);
    const [propertyListDetails, setPropertyListDetails] = useState<IEvictionAutomationIntegrationsGridItem[]>([]);
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
        evictionFilingDays:0,
        courtName:""
    });
    useEffect(() => {
        var days = DaysOfWeekOptions.map((item) => ({ id: item.name, value: item.name }));
        setDaysOptions(days);
        const list = allCompanies.map((item) => ({
            id: item.id,
            value: item.companyName,
        }));
        setCompanyList(list);
        const inteList = allPMS.map((item) => ({
            id: item.id,
            value: `${item.pmsName}`,
        }));
        setIntegrationList(
            inteList?.sort((a, b) => {
              return a.value.localeCompare(b.value); // Sorting based on the 'value' property
            }) || []
          );          
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
    const handleSelectIntegrationChange = async (event: ChangeEvent<HTMLSelectElement>) => {
        const pmsId = event.target.value as string;
        try {
            setShowSpinner(true);
            // get late notices
            const apiResponse = await EvictionAutomationService.getPropertyBasedOnPMS(pmsId);
            if (apiResponse.status === HttpStatusCode.Ok) {
                
                setPropertyListDetails(apiResponse.data)
                const list = apiResponse.data.map((item) => ({
                    id: item.id ?? "",
                    value: item.propertyName ?? "",
                }));

                //setPropertyList(list);
                const ownerMap = new Map<string, { ownerId: string; ownerName: string }>();
                apiResponse.data.forEach((item) => {
                    const ownerName = item.ownerName?.trim(); // Ensure ownerName is not null, undefined, or an empty string
                    const ownerId = item.ownerId?.trim()
                    // Skip items where ownerName is not present
                    if (!ownerName || !ownerId) {
                        return;
                    }
                     ; // Fallback if ownerId is null

                    if (!ownerMap.has(ownerName)) {
                        ownerMap.set(ownerName, {
                            ownerId,
                            ownerName,
                        }
                    );
                    
                    }
                });

                //Convert Map to a list for dropdown (with id and name)
                    const ownerList = Array.from(ownerMap.values()).map((owner) => ({
                        id: owner.ownerId,
                        value: owner.ownerName,
                    }));

                    setOwnerList(
                        ownerList?.sort((a, b) => {
                          return a.value.localeCompare(b.value);
                        }) || []
                      );
                  
                // const list = apiResponse.data.map((item) => ({
                //     id: item.propertyId ?? "",
                //     value: item.propertyName ?? "",
                // }));


                 //setPropertyList(list);
                setShowSpinner(false);
            }
        } catch (error) {
            setShowSpinner(false);
            console.log(error);
        }
    };
    const handleSelectOwnerChange = async (event: ChangeEvent<HTMLSelectElement>) => {
        try {
            setShowSpinner(true);
            const ownerId = event.target.value as string;
            // Assuming you have access to the full property list in a state (e.g., `fullPropertyList`)
            const filteredProperties = propertyListDetails.filter(
                (property) => property.ownerId === ownerId
            );

            // Create the new list for the properties of the selected owner
            const propertyList = filteredProperties.map((item) => ({
                id: item.id ?? "",
                value: item.propertyName ?? "",
            }));

            // Set the filtered property list
            setPropertyList(
                propertyList?.sort((a, b) => {
                  return a.value.localeCompare(b.value); // Assuming the property objects have a 'value' property
                }) || []
              );              
            setShowSpinner(false);
        } catch (error) {
            setShowSpinner(false);
            console.log(error);
        }
    };
    const handlePropertyChange = (formik: any,selectedValue: string) => {
        const property = propertyListDetails.find(x => x.id === selectedValue);
    
        if (property) {
            // Set field values in Formik
            formik.setFieldValue("xPropertyId", property.id);
            formik.setFieldValue("propertyId", property.propertyId);
            formik.setFieldValue("propertyPhone", property.propertyPhone);
            formik.setFieldValue("propertyCity", property.city);
            formik.setFieldValue("propertyState", property.state);
            setSelectedPropertyState({
                id: property.state ?? "",
                value: StateCode.find(x => x.id === property.state)?.value || '',
            });
            formik.setFieldValue("propertyZip", property.zip);
            formik.setFieldValue("propertyName", property.propertyName);
            formik.setFieldValue("propertyEmail", property.propertyEmail);
            formik.setFieldTouched("propertyEmail", false);
            formik.setFieldValue("propertyAddress", property.streetAddress1);
            formik.setFieldValue("county", property.county);
            formik.setFieldTouched("county", false);
            // Set owner details
            formik.setFieldValue("ownerPhone", property.ownerPhone);
            formik.setFieldValue("ownerCity", property.ownerCity);
            formik.setFieldValue("ownerState", property.ownerState);
            setSelectedOwnerState({
                id: property.ownerState ?? "",
                value: StateCode.find(x => x.id === property.ownerState)?.value || '',
            });
            formik.setFieldValue("ownerZip", property.ownerZip);
            formik.setFieldValue("ownerName", property.ownerName);
            formik.setFieldTouched("ownerName", false);
            formik.setFieldValue("ownerEmail", property.ownerEmail);
            formik.setFieldValue("ownerAddress", property.ownerAddress);
        } else {
            // Reset values if no property found
            formik.setFieldValue("xPropertyId", "");
            formik.setFieldValue("propertyId", "");
            formik.setFieldTouched("propertyId", false);
            formik.setFieldValue("propertyPhone", "");
            formik.setFieldValue("propertyCity", "");
            formik.setFieldValue("propertyState", "");
            setSelectedPropertyState({
                id: "",
                value: StateCode.find(x => x.id === "")?.value || '',
            });
            formik.setFieldValue("propertyZip", "");
            formik.setFieldValue("propertyName", "");
            formik.setFieldValue("propertyEmail", "");
            formik.setFieldValue("propertyAddress", "");
            formik.setFieldValue("county", "");
            // Reset owner details
            formik.setFieldValue("ownerPhone", "");
            formik.setFieldValue("ownerCity", "");
            formik.setFieldValue("ownerState", "");
            setSelectedOwnerState({
                id: "",
                value: StateCode.find(x => x.id === "")?.value || '',
            });
            formik.setFieldValue("ownerZip", "");
            formik.setFieldValue("ownerName", "");
            formik.setFieldValue("ownerEmail", "");
            formik.setFieldValue("ownerAddress", "");
        }
    };
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
                        <div className="relative text-left">
                            {/* {integrationList.length && */}
                                <FormikControl
                                    control="select"
                                    type="select"
                                    label={"Integration"}
                                    name={"integrationId"}
                                    defaultOption={"Select"}
                                    placeholder={"Select Integration"}
                                    options={integrationList}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                        ;
                                        const integration = allPMS.find(x => x.id === e.target.value)
                                        if (integration != null) {
                                            handleSelectIntegrationChange(e);
                                            formik.setFieldValue("integrationId", integration?.id)
                                            formik.setFieldValue("crmName", integration?.pmsName)
                                            formik.setFieldTouched("crmName", false);
                                        }
                                        else {
                                            setPropertyList([]);
                                            setPropertyListDetails([]);
                                            setOwnerList([]);
                                            formik.setFieldValue("integrationId", "")
                                            formik.setFieldValue("crmName", "")
                                        }
                                        formik.setFieldValue("ownerId","")
                                        handlePropertyChange(formik, "")
                                    }}
                                />
                            {/* } */}
                        </div>
                            <div className="relative text-left">
                                {
                                    <FormikControl
                                        control="select"
                                        type="select"
                                        label={"Owner"}
                                        name={"owner"}
                                        defaultOption={"Select"}
                                        placeholder={"Select Owner"}
                                        options={ownerList}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                            
                                            const owner = ownerList.find(x => x.id === e.target.value)
                                            if (owner !== null) {
                                                handleSelectOwnerChange(e);
                                                formik.setFieldValue("ownerId", owner?.id)
                                                formik.setFieldTouched("ownerId", false);
                                                handlePropertyChange(formik, "")
                                            }
                                            else {
                                                formik.setFieldValue("ownerId", "")
                                                setPropertyList([]);
                                                handlePropertyChange(formik, "")
                                            }
                                        }}
                                    />
                                }
                            </div>
                        <div className="relative text-left">
                            {
                                <FormikControl
                                    control="select"
                                    type="select"
                                    label={"Property"}
                                    name={"xPropertyId"}
                                    defaultOption={"Select"}
                                    placeholder={"Select Property"}
                                    options={propertyList}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                        
                                        handlePropertyChange(formik, e.target.value)
                                    }}
                                />
                            }
                        </div>
                        <div className="relative">
                            <FormikControl
                                control="input"
                                type="text"
                                label="CrmName"
                                name="crmName"
                                disabled={true}
                            />
                        </div>

                        <div className="relative">
                            <FormikControl
                                control="input"
                                type="text"
                                label="OwnerId"
                                name="ownerId"
                                disabled={true}
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
                                disabled={true}
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
                                disabled={showSpinner}
                                classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                            /></> : <><Button
                                type="submit"
                                isRounded={false}
                                title="Update"
                                disabled={showSpinner}
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

export default EASettingFormPopup;
