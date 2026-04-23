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

export function translateAuthError(msg) {
  if (!msg) return "";
  const low = msg.toLowerCase();
  
  if (low.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (low.includes("email not confirmed")) return "E-mail não confirmado. Por favor, verifique seu e-mail e clique no link de ativação para liberar seu acesso.";
  if (low.includes("user not found")) return "Usuário não encontrado.";
  if (low.includes("too many requests")) return "Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.";
  if (low.includes("network error")) return "Erro de rede. Verifique sua conexão com a internet.";
  
  return msg || "Ocorreu um erro ao tentar entrar. Verifique seus dados.";
}
