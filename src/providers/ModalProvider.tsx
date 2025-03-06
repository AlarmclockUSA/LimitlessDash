'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import EmailModal from '@/components/EmailModal';

interface ModalContextType {
  showEmailModal: boolean;
  setShowEmailModal: (show: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if user has already entered email
    const hasEmail = localStorage.getItem('eventUserEmail');
    
    if (!hasEmail) {
      // Show modal after a short delay for better UX
      const timer = setTimeout(() => {
        setShowEmailModal(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Don't render anything on the server
  if (!mounted) return <>{children}</>;

  return (
    <ModalContext.Provider value={{ showEmailModal, setShowEmailModal }}>
      {children}
      {showEmailModal && <EmailModal onClose={() => setShowEmailModal(false)} />}
    </ModalContext.Provider>
  );
};

export default ModalProvider; 