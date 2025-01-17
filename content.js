function extractEmailContent() {
  const subjectElement = document.querySelector('h2[data-thread-perm-id]');
  const fromElement = document.querySelector('.gD');
  const toRecipients = document.querySelectorAll('.gD[email]');
  const ccRecipients = document.querySelectorAll('.cc-recipient');
  const bccRecipients = document.querySelectorAll('.bcc-recipient');
  const bodyElement = document.querySelector('.a3s.aiL');

  const subjectText = subjectElement?.innerText || "No subject found.";
  const fromText = fromElement?.getAttribute('email') || "No sender found.";
  const bodyText = bodyElement?.innerText || "No body found.";

  const allRecipients = [
    ...Array.from(toRecipients).map(to => to.getAttribute('email')),
    ...Array.from(ccRecipients).map(cc => cc.getAttribute('email')),
    ...Array.from(bccRecipients).map(bcc => bcc.getAttribute('email'))
  ].filter(Boolean).join(', ');

  const toText = allRecipients || "No recipients found.";

  const emailContent = `
    Subject: ${subjectText}
    From: ${fromText}
    To: ${toText}

    Body:
    ${bodyText.trim()}
  `.trim();

  return emailContent;
}