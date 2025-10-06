import React from "react";

interface TextAreaProps
   extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
   label?: string;
   error?: string;
}

const TextArea: React.FC<TextAreaProps> = ({
   label,
   error,
   className = "",
   ...props
}) => {
   return (
      <div className="w-full">
         {label && (
            <label className="block text-sm font-medium text-gray-700 mb-2">
               {label}
            </label>
         )}
         <textarea
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-vertical min-h-[100px] ${
               error ? "border-red-500 focus:ring-red-500" : "border-gray-300"
            } ${className}`}
            {...props}
         />
         {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
   );
};

export default TextArea;
