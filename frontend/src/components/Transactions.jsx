import { useState, useRef, useCallback, useEffect } from "react";
import Papa from "papaparse";
import {
  validateFile,
  validateParsedData,
} from "../../utilities/userFileValidations";
import styles from "./styles/Transactions.module.css";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const INSIGHT_ICONS = ["📊", "🏷️", "💸", "📈", "🔍", "🗂️"];
const INSIGHT_LABELS = [
  "Smart Categorisation",
  "Merchant Tagging",
  "Spend Breakdown",
  "Trend Analysis",
  "Anomaly Detection",
  "Monthly Summaries",
];

const STAGE = {
  IDLE: "idle",
  VALIDATING: "validating",
  PARSING: "parsing",
  PREVIEW: "preview",
  SENDING: "sending",
  SUCCESS: "success",
  ERROR: "error",
};

export default function Transactions() {
  const [stage, setStage] = useState(STAGE.IDLE);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [warnings, setWarnings] = useState([]);
  const [progress, setProgress] = useState(0);
  const [rowCount, setRowCount] = useState(0);
  const inputRef = useRef(null);
  const dropRef = useRef(null);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);
  const onDragLeave = useCallback(() => setDragOver(false), []);

  const handleFile = useCallback(async (file) => {
    if (!file) return;
    setDragOver(false);
    setErrorMsg("");
    setWarnings([]);
    setRows([]);
    setHeaders([]);
    setFileName(file.name);

    setStage(STAGE.VALIDATING);
    await sleep(600); // let the UI paint the validating state
    const fileCheck = validateFile(file);
    if (!fileCheck.valid) {
      setErrorMsg(fileCheck.error);
      setStage(STAGE.ERROR);
      return;
    }

    setStage(STAGE.PARSING);
    setProgress(0);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      worker: false,
      step: (result, parser) => {
        setProgress((p) => Math.min(p + 0.5, 90));
      },
      complete: async (result) => {
        setProgress(100);
        await sleep(300);

        const dataCheck = validateParsedData(result.data);
        if (!dataCheck.valid) {
          setErrorMsg(dataCheck.error);
          setStage(STAGE.ERROR);
          return;
        }

        setWarnings(dataCheck.warnings || []);
        setHeaders(Object.keys(result.data[0] || {}));
        setRows(result.data);
        setRowCount(result.data.length);
        setStage(STAGE.PREVIEW);
      },
      error: (err) => {
        setErrorMsg(`Parse error: ${err.message}`);
        setStage(STAGE.ERROR);
      },
    });
  }, []);

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile],
  );

  const onInputChange = useCallback(
    (e) => {
      handleFile(e.target.files[0]);
      e.target.value = "";
    },
    [handleFile],
  );

  const handleSend = useCallback(async () => {
    setStage(STAGE.SENDING);
    await sleep(1800); // TODO: replace with real POST
    // const res = await fetch("/api/transactions/analyze", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ transactions: rows }),
    // });
    setStage(STAGE.SUCCESS);
  }, [rows]);

  const reset = useCallback(() => {
    setStage(STAGE.IDLE);
    setFileName("");
    setRows([]);
    setHeaders([]);
    setErrorMsg("");
    setWarnings([]);
    setProgress(0);
    setRowCount(0);
  }, []);

  const [displayCount, setDisplayCount] = useState(0);
  useEffect(() => {
    if (stage !== STAGE.PREVIEW) return;
    let start = null;
    const duration = 900;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplayCount(Math.floor(ease * rowCount));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [stage, rowCount]);

  const visibleHeaders = headers.slice(0, 6);
  const previewRows = rows.slice(0, 6);

  return (
    <div className={styles.page}>
      <div className={styles.bgGradient} />
      <div className={styles.bgGrid} />
      <div className={styles.topBar} />

      <main className={styles.main}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>
            Upload your <span className={styles.accent}>transactions</span>
          </h1>
          <p className={styles.pageSubtitle}>
            Drop your bank's CSV export and we'll instantly categorise every
            transaction, tag merchants, detect patterns, and surface insights
            that your statement never shows.
          </p>
        </header>

        <div className={styles.insightPills}>
          {INSIGHT_LABELS.map((label, i) => (
            <div
              key={label}
              className={styles.insightPill}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <span className={styles.insightIcon}>{INSIGHT_ICONS[i]}</span>
              {label}
            </div>
          ))}
        </div>

        {(stage === STAGE.IDLE || stage === STAGE.ERROR) && (
          <div
            ref={dropRef}
            className={`${styles.dropZone} ${dragOver ? styles.dropZoneActive : ""} ${stage === STAGE.ERROR ? styles.dropZoneError : ""}`}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
            aria-label="Upload CSV file"
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className={styles.hiddenInput}
              onChange={onInputChange}
            />

            <div className={styles.dropCardStack}>
              <div className={`${styles.dropCard} ${styles.dropCardBack2}`} />
              <div className={`${styles.dropCard} ${styles.dropCardBack1}`} />
              <div className={`${styles.dropCard} ${styles.dropCardFront}`}>
                <span className={styles.csvTag}>CSV</span>
                <div className={styles.dropCardLines}>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>

            <div className={styles.dropTextGroup}>
              {stage === STAGE.ERROR ? (
                <>
                  <p
                    className={styles.dropTitle}
                    style={{ color: "var(--ms-red)" }}
                  >
                    ✕ {errorMsg}
                  </p>
                  <p className={styles.dropHint}>
                    Click or drop another .csv file to try again
                  </p>
                </>
              ) : (
                <>
                  <p className={styles.dropTitle}>
                    {dragOver
                      ? "Release to upload"
                      : "Drag & drop your CSV here"}
                  </p>
                  <p className={styles.dropHint}>
                    or <span className={styles.dropLink}>browse files</span> —
                    .csv only, up to 10 MB
                  </p>
                </>
              )}
            </div>

            <span className={`${styles.corner} ${styles.cornerTL}`} />
            <span className={`${styles.corner} ${styles.cornerTR}`} />
            <span className={`${styles.corner} ${styles.cornerBL}`} />
            <span className={`${styles.corner} ${styles.cornerBR}`} />
          </div>
        )}

        {(stage === STAGE.VALIDATING || stage === STAGE.PARSING) && (
          <div className={styles.processingBox}>
            <div className={styles.processingInner}>
              <div className={styles.spinnerRing}>
                <div className={styles.spinnerDot} />
              </div>
              <p className={styles.processingTitle}>
                {stage === STAGE.VALIDATING
                  ? "Validating file…"
                  : "Parsing transactions…"}
              </p>
              <p className={styles.processingFile}>{fileName}</p>

              {stage === STAGE.PARSING && (
                <div className={styles.progressTrack}>
                  <div
                    className={styles.progressFill}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {stage === STAGE.PREVIEW && (
          <div className={styles.previewSection}>
            <div className={styles.statsBar}>
              <div className={styles.statChip}>
                <span className={styles.statNum}>
                  {displayCount.toLocaleString()}
                </span>
                <span className={styles.statLbl}>Transactions</span>
              </div>
              <div className={styles.statChip}>
                <span className={styles.statNum}>{headers.length}</span>
                <span className={styles.statLbl}>Columns</span>
              </div>
              <div className={styles.statChip}>
                <span
                  className={styles.statNum}
                  style={{ color: "var(--ms-green)" }}
                >
                  ✓
                </span>
                <span className={styles.statLbl}>Validated</span>
              </div>
              <div className={styles.statFile}>
                <span className={styles.fileIcon}>📄</span>
                <span>{fileName}</span>
              </div>
            </div>

            {warnings.length > 0 && (
              <div className={styles.warningBox}>
                {warnings.map((w, i) => (
                  <p key={i} className={styles.warningText}>
                    ⚠ {w}
                  </p>
                ))}
              </div>
            )}

            <div className={styles.tableWrap}>
              <p className={styles.tableLabel}>Preview — first 6 rows</p>
              <div className={styles.tableScroll}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      {visibleHeaders.map((h) => (
                        <th key={h} className={styles.th}>
                          {h}
                        </th>
                      ))}
                      {headers.length > 6 && (
                        <th className={styles.th} style={{ opacity: 0.4 }}>
                          +{headers.length - 6} more
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, ri) => (
                      <tr key={ri} className={styles.tr}>
                        {visibleHeaders.map((h) => (
                          <td key={h} className={styles.td}>
                            <span className={styles.tdText}>
                              {row[h] ?? "—"}
                            </span>
                          </td>
                        ))}
                        {headers.length > 6 && <td className={styles.td} />}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={styles.ctaRow}>
              <button className={styles.btnReset} onClick={reset}>
                ← Upload different file
              </button>
              <button className={styles.btnAnalyze} onClick={handleSend}>
                Analyse Transactions
                <span className={styles.btnArrow}>→</span>
              </button>
            </div>
          </div>
        )}

        {stage === STAGE.SENDING && (
          <div className={styles.processingBox}>
            <div className={styles.processingInner}>
              <div className={styles.spinnerRing}>
                <div className={styles.spinnerDot} />
              </div>
              <p className={styles.processingTitle}>
                Sending to MeritSwipe AI…
              </p>
              <p className={styles.processingFile}>
                {rowCount.toLocaleString()} transactions queued for analysis
              </p>
              <div className={styles.progressTrack}>
                <div className={styles.progressFillIndeterminate} />
              </div>
            </div>
          </div>
        )}

        {stage === STAGE.SUCCESS && (
          <div className={styles.successBox}>
            <div className={styles.successOrb} />
            <div className={styles.successContent}>
              <div className={styles.successCheck}>✓</div>
              <h2 className={styles.successTitle}>Analysis in progress</h2>
              <p className={styles.successSubtitle}>
                We've received{" "}
                <strong>{rowCount.toLocaleString()} transactions</strong> from{" "}
                <em>{fileName}</em>.
                <br />
                Your personalised insights will be ready shortly.
              </p>
              <button
                className={styles.btnAnalyze}
                onClick={reset}
                style={{ marginTop: "2rem" }}
              >
                Upload another file
              </button>
            </div>
          </div>
        )}

        {stage === STAGE.IDLE && (
          <div className={styles.howItWorks}>
            <p className={styles.howTitle}>How it works</p>
            <div className={styles.steps}>
              {[
                {
                  n: "01",
                  label: "Export CSV",
                  body: "Download your transaction history as a CSV from your bank or card app.",
                },
                {
                  n: "02",
                  label: "Drop & Verify",
                  body: "We validate your file instantly — no invalid formats, no surprises.",
                },
                {
                  n: "03",
                  label: "AI Categorises",
                  body: "Every transaction is tagged, labelled, and grouped into smart categories.",
                },
                {
                  n: "04",
                  label: "Insights Delivered",
                  body: "See spend trends, top merchants, anomalies and saving opportunities.",
                },
              ].map((s, i) => (
                <div
                  key={s.n}
                  className={styles.step}
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <span className={styles.stepNum}>{s.n}</span>
                  <h3 className={styles.stepLabel}>{s.label}</h3>
                  <p className={styles.stepBody}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
