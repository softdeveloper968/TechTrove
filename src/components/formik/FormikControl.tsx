import React from "react";
import InputMask from "react-input-mask";
import { ErrorMessage, useField } from "formik";
import Amount from "./Amount";
import DatePicker from "./DatePicker";
import CheckBox from "./GridCheckBox";
import Select from "./Select";
import Input from "./TextInput";
import FileUpload from "./FileUpload";
import RadioGroup from "./RadioGroup";
import TextError from "./TextError";
import TextareaInput from "./TextareaInput";
import MultiSelect from "./MultiSelect";
// FormikControl component: A dynamic form control renderer for Formik forms
const FormikControl: React.FC<any> = (props) => {
   // Destructure the 'control' prop to determine the type of form control
   const { control, ...rest } = props;
   const [field, meta] = useField(rest);
   // Switch statement to render the appropriate form control based on the 'control' prop
   switch (control) {
      case "input":
         return <Input {...rest} /> // Render the Input component for 'input' control      
      case "checkbox":
         return <CheckBox {...rest} />; // Render the CheckBox component for 'checkbox' control
      case "radio":
         return <RadioGroup {...rest} />; // Render the Radio button component for 'radio' control
      case "date":
         return <DatePicker {...rest}></DatePicker>; // Render the DatePicker component for 'date' control
      case "number":
         return <Amount {...rest}></Amount>// Render the Amount component for 'number' control     
      case "select":
         return <Select {...rest}></Select>; // Render the Select component for 'select' control
      case "multiselect":
         return <MultiSelect {...rest}></MultiSelect>; // Render the Select component for 'multi-select' control
      case "fileUpload":
         return <FileUpload {...rest} />; // Render the FileUpload component for 'upload' control
      case 'maskedInput':
         return (
            <>
               <InputMask
                  className="outline-none p-2.5 block border w-full border-gray-200 rounded-md text-xs focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none   "
                  mask="(999) 999-9999"
                  maskChar=" "
                  placeholder={rest.placeholder}
                  {...field}
                  {...rest}
               />
               <ErrorMessage name={field.name} component={TextError} />
            </>
         );
      case "textarea":
         return <TextareaInput {...rest} />; // Render the textarea component for 'textarea' control
      default:
         return null; // Default case returns null (no matching control found)
   }
};

export default FormikControl;
