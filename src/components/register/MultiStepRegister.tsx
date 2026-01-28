import { useEffect, useState } from "react";
import StepIndicator from "./StepIndicator";
import StepOne, { stepOneSchema } from "./StepOne";
import StepTwo, { stepTwoSchema } from "./StepTwo";
import StepThree, { stepThreeSchema } from "./StepThree";
import StepReview from "./StepReview";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface Props {
  data: any;
  setData: (fn: (prev: any) => any) => void;
  loading: boolean;
  onFinalSubmit: () => void;
}

export default function MultiStepRegister({ data, setData, loading, onFinalSubmit }: Props) {
  const [step, setStep] = useState<number>(() => {
    const saved = localStorage.getItem("register_progress_step");
    return saved ? Number(saved) : 1;
  });
  const { toast } = useToast();
  useEffect(() => {
    localStorage.setItem("register_progress_data", JSON.stringify(data));
    localStorage.setItem("register_progress_step", String(step));
    const beforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [data, step]);
  useEffect(() => {
    const saved = localStorage.getItem("register_progress_data");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData((prev: any) => ({ ...prev, ...parsed }));
      } catch {}
    }
  }, []);
  const goNext = () => setStep((s) => Math.min(4, s + 1));
  const goBack = () => setStep((s) => Math.max(1, s - 1));
  const onChange = (patch: any) => setData((prev: any) => ({ ...prev, ...patch }));
  const quickValidate = () => {
    if (step === 1) return stepOneSchema.safeParse(data).success;
    if (step === 2) return stepTwoSchema.safeParse(data).success;
    if (step === 3) return stepThreeSchema.safeParse(data).success;
    return true;
  };
  useEffect(() => {
    if (!quickValidate()) {
      toast({ title: "Lengkapi data di step ini", variant: "destructive" });
    }
  }, [step]);
  return (
    <div className="space-y-6">
      <StepIndicator current={step} />
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="s1">
            <StepOne data={data} onChange={onChange} onNext={goNext} />
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="s2">
            <StepTwo data={data} onChange={onChange} onNext={goNext} onBack={goBack} />
          </motion.div>
        )}
        {step === 3 && (
          <motion.div key="s3">
            <StepThree data={data} onChange={onChange} onNext={goNext} onBack={goBack} />
          </motion.div>
        )}
        {step === 4 && (
          <motion.div key="s4">
            <StepReview data={data} onChange={onChange} onSubmit={onFinalSubmit} onBack={goBack} loading={loading} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
