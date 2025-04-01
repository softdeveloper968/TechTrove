import React from "react";
import { ErrorMessage, Field } from "formik";
import arrow from "assets/images/select_arrow.png";
import TextError from "./TextError";
import { ISelectOptions } from "interfaces/late-notices.interface";

// Select component: Custom component for handling select input
const Select = (props: any) => {
  // Destructure props to get relevant values
  const { label, name, options, sublabel, info, defaultOption, optionDisabled, ...rest } =
    props;
  return (
    <div className={`m-0`}>
      {/* Label for the select input */}
      <label htmlFor={name} className="text-gray-600 text-[11px] md:text-xs font-medium">
        {label}
        {/* Optional info span */}
        {info && <span className="ml-2 cursor-pointer">Info</span>}
      </label>

      {/* Field component for handling form state (select input) */}
      <Field
        as="select"
        id={name}
        name={name}
        {...rest}
        style={{
          backgroundImage: `url(${arrow})`,
        }}
        className={`peer outline-none py-2 md:py-2.5 p-2.5 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none disabled:bg-[#fcfcfc] disabled:text-[#a8aeb8] bg-no-repeat bg-[center_right_13px] appearance-none !pr-7`}
      >
        {/* Render default option if provided */}
        {!!defaultOption && (
          <option key={"default"} value={""}>
            Select
          </option>
        )}

        {/* Render options from the options array */}
        {options.map((option: ISelectOptions) => {
          return (
            <option
              key={option.id}
              className="whitespace-pre-line"
              value={option.id}
              disabled={option.disabled ?? false}
            >
              {option.value}
            </option>
          );
        })}
      </Field>

      {/* Display error message if there is any validation error */}
      <ErrorMessage name={name} component={TextError} />
    </div>
  );
};

export default Select;
