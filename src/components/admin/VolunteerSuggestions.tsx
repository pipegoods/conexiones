import Link from 'next/link';

import { proposeConnection } from '@/app/admin/actions';
import { WhatsappButton } from '@/components/admin/WhatsappButton';
import { Card, EmptyState } from '@/components/admin/Primitives';
import { AVAILABILITY_LABELS, RADIUS_LABELS } from '@/lib/catalogs';
import { matchQuality, type Suggestion } from '@/lib/matching';
import { offerCode, whatsappLink, volunteerProposalMessage } from '@/lib/whatsapp';
import type { HelpRequest } from '@/db/schema';

export function VolunteerSuggestions({
  request,
  suggestions,
}: {
  request: HelpRequest;
  suggestions: Suggestion[];
}) {
  return (
    <Card title={`Voluntarios sugeridos (${suggestions.length})`}>
      <p className="mb-4 text-sm text-neutral-500">
        El sistema los ordena por qué tanto encajan. La decisión es tuya: revisa las advertencias antes de proponer.
      </p>

      {suggestions.length === 0 ? (
        <EmptyState>
          Todavía no hay voluntarios que encajen con esta necesidad en esta zona. Puedes buscar
          manualmente en
          <Link href="/admin/ofertas" className="font-semibold underline">
            Voluntarios
          </Link>
          .
        </EmptyState>
      ) : (
        <ul className="space-y-4">
          {suggestions.map(({ offer, score, reasons, warnings }) => {
            const quality = matchQuality(score);
            return (
              <li key={offer.id} className="rounded-2xl border border-neutral-200 p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${quality.className}`}>
                    {quality.label} · {score}/100
                  </span>
                  <Link
                    href={`/admin/ofertas/${offer.id}`}
                    className="font-bold text-tinta hover:text-marca-morado hover:underline"
                  >
                    {offer.name}
                  </Link>
                  {offer.organization && (
                    <span className="text-sm text-neutral-500">({offer.organization})</span>
                  )}
                  <span className="font-mono text-xs text-neutral-400">{offerCode(offer.number)}</span>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-neutral-700">{offer.description}</p>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-neutral-500">
                  <span>
                    📍 {offer.municipality} · {RADIUS_LABELS[offer.radiusKm]}
                  </span>
                  <span>
                    🕒 {offer.availability.map((d) => AVAILABILITY_LABELS[d]).join(', ')}
                  </span>
                </div>

                <ul className="mt-3 space-y-1">
                  {reasons.map((r) => (
                    <li key={r} className="flex gap-2 text-sm text-emerald-700">
                      <span aria-hidden="true">✓</span>
                      {r}
                    </li>
                  ))}
                  {warnings.map((a) => (
                    <li key={a} className="flex gap-2 text-sm text-amber-700">
                      <span aria-hidden="true">!</span>
                      {a}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex flex-wrap gap-2">
                  <WhatsappButton
                    link={whatsappLink(offer.phone, volunteerProposalMessage(offer, request))}
                    entityType="offer"
                    entityId={offer.id}
                    detail={`Se le propuso la solicitud ${request.id}.`}
                  >
                    Proponerle por WhatsApp
                  </WhatsappButton>

                  <form action={proposeConnection}>
                    <input type="hidden" name="requestId" value={request.id} />
                    <input type="hidden" name="offerId" value={offer.id} />
                    <input type="hidden" name="score" value={score} />
                    <input type="hidden" name="reasons" value={reasons.join(' · ')} />
                    <button
                      type="submit"
                      className="rounded-xl bg-tinta px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-125"
                    >
                      Registrar la propuesta
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
