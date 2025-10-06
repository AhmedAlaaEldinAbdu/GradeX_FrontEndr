import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
   variant?: "primary" | "secondary" | "outline" | "danger";
   size?: "sm" | "md" | "lg";
   icon?: React.ReactNode;
   children: React.ReactNode;
   fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
   variant = "primary",
   size = "md",
   icon,
   children,
   fullWidth = false,
   className = "",
   ...props
}) => {
   const baseStyles =
      "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

   const variants = {
      primary:
         "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm hover:shadow-md",
      secondary:
         "bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400",
      outline:
         "bg-white text-green-600 border-2 border-green-600 hover:bg-green-50 active:bg-green-100",
      danger:
         "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm hover:shadow-md",
   };

   const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
   };

   const widthClass = fullWidth ? "w-full" : "";

   return (
      <button
         className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
         {...props}
      >
         {icon && <span>{icon}</span>}
         <span>{children}</span>
      </button>
   );
};

export default Button;
