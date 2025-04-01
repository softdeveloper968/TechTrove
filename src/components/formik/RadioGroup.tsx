// RadioGroup.tsx
import React from "react";
import { ErrorMessage, Field } from "formik";
import TextError from "./TextError";

type RadioGroupProps = {
  label: string;
  name: string;
  options: { id: string; value: string }[];
};

const RadioGroup: React.FC<RadioGroupProps> = ({ label, name, options }) => {
  return (
    <div className="m-0">
      <label htmlFor={name} className="text-gray-600 text-[11px] md:text-xs font-medium">
        {label}
      </label>

      <div role="group" className="flex gap-6">
        {options.map((option) => (
          <div key={option.id} className="flex items-center">
            <Field
              type="radio"
              id={option.id}
              name={name}
              value={option.id}
              className="mr-2"
            />
            <label htmlFor={option.id} className="text-gray-600 text-sm">
              {option.value}
            </label>
          </div>
        ))}
      </div>

      <ErrorMessage name={name} component={TextError} />
    </div>
  );
};

export default RadioGroup;