import { createContext, ReactNode, useCallback, useContext, useState } from "react";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";

interface ChangePasswordContextValue {
  open: () => void;
  close: () => void;
}

const ChangePasswordContext = createContext<ChangePasswordContextValue | undefined>(undefined);

export const ChangePasswordProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <ChangePasswordContext.Provider value={{ open, close }}>
      {children}
      <ChangePasswordDialog open={isOpen} onOpenChange={setIsOpen} />
    </ChangePasswordContext.Provider>
  );
};

export const useChangePassword = () => {
  const ctx = useContext(ChangePasswordContext);
  if (!ctx)
    throw new Error("useChangePassword must be used within ChangePasswordProvider");
  return ctx;
};
