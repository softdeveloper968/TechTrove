import React from "react";
import { Field, ErrorMessage } from "formik";
import DatePicker from "react-datepicker";
import TextError from "./TextError";
import "react-datepicker/dist/react-datepicker.css";

// const DatePicker = (props: any) => {
//   // Destructure props to get relevant values
//   const { label, name } = props;

//   return (
//     <>
//       {/* Label for the date picker */}
//       <label className="text-gray-600 text-sm font-medium">{label}</label>

//       {/* Field component from Formik to handle form state */}
//       <Field name={name}>
//         {({ form, field }: any) => {
//           const { value } = field;

//           // Input element for the date picker
//           return (
//             <input
//               type={"date"}
//               {...field}
//               {...props}
//               value={value ?? ""}
//               min={"2000-12-12"}
//               className={`peer placeholder-gray-500 outline-none p-3 block border w-full border-gray-200 rounded-lg text-sm placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none    `}
//             />
//           );
//         }}
//       </Field>

//       {/* Display error message if there is any */}
//       <ErrorMessage name={name} component={TextError} />
//     </>
//   );
// };

// export default DatePicker;

// CustomInputComponent: A reusable input component for use with Formik
const CustomInputComponent = ({
  field,
  form,
  smartFormNameDecoration,
  minDate,
  maxDate,
  ...props
}: any) => {
  const { name, value, onChange, onBlur } = field;
  const inputProps = form.getFieldProps(name);

  return (
    <>
      {smartFormNameDecoration && (
        <p className="mr-2">{smartFormNameDecoration}</p>
      )}
      <DatePicker
        {...props}
        {...inputProps}
        selected={value ? new Date(value) : null}
        onChange={(date) => {
          form.setFieldValue(name, date);
          if (onChange) {
            onChange(name, date);
          }
          if (onBlur) {
            onBlur(name, true);
          }
        }}
        minDate={minDate === null ? minDate : new Date()}
        maxDate={maxDate?maxDate:null}
        dateFormat="MM/dd/yyyy"
        className= {'bg-calendar peer placeholder-gray-500 outline-none p-2.5 !pr-8 block border w-full border-gray-200 rounded-md text-xs placeholder:text-transparent focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none bg-no-repeat bg-[center_right_12px]'
       } />
    </>
  );
};
const Date_Picker = (props: any) => {
  // Destructure props to get relevant values
  const { label, name, value, placeholder, ...rest } = props;
  return (
    <>
      {/* Label for the date picker */}
      <label className="text-gray-600 text-[11px] md:text-xs font-medium">{label}</label>
      {/* Field component from Formik to handle form state */}
      <div className="w-full">
        <Field
          id={name}
          name={name}
          value={value}
          placeholder={placeholder}
          {...rest}
          component={CustomInputComponent}
        ></Field>
        {/* Display error message if there is any */}
        <ErrorMessage name={name} component={TextError} />
      </div>
    </>
  );
};

export default Date_Picker;
