import type { WallResult } from '../lib/types';

interface Props {
  result: WallResult;
}

const one = (n: number) => n.toFixed(1);

export default function Results({ result }: Props) {
  return (
    <>
      <p className="area">
        Net wall area <strong>{result.netAreaM2.toFixed(2)} m²</strong> after openings.
      </p>
      <table>
        <caption className="sr-only">Materials and quantities</caption>
        <thead>
          <tr>
            <th scope="col">Material</th>
            <th scope="col" className="num">Quantity</th>
          </tr>
        </thead>
        <tbody>
          {result.lines.map((l) => (
            <tr key={l.id}>
              <th scope="row">
                {l.label}
                {l.note && <span className="note">{l.note}</span>}
              </th>
              <td className="num">
                {l.quantity} {l.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <details className="working">
        <summary>How the sand and cement were worked out</summary>
        <p>
          Mortar {one(result.working.mortarLitres)} litres, which needs {one(result.working.drySandLitres)} litres of
          dry sand ({one(result.working.sandKg)} kg) and {one(result.working.cementKg)} kg of cement at a 1:5 mix.
          Bags are rounded up once from these totals.
        </p>
      </details>
      <p className="muted small">Quantities are estimates. Check pack sizes and coverage on the product before ordering.</p>
    </>
  );
}
