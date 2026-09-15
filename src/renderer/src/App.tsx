import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./layout";
import { NewChat } from "./routes";
import { Onboarding } from "./routes/onboarding";

function App() {
  return (
    <HashRouter>
      <Routes>
        {/* All routes inside inherit the Layout wrapper */}
        <Route path="/" element={<Layout />}>
          <Route index element={<NewChat />} />
        </Route>
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
