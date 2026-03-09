import exists from './exists.js';

async function checkParams(header, body, link, linkText) {
  if (!exists(header)) {
    throw new BadRequest('header is null or undefined');
  }
  if (typeof(header) !== 'string') {
    throw new BadRequest('header type is not string');
  }
  if (!exists(body)) {
    throw new BadRequest('body is null or undefined');
  }
  if (typeof(body) !== 'string') {
    throw new BadRequest('body type is not string');
  }
  if (exists(link)) {
    if (typeof(link) !== 'string') {
      throw new BadRequest('link type is not string');
    }
  }
  if (exists(linkText)) {
    if (typeof(linkText) !== 'string') {
      throw new BadRequest('linkText type is not string');
    }
  }
}

async function generateHtmlMessage(header, body, link, linkText) {
  await checkParams(header, body, link, linkText);
  let htmlMessage = `
    <p style="font-size: 2em; font-weight: bold; text-align: center;">
      ${header}
    </p>
    <p style="font-size: 1.25em;">
      ${body}
    </p>
  `;
  if (exists(link)) {
    const linkHtml = `
      <a href="${link}" target="_blank" style="color: #9333ea; text-decoration: underline;">
        <p style="font-size: 1.25em; text-align: center;">
          ${linkText}
        </p>
      </a>
    `;
    htmlMessage = htmlMessage.concat(linkHtml);
  }
  return htmlMessage;
}

export default generateHtmlMessage;
