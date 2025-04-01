import React from "react";
import { useEffect, useState } from "react";
import * as yup from "yup";
import { Link } from "react-router-dom";
import { Formik, Form } from "formik";
import { FaEye, FaEyeSlash } from "react-icons/fa";

import Button from "components/common/button/Button";
import FormikControl from "components/formik/FormikControl";
import Spinner from "components/common/spinner/Spinner";

import { IUserLogin } from "interfaces/user.interface";
import { useAuth } from "context/AuthContext";

type Props = {};

//validation schema for login model
const validationSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid Email address")
    .required("Please enter Email")
    .max(50, " The Email must not exceed 50 characters"),
  password: yup
    .string()
    .trim()
    .required("Please enter a Password")
    .max(25, "The Password must not exceed 25 characters"),
});

const Login = (props: Props) => {
  // Login form initial values
  const initialValues = { email: "", password: "" };

  const { login, spinner } = useAuth();

  /**
   * login api call by passing email and password
   * @param formData
   */
  const handleLogin = async (formData: IUserLogin) => {
    login(formData);
  };
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    // setPasswordVisible((prevVisible) => !prevVisible);
    setPasswordVisible(!passwordVisible);
  };
  useEffect(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("userDetail");
  }, []);
  return (
    <div
      className={
        "bg-login bg-center bg-cover bg-no-repeat flex p-3.5"
      }
    >
      <div className="p-3.5 sm:p-6 max-w-sm mx-auto my-auto ms-auto bg-white rounded-md md:rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="block text-xl font-bold text-gray-800 ">
            Connect2Court
          </h1>
          <p className="mt-1.5 text-sm text-gray-600  mb-4 md:mb-5 leading-tight">
            Please enter your credentials to login to your account.
          </p>
        </div>
        {spinner ? <Spinner></Spinner> : null}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleLogin}
        >
          {(formik) => (
            <Form className=" flex flex-col ">
              <FormikControl
                control="input"
                type="text"
                label={"Email"}
                name={"email"}
                placeholder={"Enter Email"}
              />
              <div className="relative mt-2.5">
                <FormikControl
                  control="input"
                  type={passwordVisible ? "text" : "password"}
                  label={"Password"}
                  name={"password"}
                  placeholder={"Enter Password"}
                />
                <span className="absolute right-3.5 top-[35px] cursor-pointer">
                  {passwordVisible ? (
                    <FaEye onClick={togglePasswordVisibility} />
                  ) : (
                    <FaEyeSlash onClick={togglePasswordVisibility} />
                  )}
                </span>
              </div>
              <div>
                <Button
                  isRounded={true}
                  title={"Login"}
                  type={"submit"}
                  classes="uppercase mt-2.5 w-full py-2.5 px-3.5 inline-flex justify-center items-center gap-x-1.5 text-xs font-semibold rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none   "
                ></Button>
              </div>
            </Form>
          )}
        </Formik>
        <div className="text-center mt-1.5 text-xs text-gray-600 ">
          <Link
            to="/forgot-password"
            className=" ml-0.5 text-blue-600 decoration-2 hover:underline font-medium   "
          >
            Forgot your password?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
