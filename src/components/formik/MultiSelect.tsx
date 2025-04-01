import React, { useState, useRef, useEffect } from "react";
import { ErrorMessage, useField } from "formik";
import TextError from "./TextError";
import arrow from "assets/images/select_arrow.png";

const MultiSelect = (props: any) => {
  const { label, name, options, defaultOption, ...rest } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<any[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [field, meta, helpers] = useField(name);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize selected values from props or form initial values
    setSelectedValues(field.value || []);
  }, [field.value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionToggle = (optionValue: any) => {
    const currentIndex = selectedValues.indexOf(optionValue);
    const newValues = [...selectedValues];

    if (currentIndex === -1) {
      newValues.push(optionValue);
    } else {
      newValues.splice(currentIndex, 1);
    }

    setSelectedValues(newValues);
    helpers.setValue(newValues);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div className={`m-0 relative`} ref={dropdownRef}>
      <label
        htmlFor={name}
        className="text-gray-600 text-[11px] md:text-xs font-medium"
      >
        {label}
      </label>

      <div className="relative">
        <div
          className={`flex items-center justify-between cursor-pointer border border-gray-200 rounded-md px-2.5 py-2.5 w-full ${isFocused ? "ring-2 ring-blue-500" : ""}`}
          onClick={toggleDropdown}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          <div className="flex flex-wrap gap-1">
            {selectedValues.length === 0 ? (
              <span className="text-xs text-gray-400">Select</span>
            ) : (
              selectedValues.map((selectedId: any) => (
                <span
                  key={selectedId}
                  className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-md text-[10.5px]"
                >
                  {options.find((opt: any) => opt.id === selectedId)?.value}
                </span>
              ))
            )}
          </div>
          <img
            src={arrow}
            alt="dropdown arrow"
            className={`transform transition-transform ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 w-full border border-gray-200 bg-white rounded-lg mt-1 z-10 max-h-52 overflow-y-auto">
            <div className="p-1.5">
              {defaultOption && (
                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => {
                    setSelectedValues([]);
                    helpers.setValue([]);
                  }}
                >
                  <input
                    id={`${name}-defaultOption`}
                    name={`${name}[defaultOption]`}
                    type="checkbox"
                    checked={selectedValues.length === 0}
                    onChange={() => {}}
                    className="mr-1.5"
                  />
                  <label
                    htmlFor={`${name}-defaultOption`}
                    className="select-none"
                    style={{ fontSize: '0.75rem' }}
                  >
                    {defaultOption}
                  </label>
                </div>
              )}
              {options.map((option: any) => (
                <div
                  key={option.id}
                  className="flex items-center cursor-pointer"
                  onClick={() => handleOptionToggle(option.id)}
                >
                  <input
                    id={`${name}-${option.id}`}
                    name={`${name}[${option.id}]`}
                    type="checkbox"
                    checked={selectedValues.includes(option.id)}
                    onChange={() => {}}
                    className="mr-1.5"
                  />
                  <label
                    htmlFor={`${name}-${option.id}`}
                    className="select-none"
                    style={{ fontSize: '0.75rem' }}
                  >
                    {option.value}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <ErrorMessage name={name} component={TextError} />
    </div>
  );
};

export default MultiSelect;
