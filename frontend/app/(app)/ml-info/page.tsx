// app/ml-pipeline/page.tsx

import type { ReactNode } from "react";
import Link from "next/link";
import { CircleArrowRight } from "lucide-react";

/* ---------- content ---------- */

const SYSTEM_FLOW: { title: string; meta?: string; body: string; link?: string }[] = [
  {
    title: "User",
    body: "Pastes an SMS message to check.",
    link: "Message submitted",
  },
  {
    title: "Next.js frontend",
    meta: "app/page.tsx → app/api/send-message/route.ts",
    body: "Collects the SMS, validates the request, and forwards it to FastAPI.",
    link: "POST /predict · JSON",
  },
  {
    title: "FastAPI backend",
    meta: "backend/main.py",
    body: "Validates the input, cleans the text, runs the saved pipeline, extracts message indicators, and returns the prediction as JSON.",
    link: "Loaded once at startup",
  },
  {
    title: "Saved ML pipeline",
    meta: "ml/models/scamlens_model.pkl",
    body: "TF-IDF vectorizer followed by Logistic Regression. It converts cleaned text into numbers, then predicts the class and its probabilities.",
    link: "Label · confidence · probabilities · features",
  },
  {
    title: "Results page",
    body: "Shows the verdict, class probabilities, and message indicators.",
  },
];

const TRAINING: { title: string; body: string }[] = [
  {
    title: "Data collection",
    body: "Load LSDST-2022.csv, the SMS phishing dataset, into a Pandas DataFrame.",
  },
  {
    title: "Data cleaning",
    body: "Normalize column names and labels, check missing values, remove duplicates, investigate conflicting labels, and encode the target as 0 = Ham, 1 = Smishing, 2 = Spam.",
  },
  {
    title: "Exploratory data analysis",
    body: "Study class imbalance, message length, URLs, digits, uppercase characters and suspicious vocabulary. Ham differs clearly from suspicious messages, while Smishing and Spam overlap.",
  },
  {
    title: "Text preprocessing",
    body: "Build transformed_text by lowercasing, replacing URLs, money, phone numbers and numbers with placeholder tokens, tokenizing, removing stop words, and stemming with Porter.",
  },
  {
    title: "Train-test split",
    body: "80:20 split, stratified so each set keeps the class proportions. random_state=42.",
  },
  {
    title: "TF-IDF vectorization",
    body: "Learn a vocabulary and inverse-document-frequency weights from the training text only, with max_features=3000. Each SMS becomes a numeric vector.",
  },
  {
    title: "Model experimentation",
    body: "Compare Naive Bayes variants, Logistic Regression, SVM and tree-based models using stratified 5-fold cross-validation. Judge by macro F1, Spam and Smishing recall, precision, and false positives.",
  },
  {
    title: "Final evaluation",
    body: "Score the candidate pipelines on the held-out test set with a classification report and confusion matrix. Logistic Regression is the initial production choice, although SVM reported stronger test results.",
  },
  {
    title: "Serialization",
    body: "Save the complete fitted TF-IDF + Logistic Regression pipeline with pickle as ml/models/scamlens_model.pkl.",
  },
];

const INFERENCE: { title: string; body: string }[] = [
  {
    title: "User enters an SMS",
    body: "For example: “Congratulations! Claim your prize now at www.example.com”.",
  },
  {
    title: "Form and API route",
    body: "Next.js validates the message and sends JSON to FastAPI.",
  },
  {
    title: "Request validation",
    body: "Pydantic checks that text is present and between 1 and 10,000 characters.",
  },
  {
    title: "Text preprocessing",
    body: "transform_text() applies the same cleaning and stemming used in training. URLs become urltoken, money becomes moneytoken, phone numbers become phonetoken, and numbers become numtoken.",
  },
  {
    title: "TF-IDF transformation",
    body: "The saved vectorizer maps the cleaned text onto its learned vocabulary, producing a sparse vector of up to 3,000 features.",
  },
  {
    title: "Logistic Regression prediction",
    body: "predict() selects the class and predict_proba() estimates a probability for each of the three classes.",
  },
  {
    title: "Indicators extracted",
    body: "extract_features() counts digits, URLs, punctuation, length and similar traits from the original message. These are returned alongside the prediction but are not inputs to the classifier.",
  },
  {
    title: "JSON response",
    body: "Label, class ID, confidence, probabilities and features go back to Next.js.",
  },
];

