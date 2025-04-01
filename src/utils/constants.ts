import { IHomeScreenLinks, IRouteLinks } from "interfaces/route.interface";
import {
   ILateNoticesButton,
   ISelectOptions,
} from "interfaces/late-notices.interface";
import { IFileEvictionsButton } from "interfaces/file-evictions.interface";
import { IWritsOfPossessionButton } from "interfaces/writs-of-possession.interface";
import { IDismissalsButton } from "interfaces/dismissals.interface";
import { IAmendmentsButton } from "interfaces/amendments.interface";
import { IAllCasesButton } from "interfaces/all-cases.interface";
import { IRadioOption } from "interfaces/tyler.interface";
import { IProcessServerButton } from "interfaces/process-server.interface";
import { IEvictionAutomationButton } from "interfaces/eviction-automation.interface";
import { IEvictionQueueButton } from "interfaces/eviction-queue.intreface";
import { ICommonSelectOptions } from "interfaces/common.interface";
import truckServices from "assets/svg/truck-fast-solid.svg";
import { UserRole } from "./enum";
import { IFileEvictionTXButtons } from "interfaces/file-evictions-tx.interface";

// for routing links on the side bar
export const routeLinks: IRouteLinks[] = [
   {
      title: "Home",
      to: "home",
      access: [
         UserRole.C2CAdmin,
         UserRole.Admin,
         UserRole.NonSigner,
         UserRole.ProcessServer,
         UserRole.Signer,
         UserRole.Viewer,
         UserRole.WritLabor,
         UserRole.ChiefAdmin
         // UserRole.PropertyManager
      ],
      states: ["GA", "NV", "TX"]
   },
   {
      title: "Check Case Status",
      to: "check-case-status",
      access: [
         UserRole.C2CAdmin,
         UserRole.Admin,
         UserRole.NonSigner,
         UserRole.Signer,
         UserRole.Viewer,
         UserRole.ChiefAdmin
      ],
      states: ["GA", "TX"]
   },
   {
      title: "Notices",
      to: "notices",
      access: [
         UserRole.C2CAdmin,
         UserRole.Admin,
         UserRole.Signer,
         UserRole.ProcessServer,
         UserRole.PropertyManager,
         UserRole.NonSigner,
         UserRole.ChiefAdmin
      ],
      states: ["NV"]
   },
   {
      title: "File Eviction",
      to: "file-eviction",
      access: [
         UserRole.C2CAdmin,
         UserRole.Admin,
         UserRole.NonSigner,
         UserRole.Signer,
         UserRole.Viewer,
         UserRole.PropertyManager,
         UserRole.ChiefAdmin
      ],
      states: ["GA"]
   },
   {
      title: "File Eviction",
      to: "nv-file-eviction",
      access: [
         UserRole.C2CAdmin,
         UserRole.Admin,
         UserRole.NonSigner,
         UserRole.Signer,
         UserRole.Viewer,
         UserRole.ChiefAdmin
      ],
      states: ["NV"]
   },
   {
      title: "File Eviction",
      to: "tx-file-eviction",
      access: [
         UserRole.C2CAdmin,
         UserRole.Admin,
         UserRole.NonSigner,
         UserRole.Signer,
         UserRole.Viewer,
         UserRole.ChiefAdmin
      ],
      states: ["TX"]
   },
   {
      title: "All Cases",
      to: "all-cases",
      access: [
         UserRole.C2CAdmin,
         UserRole.Admin,
         UserRole.NonSigner,
         UserRole.Signer,
         UserRole.Viewer,
         UserRole.ChiefAdmin
      ],
      states: ["GA", "TX"]
   },
   {
      title: "Single Payments",
      to: "single-payment",
      access: [
         UserRole.C2CAdmin,
         UserRole.ChiefAdmin
      ],
      states: ["GA"]
   },
   {
      title: "Cases Queue Management",
      to: "queue-management",
      access: [
         UserRole.C2CAdmin,
         UserRole.ChiefAdmin
      ],
      states: ["GA"]
   },
   {
      title: "Service Tracker",
      to: "service-tracker",
      access: [
         UserRole.C2CAdmin,
         UserRole.ChiefAdmin
      ],
      states: ["GA"]
   },
   {
      title: "Writs of Possession",
      to: "writs-of-possession",
      access: [
         UserRole.C2CAdmin,
         UserRole.ChiefAdmin,
         UserRole.Admin,
         UserRole.WritLabor,
         UserRole.NonSigner,
         UserRole.Signer,
         UserRole.Viewer,
      ],
      states: ["GA"]
   },
   {
      title: "Dismissals",
      to: "dismissals",
      access: [
         UserRole.C2CAdmin,
         UserRole.Admin,
         UserRole.NonSigner,
         UserRole.Signer,
         UserRole.Viewer,
         UserRole.PropertyManager,
         UserRole.ChiefAdmin
      ],
      states: ["GA"]
   },
   {
      title: "Dismissals",
      to: "nv-dismissals",
      access: [
         UserRole.C2CAdmin,
         UserRole.Admin,
         UserRole.NonSigner,
         UserRole.Signer,
         UserRole.Viewer,
         UserRole.ChiefAdmin
      ],
      states: ["NV"]
   },
   {
      title: "Amendments",
      to: "amendments",
      access: [
         UserRole.C2CAdmin,
         UserRole.Admin,
         UserRole.NonSigner,
         UserRole.Signer,
         UserRole.Viewer,
         UserRole.ChiefAdmin
      ],
      states: ["GA"]
   },
   {
      title: "Process Server",
      to: "process-server",
      access: [
         UserRole.C2CAdmin,
         UserRole.ProcessServer,
         UserRole.ChiefAdmin
      ],
      states: ["GA"]
   },
   // {
   //   title: "AOS in Queue",
   //   to: "aos-queue",
   //   access: [
   //     UserRole.C2CAdmin,
   //   ]
   // },
   {
      title: "Process Queue",
      to: "process-queue",
      access: [
         UserRole.C2CAdmin,
         UserRole.ChiefAdmin
      ],
      states: ["GA","TX"]
   },
   {
      title: "Filing Transactions",
      to: "filing-transactions",
      access: [
         UserRole.C2CAdmin,
         UserRole.ChiefAdmin
      ],
      states: ["GA","TX"]
   },
   {
      title: "Eviction Automation",
      to: "eviction-automation",
      access: [
         UserRole.C2CAdmin,
         UserRole.ChiefAdmin
         // UserRole.Admin,

      ],
      states: ["GA", "NV","TX"]
   },
   {
      title: "Logs",
      to: "logs",
      access: [
         UserRole.C2CAdmin,
         UserRole.ChiefAdmin
      ],
      states: ["GA"]
   },
];

