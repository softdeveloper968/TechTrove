// GridCheckbox.tsx
import React from "react";

type GridCheckboxProps = {
  checked: boolean | undefined;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
};

const GridCheckbox: React.FC<GridCheckboxProps> = ({
  checked,
  onChange,
  label,
  disabled
}: GridCheckboxProps) => {
  return (
    <>
      <label className="text-gray-600 text-[11px] md:text-xs font-medium me-1.5">{label}</label>

      <input
        className={`!w-3.5 !h-3.5 ${!disabled ? 'cursor-pointer' : ''}`}
        type="checkbox"
        disabled={disabled}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.checked)
        }
        checked={checked ?? false}
      />
    </>
  );
};

export default GridCheckbox;
