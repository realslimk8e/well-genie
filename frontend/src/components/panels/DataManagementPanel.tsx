import { useSleep } from '../../hooks/useSleep';
import { useDiet } from '../../hooks/useDiet';
import { useExercise } from '../../hooks/useExercise';
import DeleteData from '../DeleteData';

export default function DataManagementPanel() {
  // Note: The hooks need to be updated to return a 'refetch' function.
  const { refetch: refetchSleep } = useSleep();
  const { refetch: refetchDiet } = useDiet();
  const { refetch: refetchExercise } = useExercise();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Delete Health Records</h3>
        <p className="text-base-content/70 text-sm">
          Permanently delete records for a specific category within a selected
          date range. This action cannot be undone.
        </p>
      </div>
      <div className="space-y-4">
        <DeleteData category="sleep" onSuccess={refetchSleep} />
        <DeleteData category="diet" onSuccess={refetchDiet} />
        <DeleteData category="exercise" onSuccess={refetchExercise} />
      </div>
    </div>
  );
}
