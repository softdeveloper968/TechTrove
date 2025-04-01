import React from "react";
import { useState } from "react";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { Formik, Form } from "formik";
import "react-toastify/dist/ReactToastify.css";

import Button from "components/common/button/Button";
import FormikControl from "components/formik/FormikControl";
import Spinner from "components/common/spinner/Spinner";

import AuthService from "services/auth.service";
import { IUserRegistration } from "interfaces/user.interface";

type Props = {};

//validation schema for signup model
const validationSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid Email address")
    .required("Please enter your Email")
    .max(50, "The Email must not exceed 50 characters"),
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
  password: yup
    .string()
    .required("Please enter a Password")
    .min(8, "Password must be at least 8 characters long")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
      "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Character"
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please enter a ConfirmPassword")
    .min(8, "Password must be at least 8 characters long")
    .max(50, "The Password must not exceed 50 characters"),
});

export default function SignUp(props: Props) {
  const initialValues = {
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  };
  // State for showing spinner
  const [showSpinner, setShowSpinner] = useState(false);
  //hook to redirect to another screen
  const navigate = useNavigate();
  /**
   * passing field parameters to api
   * @param formData
   */
  const handleSignup = async (formData: IUserRegistration) => {
    try {
      setShowSpinner(true);
      const { confirmPassword, ...userData } = formData;
      const resp = await AuthService.signUp(formData);
      if (resp.status === HttpStatusCode.Ok) {
        toast.success("User registered successfully!", {
          position: toast.POSITION.TOP_RIGHT,
        });
        navigate("/login");
      }
    } finally {
      setShowSpinner(false);
    }
  };

  return (
    <div
      className={
        "bg-login bg-center bg-cover bg-no-repeat flex p-3.5"
      }
    >
      <div className="p-3.5 sm:p-6 max-w-sm	mx-auto my-auto ms-auto bg-white rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="block text-xl font-bold text-gray-800">
            Sign up
          </h1>
          <p className="mt-1.5 text-md text-gray-600 mb-4 md:mb-5 leading-tight">
            Please fill your details to create your account.
          </p>
        </div>
        {showSpinner ? <Spinner></Spinner> : null}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSignup}
        >
          {(formik) => (
            <Form className=" flex flex-col ">
              <div className="grid sm:grid-cols-2 gap-2.5 md:gap-3.5">
                <div className="relative">
                  <FormikControl
                    control="input"
                    type="text"
                    label={"First Name"}
                    name={"firstName"}
                    placeholder={"Enter First Name"}
                  />
                </div>
                <div className="relative  mt-2.5">
                  <FormikControl
                    control="input"
                    type={"text"}
                    label={"Last Name"}
                    name={"lastName"}
                    placeholder={"Enter Last Name"}
                  />
                </div>
              </div>
              <div className="relative mt-2.5">
                <FormikControl
                  control="input"
                  type={"text"}
                  label={"Email"}
                  name={"email"}
                  placeholder={"Enter Email"}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-2.5 md:gap-3.5">
                <div className="relative mt-2.5">
                  <FormikControl
                    control="input"
                    type={"password"}
                    label={"Password"}
                    name={"password"}
                    placeholder={"Enter Password"}
                  />
                </div>
                <div className="relative mt-2.5">
                  <FormikControl
                    control="input"
                    type={"password"}
                    label={"Confirm Password"}
                    name={"confirmPassword"}
                    placeholder={"Enter Confirm Password"}
                  />
                </div>
              </div>

              <div>
                <Button
                  title={"Sign up"}
                  type={"submit"}
                  isRounded={false}
                  classes="uppercase mt-2.5 w-full py-2.5 px-3.5 inline-flex justify-center items-center gap-x-1.5 text-xs font-semibold rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
                ></Button>
              </div>
              <div className="py-2.5 flex items-center text-[10px] text-gray-400 uppercase before:flex-[1_1_0%] before:border-t before:border-gray-200 before:me-6 after:flex-[1_1_0%] after:border-t after:border-gray-200 after:ms-5">
                Or
              </div>

              <div className="text-center mt-1.5 text-xs text-gray-600">
                Already have an account?
                <Link
                  to="/"
                  className=" ml-0.5 text-blue-600 decoration-2 hover:underline font-medium"
                >
                  Sign in here
                </Link>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
