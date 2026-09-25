// Sans dépendance Node : importable depuis les composants client.
export function numeroWhatsApp(telephone: string) {
  return telephone.replace(/\D/g, "");
}

export function lienWhatsApp(telephone: string, texte: string) {
  return `https://wa.me/${numeroWhatsApp(telephone)}?text=${encodeURIComponent(texte)}`;
}
