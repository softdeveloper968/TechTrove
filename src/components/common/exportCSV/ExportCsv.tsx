import React, { Fragment, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import Spinner from "../spinner/Spinner";

const classNames = (...classes: string[]) => {
   return classes.filter(Boolean).join(" ");
};

type Props<T> = {
   fetchCsvData: () => void;
   fileName: string;
   isEviction?: boolean;
 };

const CsvDownloader = <T,>(props: Props<T>) => {
  const [showExportSpinner, setShowExportSpinner] = useState(false);

//   const getDataForCsv = async () => {
//     try {
//       setShowExportSpinner(true);
//       const response = await props.fetchCsvData();
//       return response;
//     } catch (error) {
//       throw new Error("Error fetching data for CSV:", "error");
//     } finally {
//       setShowExportSpinner(false);
//     }
//   };

//   const downloadCSV = async () => {
//     try {
//       const response = await getDataForCsv();

//       if (response) {
//         const dataArray = response as object[];

//         const csv = Papa.unparse(dataArray);

//         const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

//         const link = document.createElement("a");
//         const url = URL.createObjectURL(blob);
//         link.href = url;
//         link.setAttribute("download", "Data.csv");
//         document.body.appendChild(link);
//         link.click();

//         document.body.removeChild(link);
//         URL.revokeObjectURL(url);
//       }
//     } catch (error) {
//       console.error("Error fetching or exporting data:", error);
//       // Handle error
//     }
//   };

  return (
    <>
      {showExportSpinner && <Spinner />}
      <Menu
        as="div"
        className="relative inline-block text-left z-[11] mb-1 ml-1 md:ml-1.5"
      >
        <div>
          <Menu.Button className="inline-flex w-full justify-center gap-x-1 rounded-md bg-white px-2.5 py-1.5 text-[11px] md:text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
            Download
            <ChevronDownIcon
              className="-mr-0.5 h-4 w-4 text-gray-400"
              aria-hidden="true"
            />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="dropdown-menu absolute left-0 md:left-auto md:right-0 mt-1.5 w-36 md:w-36 origin-top-right rounded bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  // eslint-disable-next-line jsx-a11y/anchor-is-valid
                  <a
                    className={classNames(
                      active ? "bg-gray-100 text-gray-900" : "text-gray-700",
                      "block px-3.5 py-1.5 text-[11px] md:text-xs cursor-pointer flex items-center font-semibold"
                    )}
                  //   onClick={downloadCSV}
                  >
                    Export CSV
                  </a>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
};

export default CsvDownloader;
