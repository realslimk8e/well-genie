import { useState } from 'react';
import axios from 'axios';
import { useUpload } from '../hooks/useUpload';

export default function ImportPage({
  onImported,
}: {
  onImported?: (added: number, skipped: number) => void;
}) {
  const { uploadFile, uploading, lastResult, error, clearError, clearResult } =
    useUpload();

  const [fileInputKey, setFileInputKey] = useState(0);
  const [previewData, setPreviewData] = useState<[]>([]);
  const [errorDetails, setErrorDetails] = useState<
    { row: string; message: string }[]
  >([]);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // --- helper state checkers ---
  const hasErrors = (res: any) => !!res?.errors && res.errors.length > 0;

  const isSuccess = (res: any) => !!res && res.inserted > 0 && !hasErrors(res);

  const isPartial = (res: any) => !!res && res.inserted > 0 && hasErrors(res);

  const isFailure = (res: any) => !!res && res.inserted === 0 && hasErrors(res);

  const handleFile = async (file: File) => {
    clearError();
    clearResult();
    setPreviewData([]);
    setErrorDetails([]);

    const result = await uploadFile(file);

    if (result) {
      const inserted = result.inserted || 0;
      const errorCount = result.errors?.length || 0;

      // Parse row-level errors if any exist
      if (result.errors && result.errors.length > 0) {
        const parsedErrors = result.errors.map((err: string) => {
          const match = err.match(/Row (\d+): (.*)/);
          if (match) {
            return { row: match[1], message: match[2] };
          }
          return { row: 'N/A', message: err };
        });

        setErrorDetails(parsedErrors);
      }

      // Notify parent
      onImported?.(inserted, errorCount);

      // Reset input after upload
      setFileInputKey((prev) => prev + 1);

      // Fetch preview if something was inserted
      if (inserted > 0 && result.category) {
        await fetchPreview(result.category, inserted);
      }
    }
  };

  const fetchPreview = async (category: string, count: number) => {
    setLoadingPreview(true);
    try {
      const endpoint = `/api/${category}`;
      const response = await axios.get(endpoint, { withCredentials: true });

      const allData = response.data.items || response.data;
      const previewCount = Math.min(5, count);
      const preview = allData.slice(-previewCount);

      setPreviewData(preview);
    } catch (err) {
      console.error('Failed to fetch preview:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Info */}
      <div className="alert alert-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="h-6 w-6 shrink-0 stroke-current"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 className="font-bold">Supported CSV formats:</h3>
          <ul className="mt-2 list-inside list-disc text-sm">
            <li>
              <b>sleep.csv</b>: date, hours, quality
            </li>
            <li>
              <b>diet.csv</b>: date, calories, protein_g, carbs_g, fat_g
            </li>
            <li>
              <b>exercise.csv</b>: date, steps, duration_min, calories_burned
            </li>
          </ul>
        </div>
      </div>

      {/* File Input */}
      <label className="label w-full max-w-md">
        <span className="label">Select CSV file to upload</span>
        <input
          key={fileInputKey}
          type="file"
          accept=".csv,text/csv"
          className="file-input file-input-primary w-full"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
          disabled={uploading}
        />
      </label>

      {/* Uploading */}
      {uploading && (
        <div className="alert">
          <span className="loading loading-spinner"></span>
          <span>Uploading and validating file...</span>
        </div>
      )}

      {/* --- SUCCESS STATES --- */}

      {isSuccess(lastResult) && (
        <div className="alert alert-success">
          <h3 className="font-bold">Upload Successful!</h3>
          <div className="text-sm">
            <p>File: {lastResult!.filename}</p>
            <p>Category: {lastResult!.category}</p>
            <p>Records inserted: {lastResult!.inserted}</p>
          </div>
        </div>
      )}

      {isPartial(lastResult) && (
        <div className="alert alert-warning">
          <h3 className="font-bold">Imported with Warnings</h3>
          <div className="text-sm">
            <p>{lastResult!.inserted} rows inserted</p>
            <p>{lastResult!.errors!.length} row(s) had issues</p>
          </div>
        </div>
      )}

      {isFailure(lastResult) && (
        <div className="alert alert-error">
          <h3 className="font-bold">Upload Failed</h3>
          <div className="text-sm">
            <p>No rows were inserted due to validation errors.</p>
          </div>
        </div>
      )}

      {/* Row-Level Error Table */}
      {errorDetails.length > 0 && (
        <div className="card bg-base-100 border-warning border">
          <div className="card-body">
            <h3 className="card-title text-warning text-sm">
              Rows with Errors
            </h3>
            <div className="max-h-60 overflow-y-auto">
              <table className="table-xs table-zebra table">
                <thead>
                  <tr>
                    <th className="w-20">Row</th>
                    <th>Error Details</th>
                  </tr>
                </thead>
                <tbody>
                  {errorDetails.map((err, idx) => (
                    <tr key={idx}>
                      <td>{err.row}</td>
                      <td>
                        <span className="text-error">{err.message}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Global non-row errors */}
      {error && (
        <div className="alert alert-error">
          <h3 className="font-bold">Upload Failed</h3>
          <div className="text-sm">{error}</div>
        </div>
      )}

      {/* Preview */}
      {previewData.length > 0 && (
        <div className="card bg-base-100 border-base-300 border">
          <div className="card-body">
            <h3 className="card-title text-sm">
              Preview - Last {previewData.length} Imported Records
              {loadingPreview && (
                <span className="loading loading-spinner loading-xs ml-2"></span>
              )}
            </h3>
            <div className="overflow-x-auto">
              <table className="table-xs table-zebra table">
                <thead>
                  <tr>
                    {Object.keys(previewData[0])
                      .filter((key) => key !== 'id')
                      .map((key) => (
                        <th key={key} className="capitalize">
                          {key.replace(/_/g, ' ')}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.map((row) => (
                    <tr key={row.id}>
                      {Object.entries(row)
                        .filter(([key]) => key !== 'id')
                        .map(([key, val]) => (
                          <td key={key}>{String(val)}</td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
