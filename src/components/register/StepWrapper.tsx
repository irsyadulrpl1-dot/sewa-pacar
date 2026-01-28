import { ReactNode, useEffect } from "react";
import { motion } from "framer-motion";

interface StepWrapperProps {
  children: ReactNode;
  keyId: string | number;
}

export default function StepWrapper({ children, keyId }: StepWrapperProps) {
  useEffect(() => {
    const first = document.querySelector<HTMLInputElement>("input, select, textarea, button");
    first?.focus();
  }, [keyId]);
  return (
    <motion.div
      key={keyId}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -24 }}
      transition={{ duration: 0.35 }}
      className="space-y-4"
    >
      {children}
    </motion.div>
  );
}
