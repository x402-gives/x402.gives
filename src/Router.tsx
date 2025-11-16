import { Route, Routes } from "react-router-dom";
import { Give } from "./pages/Give";
import { Welcome } from "./pages/Welcome";
import { Badge } from "./pages/Badge";
import { Docs } from "./pages/Docs";
import BuilderSelector from "./pages/BuilderSelector";
import BuilderRedirect from "./pages/BuilderRedirect";
import NotMatch from "./pages/NotMatch";

export default function Router() {
  return (
    <Routes>
      {/* Homepage directly displays Welcome, bypassing Give component */}
      <Route path="/" element={<Welcome />} />
      <Route path="/docs" element={<Docs />} />
      <Route path="/github.com/:username" element={<Give />} />
      <Route path="/github.com/:username/:repo" element={<Give />} />
      <Route path="/:address" element={<Give />} />
      <Route path="/badge/*" element={<Badge />} />
      <Route path="/builder" element={<BuilderSelector />} />
      <Route path="/builder/github.com/:username/:repo" element={<BuilderRedirect />} />
      <Route path="/builder/:address" element={<BuilderRedirect />} />
      <Route path="*" element={<NotMatch />} />
    </Routes>
  );
}