const NOTES: { title: string; body: string }[] = [
  {
    title: "Preprocessing must match training",
    body: "The API has to use exactly the same URL, money, phone, number, stop-word and stemming rules as the notebook. Small differences change predictions.",
  },
  {
    title: "Confidence is not safety",
    body: "Logistic Regression probabilities are estimates, not calibrated guarantees. A high Ham probability does not prove a message is safe.",
  },
  {
    title: "Indicators are not explanations",
    body: "The features field shows measurable traits of the message. It does not say which words drove the prediction. Word-level explanations would need the TF-IDF vocabulary and the model coefficients.",
  },
  {
    title: "Deployment checks",
    body: "Set CORS for the deployed frontend origin, keep the model file and its scikit-learn version compatible, install the NLTK resources the backend needs, and only load pickle files you trust.",
  },
];

const REQUEST = `{
  "text": "Congratulations! You have won a prize. Claim now."
}`;

const RESPONSE = `{
  "label": "smishing",
  "class_id": 1,
  "confidence": 0.8751,
  "probabilities": {
    "ham": 0.1215,
    "smishing": 0.8751,
    "spam": 0.0034
  },
  "features": {
    "char_count": 49,
    "word_count": 8,
    "digit_count": 0,
    "uppercase_count": 3,
    "special_char_count": 3,
    "exclamation_count": 1,
    "question_count": 0,
    "url_count": 0,
    "has_url": 0,
    "has_email": 0,
    "has_phone": 0,
    "has_money_symbol": 0
  }
}`;

const TREE = `ScamLens_ML/
├── ml/
│   ├── data/
│   │   └── LSDST-2022.csv
│   ├── models/
│   │   └── scamlens_model.pkl
│   ├── backend/
│   │   ├── main.py
│   │   ├── features.py
│   │   └── requirements.txt
│   └── ScamLens.ipynb
└── frontend/
    ├── app/
    │   ├── page.tsx
    │   ├── ml-pipeline/page.tsx
    │   ├── api/send-message/route.ts
    │   └── schemas/messageSchema.ts
    └── components/`;

/* ---------- small building blocks ---------- */

const box = "rounded-xl border border-white/[0.1] w-7/12 mx-auto";

