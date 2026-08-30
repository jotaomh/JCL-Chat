# app/services/email.py — Envio de e-mails via Resend
#
# Centraliza o envio de e-mails usando o SDK oficial do Resend
# (https://resend.com/docs/send-with-python). A chave de API vem do
# settings.py (variável de ambiente RESEND_API_KEY, que vive só no .env,
# fora do Git).
#
# IMPORTANTE (produção): o remetente padrão é o de TESTES
# "onboarding@resend.dev" (via EMAIL_FROM). Ele SÓ entrega para o e-mail que
# foi usado no cadastro da conta Resend. Antes de colocar em produção com
# múltiplos usuários reais, é preciso verificar um domínio próprio no Resend
# (https://resend.com/domains) e usar um endereço com esse domínio como
# remetente — veja o comentário em send_password_reset_email.

import logging

import resend
from resend.exceptions import ResendError

from src.app.config.settings import settings

logger = logging.getLogger(__name__)


def send_password_reset_email(to_email: str, reset_link: str) -> None:
    """Envia o e-mail de recuperação de senha para o usuário.

    Args:
        to_email: e-mail de destino.
        reset_link: caminho/link de redefinição, ex.: /reset-password?token=...
    """
    # Configura a chave de API do Resend (lida do settings/.env).
    resend.api_key = settings.resend_api_key

    if not settings.resend_api_key:
        # Sem chave configurada não dá para enviar. Logamos e interrompemos
        # sem levantar detalhes técnicos para a API. O endpoint de recuperação
        # NÃO revela isso ao usuário final.
        logger.warning(
            "RESEND_API_KEY não configurada; não foi possível enviar o e-mail "
            "de recuperação para %s",
            to_email,
        )
        return

    # Monta o link absoluto. O reset_link vem como caminho relativo; usamos a
    # origem do frontend (VITE_API_URL) quando disponível, ou um padrão local.
    base_url = "http://localhost:3000"
    full_link = f"{base_url}{reset_link}" if reset_link.startswith("/") else reset_link

    subject = "JCL-Chat — Redefinição de senha"
    html = _build_reset_email_html(full_link)

    params: resend.Emails.SendParams = {
        # TODO(produção): usar um domínio próprio VERIFICADO no Resend aqui
        # (ex.: "JCL-Chat <no-reply@seudominio.com>"). O remetente de testes
        # (onboarding@resend.dev, padrão de EMAIL_FROM) só entrega para o
        # e-mail cadastrado na conta Resend — não serve para múltiplos
        # usuários reais.
        "from": settings.email_from,
        "to": [to_email],
        "subject": subject,
        "html": html,
    }

    try:
        # O endpoint é síncrono (def), então usamos a chamada síncrona send().
        # O SDK LANÇA exceção em caso de erro (não devolve objeto de erro).
        resend.Emails.send(params)
        logger.info("E-mail de recuperação enviado para %s", to_email)
    except ResendError as exc:
        # Logamos o erro completo no servidor, mas sem expor detalhes à API.
        logger.error("Falha ao enviar e-mail de recuperação para %s: %s", to_email, exc)


def _build_reset_email_html(reset_link: str) -> str:
    """Monta o template HTML simples do e-mail de recuperação de senha."""
    return f"""<!DOCTYPE html>
<html lang="pt-BR">
  <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#f4f4f4;padding:24px;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0"
                 style="background-color:#ffffff;border-radius:12px;padding:32px;
                        box-shadow:0 4px 16px rgba(0,0,0,0.08);">
            <tr>
              <td style="padding-bottom:16px;">
                <h1 style="margin:0;color:#1a1a1a;font-size:20px;">JCL-Chat</h1>
              </td>
            </tr>
            <tr>
              <td style="padding-bottom:16px;color:#333333;font-size:15px;line-height:1.6;">
                Olá!{"<br/>"}Recebemos uma solicitação para redefinir a sua senha.
                Se foi você, clique no botão abaixo para criar uma nova senha.
              </td>
            </tr>
            <tr>
              <td align="center" style="padding:8px 0 16px;">
                <a href="{reset_link}"
                   style="display:inline-block;background-color:#a8d8f0;color:#0d0d0d;
                          text-decoration:none;padding:12px 28px;border-radius:8px;
                          font-weight:600;font-size:15px;">
                  Redefinir senha
                </a>
              </td>
            </tr>
            <tr>
              <td style="padding-top:8px;color:#777777;font-size:13px;line-height:1.5;">
                Se você <strong>não</strong> pediu isso, pode ignorar este e-mail —
                sua senha atual continua válida e nada foi alterado.
                {"<br/>"}Por segurança, o link expira em 1 hora.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""
