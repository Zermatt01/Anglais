import { Link } from 'react-router';
import { Page, Sheet } from '../../ui/Page.tsx';
import { useAppServices } from '../app-services.ts';
import { formatLongDate } from '../dates.ts';
import { PATHS } from '../paths.ts';
import { usePageTitle } from '../use-page-title.ts';

/** Modules of the application, in the order of the daily session (MOD-02). */
const MODULES = [
  { name: 'Reprises', description: 'Tes cartes de révision, au bon moment.' },
  { name: 'Thème', description: 'Du français vers l’anglais, sans traduction mot à mot.' },
  { name: 'Journal', description: 'Quelques phrases sur ta journée, corrigées.' },
  { name: 'Oral', description: 'Réponses chronométrées, fluidité et prononciation.' },
  { name: 'E-mail guidé', description: 'Du plan au message final, avec un modèle commenté.' },
] as const;

/** Home screen. The modules arrive phase by phase (docs/ROADMAP.md). */
export function HomePage() {
  usePageTitle(null);
  const { clock } = useAppServices();

  return (
    <Page title="Anglais" subtitle={formatLongDate(clock.now())}>
      <Sheet title="Ton objectif">
        <p>
          Mener un entretien d’embauche et écrire des e-mails professionnels en anglais, sans
          traduction mentale.
        </p>
      </Sheet>

      <Sheet title="Parcours">
        <p>
          Les temps verbaux, notion par notion, en cinq étapes : comprendre, reconnaître, pratiquer,
          traduire, produire. Tout fonctionne sans connexion.
        </p>
        <div className="button-row">
          <Link className="button button--primary" to={PATHS.path}>
            Ouvrir le parcours
          </Link>
        </div>
      </Sheet>

      <Sheet title="Bientôt">
        <ul className="plain-list">
          {MODULES.map((module) => (
            <li key={module.name} className="plain-list__item">
              <span className="plain-list__text">
                <span className="field__label">{module.name}</span>
                <span className="muted">{module.description}</span>
              </span>
              <span className="badge">Bientôt</span>
            </li>
          ))}
        </ul>
        <p className="muted">
          Ces modules arrivent au fil des prochaines versions. Tes réglages, ton profil et ta
          progression sont enregistrés sur ce téléphone.
        </p>
        <div className="button-row">
          <Link className="button button--secondary" to={PATHS.settings}>
            Ouvrir les réglages
          </Link>
        </div>
      </Sheet>
    </Page>
  );
}
