/**
 * Escape HTML to prevent XSS in emails
 */
export function escapeHtml(text) {
  if (!text) return '';

  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate HTML email template for contact form
 */
export const generateContactEmailTemplate = (data) => {
  const { name, email, phone, message, ip, timestamp } = data;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nova Mensagem de Contato - GKL Engenharia</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #0160F8;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #0160F8;
    }
    .content {
      margin-bottom: 30px;
    }
    .field {
      margin-bottom: 20px;
    }
    .field-label {
      font-weight: bold;
      color: #555;
      margin-bottom: 5px;
    }
    .field-value {
      background-color: #f9f9f9;
      padding: 12px;
      border-radius: 4px;
      border-left: 3px solid #0160F8;
    }
    .message-box {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 4px;
      border-left: 3px solid #FC8E44;
      white-space: pre-wrap;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 12px;
      color: #999;
    }
    .meta-info {
      background-color: #f0f0f0;
      padding: 10px;
      border-radius: 4px;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">GKL Engenharia</div>
      <p style="margin: 10px 0 0 0; color: #666;">Nova Mensagem de Contato</p>
    </div>

    <div class="content">
      <div class="field">
        <div class="field-label">Nome:</div>
        <div class="field-value">${escapeHtml(name)}</div>
      </div>

      <div class="field">
        <div class="field-label">E-mail:</div>
        <div class="field-value">${escapeHtml(email)}</div>
      </div>

      ${phone ? `
      <div class="field">
        <div class="field-label">Telefone:</div>
        <div class="field-value">${escapeHtml(phone)}</div>
      </div>
      ` : ''}

      <div class="field">
        <div class="field-label">Mensagem:</div>
        <div class="message-box">${escapeHtml(message)}</div>
      </div>
    </div>

    <div class="meta-info">
      <strong>Informações Técnicas:</strong><br>
      IP: ${ip || 'N/A'}<br>
      Data/Hora: ${timestamp}<br>
      User-Agent: ${data.userAgent || 'N/A'}
    </div>

    <div class="footer">
      Esta mensagem foi enviada através do formulário de contato do site GKL Engenharia.<br>
      Não responda diretamente a este e-mail. Use o e-mail do remetente para contato.
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generate plain text version for email clients that don't support HTML
 */
export const generatePlainTextTemplate = (data) => {
  const { name, email, phone, message, ip, timestamp, userAgent } = data;

  return `
GKL ENGENHARIA - NOVA MENSAGEM DE CONTATO
==========================================

NOME: ${name}
E-MAIL: ${email}
${phone ? `TELEFONE: ${phone}\n` : ''}

MENSAGEM:
---------
${message}

-----------------------------------------
INFORMAÇÕES TÉCNICAS:
IP: ${ip || 'N/A'}
Data/Hora: ${timestamp}
User-Agent: ${userAgent || 'N/A'}
-----------------------------------------

Esta mensagem foi enviada através do formulário de contato do site GKL Engenharia.
  `.trim();
};

/**
 * Generate HTML email template for confirmation email
 */
export const generateConfirmationHtmlTemplate = (data) => {
  const { name } = data;

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #0160F8; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>GKL Engenharia</h1>
    </div>
    <div class="content">
      <h2>Olá, ${escapeHtml(name)}!</h2>
      <p>Recebemos sua mensagem e agradecemos o contato.</p>
      <p>Nossa equipe analisará sua solicitação e retornaremos em breve.</p>
      <p><strong>Tempo médio de resposta:</strong> 24 horas úteis</p>
    </div>
    <div class="footer">
      <p>Este é um e-mail automático. Por favor, não responda.</p>
      <p>© ${new Date().getFullYear()} GKL Engenharia. Todos os direitos reservados.</p>
    </div>
  </div>
</body>
</html>
  `;
};

/**
 * Generate plain text template for confirmation email
 */
export const generateConfirmationTextTemplate = (data) => {
  const { name } = data;

  return `
GKL ENGENHARIA

Olá, ${name}!

Recebemos sua mensagem e agradecemos o contato.
Nossa equipe analisará sua solicitação e retornaremos em breve.

Tempo médio de resposta: 24 horas úteis

---
Este é um e-mail automático. Por favor, não responda.
© ${new Date().getFullYear()} GKL Engenharia.
  `.trim();
};
