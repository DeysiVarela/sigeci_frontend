// "2026-09-14" -> "14 sep 2026" sin desfase de zona horaria
// (new Date("2026-09-14") se interpreta en UTC y en Colombia mostraría el día anterior).
const formatter = new Intl.DateTimeFormat("es-CO", { day: "2-digit", month: "short", year: "numeric" });

export const formatSubmittedDate = (isoDate) => {
    if (!isoDate) return "—";
    const [y, m, d] = String(isoDate).slice(0, 10).split("-").map(Number);
    if (!y || !m || !d) return String(isoDate);
    return formatter.format(new Date(y, m - 1, d)).replace(".", "");
};
