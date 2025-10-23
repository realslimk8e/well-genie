type Props = { title: string; note: string };

export default function SectionBox({ title, note }: Props) {
  return (
    <div className="card bg-base-100 border-base-300 border">
      <div className="card-body px-4 py-4">
        <h3 className="card-title text-base">{title}</h3>
        <p className="text-base-content/70 text-sm">{note}</p>
      </div>
    </div>
  );
}
