export function maskMoeda(v) {
  v = v.replace(/\D/g, "");
  v = (Number(v) / 100).toFixed(2).replace(".", ",");
  v = v.replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1.");
  return v;
}

export function parseMoeda(v) {
  if (!v) return 0;
  if (typeof v === "number") return v;
  return parseFloat(v.replace(/\./g, "").replace(",", "."));
}

export function fmtBRL(v) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v || 0);
}

export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
