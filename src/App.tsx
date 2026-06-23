import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./views/Dashboard";
import Session from "./views/Session";
import Summary from "./views/Summary";
import RandomPicker from "./views/RandomPicker";
import { Shuffle } from "lucide-react";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <header className="border-b px-6 py-4 flex items-center justify-between shrink-0">
          <Link to="/" className="text-xl font-bold hover:opacity-80 transition-opacity">
            Practice for Interview
          </Link>

          {/* Random pick shortcut — lives in the header on every page */}
          <Link
            to="/random"
            id="header-random-btn"
            className="
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold
              border border-dashed border-primary/50
              text-primary hover:bg-primary/5
              transition-colors cursor-pointer
            "
          >
            <Shuffle className="w-4 h-4" />
            Pick for Me
          </Link>
        </header>

        <main className="flex-1 overflow-auto p-6 flex flex-col max-w-5xl mx-auto w-full">
          <Routes>
            <Route path="/"        element={<Dashboard />} />
            <Route path="/session" element={<Session />} />
            <Route path="/summary" element={<Summary />} />
            {/* RandomPicker renders fixed/full-screen; it's outside the max-w constraint */}
            <Route path="/random"  element={<RandomPicker />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
