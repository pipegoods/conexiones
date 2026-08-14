'use client';

type ShareButtonsProps = {
  needUrl: string;
  offerUrl: string;
  teamWhatsapp?: string | null;
};

function buildWhatsappShare(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function ShareButtons({ needUrl, offerUrl, teamWhatsapp }: ShareButtonsProps) {
  const needMessage = `Si necesitas ayuda en una emergencia, registra tu solicitud aquí (es gratis):\n${needUrl}`;
  const offerMessage = `Si puedes ayudar con tiempo, recursos u oficio, regístrate aquí:\n${offerUrl}`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <a
        href={teamWhatsapp ? buildWhatsappShare(teamWhatsapp, needMessage) : needUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
      >
        Compartir “Necesito ayuda”
      </a>
      <a
        href={teamWhatsapp ? buildWhatsappShare(teamWhatsapp, offerMessage) : offerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-300 bg-white px-6 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
      >
        Compartir “Quiero ayudar”
      </a>
    </div>
  );
}
