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
      .replaceAll(/<table[^>]*>([\s\S]*?)<\/table>/gi, "")
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

const removeUnnecesaryWrappers = (el: HTMLElement) => {
  let runs = 0;
  while (el.children.length === 1) {
    // take into account cases like <div> bla bla <a>link</a> </div>
    if (el.innerText !== (el.children[0] as HTMLElement).innerText) {
      break;
    }
    el.innerHTML = el.children[0].innerHTML;
    if(runs > 500) {
      // TODO: might be useful to understand how this happens... yeah
      console.log("...", el, el.innerHTML);
      break;
    }
    runs++;
  }
  for (let i = 0; i < el.children.length; i++) {
    removeUnnecesaryWrappers(el.children[i] as HTMLElement);
  }
};

const markToRemove = (el: HTMLElement) => {
  if (el.children.length === 0) {
    el.setAttribute("learn-word-remove", !el.innerText ? "true" : "false");
    return;
  }

  const children = Array.prototype.map.call(el.children, function (n) {
    return n;
  }) as HTMLElement[];

  children.forEach((c) => markToRemove(c));

  el.setAttribute(
    "learn-word-remove",
    children.every((c) => c.getAttribute("learn-word-remove") === "true")
      ? "true"
      : "false"
  );
};

const removeMarked = (el: HTMLElement) => {
  const children = Array.prototype.map.call(el.children, function (n) {
    return n;
  }) as HTMLElement[];

  const toRemove = children.filter(
    (c) => c.getAttribute("learn-word-remove") === "true"
  );
  const toVerify = children.filter(
    (c) => c.getAttribute("learn-word-remove") !== "true"
  );
  toRemove.forEach((c) => {
    if (c.getAttribute("learn-word-remove") === "true") {
      c.parentNode?.removeChild(c);
    }
  });
  toVerify.forEach((n) => {
    removeMarked(n);
  });
};

export const getPostParseElement = (
  el: HTMLElement,
  options: NewLineConfig = {
    p: 1,
    div: 1,
    h: 1,
  }
): string => {
  removeUnnecesaryWrappers(el);
  for (let i = 0; i < 10; i++) {
    markToRemove(el);
    removeMarked(el);
  }

  const newLines = {
    p: `${Array.from({ length: options.p }).fill("\n").join("")}$&`,
    div: `${Array.from({ length: options.div }).fill("\n").join("")}$&`,
    h: `${Array.from({ length: options.h }).fill("\n").join("")}$&`,
  };
  el.innerHTML = el.innerHTML
    .replaceAll(/(<\/div>)+/gi, newLines.div)
    .replaceAll(/(<\/p>)+/gi, newLines.p)
    .replaceAll(/(<\/h[\d]>)+/gi, newLines.h);

  return (el.textContent ?? "empty")
    .replaceAll(/[\s]*\n[\s]*\n[\s]*[\n]+[\s]*/gi, () => "\n\n");
};

export const parseTitle = (html: string) => {
  const [, name] = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ?? ["", ""];
  return name;
};

export const isMobile = (url: string) => url.startsWith("https://m.");

export interface Source {
  name: string;
  img: string;
  regex: () => RegExp;
  parse: (
    html: string,
    url: string
  ) => Promise<{ name: string; content: string }>;
}

export interface SourceWithMobile extends Source {
  parseMobile: (html: string) => Promise<{ name: string; content: string }>;
}
