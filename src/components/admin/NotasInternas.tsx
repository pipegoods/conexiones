import { Tarjeta } from '@/components/admin/Piezas';
import { guardarNotasSolicitud } from '@/app/admin/acciones';

export function NotasInternas({ id, notasInternas }: { id: string; notasInternas?: string }) {
  return (
    <Tarjeta titulo="Notas internas">
      <form action={guardarNotasSolicitud} className="space-y-3">
        <input type="hidden" name="id" value={id} />
        <label className="block text-sm font-semibold text-neutral-600">
          Notas internas
          <textarea
            name="notasInternas"
            rows={5}
            defaultValue={notasInternas ?? ''}
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
    </Tarjeta>
  );
}