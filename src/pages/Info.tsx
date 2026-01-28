import { MobileLayout } from "@/components/MobileLayout";
import { InfoList } from "@/components/info/InfoList";
import { Info as InfoIcon } from "lucide-react";

export default function Info() {
  return (
    <MobileLayout>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="flex items-center gap-2 mb-4">
          <InfoIcon className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-semibold">Informasi</h1>
        </div>
        <InfoList />
      </div>
    </MobileLayout>
  );
}
