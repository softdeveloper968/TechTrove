import React from "react";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { Form, Formik } from "formik";
import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import Select from "components/formik/Select";
import { INotaryItems } from "interfaces/notary.interface";
import { ICountyItems } from "interfaces/county.interface";
import CountyService from "services/county.service";
import { convertAndFormatDate } from "utils/helper";

// Validation schema for the notary model
const validationSchema = yup.object({
    notaryName:yup.string().required("Please enter notary name"),
    notaryExpDate:yup
    .date()
    .required("Please enter notary date.")
    .typeError("Please enter a valid date."),
    notaryCountyId:yup
        .number()
       .required("Please select county ")
        .test("is-not-zero", "Please select  county", (value) => value !== 0),
    qualifiedInCountyId:yup
        .number()
       .required("Please select county ")
        .test("is-not-zero", "Please select  county", (value) => value !== 0),

});

type NotaryFormPopupProps = {
  showPopup: Boolean;
  closePopup: (shouldRefresh: string) => void;
  isEditMode: boolean;
  initialValues: INotaryItems;
  onSubmit: (formValues: INotaryItems) => void;
  showSpinner: Boolean;
};

// const formatDate = (dateString: string) => {
//   const date = new Date(dateString);
//   const formattedDate = `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
//   return formattedDate;
// };

const NotaryFormPopup: React.FC<NotaryFormPopupProps> = ({
  showPopup,
  closePopup,
  isEditMode,
  initialValues,
  onSubmit,
  showSpinner
}) => {

// Format the notary expiration date if it exists
const formattedInitialValues: INotaryItems = {
  ...initialValues,
  notaryExpDate: initialValues?.notaryExpDate
    ? new Date(convertAndFormatDate(initialValues.notaryExpDate)).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "",
};
  const [counties, setCounties] = useState<ICountyItems[]>([]);

  useEffect(() => {
    getCounty();
  }, []);

  const getCounty = async () => {
    try {
      // let response = await CountyService.getAllCounty();
      const response = await CountyService.getCounties();
      if (response.status === HttpStatusCode.Ok) {
        let api = response.data.map((item: any) => {
          return {
            id: parseInt(item.countyId),
            value: item.countyName,
          };
        });
        setCounties(api);
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
          width="max-w-xl edit_modal"
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
            <div className="pt-1.5 md:pt-2 flex-auto">
              <Formik
                initialValues={formattedInitialValues}
                validationSchema={validationSchema}
                onSubmit={onSubmit}
              >
                {(formik) => (
                  <Form className="flex flex-col">
                    <div className="grid sm:grid-cols-2 gap-2.5 md:gap-3.5">
                      <div className="relative">
                        <FormikControl
                          control="input"
                          type="text"
                          label={"Notary Name"}
                          name={"notaryName"}
                          autoFocus={true}
                        />
                      </div>
                      <div className="text-left date_control">
                        <FormikControl
                          control="date"
                          type="date"
                          label={"Notary ExpDate"}
                          name={"notaryExpDate"}
                          placeholder={"mm/dd/yyyy"}
                        />
                      </div>    
                      <div className="relative text-left">
                        {/* <FormikControl
                          control="select"
                          type="select"
                          label={"County"}
                          name={"notaryCountyId "}
                          placeholder={"County"}
                          options={counties}
                          defaultOption={"Select"}
                          onChange={(e: any) => {
                            formik.setFieldValue("notaryCountyId", e.target.value);
                          }}
                        /> */}
                        
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-2.5 md:gap-3.5">
                    <div className="relative ">
                      <label
                        htmlFor={"company"}
                        className="text-gray-600 text-[11px] md:text-xs font-medium"
                      >
                        Notary County
                      </label>
                      <Select
                        heading={"Company"}
                        name="notaryCountyId"
                        defaultOption={"Please select"}
                        handleSelect={(event: any) => {
                          
                        }}
                        options={counties}
                       // placeholder="Select an option"
                        selectedValue={initialValues.notaryCountyId}
                      />
                    </div>
                    <div className="relative ">
                      <label
                        htmlFor={"company"}
                        className="text-gray-600 text-[11px] md:text-xs font-medium"
                      >
                        Qualified in County
                      </label>
                      <Select
                        heading={"Company"}
                        name="qualifiedInCountyId"
                        defaultOption={"Please select"}
                        handleSelect={(event: any) => {
                          
                        }}
                        options={counties}
                       // placeholder="Select an option"
                        selectedValue={initialValues.qualifiedInCountyId}
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

export default NotaryFormPopup;
