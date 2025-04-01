import * as yup from "yup";

// Custom validation function for County field
const countyValidation = (counties: string[]) => {
   return yup
      .string()
      .max(50, "County must not exceed 50 characters")
      .required("Please enter county")
      .test("valid-county", "County is not supported in C2C or State", (value) => {
         const trimmedValue = value?.trim();
         return trimmedValue ? counties.includes(trimmedValue.toLowerCase()) : true;
      });
};

const CommonValidations = {
   countyValidation
};

export default CommonValidations;