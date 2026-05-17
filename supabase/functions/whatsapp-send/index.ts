// Endpoint chamado pelos GitHub Actions para enviar alertas
// POST /functions/v1/whatsapp-send
// Body: { phone: "5511999999999", message: "texto" }
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { enviarMensagem } from "../_shared/evolution.ts";

const WEBHOOK_SECRET = Deno.env.get("WHATSAPP_WEBHOOK_SECRET") ?? "";

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Valida secret simples para evitar abuso
  const secret = req.headers.get("x-webhook-secret") ?? "";
  if (WEBHOOK_SECRET && secret !== WEBHOOK_SECRET) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: { phone?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const { phone, message } = body;
  if (!phone || !message) {
    return new Response("Campos obrigatórios: phone, message", { status: 400 });
  }

  try {
    await enviarMensagem(phone, message);
    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
