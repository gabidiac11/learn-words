import axios from "axios";
import { parseHtml, parseTitle, getPostParseElement } from "./parseUtils";

// Ex: https://genius.com/Husky-stupid-bullet-lyrics
export const geniousSongSource = {
  name: "Genius Song",
  img: "https://assets.genius.com/images/apple-touch-icon.png?1709224724",
  regex: () => /^https:\/\/genius\.com\/[\w-_]+$/,
  parse: async (html: string) => {
    const body = parseHtml(html);
    const children = body.querySelectorAll(
      `body [data-lyrics-container="true"]`
    );
    body.innerHTML = "";
    Array.prototype.forEach.call(children, function (node: HTMLElement) {
      body.append(node);
    });
    return {
      name: parseTitle(html),
      content: getPostParseElement(body).textContent ?? "empty",
    };
  },
};

//Ex: https://genius.com/albums/Monetochka/Adult-coloring-books
export const geniousAlbumSource = {
  name: "Genius Album",
  img: "https://assets.genius.com/images/apple-touch-icon.png?1709224724",
  regex: () => /^https:\/\/genius\.com\/albums\/([\w-_]+)\/([\w-_]+)$/,
  parse: async (albumPageHtml: string) => {
    const getSongLinks = (): string[] => {
      const children = parseHtml(albumPageHtml).querySelectorAll(
        `.chart_row-content a[href^="https://genius.com/"]`
      );
      const urls = Array.prototype.map.call(
        children,
        function (node: HTMLAnchorElement) {
          return `${node.href}`;
        }
      ) as string[];

      return urls
        .filter((u) => geniousSongSource.regex().test(u))
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
