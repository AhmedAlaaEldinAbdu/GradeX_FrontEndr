import React from "react";

interface LoadingProps {
   size?: "sm" | "md" | "lg";
   fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
   size = "md",
   fullScreen = false,
}) => {
   const sizes = {
      sm: "w-6 h-6",
      md: "w-12 h-12",
      lg: "w-16 h-16",
   };

   const spinner = (
      <div
         className={`${sizes[size]} border-4 border-green-200 border-t-green-600 rounded-full animate-spin`}
      ></div>
   );

   if (fullScreen) {
      return (
         <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
            {spinner}
         </div>
      );
   }

   return <div className="flex items-center justify-center p-8">{spinner}</div>;
};

export default Loading;
