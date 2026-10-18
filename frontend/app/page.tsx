"use client";

import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import Image from "next/image";
import { ArrowUp, CircleArrowRight, CircleDollarSign, Link2, Loader2, Mail, Megaphone, Phone, RotateCcw , SendHorizonal, ShieldAlert, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import Link from "next/link";

/* ---------- types ---------- */

type Label = "ham" | "smishing" | "spam";

interface Prediction {
  label: Label;
  class_id: number;
  confidence: number;
  probabilities: Record<Label, number>;
  features: Record<string, number>;
}

/* ---------- static content ---------- */

const LABEL_ORDER: Label[] = ["ham", "smishing", "spam"];

const VERDICTS: Record<
  Label,
  { name: string; title: string; summary: string; color: string; Icon: LucideIcon }
> = {
  ham: {
    name: "Legitimate",
    title: "Looks legitimate",
    summary: "This message reads like a normal, everyday text.",
    color: "#32d74b",
    Icon: ShieldCheck,
  },
  smishing: {
    name: "Smishing",
    title: "Likely a phishing attempt",
    summary:
      "This message resembles texts that try to trick people into clicking, paying, or sharing details.",
    color: "#ff453a",
    Icon: ShieldAlert,
  },
  spam: {
    name: "Spam",
    title: "Likely spam",
    summary:
      "This message resembles unwanted promotions or bulk messages. It may not be a scam.",
    color: "#ff9f0a",
    Icon: Megaphone,
  },
};

const SIGNALS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "has_url", label: "Link", Icon: Link2 },
  { key: "has_email", label: "Email address", Icon: Mail },
  { key: "has_phone", label: "Phone number", Icon: Phone },
  { key: "has_money_symbol", label: "Money symbol", Icon: CircleDollarSign },
];

const STATS: { key: string; label: string }[] = [
  { key: "char_count", label: "characters" },
  { key: "word_count", label: "words" },
  { key: "digit_count", label: "digits" },
  { key: "uppercase_count", label: "capitals" },
  { key: "special_char_count", label: "special characters" },
  { key: "exclamation_count", label: "exclamation marks" },
  { key: "question_count", label: "question marks" },
];

const EXAMPLES: { name: string; text: string }[] = [
  {
    name: "Friendly text",
    text: "Hey, are we still meeting at 6 to finish the project slides?",
  },
  {
    name: "Account alert",
    text: "Your bank account has been suspended. Verify your details now at http://secure-bank-login.co/verify",
  },
  {
    name: "Promo offer",
    text: "Weekend sale! Get 50% off all shoes. Reply STOP to unsubscribe.",
  },
];

const STEPS: { title: string; body: string }[] = [
  {
    title: "Paste a message",
    body: "Copy any SMS you're unsure about into the box above.",
  },
  {
    title: "The model reads it",
    body: "The text is converted into numbers using TF-IDF, then a trained classifier scores it.",
  },
  {
    title: "Review the result",
    body: "You get a verdict, how sure the model is, and what it measured in the message.",
  },
];

/* ---------- helpers ---------- */

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

function confidenceWord(c: number) {
  if (c >= 0.8) return "High confidence";
  if (c >= 0.6) return "Moderate confidence";
  return "Low confidence";
}

const card =
  "rounded-3xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl";

/* ---------- page ---------- */

