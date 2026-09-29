import { Link } from 'react-router';
import type { LoadedSettings } from '../../data/repositories/settings-repository.ts';
import { CheckboxGroup, ChoiceGroup, SelectField, SwitchField } from '../../ui/fields.tsx';
import { Notice } from '../../ui/Notice.tsx';
import { Page, Sheet } from '../../ui/Page.tsx';
import { AccountSection } from '../account/AccountSection.tsx';
import { DataSection } from '../data-transfer/DataSection.tsx';
import { PATHS } from '../paths.ts';
import { usePageTitle } from '../use-page-title.ts';
import { CorrectionMarksPreview } from './CorrectionMarksPreview.tsx';
import { DOMAIN_CHOICES, THEME_CHOICES, VARIANT_CHOICES } from './choices.ts';
import { ProfileRemarksEditor } from './ProfileRemarksEditor.tsx';
import { useSettings, useShownSettings } from './use-settings.ts';

const minutes = (values: readonly number[]) =>
  values.map((value) => ({ value, label: `${String(value)} minutes` }));
const perDay = (values: readonly number[]) =>
  values.map((value) => ({ value, label: String(value) }));

const EMAIL_FREQUENCIES = [
  { value: 0, label: 'Jamais' },
  { value: 1, label: 'Une fois par semaine' },
  { value: 2, label: 'Deux fois par semaine' },
  { value: 3, label: 'Trois fois par semaine' },
];

/** Settings screen (MOD-12). Each choice is saved as soon as it is made. */
export function SettingsPage() {
  usePageTitle('Réglages');
  const loaded = useSettings();

  if (loaded === undefined) {
    return (
      <Page title="Réglages">
        <p role="status">Chargement des réglages…</p>
      </Page>
    );
  }
  return <SettingsForm loaded={loaded} />;
}

function SettingsForm({ loaded }: { readonly loaded: LoadedSettings }) {
  // `values` shows each choice at once; `loaded.values` is what is stored.
  const { shown: values, change, update, failed } = useShownSettings(loaded.values);

  return (
    <Page title="Réglages">
      {loaded.stored === 'invalid' ? (
        <Notice tone="error" title="Réglages illisibles">
          <p>
            Les réglages enregistrés n’ont pas pu être lus : les valeurs par défaut sont affichées.
            Au prochain changement, l’ancienne version sera conservée à part ; elle reste incluse
            dans l’export de tes données.
          </p>
        </Notice>
      ) : null}
      {failed ? (
        <Notice tone="error" title="Réglage non enregistré">
          <p>Réessaie. Si le problème continue, exporte tes données puis recharge l’application.</p>
        </Notice>
      ) : null}

      <Sheet title="Anglais">
        <ChoiceGroup
          legend="Variante d’anglais"
          value={values.englishVariant}
          choices={VARIANT_CHOICES}
          onChange={(englishVariant) => {
            change({ englishVariant });
          }}
        />
        <p className="muted">
          Les orthographes britannique et américaine sont toujours acceptées dans tes réponses.
        </p>
      </Sheet>

      <Sheet title="Apparence">
        <ChoiceGroup
          legend="Thème"
          value={values.theme}
          choices={THEME_CHOICES}
          onChange={(theme) => {
            change({ theme });
          }}
        />
        <CorrectionMarksPreview />
      </Sheet>

      <Sheet title="Séance">
        <SelectField
          label="Objectif quotidien"
          hint="La séance du jour dure 20 à 25 minutes ; chaque module peut aussi se faire seul."
          value={values.dailyGoalMinutes}
          options={minutes([10, 15, 20, 25, 30])}
          onChange={(dailyGoalMinutes) => {
            change({ dailyGoalMinutes });
          }}
        />
        <SelectField
          label="Nouvelles cartes par jour"
          value={values.newCardsPerDay}
          options={perDay([0, 5, 10, 15, 20, 30])}
          onChange={(newCardsPerDay) => {
            change({ newCardsPerDay });
          }}
        />
        <SelectField
          label="Révisions par jour (au plus)"
          value={values.reviewsPerDay}
          options={perDay([20, 40, 60, 80, 100, 150, 200])}
          onChange={(reviewsPerDay) => {
            change({ reviewsPerDay });
          }}
        />
        <SwitchField
          label="Me corriger moi-même d’abord"
          description="Les erreurs sont signalées avec un indice avant la correction. Tu peux toujours passer cette étape."
          checked={values.selfCorrection}
          onChange={(selfCorrection) => {
            change({ selfCorrection });
          }}
        />
        <SelectField
          label="E-mail guidé"
          hint="Remplace le Journal dans la séance du jour."
          value={values.emailSessionsPerWeek}
          options={EMAIL_FREQUENCIES}
          onChange={(emailSessionsPerWeek) => {
            change({ emailSessionsPerWeek });
          }}
        />
      </Sheet>

      <Sheet title="Profil d’apprenant">
        <p className="muted">
          Enregistré uniquement sur ce téléphone. Plus tard, ces informations accompagneront tes
          demandes de correction pour adapter les exemples.
        </p>
        <CheckboxGroup
          legend="Domaines qui t’intéressent"
          hint="Les exemples et les exercices viendront de préférence de ces domaines."
          values={values.learnerProfile.domains}
          choices={DOMAIN_CHOICES}
          onChange={(domains) => {
            change({ learnerProfile: { domains } });
          }}
        />
        <ProfileRemarksEditor
          savedRemarks={loaded.values.learnerProfile.remarks}
          onSave={(remarks) => update({ learnerProfile: { remarks } })}
        />
      </Sheet>

      <AccountSection />

      <Sheet title="Intelligence artificielle">
        <p className="muted">
          L’IA n’est appelée que lorsque tu le demandes, avec un plafond de dépense mensuel.
        </p>
        <div className="button-row">
          <Link className="button button--secondary" to={PATHS.usage}>
            Voir la consommation
          </Link>
        </div>
      </Sheet>

      <DataSection />
    </Page>
  );
}
