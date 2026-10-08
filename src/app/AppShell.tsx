import { lazy, Suspense, useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router';
import { HomePage } from '../features/home/HomePage.tsx';
import { NotFoundPage } from '../features/not-found/NotFoundPage.tsx';
import { PATHS } from '../features/paths.ts';
import { useSettings } from '../features/settings/use-settings.ts';
import { useAutoSync } from '../features/sync/use-sync.ts';
import { BottomNav } from './BottomNav.tsx';
import { UpdatePrompt } from './UpdatePrompt.tsx';
import { useApplyTheme } from './use-apply-theme.ts';

// Each screen is a separate chunk, loaded when first opened (D-078); the
// service worker precaches them all, so they open offline too.
const SettingsPage = lazy(() =>
  import('../features/settings/SettingsPage.tsx').then((module) => ({
    default: module.SettingsPage,
  })),
);
const UsagePage = lazy(() =>
  import('../features/usage/UsagePage.tsx').then((module) => ({ default: module.UsagePage })),
);
const PathPage = lazy(() =>
  import('../features/path/PathPage.tsx').then((module) => ({ default: module.PathPage })),
);
const NotionPage = lazy(() =>
  import('../features/path/NotionPage.tsx').then((module) => ({ default: module.NotionPage })),
);
const LessonPage = lazy(() =>
  import('../features/path/LessonPage.tsx').then((module) => ({ default: module.LessonPage })),
);
const PracticePage = lazy(() =>
  import('../features/path/PracticePage.tsx').then((module) => ({
    default: module.PracticePage,
  })),
);
const ProducePage = lazy(() =>
  import('../features/path/ProducePage.tsx').then((module) => ({ default: module.ProducePage })),
);
const ImmediatePracticePage = lazy(() =>
  import('../features/path/ImmediatePracticePage.tsx').then((module) => ({
    default: module.ImmediatePracticePage,
  })),
);
const ReviewPage = lazy(() =>
  import('../features/review/ReviewPage.tsx').then((module) => ({ default: module.ReviewPage })),
);
const ThemePage = lazy(() =>
  import('../features/theme/ThemePage.tsx').then((module) => ({ default: module.ThemePage })),
);
const JournalPage = lazy(() =>
  import('../features/journal/JournalPage.tsx').then((module) => ({ default: module.JournalPage })),
);
const LexiconPage = lazy(() =>
  import('../features/lexicon/LexiconPage.tsx').then((module) => ({ default: module.LexiconPage })),
);
const RuleBookPage = lazy(() =>
  import('../features/rule-book/RuleBookPage.tsx').then((module) => ({
    default: module.RuleBookPage,
  })),
);
const PlacementPage = lazy(() =>
  import('../features/path/PlacementPage.tsx').then((module) => ({
    default: module.PlacementPage,
  })),
);

/** Layout shared by every screen: content, then the bottom navigation. */
function AppShell() {
  const settings = useSettings();
  useApplyTheme(settings?.values.theme ?? 'system');
  useAutoSync();

  const { pathname } = useLocation();
  useEffect(() => {
    // A new screen starts at its top.
    document.documentElement.scrollTop = 0;
  }, [pathname]);

  return (
    <>
      <main className="shell__main">
        <Suspense
          fallback={
            <p role="status" className="shell__loading">
              Chargement…
            </p>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <UpdatePrompt />
      <BottomNav />
    </>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path={PATHS.home} element={<HomePage />} />
        <Route path={PATHS.settings} element={<SettingsPage />} />
        <Route path={PATHS.usage} element={<UsagePage />} />
        <Route path={PATHS.path} element={<PathPage />} />
        <Route path={`${PATHS.path}/positionnement/:track`} element={<PlacementPage />} />
        <Route path={`${PATHS.path}/:notionId`} element={<NotionPage />} />
        <Route path={`${PATHS.path}/:notionId/lecon`} element={<LessonPage />} />
        <Route path={`${PATHS.path}/:notionId/exercices`} element={<PracticePage />} />
        <Route path={`${PATHS.path}/:notionId/production`} element={<ProducePage />} />
        <Route path={`${PATHS.path}/:notionId/pratique`} element={<ImmediatePracticePage />} />
        <Route path={PATHS.review} element={<ReviewPage />} />
        <Route path={PATHS.theme} element={<ThemePage />} />
        <Route path={PATHS.journal} element={<JournalPage />} />
        <Route path={PATHS.lexicon} element={<LexiconPage />} />
        <Route path={PATHS.ruleBook} element={<RuleBookPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
