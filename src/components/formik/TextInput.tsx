import React from "react";
import { Field, ErrorMessage } from "formik";
import TextError from "./TextError";

// Props for the CustomInputComponent
type CustomInputProps = {
  field: {
    name: string;
    type: string;
    value: any; // Adjust the type according to the actual data type
    onBlur: () => void;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  };
  form: {
    touched: Record<string, boolean>;
    errors: Record<string, string>;
  };
  autoFocus: boolean;
  smartFormNameDecoration: string;
  classes?: string;
  disabled:boolean;
};

// Props for the TextInput component
type Props = {
  label: string;
  name: string;
  placeholder?: string;
  errorMessage?: string;
  value: string;
  autoFocus?:boolean;
  disabled?:boolean;
  showAsteric?: boolean;
};

// CustomInputComponent: A reusable input component for use with Formik
const CustomInputComponent = ({
  field,
  form: { touched, errors },
  smartFormNameDecoration,
  ...props
}: CustomInputProps) => (
  <>
    {smartFormNameDecoration && (
      <p className="mr-2">{smartFormNameDecoration}</p>
    )}
    <input
      {...field}
      {...props}
      value={field.value}
      autoFocus={props.autoFocus}
      disabled={props.disabled}
      className={`peer outline-none p-2 md:p-2.5 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none     ${props.classes}`}
    />
  </>
);

// TextInput component: Wraps the Formik Field component, provides label, placeholder, and error handling
const TextInput = (props: Props) => {
  const { label, name, placeholder, errorMessage, value,autoFocus,disabled, showAsteric, ...rest } = props;
  return (
    <>
      <label className="text-gray-600 text-[11px] md:text-xs font-medium" htmlFor={name}>
        {label}
        {showAsteric && (<span className="text-red-600">*</span>)}
      </label>
      <Field
        id={name}
        name={name}
        value={value}
        placeholder={placeholder}
        autoFocus={autoFocus}
        disabled={disabled}
        {...rest}
        component={CustomInputComponent}
      ></Field>

      <ErrorMessage name={name} component={TextError} />
    </>
  );
};

export default TextInput;
