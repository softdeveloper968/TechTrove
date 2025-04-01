import React, { useState, useEffect, useRef } from "react";
import * as yup from "yup";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HttpStatusCode } from "utils/enum";
import { toast } from "react-toastify";
import { Formik, Form } from "formik";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import Button from "components/common/button/Button";
import FormikControl from "components/formik/FormikControl";
import Spinner from "components/common/spinner/Spinner";
import AuthService from "services/auth.service";
import { IResetPassword, IVerifyEmail } from "interfaces/user.interface";

type Props = {
   isNewAccount: boolean;
};

//validation schema for login model
const validationSchema = yup.object({
   password: yup
      .string()
      .required("Please enter a Password")
      .min(8, "Password must be at least 8 characters long")
      .matches(
         /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
         "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Character"
      )
      .max(50, "The Password must not exceed 50 characters"),

   confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords do not match")
      .required("Please enter a ConfirmPassword")
      .matches(
         /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/,
         "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Character"
      )
      .max(50, "The Password must not exceed 50 characters"),
});

const ResetPassword = ({ isNewAccount }: Props) => {
   const initialValues = {
      password: "",
      confirmPassword: "",
   };
   const isMounted = useRef(true);
   // State for showing spinner
   const [showSpinner, setShowSpinner] = useState(false);
   const [passwordVisible, setPasswordVisible] = useState(false);
   const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
   const [isEmailConfirm, setIsEmailConfirm] = useState<boolean>(false);
   const [isTermsAccepted, setIsTermsAccepted] = useState<boolean>(false);
   const togglePasswordVisibility = () => {
      // setPasswordVisible((prevVisible) => !prevVisible);
      setPasswordVisible(!passwordVisible);
   };
   const toggleConfirmPasswordVisibility = () => {
      // setPasswordVisible((prevVisible) => !prevVisible);
      setConfirmPasswordVisible(!confirmPasswordVisible);
   };
   //hook to redirect to another screen
   const navigate = useNavigate();
   // get userId & code from url link
   const { search } = useLocation();
   const params = new URLSearchParams(search);
   const userId = params.get("userId");
   const code = params.get("code");
   const resetCode = params.get("resetCode");

   useEffect(() => {
      const confirmVerification = async () => {
         try {
            let userDetail: IVerifyEmail = {
               userId: userId ? encodeURIComponent(userId) : "",
               code: code ? encodeURIComponent(code) : "",
            };

            const response = await AuthService.confirmVerification(userDetail);
            if (response.status === HttpStatusCode.OK) {
               // If verification successful, set isEmailConfirm to true to show the form
               setIsEmailConfirm(true);
            }
         } catch (error) {
            console.error("Error in confirmVerification:", error);
            // Handle error if any
         }
      };

      if (userId && code && isNewAccount && isMounted.current) {
         confirmVerification();
         isMounted.current = false;
      }

   }, []);

   /**
    * passing field parameters to api
    * @param formData
    */
   const handleResetPassword = async (values: {
      password: string;
      confirmPassword: string;
   }) => {
      try {
         setShowSpinner(true);
         const { confirmPassword, ...userData } = values;
         let resetPassword: IResetPassword = {
            userId: userId,
            code: resetCode,
            password: values.password,
            isNewAccount: isNewAccount
         };
         const resp = await AuthService.resetPassword(resetPassword);
         if (resp.status === HttpStatusCode.OK) {
            toast.success("Password updated successfully!", {
               position: toast.POSITION.TOP_RIGHT,
            });
            navigate("/login");
         }
      } catch (error) {
      } finally {
         setShowSpinner(false);
      }
   };

   const handleChange = async () => {
      try {
         setIsTermsAccepted(!isTermsAccepted);
      } catch (error) {
      } finally {
      }
   };

   console.log(isNewAccount)

   return (
      <>
         {(isEmailConfirm || !isNewAccount) && (
            <div className={" bg-login bg-center bg-cover bg-no-repeat flex p-3.5"}>
               <div className="p-3.5 sm:p-6 mx-auto max-w-sm my-auto ms-auto bg-white rounded-md md:rounded-xl shadow-lg ">
                  <div className="text-center">
                     <h1 className="block text-xl font-bold text-gray-800 ">
                        {isNewAccount ? "Create Password" : "Reset Password"}
                     </h1>
                     <p className="mt-1.5 text-sm text-gray-600  mb-4 md:mb-5 leading-tight">
                        {isNewAccount
                           ? "Your email has been successfully verified. Login to your account. Please fill in your details to set your account password."
                           : "Please fill your details to set your account password."
                        }
                     </p>
                  </div>
                  {showSpinner ? <Spinner /> : null}
                  <Formik
                     initialValues={initialValues}
                     validationSchema={validationSchema}
                     onSubmit={handleResetPassword}
                  >
                     {(formik) => (
                        <Form className=" flex flex-col ">
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

                           <div className="relative mt-2.5">
                              <FormikControl
                                 control="input"
                                 type={confirmPasswordVisible ? "text" : "password"}
                                 label={"Confirm Password"}
                                 name={"confirmPassword"}
                                 placeholder={"Enter Confirm Password"}
                              />
                              <span className="absolute right-4 top-[32px]">
                                 {confirmPasswordVisible ? (
                                    <FaEye onClick={toggleConfirmPasswordVisibility} />
                                 ) : (
                                    <FaEyeSlash
                                       onClick={toggleConfirmPasswordVisibility}
                                    />
                                 )}
                              </span>
                           </div>
                           {isNewAccount &&
                           <div className="relative mt-3">
                           <label className="h-[28px] inline-flex gap-1.5 items-center text-gray-600 text-[11px] md:text-xs font-medium cursor-pointer"><input
                                    type="checkbox"
                                    name="isTermsAccepted"
                                    onChange={(event) => handleChange()}
                                    checked={isTermsAccepted}
                                 />I agree to the <a href="https://www.connect2court.com/_files/ugd/112fe7_e0e89154c6a243fdb8694d458f284276.pdf" target="_blank" style={{ color: 'blue', textDecoration: 'underline' }}>Terms of Service </a></label>
                           </div>
                           }
                           <div>
                              <Button
                                 title={"Save Password"}
                                 type={"submit"}
                                 isRounded={false}
                                 disabled ={isNewAccount && !isTermsAccepted}
                                 classes=" mt-2.5 w-full py-2.5 px-3.5 inline-flex justify-center items-center gap-x-1.5 text-xs font-semibold rounded-lg border border-transparent bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none   "
                              />
                           </div>

                           <div className="text-center mt-1.5 text-xs text-gray-600 ">
                              <Link
                                 to="/"
                                 className=" ml-0.5 text-blue-600 decoration-2 hover:underline font-medium   "
                              >
                                 Redirect to Login
                              </Link>
                           </div>
                        </Form>
                     )}
                  </Formik>
               </div>
            </div>
         )}
      </>
   );
};

export default ResetPassword;
