import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="text-center py-20">
      <h1 className="text-4xl font-bold">404</h1>

      <p className="mt-2 text-slate-500">
        Strona nie została znaleziona.
      </p>

      <Link to="/" className="text-blue-600 mt-4 inline-block">
        Wróć do strony głównej
      </Link>
    </div>
  );
}