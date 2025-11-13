// Servicio para enviar notificaciones de sesiones completadas a N8N
const WEBHOOK_URL = import.meta.env.VITE_N8N_WEBHOOK_URL;

export interface SessionCompletionWebhookData {
  nombre: string;
  correo: string;
  puntajeFinal: number;
  nombreSesion: string;
}

// Enviar datos de sesión completada a webhook de N8N (solo usuarios registrados)
export const sendSessionCompletionWebhook = async (
  data: SessionCompletionWebhookData
): Promise<boolean> => {
  // Saltar si no está configurada la URL del webhook
  if (!WEBHOOK_URL) {
    console.warn('⚠️ N8N Webhook URL not configured - skipping webhook notification');
    return false;
  }

  try {
    console.log('📤 Sending session completion to n8n webhook:', {
      url: WEBHOOK_URL,
      data: {
        nombre: data.nombre,
        correo: data.correo,
        puntajeFinal: data.puntajeFinal,
        nombreSesion: data.nombreSesion,
      },
    });

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: data.nombre,
        correo: data.correo,
        puntajeFinal: data.puntajeFinal,
        nombreSesion: data.nombreSesion,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      console.error('❌ Webhook request failed:', response.status, response.statusText);
      return false;
    }

    console.log('✅ Session completion sent to n8n webhook successfully');
    return true;
  } catch (error) {
    console.error('❌ Error sending webhook notification:', error);
    return false;
  }
};
