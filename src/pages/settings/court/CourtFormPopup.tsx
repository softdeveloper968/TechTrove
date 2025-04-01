import React, { useEffect, useState } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { Form, Formik } from "formik";
import FormikControl from "components/formik/FormikControl";
import Button from "components/common/button/Button";
import Modal from "components/common/popup/PopUp";
import { ICourtDropdownList, ICourtItems } from "interfaces/court.interface";
import { ICountyItems } from "interfaces/county.interface";
import { ICommonSelectOptions } from "interfaces/common.interface";
import CountyService from "services/county.service";
import CourtService from "services/court.service";

const validationSchema = yup.object({
   courtCode: yup
      .string()
      .max(50, "The court name must not exceed 50 characters")
      .required("Please enter court name"),
   countyId: yup
      .number()
      .required("Please select county")
      .test("is-not-zero", "Please select county", (value) => value !== 0),
});

type CourtFormPopupProps = {
   showPopup: Boolean;
   closePopup: (shouldRefresh: string) => void;
   isEditMode: boolean;
   initialValues: ICourtItems;
   onSubmit: (formValues: ICourtItems) => void;
   initialCourtOptions: ICommonSelectOptions[];
   showSpinner: Boolean;
};

const CourtFormPopup: React.FC<CourtFormPopupProps> = ({
   showPopup,
   closePopup,
   isEditMode,
   initialValues,
   onSubmit,
   initialCourtOptions,
   showSpinner
}) => {
   const [counties, setCounties] = useState<ICountyItems[]>([]);
   const [countyOptions, setCountyOptions] = useState<ICommonSelectOptions[]>([]);
   const [courtOptions, setCourtOptions] = useState<ICommonSelectOptions[]>(initialCourtOptions);
   const [loadingCourts, setLoadingCourts] = useState<boolean>(false);

   useEffect(() => {
      getCounty();
   }, []);

   useEffect(() => {
      if (isEditMode && initialValues.countyId) {
         const selectedCounty = counties.find(c => c.countyId === initialValues.countyId);
         if (selectedCounty) {
            const selectedCountyName = selectedCounty.countyName;
            if (selectedCountyName.toLowerCase() === "Cobb".toLowerCase()) {
               // Handle Cobb county-specific court options
               setCourtOptions([{
                  id: "Cobb County - Magistrate Court",
                  value: "Cobb County - Magistrate Court"
               }]);
            } else {
               // Handle other counties
               setCourtDropdownValues(selectedCounty.stateName, selectedCountyName);
            }
         }
      }
   }, [isEditMode, initialValues.countyId, counties]);

   const getCounty = async () => {
      try {
         const response = await CountyService.getCounties();
         if (response.status === HttpStatusCode.Ok) {
            setCounties(response.data);

            const options = response.data.map((item: ICountyItems) => ({
               id: item.countyId != null ? parseInt(item.countyId.toString()) : -1, // Ensure proper parsing
               value: item.countyName,
            }));
            setCountyOptions(options);
         }
      } catch (error) {
         console.error("Error fetching counties:", error);
      }
   };

   const getCourtDropdownValues = async (state: string) => {
      setLoadingCourts(true);
      try {
         const apiResponse = await CourtService.getCourtsByState(state);
         if (apiResponse.status === HttpStatusCode.Ok) {
            return apiResponse.data as ICourtDropdownList[];
         } else {
            return [];
         }
      } finally {
         setLoadingCourts(false);
      }
   };

   const setCourtDropdownValues = async (state: string, countyName: string) => {      
      try {
         const data = await getCourtDropdownValues(state);
         const courtOptions = data.map((item) => ({
            id: item.code,
            value: item.name,
         }));
         setCourtOptions(courtOptions.filter(option =>
            option.value.toLowerCase().includes(countyName.toLowerCase()+" ")
         ));
      } catch (error) {
         console.error("Error setting court dropdown values:", error);
      }
   };

   return (
      <>
         {showPopup && (
            <Modal
               showModal={showPopup}
               onClose={() => closePopup("noRefresh")}
               width="max-w-xl"
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
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        // onSubmit={(values, actions) => {
                        //    onSubmit(values);
                        //    actions.setSubmitting(true);
                        //    //closePopup("refresh");
                        // }}
                        onSubmit={onSubmit}
                     >
                        {(formik) => (
                           <Form className="flex flex-col">
                              <div className="grid sm:grid-cols-2 gap-2.5 md:gap-3.5">
                                 <div className="relative text-left">
                                    <FormikControl
                                       control="select"
                                       type="select"
                                       label={"County"}
                                       name={"countyId"}
                                       placeholder={"County"}
                                       options={countyOptions}
                                       defaultOption={"Select"}
                                       onChange={(e: any) => {
                                          const selectedCountyId = parseInt(e.target.value);
                                          formik.setFieldValue("countyId", selectedCountyId); // Set clientId
                                          // setFieldValue("countyId", selectedCountyId);
                                          const selectedCounty = counties.find((c: ICountyItems) => c.countyId === selectedCountyId);

                                          if (selectedCounty) {
                                             const selectedState = selectedCounty.stateName;
                                             const selectedCountyName = selectedCounty.countyName;
                                             if (selectedCountyName.toLowerCase() === "Cobb".toLowerCase()) {
                                                setCourtOptions([{
                                                   id: "Cobb County - Magistrate Court",
                                                   value: "Cobb County - Magistrate Court"
                                                }]);
                                             } else {
                                                setCourtDropdownValues(selectedState, selectedCountyName);
                                             }
                                          }
                                       }}
                                    />
                                 </div>
                                 <div className="relative">
                                    {loadingCourts ? (
                                       <div className="absolute inset-0 flex items-center justify-center">
                                          <div
                                             className="animate-spin inline-block w-6 h-6 border-[3px] border-current border-t-transparent text-blue-600 rounded-full"
                                             style={{ marginTop: '28px' }}
                                             role="status"
                                             aria-label="loading"
                                          >
                                             {/* Screen reader-only text for accessibility */}
                                          </div>
                                       </div>
                                    ) : (
                                       <FormikControl
                                          control="select"
                                          type="select"
                                          label={"Location/Court Name"}
                                          name={"courtCode"}
                                          value={formik.values.courtCode}
                                          defaultOption={"Please select an option"}
                                          placeholder={"Select"}
                                          options={courtOptions}
                                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                             const selectedOption = courtOptions.find(option => option.id === e.target.value);
                                             if (selectedOption) {
                                                formik.setFieldValue("courtCode",  e.target.value); 
                                                formik.setFieldValue("courtName",  selectedOption.value); 

                                                // setFieldValue("courtCode", e.target.value);
                                                // setFieldValue("courtName", selectedOption.value);
                                             }
                                          }}
                                       />
                                    )}
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
                                    disabled={showSpinner == true? true: false}
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

export default CourtFormPopup;