export default function Page() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [result, setResult] = useState<Prediction | null>(null);
  const [analyzedText, setAnalyzedText] = useState("");
  const [barsReady, setBarsReady] = useState(false);

  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [result]);

  async function onSend() {
    if (!content.trim()) {
      toast.error("Message cannot be empty");
      setErrorMessage("Please enter an SMS to analyze");
      return;
    }

    setErrorMessage("");

    try {
      setIsSubmitting(true);
      setBarsReady(false);

      const response = await axios.post<Prediction>("/api/send-message", {
        text: content,
      });

      setResult(response.data);
      setAnalyzedText(content.trim());

      // let the bars mount at 0%, then animate to their value
      requestAnimationFrame(() =>
        requestAnimationFrame(() => setBarsReady(true))
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "Unable to analyze the message";
        toast.error(message);
        setErrorMessage(message);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  function reset() {
    setResult(null);
    setContent("");
    setAnalyzedText("");
    setErrorMessage("");
    setBarsReady(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const verdict = result ? VERDICTS[result.label] : null;

  return (
    <main className="i-fonts mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 pb-20 pt-20 font-normal text-i-white">
      <style>{`
        @keyframes sl-rise {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sl-rise { animation: sl-rise 0.5s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .sl-rise { animation: none; }
        }
      `}</style>

      {/* header */}
      <header className="flex flex-col items-center gap-3 text-center">
       
       <a
        href="https://devmalik-portfolio.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative inline-flex"
      >
        <Image
          src="/sms_threact_icon_macc.png"
          alt="ScamLens"
          width={72}
          height={72}
          priority
          className="h-[72px] w-[72px] cursor-pointer drop-shadow-[0_8px_24px_rgba(0,0,0,0.25)]"
        />

        <span className="absolute -right-32 top-6 z-50 -translate-y-full whitespace-nowrap rounded-lg bg-i-black3 i-fonts px-3 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100">
          View my portfolio ↗
        </span>
      </a>
       

        <h1 className="text-4xl font-semibold tracking-tight text-[#f5f5f7e4]">
          SMS Threat Intelligence and Classification Framework
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-white/50">
          Paste a text message to see whether it looks legitimate, like
          phishing, or like spam.
        </p>
      </header>

      {/* composer */}
      <section className="flex flex-col gap-3">
        <div
          className={`${card} p-4 transition-shadow duration-200 focus-within:ring-2 focus-within:ring-i-black4`}
        >
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !isSubmitting) {
                onSend();
              }
            }}
            rows={4}
            placeholder="Paste your SMS message here…"
            aria-label="SMS message"
            className="w-full resize-none bg-transparent text-[15px] leading-relaxed text-i-white placeholder:text-white/30 focus:outline-none"
          />

          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs tabular-nums text-white/30">
              {content.length > 0 ? `${content.length} characters` : "Click Enter to analyze"}
            </span>

            <button
              onClick={onSend}
              disabled={isSubmitting}
              className={`animation-3 shrink-0 h-10 px-4 flex items-center gap-2
    rounded-xl border text-[13px] font-medium cursor-pointer
    transition-all duration-300 ease-out
    disabled:cursor-not-allowed
    active:scale-[0.96] hover:text-white/90 w-fit
    ${
      isSubmitting
        ? "bg-[#32d74b]/10 border-[#32d74b]/20 text-white/80"
        : "bg-white/[0.07] border-white/[0.1] text-white/70 hover:bg-white/[0.11] hover:text-white/90"
    }`}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SendHorizonal className="h-4 w-4" strokeWidth={2.5} />
              )}
              {isSubmitting ? "Analyzing…" : "Analyze message"}
            </button>
          </div>
        </div>

        <p
          role="alert"
          className={`ml-2 min-h-[18px] text-[12px] text-[#ff453a] transition-all duration-300 ${
            errorMessage ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
          }`}
        >
          {errorMessage}
        </p>

        {/* examples */}
        <div className="-mt-2 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs text-white/35">Try an example</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.name}
              onClick={() => {
                setContent(ex.text);
                setErrorMessage("");
              }}
              className="cursor-pointer rounded-full border border-white/[0.1] bg-white/[0.06] px-3 py-1.5 text-xs text-white/65 transition-all duration-200 hover:bg-white/[0.11] hover:text-white/90 active:scale-[0.96]"
            >
              {ex.name}
            </button>
          ))}
        </div>
      </section>

      {/* ---------- results ---------- */}
      {result && verdict ? (
        <div
          ref={resultRef}
          className={`sl-rise flex scroll-mt-8 flex-col gap-4 transition-opacity duration-200 ${
            isSubmitting ? "opacity-50" : "opacity-100"
          }`}
        >
          {/* verdict */}
          <div className={`${card} relative overflow-hidden p-6`}>
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
              style={{ backgroundColor: `${verdict.color}26` }}
            />
            <div className="relative flex items-start gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                style={{ backgroundColor: `${verdict.color}22`, color: verdict.color }}
              >
                <verdict.Icon className="h-6 w-6" strokeWidth={2} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="text-xl font-semibold tracking-tight text-white/95">
                    {verdict.title}
                  </h2>
                  <span className="text-sm tabular-nums text-white/50">
                    {pct(result.confidence)} · {confidenceWord(result.confidence)}
                  </span>
                </div>
                <p className="mt-1 text-[14px] leading-relaxed text-white/55">
                  {verdict.summary}
                </p>
              </div>
            </div>

            <p className="relative mt-5 line-clamp-2 rounded-2xl bg-black/25 px-4 py-3 text-[13px] leading-relaxed text-white/45">
              {analyzedText}
            </p>
          </div>

          {/* probabilities */}
          <div className={`${card} p-6`}>
            <h3 className="text-[13px] font-medium text-white/80">
              How the model scored it
            </h3>
            <div className="mt-4 flex flex-col gap-4">
              {LABEL_ORDER.map((l) => {
                const p = result.probabilities[l] ?? 0;
                const isTop = l === result.label;
                return (
                  <div key={l} className="flex flex-col gap-1.5">
                    <div className="flex items-baseline justify-between text-[13px]">
                      <span className={isTop ? "text-white/90" : "text-white/50"}>
                        {VERDICTS[l].name}
                      </span>
                      <span className="tabular-nums text-white/50">{pct(p)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className="h-full rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
                        style={{
                          width: barsReady ? `${Math.max(p * 100, p > 0 ? 1.5 : 0)}%` : "0%",
                          backgroundColor: isTop ? VERDICTS[l].color : "rgba(255,255,255,0.28)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* message details */}
          <div className={`${card} p-6`}>
            <h3 className="text-[13px] font-medium text-white/80">
              What we found in the message
            </h3>

            <div className="mt-4 divide-y divide-white/[0.06] overflow-hidden rounded-2xl bg-black/20">
              {SIGNALS.map(({ key, label, Icon }) => {
                const found = Boolean(result.features[key]);
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between px-4 py-3 text-[14px]"
                  >
                    <span className="flex items-center gap-3 text-white/75">
                      <Icon className="h-4 w-4 text-white/40" />
                      {label}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs ${
                        found
                          ? "bg-i-blue-button/15 text-i-blue-button2"
                          : "text-white/30"
                      }`}
                    >
                      {found ? "Detected" : "Not found"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {STATS.map(({ key, label }) => (
                <span
                  key={key}
                  className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-white/55"
                >
                  <span className="mr-1 font-medium tabular-nums text-white/85">
                    {result.features[key] ?? 0}
                  </span>
                  {label}
                </span>
              ))}
            </div>

            <p className="mt-4 text-xs leading-relaxed text-white/35">
              These are measurements of the message, not the reasons behind the
              verdict. The model decides mainly from the words used.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={reset}
              className="flex h-10 cursor-pointer items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.07] px-5 text-[13px] font-medium text-white/70 transition-all duration-200 hover:bg-white/[0.11] hover:text-white/90 active:scale-[0.96]"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Analyze another message
            </button>
            <p className="max-w-md text-center text-xs leading-relaxed text-white/30">
              A prediction isn&apos;t a guarantee. Don&apos;t treat a message as
              safe just because it was marked legitimate.
            </p>
          </div>
        </div>
      ) : (
        /* ---------- empty state: about ScamLens ---------- */
        <div className="sl-rise flex flex-col gap-8">
          {/* outcomes */}
          <section className="flex flex-col gap-3">
            <h2 className="ml-2 text-[13px] font-medium text-white/60">
              What it can tell you
            </h2>
            <div className={`${card} divide-y divide-white/[0.06] overflow-hidden`}>
              {LABEL_ORDER.map((l) => {
                const v = VERDICTS[l];
                const blurb: Record<Label, string> = {
                  ham: "A normal message from someone or something you'd expect.",
                  smishing: "Tries to trick you into clicking, paying, or sharing details.",
                  spam: "Unwanted promotions or bulk messages, not always a scam.",
                };
                return (
                  <div key={l} className="flex items-center gap-4 px-5 py-4">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                      style={{ backgroundColor: `${v.color}22`, color: v.color }}
                    >
                      <v.Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[14px] font-medium text-white/90">{v.name}</p>
                      <p className="text-[13px] leading-relaxed text-white/45">
                        {blurb[l]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* how it works */}
          <section className="flex flex-col gap-3">
            <h2 className="ml-2 text-[13px] font-medium text-white/60">
              How it works
            </h2>
            <div className={`${card} divide-y divide-white/[0.06] overflow-hidden`}>
              {STEPS.map((s, i) => (
                <div key={s.title} className="flex items-start gap-4 px-5 py-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.08] text-xs font-medium tabular-nums text-white/70">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[14px] font-medium text-white/90">{s.title}</p>
                    <p className="text-[13px] leading-relaxed text-white/45">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <p className="mx-auto max-w-md text-center text-xs leading-relaxed text-white/30">
            Results depend on the training data, so a message marked legitimate isn&apos;t automatically safe.
          </p>

           <div className="flex items-center gap-4 mx-auto">
          <Link
            href="/ml-info"
             className={` w-full h-10 px-4 flex items-center gap-2
              rounded-xl border text-[13px] font-medium cursor-pointer 
              transition-all duration-300 ease-out
              disabled:cursor-not-allowed bg-i-blue-button2
              active:scale-[0.96] hover:text-white/90  
              }`} >
            See the ml pipeline behind it
            <CircleArrowRight className="h-4.5 w-4.5" />
          </Link>
        </div>

        </div>

        
      )}
    </main>
  );
}