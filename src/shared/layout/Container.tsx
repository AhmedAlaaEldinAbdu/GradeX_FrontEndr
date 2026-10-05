import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const MainContainer: React.FC<ContainerProps> = ({ children, ...rest }) => {
  const { pathname } = useLocation();
  const mainRef = useRef<HTMLElement>(null);

  // This <main> is the actual scroll container (the page uses h-screen
  // overflow-hidden), so window.scrollTo would be a no-op here — reset this
  // element instead whenever the route path changes.
  useEffect(() => {
    mainRef.current?.scrollTo({ top: 0, left: 0 });
  }, [pathname]);

  return (
    <main
      ref={mainRef}
      className="flex-1 [scrollbar-width:thin] overflow-y-auto bg-gray-50 p-6"
      {...rest}
    >
      {children}
    </main>
  );
};

export default MainContainer;