function ArrowDown() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16" aria-hidden>
      <path
        d="M8 3v10M4 9l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Section({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4 mx-auto">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl text-center font-semibold tracking-[-0.01em] text-white/90">
          {title}
        </h2>
        {intro && (
          <p className="text-[14px] text-center leading-relaxed text-white/50">
            {intro}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}

function Steps({ items }: { items: { title: string; body: string }[] }) {
  return (
    <ol className={`${box} divide-y w-9/12 divide-white/[0.1]`}>
      {items.map((s, i) => (
        <li key={s.title} className="flex gap-4 px-5 py-4">
          <span className="w-5 shrink-0 pt-px text-[13px] tabular-nums text-white/35">
            {i + 1}
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-[14px] font-medium text-white/90">{s.title}</p>
            <p className="text-[13px] leading-relaxed text-white/50">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Code({ label, children }: { label: string; children: string }) {
  return (
    <div className="flex min-w-0 mx-auto flex-col gap-2">
      <p className="ml-1 text-[12px] text-white/40 text-center">{label}</p>
      <pre
        className={`${box}  w-full overflow-x-auto px-5 py-4 font-mono text-[12px] leading-relaxed text-white/70 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent`}
      >
        {children}
      </pre>
    </div>
  );
}

/* ---------- page ---------- */

export default function MlPipelinePage() {
  return (
    <main className="i-fonts mx-auto flex w-full max-w-4xl flex-col gap-16 px-5 pb-24 pt-20 font-normal text-i-white">
      {/* header */}
      <header className="flex flex-col gap-4 animate-[fadeSlideDown_0.6s_ease_both]">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 text-[13px] text-white/45 transition-colors duration-150 hover:text-white/80"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 16 16" aria-hidden>
            <path
              d="M13 8H3M7 4L3 8l4 4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to analyzer
        </Link>

        <h1 className="text-4xl font-semibold tracking-tight text-center text-[#f5f5f7e4]">
          How SMS Threat Analyzer works
        </h1>
        <p className="w-8/12 text-center mx-auto text-[15px] leading-relaxed text-white/50">
          SMS Threat Analyzer classifies an SMS as Ham, Smishing or Spam. The model is
          trained once in a Jupyter notebook and saved. Every prediction after
          that uses the saved model through an API. Nothing is retrained when
          you submit a message.
        </p>
      </header>

      {/* 1. system architecture */}
      <Section
        title="System architecture"
        intro="Three layers: the saved ML pipeline, a FastAPI inference backend, and the Next.js frontend."
      >
        <div className="flex flex-col items-stretch text-center">
          {SYSTEM_FLOW.map((n) => (
            <div key={n.title} className="flex flex-col items-stretch">
              <div className={`${box} flex flex-col gap-1 px-5 py-4`}>
                <p className="text-[14px] font-medium text-white/90">{n.title}</p>
                {n.meta && (
                  <p className="font-mono text-[12px] text-white/40">{n.meta}</p>
                )}
                <p className="text-[13px] leading-relaxed text-white/50">{n.body}</p>
              </div>

              {n.link && (
                <div className="flex items-center gap-3 py-2 pl-6 text-white/35 text-center mx-auto">
                  <ArrowDown />
                  <span className="text-[12px]">{n.link}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* 2. training */}
      <Section
        title="Training pipeline"
        intro="This runs in the notebook, before the application serves any predictions."
      >
        <Steps items={TRAINING}  />
      </Section>

      {/* 3. what is saved */}
      <Section
        title="What gets saved"
        intro="The notebook saves one fitted scikit-learn Pipeline. FastAPI loads it as is, so it never fits another vectorizer."
      >
        <div className={`${box} flex flex-col gap-4 p-5`}>
          <p className="font-mono text-[12px] text-white/40">scamlens_model.pkl</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className={`${box} flex flex-col gap-1 px-4 py-3`}>
              <p className="text-[14px] font-medium text-white/90">
                Fitted TF-IDF vectorizer
              </p>
              <p className="text-[13px] leading-relaxed text-white/50">
                Vocabulary and learned IDF weights.
              </p>
            </div>

            <div className={`${box} flex flex-col gap-1 px-4 py-3`}>
              <p className="text-[14px] font-medium text-white/90">
                Fitted Logistic Regression
              </p>
              <p className="text-[13px] leading-relaxed text-white/50">
                Learned coefficients and class boundaries.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* 4. inference */}
      <Section
        title="What happens when you submit a message"
        intro="This runs for every request, after the API has loaded the saved model at startup."
      >
        <Steps items={INFERENCE} />
      </Section>

      {/* 5. API contract */}
      <Section
        title="API contract"
        intro="The frontend and backend exchange JSON over HTTP. The response below is a real result from the running API."
      >
        <div className=" gap-4 md:grid-cols-2">
          <Code label="POST /predict · request">{REQUEST}</Code>
          <Code label="200 · response">{RESPONSE}</Code>
        </div>
        <p className="text-[13px] leading-relaxed text-white/45">
          The three probabilities add up to about 1, allowing for rounding.
        </p>
      </Section>

      {/* 6. folder structure */}
      <Section
        title="Project structure"
        intro="How the code is organized. The API resolves the model path from the backend folder, so the two stay side by side."
      >
        <Code label="Folders">{TREE}</Code>
      </Section>

      {/* 7. notes */}
      <Section
        title="Things worth knowing"
        intro="Limits and checks to keep in mind when reading a result."
      >
        <ul className={`${box} divide-y divide-white/[0.1]`}>
          {NOTES.map((n) => (
            <li key={n.title} className="flex flex-col gap-1 px-5 py-4">
              <p className="text-[14px] font-medium text-white/90">{n.title}</p>
              <p className="text-[13px] leading-relaxed text-white/50">{n.body}</p>
            </li>
          ))}
        </ul>
      </Section>

      {/* summary + CTA */}
      <section className="flex flex-col gap-6">
        <div className={`${box} flex flex-col gap-3 p-5 font-mono text-[12px] leading-relaxed text-white/60`}>
          <p>
            <span className="text-white/35">Training </span>
            Dataset → Cleaning → EDA → Preprocessing → TF-IDF → Model → Cross-validation → Test → Pickle
          </p>
          <p>
            <span className="text-white/35">Serving </span>
            UI → API route → FastAPI → Preprocessing → Saved pipeline → Prediction → JSON → Results
          </p>
        </div>

        <p className="text-[14px] leading-relaxed text-center text-white/50">
          The notebook builds and saves the model, FastAPI serves it, and
          Next.js makes it usable.
        </p>

        <div className="flex items-center gap-4 mx-auto">
          <Link
            href="/"
             className={`animation-3 shrink-0 h-10 px-4 flex items-center gap-2
    rounded-xl border text-[13px] font-medium cursor-pointer 
    transition-all duration-300 ease-out
    disabled:cursor-not-allowed bg-i-blue-button2
    active:scale-[0.96] hover:text-white/90 w-fit 
    }`}
          >
            Try the analyzer
            <CircleArrowRight className="h-4.5 w-4.5" />
          </Link>
        </div>
      </section>
    </main>
  );
}