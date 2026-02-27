import { useState } from 'react';

type DeleteDataProps = {
  category: 'sleep' | 'diet' | 'exercise';
  onSuccess: () => void;
};

export default function DeleteData({ category, onSuccess }: DeleteDataProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canDelete = startDate && endDate;

  const handleDelete = async () => {
    if (!canDelete) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(
        `/api/${category}?start_date=${startDate}&end_date=${endDate}`,
        {
          method: 'DELETE',
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || `Failed to delete ${category} data.`);
      }

      setSuccessMessage(data.message || 'Data deleted successfully.');
      onSuccess(); // Refetch data in parent
      setStartDate('');
      setEndDate('');
    } catch (err: Error | unknown) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    const message = `Are you sure you want to delete all ${category} data from ${startDate} to ${endDate}? This action cannot be undone.`;
    if (window.confirm(message)) {
      handleDelete();
    }
  };

  return (
    <div className="border-base-300 bg-base-100 rounded-lg border p-4">
      <h4 className="mb-2 font-bold capitalize">{category} Data</h4>
      <div className="flex flex-wrap items-end gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Start Date</span>
          </label>
          <input
            type="date"
            className="input input-bordered w-full"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="form-control">
          <label className="label">
            <span className="label-text">End Date</span>
          </label>
          <input
            type="date"
            className="input input-bordered w-full"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button
          className="btn btn-error"
          disabled={!canDelete || loading}
          onClick={handleConfirm}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>
      {error && <div className="alert alert-error mt-4 text-sm">{error}</div>}
      {successMessage && (
        <div className="alert alert-success mt-4 text-sm">{successMessage}</div>
      )}
    </div>
  );
}
