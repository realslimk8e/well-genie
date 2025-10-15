type Props = { title: string; note: string };

export default function SectionBox({ title, note }: Props) {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body py-4 px-4">
        <h3 className="card-title text-base">{title}</h3>
        <p className="text-sm text-base-content/70">{note}</p>
      </div>
    </div>
  );
}
