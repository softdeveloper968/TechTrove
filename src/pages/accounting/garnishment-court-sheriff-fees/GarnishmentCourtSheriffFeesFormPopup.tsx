import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { Form, Formik } from "formik";
import FormikControl from "components/formik/FormikControl";
import Modal from "components/common/popup/PopUp";
import Button from "components/common/button/Button";
import vm from "utils/validationMessages";
import CountyService from "services/county.service";
import CourtService from "services/court.service";
import { ICounty } from "interfaces/county.interface";
import { ICourt } from "interfaces/court.interface";
import { IGarnishmentCourtSheriffFeesItems } from "interfaces/garnishment-court-sheriff-fees.interface";

// Validation schema for the county model
const validationSchema = yup.object().shape({
  // garnishmentType: yup
  //   .number()
  //   .required(vm.garnishmentType.required)
  //   .min(0)
  //   .test(
  //     vm.garnishmentType.test,
  //     vm.garnishmentType.min,
  //     (value) => value !== 0
  //   ),
  // sheriffFeeFirstTenant: yup
  //   .number()
  //   .required(vm.sheriffFeeFirstTenant.required)
  //   .min(0)
  //   .test(
  //     vm.sheriffFeeFirstTenant.test,
  //     vm.sheriffFeeFirstTenant.min,
  //     (value) => value !== 0
  //   ),
  // sheriffFeeSecondTenant: yup
  //   .number()
  //   .min(0)
  //   .required(vm.sheriffFeeSecondTenant.required)
  //   .test(
  //     vm.sheriffFeeSecondTenant.test,
  //     vm.sheriffFeeSecondTenant.min,
  //     (value) => value !== 0
  //   ),
  // courtFee: yup
  //   .number()
  //   .required(vm.courtFee.required)
  //   .test(
  //     vm.courtFee.test,
  //     vm.courtFee.min,
  //     (value) => value !== 0
  //   )
  //   .min(0),
  // courtfeeSecondTenant: yup
  //   .number()
  //   .required(vm.courtfeeSecondTenant.required)
  //   .min(0)
  //   .test(
  //     vm.courtfeeSecondTenant.test,
  //     vm.courtfeeSecondTenant.min,
  //     (value) => value !== 0
  //   ),
  // efileFee: yup
  //   .number()
  //   .required(vm.efileFee.required)
  //   .min(0)
  //   .test(
  //     vm.efileFee.test,
  //     vm.efileFee.min,
  //     (value) => value !== 0
  //   ),
  // efileServiceCharge: yup
  //   .number()
  //   .required(vm.garnisefileServiceChargehmentType.required)
  //   .min(0)
  //   .test(
  //     vm.garnisefileServiceChargehmentType.test,
  //     vm.garnisefileServiceChargehmentType.min,
  //     (value) => value !== 0
  //   ),
  // otherEfileCharge: yup
  //   .number()
  //   .required(vm.otherEfileCharge.required)
  //   .min(0)
  //   .test(
  //     vm.otherEfileCharge.test,
  //     vm.otherEfileCharge.min,
  //     (value) => value !== 0
  //   ),
  // courtFeeAndAllOthers: yup
  //   .number()
  //   .required(vm.courtFeeAndAllOthers.required)
  //   .min(0)
  //   .test(
  //     vm.courtFeeAndAllOthers.test,
  //     vm.courtFeeAndAllOthers.min,
  //     (value) => value !== 0
  //   ),
  countyId: yup
    .number()
    .required(vm.countyName.required)
    .min(0)
    .test(vm.countyName.test, vm.countyName.required, (value) => value !== 0),
  courtId: yup
    .number()
    .required(vm.court.required)
    .min(0)
    .test(vm.court.test, vm.court.required, (value) => value !== 0),
});

type GarnishmentCourtSheriffFeesFormPopupProps = {
  showPopup: Boolean;
  closePopup: (shouldRefresh: string) => void;
  isEditMode: boolean;
  initialValues: IGarnishmentCourtSheriffFeesItems;
  onSubmit: (formValues: IGarnishmentCourtSheriffFeesItems) => void;
  showSpinner: Boolean;
};

const GarnishmentCourtSheriffFeesFormPopup: React.FC<
  GarnishmentCourtSheriffFeesFormPopupProps
