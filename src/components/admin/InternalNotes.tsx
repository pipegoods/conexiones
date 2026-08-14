import { Card } from '@/components/admin/Primitives';
import { saveRequestNotes } from '@/app/admin/actions';

export function InternalNotes({ id, internalNotes }: { id: string; internalNotes?: string }) {
  return (
    <Card title="Notas internas">
      <form action={saveRequestNotes} className="space-y-3">
        <input type="hidden" name="id" value={id} />
        <label className="block text-sm font-semibold text-neutral-600">
          Notas internas
          <textarea
            name="internalNotes"
            rows={5}
            defaultValue={internalNotes ?? ''}
            placeholder="Contexto que le sirva al siguiente que abra este caso."
            className="mt-1.5 w-full rounded-xl border border-neutral-200 px-3 py-2 text-sm"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-xl bg-tinta px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-125"
        >
          Guardar notas
        </button>
      </form>
    </Card>
  );
}
