import { useState, type FormEvent } from 'react';
import type { WallInput, WallResult, WallType, BrickForm, Opening } from '../lib/types';
import { validate, WallInputError } from '../lib/validate';
import { calculateWall } from '../lib/masonry';
import Results from './Results';

// The form holds text, not numbers, until submit: a half-typed "2." must not be rejected mid-keystroke.
interface Draft {
  wallType: WallType;
  lengthM: string;
  heightM: string;
  brickForm: BrickForm;
  brickWastePct: string;
  blockWastePct: string;
  mortarWastePct: string;
  openings: { widthM: string; heightM: string }[];
}

const initial: Draft = {
  wallType: 'brick-single',
  lengthM: '',
  heightM: '',
  brickForm: 'solid',
  brickWastePct: '10',
  blockWastePct: '5',
  mortarWastePct: '10',
  openings: [],
};

function toInput(d: Draft): WallInput {
  const openings: Opening[] = d.openings.map((o) => ({
    widthM: Number(o.widthM),
    heightM: Number(o.heightM),
  }));
  return {
    wallType: d.wallType,
    lengthM: Number(d.lengthM),
    heightM: Number(d.heightM),
    brickForm: d.brickForm,
    brickWastePct: Number(d.brickWastePct),
    blockWastePct: Number(d.blockWastePct),
    mortarWastePct: Number(d.mortarWastePct),
    openings,
  };
}

export default function MasonryForm() {
  const [draft, setDraft] = useState<Draft>(initial);
  const [result, setResult] = useState<WallResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasBrick = draft.wallType !== 'block-single';
  const hasBlock = draft.wallType !== 'brick-single';

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft({ ...draft, [key]: value });
  }

  function setOpening(i: number, key: 'widthM' | 'heightM', value: string) {
    const openings = draft.openings.map((o, j) => (j === i ? { ...o, [key]: value } : o));
    set('openings', openings);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const input = toInput(draft);
      validate(input);
      setResult(calculateWall(input));
      setError(null);
    } catch (err) {
      setResult(null);
      setError(err instanceof WallInputError ? err.message : 'Something went wrong. Check the figures and try again.');
    }
  }

  return (
    <div className="calc">
      <form className="panel panel-form" onSubmit={onSubmit} noValidate>
        <h2>Job details</h2>

        <label htmlFor="wallType">Wall type</label>
        <select id="wallType" value={draft.wallType} onChange={(e) => set('wallType', e.target.value as WallType)}>
          <option value="brick-single">Single brick wall (half brick, 102.5 mm)</option>
          <option value="block-single">Single block wall (100 mm)</option>
          <option value="cavity">Cavity wall (brick outer, block inner)</option>
        </select>

        <div className="row">
          <div>
            <label htmlFor="lengthM">Wall length (m)</label>
            <input id="lengthM" inputMode="decimal" value={draft.lengthM} onChange={(e) => set('lengthM', e.target.value)} />
          </div>
          <div>
            <label htmlFor="heightM">Wall height (m)</label>
            <input id="heightM" inputMode="decimal" value={draft.heightM} onChange={(e) => set('heightM', e.target.value)} />
          </div>
        </div>

        <fieldset>
          <legend>Openings (doors and windows)</legend>
          {draft.openings.map((o, i) => (
            <div className="row" key={i}>
              <div>
                <label htmlFor={`ow${i}`}>Width (m)</label>
                <input id={`ow${i}`} inputMode="decimal" value={o.widthM} onChange={(e) => setOpening(i, 'widthM', e.target.value)} />
              </div>
              <div>
                <label htmlFor={`oh${i}`}>Height (m)</label>
                <input id={`oh${i}`} inputMode="decimal" value={o.heightM} onChange={(e) => setOpening(i, 'heightM', e.target.value)} />
              </div>
              <button type="button" className="link" onClick={() => set('openings', draft.openings.filter((_, j) => j !== i))}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="secondary" onClick={() => set('openings', [...draft.openings, { widthM: '', heightM: '' }])}>
            Add an opening
          </button>
        </fieldset>

        {hasBrick && (
          <>
            <label htmlFor="brickForm">Brick type</label>
            <select id="brickForm" value={draft.brickForm} onChange={(e) => set('brickForm', e.target.value as BrickForm)}>
              <option value="solid">Solid</option>
              <option value="frogged">Frogged (uses more mortar)</option>
            </select>
          </>
        )}

        <details>
          <summary>Wastage allowances</summary>
          {hasBrick && (
            <>
              <label htmlFor="brickWastePct">Brick wastage (%)</label>
              <input id="brickWastePct" inputMode="numeric" value={draft.brickWastePct} onChange={(e) => set('brickWastePct', e.target.value)} />
            </>
          )}
          {hasBlock && (
            <>
              <label htmlFor="blockWastePct">Block wastage (%)</label>
              <input id="blockWastePct" inputMode="numeric" value={draft.blockWastePct} onChange={(e) => set('blockWastePct', e.target.value)} />
            </>
          )}
          <label htmlFor="mortarWastePct">Mortar wastage (%)</label>
          <input id="mortarWastePct" inputMode="numeric" value={draft.mortarWastePct} onChange={(e) => set('mortarWastePct', e.target.value)} />
        </details>

        <button type="submit" className="primary">Work out materials</button>

        <p className="error" role="alert">{error}</p>
      </form>

      <section className="panel panel-results" aria-live="polite">
        <h2>Your materials list</h2>
        {result ? <Results result={result} /> : <p className="muted">Fill in the job details and press the button.</p>}
      </section>
    </div>
  );
}