> = ({ showPopup, closePopup, isEditMode, initialValues, onSubmit, showSpinner }) => {
  const [garnishmentCourtSheriffFees, setGarnishmentCourtSheriffFees] =
    useState<IGarnishmentCourtSheriffFeesItems[]>([]);
  const [counties, setCounties] = useState<ICounty[]>([]);
  const [courts, setCourts] = useState<ICourt[]>([]);

  useEffect(() => {
    getAllCounties();
    if (initialValues.court.countyId !== 0) {
      getAllCourtsBasedOnCounties(initialValues.court.countyId);
    }
  }, []);

  const getAllCounties = async () => {
    try {
      // let response = await CountyService.getAllCounty();
      const response = await CountyService.getCounties();
      if (response.status === HttpStatusCode.Ok) {
        let api = response.data.map((item: any) => {
          return {
            id: item.countyId,
            value: item.countyName,
          };
        });
        setCounties(api);
      }
    } finally {
    }
  };
  const getAllCourtsBasedOnCounties = async (countyId: number) => {
    try {
      let response = await CourtService.getCourtsByCountyId(countyId);
      if (response.status === HttpStatusCode.Ok) {
        let api = response.data.map((item: any) => {
          return {
            id: parseInt(item.id),
            value: item.courtName,
          };
        });
        setCourts(api);
      }
    } finally {
    }
  };
  return (
    <>
      {showPopup && (
        <Modal
          showModal={showPopup}
          onClose={() => closePopup("noRefresh")}
          width="max-w-[60rem]"
        >
          <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
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
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
              >
                {(formik) => (
                  <Form className="flex flex-col">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2.5 md:gap-3.5">
                      <div className="relative text-left">
                        <FormikControl
                          control="select"
                          type="select"
                          label={"County"}
                          name={"countyId"}
                          placeholder={"County"}
                          options={counties}
                          defaultOption={"Select"}
                          onChange={(e: any) => {
                            formik.setFieldValue("countyId", e.target.value);
                            formik.setFieldValue("courtId", "");
                            getAllCourtsBasedOnCounties(e.target.value);
                          }}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="select"
                          type="select"
                          label={"Court"}
                          name={"courtId"}
                          placeholder={"Court"}
                          options={courts}
                          defaultOption={"Select"}
                          onChange={(e: any) => {
                            formik.setFieldValue("courtId", e.target.value);
                          }}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="number"
                          type="number"
                          label={"GarnishmentType"}
                          name={"garnishmentType"}
                          placeholder={"GarnishmentType"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="number"
                          type="number"
                          label={"SheriffFeeFirstTenant"}
                          name={"sheriffFeeFirstTenant"}
                          placeholder={"SheriffFeeFirstTenant"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="number"
                          type="number"
                          label={"SheriffFeeSecondTenant"}
                          name={"sheriffFeeSecondTenant"}
                          placeholder={"SheriffFeeSecondTenant"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="number"
                          type="number"
                          label={"CourtFee"}
                          name={"courtFee"}
                          placeholder={"CourtFee"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="number"
                          type="number"
                          label={"CourtFeeSecondTenant"}
                          name={"courtfeeSecondTenant"}
                          placeholder={"CourtFeeSecondTenant"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="number"
                          type="number"
                          label={"EfileFee"}
                          name={"efileFee"}
                          placeholder={"EfileFee"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="number"
                          type="number"
                          label={"EfileServiceCharge"}
                          name={"efileServiceCharge"}
                          placeholder={"EfileServiceCharge"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="number"
                          type="number"
                          label={"OtherEfileCharge"}
                          name={"otherEfileCharge"}
                          placeholder={"OtherEfileCharge"}
                        />
                      </div>
                      <div className="relative text-left">
                        <FormikControl
                          control="number"
                          type="number"
                          label={"CourtFeeAndAllOthers"}
                          name={"courtFeeAndAllOthers"}
                          placeholder={"CourtFeeAndAllOthers"}
                        />
                      </div>
                      <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"POGMServiceAtt1"}
                                       name={"pogmService1stTime"}
                                       placeholder={"POGMServiceAtt1"}
                                    />
                      </div>
                      <div className="relative text-left">
                                    <FormikControl
                                       control="number"
                                       type="number"
                                       label={"POGMServiceAtt2"}
                                       name={"pogmService2ndTime"}
                                       placeholder={"POGMServiceAtt2"}
                                    />
                      </div>
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
                        disabled={showSpinner == true? true:false}
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
export default GarnishmentCourtSheriffFeesFormPopup;
