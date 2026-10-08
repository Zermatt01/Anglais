import { NavLink } from 'react-router';
import { PATHS } from '../features/paths.ts';
import { HomeIcon, PathIcon, ReviewIcon, SettingsIcon } from '../ui/icons.tsx';

const ITEMS = [
  { to: PATHS.home, label: 'Accueil', Icon: HomeIcon, end: true },
  { to: PATHS.path, label: 'Parcours', Icon: PathIcon, end: false },
  { to: PATHS.review, label: 'Reprises', Icon: ReviewIcon, end: true },
  { to: PATHS.settings, label: 'Réglages', Icon: SettingsIcon, end: true },
] as const;

/** Main navigation, at the bottom of the screen, within reach of the thumb (UI-01). */
export function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Navigation principale">
      <ul className="bottom-nav__list">
        {ITEMS.map(({ to, label, Icon, end }) => (
          <li key={to} className="bottom-nav__item">
            {/* `end`: the home link is active on "/" only; the path link also on its
                notions. NavLink sets aria-current. */}
            <NavLink to={to} end={end} className="bottom-nav__link">
              <Icon />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
