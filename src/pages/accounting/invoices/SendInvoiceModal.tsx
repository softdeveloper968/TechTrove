import React, { useState } from "react";
import * as yup from "yup";
import { Form, Formik } from "formik";
import { toast } from "react-toastify";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import FormikControl from "components/formik/FormikControl";
import Spinner from "components/common/spinner/Spinner";
import { HttpStatusCode } from "utils/enum";
import vm from "utils/validationMessages";
import InvoicesService from "services/invoices.service";
import { IInvoiceItem, ISendInvoiceEmail } from "interfaces/invoices.interface";
import { useAccountingContext } from "../AccountingContext";
import 'react-datepicker/dist/react-datepicker.css';

type SendInvoiceProps = {
   openModal: boolean;
   setOpenModal: (open: boolean) => void;
   invoice: IInvoiceItem | null;
};

const validationSchema = yup.object({
   email: yup.string()
      .email(vm.email.email)
      .required(vm.email.email),
});

const SendInvoiceModal: React.FC<SendInvoiceProps> = ({ openModal, setOpenModal, invoice }) => {
   const { getInvoices } = useAccountingContext();
   const [showSpinner, setShowSpinner] = useState<boolean>(false);

   const initialValues: ISendInvoiceEmail = {
      invoiceId: invoice?.id ?? "",
      email: ""
   };

   const handleSendEmail = async (formValues: ISendInvoiceEmail) => {
      try {
         // setShowSpinner(true);
         
         // Define payload for sending invoice email
         const payload: ISendInvoiceEmail = {
            invoiceId: formValues.invoiceId,
            email: formValues.email // If not provided, the invoice will be sent to the billing email address
         };

         const response = await InvoicesService.sendInvoiceEmail(payload);
         if (response.status === HttpStatusCode.OK) {
            setOpenModal(false);
            getInvoices(1, 100);
            toast.success("Email sent successfully");
         }
      } catch (error) {
         console.log("handleSendEmail", error);
      } finally {
         // setShowSpinner(false);
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
                           Send Invoice
                        </h3>
                     </div>
                  </div>
                  <Formik
                     initialValues={initialValues}
                     validationSchema={validationSchema}
                     onSubmit={handleSendEmail}
                  >
                     {(formik) => (
                        <Form className="flex flex-col pt-1.5">
                           <div className="grid sm:grid-cols-1 gap-2.5 md:gap-3.5">
                              <div className="relative">
                              <FormikControl
                                 control="input"
                                 type="text"
                                 label={"Email Address"}
                                 name={"email"}
                                 placeholder={"Enter email address"}
                              />
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
                                 title={"Send"}
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

export default SendInvoiceModal;
