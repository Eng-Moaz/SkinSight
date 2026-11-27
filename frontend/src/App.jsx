import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import Home from "./pages/Home.jsx";
import Upload from "./pages/Upload.jsx";
import Result from "./pages/Result.jsx";
import About from "./pages/About.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  // analysis = { file, result } is kept here so Upload can hand it to Result.
  const [analysis, setAnalysis] = useState(null);
  const navigate = useNavigate();

  const handleDone = (next) => {
    setAnalysis(next);
    navigate("/result");
  };

  const handleReset = () => {
    setAnalysis(null);
    navigate("/upload");
  };

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="upload" element={<Upload onDone={handleDone} />} />
        <Route path="result" element={<Result analysis={analysis} onReset={handleReset} />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
