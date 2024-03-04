import axios from "axios";
import dompurify from "dompurify";

const parseBodyElement = (html: string): HTMLElement => {
  const [bodyHtml] = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i) ?? [""];
  const sanitisedHtml = dompurify.sanitize(
    bodyHtml
      .replaceAll(/<br\/>[\s\n]*<\/div>/g, "\n\n</div>")
      .replaceAll("<br/>", "\n")
  );

  const body = document.createElement("BODY");
  body.innerHTML = sanitisedHtml;
  return body;
};

const parseTitle = (html: string) => {
  const [, name] = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) ?? ["", ""];
  return name;
};

// Ex: https://genius.com/Husky-stupid-bullet-lyrics
const geniousSongSource = {
  name: "Genius",
  img: "https://assets.genius.com/images/apple-touch-icon.png?1709224724",
  regex: /^https:\/\/genius\.com\/[\w-_]+$/,
  parse: async (html: string) => {
    const body = parseBodyElement(html);
    const children = body.querySelectorAll(
      `body [data-lyrics-container="true"]`
    );
    body.innerHTML = "";
    Array.prototype.forEach.call(children, function (node: HTMLElement) {
      body.append(node);
    });
    return { name: parseTitle(html), content: body.textContent ?? "empty" };
  },
};

//Ex: https://genius.com/albums/Monetochka/Adult-coloring-books
const geniousAlbumSource = {
  name: "Genius Album",
  img: "https://assets.genius.com/images/apple-touch-icon.png?1709224724",
  regex: /^https:\/\/genius\.com\/albums\/([\w-_]+)\/([\w-_]+)$/,
  parse: async (albumPageHtml: string) => {
    const getSongLinks = (): string[] => {
      const children = parseBodyElement(albumPageHtml).querySelectorAll(
        `.chart_row-content a[href^="https://genius.com/"]`
      );
      const urls = Array.prototype.map.call(
        children,
        function (node: HTMLAnchorElement) {
          return `${node.href}`;
        }
      ) as string[];

      return urls
        .filter((u) => geniousSongSource.regex.test(u))
        .filter((value, index, self) => self.indexOf(value) === index);
    };

    const album = parseTitle(albumPageHtml);
    const songUrls = await getSongLinks();
    let content = `${album}`;
    let index = 0;
    for (const url of songUrls) {
      const { data: html } = await axios.get<string>(url, {
        headers: {
          "Content-Type": "text/html",
        },
      });
      const { content: songContent } = await geniousSongSource.parse(html);
      content += `\n\n\n========= [${++index}] =========\n\n${songContent}`;
    }

    return { name: `Album: ${album}`, content };
  },
};

export const allowedUrlFetch = [geniousSongSource, geniousAlbumSource];
