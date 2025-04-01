import React from "react";
import * as yup from "yup";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form } from "formik";

import Button from "components/common/button/Button";
import FormikControl from "components/formik/FormikControl";
import Spinner from "components/common/spinner/Spinner";

import AuthService from "services/auth.service";
import { HttpStatusCode } from "utils/enum";

type Props = {};

// Validation schema for login model
const validationSchema = yup.object({
  email: yup
    .string()
    .email("Please enter a valid Email address")
    .required("Please enter your Email")
    .max(50, "Must be less than 50 characters"),
});

const ForgotPassword = (props: Props) => {
  // Forgot password form initial values
  const initialValues = { email: "" };

  // State for showing spinner
  const [showSpinner, setShowSpinner] = useState(false);

  /**
   * Handles the forgot password submission.
   * @param values - { email: string }
   */
  const handleForgotPassword = async (values: { email: string }) => {
    try {
      // Show spinner while processing
      setShowSpinner(true);

      // Call the forgotPassword API
      const resp = await AuthService.forgotPassword(values);

      // Check the response status
      if (resp.status === HttpStatusCode.OK) {
        toast.success(
          "A link to reset your password has been sent. Please check your email to proceed with the password reset",
          {
            position: toast.POSITION.TOP_RIGHT,
          }
        );
      }
      else if(resp.status === HttpStatusCode.BadRequest)
      {
        toast.error(resp.data.message, {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
      //  else {
      //   toast.error("The user doesn't exist", {
      //     position: toast.POSITION.TOP_RIGHT,
      //   });
      // }
    } finally {
      // Hide spinner after processing
      setShowSpinner(false);
    }
  };

  return (
    <div className="bg-login bg-center bg-cover bg-no-repeat flex p-3.5">
      <div className="p-3.5 sm:p-6 mx-auto max-w-sm my-auto ms-auto bg-white rounded-md md:rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="block text-xl font-bold text-gray-800 ">
            Forgot Password
          </h1>
          <p className="mt-1.5 text-sm text-gray-600  mb-4 md:mb-5 leading-tight">
            Enter your email, and we will send you a link to reset your
            password.
          </p>
        </div>
        {showSpinner ? <Spinner></Spinner> : null}
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleForgotPassword}
        >
          {(formik) => (
            <Form className="flex flex-col">
              <FormikControl
                control="input"
                type="text"
                label={"Email"}
                name={"email"}
                placeholder={"Enter email"}
              />
              <div>
                <Button
                  title={"Submit "}
                  type={"submit"}
                  isRounded={false}
                  classes="uppercase mt-2.5 w-full py-2.5 px-3.5 inline-flex justify-center items-center gap-x-1.5 text-xs font-semibold rounded-md border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none   "
                ></Button>
              </div>
            </Form>
          )}
        </Formik>
        <div className="text-center mt-1.5 text-xs text-gray-600 ">
          Click here to
          <Link
            to="/login"
            className="ml-0.5 text-blue-600 decoration-2 hover:underline font-medium   "
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
