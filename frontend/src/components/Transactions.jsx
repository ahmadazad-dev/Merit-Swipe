import { useState, useRef, useCallback, useEffect } from "react";
import Papa from "papaparse";
import {
  FiBarChart2,
  FiTag,
  FiDollarSign,
  FiTrendingUp,
  FiSearch,
  FiFolder,
  FiX,
  FiCheck,
  FiFileText,
  FiAlertTriangle,
  FiArrowLeft,
  FiArrowRight,
} from "react-icons/fi";
import {
  validateFile,
  validateParsedData,
} from "../../utilities/userFileValidations";
import styles from "./styles/Transactions.module.css";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const INSIGHT_ICONS = [
  <FiBarChart2 key="chart" />,
  <FiTag key="tag" />,
  <FiDollarSign key="dollar" />,
  <FiTrendingUp key="trend" />,
  <FiSearch key="search" />,
  <FiFolder key="folder" />,
];

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

const API_URL = "http://localhost:8000/api/transactions/analyze";

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
  const fileRef = useRef(null);

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
    fileRef.current = file;

    setStage(STAGE.VALIDATING);
    await sleep(600);

    const fileCheck = validateFile(file);
    if (!fileCheck.valid) {
      setErrorMsg(fileCheck.error);
      setStage(STAGE.ERROR);
      return;
    }

    setStage(STAGE.PARSING);
    setProgress(0);

    const accumulated = [];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      worker: false,
      step: (result) => {
        accumulated.push(result.data);
        setProgress((p) => Math.min(p + 0.5, 90));
      },
      complete: async () => {
        setProgress(100);
        await sleep(300);

        const dataCheck = validateParsedData(accumulated);
        if (!dataCheck.valid) {
          setErrorMsg(dataCheck.error);
          setStage(STAGE.ERROR);
          return;
        }

        setWarnings(dataCheck.warnings || []);
        setHeaders(Object.keys(accumulated[0] || {}));
        setRows(accumulated);
        setRowCount(accumulated.length);
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
      handleFile(e.dataTransfer.files[0]);
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
    const file = fileRef.current;
    if (!file) {
      setErrorMsg("File reference lost. Please re-upload your CSV.");
      setStage(STAGE.ERROR);
      return;
    }

    setStage(STAGE.SENDING);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        let detail = `Server error (${res.status})`;
        try {
          detail = (await res.json()).detail ?? detail;
        } catch (_) { }
        throw new Error(detail);
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const nameMatch = disposition.match(/filename="?([^";\n]+)"?/);
      const pdfName = nameMatch
        ? nameMatch[1]
        : `${fileName.replace(".csv", "")}_report.pdf`;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = pdfName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setStage(STAGE.SUCCESS);
    } catch (err) {
      setErrorMsg(err.message ?? "An unexpected error occurred.");
      setStage(STAGE.ERROR);
    }
  }, [fileName]);

  const reset = useCallback(() => {
    setStage(STAGE.IDLE);
    setFileName("");
    setRows([]);
    setHeaders([]);
    setErrorMsg("");
    setWarnings([]);
    setProgress(0);
    setRowCount(0);
    fileRef.current = null;
    if (inputRef.current) inputRef.current.value = "";
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
                    {/* Replaced '✕' */}
                    <FiX style={{ marginRight: "8px", verticalAlign: "middle" }} />
                    {errorMsg}
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
                  {/* Replaced '✓' */}
                  <FiCheck />
                </span>
                <span className={styles.statLbl}>Validated</span>
              </div>
              <div className={styles.statFile}>
                {/* Replaced '📄' */}
                <span className={styles.fileIcon}><FiFileText /></span>
                <span>{fileName}</span>
              </div>
            </div>

            {warnings.length > 0 && (
              <div className={styles.warningBox}>
                {warnings.map((w, i) => (
                  <p key={i} className={styles.warningText}>
                    {/* Replaced '⚠' */}
                    <FiAlertTriangle style={{ marginRight: "6px", verticalAlign: "middle" }} />
                    {w}
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
                {/* Replaced '←' */}
                <FiArrowLeft style={{ marginRight: "8px" }} /> Upload different file
              </button>
              <button className={styles.btnAnalyze} onClick={handleSend}>
                Analyse Transactions
                {/* Replaced '→' */}
                <span className={styles.btnArrow}><FiArrowRight /></span>
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
                Running categorization pipeline…
              </p>
              <p className={styles.processingFile}>
                {rowCount.toLocaleString()} transactions — this may take a
                moment
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
              {/* Replaced '✓' */}
              <div className={styles.successCheck}><FiCheck /></div>
              <h2 className={styles.successTitle}>Report downloaded</h2>
              <p className={styles.successSubtitle}>
                <strong>{rowCount.toLocaleString()} transactions</strong> from{" "}
                <em>{fileName}</em> have been categorised and saved to your
                database.
                <br />
                Your PDF report has been downloaded automatically.
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
                  body: "We validate your file instantly — checking for all required columns.",
                },
                {
                  n: "03",
                  label: "AI Categorises",
                  body: "Every transaction is tagged, labelled, and grouped into smart categories.",
                },
                {
                  n: "04",
                  label: "PDF Downloaded",
                  body: "A full spending report is generated and downloaded to your device.",
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