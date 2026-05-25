const EVOLUTION_URL = Deno.env.get("EVOLUTION_URL")!;
const EVOLUTION_KEY = Deno.env.get("EVOLUTION_API_KEY")!;
const EVOLUTION_INSTANCE = Deno.env.get("EVOLUTION_INSTANCE") ?? "texnet";

export async function enviarMensagem(phone: string, text: string): Promise<void> {
  const res = await fetch(`${EVOLUTION_URL}/message/sendText/${EVOLUTION_INSTANCE}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: EVOLUTION_KEY },
    body: JSON.stringify({ number: phone, text }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Evolution API ${res.status}: ${err}`);
  }
}

export function extrairPhone(remoteJid: string): string {
  // "5511999999999@s.whatsapp.net" → "5511999999999"
  return remoteJid.replace(/@.+$/, "");
}
