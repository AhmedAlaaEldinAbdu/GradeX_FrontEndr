import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
   label: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
   label,
   className = "",
   ...props
}) => {
   return (
      <label className="flex items-center gap-2 cursor-pointer">
         <input
            type="checkbox"
            className={`w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 focus:ring-2 ${className}`}
            {...props}
         />
         <span className="text-sm text-gray-700">{label}</span>
      </label>
   );
};

export default Checkbox;
