import React, { useState, useEffect } from "react";
import * as yup from "yup";
import { Form, Formik, FormikProps } from "formik";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import FormikControl from "components/formik/FormikControl";
import CustomerService from "services/customer.service";
import { ISelectOptions, ProcessServerFormMode } from "interfaces/process-server.interface";
import { ICustomerFormItems, ICustomerFormValues, ICustomerItems } from "interfaces/customer.interface";
import { useAccountingContext } from "../AccountingContext";

type ProcessServerModalProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    mode: ProcessServerFormMode;
    selectedUser: ICustomerItems | null;
    setSelectedUser: (user: ICustomerItems | null) => void;
};

const validationSchema = yup.object({
    
});

const initialSelectOption: ISelectOptions = { id: '', value: '' };

const CustomerModal = (props: ProcessServerModalProps) => {
    const { open, setOpen, mode, selectedUser, setSelectedUser } = props;
    const { customerDetails,getCustomerDetails,allCompanies } = useAccountingContext();
    const [selectedCompany, setSelectedCompany] = useState<ISelectOptions>(initialSelectOption);
    const [companyList, setCompanyList] = useState<ISelectOptions[]>([]);
    const initialValues: ICustomerFormItems = {
        id:"",
    };
    const mapFormValuesToLoginRequest = (formValues: ICustomerFormValues) => {
        return {
            id : formValues.id,
        };
    };
    const handleAssignProcessServer = async (formValues: ICustomerFormValues) => {
        
        const createRequest = mapFormValuesToLoginRequest(formValues);
        
        const response = mode === "create"
            ? await CustomerService.createCustomer(createRequest) : await CustomerService.createCustomer(createRequest)

        if (response.status === HttpStatusCode.Ok) {
            setOpen(false); // close the modal pop-up
            getCustomerDetails(1, 100, "");
            setSelectedUser(null);
            toast.success(response.data.message);
        } else {
            if (response && response.data && response.data.message)
                toast.error(response.data.message);
        }
    };

    const handleSelectInputChange = (event: React.ChangeEvent<HTMLInputElement>, formik: FormikProps<ICustomerFormValues>) => {
        const company = allCompanies.find((item) => item.id === event.target.value as string);

        if (company && company.id) {
            formik.setFieldValue("id", company.id);
            formik.setFieldValue("companyname", company.companyName);
            setSelectedCompany({ id: event.target.value, value: companyList.find(x => x.id === event.target.value)?.value || '' });
        } else {
            formik.setFieldValue("id", "");
            formik.setFieldValue("email", event.target.value as string);
        }
    };

    useEffect(() => {

        var list = allCompanies.map((item) => ({
            id: item.id,
            value: item.companyName
        }));
        setCompanyList(list);
    }, [allCompanies]);

    return (
        <>
            <Modal showModal={open} onClose={() => setOpen(false)} width="max-w-3xl">
                <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                    <div className="sm:flex sm:items-start">
                        <div className="text-center sm:text-left">
                            <h3
                                className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                                id="modal-title"
                            >
                                Create Customer
                            </h3>
                        </div>
                    </div>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleAssignProcessServer}
                    >
                        {(formik) => (
                            <Form className="flex flex-col pt-1.5">
                                <div className="grid sm:grid-cols-2 gap-2.5 md:gap-3.5">
                                    <div className="relative text-left">
                                        <FormikControl
                                            control="select"
                                            type="select"
                                            label={"Company Name"}
                                            name={"company"}
                                            defaultOption={"Select"}
                                            placeholder={"Company Name"}
                                            options={companyList}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSelectInputChange(e, formik)}
                                        />
                                    </div>
                                </div>

                                <div className="text-right pt-2.5">                                 
                                    <Button
                                        type="button"
                                        isRounded={false}
                                        title="Cancel"
                                        handleClick={() => setOpen(false)}
                                        classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                                    ></Button>
                                    <Button
                                        title={mode === 'create' ? "Assign" : "Update"}
                                        type={"submit"}
                                        isRounded={false}
                                        classes="mt-2.5 py-2 md:py-2.5 px-4 inline-flex justify-center items-center gap-x-1.5 text-xs font-semibold rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none   "
                                    ></Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                    </div>
            </Modal>
        </>
    );
};

export default CustomerModal;