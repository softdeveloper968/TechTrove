import React from "react";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { Form, Formik } from "formik";

import { useLateNoticesContext } from "../../LateNoticesContext";
import {
  ILateNoticesItems
} from "interfaces/late-notices.interface";
import { IGridHeader } from "interfaces/grid-interface";

import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import FormikControl from "components/formik/FormikControl";
import Spinner from "components/common/spinner/Spinner";
import Grid from "components/common/grid/GridWithToolTip";
import HelperViewPdfService from "services/helperViewPdfService";
import { MethodOfDeliveryOptions } from "utils/constants";
import { convertToPrice, formattedDate, toCssClassName } from "utils/helper";

type SignProofProps = {
  showSignProofPopup: boolean;
  handleClose: () => void;
  handleSignProof:()=>void;
};
// Validation schema for manual create notice
const validationSchema: yup.ObjectSchema<any> = yup.object({
  methodOfDeliveryOptions: yup
    .string()
    .required("Method of delivery is required."),
  deliveredTo: yup.string().when(["methodOfDeliveryOptions"], {
    is: 2,
    then: (schema) => schema.required("Delivered to is required."),
  }),
  deliveryDate:yup
  .string()
  .required("Delivery Date is required."),

  // signature: yup.string().required("Signature is required."),
  // signatureDate: yup.date().required("Signature date is required."),
});
const initialColumnMapping: IGridHeader[] = [
  // { columnName: "fullName", label: "TenantOne" },
  // { columnName: "address", label: "TenantAddressCombined" },
  // { columnName: "noticePDFs", label: "Documents" },
  // { columnName: "rentDue", label: "TotalRent" },
  // { columnName: "property", label: "PropertyName" },
  // { columnName: "noticePeriod", label: "NoticePeriod" },
  // { columnName: "otherFees", label: "OtherFees" },
  // { columnName: "lateFees", label: "LateFees" },
  // { columnName: "noticeAffiant", label: "NoticeAffiantSignature" },
  // { columnName: "noticeDate", label: "NoticeDate" },
  // { columnName: "lateFeesDate", label: "LateFeesDate" },

  // {columnName:"isChecked",label:"isChecked",controlType:"checkbox"},
  {columnName:"fullName",label:"TenantOne"},
  {columnName:"address",label:"TenantAddressCombined",isSort:true},
  // {columnName:"noticePDFs",label:"Documents"},
 // {columnName:"rentDue",label:"TotalRent"},
  {columnName:"property",label:"PropertyName",isSort:true},
  {columnName:"noticeTotalDue",label:"NoticeTotalDue"},
  {columnName:"noticeDefaultStartDate",label:"NoticeDefaultStartDate"},
  {columnName:"noticeDefaultEndDate",label:"NoticeDefaultEndDate"},
  {columnName:"noticeLastPaidDate",label:"NoticeLastPaidDate"},
  {columnName:"noticeLastPaidAmount",label:"NoticeLastPaidAmount"},
  {columnName:"noticeCurrentRentDue",label:"NoticeCurrentRentDue"},
  {columnName:"noticePastRentDue",label:"NoticePastRentDue"},
  {columnName:"noticeLateFees",label:"NoticeLateFees"},
  {columnName:"noticeDeliveryDate",label:"NoticeDeliveryDate"},
];

