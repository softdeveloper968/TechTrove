import React, { ChangeEvent } from "react";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { Form, Formik, FormikProps } from "formik";

import Modal from "components/common/popup/PopUp";
import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";

import { ICountyItems } from "interfaces/county.interface";
import { useEvictionAutomationContext } from "pages/eviction-automation/EvictionAutomationContext";
import { useAuth } from "context/AuthContext";
import { UserRole } from "utils/enum";
import { IEvictionAutomationPropexoGridItem, ITranctionCodeList, ITransactionCodesItem } from "interfaces/eviction-automation.interface";
import EvictionAutomationService from "services/eviction-automation.service";
import { FaPlusCircle, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import { ISelectOptions } from "interfaces/all-cases.interface";

// Validation schema for the county model
const validationSchema = yup.object({
    clientId: yup
        .string()
        .required("Company is required"), // Ensure clientId contains a value

    propertyId: yup
        .string()
        .required("Property is required"), // Ensure propertyId contains a value
});

type TransactionCodesFormPopupProps = {
    showPopup: Boolean;
    closePopup: (shouldRefresh: string) => void;
    isEditMode: boolean;
    initialValues: ITransactionCodesItem;
    onSubmit: (formValues: ITransactionCodesItem) => void;
};

const TransactionCodesFormPopup: React.FC<TransactionCodesFormPopupProps> = ({
    showPopup,
    closePopup,
    isEditMode,
    initialValues,
    onSubmit,
}) => {
    const [states, setStates] = useState<ICountyItems[]>([]);
    const [companyId, setCompanyId] = useState<string>('');
    const [transactionCodeList, setTransactionCodeList] = useState<ITranctionCodeList[]>([]);
    const [isPropertySelected, setIsPropertySelected] = useState<boolean>(false);
    const [propertyList, setPropertyList] = useState<ISelectOptions[]>([]);
    const [ownerList, setOwnerList] = useState<ISelectOptions[]>([]);
    const [propertyListDetails, setPropertyListDetails] = useState<IEvictionAutomationPropexoGridItem[]>([]);
    const [integrationList, setIntegrationList] = useState<ISelectOptions[]>([]);
    const { userRole } = useAuth();

    const [selectedValues, setSelectedValues] = useState([
        { id: "", value: "", disabled: false },
    ]);
    const initialFormValues: ITransactionCodesItem = {
        id: initialValues.id ?? "",
        companyName: initialValues.companyName ?? "",
        clientId: initialValues.clientId ?? "",
        integrationId: initialValues.integrationId ?? "",
        propertyId: initialValues.propertyId ?? "",
        propertyName: initialValues.propertyName ?? "",
        ownerId: initialValues.ownerId ?? "",
        ownerName: initialValues.ownerName ?? "",
        transactionCodes: initialValues.transactionCodes ?? "",
        propexoTransactionCodes: Array.isArray(initialValues?.propexoTransactionCodes) && initialValues?.propexoTransactionCodes.length
            ? initialValues.propexoTransactionCodes
            : [
                {
                    transactionCodeId: "",
                    transactionCodeName: "",
                    transactionCodeDescription: "",
                    isRent: false,
                    isSubsidy: false,
                    transactionCodeShortDescription: ""
                    //CompanyPropertyTransactionCodeId: "",
                },
            ],
            
    };

    const {
        allCompanies,
        showSpinner,
        setShowSpinner,
        getTransactionCodes,
        allProperties,
        allIntegrations,
        getAllIntegrations
    } = useEvictionAutomationContext();

    useEffect(() => {
        if (initialFormValues.propertyId != null && initialFormValues.integrationId != null && initialFormValues.propertyId !== "" && initialFormValues.integrationId !== "") {
            setIsPropertySelected(true);
            fetchOwnerListByIntegrationId(initialFormValues.integrationId ?? "");
            getTransactionCodesById(initialFormValues.propertyId ?? "", initialFormValues.integrationId ?? "");
        }
    }, []);
    useEffect(() => {
        getAllIntegrations();
        const inteList = allIntegrations.map((item) => ({
            id: item.integrationId,
            value: `${item.integrationVendorName} - ${item.integrationName}`,
        }));
        setIntegrationList(
            inteList?.sort((a, b) => {
                return a.value.localeCompare(b.value); // Sorting based on the 'value' property
            }) || []
        );
        console.log(initialValues);
        var data = localStorage.getItem("userDetail");
        if (data != null) {
            var id = JSON.parse(data).ClientID;
            if (userRole.includes(UserRole.Admin)) {
                allCompanies.filter(x => x.id == id)
            }
        }
    }, []);



    const getTransactionCodesById = async (propertyId: string, integrationId: string) => {
        try {
            // Display spinner while processing
            setShowSpinner(true);
            // Attempt to delete the county
            const response = await EvictionAutomationService.getTransactionCodeById(propertyId, integrationId);

            // Check if the deletion was successful
            if (response.status === HttpStatusCode.Ok) {
                setTransactionCodeList(response.data);
            }
        } catch (error) {
            // Handle errors if needed
            console.error("Error deleting transactionCodes:", error);
        } finally {
            // Hide the spinner regardless of the outcome
            setShowSpinner(false);
        }
    };

    const handleDropdownChange = (
        index: number,
        selectedValue: string,
        formik: FormikProps<ITransactionCodesItem>
    ) => {
        const isValueAlreadyAdded = formik.values.propexoTransactionCodes.some(
            (code) => code.transactionCodeId === selectedValue
        );

        if (isValueAlreadyAdded) {
            // Show toast notification if the selected value is already added
            toast.error("Transaction code already added.");
            return;
        }
        // Get the transaction code details from the transactionCodeList based on the selected value
        const filteredTransactionCode = transactionCodeList.find((x) => x.codeId === selectedValue);
        if (filteredTransactionCode) {
            // Update the corresponding transaction code in the formik values
            let updatedTransactionCodes = [...formik.values.propexoTransactionCodes];
            updatedTransactionCodes[index] = {
                ...updatedTransactionCodes[index],
                transactionCodeId: selectedValue,
                transactionCodeName: filteredTransactionCode.name,
                transactionCodeDescription: filteredTransactionCode.description,
            };

            // Update Formik's field value for the entire propexoTransactionCodes array
            formik.setFieldValue("propexoTransactionCodes", updatedTransactionCodes);

            // Update the selected values state
            const updatedSelectedValues = selectedValues.map((item, idx) =>
                idx === index ? { ...item, value: selectedValue } : item
            );
            setSelectedValues(updatedSelectedValues);
        }
    };
    const handleSelectIntegrationChange = async (event: ChangeEvent<HTMLSelectElement>) => {
        const integrationId = event.target.value as string;
        try {
            setShowSpinner(true);
            fetchOwnerListByIntegrationId(integrationId);

        } catch (error) {
            setShowSpinner(false);
            console.log(error);
        }
    };
    const fetchOwnerListByIntegrationId = async (integrationId: string) => {
        try {
            
            // Start the spinner or loading state if needed
            setShowSpinner(true);

            // Fetch properties based on integration ID
            const apiResponse = await EvictionAutomationService.getPropertyBasedOnIntegrationId(integrationId);

            if (apiResponse.status === HttpStatusCode.Ok) {
                setPropertyListDetails(apiResponse.data);
                const ownerMap = new Map<string, { ownerId: string; ownerName: string }>();

                apiResponse.data.forEach((item) => {
                    const ownerName = item.ownerName?.trim(); // Ensure ownerName is not null, undefined, or an empty string
                    const ownerId = item.ownerId?.trim(); // Fallback if ownerId is null

                    // Skip items where ownerName or ownerId is not present
                    if (!ownerName || !ownerId) {
                        return;
                    }

                    if (!ownerMap.has(ownerName)) {
                        ownerMap.set(ownerName, {
                            ownerId,
                            ownerName,
                        });
                    }
                });

                // Convert Map to a list for dropdown (with id and name)
                const ownerList = Array.from(ownerMap.values()).map((owner) => ({
                    id: owner.ownerId,
                    value: owner.ownerName,
                }));

                setOwnerList(ownerList.sort((a, b) => a.value.localeCompare(b.value)) || []);
                if(initialValues.ownerId != null || initialValues.ownerId !=='')
                {
                    setShowSpinner(true);

                    // Assuming you have access to the full property list in a state (e.g., `propertyListDetails`)
                    const filteredProperties = apiResponse.data.filter(
                        (property) => property.ownerId === initialValues.ownerId
                    );
            
                    // Create the new list for the properties of the selected owner
                    const propertyList = filteredProperties.map((item) => ({
                        id: item.propertyId ?? "",
                        value: item.propertyName ?? "",
                    }));
            
                    // Set the filtered property list
                    setPropertyList(
                        propertyList.sort((a, b) => a.value.localeCompare(b.value)) || []
                    );
            
                    // Stop the spinner or loading state
                    setShowSpinner(false);
                }
            } else {
                // Handle the case where the response status is not OK
                console.error("Failed to fetch properties:", apiResponse.status);
            }
        } catch (error) {
            console.error("An error occurred while fetching owner list:", error);
        } finally {
            // Stop the spinner or loading state
            setShowSpinner(false);
        }
    };


    const handleSelectOwnerChange = async (event: ChangeEvent<HTMLSelectElement>) => {
        try {
            const ownerId = event.target.value as string;
            filterPropertiesByOwnerId(ownerId);
        } catch (error) {
            setShowSpinner(false);
            console.log(error);
        }
    };
    const filterPropertiesByOwnerId = (ownerId: string) => {
        
        // Start the spinner or loading state if needed
        setShowSpinner(true);

        // Assuming you have access to the full property list in a state (e.g., `propertyListDetails`)
        const filteredProperties = propertyListDetails.filter(
            (property) => property.ownerId === ownerId
        );

        // Create the new list for the properties of the selected owner
        const propertyList = filteredProperties.map((item) => ({
            id: item.propertyId ?? "",
            value: item.propertyName ?? "",
        }));

        // Set the filtered property list
        setPropertyList(
            propertyList.sort((a, b) => a.value.localeCompare(b.value)) || []
        );
        setTransactionCodeList([]);
        // Stop the spinner or loading state
        setShowSpinner(false);
    };

    const renderTransactionCodeOptions = (options: ITranctionCodeList[], index: number) => {
        return (
            <>
                <option value="">Select an option</option>
                {options.map((option) => (
                    <option key={option.codeId} value={option.codeId}
                        title={`${option.name ? option.name + (option.description ? ' - ' + option.description : '') : ''}`}>
                        {option.name}
                    </option>
                ))}
            </>
        );
    };

    const handleCheckboxChange = (
        fieldName: string,
        value: boolean,
        formik: FormikProps<ITransactionCodesItem>
    ) => {
        formik.setFieldValue(`${fieldName}`, value);
    };

    const handlePlusClick = (formik: FormikProps<ITransactionCodesItem>) => {
        const newTransaction = {
            transactionCodeId: "",
            transactionCodeName: "",
            transactionCodeDescription: "",
            isRent: false,
            isSubsidy: false,
            transactionCodeShortDescription: ""

        };

        // Update the form data model by adding the new optional service object
        formik.setFieldValue("propexoTransactionCodes", [...formik.values.propexoTransactionCodes, newTransaction]);
        setSelectedValues([...selectedValues, { id: '', value: '', disabled: false }])
    };

    const [addedTransactionCodes, setAddedTransactionCodes] = useState<string[]>([]);
    const [areAllTransactionCodesAdded, setAreAllTransactionCodesAdded] = useState(false);

    const handleToggleTransactionCodes = (formik: FormikProps<ITransactionCodesItem>) => {

        setAreAllTransactionCodesAdded((prevState) => {
            const currentSelectedTransactionCodes = formik.values.propexoTransactionCodes.filter((code) => code.transactionCodeId !== '').map(
                (code) => code.transactionCodeId
            );
            // Retrieve the list of codes that are already selected
            const selectedTransactionIds = currentSelectedTransactionCodes;

            if (prevState) {
                // Remove only the transaction codes added by the "Add All" action
                const remainingTransactionCodes = formik.values.propexoTransactionCodes.filter(
                    (transactionCode) => !addedTransactionCodes.includes(transactionCode.transactionCodeId)
                );

                formik.setFieldValue("propexoTransactionCodes", remainingTransactionCodes);

                // Update selected values after removing
                const updatedSelectedValues = remainingTransactionCodes.map((transactionCode) => ({
                    id: transactionCode.transactionCodeId,
                    value: transactionCode.transactionCodeId,
                    disabled: false,
                }));

                setSelectedValues(updatedSelectedValues);
                setAddedTransactionCodes([]); // Clear the added codes state
            } else {
                // Add only the missing transaction codes, excluding default/placeholder values
                const missingTransactionCodes = transactionCodeList
                    .filter((transactionCode) => !selectedTransactionIds.includes(transactionCode.codeId))
                    .filter((transactionCode) => transactionCode.codeId !== "default"); // Exclude default or placeholder codes

                if (missingTransactionCodes.length > 0) {
                    const newTransactionCodes = missingTransactionCodes.map((transactionCode) => ({
                        transactionCodeId: transactionCode.codeId,
                        transactionCodeName: transactionCode.name,
                        transactionCodeDescription: transactionCode.description,
                        isRent: false,
                        isSubsidy: false,
                        transactionCodeShortDescription: ""// Default value or adjust based on your logic
                        //  CompanyPropertyTransactionCodeId: "", // Adjust if needed
                    }));

                    formik.setFieldValue("propexoTransactionCodes", [
                        ...formik.values.propexoTransactionCodes,
                        ...newTransactionCodes,
                    ]);

                    // Track the newly added transaction codes
                    setAddedTransactionCodes((prevCodes) => [
                        ...prevCodes,
                        ...missingTransactionCodes.map((transactionCode) => transactionCode.codeId),
                    ]);

                    // Update selected values after adding
                    const updatedSelectedValues = [
                        ...selectedValues,
                        ...missingTransactionCodes.map((transactionCode) => ({
                            id: transactionCode.codeId,
                            value: transactionCode.codeId,
                            disabled: false,
                        })),
                    ];

                    setSelectedValues(updatedSelectedValues);
                }
            }

            // Return the new state for areAllTransactionCodesAdded
            return !prevState;
        });
    };

    const areAllTransactionCodesSelected = (formik: FormikProps<ITransactionCodesItem>): boolean => {
        const selectedTransactionIds = formik.values.propexoTransactionCodes.map(
            (code) => code.transactionCodeId
        );

        // Check if every transaction code in the list is already selected
        return transactionCodeList
            .filter((code) => code.codeId !== "default") // Exclude default or placeholder codes
            .every((code) => selectedTransactionIds.includes(code.codeId));
    };


    const handleCrossClick = (
        _index: number,
        formik: FormikProps<ITransactionCodesItem>
    ) => {
        if (formik.values.propexoTransactionCodes && formik.values.propexoTransactionCodes.length >= 1) {
            // Use filter to create a new array without the element at the specified _index
            let filteredRecords = formik.values.propexoTransactionCodes.filter(
                (_, index) => index !== _index
            );
            // Update the form data model using Formik's setFieldValue
            formik.setFieldValue("propexoTransactionCodes", filteredRecords);
        }
    };

    return (
        <>
            {showPopup && (
                <Modal
                    showModal={showPopup}
                    onClose={() => closePopup("noRefresh")}
                    width="max-w-5xl"
                >
                    <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                        <div className="sm:flex sm:items-start">
                            <div className="text-center sm:text-left">
                                <h3
                                    className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                                    id="modal-title"
                                >
                                    {isEditMode ? "Edit" : "Create"}
                                </h3>
                            </div>
                        </div>
                        <div className="relative pt-1 md:pt-1.5 flex-auto">
                            <Formik
                                initialValues={initialFormValues}
                                validationSchema={validationSchema}
                                onSubmit={onSubmit}
                            >
                                {(formik) => (
                                    <Form className="flex flex-col">
                                        <div className="grid sm:grid-cols-2 gap-2.5 md:gap-3.5">
                                            <div className="relative text-left">
                                                <FormikControl
                                                    control="select"
                                                    type="select"
                                                    label={"Company"}
                                                    name={"clientId"}
                                                    disabled={isEditMode}
                                                    placeholder={"Select Company"}
                                                    options={allCompanies.map((company) => ({
                                                        label: company.companyName, // Display companyName in the dropdown
                                                        value: company.companyName,
                                                        id: company.id// Use id as the unique value
                                                    }))}
                                                    defaultOption={"Select"}
                                                    onChange={(e: any) => {
                                                        const selectedCompany = allCompanies.find(
                                                            (company) => company.id === e.target.value
                                                        );
                                                        if (selectedCompany) {
                                                            formik.setFieldValue("companyName", selectedCompany.companyName); // Set companyName
                                                            formik.setFieldValue("clientId", selectedCompany.id); // Set clientId
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="relative text-left">
                                                {integrationList.length &&
                                                    <FormikControl
                                                        control="select"
                                                        type="select"
                                                        label={"Integration"}
                                                        name={"integrationId"}
                                                        disabled={isEditMode}
                                                        defaultOption={"Select"}
                                                        placeholder={"Select Integration"}
                                                        options={integrationList}
                                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                            ;
                                                            const integration = allIntegrations.find(x => x.integrationId === e.target.value)
                                                            if (integration != null) {
                                                                handleSelectIntegrationChange(e);
                                                                formik.setFieldValue("integrationId", integration?.integrationId)
                                                            }
                                                            else {
                                                                setPropertyList([]);
                                                                setPropertyListDetails([]);
                                                                setOwnerList([]);
                                                                setTransactionCodeList([]);
                                                                formik.setFieldValue("integrationId", "")
                                                            }
                                                            formik.setFieldValue("ownerId", "")
                                                            formik.setFieldValue("propertyId", "");
                                                            formik.setFieldValue("propertyName", "");
                                                        }}
                                                    />
                                                }
                                            </div>
                                            <div className="relative text-left">
                                                {
                                                    <FormikControl
                                                        control="select"
                                                        type="select"
                                                        label={"Owner"}
                                                        disabled={isEditMode}
                                                        name={"ownerId"}
                                                        defaultOption={"Select"}
                                                        placeholder={"Select Owner"}
                                                        options={ownerList}
                                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {

                                                            const owner = ownerList.find(x => x.id === e.target.value)
                                                            if (owner !== null) {
                                                                handleSelectOwnerChange(e);
                                                                formik.setFieldValue("ownerId", owner?.id)
                                                                formik.setFieldValue("ownerName", owner?.value)
                                                                formik.setFieldValue("propertyId", "");
                                                                formik.setFieldValue("propertyName", "");
                                                            }
                                                            else {
                                                                formik.setFieldValue("ownerId", "")
                                                                formik.setFieldValue("ownerName", "")
                                                                setPropertyList([]);
                                                                formik.setFieldValue("propertyId", "");
                                                                formik.setFieldValue("propertyName", "");
                                                                setTransactionCodeList([]);
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
                                                        name={"propertyId"}
                                                        disabled={isEditMode}
                                                        defaultOption={"Select"}
                                                        placeholder={"Select Property"}
                                                        options={propertyList}
                                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                                            const property = propertyListDetails.find(x => x.propertyId === e.target.value);
                                                            if (property) {
                                                                formik.setFieldValue("propertyId", property.propertyId);
                                                                formik.setFieldValue("propertyName", property.propertyName);
                                                                setIsPropertySelected(true);
                                                                getTransactionCodesById(property.propertyId ?? "", property.integrationId ?? "");
                                                            }
                                                            else {
                                                                formik.setFieldValue("propertyId", "");
                                                                formik.setFieldValue("propertyName", "");
                                                                setIsPropertySelected(false);
                                                                setTransactionCodeList([]);
                                                            }

                                                        }}
                                                    />
                                                }
                                            </div>
                                        </div>
                                        {isPropertySelected &&
                                            <div className="court_payments">
                                                <div className="flex mt-3.5 items-center gap-3.5 mb-2">
                                                    <label className="font-medium">Add Transaction Code</label>
                                                    <FaPlusCircle
                                                        style={{
                                                            height: 20,
                                                            width: 20,
                                                            color: "#2472db",
                                                            cursor: "pointer"
                                                        }}
                                                        onClick={() => handlePlusClick(formik)}
                                                    />
                                                    {/* {/ New button for adding all transaction codes /} */}
                                                    <button
                                                        type="button"
                                                        className={`bg-${areAllTransactionCodesAdded ? 'blue' : 'blue'}-500 bg-[#2472db] text-white px-2 py-1 rounded-md ml-1 text-[11px] md:text-xs`}
                                                        onClick={() => handleToggleTransactionCodes(formik)}
                                                    //disabled={areAllTransactionCodesAdded ? areAllTransactionCodesSelected(formik) : false} 
                                                    >
                                                        {areAllTransactionCodesAdded ? "Remove All Codes" : "Add All Codes"}
                                                    </button>
                                                </div>
                                                <div className="overflow-auto" style={{ maxHeight: '18rem' }}>
                                                    {
                                                        formik.values.propexoTransactionCodes &&
                                                        formik.values.propexoTransactionCodes.map((value, index) => {
                                                            if (formik.values.propexoTransactionCodes.length - 1 === transactionCodeList.length) {
                                                                formik.values.propexoTransactionCodes = formik.values.propexoTransactionCodes.filter(x => x.transactionCodeId !== '')
                                                            }
                                                            const selectedTransactionIds = formik.values.propexoTransactionCodes
                                                                .slice(0, index)

                                                                .map((item) => item.transactionCodeId);

                                                            return (
                                                                <div
                                                                    className="md:flex gap-2.5 md:gap-3.5 mb-2.5"
                                                                    key={index}
                                                                >
                                                                    <div className="md:w-[23%] lg:w-[25%]">
                                                                        <label className="text-gray-600 text-[11px] md:text-xs font-medium">Select Code</label>
                                                                        <select
                                                                            className={`peer outline-none py-2 md:py-2.5 p-2.5 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none disabled:bg-[#fcfcfc] disabled:text-[#a8aeb8] bg-no-repeat bg-[center_right_13px] appearance-none !pr-7`}
                                                                            value={value.transactionCodeId}
                                                                            title={`${value.transactionCodeName ? value.transactionCodeName + (value.transactionCodeDescription ? ' - ' + value.transactionCodeDescription : '') : ''}`}
                                                                            onChange={(e) => handleDropdownChange(index, e.target.value, formik)}
                                                                        >
                                                                            {renderTransactionCodeOptions(
                                                                                transactionCodeList,
                                                                                index
                                                                            )}
                                                                        </select>
                                                                    </div>
                                                                    <div className="flex flex-col sm:flex-row gap-2 md:w-[42%] lg:w-[44%] pt-1 md:pt-0">
                                                                        <div className="sm:w-[50%]">
                                                                            {/* Heading for transactionCodeDescription */}
                                                                            <label className="text-gray-600 text-[11px] md:text-xs font-medium">Description</label>
                                                                            {/* transactionCodeDescription - disabled */}
                                                                            <input
                                                                                type="text"
                                                                                className="py-2 md:py-2.5 p-2.5 block border w-full border-gray-200 rounded-md text-xs bg-[#fcfcfc] disabled:opacity-50"
                                                                                value={value.transactionCodeDescription || ''}
                                                                                disabled
                                                                                title={value.transactionCodeDescription || ''}
                                                                            />
                                                                        </div>
                                                                        <div className="sm:w-[50%]">
                                                                            {/* Heading for transactionCodeShortDescription */}
                                                                            <label className="text-gray-600 text-[11px] md:text-xs font-medium">Short Description</label>
                                                                            {/* transactionCodeShortDescription - editable */}
                                                                            <input
                                                                                type="text"
                                                                                className="py-2 md:py-2.5 p-2.5 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500"
                                                                                value={value.transactionCodeShortDescription || ''}
                                                                                onChange={(e) => {
                                                                                    formik.setFieldValue(`propexoTransactionCodes[${index}].transactionCodeShortDescription`, e.target.value);
                                                                                }}
                                                                                title={value.transactionCodeShortDescription || ''}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex items-center gap-1.5 sm:gap-2 pt-2.5 md:pt-0">
                                                                        <div className="relative text-left">
                                                                            <label className="text-gray-600 text-[11px] md:text-xs font-medium hidden md:block">&nbsp;</label>
                                                                            <div className="flex items-center flex-row-reverse justify-end gap-1.5" key={`${index}_isRent`}>
                                                                                <FormikControl
                                                                                    control="checkbox"
                                                                                    type="checkbox"
                                                                                    label={"Is Rent"}
                                                                                    name={`propexoTransactionCodes[${index}].isRent`}
                                                                                    checked={value.isRent}
                                                                                    onChange={(isChecked: boolean) => {
                                                                                        handleCheckboxChange(
                                                                                            `propexoTransactionCodes[${index}].isRent`,
                                                                                            isChecked,
                                                                                            formik
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <div className="relative text-left">
                                                                            <label className="text-gray-600 text-[11px] md:text-xs font-medium hidden md:block">&nbsp;</label>
                                                                            <div className="flex items-center flex-row-reverse justify-end gap-1.5" key={`${index}_isSubsidy`}>
                                                                                <FormikControl
                                                                                    control="checkbox"
                                                                                    type="checkbox"
                                                                                    label={"Is Subsidy"}
                                                                                    name={`propexoTransactionCodes[${index}].isSubsidy`}
                                                                                    checked={value.isSubsidy}
                                                                                    onChange={(isChecked: boolean) => {
                                                                                        handleCheckboxChange(
                                                                                            `propexoTransactionCodes[${index}].isSubsidy`,
                                                                                            isChecked,
                                                                                            formik
                                                                                        );
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        </div>

                                                                        <div className="relative text-left">
                                                                            <label className="text-gray-600 text-[11px] md:text-xs font-medium hidden md:block">&nbsp;</label>
                                                                            <div className="flex items-center">
                                                                                {index >= 0 && (
                                                                                    <div
                                                                                        className="cursor-pointer mr-2.5"
                                                                                        key={`${index}_cross`}
                                                                                    >
                                                                                        <FaTimes
                                                                                            style={{
                                                                                                height: 17,
                                                                                                width: 17,
                                                                                                color: "#2472db",
                                                                                            }}
                                                                                            onClick={() => handleCrossClick(index, formik)}
                                                                                        />
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    }
                                                </div>

                                            </div>}
                                        <div className="py-2.5 flex justify-end mt-1.5">
                                            <Button
                                                type="button"
                                                isRounded={false}
                                                title="Cancel"
                                                handleClick={() => closePopup("noRefresh")}
                                                classes="text-[11px] md:text-xs bg-white	inline-flex justify-center items-center rounded-md text-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-white/25 hover:ring-slate-900/15 shadow-lg"
                                            ></Button>
                                            <Button
                                                type="submit"
                                                isRounded={false}
                                                title="Save"
                                                classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                                            ></Button>
                                        </div>
                                    </Form>
                                )}
                            </Formik>
                        </div>
                    </div>
                </Modal>
            )}
        </>
    );
};

export default TransactionCodesFormPopup;


