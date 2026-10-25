import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <header className="p-4 bg-white border-b border-gray-200 shadow-sm flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">SYNC</h1>
          <nav className="space-x-6">
            <a href="/" className="font-medium hover:text-blue-500 transition-colors">Dashboard</a>
            <a href="/shifts" className="font-medium hover:text-blue-500 transition-colors">Shifts</a>
          </nav>
        </header>

        <main className="p-8">
          <Routes>
            <Route path="/" element={<h2 className="text-2xl font-semibold">Strona główna (W budowie)</h2>} />
            <Route path="/shifts" element={<h2 className="text-2xl font-semibold">Zmiany (W budowie)</h2>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;