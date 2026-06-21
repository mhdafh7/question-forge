import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./views/Dashboard";
import Session from "./views/Session";
import Summary from "./views/Summary";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="border-b px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold">Practice for Interview</h1>
        </header>
        <main className="flex-1 overflow-auto p-6 flex flex-col max-w-5xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/session" element={<Session />} />
            <Route path="/summary" element={<Summary />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
