import { Link } from 'react-router';
import { Page } from '../../ui/Page.tsx';
import { PATHS } from '../paths.ts';
import { usePageTitle } from '../use-page-title.ts';

export function NotFoundPage() {
  usePageTitle('Page introuvable');
  return (
    <Page title="Page introuvable">
      <p>Cette adresse ne correspond à aucun écran de l’application.</p>
      <div className="button-row">
        <Link className="button button--primary" to={PATHS.home}>
          Revenir à l’accueil
        </Link>
      </div>
    </Page>
  );
}
