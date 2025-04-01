import React, { Component } from 'react'
import Modal from "components/common/popup/PopUp";
import { Form, Formik } from 'formik';
import { emailQueueValidationSchema } from 'utils/gridFormatHelpers';
import { useEmailQueueContext } from '../EmailQueueContext';
import { IEditEmailQueueItem } from 'interfaces/email-queue.interface';
import { convertAndFormatDate } from 'utils/helper';
import FormikControl from 'components/formik/FormikControl';
import { PaymentMethodOption, StateCode, TaskStatusList } from 'utils/constants';
import dollarImage from "assets/images/dollar-sign.svg";
import Button from 'components/common/button/Button';

type EmailQueueEditModalProps = {
    showPopup: boolean;
    selectedData : IEditEmailQueueItem | null;
    handleClose: () => void;
    handleSubmit: (formValues: IEditEmailQueueItem) => void;
};

const EmailQueueEditModal = (props: EmailQueueEditModalProps) => {

    const {
        allCounties,
        showSpinner
    } = useEmailQueueContext();

    const validationSchema = emailQueueValidationSchema(allCounties);

    const initialValues: IEditEmailQueueItem = {
          id: props.selectedData?.id ?? "",
          caseNo: props.selectedData?.caseNo ?? "",
          taskId: props.selectedData?.taskId ?? "",
          caseType: props.selectedData?.caseType ?? "",
          processServerEmail: props.selectedData?.processServerEmail ?? "",
          description: props.selectedData?.description ?? "",
          document: props.selectedData?.description ?? "",
          expedited: props.selectedData?.expedited ?? "",
          county: props.selectedData?.county ?? "",
          taskStatus: props.selectedData?.taskStatus ?? "",
          evictionTransactionAmt: props.selectedData?.evictionTransactionAmt ?? "",
          //tenantOne: props.selectedData?.tenantOne ?? "",
          tenantZip: props.selectedData?.tenantZip ?? "",
          propertyName: props.selectedData?.propertyName ?? "",
          referenceId: props.selectedData?.referenceId ?? "",
          stateCourt: props.selectedData?.stateCourt ?? "",
          tenant1FirstName: props.selectedData?.tenant1FirstName ?? "",
          tenant1LastName: props.selectedData?.tenant1LastName ?? "",
          tenant1MiddleName: props.selectedData?.tenant1MiddleName ?? "",
          caseCreatedDate: props.selectedData
             ? new Date(convertAndFormatDate(props.selectedData.caseCreatedDate)).toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
             })
             : "",
          // caseCreatedDate: props.selectedData ? formattedDate(props.selectedData.caseCreatedDate as string) : "",
          tenantAddress: props.selectedData?.tenantAddress ?? "",
          tenantUnit: props.selectedData?.tenantUnit ?? "",
          eFileFeeClient: props.selectedData?.eFileFeeClient ?? "",
          evictionCourtFee: props.selectedData?.evictionCourtFee ?? "",
          evictionEnvelopeID: props.selectedData?.evictionEnvelopeID ?? "",
          evictionDateFiled: props.selectedData?.evictionDateFiled
             ? new Date(convertAndFormatDate(props.selectedData.evictionDateFiled)).toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
             })
             : "",
          // evictionDateFiled: props.selectedData ? formattedDate(props.selectedData.evictionDateFiled as string) : "",
          evictionPaymentMethod: props.selectedData?.evictionPaymentMethod ?? "",
          attorneyName: props.selectedData?.attorneyName ?? "",
          attorneyBarNo: props.selectedData?.attorneyBarNo ?? "",
          evictionReason: props.selectedData?.evictionReason ?? "",
          filerEmail: props.selectedData?.filerEmail ?? "",
          tenantCity: props.selectedData?.tenantCity ?? "",
          tenantState: props.selectedData?.tenantState ?? "",
          eFileMethod: props.selectedData?.eFileMethod ?? "",
          paymentAccount: props.selectedData?.paymentAccount ?? "",
       };

    return (
        <>
            <Modal showModal={props.showPopup} onClose={() => props.handleClose()} width="max-w-4xl">
                <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
                    <div className="sm:flex sm:items-start">
                        <div className="text-center sm:text-left">
                            <h3
                                className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5"
                                id="modal-title"
                            >
                                Update
                            </h3>
                        </div>
                    </div>
                    <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={props.handleSubmit}
                    >
                        {({ values, setFieldValue }) => (
                            <Form className="pt-1">
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5 mb-2.5">
                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"Tenant1FirstName"}
                                            name={"tenant1FirstName"}
                                            placeholder={"Enter Tenant1FirstName"}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"Tenant1MiddleName"}
                                            name={"tenant1MiddleName"}
                                            placeholder={"Enter Tenant1MiddleName"}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"Tenant1LastName"}
                                            name={"tenant1LastName"}
                                            placeholder={"Enter Tenant1LastName"}
                                        />
                                    </div>

                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"Case Number"}
                                            name={"caseNo"}
                                            placeholder={"Enter Case Number"}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"Process Server Email"}
                                            name={"processServerEmail"}
                                            placeholder={"Enter Process Server Email"}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FormikControl
                                            control="date"
                                            type="date"
                                            label={"CaseCreatedDate"}
                                            name={"caseCreatedDate"}
                                            placeholder={"Enter CaseCreatedDate"}
                                            minDate={null}
                                            // dateFormat="MM/dd/yyyy"
                                            disabled={true}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FormikControl
                                            control="select"
                                            type="select"
                                            label="Task Status"
                                            name="taskStatus"
                                            options={TaskStatusList}
                                            defaultOption="Please select"
                                            placeholder="taskStatus"
                                            // Find the matching id based on the taskStatus value in initialValues
                                            value={
                                                TaskStatusList.find(option => option.value === values.taskStatus)?.id
                                            }
                                            onChange={(e: { target: { value: any; }; }) => {
                                                const selectedValue = e.target.value;
                                                setFieldValue("taskStatus", selectedValue); // Set the selected ID as taskStatus
                                            }}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"Description"}
                                            name={"description"}
                                            placeholder={"Enter Description"}
                                        />
                                    </div>

                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"Expedited"}
                                            name={"expedited"}
                                            placeholder={"Enter Expedited"}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"County"}
                                            name={"county"}
                                            placeholder={"Enter County"}
                                        />
                                    </div>

                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"EFileMethod"}
                                            name={"eFileMethod"}
                                            placeholder={"Enter eFileMethod"}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"EvictionPaymentMethod"}
                                            name={"evictionPaymentMethod"}
                                            placeholder={"Enter EvictionPaymentMethod"}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FormikControl
                                            control="select"
                                            type="select"
                                            label={"PaymentAccount"}
                                            name={"paymentAccount"}
                                            defaultOption={"Please select"}
                                            placeholder={"paymentAccount"}
                                            options={PaymentMethodOption}
                                            selected={initialValues.paymentAccount}
                                        />
                                    </div>
                                    <div className="relative">
                                        {/* <FormikControl
                     control="input"
                     type="text"
                     label={"EvictionCourtTransAmt"}
                     name={"evictionTransactionAmt"}
                     placeholder={"Enter EvictionCourtTransAmt"}
                  /> */}
                                        <FormikControl
                                            control="input"
                                            type="number"
                                            label={"CourtTransAmt"}
                                            name={"evictionTransactionAmt"}
                                            placeholder={"Enter EvictionCourtTransAmt"}
                                            style={{
                                                backgroundImage: `url(${dollarImage})`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: '10px center', // Adjust the position as needed
                                                backgroundSize: '9px', // Adjust size to fit the image nicely
                                                paddingLeft: '28px', // Increase padding to ensure space between the text and image
                                            }}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"TenantZip"}
                                            name={"tenantZip"}
                                            // maxLength={5}
                                            placeholder={"Enter TenantZip"}
                                        />
                                    </div>

                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"TenantAddress"}
                                            name={"tenantAddress"}
                                            placeholder={"Enter TenantAddress"}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"TenantCity"}
                                            name={"tenantCity"}
                                            placeholder={"Enter TenantCity"}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"TenantUnit"}
                                            name={"tenantUnit"}
                                            placeholder={"Enter TenantUnit"}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FormikControl
                                            control="select"
                                            type="select"
                                            label={"Tenant State"}
                                            name={"tenantState"}
                                            defaultOption={"Please select"}
                                            placeholder={"State"}
                                            options={StateCode}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"PropertyName"}
                                            name={"propertyName"}
                                            placeholder={"Enter PropertyName"}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"CaseReferenceID"}
                                            name={"referenceId"}
                                            placeholder={"Enter Case Reference ID"}
                                            disabled={true}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="number"
                                            label={"EfileFee"}
                                            name={"eFileFeeClient"}
                                            placeholder={"Enter EvictionEfileFee"}
                                            style={{
                                                backgroundImage: `url(${dollarImage})`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: '10px center',
                                                backgroundSize: '9px',
                                                paddingLeft: '28px',
                                            }}
                                        />
                                    </div>
                                    <div className="relative">
                                        {/* <FormikControl
                     control="input"
                     type="text"
                     label={"EvictionCourtFee"}
                     name={"evictionCourtFee"}
                     placeholder={"Enter EvictionCourtFee"}
                  /> */}
                                        <FormikControl
                                            control="input"
                                            type="number"
                                            label={"CourtFee"}
                                            name={"evictionCourtFee"}
                                            placeholder={"Enter EvictionCourtFee"}
                                            style={{
                                                backgroundImage: `url(${dollarImage})`,
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: '10px center',
                                                backgroundSize: '9px',
                                                paddingLeft: '28px',
                                            }}
                                        />
                                    </div>
                                    {/* <div className="relative">
                  <FormikControl
                     control="input"
                     type="number"
                     label={"EvictionEnvelopeID"}
                     name={"evictionEnvelopeID"}
                     placeholder={"Enter EvictionEnvelopeID"}
                  />
               </div> */}
                                    <div className="relative">
                                        <FormikControl
                                            control="date"
                                            type="date"
                                            label={"DateFiled"}
                                            name={"evictionDateFiled"}
                                            placeholder={"Enter EvictionDateFiled"}
                                            minDate={null}
                                        />
                                    </div>
                                    {/* <div className="relative">
                  <FormikControl
                     control="input"
                     type="text"
                     label={"EvictionPaymentMethod"}
                     name={"evictionPaymentMethod"}
                     placeholder={"Enter EvictionPaymentMethod"}
                  />
               </div> */}
                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"AttorneyName"}
                                            name={"attorneyName"}
                                            placeholder={"Enter AttorneyName"}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="number"
                                            label={"AttorneyBarNo"}
                                            name={"attorneyBarNo"}
                                            placeholder={"Enter AttorneyBarNo"}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"EvictionReason"}
                                            name={"evictionReason"}
                                            placeholder={"Enter EvictionReason"}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"EvictionFilerEmail"}
                                            name={"filerEmail"}
                                            placeholder={"Enter EvictionFilerEmail"}
                                        />
                                    </div>
                                    <div className="relative">
                                        <FormikControl
                                            control="input"
                                            type="text"
                                            label={"StateCourt"}
                                            name={"stateCourt"}
                                            placeholder={"Enter StateCourt"}
                                        />
                                    </div>
                                    {/* <div className="relative">
                  <FormikControl
                     control="select"
                     type="select"
                     label={"Attachment Type"}
                     name={"attachmentType"}
                     defaultOption={"Please select"}
                     placeholder={"Type"}
                     options={AttachmentType}
                  />
               </div> */}
                                    <div className="relative">
                                        <div>
                                            <label htmlFor="fileUpload" className="text-gray-600 text-[11px] md:text-xs font-medium">
                                                Upload PDF Document
                                            </label>
                                            {/* <span className="ml-1">
                     <Tooltip
                        id={"document_info"}
                        content={"Please select an attachment type first to upload PDF."}
                        children={<FaInfoCircle className="text-blue-600" />}
                     />
                  </span> */}
                                        </div>
                                        <input
                                            id="fileUpload"
                                            name="file"
                                            type="file"
                                            accept=".pdf"
                                            className="focus:ring-blue-500 focus:border-blue-500 block w-full border w-full border-gray-200 rounded-md text-xs px-[6px] py-[5px] md:px-[8px] md:py-[7px]"
                                            onChange={(event) => {
                                                const file = event.currentTarget.files ? event.currentTarget.files[0] : null;
                                                setFieldValue("document", file);
                                            }}
                                        />
                                        {/* <label className="flex">{values.attachmentType === '' ? <span className="text-[#eb5757] text-[11.5px]">Please select an Attachment Type first.</span> : ''}</label> */}
                                    </div>
                                </div>
                                <div className="mt-2 md:mt-0 py-3 pb-1 md:pb-2 flex justify-end items-center">
                                    <Button
                                        type="button"
                                        isRounded={false}
                                        title="Cancel"
                                        handleClick={() => props.handleClose()}
                                        classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                                    ></Button>
                                    <Button
                                        title={"Update"}
                                        type={"submit"}
                                        isRounded={false}
                                        disabled={showSpinner}
                                        classes="py-2 md:py-2.5 px-4 inline-flex justify-center items-center gap-x-1.5 text-xs font-semibold rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none   "
                                    ></Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </Modal>
        </>
    )
};

export default EmailQueueEditModal;