// home page links
export const homeScreenLinks: IHomeScreenLinks[] = [
   {
      title: "Notices",
      to: "/notices",
      image: "",
      access: [
         UserRole.C2CAdmin,
         UserRole.Admin,
         UserRole.NonSigner,
         UserRole.ProcessServer,
         UserRole.Signer,
         UserRole.Viewer,
         UserRole.WritLabor,
         UserRole.PropertyManager,
         UserRole.ChiefAdmin
      ],
      states: ["NV"]
   },
   {
      title: "File Eviction",
      to: "/file-eviction",
      image: "",
      access: [
         UserRole.C2CAdmin,
         UserRole.Admin,
         UserRole.NonSigner,
         UserRole.ProcessServer,
         UserRole.Signer,
         UserRole.Viewer,
         UserRole.WritLabor,
         UserRole.ChiefAdmin
      ],
      states: ["GA"]
   },
   {
      title: "Writs of Possession",
      to: "/writs-of-possession",
      image: "",
      access: [
         UserRole.C2CAdmin,
         UserRole.Admin,
         UserRole.NonSigner,
         UserRole.ProcessServer,
         UserRole.Signer,
         UserRole.Viewer,
         UserRole.WritLabor,
         UserRole.ChiefAdmin
      ],
      states: ["GA"]
   },
   {
      title: "File Dismissals",
      to: "/dismissals",
      image: "",
      access: [
         UserRole.C2CAdmin,
         UserRole.Admin,
         UserRole.NonSigner,
         UserRole.ProcessServer,
         UserRole.Signer,
         UserRole.Viewer,
         UserRole.WritLabor,
         UserRole.ChiefAdmin
      ],
      states: ["GA"]
   },
   {
      title: "Amendments",
      to: "/amendments",
      image: "",
      access: [
         UserRole.C2CAdmin,
         UserRole.Admin,
         UserRole.NonSigner,
         UserRole.ProcessServer,
         UserRole.Signer,
         UserRole.Viewer,
         UserRole.WritLabor,
         UserRole.ChiefAdmin
      ],
      states: ["GA"]
   },
   {
      title: "Track Services",
      to: "/service-tracker",
      image: truckServices,
      access: [
         UserRole.C2CAdmin,
         UserRole.Admin,
         UserRole.NonSigner,
         UserRole.ProcessServer,
         UserRole.Signer,
         UserRole.Viewer,
         UserRole.WritLabor,
         UserRole.ChiefAdmin
      ],
      states: ["GA"]
   },
   {
      title: "File Eviction",
      to: "/tx-file-eviction",
      image: "",
      access: [
         UserRole.C2CAdmin,
         UserRole.Admin,
         UserRole.NonSigner,
         UserRole.ProcessServer,
         UserRole.Signer,
         UserRole.Viewer,
         UserRole.WritLabor,
         UserRole.ChiefAdmin
      ],
      states: ["TX"]
   },
   {
      title: "File Eviction",
      to: "/nv-file-eviction",
      image: "",
      access: [
         UserRole.C2CAdmin,
         UserRole.Admin,
         UserRole.NonSigner,
         UserRole.ProcessServer,
         UserRole.Signer,
         UserRole.Viewer,
         UserRole.WritLabor,
         UserRole.ChiefAdmin
      ],
      states: ["NV"]
   },
   {
      title: "File Dismissals",
      to: "/nv-dismissals",
      image: "",
      access: [
         UserRole.C2CAdmin,
         UserRole.Admin,
         UserRole.NonSigner,
         UserRole.ProcessServer,
         UserRole.Signer,
         UserRole.Viewer,
         UserRole.WritLabor,
         UserRole.ChiefAdmin
      ],
      states: ["NV"]
   }
];

// need to remove this once i get data from api;
export const checkCaseStatusGrid: any = [
   {
      id: 1,
      name: "mehak",
      test: "sadsad",
      test2: "test2",
      test3: "test3",
      county: "CLAYTON",
   },
   {
      id: 2,
      name: "mehak test",
      test: "sadsad ssdsdsdsd",
      test2: "test2 wffdsfsdf",
      test3: "test3 sdsdsd",
      county: "CLAYTON",
   },
   {
      id: 3,
      name: "mehak test 1",
      test: "sadsad ssdsdsdsd",
      test2: "test2 wffdsfsdf",
      test3: "test3 dfdfdfdf",
      county: "CLAYTON",
   },
   {
      id: 1,
      name: "mehak",
      test: "sadsad",
      test2: "test2",
      test3: "test3",
      county: "CLAYTON",
   },
   {
      id: 1,
      name: "mehak",
      test: "sadsad",
      test2: "test2",
      test3: "test3",
      county: "CLAYTON",
   },
   {
      id: 1,
      name: "mehak",
      test: "sadsad",
      test2: "test2",
      test3: "test3",
      county: "COBB",
   },
   {
      id: 1,
      name: "mehak",
      test: "sadsad",
      test2: "test2",
      test3: "test3",
      county: "COBB",
   },
   {
      id: 1,
      name: "mehak",
      test: "sadsad",
      test2: "test2",
      test3: "test3",
      county: "CLAYTON",
   },
   {
      id: 1,
      name: "mehak",
      test: "sadsad",
      test2: "test2",
      test3: "test3",
      county: "FULTON",
   },
   {
      id: 1,
      name: "mehak",
      test: "sadsad",
      test2: "test2",
      test3: "test3",
      county: "FULTON",
   },
   {
      id: 2,
      name: "mehasdasdak",
      test: "sadsad",
      test2: "test2",
      test3: "test3",
      county: "FULTON",
   },
   {
      id: 2,
      name: "mehdfsdfsdfak",
      test: "sadsad",
      test2: "test2",
      test3: "test3",
      county: "FULTON",
   },
   {
      id: 3,
      name: "mehakssdsd",
      test: "sadsad",
      test2: "test2",
      test3: "test3",
      county: "FULTON",
   },
   {
      id: 4,
      name: "mehsdfsdfak",
      test: "sadsad",
      test2: "test2",
      test3: "test3",
      county: "FULTON",
   },
   {
      id: 5,
      name: "merwerewerwerhaerwerk",
      test: "sadsad",
      test2: "test2",
      test3: "test3",
      county: "FULTON",
   },
   {
      id: 1,
      name: "mehak",
      test: "sadsad",
      test2: "test2",
      test3: "test3",
      county: "GWINNETT",
   },
   {
      id: 1,
      name: "mehak12",
      test: "sadsad",
      test2: "test2",
      test3: "test3",
      county: "FULTON",
   },
   {
      id: 2,
      name: "mehak242",
      test: "sadsad",
      test2: "test2",
      test3: "test3",
      county: "GWINNETT",
   },
];

// CountyList
export const CountyList: string[] = [
   "Cobb",
   "Clayton",
   "Dekalb",
   "Fulton",
   "Gwinnett",
];

// CountyList
export const CountyListExternalLink: ISelectOptions[] = [
   {
      id: "https://courtconnect.cobbcounty.org:4443/ccmag/ck_public_qry_doct.cp_dktrpt_setup_idx",
      value: "Cobb",
   },
   {
      id: "https://www.claytoncountyga.gov/government/courts/court-case-inquiry",
      value: "Clayton",
   },
   { id: "https://portal-gadekalb.tylertech.cloud/portal", value: "Dekalb" },
   // {
   //    id: "https://publicrecordsaccess.fultoncountyga.gov/Portal/",
   //    value: "Fulton",
   // },
   {
      id: "https://researchga.tylerhost.net/CourtRecordsSearch/Home#!/home",
      value: "Fulton",
   },
   { id: "https://odyssey.gwinnettcourts.com/Portal/", value: "Gwinnett" },

];

export const CountyListExternalLinkTX: ISelectOptions[] = [  
   { 
      id: "http://www.jp.hctx.net/services.htm#gsc.tab=0",
      value: "Harris"
   },   
];

export const CountyLists: ISelectOptions[] = [
   { id: "Cobb", value: "Cobb" },
   { id: "Clayton", value: "Clayton" },
   { id: "Dekalb", value: "Dekalb" },
   { id: "Fulton", value: "Fulton" },
   { id: "Gwinnett", value: "Gwinnett" },
];

