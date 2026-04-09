type Tag = {
  id: number;
  name: string;
  color: string;
};

type Props = {
  tag: Tag;
  onRemove?: (id: number) => void;
};

export default function TagBadge({ tag, onRemove }: Props) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: tag.color }}>
      {tag.name}
      {onRemove && (
        <button onClick={() => onRemove(tag.id)} className="hover:opacity-75 ml-0.5 font-bold">
          x
        </button>
      )}
    </span>
  );
}
