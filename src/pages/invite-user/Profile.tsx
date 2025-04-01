import React, { useState, useEffect } from "react";
import * as yup from "yup";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import InputMask from "react-input-mask";
import { Form, Formik } from "formik";
import Button from "components/common/button/Button";
import Spinner from "components/common/spinner/Spinner";
import FormikControl from "components/formik/FormikControl";
import { IChangePassword, IUserItems } from "interfaces/all-users.interface";
import { IJWTDecodedToken } from "interfaces/user.interface";
import AllUsersService from "services/all-users.service";
import { useUserContext } from "./UserContext";

interface IUserInfo {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
}

const userValidationSchema = yup.object({
  phoneNumber: yup
    .string()
    .matches(/^\(\d{3}\) \d{3}-\d{4}$/, "Please enter a valid phone number")
    .required("Please enter phone number"),
  firstName: yup
    .string()
    .trim()
    .required("Please enter your First Name")
    .max(50, "The First name must not exceed 50 characters"),
  lastName: yup
    .string()
    .trim()
    .required("Please enter your Last Name")
    .max(50, "The Last name must not exceed 50 characters"),
});

const changePasswordValidationSchema = yup.object({
  oldPassword: yup.string().required("Please enter old password"),
  newPassword: yup
    .string()
    .required("Please enter a new Password")
    .min(8, "Password must be at least 8 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
      "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Character"
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("newPassword")], "Passwords do not match")
    .required("Please enter a Confirm Password")
    .min(8, "Password must be at least 8 characters long")
    .max(50, "The Password must not exceed 50 characters"),
});

const Profile = () => {
  const { showSpinner, setShowSpinner } = useUserContext();
  const [user, setUser] = useState<IJWTDecodedToken | undefined>(undefined);
  const [initialValues, setInitialValues] = useState<IUserInfo>({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '', 
  });
  const userInfo =JSON.parse(localStorage.getItem("userDetail")??"")
  useEffect(() => {
    const fetchUserInfo = async () => {    
      if (userInfo) {
        setInitialValues({
          firstName: userInfo.FirstName,
          lastName: userInfo.LastName,
          phoneNumber: userInfo.PhoneNumber,
          email: userInfo.Email
        });
        setUser(userInfo);
        setShowSpinner(false);
      }
    };

    fetchUserInfo();
  }, []);

  const updateProfileInfo = async (formValues: IUserItems) => {
    formValues.email = user?.Email;
    formValues.isActive = true;
    formValues.userCompanyId = user?.ClientID;
    formValues.role = JSON.parse(user?.UserRoles.toString() || "[]")[0];

    const response = await AllUsersService.editUser(user?.UserID, formValues);

    if (response.status === HttpStatusCode.Ok) {
      
      const updatedUserDetails = {
        ...userInfo,
        FirstName:formValues.firstName,
        LastName:formValues.lastName,
        PhoneNumber:formValues.phoneNumber, 
      };
      // Save updated user details back to local storage
      localStorage.setItem('userDetail', JSON.stringify(updatedUserDetails));
      setShowSpinner(false);
      toast.success("User Successfully Added");
    }
  };

  const handleChangePassword = async (formValues: IChangePassword) => {
    setShowSpinner(false);
    formValues.userId=user?.UserID||"";
    const response = await AllUsersService.changePassword(formValues);

    if (response.status === HttpStatusCode.Ok) {
      setShowSpinner(false);
      toast.success("Password successfully updated");
    } else {
      setShowSpinner(false);
      // toast.error("Something went wrong!");
    }
  }

  if (showSpinner) {
    return <Spinner />;
  }

  return (
    <>
      <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
        <div className="sm:flex sm:items-start">
          <div className="text-center sm:text-left">
            <h3 className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5" id="modal-title">
              Profile
            </h3>
          </div>
        </div>
        {initialValues && initialValues.email &&
          <Formik
            initialValues={initialValues}
            validationSchema={userValidationSchema}
            onSubmit={updateProfileInfo}
          >
            {(formik) => (
              <Form className="flex flex-col pt-1.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
                  <div className="relative">
                    <FormikControl
                      control="input"
                      type="text"
                      label={"First Name"}
                      name={"firstName"}
                      placeholder={"Enter First Name"}
                    // autoFocus={true}
                    />
                  </div>
                  <div className="relative">
                    <FormikControl
                      control="input"
                      type={"text"}
                      label={"Last Name"}
                      name={"lastName"}
                      placeholder={"Enter Last Name"}
                    />
                  </div>
                  <div className="relative">
                    <FormikControl
                      control="input"
                      type={"text"}
                      label={"Email"}
                      name={"email"}
                      placeholder={"Enter Email"}
                      disabled={true}
                    />
                  </div>
                  <div className="relative">
                    <label htmlFor={"role"} className="text-gray-600 text-sm font-medium">
                      Phone Number
                    </label>
                    <div>
                      <InputMask
                        mask="(999) 999-9999"
                        maskChar=" "
                        value={formik.values.phoneNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        name="phoneNumber"
                        id="phoneNumber"
                        placeholder="Enter Phone Number"
                        className="peer outline-none p-2.5 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none   " // Custom class for styling
                      />
                      {formik.touched.phoneNumber && formik.errors.phoneNumber ? (
                        <div className="text-[11px] text-aidonicRed text-red-500">
                          {formik.errors.phoneNumber}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                <div className="text-right pt-2.5">
                  <Button
                    title={"Update"}
                    type={"submit"}
                    isRounded={false}
                    classes="mt-1 md:mt-2.5 py-2 md:py-2.5 px-4 inline-flex justify-center items-center gap-x-1.5 text-xs font-semibold rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none   "
                  />
                </div>
              </Form>
            )}
          </Formik>
        }
      </div>
      <div className="my-3 md:my-4 bg-white px-3.5 pb-3.5 pt-4 sm:p-5 sm:pb-3.5">
        <div className="sm:flex sm:items-start">
          <div className="text-center sm:text-left">
            <h3 className="leading-5 text-gray-900 text-[16px] md:text-xl mb-1.5" id="modal-title">
              Change Password
            </h3>
          </div>
        </div>
        <Formik
          initialValues={{
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
          }}
          validationSchema={changePasswordValidationSchema}
          onSubmit={handleChangePassword}
        >
          {(formik) => (
            <Form className="flex flex-col pt-1.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5">
                <div className="relative">
                  <FormikControl
                    control="input"
                    type={"password"}
                    label={"Old Password"}
                    name={"oldPassword"}
                    placeholder={"Enter Old Password"}
                  />
                </div>
                <div className="relative">
                  <FormikControl
                    control="input"
                    type={"password"}
                    label={"New Password"}
                    name={"newPassword"}
                    placeholder={"Enter New Password"}
                  />
                </div>
                <div className="relative">
                  <FormikControl
                    control="input"
                    type={"password"}
                    label={"Confirm Password"}
                    name={"confirmPassword"}
                    placeholder={"Enter Confirm Password"}
                  />
                </div>
              </div>
              <div className="text-right pt-2.5">
                <Button
                  title={"Change Password"}
                  type={"submit"}
                  isRounded={false}
                  classes="mt-1 md:mt-2.5 py-2 md:py-2.5 px-4 inline-flex justify-center items-center gap-x-1.5 text-xs font-semibold rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none   "
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
};

export default Profile;
