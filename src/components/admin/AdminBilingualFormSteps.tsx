export type AdminContentLanguage = "en" | "gu";

interface AdminBilingualFormStepsProps {
  currentStep: AdminContentLanguage;
}

export default function AdminBilingualFormSteps({
  currentStep,
}: AdminBilingualFormStepsProps) {
  const isGujaratiStep = currentStep === "gu";

  return (
    <div
      aria-label={`Step ${isGujaratiStep ? 2 : 1} of 2: ${isGujaratiStep ? "Gujarati" : "English"} content`}
      className="flex min-w-0 items-center gap-2 text-xs font-semibold"
    >
      <span
        className={`flex h-9 items-center gap-2 rounded-xl border px-3 ${
          isGujaratiStep
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border-orange-200 bg-orange-50 text-orange-700"
        }`}
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white ${
            isGujaratiStep ? "bg-emerald-600" : "bg-orange-600"
          }`}
        >
          1
        </span>
        English
      </span>
      <span aria-hidden="true" className="h-px w-4 bg-slate-300" />
      <span
        className={`flex h-9 items-center gap-2 rounded-xl border px-3 ${
          isGujaratiStep
            ? "border-orange-200 bg-orange-50 text-orange-700"
            : "border-slate-200 bg-slate-50 text-slate-500"
        }`}
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] text-white ${
            isGujaratiStep ? "bg-orange-600" : "bg-slate-400"
          }`}
        >
          2
        </span>
        Gujarati
      </span>
    </div>
  );
}
