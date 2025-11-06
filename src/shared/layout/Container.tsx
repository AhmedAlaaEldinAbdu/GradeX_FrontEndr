import React from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const MainContainer: React.FC<ContainerProps> = ({ children, ...rest }) => {
  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 p-6" {...rest}>
      {children}
    </main>
  );
};

export default MainContainer;