const LateNotices_SignProofs = (props: SignProofProps) => {
  const [filteredRecords, setFilteredRecords] = useState<ILateNoticesItems[]>();
  // get selected notices from context
  const {
    lateNotices,
    setLateNotices,
    getLateNotices,
    selectedLateNoticeId,
    setSelectedLateNoticeId,
    setSignProofInfo,
  } = useLateNoticesContext();
  const [tenantName, setTenantName] = useState<any[]>([]);
  const [spinner, setSpinner] = useState<Boolean>(false);
  // Effect to filter and add new columns to records when lateNotices.items or selectedLateNoticeId changes
  const [visibleColumns, setVisibleColumns] = useState<IGridHeader[]>(
    initialColumnMapping
  );

  // State to store the filtered records with new columns.
  useEffect(() => {
    // Filter records based on selectedLateNoticeId
    let records = lateNotices.items.filter((item) =>
      selectedLateNoticeId.includes(item.id || "")
    );
    const allTenantNames = records.flatMap((obj) => obj.tenantNames || []);

    // Use Set to get unique names
    const uniqueTenantNames = [
      ...new Set(
        allTenantNames.map((tenant) => {
          return {
            value:
              tenant.middleName !== undefined
                ? `${tenant.firstName} ${tenant.middleName} ${tenant.lastName}`
                : `${tenant.firstName} ${tenant.lastName}`,
            id:
              tenant.middleName !== undefined
                ? `${tenant.firstName} ${tenant.middleName} ${tenant.lastName}`
                : `${tenant.firstName} ${tenant.lastName}`,
          };
        })
      ),
    ];

    setTenantName(uniqueTenantNames);
    setFilteredRecords(records);
  }, [lateNotices.items, selectedLateNoticeId]);

  const openPdf = async (url: string) => {
    HelperViewPdfService.GetPdfView(url);
  }

  const getSignProofDocument=async(formik:any)=>{
    setSignProofInfo({     
      methodId: parseInt(formik.methodOfDeliveryOptions),
      deliveredTo: formik.deliveredTo,
      dispoIds: selectedLateNoticeId,
      deliveryDate:formik.deliveryDate,
      signature:"",
    });    
    props.handleSignProof();
  }

  // const handleSignIn = async (formik: any) => {
  //   try {
      
  //     setSpinner(true);
  //     const records: ILateNotice_SignProof = {
  //       signature: formik.signature,
  //       signatureDate: new Date(),
  //       methodId: parseInt(formik.methodOfDeliveryOptions),
  //       deliveredTo: formik.deliveredTo,
  //       dispoIds: selectedLateNoticeId,
  //     };
  //     const response = await LateNoticesService.signInProofEmail(records);
  //     if (response.status === HttpStatusCode.Ok) {
  //       lateNotices.items = lateNotices.items.filter((item) =>
  //         !selectedLateNoticeId.includes(item.id ?? "")
  //       );
  //       setLateNotices((prev) => ({
  //         ...prev,
  //         items: lateNotices.items
  //       }));
  //       toast.success("Sign added successfully");
  //       props.handleClose();
  //       setSelectedLateNoticeId([]);
  //     }
  //   } finally {
  //     setSpinner(false);
  //   }
  // };

  const handleCellRendered = (
    cellIndex: number,
    data: ILateNoticesItems,
    rowIndex: number
  ) => {
    const columnName = visibleColumns[cellIndex]?.label;
    // const propertyName = (initialColumnMapping as any)[columnName];
    const propertyName = visibleColumns[cellIndex]?.columnName;
    const cellValue = (data as any)[propertyName];

    const renderers: Record<string, () => JSX.Element> = {
      noticeDate: () => formattedDateCell(cellValue),
      deliveryDate: () => formattedDateCell(cellValue),
      lateFeesDate: () => formattedDateCell(cellValue),
      noticeDeliveryDate: () => formattedDateCell(cellValue),
      // noticePDFs: () =>
      //   cellValue ? (
      //     <Link to={cellValue} className="underline text-[#2472db]">
      //       Download
      //     </Link>
      //   ) : (
      //     <></>
      //   ),

      noticePDFs: () =>
        cellValue ? (
          <h2 onClick={() => {
            openPdf(cellValue)
          }} className="underline text-[#2472db]" style={{ cursor: 'pointer' }}>
            Notice.pdf
          </h2>
        ) : (
          <></>
        ),
      noticeTotalDue: () => formattedCurrencyCell(cellValue),
      fullName: () => formattedFullNameCell(data.tenantNames),
      address: () => formattedAddressCell(data),
      property: () => formattedCell(data.property),
      deliveredBy: () => formattedCell(data.noticeDeliveredToName),
      serviceMethod: () => formattedCell(data.serviceMethod),
      noticePeriod: () => formattedCell(data.noticePeriod),
      noticeAffiant: () => formattedCell(data.noticeAffiant),
      deliveredTo: () => formattedCell(data.noticeAffiant),
      otherFees: () => formattedCurrencyCell(cellValue),
      totalDue: () => formattedCurrencyCell(cellValue),
      lateFees: () => formattedCurrencyCell(cellValue),
      totalRent: () => formattedCurrencyCell(cellValue),
      noticeTotalDemand: () => formattedCurrencyCell(cellValue),
      rentDue: () => formattedCurrencyCell(cellValue),
      noticeLateFees: () => formattedCurrencyCell(cellValue),
      noticePastRentDue: () => formattedCurrencyCell(cellValue),
      noticeCurrentRentDue: () => formattedCurrencyCell(cellValue),
      noticeLastPaidAmount: () => formattedCurrencyCell(cellValue),
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

  const formattedDateCell = (value: any) => (
    <span>{value !== null ? formattedDate(value) : ""}</span>
  );

  const formattedCurrencyCell = (value: any) => (
    <span>$ {value !== null ? convertToPrice(value) : ""}</span>
  );

  const formattedFullNameCell = (tenantNames: any) => (
    <span>
      {tenantNames && tenantNames.length > 0
        ? tenantNames[0].middleName
          ? `${tenantNames[0].firstName} ${tenantNames[0].middleName} ${tenantNames[0].lastName}`
          : `${tenantNames[0].firstName} ${tenantNames[0].lastName}`
        : ""}
    </span>
  );

  const formattedCell = (value: any) => (
    <span>{value !== null ? value : ""}</span>
  );

  const formattedAddressCell = (value: any) => (
    <span>{value !== null ? `${value.address ?? ''} ${value.unit ?? ''} ${value.city ?? ''} ${value.state ?? ''} ${value.zip ?? ''}` : ''}</span>
  );

  return (
    <Modal
      showModal={props.showSignProofPopup}
      onClose={() => props.handleClose()}
      width="max-w-3xl"
    >
      {spinner === true && <Spinner></Spinner>}

      {/* Container for the content */}
      <div id="fullPageContent">
        <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
          <div className="sm:flex sm:items-start">
            <div className="my-2.5 text-center md:my-0 sm:text-left">
              <h3
                className="text-sm font-semibold leading-5 text-gray-900"
                id="modal-title"
              >
                Sign Proof
              </h3>
            </div>
          </div>
          <div className="relative pt-1 md:pt-2 flex-auto">
            <Formik
              initialValues={{
                // signature: "",
                methodOfDeliveryOptions: "",
                deliveryDate:null,
                deliveredTo: "",
                // signatureDate: new Date(),
              }}
              validationSchema={validationSchema}
              onSubmit={getSignProofDocument}
            >
              {(formik) => (
                <Form className="flex flex-col">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                      <div className="relative text-left">
                        <FormikControl
                          control={"select"}
                          classes="w-full rounded-lg h-11 outline-0 px-6 text-base border"
                          options={MethodOfDeliveryOptions}
                          placeholder="Select an option"
                          name={"methodOfDeliveryOptions"}
                          label={"Method of Delivery"}
                          defaultOption={"Please select"}
                        />
                      </div>

                      {formik.values.methodOfDeliveryOptions === "2" && (
                        <div className="relative text-left">
                          <FormikControl
                            control="input"
                            type="text"
                            label={"Delivered To"}
                            name={"deliveredTo"}
                          />
                        </div>
                      )}
                      {/* {formik.values.methodOfDeliveryOptions === "1" && (
                        <div className="relative text-left">
                          <FormikControl
                            control="select"
                            type="select"
                            label={"Delivered To"}
                            name={"deliveredTo"}
                            options={tenantName}
                          />
                        </div>
                      )} */}
                      {/* <div className="relative text-left">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Signature"}
                          name={"signature"}
                        />
                      </div> */}

                      {/* <div className="text-left">
                        <FormikControl
                          control="date"
                          type="date"
                          label={"Sign Date"}
                          name={"signatureDate"}
                          placeholder={"Signature Date"}
                        />
                      </div> */}

                      <div className="relative text-left">
                        <FormikControl
                          control="date"
                          type="date"
                          label={"Delivery Date"}
                          name={"deliveryDate"}
                          placeholder={"mm/dd/yyyy"}
                          minDate={null}
                          maxDate={new Date()}
                          max={new Date()}                          
                        />
                      </div>
                    </div>
                  <div className="relative pt-4 md:pt-5">
                    <Grid
                      columnHeading={visibleColumns}
                      rows={filteredRecords}
                      showInPopUp={true}
                      cellRenderer={(
                        data: ILateNoticesItems,
                        rowIndex: number,
                        cellIndex: number
                      ) => {
                        return handleCellRendered(cellIndex, data, rowIndex);
                      }}
                    ></Grid>
                  </div>
                  <div className="py-2.5 flex justify-end mt-1.5">
                    <Button
                      type="button"
                      isRounded={false}
                      title="Cancel"
                      handleClick={() => props.handleClose()}
                      classes="text-[13px] md:text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 mr-1.5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg "
                    ></Button>
                    <Button
                      type="submit"
                      isRounded={false}
                      title="Review & Sign"
                      classes="text-[13px] md:text-sm bg-[#2472db] hover:bg-[#0d5ecb] inline-flex justify-center items-center rounded-lg text-md font-semibold py-2.5 md:py-3 px-5 md:px-6  text-white"
                    ></Button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
          {/* Display the grid with late notices */}

          {/* Display the grid with late notices */}
        </div>
      </div>
    </Modal>
  );
};

export default LateNotices_SignProofs;
