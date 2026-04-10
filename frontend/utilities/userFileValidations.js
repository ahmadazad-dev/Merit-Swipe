const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["text/csv", "application/vnd.ms-excel", "text/plain"];
const ALLOWED_EXTENSIONS = [".csv"];

const REQUIRED_COLUMN_SETS = [
  ["date", "amount"],
  ["date", "debit"],
  ["date", "credit"],
  ["transaction date", "amount"],
  ["posting date", "amount"],
];

/**

 * @param {File} file
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateFile(file) {
  if (!file) {
    return { valid: false, error: "No file provided." };
  }
  const fileName = file.name || "";
  const extension = fileName.slice(fileName.lastIndexOf(".")).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Invalid file type "${extension}". Please upload a .csv file.`,
    };
  }

  const mimeOk =
    ALLOWED_MIME_TYPES.includes(file.type) || file.type === "" || file.type === "application/octet-stream";
  if (!mimeOk) {
    return {
      valid: false,
      error: `Unexpected file format (${file.type}). Only CSV files are accepted.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: "The file appears to be empty." };
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeMB} MB). Maximum allowed size is ${MAX_FILE_SIZE_MB} MB.`,
    };
  }

  return { valid: true };
}

/**
 * @param {Array<Object>} rows - Array of row objects from PapaParse (header: true).
 * @returns {{ valid: boolean, error?: string, warnings?: string[] }}
 */
export function validateParsedData(rows) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return { valid: false, error: "The CSV file contains no data rows." };
  }

  const headers = Object.keys(rows[0]).map((h) => h.trim().toLowerCase());

  const hasRequiredColumns = REQUIRED_COLUMN_SETS.some((set) =>
    set.every((col) => headers.some((h) => h.includes(col)))
  );

  if (!hasRequiredColumns) {
    return {
      valid: false,
      error:
        "CSV is missing required columns. Expected at least a 'date' and 'amount' (or 'debit'/'credit') column.",
    };
  }

  const warnings = [];

  if (rows.length > 10000) {
    warnings.push(
      `Large file: ${rows.length.toLocaleString()} rows detected. Processing may take a moment.`
    );
  }

  const hasDescription = headers.some((h) =>
    ["description", "merchant", "narration", "details", "particulars", "memo"].some((k) =>
      h.includes(k)
    )
  );
  if (!hasDescription) {
    warnings.push(
      "No description/merchant column found. Transaction categorisation accuracy may be reduced."
    );
  }

  return { valid: true, warnings: warnings.length ? warnings : undefined };
}