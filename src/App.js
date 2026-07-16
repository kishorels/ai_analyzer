import { useCallback, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  FileText,
  Loader2,
  Mail,
  MessageSquare,
  Sparkles,
  Upload,
  User,
  X,
} from "lucide-react";

const N8N_WEBHOOK_URL = process.env.REACT_APP_N8N_WEBHOOK_URL;

const FONT_IMPORT =
  "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap');";

export default function ResumeAnalyzer() {
  const [form, setForm] = useState({ name: "", email: "", jobTitle: "", jobDescription: "" });
  const [resumeFile, setResumeFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const updateField = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFile = (file) => {
    if (!file) return;
    const ext = "." + file.name.split(".").pop().toLowerCase();
    if (ext !== ".pdf") {
      setErrorMsg("Please attach your resume as a PDF file only.");
      return;
    }
    setErrorMsg("");
    setResumeFile(file);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    handleFile(e.dataTransfer.files?.[0]);
  }, []);

  const canSubmit =
    form.name.trim() &&
    form.email.trim() &&
    form.jobDescription.trim().length > 30 &&
    resumeFile &&
    status !== "submitting";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      setErrorMsg(!resumeFile ? "Attach your resume to continue." : "Fill in every field - the job description needs a little more detail.");
      return;
    }
    setStatus("submitting");
    setErrorMsg("");

    try {
      if (!N8N_WEBHOOK_URL) {
        throw new Error("Missing REACT_APP_N8N_WEBHOOK_URL");
      }

      const payload = new FormData();
      payload.append("name", form.name);
      payload.append("email", form.email);
      payload.append("jobTitle", form.jobTitle);
      payload.append("jobDescription", form.jobDescription);
      payload.append("resume", resumeFile);

      const res = await fetch(N8N_WEBHOOK_URL, { method: "POST", body: payload });
      if (!res.ok) {
        let message = `Webhook responded with ${res.status}.`;
        try {
          const body = await res.json();
          message = body?.hint || body?.message || message;
        } catch {
          try {
            const text = await res.text();
            message = text || message;
          } catch {
            // Keep the status-only message when the response body cannot be read.
          }
        }
        throw new Error(message);
      }

      let data = null;
      try {
        data = await res.json();
      } catch {
        // Some n8n workflows respond without JSON; the email report can still be sent.
      }

      setPreview(data && typeof data.matchScore !== "undefined" ? data : null);
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err?.message || "The scan did not go through. Check your connection and try again.");
    }
  };

  const reset = () => {
    setForm({ name: "", email: "", jobTitle: "", jobDescription: "" });
    setResumeFile(null);
    setPreview(null);
    setStatus("idle");
    setErrorMsg("");
  };

  return (
    <main className="ra-root">
      <style>{`
        ${FONT_IMPORT}

        .ra-root {
          --page: #f6faff;
          --panel: #ffffff;
          --mint: #dcf6ee;
          --sky: #dcebff;
          --peach: #ffe8db;
          --aqua: #1a9a9c;
          --blue: #2f5fd6;
          --ink: #16203a;
          --muted: #5f6c81;
          --soft-text: #93a0b3;
          --line: #e1e9f4;
          --danger: #c8452f;
          min-height: 100dvh;
          width: 100%;
          overflow-x: hidden;
          color: var(--ink);
          font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background:
            radial-gradient(circle at 6% 8%, rgba(220, 246, 238, 0.9), transparent 30%),
            radial-gradient(circle at 96% 0%, rgba(220, 235, 255, 0.9), transparent 32%),
            linear-gradient(150deg, #fbfdff 0%, var(--page) 45%, #fff8f3 100%);
          position: relative;
        }

        .ra-root::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.4;
          background-image:
            linear-gradient(rgba(47, 95, 214, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(47, 95, 214, 0.05) 1px, transparent 1px);
          background-size: 32px 32px;
          mask-image: linear-gradient(to bottom, #000 0%, transparent 65%);
        }

        .ra-root * { box-sizing: border-box; }

        .ra-shell {
          width: min(1280px, calc(100% - 40px));
          min-height: 100dvh;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          padding: clamp(10px, 2.4vh, 20px) 0;
          display: grid;
          grid-template-rows: auto minmax(0, 1fr);
          gap: clamp(10px, 1.8vh, 16px);
        }

        .ra-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex: 0 0 auto;
        }

        .ra-logo {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          font-size: 14px;
          font-weight: 800;
          letter-spacing: -0.01em;
        }

        .ra-logo-mark {
          width: 34px;
          height: 34px;
          border-radius: 11px;
          display: grid;
          place-items: center;
          color: #ffffff;
          background: linear-gradient(135deg, var(--blue), var(--aqua));
          box-shadow: 0 10px 22px rgba(47, 95, 214, 0.24);
        }

        .ra-header-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid rgba(26, 154, 156, 0.22);
          color: #0c7273;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 999px;
          padding: 7px 13px;
          font-size: 12.5px;
          font-weight: 700;
          box-shadow: 0 8px 22px rgba(22, 32, 58, 0.06);
        }

        .ra-workspace {
          min-height: 0;
          display: grid;
          grid-template-columns: minmax(300px, 0.86fr) minmax(460px, 1.14fr);
          gap: clamp(12px, 1.6vw, 18px);
          align-items: stretch;
        }

        .ra-hero {
          min-height: 0;
          display: grid;
          grid-template-rows: auto 1fr;
          gap: clamp(12px, 2vh, 20px);
          border: 1px solid rgba(225, 233, 244, 0.9);
          border-radius: 26px;
          padding: clamp(16px, 2.6vh, 26px);
          background: linear-gradient(150deg, rgba(255, 255, 255, 0.92), rgba(240, 249, 255, 0.78)), #ffffff;
          box-shadow: 0 24px 60px rgba(22, 32, 58, 0.08);
          backdrop-filter: blur(14px);
        }

        .ra-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin: 0 0 clamp(10px, 1.8vh, 16px);
          color: #0c7273;
          background: rgba(220, 246, 238, 0.85);
          border: 1px solid rgba(26, 154, 156, 0.16);
          border-radius: 999px;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 800;
          width: fit-content;
        }

        .ra-title {
          font-family: "Fraunces", "Inter", serif;
          max-width: 480px;
          margin: 0;
          font-size: clamp(24px, 3.4vh, 42px);
          line-height: 1.04;
          letter-spacing: -0.01em;
          font-weight: 600;
        }

        .ra-title em { color: var(--blue); font-style: normal; }

        .ra-sub {
          max-width: 460px;
          margin: clamp(10px, 1.8vh, 16px) 0 0;
          color: var(--muted);
          font-size: clamp(13px, 1.7vh, 15.5px);
          line-height: 1.55;
        }

        .ra-hero-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 12px;
          margin-top: clamp(12px, 2vh, 20px);
        }

        .ra-primary-link,
        .ra-secondary-chip {
          min-height: 38px;
          display: inline-flex;
          align-items: center;
          gap: 9px;
          border-radius: 999px;
          font-size: 13.5px;
          font-weight: 800;
        }

        .ra-primary-link {
          color: #ffffff;
          text-decoration: none;
          background: linear-gradient(135deg, var(--blue), var(--aqua));
          padding: 0 18px;
          box-shadow: 0 14px 30px rgba(47, 95, 214, 0.24);
        }

        .ra-secondary-chip {
          color: var(--muted);
          background: rgba(255, 255, 255, 0.75);
          border: 1px solid var(--line);
          padding: 0 14px;
        }

        .ra-hero-card {
          min-height: 0;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(225, 233, 244, 0.9);
          border-radius: 20px;
          padding: clamp(10px, 1.8vh, 16px);
          box-shadow: 0 14px 34px rgba(22, 32, 58, 0.08);
          backdrop-filter: blur(12px);
        }

        .ra-score-preview {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          border-radius: 16px;
          padding: clamp(12px, 2vh, 18px);
          background: linear-gradient(150deg, rgba(255, 255, 255, 0.96), rgba(240, 249, 255, 0.8));
          border: 1px solid rgba(225, 233, 244, 0.95);
        }

        .ra-preview-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: clamp(10px, 1.8vh, 16px);
        }

        .ra-avatar-row {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .ra-avatar {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          color: var(--blue);
          background: var(--sky);
          flex: 0 0 auto;
        }

        .ra-preview-top b { display: block; font-size: 14px; }
        .ra-preview-top span { color: var(--soft-text); display: block; font-size: 12px; margin-top: 2px; }

        .ra-score-ring {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: var(--blue);
          font-size: 17px;
          font-weight: 800;
          background:
            radial-gradient(circle closest-side, #fff 72%, transparent 74%),
            conic-gradient(var(--blue) 0 78%, #e7edf7 78% 100%);
          flex: 0 0 auto;
        }

        .ra-bars { display: grid; gap: clamp(8px, 1.4vh, 11px); }
        .ra-bar { display: grid; gap: 6px; }
        .ra-bar-line { height: 7px; overflow: hidden; border-radius: 999px; background: #e9f0f8; }
        .ra-bar-line span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--aqua), var(--blue)); }
        .ra-bar-label { display: flex; justify-content: space-between; color: var(--muted); font-size: 12px; font-weight: 700; }

        .ra-mini-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 9px;
          margin-top: clamp(10px, 1.8vh, 16px);
        }

        .ra-mini-card {
          min-height: 50px;
          border-radius: 13px;
          padding: 9px 10px;
          color: var(--ink);
          background: var(--mint);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-weight: 800;
          font-size: 12px;
        }

        .ra-mini-card:nth-child(2) { background: var(--sky); }
        .ra-mini-card:nth-child(3) { background: var(--peach); }
        .ra-mini-card span { color: var(--muted); font-weight: 700; font-size: 10.5px; }

        .ra-card {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(225, 233, 244, 0.95);
          border-radius: 26px;
          padding: clamp(16px, 2.6vh, 26px);
          box-shadow: 0 24px 60px rgba(22, 32, 58, 0.08);
          backdrop-filter: blur(14px);
          min-height: 0;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: auto;
        }

        .ra-steps {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: clamp(10px, 1.8vh, 16px);
          flex: 0 0 auto;
        }

        .ra-step {
          display: flex;
          align-items: center;
          gap: 9px;
          border-radius: 13px;
          padding: 9px 10px;
          border: 1px solid var(--line);
          background: #fbfdff;
        }

        .ra-step-num {
          display: inline-grid;
          place-items: center;
          width: 22px;
          height: 22px;
          border-radius: 8px;
          color: var(--blue);
          background: var(--sky);
          font-size: 11px;
          font-weight: 800;
          flex: 0 0 auto;
        }

        .ra-step b { display: block; font-size: 12px; line-height: 1.3; }

        form.ra-form {
          display: flex;
          flex-direction: column;
          gap: clamp(9px, 1.6vh, 13px);
          flex: 1;
          min-height: 0;
        }

        .ra-row2 {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 11px;
        }

        .ra-field { display: grid; gap: 6px; }

        .ra-field label {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #3c4a5f;
          font-size: 12.5px;
          font-weight: 800;
        }

        .ra-field label svg { color: var(--aqua); flex: 0 0 auto; }

        .ra-field input,
        .ra-field textarea {
          width: 100%;
          border: 1px solid var(--line);
          border-radius: 12px;
          background: #fbfdff;
          color: var(--ink);
          font: inherit;
          font-size: 14px;
          outline: none;
          padding: 10px 12px;
          transition: border-color 0.16s ease, box-shadow 0.16s ease, background 0.16s ease;
        }

        .ra-field input:focus,
        .ra-field textarea:focus {
          background: #ffffff;
          border-color: rgba(47, 95, 214, 0.55);
          box-shadow: 0 0 0 4px rgba(47, 95, 214, 0.1);
        }

        .ra-field textarea { flex: 1; min-height: 56px; resize: none; line-height: 1.5; }
        .ra-jd-field { flex: 1; min-height: 0; display: flex; flex-direction: column; }
        .ra-jd-field textarea { flex: 1; }
        .ra-charcount { color: var(--soft-text); font-size: 11.5px; font-weight: 700; text-align: right; }

        .ra-drop {
          display: grid;
          place-items: center;
          min-height: 64px;
          border: 1.5px dashed #a9c5e8;
          border-radius: 14px;
          color: var(--muted);
          background: linear-gradient(135deg, rgba(220, 235, 255, 0.4), rgba(220, 246, 238, 0.4)), #fbfdff;
          cursor: pointer;
          text-align: center;
          padding: 10px;
          transition: border-color 0.16s ease, transform 0.16s ease, background 0.16s ease;
        }

        .ra-drop.active,
        .ra-drop:hover {
          transform: translateY(-1px);
          border-color: var(--blue);
          background: #ffffff;
        }

        .ra-drop svg { color: var(--blue); margin-bottom: 4px; }
        .ra-drop p { margin: 0; color: var(--ink); font-weight: 800; font-size: 13px; }
        .ra-drop .hint { margin-top: 3px; color: var(--soft-text); font-size: 11.5px; font-weight: 700; }

        .ra-file-chip {
          display: flex;
          align-items: center;
          gap: 11px;
          border: 1px solid rgba(26, 154, 156, 0.26);
          background: rgba(220, 246, 238, 0.6);
          border-radius: 14px;
          padding: 10px 12px;
        }

        .ra-file-chip svg:first-child { color: var(--aqua); flex: 0 0 auto; }
        .ra-file-chip .fname { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; font-weight: 800; }

        .ra-file-chip button {
          border: 0;
          width: 30px;
          height: 30px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          cursor: pointer;
          color: var(--muted);
          background: rgba(255, 255, 255, 0.8);
        }

        .ra-file-chip button:hover { color: var(--danger); }

        .ra-error {
          display: flex;
          align-items: center;
          gap: 9px;
          color: var(--danger);
          background: rgba(200, 69, 47, 0.08);
          border: 1px solid rgba(200, 69, 47, 0.18);
          border-radius: 13px;
          padding: 10px 13px;
          font-size: 13px;
          font-weight: 700;
        }

        .ra-bottom-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex: 0 0 auto;
        }

        .ra-submit {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 42px;
          border: 0;
          border-radius: 13px;
          color: #ffffff;
          background: linear-gradient(135deg, var(--blue), var(--aqua));
          box-shadow: 0 16px 32px rgba(47, 95, 214, 0.24);
          cursor: pointer;
          font-size: 14px;
          font-weight: 800;
          padding: 0 22px;
          transition: transform 0.14s ease, box-shadow 0.14s ease, opacity 0.14s ease;
          flex: 0 0 auto;
        }

        .ra-submit:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 20px 38px rgba(47, 95, 214, 0.3);
        }

        .ra-submit:disabled { cursor: not-allowed; opacity: 0.55; box-shadow: none; }

        .ra-privacy {
          margin: 0;
          color: var(--soft-text);
          font-size: 12px;
          line-height: 1.5;
          max-width: 320px;
        }

        .ra-success {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 10px;
          overflow-y: auto;
        }

        .ra-success-icon,
        .ra-score-badge {
          width: 68px;
          height: 68px;
          margin: 0 auto clamp(12px, 2vh, 18px);
          border-radius: 20px;
          display: grid;
          place-items: center;
          color: var(--aqua);
          background: var(--mint);
          flex: 0 0 auto;
        }

        .ra-score-badge {
          border-radius: 50%;
          color: var(--blue);
          background:
            radial-gradient(circle closest-side, #fff 68%, transparent 70%),
            conic-gradient(var(--blue) 0 82%, #e7edf7 82% 100%);
        }

        .ra-score-badge b { display: block; font-size: 20px; line-height: 1; }
        .ra-score-badge span { color: var(--soft-text); display: block; font-size: 10px; font-weight: 800; margin-top: 3px; }
        .ra-success h3 { font-family: "Fraunces", serif; font-weight: 600; font-size: clamp(20px, 3vh, 27px); margin: 0 0 8px; flex: 0 0 auto; }
        .ra-success > p { max-width: 480px; margin: 0 auto clamp(14px, 2.2vh, 20px); color: var(--muted); line-height: 1.65; font-size: clamp(13px, 1.6vh, 14.5px); flex: 0 0 auto; }
        .email-tag { color: var(--blue); font-weight: 800; }

        .ra-again {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-height: 42px;
          border: 1px solid var(--line);
          border-radius: 13px;
          color: var(--ink);
          background: #ffffff;
          cursor: pointer;
          font-weight: 800;
          font-size: 13.5px;
          padding: 0 17px;
          flex: 0 0 auto;
        }

        .ra-interview-section {
          width: 100%;
          max-width: 520px;
          margin: clamp(16px, 2.4vh, 24px) auto 0;
          text-align: left;
          flex: 0 0 auto;
        }

        .ra-interview-header {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: clamp(10px, 1.6vh, 14px);
          padding-bottom: 10px;
          border-bottom: 1px solid var(--line);
        }

        .ra-interview-header svg { color: var(--aqua); flex: 0 0 auto; }

        .ra-interview-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 800;
          color: var(--ink);
        }

        .ra-interview-header span {
          color: var(--soft-text);
          font-size: 11.5px;
          font-weight: 700;
        }

        .ra-interview-list {
          display: grid;
          gap: 9px;
        }

        .ra-interview-q {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 12px 14px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(220, 235, 255, 0.35), rgba(220, 246, 238, 0.3));
          border: 1px solid rgba(225, 233, 244, 0.8);
          transition: transform 0.14s ease, box-shadow 0.14s ease;
        }

        .ra-interview-q:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(22, 32, 58, 0.06);
        }

        .ra-q-num {
          display: inline-grid;
          place-items: center;
          width: 24px;
          height: 24px;
          border-radius: 8px;
          color: var(--blue);
          background: var(--sky);
          font-size: 11px;
          font-weight: 800;
          flex: 0 0 auto;
          margin-top: 1px;
        }

        .ra-q-text {
          flex: 1;
          font-size: 13.5px;
          font-weight: 600;
          line-height: 1.5;
          color: var(--ink);
        }

        .ra-q-category {
          display: inline-block;
          margin-top: 5px;
          padding: 3px 8px;
          border-radius: 6px;
          font-size: 10.5px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .ra-q-category.behavioral { color: #0c7273; background: rgba(220, 246, 238, 0.8); }
        .ra-q-category.technical { color: var(--blue); background: rgba(220, 235, 255, 0.8); }
        .ra-q-category.situational { color: #b35c00; background: rgba(255, 232, 219, 0.8); }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (min-width: 981px) {
          .ra-root {
            height: 100dvh;
            overflow: hidden;
          }

          .ra-shell {
            height: 100dvh;
            max-height: 100dvh;
          }
        }

        @media (max-width: 1180px) and (min-width: 981px) {
          .ra-shell {
            width: min(1180px, calc(100% - 28px));
          }

          .ra-workspace {
            grid-template-columns: minmax(280px, 0.78fr) minmax(440px, 1.22fr);
          }

          .ra-title {
            font-size: clamp(24px, 3vh, 36px);
          }
        }

        @media (max-width: 980px) {
          .ra-root {
            overflow-y: auto;
          }

          .ra-shell {
            width: min(920px, calc(100% - 32px));
            min-height: 100dvh;
            padding: 18px 0 28px;
            grid-template-rows: auto auto;
          }

          .ra-workspace {
            grid-template-columns: 1fr;
            align-items: start;
          }

          .ra-hero {
            grid-template-columns: minmax(0, 1fr) minmax(280px, 0.8fr);
            grid-template-rows: auto;
            align-items: center;
          }

          .ra-hero-card {
            max-width: none;
            height: 100%;
          }

          .ra-card {
            height: auto;
            overflow: visible;
          }

          form.ra-form {
            display: grid;
          }

          .ra-jd-field textarea {
            min-height: 140px;
          }
        }

        @media (max-width: 760px) {
          .ra-shell {
            width: min(100% - 24px, 680px);
            padding: 14px 0 24px;
            gap: 12px;
          }

          .ra-header {
            gap: 12px;
          }

          .ra-header-badge {
            display: none;
          }

          .ra-hero {
            grid-template-columns: 1fr;
            border-radius: 22px;
            padding: 18px;
          }

          .ra-hero-card {
            display: none;
          }

          .ra-title {
            max-width: none;
            font-size: clamp(30px, 8vw, 40px);
          }

          .ra-sub {
            max-width: none;
            font-size: 14.5px;
          }

          .ra-card {
            border-radius: 22px;
            padding: 18px;
          }

          .ra-steps,
          .ra-row2,
          .ra-mini-cards {
            grid-template-columns: 1fr;
          }

          .ra-steps {
            gap: 7px;
          }

          .ra-field input,
          .ra-field textarea {
            font-size: 14px;
            padding: 12px 13px;
          }

          .ra-drop {
            min-height: 92px;
          }

          .ra-bottom-row {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .ra-submit {
            width: 100%;
            min-height: 48px;
          }

          .ra-privacy {
            max-width: none;
            text-align: center;
          }
        }

        @media (max-width: 420px) {
          .ra-shell {
            width: min(100% - 18px, 420px);
          }

          .ra-logo {
            font-size: 13px;
          }

          .ra-logo-mark {
            width: 32px;
            height: 32px;
          }

          .ra-hero,
          .ra-card {
            border-radius: 18px;
            padding: 14px;
          }

          .ra-title {
            font-size: 28px;
          }

          .ra-primary-link,
          .ra-secondary-chip {
            width: 100%;
            justify-content: center;
          }

          .ra-step {
            padding: 8px 9px;
          }
        }

        @media (max-height: 720px) and (min-width: 981px) {
          .ra-mini-cards,
          .ra-header-badge {
            display: none;
          }

          .ra-title {
            font-size: clamp(24px, 3vh, 34px);
          }

          .ra-sub {
            line-height: 1.45;
          }

          .ra-drop {
            min-height: 56px;
          }

          .ra-field textarea {
            min-height: 46px;
          }
        }
      `}</style>

      <div className="ra-shell">
        <header className="ra-header">
          <div className="ra-logo">
            <div className="ra-logo-mark">
              <Sparkles size={17} />
            </div>
            <span>ResumeMatch AI</span>
          </div>
          <div className="ra-header-badge">
            <Sparkles size={13} /> Developed By Kishore L M
          </div>
        </header>

        <section className="ra-workspace">
          <div className="ra-hero">
            <div>
              <p className="ra-eyebrow">
                <Sparkles size={14} /> Smart resume analysis
              </p>
              <h1 className="ra-title">
                Make every application feel <em>tailor-made.</em>
              </h1>
              <p className="ra-sub">
                Upload your resume, paste the job description, and let AI do the rest.
                Get a fit score, skill gap analysis, grammar review, a ready-to-send
                cover letter, and sample interview questions — all in one report.
              </p>
              <div className="ra-hero-actions">
                <a className="ra-primary-link" href="#analysis-form">
                  Start analysis <ArrowRight size={15} />
                </a>
                <span className="ra-secondary-chip">
                  <CheckCircle2 size={15} /> Report by email
                </span>
              </div>
            </div>

            <aside className="ra-hero-card" aria-label="Resume analysis preview">
              <div className="ra-score-preview">
                <div className="ra-preview-top">
                  <div className="ra-avatar-row">
                    <div className="ra-avatar">
                      <FileText size={19} />
                    </div>
                    <div>
                      <b>Resume scan</b>
                      <span>{status === "submitting" ? "Reading your file..." : "Ready in minutes"}</span>
                    </div>
                  </div>
                  <div className="ra-score-ring">{preview?.matchScore ? `${preview.matchScore}%` : "--"}</div>
                </div>

                <div className="ra-bars">
                  <div className="ra-bar">
                    <div className="ra-bar-label"><span>Role fit</span><span>Strong</span></div>
                    <div className="ra-bar-line"><span style={{ width: "82%" }} /></div>
                  </div>
                  <div className="ra-bar">
                    <div className="ra-bar-label"><span>Skills match</span><span>Good</span></div>
                    <div className="ra-bar-line"><span style={{ width: "74%" }} /></div>
                  </div>
                  <div className="ra-bar">
                    <div className="ra-bar-label"><span>Grammar polish</span><span>Clean</span></div>
                    <div className="ra-bar-line"><span style={{ width: "91%" }} /></div>
                  </div>
                </div>

                <div className="ra-mini-cards">
                  <div className="ra-mini-card"><span>Fit</span>Score</div>
                  <div className="ra-mini-card"><span>Skill</span>Gaps</div>
                  <div className="ra-mini-card"><span>Interview</span>Prep</div>
                </div>
              </div>
            </aside>
          </div>

          <section id="analysis-form" className="ra-card">
            {status === "success" ? (
              <div className="ra-success">
                {preview?.matchScore ? (
                  <div className="ra-score-badge">
                    <div>
                      <b>{preview.matchScore}%</b>
                      <span>Match</span>
                    </div>
                  </div>
                ) : (
                  <div className="ra-success-icon">
                    <CheckCircle2 size={28} />
                  </div>
                )}
                <h3>Your report is on its way</h3>
                <p>
                  A detailed analysis has been sent to <span className="email-tag">{form.email}</span> —
                  including your match score, skill gaps, grammar review, cover letter, and interview prep.
                </p>
                <button className="ra-again" onClick={reset}>
                  Analyze another role <ArrowRight size={14} />
                </button>

                <div className="ra-interview-section">
                  <div className="ra-interview-header">
                    <MessageSquare size={16} />
                    <div>
                      <h4>Sample interview questions</h4>
                      <span>Prepare for these based on the job description</span>
                    </div>
                  </div>
                  <div className="ra-interview-list">
                    <div className="ra-interview-q">
                      <span className="ra-q-num">1</span>
                      <div>
                        <div className="ra-q-text">{preview?.interviewQuestions?.[0] || `Tell me about a time you solved a complex problem in your role as a ${form.jobTitle || 'professional'}.`}</div>
                        <span className="ra-q-category behavioral">Behavioral</span>
                      </div>
                    </div>
                    <div className="ra-interview-q">
                      <span className="ra-q-num">2</span>
                      <div>
                        <div className="ra-q-text">{preview?.interviewQuestions?.[1] || `What relevant skills and experience make you the right fit for this ${form.jobTitle || 'position'}?`}</div>
                        <span className="ra-q-category technical">Technical</span>
                      </div>
                    </div>
                    <div className="ra-interview-q">
                      <span className="ra-q-num">3</span>
                      <div>
                        <div className="ra-q-text">{preview?.interviewQuestions?.[2] || `How would you handle a situation where project requirements changed midway through delivery?`}</div>
                        <span className="ra-q-category situational">Situational</span>
                      </div>
                    </div>
                    <div className="ra-interview-q">
                      <span className="ra-q-num">4</span>
                      <div>
                        <div className="ra-q-text">{preview?.interviewQuestions?.[3] || `Describe how you stay current with industry trends and continue to grow professionally.`}</div>
                        <span className="ra-q-category behavioral">Behavioral</span>
                      </div>
                    </div>
                    <div className="ra-interview-q">
                      <span className="ra-q-num">5</span>
                      <div>
                        <div className="ra-q-text">{preview?.interviewQuestions?.[4] || `Walk us through a project where you collaborated across teams to deliver results.`}</div>
                        <span className="ra-q-category situational">Situational</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="ra-steps">
                  <div className="ra-step">
                    <span className="ra-step-num">01</span>
                    <b>Add the role</b>
                  </div>
                  <div className="ra-step">
                    <span className="ra-step-num">02</span>
                    <b>Upload resume</b>
                  </div>
                  <div className="ra-step">
                    <span className="ra-step-num">03</span>
                    <b>Get your report</b>
                  </div>
                </div>

                <form className="ra-form" onSubmit={handleSubmit}>
                  <div className="ra-row2">
                    <div className="ra-field">
                      <label><User size={14} /> Full name</label>
                      <input type="text" placeholder="Jordan Casey" value={form.name} onChange={updateField("name")} />
                    </div>
                    <div className="ra-field">
                      <label><Mail size={14} /> Email for the report</label>
                      <input type="email" placeholder="you@email.com" value={form.email} onChange={updateField("email")} />
                    </div>
                  </div>

                  <div className="ra-row2">
                    <div className="ra-field">
                      <label><Briefcase size={14} /> Job title</label>
                      <input type="text" placeholder="Senior Product Designer" value={form.jobTitle} onChange={updateField("jobTitle")} />
                    </div>
                    <div className="ra-field">
                      <label><Upload size={14} /> Your resume</label>
                      {resumeFile ? (
                        <div className="ra-file-chip">
                          <FileText size={18} />
                          <span className="fname">{resumeFile.name}</span>
                          <button type="button" onClick={() => setResumeFile(null)} aria-label="Remove file">
                            <X size={15} />
                          </button>
                        </div>
                      ) : (
                        <div
                          className={`ra-drop ${dragActive ? "active" : ""}`}
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setDragActive(true);
                          }}
                          onDragLeave={() => setDragActive(false)}
                          onDrop={onDrop}
                        >
                          <Upload size={20} />
                          <p>Drop resume, or click</p>
                          <div className="hint">PDF only</div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,application/pdf"
                            style={{ display: "none" }}
                            onChange={(e) => handleFile(e.target.files?.[0])}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ra-field ra-jd-field">
                    <label><FileText size={14} /> Job description</label>
                    <textarea
                      placeholder="Paste the full job posting here, including responsibilities, requirements, and nice-to-have skills."
                      value={form.jobDescription}
                      onChange={updateField("jobDescription")}
                    />
                    <div className="ra-charcount">{form.jobDescription.length} characters</div>
                  </div>

                  {errorMsg && (
                    <div className="ra-error">
                      <AlertCircle size={16} /> {errorMsg}
                    </div>
                  )}

                  <div className="ra-bottom-row">
                    <p className="ra-privacy">
                      Your resume is only used to generate this report and is never shared.
                    </p>
                    <button className="ra-submit" type="submit" disabled={status === "submitting"}>
                      {status === "submitting" ? (
                        <>
                          <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} /> Scanning...
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} /> Analyze my resume
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
