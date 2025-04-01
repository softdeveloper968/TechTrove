const validationMessages = {
    username: {
        required: "Please enter a username",
        format: "Invalid username format (eg. abc@example.com)",
    },
    email: {
        required: "Email is required",
        format: "Invalid email format",
        email: "Please enter a valid email"
    },
    password: {
        required: "Please enter a new Password",
        minLength: "Password must be at least 8 characters long",
        pattern: "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number, and One Special Character",
    },
    confirmPassword: {
        required: "Confirm password is required",
        match: "Passwords do not match",
    },
    tenant1First: {
        required: "Please enter tenant1 first name.",
        max:"Tenant1 first name must not exceed 50 characters."
    },
    tenant1MI: {
        max:"Tenant1 middle name must not exceed 50 characters."
    },
    tenant1Last: {
        required: "Please enter tenant1 last name.",
        max:"Tenant1 last name must not exceed 50 characters."
    },
    tenant2First: {
        max:"Tenant2 first name must not exceed 50 characters."
    },
    tenant2MI: {
        max:"Tenant2 middle name must not exceed 50 characters."
    },
    tenant2Last: {
        max:"Tenant2 last name must not exceed 50 characters."
    },
    tenant3First: {
        max:"Tenant3 first name must not exceed 50 characters."
    },
    tenant3MI: {
        max:"Tenant3 middle name must not exceed 50 characters."
    },
    tenant3Last: {
        max:"Tenant3 last name must not exceed 50 characters."
    },
    tenant4First: {
        max:"Tenant4 first name must not exceed 50 characters."
    },
    tenant4MI: {
        max:"Tenant4 middle name must not exceed 50 characters."
    },
    tenant4Last: {
        max:"Tenant4 last name must not exceed 50 characters."
    },
    tenant5First: {
        max:"Tenant5 first name must not exceed 50 characters."
    },
    tenant5MI: {
        max:"Tenant5 middle name must not exceed 50 characters."
    },
    tenant5Last: {
        max:"Tenant5 last name must not exceed 50 characters."
    },
    address: {
        required: "Please enter address",
        min: "Address must be at least 3 characters",
        max: "Address must not exceed 300 characters"
    },
    city: {
        required: "Please enter city",
        max: "City must not exceed 50 characters"
    },
    attorneyName: {
        max: "Attorney name must not exceed 50 characters",
        required: "Please enter attorney name."
    },
    propertyState: {
        required: "Please enter state code.",
        max:"State Code must be of 2 characters."
    },
    stateCode: {
        required: "Please enter state code.",
        max:"State Code must be of 2 characters."
    },
    propertyName: {
        required: "Please enter property name",
        max:"Property Name must not exceed 50 characters"
    },
    zip: {
        required: "Please enter Zip code.",
        min: "Zip code must be 5 digits.",
        max: "Zip code must be 5 digits."
    },
    ownerName: {
        max: "Owner name must not exceed 50 characters"
    },
    reason: {
        required: "Please enter reason",
        max:"Reason must not exceed 50 characters"
    },
    allMonths: {
        max: "All Months must not exceed 50 characters"
    },
    phone: {
        matches: "Please enter a valid phone number"
    },
    filerphone: {
        matches: "Please enter a valid phone number or leave the field empty"
    },
    propertyAddress: {
        required: "Please enter Property Address",
    },
    propertyCity: {
        required: "Please enter Property City",
    },
    filerEmail: {
        required: "Please enter Eviction Filer EMail",
    },
    monthlyRent: {
        required: "Please enter monthly rent",
        testIsCurrency: "isCurrency",
        testValidCurrency: "Monthly rent must be a valid currency amount",
        testMaxAmount:"maxAmount",
        testMonthlyRent:"Monthly rent must be less than or equal to $99999"
    },
    evictionTotalRentDue: {
        required: "Please enter EvictionTotalRentDue",
        testIsCurrency: "isCurrency",
        testValidCurrency: "EvictionTotalRentDue must be a valid currency amount",
        testMaxAmount:"maxAmount",
        testMonthlyRent:"EvictionTotalRentDue must be less than or equal to $99999"
    },
    evictionAffiantIs: {
        required: "Please enter evictionAffiantIs",
    },
    filerBusinessName: {
        required: "Please enter Filer Business Name",
    },
    selectedReason: {
        required: "Please select a reason",
        selectedReason: "selectedReason"
    },
    paymentAmountOwned: {
        testDecimal: "Amount is required (up to two decimal places)",
        testAmount: "Amount must be less than or equal to $99999"
    },
    writApplicantIS: {
        required: "Please select an option",
    },
    otherApplicantIS: {
        required: "Please specify Writ Applicant IS",
    },
    quantity: {
        required: "Quantity is required",
        integer: "Quantity must be an integer",
        max: "Quantity can't exceed 9999"
    },
    maxQuantity: {
        required: "Max Quantity is required",
        integer: "Max Quantity must be an integer",
        max: "Max Quantity can't exceed 9999"
    },
    maxPayment: {
        required: "Max Payment is required"
    },
    countyName: {
        required: "County is required",
        test:"is-not-zero"
    },
    // locationName: {
    //     required: "Location/Court Name is required"
    // },
    locationCode: {
        required: "Location/Court Name is required"
    },
    state: {
        required: "State is required",
        max: "The state must not exceed 50 characters."
    },
    caseTypeCode: {
        required: "Case Type is required"
    },
    // caseTypeName: {
    //     required: "Case Type is required"
    // },
    filingCode: {
        required: "Filing Code is required"
    },
    // filingCodeName: {
    //     required: "Filing Code is required"
    // },
    filingDescription: {
        required: "Filing Description is required"
    },
    lastName: {
        required: "Please enter last name.",
        max: "The Last Name must not exceed 50 characters."
    },
    firstName: {
        required: "Please enter first name.",
        max: "The First Name must not exceed 50 characters."
    },
    streetNo: {
        required: "Please enter street no.",
        max: "The StreetNo must not exceed 50 characters."
    },
    unit: {
        required: "Please enter unit.",
        max: "Unit must not exceed 50 characters."
    },
    caseNo: {
        required: "Please enter Case No.",
    },
    county: {
        required: "Please enter county name.",
        max: "The county name must not exceed 50 characters."
    },
    evictionDateFiled: {
        required: "Please enter eviction date filed.",
        typeError: "Please enter a valid date."
    },
    evictionServiceDate: {
        required: "Please enter eviction service date.",
        typeError: "Please enter a valid date."
    },
    lastDaytoAnswer: {
        required: "Please enter last day to Answer.",
        typeError: "Please enter a valid date."
    },
    courtDate: {
        required: "Please enter court date.",
        typeError: "Please enter a valid date."
    },
    dismissalFileDate: {
        required: "Please enter dismissal file date.",
        typeError: "Please enter a valid date."
    },
    writFileDate: {
        required: "Please enter writ file date.",
        typeError: "Please enter a valid date."
    },
    amendedDate: {
        required: "Please enter amended date.",
        typeError: "Please enter a valid date."
    },
    amendedBy: {
        required: "Please enter amended by.",
        max: "The amended by must not exceed 50 characters."
    },
    evictionAffiantSignature: {
        required: "Please enter eviction affiant signature.",
        max: "The eviction affiant signature must not exceed 50 characters."
    },
    evictionServiceMethod: {
        required: "Please enter eviction service method.",
        max: "The eviction service method must not exceed 50 characters."
    },
    amendmentAffiantSignature: {
        required: "Please enter amendment affiant signature.",
        max: "The amendment affiant signature must not exceed 50 characters."
    },
    referenceId: {
        matches: "Reference ID must contain only digits"
    },
    evictionCourtFee: {
        test: "EvictionCourtFee must be a valid currency amount",
        testAmount: "EvictionCourtFee must be less than or equal to $99999"
    },
    eFileFeeClient: {
        test: "eFileFeeClient must be a valid currency amount",
        testAmount: "eFileFeeClient must be less than or equal to $99999"
    },
    transactionfee: {
        test: "transactionfee must be a valid currency amount",
        testAmount: "transactionfee must be less than or equal to $99999"
    },
    supplementCode: {
      required: "Supplement code name is required"
    },
    supplementDescription: {
      required: "Supplement description is required"
    },
    paymentName: {
        required: "Please enter a payment name",
    },
    hasAttorney: {
        required: "Please specify whether you have an attorney",
    },
    courtType: {
        required: "Court Type is required",
        test: "is-not-zero"
    },
    court: {
        required: "Court is required",
        test: "is-not-zero"
    },
    company: {
        required: "Company is required",
        company: "Please select a company."
    },
    invoiceMonthYear: {
        invoiceMonthYear: "Month selection is required."
    },
    c2CServiceExpFee : {
        required: "Service Exp Fee is required",
    },
    c2CServiceFee: {
        required: "Service Fee is required",
    },
    c2CAddtlTenantsFee: {
        required: "Addtl Tenants Fee is required",
    },
    c2CServiceHouseFee: {
        required: "Service House Fee is required",
    },
    c2CAOSFee: {
        required: "AOS Fee is required",
    },
    c2CDismissalFee: {
        required: "Dismissal Fee is required",
    },
    c2CWritFee: {
        required: "Writ Fee is required",
    },
    evictionAutomationFee: {
        required: "Eviction Automation Fee is required",
    },
    c2CAmendmentFee: {
        required: "Amendment Fee is required",
    },
    c2CAddtlDocFee: {
        required: "Addtl Doc Fee  is required",
    },
    c2COtherFee: {
        required: "Other Fee is required",
    },
    c2CEvictionFee: {
        required: "Eviction Fee is required",
    },
    c2CServiceAddtlTenantsFee: {
        required: "Service Addtl Tenants Fee is required",
    },
    basicRequired: {
        required: "This field is required",
        optionRequired: "Please select an option"
    },
    garnishmentType: {
        required: "Garnishment type is required",
        test: "is-not-zero",
        min: "Garnishment type must be greater than 0"
    },
    sheriffFeeFirstTenant: {
        required: "Sheriff Fee First Tenant is required",
        test: "is-not-zero",
        min: "Sheriff Fee First Tenant must be greater than 0"
    },
    sheriffFeeSecondTenant: {
        required: "Sheriff Fee Second Tenant is required",
        test: "is-not-zero",
        min: "Sheriff Fee Second Tenant must be greater than 0"
    },
    courtFee: {
        required: "Court Fee is required",
        test: "is-not-zero",
        min: "Court Fee  must be greater than 0"
    },
    courtfeeSecondTenant: {
        required: "Court fee Second Tenant is required",
        test: "is-not-zero",
        min: "Court fee Second Tenant must be greater than 0"
    },
    efileFee: {
        required: "Efile Fee is required",
        test: "is-not-zero",
        min: "Efile Fee must be greater than 0"
    },
    garnisefileServiceChargehmentType: {
        required: "Efile Service Charge is required",
        test: "is-not-zero",
        min: "Efile Service Charge must be greater than 0"
    },
    otherEfileCharge: {
        required: "Other Efile Charge Fee is required",
        test: "is-not-zero",
        min: "Other Efile Charge Fee  must be greater than 0"
    },
    courtFeeAndAllOthers: {
        required: "Court Fee And All Others is required",
        test: "is-not-zero",
        min: "Court Fee And All Others  must be greater than 0"
    },
    filingType: {
        required: "Filing Type is required"
    },
};

export default validationMessages;