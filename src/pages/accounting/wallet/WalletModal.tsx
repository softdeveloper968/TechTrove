import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { Form, Formik } from "formik";
import FormikControl from "components/formik/FormikControl";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import DropdownPresentation from "components/common/dropdown/DropDown";
import vm from "utils/validationMessages";
import { IWalletItems } from "interfaces/wallet.interface";
import { ISelectOptions } from "interfaces/late-notices.interface";
import { useAccountingContext } from "../AccountingContext";
import dollarImage from "assets/images/dollar-sign.svg";

// Validation schema for the county model
const validationSchema = yup.object().shape({
    clientId: yup
    .string()
    .required(vm.company.required),
});

type WalletPopupProps = {
    showPopup: Boolean;
    closePopup: (shouldRefresh: string) => void;
    // //   isEditMode: boolean;
    //   initialValues: IWalletItems;
    onSubmit: (formValues: IWalletItems) => void;
    showSpinner: boolean;
};
const initialSelectOption: ISelectOptions = { id: '', value: '' };
const WalletPopup: React.FC<WalletPopupProps> = ({
    showPopup,
    closePopup,
    onSubmit,
    showSpinner
}) => {
    const [selectedWallet, setSelectedWallet] = useState<IWalletItems>({
        id: "",
        balance: 0,
        limit: 0,
        isNoLimit: false,
        companyName: "",
        clientId: "",
        description: "",
        checkNumber: "",
    });
    const [companyList, setCompanyList] = useState<ISelectOptions[]>([]);
    const [isEditField, setIsEditField] = useState<boolean>(true);
    const [selectedCompany, setSelectedCompany] = useState<ISelectOptions>(initialSelectOption);
    //   const [counties, setCounties] = useState<ICounty[]>([]);
    //   const [courts, setCourts] = useState<ICourt[]>([]);
    const {
        allCompanies,
        wallet
    } = useAccountingContext();
    useEffect(() => {
        ;
        // getAllCounties();
        // if (initialValues.court.countyId !== 0) {
        //   getAllCourtsBasedOnCounties(initialValues.court.countyId);
        // }
        var list = allCompanies.map((item) => ({
            id: item.id,
            value: item.companyName
        }));
        setCompanyList(list);
    }, []);
    const initialValues: IWalletItems = {
        id: selectedWallet.id,
        balance: selectedWallet.balance,
        limit: selectedWallet.limit,
        isNoLimit: selectedWallet.isNoLimit,
        companyName: selectedWallet.companyName,
        clientId: selectedWallet.clientId,
        description: selectedWallet.description,
        checkNumber: selectedWallet.checkNumber,
    }

    //   const getAllCounties = async () => {
    //     try {
    //       let response = await CountyService.getAllCounty();
    //       if (response.status === HttpStatusCode.Ok) {
    //         let api = response.data.items.map((item: any) => {
    //           return {
    //             id: item.countyId,
    //             value: item.countyName,
    //           };
    //         });
    //         setCounties(api);
    //       }
    //     } finally {
    //     }
    //   };
    const getAllCourtsBasedOnCounties = async (countyId: number) => {

        // try {
        //   let response = await CourtService.getCourtsByCountyId(countyId);
        //   if (response.status === HttpStatusCode.Ok) {
        //     let api = response.data.map((item: any) => {
        //       return {
        //         id: parseInt(item.id),
        //         value: item.courtName,
        //       };
        //     });
        //     setCourts(api);
        //   }
        // } finally {
        // }
    };
    return (
        <>
            {showPopup && (
                <Modal
                    showModal={showPopup}
                    onClose={() => closePopup("noRefresh")}
                    width="max-w-[45rem]"
                >
                    <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
                        <div className="sm:flex sm:items-start">
                            <div className="text-center sm:text-left">
                                <h3
                                    className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                                    id="modal-title"
                                >
                                    Add Amount
                                </h3>
                            </div>
                        </div>
                        <div className="relative pt-1 md:pt-1.5 flex-auto">
                            <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={onSubmit}
                            >
                                {(formik) => (
                                    <Form className="flex flex-col">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            <div className="relative ">
                                                <label
                                                    htmlFor={"company"}
                                                    className="text-gray-600 text-[11px] md:text-xs font-medium"
                                                >
                                                    Company
                                                </label>
                                                <DropdownPresentation
                                                    heading={""}
                                                    selectedOption={selectedCompany}
                                                    handleSelect={(event) => {
                                                        setSelectedCompany({id:event.target.value,value:event.target.value});
                                                        const walletItem = wallet.items.find(x => x.clientId === event.target.value);
                                                        if (walletItem) {
                                                            
                                                            setIsEditField(false);
                                                            formik.setFieldValue("id",walletItem.id);
                                                            formik.setFieldValue("clientId",event.target.value);
                                                            setSelectedWallet(walletItem);                                                                                                                        
                                                        }
                                                        else{
                                                            setIsEditField(true);
                                                            setSelectedWallet({
                                                                id: "",
                                                                balance: 0,
                                                                limit: 0,
                                                                isNoLimit: false,
                                                                companyName: "",
                                                                clientId: "",
                                                                description: "",
                                                                checkNumber: "",
                                                            });
                                                        }
                                                    }}
                                                    options={companyList}
                                                    placeholder="Select Company"
                                                />
                                                {formik.errors.clientId && (
                                    <p className="text-red-500 text-xs mt-1.5" style={{ marginLeft: "14px" }}>{formik.errors.clientId}</p>
                                 )}

                                            </div>
                                            <div className="relative text-left">
                                            <label className="text-gray-600 text-[11px] md:text-xs font-medium hidden sm:inline-block">&nbsp;</label>
                                               <div className="flex sm:h-[36px] md:h-[40px] items-center">
                                               <span>Available Amount: ${initialValues.balance}</span>
                                               </div>
                                            </div>
                                            <div className="relative text-left">
                                                <FormikControl
                                                    control="input"
                                                    type="number"
                                                    label={"Amount"}
                                                    name={"balance"}
                                                    placeholder={"Enter Amount"}
                                                    disabled={isEditField}
                                                    value=""
                                                    style={{
                                                        backgroundImage: `url(${dollarImage})`,
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundPosition: '10px center',
                                                        backgroundSize: '9px',
                                                        paddingLeft: '28px',
                                                     }}
                                                />
                                            </div>
                                            <div className="relative text-left">
                                                <FormikControl
                                                    control="input"
                                                    type="text"
                                                    label={"Check Number"}
                                                    name={"checkNumber"}
                                                    placeholder={"Enter Check Number"}
                                                    autoFocus={true}
                                                    disabled={isEditField}
                                                />
                                            </div>

                                        </div>
                                        <div className="relative text-left mt-3 sm:mb-2">
                                                <FormikControl
                                                    control="textarea"
                                                    type="text"
                                                    label={"Note"}
                                                    name={"description"}
                                                    placeholder={"Enter Note"}
                                                    autoFocus={true}
                                                    disabled={isEditField}
                                                />
                                            </div>
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
                                                disabled={showSpinner}
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
export default WalletPopup;
