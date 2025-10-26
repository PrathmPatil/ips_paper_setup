import React from "react";
import Select from "react-select";

interface MultiSelectProps {
  label?: string;
  placeholder?: string;
  options: { label: string; value: string }[];
  value: string[];
  onChange: (selected: string[]) => void;
  isDisabled?: boolean;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  placeholder = "Select options...",
  options,
  value,
  onChange,
  isDisabled = false,
}) => {
  const handleChange = (selectedOptions: any) => {
    const values = selectedOptions ? selectedOptions.map((opt: any) => opt.value) : [];
    onChange(values);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <Select
        isMulti
        isDisabled={isDisabled}
        options={options}
        placeholder={placeholder}
        value={options.filter((opt) => value.includes(opt.value))}
        onChange={handleChange}
        className="react-select-container"
        classNamePrefix="react-select"
        styles={{
          control: (base) => ({
            ...base,
            borderRadius: "0.5rem",
            borderColor: "#d1d5db",
            boxShadow: "none",
            "&:hover": { borderColor: "#9ca3af" },
          }),
        }}
      />
    </div>
  );
};

export default MultiSelect;
