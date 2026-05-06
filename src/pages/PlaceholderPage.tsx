import Card from '../components/Card';

interface Props {
  title: string;
  description: string;
}

export default function PlaceholderPage({ title, description }: Props) {
  return (
    <Card>
      <h2 className="mb-2 text-lg font-semibold">{title}</h2>
      <p className="text-sm text-slate-600">{description}</p>
    </Card>
  );
}
