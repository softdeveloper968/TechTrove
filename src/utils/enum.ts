import Amendments from "pages/amendments/Amendments";

//handle api status
export enum HttpStatusCode {
  OK = 200,
  Created = 201,
  Accepted = 202,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  InternalServerError = 500,
  BadGateway = 502,
  ServiceUnavailable = 503,
}

//User Roles
export enum UserRole{
  C2CAdmin="C2CAdmin",
  Admin="Admin",
  Signer="Signer",
  NonSigner="NonSigner",
  ProcessServer="ProcessServer",
  Viewer="Viewer",
  WritLabor="WritLabor",
  PropertyManager="PropertyManager",
  ChiefAdmin="ChiefAdmin"
}

// Eviction affidavit of service methods
export enum ServiceMethod {
  TACK_MAIL = "TACK MAIL",
  NOTORIOUSLY = "NOTORIOUSLY",
  PERSONALLY = "PERSONALLY",
  NON_EST = "NON EST",
  INFORMATION_ONLY = "INFORMATION ONLY"
};

export enum FilingType {
   Eviction = "Eviction",
   Amendment = "Amendment",
 };


export enum InvoiceStatus {
   PAID = "Paid",
   OVERDUE = "Overdue",
   PENDING = "Pending"
};

export enum InvoiceEmailStatus {
   NeedToSend = "NeedToSend",
   EmailSent = "EmailSent",
   NotSet = "NotSet"
};

// export enum OperationTypeEnum {
//    Eviction = 1,
//    Dismissal = 2,
//    Writ = 3,
//    Amendment = 4,
//    AOS = 5,
//    map
// };

export enum OperationTypeEnum {
   Eviction = 1,
   Dismissal = 2,
   Writ = 3,
   Amendment = 4,
   AOS = 5,
};

export enum CourtDecisionEnum {
   Accepted,
   Rejected
};

export enum AOSStatusEnum {
   NeedToSend = 1,
   EmailSent,
   EmailResent,
   Modified,
   Signed
};

// Assuming DismissalReasonEnum is an enum imported from your C# code
export enum DismissalReasonEnum {
   Satisfied = 0,
   WithPrejudice = 1,
   WithoutPrejudice = 2
}

// Define a mapping from the string reasons to the enum values
export const dismissalReasonToEnumMap: Record<string, DismissalReasonEnum> = {
   "Satisfied": DismissalReasonEnum.Satisfied,
   "With Prejudice": DismissalReasonEnum.WithPrejudice,
   "Without Prejudice": DismissalReasonEnum.WithoutPrejudice
};

export enum AttatchmentTypeEnum {
   Writ = "Writ",
   Eviction = "Eviction",
   WritStamped = "WritStamped",
   Amendment = "Amendment",
   AOS = "AOS"
}

export enum StateTypeEnum {
   GA = "GA",
   NV = "NV",
   TX = "TX"
}