import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import InputPage from './pages/InputPage';
import AnalysisPage from './pages/AnalysisPage';
import RewritePage from './pages/RewritePage';
import PlanPage from './pages/PlanPage';

const useHashRouter = import.meta.env.VITE_HASH_ROUTER === 'true';
const Router = useHashRouter ? HashRouter : BrowserRouter;

const routerBasename = useHashRouter
  ? undefined
  : (() => {
      const b = import.meta.env.BASE_URL;
      if (b === '/' || b === './') return undefined;
      return b.replace(/\/$/, '') || undefined;
    })();

function App() {
  const previewPage = import.meta.env.VITE_PREVIEW_PAGE as string | undefined;
  const previewPathMap: Record<string, string> = {
    input: '/',
    analysis: '/analysis/mock-session',
    rewrite: '/rewrite/mock-session/mock-resume',
    /** 简历改写 - 追问补充（同一路由；由 .env.preview-followup 中 VITE_PREVIEW_FOLLOWUP 驱动直达追问 UI） */
    followup: '/rewrite/mock-session/mock-resume',
    /** 简历改写 - 对比确认（同一路由；由 .env.preview-diff 中 VITE_PREVIEW_DIFF 驱动直达 DiffViewer） */
    diff: '/rewrite/mock-session/mock-resume',
    plan: '/plan/mock-session',
  };
  const previewPath = previewPage ? previewPathMap[previewPage] : undefined;
  const shouldRedirectFromRoot = Boolean(previewPath && previewPath !== '/');

  return (
    <Router basename={routerBasename}>
      <Routes>
        <Route path="/" element={shouldRedirectFromRoot ? <Navigate to={previewPath!} replace /> : <InputPage />} />
        <Route path="/analysis/:sessionId" element={<AnalysisPage />} />
        <Route path="/rewrite/:sessionId/:resumeId" element={<RewritePage />} />
        <Route path="/plan/:sessionId" element={<PlanPage />} />
      </Routes>
    </Router>
  );
}

export default App;
