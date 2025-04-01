import React, { useEffect, useRef, useState } from "react";
import * as yup from "yup";
import { Form, Formik, FormikProps } from "formik";
import { toast } from "react-toastify";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import FormikControl from "components/formik/FormikControl";
import Spinner from "components/common/spinner/Spinner";
import { HttpStatusCode } from "utils/enum";
import vm from "utils/validationMessages";
import InvoicesService from "services/invoices.service";
import { ICreateInvoiceFormValues } from "interfaces/invoices.interface";
import { ICommonSelectOptions } from "interfaces/common.interface";
import { useAccountingContext } from "../AccountingContext";


type GenerateInvoiceProps = {
   openModal: boolean;
   setOpenModal: (open: boolean) => void;
};

const validationSchema = yup.object({
   clientId: yup.string().required(vm.company.company),
   invoiceMonthYear: yup.date().required(vm.invoiceMonthYear.invoiceMonthYear)
});

const GenerateInvoiceModal: React.FC<GenerateInvoiceProps> = ({ openModal, setOpenModal }) => {
   const { getInvoices } = useAccountingContext();
   const isMounted = useRef(true);
   const { allCompanies, getAllCompanies } = useAccountingContext();
   const [showSpinner, setShowSpinner] = useState<boolean>(false);
   const [companyOptions, setCompanyOptions] = useState<ICommonSelectOptions[]>([]);

   const calculateFifteenthDateOfLastMonth = () => {
      const currentDate = new Date();
      const estOptions = { timeZone: 'America/New_York' };
      const currentEstDate = new Date(currentDate.toLocaleString('en-US', estOptions));
      const firstDayOfCurrentMonth = new Date(currentEstDate.getFullYear(), currentEstDate.getMonth(), 1);
      const lastDateOfLastMonth = new Date(firstDayOfCurrentMonth);
      lastDateOfLastMonth.setDate(0);
      const fifteenthDateOfLastMonth = new Date(lastDateOfLastMonth.getFullYear(), lastDateOfLastMonth.getMonth(), 15);
      return fifteenthDateOfLastMonth;
   };

   const fifteenthDateOfLastMonth = calculateFifteenthDateOfLastMonth();

   const initialValues: ICreateInvoiceFormValues = {
      clientId: "",
      invoiceMonthYear: fifteenthDateOfLastMonth
   };

   useEffect(() => {
      // if (isMounted.current) {
      //    getAllCompanies();
      //    isMounted.current = false;
      // }
      const options: ICommonSelectOptions[] = allCompanies.map(item => ({
         id: item.id,
         value: item.companyName
      }));
      setCompanyOptions(options);
   }, [allCompanies, getAllCompanies]);

   const handleDateChange = (formik:FormikProps<ICreateInvoiceFormValues>, date: Date | null) => {
      if (!date) return null;
      // calculate the 15th date of the previous month
      const selectedMonth = new Date(date.getFullYear(), date.getMonth(), 15);
      formik.setFieldValue('invoiceMonthYear', selectedMonth);
   };

   const handleCreateInvoice = async (formValues: ICreateInvoiceFormValues) => {
      try {
         setShowSpinner(true);
         // const response = await InvoicesService.createInvoices(formValues);
         const response = await InvoicesService.createBillingInvoices(formValues);

         if (response.status === HttpStatusCode.OK) {
            setOpenModal(false);
            getInvoices(1, 100);
            toast.success("Invoice generated successfully");
         }
      } catch (error) {
         toast.error("Failed to generate invoice");
      } finally {
         setShowSpinner(false);
      }
   };

   return (
      <>
         {showSpinner && <Spinner />}
         {openModal && (
            <Modal
               showModal={openModal}
               onClose={() => setOpenModal(false)}
               width="max-w-[35rem]"
            >
               <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
                  <div className="sm:flex sm:items-start">
                     <div className="text-center sm:text-left">
                        <h3
                           className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                           id="modal-title"
                        >
                           Create Invoices
                        </h3>
                     </div>
                  </div>
                  <Formik
                     initialValues={initialValues}
                     validationSchema={validationSchema}
                     onSubmit={handleCreateInvoice}
                  >
                     {(formik) => (
                        <Form className="flex flex-col pt-1.5">
                           <div className="grid sm:grid-cols-1 gap-2.5 md:gap-3.5">
                              <div className="relative">
                                 <FormikControl
                                    control="select"
                                    type="select"
                                    label={"Select a company"}
                                    name={"clientId"}
                                    defaultOption={"Select"}
                                    options={companyOptions}
                                 />
                              </div>
                              <div className="relative">
                                 <span className="text-gray-600 text-[11px] md:text-xs font-medium">
                                    Select a month for invoice
                                 </span>
                                 <DatePicker
                                    name={"invoiceMonthYear"}
                                    selected={
                                       formik.values.invoiceMonthYear
                                          ? new Date(formik.values.invoiceMonthYear)
                                          : fifteenthDateOfLastMonth
                                    }
                                    onChange={(date) => handleDateChange(formik, date)}
                                    dateFormat="MMM, yyyy"
                                    showMonthYearPicker
                                    maxDate={calculateFifteenthDateOfLastMonth()}
                                    className="bg-calendar peer !placeholder-gray-500 outline-none p-2.5 !pr-7 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_right_10px]"
                                 />
                                 {formik.touched.invoiceMonthYear && formik.errors.invoiceMonthYear && (
                                    <div className="text-[13px] text-red-500">
                                       {formik.errors.invoiceMonthYear}
                                    </div>
                                 )}
                              </div>
                           </div>
                           <div className="text-right pt-2.5">
                              <Button
                                 type="button"
                                 isRounded={false}
                                 title="Cancel"
                                 handleClick={() => setOpenModal(false)}
                                 classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                              />
                              <Button
                                 title={"Create"}
                                 type={"submit"}
                                 isRounded={false}
                                 disabled={showSpinner}
                                 classes="mt-3 py-2 md:py-2.5 px-4 inline-flex justify-center items-center gap-x-1.5 text-xs font-semibold rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                              />
                           </div>
                        </Form>
                     )}
                  </Formik>
               </div>
            </Modal>
         )}
      </>
   );
};

export default GenerateInvoiceModal;
