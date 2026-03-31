import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle, Send, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FormState {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
}

export function LeadForm() {
  const { t } = useLanguage();
  const [form, setForm] = useState<FormState>({ name: "", email: "", phone: "", service: "", message: "" });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const googleScriptUrl = import.meta.env.VITE_GOOGLE_SCRIPT_URL?.trim();

  const validate = () => {
    const newErrors: Partial<FormState> = {};
    if (!form.name.trim()) newErrors.name = "Required";
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Required";
    if (!form.phone.trim()) newErrors.phone = "Required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("loading");

    const submittedAt = new Date().toISOString();

    try {
      if (googleScriptUrl) {
        // Apps Script web apps are most reliable with a simple form-encoded POST.
        const body = new URLSearchParams({
          submittedAt,
          name: form.name,
          email: form.email,
          phone: form.phone,
          service: form.service,
          message: form.message,
          pageUrl: window.location.href,
        });

        await fetch(googleScriptUrl, {
          method: "POST",
          body,
          mode: "no-cors",
        });
      } else {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });

        if (!res.ok) throw new Error("Server error");
      }

      setStatus("success");
      setForm({ name: "", email: "", phone: "", service: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

  const inputClass = (field: keyof FormState) =>
    `w-full px-4 py-3 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#003d2b]/30 transition-all ${
      errors[field] ? "border-red-400 bg-red-50" : "border-border/60 hover:border-[#003d2b]/30"
    }`;

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle className="w-16 h-16 text-[#003d2b] mb-4" />
        <p className="text-xl font-semibold text-foreground">{t.home.formSuccess}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">{t.home.formName} *</Label>
          <input
            type="text"
            value={form.name}
            onChange={handleChange("name")}
            className={inputClass("name")}
            placeholder="Alex Kovalenko"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">{t.home.formPhone} *</Label>
          <input
            type="tel"
            value={form.phone}
            onChange={handleChange("phone")}
            className={inputClass("phone")}
            placeholder="+1 (403) 555-0123"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">{t.home.formEmail} *</Label>
        <input
          type="email"
          value={form.email}
          onChange={handleChange("email")}
          className={inputClass("email")}
          placeholder="alex@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">{t.home.formService}</Label>
        <select
          value={form.service}
          onChange={handleChange("service")}
          className="w-full px-4 py-3 rounded-xl border border-border/60 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#003d2b]/30 hover:border-[#003d2b]/30 transition-all"
        >
          <option value="">{t.home.formServiceDefault}</option>
          <option value="buying">{t.home.formServiceBuying}</option>
          <option value="refinance">{t.home.formServiceRefinance}</option>
          <option value="renewal">{t.home.formServiceRenewal}</option>
          <option value="other">{t.home.formServiceOther}</option>
        </select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-sm font-medium">{t.home.formMessage}</Label>
        <textarea
          value={form.message}
          onChange={handleChange("message")}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-border/60 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#003d2b]/30 hover:border-[#003d2b]/30 transition-all resize-none"
          placeholder="..."
        />
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {t.home.formError}
        </div>
      )}

      <Button
        type="submit"
        disabled={status === "loading"}
        className="w-full h-12 bg-[#003d2b] hover:bg-[#004d37] text-white font-semibold rounded-xl text-base"
      >
        {status === "loading" ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {t.home.formSubmit}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            {t.home.formSubmit}
          </span>
        )}
      </Button>
    </form>
  );
}
