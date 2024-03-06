import dompurify from "dompurify";

type NewLineConfig = {
  p: number;
  div: number;
  h: number;
};

export const parseHtml = (html: string): HTMLElement => {
  const [bodyHtmlOriginal] = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i) ?? [
    "",
  ];

  const sanitisedHtml = dompurify.sanitize(
    bodyHtmlOriginal
      .replaceAll(/<picture[^>]*>([\s\S]*?)<\/picture>/gi, "")
      .replaceAll(/<figure[^>]*>([\s\S]*?)<\/figure>/gi, "")
      .replaceAll(/<video[^>]*>([\s\S]*?)<\/video>/gi, "")
      .replaceAll(/<img[^>]*>([\s\S]*?)<\/img>/gi, "")
      .replaceAll(/<svg[^>]*>([\s\S]*?)<\/svg>/gi, "")
      .replaceAll(/<button[^>]*>([\s\S]*?)<\/button>/gi, "")
      .replaceAll(/<br\/>[\s\n]*<\/div>/g, "\n\n</div>")
      .replaceAll("<br/>", "\n")
  );

  const body = document.createElement("BODY");
  body.innerHTML = sanitisedHtml;
  Array.prototype.forEach.call(body.querySelectorAll("style"), function (node) {
    node?.parentNode?.removeChild(node);
  });
  return body;
};

export const getPostParseElement = (
  el: HTMLElement,
  options: NewLineConfig = {
    p: 1,
    div: 1,
    h: 1,
  }
): HTMLElement => {
  let innerHtml = el.innerHTML;
  while (/[\s]*<div[^>]*><\/div>[\s]*/.test(innerHtml)) {
    innerHtml = innerHtml.replaceAll(/[\s]*<div[^>]*><\/div>[\s]*/gi, "");
  }

  const newLines = {
    p: `${Array.from({ length: options.p }).fill("\n").join("")}$&`,
    div: `${Array.from({ length: options.div }).fill("\n").join("")}$&`,
    h: `${Array.from({ length: options.h }).fill("\n").join("")}$&`,
  };
  el.innerHTML = innerHtml
    .replaceAll(/<div[^>]*><\/div>/gi, "")
    .replaceAll(/\n\n\n/g, "\n\n")
    .replaceAll(/(<\/div>)+/gi, newLines.div)
    .replaceAll(/(<\/p>)+/gi, newLines.p)
    .replaceAll(/(<\/h[\d]>)+/gi, newLines.h);
  return el;
};

export const parseTitle = (html: string) => {
  const [, name] = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ?? ["", ""];
  return name;
};