export const LateNoticesButtonsList: ILateNoticesButton[] = [
   // {
   //    title: "New",
   //    icon: "FaPlus",
   //    classes:
   //       "bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 md:px-4 py-2 font-medium text-[12px] md:text-[13px] text-white rounded-md	 shadow-lg ml-1 md:ml-2 inline-flex items-center mb-1",
   // },
   {
      title: "Import Data",
      icon: "FaFileExcel",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded	 shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Create Notices",
      icon: "FaEdit",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 py-1.5 font-medium text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1",
   },
   // {
   //   title: "Delete",
   //   icon: "FaTrash",
   //   classes:
   //     "bg-[#E61818] hover:bg-[#d13c3c] px-3.5 md:px-4 py-2 font-medium text-[12px] md:text-[13px] text-white rounded-md	 shadow-lg ml-2 inline-flex items-center mb-1",
   // },
   {
      title: "Sign Proofs",
      icon: "FaFileSignature",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded	 shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   // {
   //    title: "Download Documents",
   //    icon: "FaFilePdf",
   //    classes:
   //       "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded	 shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold ",
   // },
   {
      title: "Confirm Notices",
      icon: "FaEdit",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold ",
   },
   {
      title: "Confirm for Eviction",
      icon: "FaPlus",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold ",
   },
   {
      title: "Dismiss",
      icon: "FaPlus",
      classes:
         "bg-[#E61818] hover:bg-[#d13c3c] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
];

//
export const LateNotices_ImportCSV: string[] = [
   "First Name",
   "Last Name",
   "Street",
   "Address",
   "City",
   "Unit",
   "Zip",
   "State",
   "Document",
   "Total Rent",
   "Property",
   "Notice Period",
   "Other Fees",
   "Delivered By",
   "Service Method",
   "Late Fees",
   "Total Due",
   "Delivered To",
   "Notice Affiant",
   "Notice Date",
   "Delivery Date",
   "Late fees Date",
];

export const LateNoticesGridHeading: string[] = [
   "isChecked",
   "id",
   "First Name",
   "Last Name",
   "Street",
   "Address",
   "City",
   "Unit",
   "Zip",
   "State",
   "Document",
   "Total Rent",
   "Property",
   "Notice Period",
   "Other Fees",
   "Total Demands",
   "Delivered By",
   "Service Method",
   "Late Fees",
   "Total Due",
   "Delivered To",
   "Notice Affiant",
   "Notice Date",
   "Delivery Date",
   "Late Fees Date",
];

//
export const LateNotices_SignProof: string[] = [
   "methodOfDelivery",
   "notes",
   "signature",
   "noticePDFs",
   "propertyName",
   "tenentFirst",
   "tenentLast",
   "tenantUnit",
   "tenantStreetNo",
   "tenantAddress",
   "tenantCity",
   "tenantState",
   "tenantZip",
   "noticeDate",
   "noticeAffiantSignature",
   "noticeProofSignature",
   "noticeDeliveryDate",
   "noticeServiceMethod",
   "noticePeriod",
   "noticeTotalRentDue",
   "noticeOtherFees",
   "noticeTotalDue",
   "noticeLateFees",
   "noticeLateFeeDate",
   "noticeDeliveredToName",
];

export const MethodOfDeliveryOptions: ISelectOptions[] = [
   {
      id: 0,
      value: "By posting at a conspicuous place near the premises",
   },
   {
      id: 1,
      value: "By delivering a copy to the tenant personally",
   },
   { id: 2, value: "By delivering a true copy to" },
];

export const FileEvictionsButtonsList: IFileEvictionsButton[] = [
   //   {
   //     title: "New",
   //     icon: "FaPlus",
   //     classes:
   //       "bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 md:px-4 py-2 font-medium text-[12px] md:text-[13px] text-white rounded-md	 shadow-lg ml-1 md:ml-2 inline-flex items-center mb-1",
   //   },
   {
      title: "Import Data",
      icon: "FaFileExcel",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold font-semibold",
   },
   {
      title: "Review & Sign",
      icon: "FaFileSignature",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded	 shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold font-semibold",
   },
   // {
   //   title: "Verify Address",
   //   icon: "FaCheck",
   //   classes:
   //     "bg-[#2472db] opacity-55 hover:bg-[#0d5ecb] px-3.5 md:px-4 py-2 font-medium text-[12px] md:text-[13px] text-white rounded-md	 shadow-lg  ml-1 md:ml-2 inline-flex items-center mb-1",
   // },
   {
      title: "Confirm",
      icon: "FaEdit",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-4 px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Edit",
      icon: "FaEdit",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold font-semibold",
   },
   {
      title: "Delete",
      icon: "FaTrash",
      classes:
         "bg-[#E61818] hover:bg-[#d13c3c] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold font-semibold",
   },
   // {
   //   title: "Download Documents",
   //   icon: "FaFilePdf",
   //   classes:
   //     "bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 md:px-4 py-2 font-medium text-[12px] md:text-[13px] text-white rounded-md	 shadow-lg ml-1 md:ml-2 inline-flex items-center mb-1 ",
   // },

];

export const FilingTransactionButtonsList: IFileEvictionsButton[] = [

   {
      title: "Edit",
      icon: "FaEdit",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Export CSV",
      icon: "FaFileExport",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "ReImport Data",
      icon: "FaFileExcel",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },

];

export const FileEvictions: string[] = [
   "propertyName",
   "address",
   "county",
   "firstName",
   "lastName",
   "unit",
   "streetNo",
   "city",
   "state",
   "zip",
   "dismissalFileDate",
   "evictionDateFiled",
   "answerBy",
   "courtDate",
   "writFileDate",
   "attorneyName",
   "ownerName",
   "reason",
   "monthlyRent",
   "totalRentDue",
   "evictionOtherFee",
   "evictionAffiantIs",
   "evictionAffiantSignDate",
   "evictionAffiantSignature",
];

export const FileEvictionsGridHeading: string[] = [
   "isChecked",
   "id",
   ...FileEvictions,
];

export const WritsOfPossessionButtonsList: IWritsOfPossessionButton[] = [

   {
      title: "Remove from List",
      icon: "FaRegWindowClose",
      classes:
         "bg-[#E61818] hover:bg-[#d13c3c] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Review & Sign",
      icon: "FaFileSignature",
      classes:
         "bg-[#2472db] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Edit Writs",
      icon: "",
      classes:
         "bg-[#2472db] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
];

export const DimissalsButtonsList: IDismissalsButton[] = [

   {
      title: "Remove from List",
      icon: "FaRegWindowClose",
      classes:
         "bg-[#E61818] hover:bg-[#d13c3c] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Review & Sign",
      icon: "FaFileSignature",
      classes:
         "bg-[#2472db] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Confirm",
      icon: "FaFileSignature",
      classes:
         "bg-[#2472db] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
];

export const AmendmentsButtonsList: IAmendmentsButton[] = [

   {
      title: "Remove from List",
      icon: "FaRegWindowClose",
      classes:
         "bg-[#E61818] hover:bg-[#d13c3c] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Review & Sign",
      icon: "FaFileSignature",
      classes:
         "bg-[#2472db] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
];

export const AllCases: string[] = [
   "Status",
   "Case No",
   "EvictionPDFs",
   "Property Name",
   "County",
   "First Name",
   "Last Name",
   "Unit",
   "Street No",
   "Address",
   "City",
   "State",
   "Zip",
   "Eviction Date Filed",
   "Eviction Service Date",
   "Last Day to Answer",
   "Eviction Service Method",
   "Court Date",
   "Dismissal File Date",
   "Writ File Date",
   "Attorney Name",
   "Eviction Affiant Signature",
   "Answer Date",
   "Writ Sign Date",
   "Notice Count",
   "Eviction Count",
   "Amendment Affiant Signature",
   "Amended By",
   //"Case Count",
];

export const AllCasesSnapshot: string[] = [
   "County",
   "PropertyName",
   "TenantOne",
   "TenantAddressCombined",
   "CaseNo",
   "IssueDate",
   "EvictionServiceDate",
   "EvictionLastDayToAnswer",
   "EvictionServiceMethod",
   "AnswerDate",
   "WritFiledDate",
   "DismissalFileDate",
   "ClientReferenceId"
];
export const AllCasesGridHeading: string[] = ["isChecked", "id", ...AllCases];

export const AllCaseButtonsList: IAllCasesButton[] = [
   {
      title: "Import Data",
      icon: "FaFileExcel",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold font-semibold",
   },
   {
      title: "File Dismissals",
      icon: "FaPlus",
      classes:
         "bg-[#4DB452] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "File Writs",
      icon: "FaPlus",
      classes:
         "bg-[#E61818] hover:bg-[#d13c3c] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold font-semibold",
   },
   {
      title: "File Amendments",
      icon: "FaPlus",
      classes:
         "bg-[#FF914D] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Remove from List",
      icon: "FaRegWindowClose",
      classes:
         "bg-[#E61818] hover:bg-[#d13c3c] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
];

// ReasonList
// export const ReasonList: ISelectOptions[] = [
//    {
//       id: "With Prejudice",
//       value: "With Prejudice",
//    },
//    {
//       id: "Without Prejudice",
//       value: "Without Prejudice",
//    },
//    {
//       id: "Satisfied",
//       value: "Satisfied"
//    },
// ];
export const ReasonList: ISelectOptions[] = [
   {
      id: "Satisfied",
      value: "Satisfied"
   },
   {
      id: "With Prejudice",
      value: "With Prejudice",
   },
   {
      id: "Without Prejudice",
      value: "Without Prejudice",
   },
];

// export const WritsReasonList: ISelectOptions[] = [
//    {
//       id: '0',
//       value: "File his/her answer, and Plaintiff has not accepted money",
//    },
//    {
//       id: '1',
//       value: "Comply with the Order of this Court in that payments were missed, and plaintiff has not accepted money after that date",
//    },
//    {
//       id: '2',
//       value: "Pursuant to court’s order and plaintiff has not accepted money in the interim"
//    },
// ];
export const WritsReasonList: ISelectOptions[] = [
   {
      id: '0',
      value: "File his/her answer, and Plaintiff has not accepted money",
   },
   {
      id: '1',
      value: "Comply with the Order of this Court in that payments were missed, and plaintiff has not accepted money after that date",
   },
   {
      id: '2',
      value: "Pursuant to court’s order and plaintiff has not accepted money in the interim"
   },
];

export const WritApplicantISList: ISelectOptions[] = [
   {
      id: 'Agent',
      value: "Agent",
   },
   {
      id: 'Attorney',
      value: "Attorney",
   },
   {
      id: 'Owner',
      value: "Owner"
   },
   {
      id: 'Other',
      value: "Other"
   },
];

export const WritLabourList: ISelectOptions[] = [
   {
      id: 'Test User 1',
      value: "Test User 1",
   },
   {
      id: 'Test User 2',
      value: "Test User 2",
   },
   {
      id: 'Test User 3',
      value: "Test User 3"
   },
];

export const RolesList: ISelectOptions[] = [
   {
      id: "ChiefAdmin",
      value: "Chief Admin",
   },
   {
      id: "Admin",
      value: "Admin",
   },
   { id: "Signer", value: "Signer" },
   {
      id: "NonSigner",
      value: "Non Signer",
   },

   { id: "Viewer", value: "Viewer" },
   { id: "ProcessServer", value: "Process Server" },
   // { id: "WritLabor", value: "Writ Labor" },
   // { id: "PropertyManager", value: "Property Manager" },
];

export const StateCode = [
   { id: "AL", value: "AL" },
   { id: "AK", value: "AK" },
   { id: "AZ", value: "AZ" },
   { id: "AR", value: "AR" },
   { id: "CA", value: "CA" },
   { id: "CO", value: "CO" },
   { id: "CT", value: "CT" },
   { id: "DE", value: "DE" },
   { id: "FL", value: "FL" },
   { id: "GA", value: "GA" },
   { id: "HI", value: "HI" },
   { id: "ID", value: "ID" },
   { id: "IL", value: "IL" },
   { id: "IN", value: "IN" },
   { id: "IA", value: "IA" },
   { id: "KS", value: "KS" },
   { id: "KY", value: "KY" },
   { id: "LA", value: "LA" },
   { id: "ME", value: "ME" },
   { id: "MD", value: "MD" },
   { id: "MA", value: "MA" },
   { id: "MI", value: "MI" },
   { id: "MN", value: "MN" },
   { id: "MS", value: "MS" },
   { id: "MO", value: "MO" },
   { id: "MT", value: "MT" },
   { id: "NE", value: "NE" },
   { id: "NV", value: "NV" },
   { id: "NH", value: "NH" },
   { id: "NJ", value: "NJ" },
   { id: "NM", value: "NM" },
   { id: "NY", value: "NY" },
   { id: "NC", value: "NC" },
   { id: "ND", value: "ND" },
   { id: "OH", value: "OH" },
   { id: "OK", value: "OK" },
   { id: "OR", value: "OR" },
   { id: "PA", value: "PA" },
   { id: "RI", value: "RI" },
   { id: "SC", value: "SC" },
   { id: "SD", value: "SD" },
   { id: "TN", value: "TN" },
   { id: "TX", value: "TX" },
   { id: "UT", value: "UT" },
   { id: "VT", value: "VT" },
   { id: "VA", value: "VA" },
   { id: "WA", value: "WA" },
   { id: "WV", value: "WV" },
   { id: "WI", value: "WI" },
   { id: "WY", value: "WY" },
];
export const usStates = [
   { id: "Alabama", value: "AL" },
   { id: "Alaska", value: "AK" },
   { id: "Arizona", value: "AZ" },
   { id: "Arkansas", value: "AR" },
   { id: "California", value: "CA" },
   { id: "Colorado", value: "CO" },
   { id: "Connecticut", value: "CT" },
   { id: "Delaware", value: "DE" },
   { id: "Florida", value: "FL" },
   { id: "Georgia", value: "GA" },
   { id: "Hawaii", value: "HI" },
   { id: "Idaho", value: "ID" },
   { id: "Illinois", value: "IL" },
   { id: "Indiana", value: "IN" },
   { id: "Iowa", value: "IA" },
   { id: "Kansas", value: "KS" },
   { id: "Kentucky", value: "KY" },
   { id: "Louisiana", value: "LA" },
   { id: "Maine", value: "ME" },
   { id: "Maryland", value: "MD" },
   { id: "Massachusetts", value: "MA" },
   { id: "Michigan", value: "MI" },
   { id: "Minnesota", value: "MN" },
   { id: "Mississippi", value: "MS" },
   { id: "Missouri", value: "MO" },
   { id: "Montana", value: "MT" },
   { id: "Nebraska", value: "NE" },
   { id: "Nevada", value: "NV" },
   { id: "New Hampshire", value: "NH" },
   { id: "New Jersey", value: "NJ" },
   { id: "New Mexico", value: "NM" },
   { id: "New York", value: "NY" },
   { id: "North Carolina", value: "NC" },
   { id: "North Dakota", value: "ND" },
   { id: "Ohio", value: "OH" },
   { id: "Oklahoma", value: "OK" },
   { id: "Oregon", value: "OR" },
   { id: "Pennsylvania", value: "PA" },
   { id: "Rhode Island", value: "RI" },
   { id: "South Carolina", value: "SC" },
   { id: "South Dakota", value: "SD" },
   { id: "Tennessee", value: "TN" },
   { id: "Texas", value: "TX" },
   { id: "Utah", value: "UT" },
   { id: "Vermont", value: "VT" },
   { id: "Virginia", value: "VA" },
   { id: "Washington", value: "WA" },
   { id: "West Virginia", value: "WV" },
   { id: "Wisconsin", value: "WI" },
   { id: "Wyoming", value: "WY" },
];
export const tabMappings = [
   {
      index: 0,
      tabName: "county",
      path: "/settings/county"
   },
   {
      index: 1,
      tabName: "court",
      path: "/settings/court"
   },
   {
      index: 2,
      tabName: "writ-labor",
      path: "/settings/writ-labor",
   },
   {
      index: 3,
      tabName: "tyler-logins",
      path: "/settings/tyler-logins",
   },
   {
      index: 4,
      tabName: "tyler-config",
      path: "/settings/tyler-config",
   },
   {
      index: 5,
      tabName: "process-server",
      path: "/settings/process-server",
   },
   {
      index: 6,
      tabName: "notary-config",
      path: "/settings/notary-config",
   },
   {
      index: 7,
      tabName: "cobb-users",
      path: "/settings/cobb-users",
   },
   {
      index: 8,
      tabName: "process-server-documents",
      path: "/settings/process-server-documents",
   },
   {
      index: 9,
      tabName: "filing-type",
      path: "/settings/filing-type",
   },
   {
      index: 10,
      tabName: "attorney",
      path: "/settings/attorney",
   },
];
export const accountingTabMappings = [
   {
      index: 0,
      tabName: "dashboard",
      path: "/accounting/dashboard",
   },
   {
      index: 1,
      tabName: "wallets",
      path: "/accounting/wallet",
   },
   {
      index: 2,
      tabName: "transaction",
      path: "/accounting/transaction",
   },
   {
      index: 3,
      tabName: "billing",
      path: "/accounting/billing",
   },
   {
      index: 4,
      tabName: "invoices",
      path: "/accounting/invoices",
   },
   // {
   //    index: 4,
   //    tabName: "customers",
   //    path: "/accounting/customers",
   // },
   {
      index: 5,
      tabName: "eviction-court-sheriff-fees",
      path: "/accounting/eviction-court-sheriff-fees",
   },
   {
      index: 6,
      tabName: "c2c-fees",
      path: "/accounting/c2c-fees"
   },
   {
      index: 7,
      tabName: "garnishment-court-and-sheriff-fees",
      path: "/accounting/garnishment-court-and-sheriff-fees",
   },
];


// export const StatusList = [
//    { id: "Submitted", value: "Submitted" },
//    { id: "Served", value: "Served" },
//    { id: "Check for Writ", value: "Check for Writ" },
//    { id: "Answered", value: "Answered" },
//    { id: "Writ Applied For", value: "Writ Applied For" },
//    { id: "Dismissal Applied For", value: "Dismissal Applied For" },
//    { id: "Amended", value: "Amended" },
// ];
// 
 // this status list is in the order which we want it to be appeared
 export const StatusList = [
   { id: "Submitted", value: "Submitted" },
   { id: "Served", value: "Served" },
   { id: "Answered", value: "Answered" },
   { id: "Check for Writ", value: "Check for Writ" },
   { id: "Writ Applied for", value: "Writ Applied for" },
   { id: "Amended", value: "Amended" },
   { id: "Dismissal Applied for", value: "Dismissal Applied for" },
   { id: "Previous System", value: "Previous System" },
 ];

export const FilingBlankTypeList = [
   { id: "DatePaid", value: "DatePaid" },
   { id: "InvoiceNo", value: "InvoiceNo" },
   { id: "PayrollDate", value: "PayrollDate" },
   { id: "CommissionDate", value: "CommissionDate" },
   { id: "ServerSignature", value: "ServerSignature" },
   { id: "OfficeCheckedDate", value: "OfficeCheckedDate" },
];

export const RadioOptions: IRadioOption[] = [
   { id: "yes", value: "Yes" },
   { id: "no", value: "No" },
];

export const OptionalServiceList: ISelectOptions[] = [
   { id: "StampFee", value: "Stamp Fee", disabled: false },
   { id: "ExtraTenantFee", value: "Extra Tenant Fee", disabled: false },
   { id: "AdditionalPartyFee", value: "Additional Party Fee", disabled: false },
];


// export const EventList = [
//    { id: 1, value: "Other " },
//    { id: 2, value: "Account" },
//    { id: 3, value: "All Cases" },
//    { id: 4, value: "Amendments" },
//    { id: 5, value: "C2CFee" },
//    { id: 6, value: "County" },
//    { id: 7, value: "Court" },
//    { id: 8, value: "Dismissal" },
//    { id: 9, value: "Eviction Fee" },
//    { id: 10, value: "Eviction Queue" },
//    { id: 11, value: "File Eviction" },
//    { id: 12, value: "Garnishment Fee" },
//    { id: 13, value: "Late Notices" },
//    { id: 14, value: "Logs" },
//    { id: 15, value: "Process Server" },
//    { id: 16, value: "Service Tracker" },
//    { id: 17, value: "Tyler Config " },
//    { id: 18, value: "TylerUser  " },
//    { id: 19, value: "Writ " },
//    { id: 20, value: "Writ Labor  " },
//    { id: 21, value: "Case Filing Scheduler" },
//    { id: 22, value: "Send Email Check for Writ" },
//    { id: 23, value: "Eviction Automation" },
//    { id: 24, value: "Notary" }
// ];
export const EventList = [
   { id: 1, value: "Other " },
   { id: 2, value: "Account" },
   { id: 3, value: "All Cases" },
   { id: 4, value: "Amendments" },
   { id: 5, value: "C2CFee" },
   { id: 6, value: "County" },
   { id: 7, value: "Court" },
   { id: 8, value: "Dismissal" },
   { id: 9, value: "Eviction Fee" },
   { id: 10, value: "Eviction Queue" },
   { id: 11, value: "File Eviction" },
   { id: 12, value: "Garnishment Fee" },
   { id: 13, value: "Late Notices" },
   { id: 14, value: "Logs" },
   { id: 15, value: "Process Server" },
   { id: 16, value: "Service Tracker" },
   { id: 17, value: "Tyler Config " },
   { id: 18, value: "TylerUser  " },
   { id: 19, value: "Writ " },
   { id: 20, value: "Writ Labor  " },
   { id: 21, value: "Case Filing Scheduler" },
   { id: 22, value: "CasperUser" },
   { id: 23, value: "Send Email Check for Writ" },
   { id: 24, value: "Eviction Automation" },
   { id: 25, value: "Notary" },
   {id:26,value:"Accounting"},
   {id:27,value:"Invoices"},
   {id:28,value:"Payment"},
   {id:29,value:"BillingTransaction"},
   {id:30,value:"EvictionAnswer"},
   { id: 31, value: "Email Client"},
   {id:32,value:"TylerService"},
   {id:33,value:"RemoveServerHistory"},
   {id:34,value:"FileUpload"},
   {id: 35,value:"Propexo"}, 
   {id: 36,value:"ClaytonCrawl"},
   {id:37,value:"EmailSendQueue"},
   {id:38,value:"CRM Importer"}
];

// export const TypeList = [
//    { id: 1, value: "Other" },
//    // { id: 2, value: "General Log" },
//    { id: 2, value: "Activity" },
//    { id: 3, value: "Exception" }
// ];

export const TypeList = [
   { id: 2, value: "Activity" },
   { id: 3, value: "Exception" },
   { id: 1, value: "Other" }
];
export const ProcessServerButtonsList: IProcessServerButton[] = [
   {
      title: "Import Data",
      icon: "FaFileExcel",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Edit",
      icon: "FaEdit",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Send for Signature",
      icon: "FaFileSignature",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Export CSV",
      icon: "FaFileExport",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Delete",
      icon: "FaTrash",
      classes:
         "bg-[#E61818] hover:bg-[#d13c3c] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Review & File AOS",
      icon: "FaFileSignature",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded	 shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
];

// export const ServiceMethodList: ISelectOptions[] = [
//    { id: "TACK MAIL", value: "Tack" },
//    { id: "PERSONALLY", value: "Personal" },
//    { id: "NOTORIOUSLY", value: "Notorious" },
//    { id: "NON EST", value: "Non Est" },
//    { id: "INFORMATION ONLY", value: "Information Only" }
// ];
export const ServiceMethodList: ISelectOptions[] = [
   { id: "INFORMATION ONLY", value: "Information Only" },
   { id: "NON EST", value: "Non Est" },
   { id: "NOTORIOUSLY", value: "Notorious" },
   { id: "PERSONALLY", value: "Personal" },
   { id: "TACK MAIL", value: "Tack" },
];

export const FilingTypeList: ISelectOptions[] = [
   { id: "Eviction", value: "Eviction" },
   { id: "Amendment", value: "Amendment" },
];

// export const TaskActionList = [
//    { id: 1, value: "File Eviction" },
//    { id: 2, value: "Dismissals" },
//    { id: 3, value: "Writs" },
//    { id: 4, value: "Amendments" },
//    { id: 5, value: "Affidavit of service" }
// ];
export const TaskActionList = [
   { id: 5, value: "Affidavit of service" },
   { id: 4, value: "Amendments" },
   { id: 2, value: "Dismissals" },
   { id: 1, value: "File Eviction" },
   { id: 3, value: "Writs" },
];

// export const TaskStatusList = [
//    { id: 1, value: "To be processed" },
//    { id: 2, value: "In process" },
//    { id: 3, value: "Completed" },
//    { id: 4, value: "Error" },
//    { id: 5, value: "Rejected" },
//    {id:6,value:"Cancelled"}
// ];

export const PdfTypeList = [
   { id: 1, value: "Eviction" },
   { id: 2, value: "Dismissal" },
   { id: 3, value: "Writ" },
   { id: 4, value: "Amendment" },
   { id: 5, value: "AOS" },
];

export const TaskStatusList = [
   { id: 8, value: "Accepted" },
   { id: 9, value: "API Off" },
   { id: 6, value: "Cancelled" },
   { id: 7, value: "Cancellation Error" },
   { id: 3, value: "Submitted" },
   { id: 4, value: "Error" },
   { id: 2, value: "Submitting" },
   { id: 5, value: "Rejected" },
   { id: 10, value: "System Error" },
   { id: 1, value: "To be processed" },
   { id: 4, value: "Tyler Error" },
   { id: 11, value: "Receipted" },
   { id: 12, value: "Correction" },
   { id: 13, value: "Denied" },
   { id: 14, value: "Granted" },
   { id: 15, value: "Moot" },
   { id: 16, value: "Under-Review" },
   { id: 17, value: "Reviewed" },
   { id: 18, value: "Deferred" },
   { id: 19, value: "Failed" },
];
export const PaymentMethodOption = [
   { id: "C2CAccount", value: "C2CAccount" },
   { id: "ClientAccount", value: "ClientAccount" },
];

export const FileEvictionCSVHeader = [
   "County",
   "Tenant1Last",
   "Tenant1First",
   "Tenant1MI",
   "AndAllOtherOccupants",
   "TenantAddress",
   "TenantUnit",
   "TenantCity",
   "TenantState",
   "TenantZip",
   "Tenant2Last",
   "Tenant2First",
   "Tenant2MI",
   "Tenant3Last",
   "Tenant3First",
   "Tenant3MI",
   "Tenant4Last",
   "Tenant4First",
   "Tenant4MI",
   "Tenant5Last",
   "Tenant5First",
   "Tenant5MI",
   "EvictionReason",
   "EvictionTotalRentDue",
   "MonthlyRent",
   "AllMonths",
   "EvictionOtherFees",
   "OwnerName",
   "PropertyName",
   "PropertyPhone",
   "PropertyEmail",
   "PropertyAddress",
   "PropertyCity",
   "PropertyState",
   "PropertyZip",
   "AttorneyName",
   "AttorneyBarNo",
   "AttorneyEmail",
   "FilerBusinessName",
   "EvictionAffiantIs",
   "EvictionFilerPhone",
   "EvictionFilerEmail",
   "Expedited",
   "StateCourt",
   "ClientReferenceId",
   "ProcessServerCompany",
   "PropertyCode"
];

// export const ExistingCaseCSVHeader = [
//    "County",
//    "CaseNo",
//    "PropertyName",
//    "OwnerName",
//    "PropertyPhone",
//    "PropertyEmail",
//    "PropertyAddress",
//    "PropertyCity",
//    "PropertyState",
//    "PropertyZip",
//    "EvictionFilerEmail",
//    //"CompanyName",
//    "Tenant1First",
//    "Tenant1Last",
//    "Tenant1MI",
//    "Tenant2First",
//    "Tenant2Last",
//    "Tenant2MI",
//    "Tenant3First",
//    "Tenant3Last",
//    "Tenant3MI",
//    "Tenant4First",
//    "Tenant4Last",
//    "Tenant4MI",
//    "Tenant5First",
//    "Tenant5Last",
//    "Tenant5MI",
//    "AndAllOtherOccupants",
//    "TenantAddress",
//    "TenantUnit",
//    "TenantCity",
//    "TenantState",
//    "TenantZip",
//    "EvictionDateFiled",
//    "EvictionServiceMethod",
//    "EvictionServiceDate",
//    "EvictionLastDaytoAnswer",
//    "EvictionReason",
//    "EvictionTotalRentDue",
//    "MonthlyRent",
//    "AllMonths",
//    "EvictionOtherFees",
//    "AnswerDate",
//    "CourtDate",
//    "EvictionAffiantSignature",
//    "AttorneyName",
//    "AttorneyBarNo",
//    "FilerBusinessName",
//    "EvictionAffiantIs",
//    "WritApplicantDate",
//    "ClientReferenceID",
//    "StateCourt"
//  ];

export const ExistingCaseCSVHeader = [
   "County",
   "CaseNo",
   "Tenant1Last",
   "Tenant1First",
   "Tenant1MI",
   "TenantAddress",
   "TenantUnit",
   "TenantCity",
   "TenantState",
   "TenantZip",
   "Tenant2Last",
   "Tenant2First",
   "Tenant2MI",
   "Tenant3Last",
   "Tenant3First",
   "Tenant3MI",
   "Tenant4Last",
   "Tenant4First",
   "Tenant4MI",
   "Tenant5Last",
   "Tenant5First",
   "Tenant5MI",
   "EvictionDateFiled",
   "EvictionServiceDate",
   "EvictionLastDaytoAnswer",
   "AnswerDate",
   "CourtDate",
   "EvictionAffiantSignature",
   "OwnerName",
   "PropertyName",
   "PropertyAddress",
   "PropertyCity",
   "PropertyState",
   "PropertyZip",
   "AttorneyName",
   "AttorneyBarNo",
   "WritApplicantDate",
   "EvictionFilerEmail",
   "StateCourt",
   "ClientReferenceId",
   "AndAllOtherOccupants",
   "EvictionServiceMethod",
   "EvictionReason",
   "EvictionTotalRentDue",
   "MonthlyRent",
   "AllMonths",
   "EvictionOtherFees",
   "PropertyPhone",
   "PropertyEmail",
   "FilerBusinessName",
   "EvictionAffiantIs"
 ];

 export const AccountingQueueCSVHeader = [
   "County",
   "CaseNo",
   "Tenant1Last",
   "Tenant1First",
   "Tenant1MI",
   "TenantAddress",
   "TenantUnit",
   "TenantCity",
   "TenantState",
   "TenantZip",
   "Tenant2Last",
   "Tenant2First",
   "Tenant2MI",
   "Tenant3Last",
   "Tenant3First",
   "Tenant3MI",
   "Tenant4Last",
   "Tenant4First",
   "Tenant4MI",
   "Tenant5Last",
   "Tenant5First",
   "Tenant5MI",
   "EvictionDateFiled",
   "EvictionServiceDate",
   "EvictionLastDaytoAnswer",
   "AnswerDate",
   "CourtDate",
   "EvictionAffiantSignature",
   "OwnerName",
   "PropertyName",
   "PropertyAddress",
   "PropertyCity",
   "PropertyState",
   "PropertyZip",
   "AttorneyName",
   "AttorneyBarNo",
   "WritApplicantDate",
   "EvictionFilerEmail",
   "StateCourt",
   "ClientReferenceId",
   "AndAllOtherOccupants",	
   "EvictionServiceMethod",
   "EvictionReason",
   "EvictionTotalRentDue",
   "MonthlyRent",
   "AllMonths",
   "EvictionOtherFees",
   "PropertyPhone",
   "PropertyEmail",
   "FilerBusinessName",
   "EvictionAffiantIs"
 ];

export const ProcessServerCaseInfoCSVHeader = [
   "DateScanned",
   "CaseNumber",
   "ProcessServerEmail",
   // "ServiceType",
   "EvictionServiceMethod",
   "PersonServed",
   "Height",
   "Weight",
   "Age",
   "ServiceNotes",
   // "ServiceDate",
   "EvictionServiceDate",
   // "DefendantName",
   // "House",
   // "ServiceFee",
   "ServerName",
   // "Longitude",
   // "Latitude",
   "LocationCoord",
   // "County",
   // "Comments",
   "ServiceComments",
   "FilingType"
];

export const MultipleAOSPdfOption = [
   { id: "single", value: "Single" },
   { id: "multiple", value: "Multiple" }
];

export const EmailQueueButtonList = [
   {
      title: "Send Email",
      icon: "FaFileExcel",
      classes: "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Edit",
      icon: "FaEdit",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Delete",
      icon: "FaTrash",
      classes:
         "bg-[#E61818] hover:bg-[#d13c3c] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Manual Crawl",
      icon: "FaRedo",
      classes:
         "bg-[#4DB452] hover:bg-[#4DB452] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Sync",
      icon: "FaSyncAlt",
      classes:
         "bg-[#427AC7] hover:bg-[#427AC7] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
];

export const MethodList = [
   { id: "C2C Automated Scripts", value: "C2C Automated Scripts" },
   { id: "eFileGA", value: "eFileGA" },
   { id: "eFileNV", value: "eFileNV" },
];

export const EvictionAutomationButtonList: IEvictionAutomationButton[] = [
   {
      title: "Add",
      icon: "FaPlus",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Add ",
      icon: "FaPlus",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Edit",
      icon: "FaEdit",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Delete",
      icon: "FaRegWindowClose",
      classes:
         "bg-[#E61818] hover:bg-[#d13c3c] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   // {
   //    title: "Import Data",
   //    icon: "FaFileExcel",
   //    classes:
   //       "bg-[#2472db] hover:bg-[#0d5ecb] px-4 py-2 font-medium text-[13px] text-white rounded-md shadow-lg ml-1 md:ml-2 inline-flex items-center mb-1",
   // },
   {
      title: "Approve/Sign",
      icon: "FaEdit",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Confirm",
      icon: "FaEdit",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-4 px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1",
   },
   {
      title: "Sign",
      icon: "FaEdit",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Create Notice",
      icon: "FaEdit",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Confirm/Create Notice",
      icon: "FaEdit",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Sync",
      icon: "FaSyncAlt",
      classes:
         "bg-[#427AC7] hover:bg-[#427AC7] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   //  ,
   //  {
   //     title: "Confirm",
   //     icon: "FaCheck",
   //     classes:
   //        "bg-[#4DB452] px-3.5 md:px-4 py-2 font-medium text-[12px] md:text-[13px] text-white rounded-md	 shadow-lg ml-1 md:ml-2 inline-flex items-center mb-1",
   //  }
];

export const EASettingsButtonList: IEvictionAutomationButton[] = [
   {
      title: "Edit",
      icon: "FaEdit",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Delete",
      icon: "FaRegWindowClose",
      classes:
         "bg-[#E61818] hover:bg-[#d13c3c] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Sync",
      icon: "FaSyncAlt",
      classes:
         "bg-[#427AC7] hover:bg-[#427AC7] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
];

export const AttachmentType = [
   { id: "Eviction", value: "Eviction" },
   //{ id: "Dismissal", value: "Dismissal" },
   { id: "Writ", value: "Writ" },
   { id: "Amendment", value: "Amendment" },
   // { id: "MilitaryStatus", value: "MilitaryStatus" },
   // { id: "AOS", value: "AOS" },
];

export const ExpeditedLists = [
   { id: 1, value: "Expedited" },
   { id: 2, value: "NonExpedited" },
];

export const CourtLists = [
   { id: 1, value: "Magistrate Court" },
   { id: 2, value: "StateCourt" },
];
export const PaymentAccount = [
   { id: 1, value: "C2C A/C" },
   { id: 2, value: "Client A/C" },
];
export const FilingType = [
   { id: 1, value: "Eviction Automation" },
   { id: 2, value: "Regular Evictions" },
];
export const NoticeStatus = [
   { id: 1, value: "Served" },
   { id: 2, value: "Pending Service" },
];

export const EvictionAutomationCSVHeader = [
   "Company",
   "EvictionAffiantIs",
   "AndAllOtherOccupants",
   "AllowMultipleImports",
   "AttorneyBarNo",
   "AttorneyEmail",
   "AttorneyName",
   "BccEmails",
   "CcEmails",
   "TenantAddressConfig",
   "ConfirmReportEmail",
   "County",
   "DaysToFileAfterNoticeDelivery",
   "Disabled",
   "DismissalNotificationDay",
   "Expedited",
   "FilerBusinessName",
   "EvictionFilerEmail",
   "EvictionFilingDay",
   "FilingThresholdAdjustment",
   "MinimumFilingAmount",
   "Notes",
   "NoticesRequired",
   "OwnerId",
   "OwnerName",
   "PrescreenConfirmEmail",
   "ProcessServer",
   "PropertyAddress",
   "PropertyCity",
   "PropertyEmail",
   "PropertyId",
   "PropertyName",
   "PropertyPhone",
   "PropertyState",
   "PropertyStreetNo",
   "PropertyZip",
   "PrescreenSignEmail",
   "SignerEmail",
   "StateCourt",
   "UnitsUsePropertyAddress",
   "ConfirmationPin",
];

export const PaymentList = [
   { id: "American Express", value: "American Express" },
   { id: "Ach", value: "Ach" },
   { id: "Credit Card", value: "Credit Card" },
   { id: "Fidelity", value: "Fidelity" },
   { id: "VISA", value: "VISA" }
];

export const CasesQueueButtonsList: IEvictionQueueButton[] = [
   {
      title: "Edit",
      icon: "FaEdit",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold font-semibold",
   },
   // {
   //    title: "Manual Crawl",
   //    icon: "FaRedo",
   //    classes:
   //       "bg-[#4DB452] hover:bg-[#4DB452] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   // },
   {
      title: "Cancel",
      icon: "FaBan",
      classes:
         "bg-[#FF914D] hover:bg-[#FF914D] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Resubmit",
      icon: "FaRedo",
      classes:
         "bg-[#4DB452] hover:bg-[#4DB452] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold font-semibold",
   },
   {
      title: "Sync",
      icon: "FaSyncAlt",
      classes:
         "bg-[#427AC7] hover:bg-[#427AC7] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold font-semibold",
   },
   {
      title: "Delete",
      icon: "FaTrash",
      classes:
         "bg-[#E61818] hover:bg-[#E61818] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Regenerate AOS",
      icon: "FaFilePdf",
      classes:
         "bg-[#427AC7] hover:bg-[#427AC7] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold font-semibold",
   },
];

export const AllCourtList = [
   { id: "Fulton Magistrate", value: "Fulton Magistrate" },
   { id: "Fulton State", value: "Fulton State" },
   { id: "Cobb Magistrate", value: "Cobb Magistrate" },
   { id: "Gwinnett Magistrate", value: "Gwinnett Magistrate" },
   { id: "Dekalb Magistrate", value: "Dekalb Magistrate" },
   { id: "Forsyth Magistrate", value: "Forsyth Magistrate" },
   { id: "Rockdale Magistrate", value: "Rockdale Magistrate" },
   { id: "Henry Magistrate", value: "Henry Magistrate" }
];

export const MonthListOptions: ICommonSelectOptions[] = [
   { id: "LAST_MONTH", value: "Last Month" }
];
// export const colors = [
//   '#2DC7FF', '#4DB452', '#FBB400', '#2472DB', '#f73a3c', '#046c95', '#cb264a',
//   '#3251c6', '#8e4585', '#ea428b', '#02aca4', '#00d27f', '#2aaf6a', '#9966cc'
// ];

export const colors = [
   '#6f4ef6',
   '#5bc5a8',
   '#ff9720',
   '#92d268',
   '#e6aa69',
   '#E61818',
   '#4292FD',
   '#5e1084',
   '#1dc9b7',
   '#fd397a',
   '#343957',
   '#7ed321',
   '#007bb6',
   '#3b5998',
   '#44ecf5',
   '#c00a27',
   '#000080',
   '#19b3cb'
];

export const EvictionAutomationNoticesCSVHeader = [
   "Tenant1Last",
   "Tenant1First",
   "Tenant1MI",
   "Tenant2Last",
   "Tenant2First",
   "Tenant2MI",
   "Tenant3Last",
   "Tenant3First",
   "Tenant3MI",
   "Tenant4Last",
   "Tenant4First",
   "Tenant4MI",
   "Tenant5Last",
   "Tenant5First",
   "Tenant5MI",
   "AndAllOtherOccupants",
   "TenantAddress",
   "TenantUnit",
   "TenantCity",
   "TenantState",
   "TenantZip",
   "MonthlyRent",
   "OwnerName",
   "PropertyName",
   "PropertyPhone",
   // "PropertyEmail",
   "PropertyAddress",
   "PropertyCity",
   "PropertyState",
   "PropertyZip",
   "NoticeDeliveryDate",
   "NoticeDefaultStartDate",
   "NoticeDefaultEndDate",
   "NoticeLastPaidDate",
   "NoticeTotalDue",
   "NoticeLastPaidAmount",
   "NoticeCurrentRentDue",
   "NoticePastRentDue",
   "NoticeServerID",
   "CrmName",
   "OwnerId",
   "PropertyId",
];

export const ConfirmDelinquenciesNoticesCSVHeader = [
   // "County",
   // "Tenant1Last",
   // "Tenant1First",
   // "Tenant1MI",
   // "Tenant2Last",
   // "Tenant2First",
   // "Tenant2MI",
   // "Tenant3Last",
   // "Tenant3First",
   // "Tenant3MI",
   // "Tenant4Last",
   // "Tenant4First",
   // "Tenant4MI",
   // "Tenant5Last",
   // "Tenant5First",
   // "Tenant5MI",
   // "AndAllOtherOccupants",
   // "TenantAddress",
   // "TenantUnit",
   // "TenantCity",
   // "TenantState",
   // "TenantZip",
   // "MonthlyRent",
   // "OwnerName",
   // "AttorneyName",
   // "AttorneyBarNo",
   // "AttorneyEmail",
   // "FilerBusinessName",
   // "EvictionAffiantIs",
   // "FilerPhone",
   // "FilerEmail",
   // "OwnerName",
   // "PropertyName",
   // "PropertyPhone",
   // // "PropertyEmail",
   // "PropertyAddress",
   // "PropertyCity",
   // "PropertyState",
   // "PropertyZip",
   // "ProcessServer",
   // "ProcessServerEmail",
   // "Expedited",
   // "StateCourt",
   // "ClientReferenceId",
   // "ProcessServerCompany",
   // "NoticeDeliveryDate",
   // "NoticeDefaultStartDate",
   // "NoticeDefaultEndDate",
   // "NoticeLastPaidDate",
   // "NoticeTotalDue",
   // "NoticeLastPaidAmount",
   // "NoticeCurrentRentDue",
   // "NoticePastRentDue",
   // "NoticeServerID",
   // "CrmName",
   // "OwnerId",
   // "PropertyId",


   "County",

   "Tenant1Last",

   "Tenant1First",

   "Tenant1MI",

   "Tenant2Last",

   "Tenant2First",

   "Tenant2MI",

   "Tenant3Last",

   "Tenant3First",

   "Tenant3MI",

   "Tenant4Last",

   "Tenant4First",

   "Tenant4MI",

   "Tenant5Last",

   "Tenant5First",

   "Tenant5MI",

   "AndAllOtherOccupants",

   "TenantAddress",

   "TenantUnit",

   "TenantCity",

   "TenantState",

   "TenantZip",

   "MonthlyRent",

   "OwnerName",

   "AttorneyName",

   "AttorneyBarNo",

   "AttorneyEmail",

   "FilerBusinessName",

   "EvictionAffiantIs",

   "FilerPhone",

   "FilerEmail",

   // "OwnerName_1",

   "PropertyName",

   "PropertyPhone",

   "PropertyAddress",

   "PropertyCity",

   "PropertyState",

   "PropertyZip",

   // "ProcessServer",

   // "ProcessServerEmail",

   "Expedited",

   "StateCourt",

   "ClientReferenceId",

   "ProcessServerCompany",

   "NoticeDeliveryDate",

   "NoticeDefaultStartDate",

   "NoticeDefaultEndDate",

   "NoticeLastPaidDate",

   // "NoticeTotalDue",

   "NoticeLastPaidAmount",

   "NoticeCurrentRentDue",

   "NoticePastRentDue",

   "NoticeLateFees",
   "NoticeLateFeeDate",
   "NoticeServerID",
];
export const FilingTypeOptionCodes = [
   { id: "Amendment", value: "Amendment" },
   { id: "Disposessory", value: "Disposessory" },
   { id: "Dispossessory - AOS", value: "Dispossessory - AOS" },
   { id: "Dispossesory - Dismissal (ALL)", value: "Dispossesory - Dismissal (ALL)" },
   { id: "Dispossesory - Dismissal (With Prejudice)", value: "Dispossesory - Dismissal (With Prejudice)" },
   { id: "Dispossesory - Dismissal (Without Prejudice)", value: "Dispossesory - Dismissal (Without Prejudice)" },
   { id: "Garnishment", value: "Garnishment" },
   { id: "Garnishment - AOS", value: "Garnishment - AOS" },
   { id: "Garnishment - Dismissal", value: "Garnishment - Dismissal" },
   { id: "Writ", value: "Writ" },
   { id: "Writ AOS", value: "Writ AOS" },
];
// export const CourtTypeOptions = [
//    { id: "State", value: "State" },
//    { id: "Magistrate", value: "Magistrate" }
// ]
export const CourtTypeOptions = [
   { id: "Magistrate", value: "Magistrate" },
   { id: "State", value: "State" }
];

export const DaysOfWeekOptions = [
   { name: 'Monday', code: 'Monday' },
   { name: 'Tuesday', code: 'Tuesday' },
   { name: 'Wednesday', code: 'Wednesday' },
   { name: 'Thursday', code: 'Thursday' },
   { name: 'Friday', code: 'Friday' },
   { name: 'Saturday', code: 'Saturday' },
   { name: 'Sunday', code: 'Sunday' },
];

export const AllNoticeStatusList = [
   { id: 1, value: "Notice Created" },
   { id: 2, value: "Served" },
   { id: 3, value: "Confirmed for Eviction" },
];

export const FileEvictionNVButtonsList = [
   {
      title: "Confirm for Eviction",
      icon: "FaPlus",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold ",
   },
   {
      title: "Dismiss",
      icon: "FaPlus",
      classes:
         "bg-[#E61818] hover:bg-[#d13c3c] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Import Data",
      icon: "FaFileExcel",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded	 shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
];

export const DismissalNVButtonsList = [
   {
      title: "Confirm for Dismissal",
      icon: "FaPlus",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold ",
   }
];
export const FileEvictionTXCSVHeader = [

   "County",
   "Court",
   "Tenant1Last",
   "Tenant1First",
   "Tenant1MI",
   "Tenant1Phone",
   "Tenant1Email",
   "AndAllOtherOccupants",
   "TenantAddress",
   "TenantUnit",
   "TenantCity",
   "TenantState",
   "TenantZip",
   "Tenant2Last",
   "Tenant2First",
   "Tenant2MI",
   "Tenant2Phone",
   "Tenant2Email",
   "Tenant3Last",
   "Tenant3First",
   "Tenant3MI",
   "Tenant3Phone",
   "Tenant3Email",
   "Tenant4Last",
   "Tenant4First",
   "Tenant4MI",
   "Tenant4Phone",
   "Tenant4Email",
   "Tenant5Last",
   "Tenant5First",
   "Tenant5MI",
   "Tenant5Phone",
   "Tenant5Email",
   "PropertyName",
   "PropertyPhone",
   "PropertyEmail",
   "PropertyAddress",
   "PropertyCity",
   "PropertyState",
   "PropertyZip",
   "AttorneyName",
   "AttorneyBarNo",
   "FilerBusinessName",
   "EvictionFilerEmail",
   "ClientReferenceId",
   "CourtesyCopies"
];
export const FileEvictionsTXButtonsList: IFileEvictionTXButtons[] = [
   //   {
   //     title: "New",
   //     icon: "FaPlus",
   //     classes:
   //       "bg-[#2472db] hover:bg-[#0d5ecb] px-3.5 md:px-4 py-2 font-medium text-[12px] md:text-[13px] text-white rounded-md	 shadow-lg ml-1 md:ml-2 inline-flex items-center mb-1",
   //   },
   {
      title: "Import Data",
      icon: "FaFileExcel",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Review & File",
      icon: "FaFileSignature",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded	 shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Confirm",
      icon: "FaEdit",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-4 px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Edit",
      icon: "FaEdit",
      classes:
         "bg-[#2472db] hover:bg-[#0d5ecb] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
   {
      title: "Delete",
      icon: "FaTrash",
      classes:
         "bg-[#E61818] hover:bg-[#d13c3c] px-3 md:px-3.5 py-1.5 font-medium text-[10px] md:text-[11px] text-white rounded shadow-lg ml-0.5 md:ml-1.5 inline-flex items-center mb-1 font-semibold",
   },
];
export const CourtTypeOptionTX = [
   { id: "JP 1-1", value: "JP 1-1" },
   { id: "JP 1-2", value: "JP 1-2" },
   { id: "JP 2-1", value: "JP 2-1" },
   { id: "JP 2-2", value: "JP 2-2" },
   { id: "JP 3-1", value: "JP 3-1" },
   { id: "JP 3-2", value: "JP 3-2" },
   { id: "JP 4-1", value: "JP 4-1" },
   { id: "JP 4-2", value: "JP 4-2" },
   { id: "JP 5-1", value: "JP 5-1" },
   { id: "JP 5-2", value: "JP 5-2" },
   { id: "JP 6-1", value: "JP 6-1" },
   { id: "JP 6-2", value: "JP 6-2" },
   { id: "JP 7-1", value: "JP 7-1" },
   { id: "JP 7-2", value: "JP 7-2" },
   { id: "JP 8-1", value: "JP 8-1" },
   { id: "JP 8-2", value: "JP 8-2" },
];
