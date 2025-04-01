import { Field, ErrorMessage } from "formik";
import TextError from "./TextError";
import dollarImage from "assets/images/dollar-sign.svg";

import React from "react";
type AmountProps = {
  label: string;
  name: string;
  placeholder: string;
  sublabel: string;
  errorMessage: string;
  value: string; // or number, adjust the type according to your needs
  content: string;
  disabled?:boolean;
  // Add any additional props specific to Amount
};

// CustomInputComponent: Custom input component for Amount
const CustomInputComponent = ({
  field,
  form: { touched, errors },
  ...props
}: any) => (
  <>
    <input
      min={0}
      type="number"
      {...field}
      {...props}
      value={field.value}
      style={{
        backgroundImage: `url(${dollarImage})`,
      }}
      disabled={props.disabled}
      className={`peer outline-none p-2 md:p-2.5 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_left_10px] !pl-7  `}
    />
  </>
);

// Amount component: Custom component for handling amount input
const Amount: React.FC<AmountProps> = (props) => {
  // Destructure props to get relevant values
  const {
    label,
    name,
    placeholder,
    sublabel,
    errorMessage,
    value,
    content,
    disabled,
    ...rest
  } = props;

  return (
    <>
      {/* Label for the date picker */}
      <label className="text-gray-600 text-[11px] md:text-xs font-medium ">{label}</label>

      {/* Field component from Formik to handle form state */}
      <Field
        className="w-20 ml-0"
        id={name}
        name={name}
        placeholder={placeholder}
        prefix="$"
        disabled={disabled}
        {...rest}
        component={CustomInputComponent}
      ></Field>

      {/* Display error message if there is any */}
      <ErrorMessage name={name} component={TextError} />

      {/* Additional content */}
      <p className="mt-0 ">{content}</p>
    </>
  );
};

export default Amount;
