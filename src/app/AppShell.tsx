import { useEffect } from 'react';
import { Outlet, Route, Routes, useLocation } from 'react-router';
import { HomePage } from '../features/home/HomePage.tsx';
import { NotFoundPage } from '../features/not-found/NotFoundPage.tsx';
import { PATHS } from '../features/paths.ts';
import { SettingsPage } from '../features/settings/SettingsPage.tsx';
import { useSettings } from '../features/settings/use-settings.ts';
import { BottomNav } from './BottomNav.tsx';
import { useApplyTheme } from './use-apply-theme.ts';

/** Layout shared by every screen: content, then the bottom navigation. */
function AppShell() {
  const settings = useSettings();
  useApplyTheme(settings?.values.theme ?? 'system');

  const { pathname } = useLocation();
  useEffect(() => {
    // A new screen starts at its top.
    document.documentElement.scrollTop = 0;
  }, [pathname]);

  return (
    <>
      <main className="shell__main">
        <Outlet />
      </main>
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
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
