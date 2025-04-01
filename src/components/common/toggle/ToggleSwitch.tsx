import React from "react";

type Props<T> = {
  value: T;
  label: string;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
const ToggleSwitch = <T,>({ value, label, handleChange }: Props<T>) => {
  return (
    <>
      <div className="text-xs flex w-full justify-end items-center font-semibold mt-1.5 md:mt-0 pr-2.5 md:pr-3.5 text-slate-900 awitch-btn">
        <label className="relative inline-flex items-center cursor-pointer text-sm">
          <input
            type="checkbox"
            value={String(value)}
            checked={Boolean(value)}
            onChange={(e) => handleChange(e)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-3.5 peer-focus:ring-blue-300  rounded-full peer  peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all  peer-checked:bg-blue-600"></div>
          <span className="ms-2.5 text-xs font-medium text-gray-900 ">
            {label}
          </span>
        </label>
      </div>
    </>
  );
};

export default ToggleSwitch;
