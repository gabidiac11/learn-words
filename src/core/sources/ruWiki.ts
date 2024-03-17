import { AppGenericError } from "../types";
import {
  parseHtml,
  parseTitle,
  getPostParseElement,
  Source,
} from "./parseUtils";

export const ruWikiSource: Source = {
  name: "Wikipedia.RU",
  img: "https://ru.wikipedia.org/static/favicon/wikipedia.ico",
  regex: () => /^https:\/\/ru(\.m)?\.wikipedia\.org\/wiki\/[^/]+$/i,
  parse: async function (html: string, url: string) {
    // if (url.startsWith("https://ru.m.")) {
    //   return await this.parseMobile(html);
    // }

    const body = parseHtml(html);
    const heading = body.querySelector(".mw-page-title-main");
    const article = body.querySelector(".mw-body-content") as HTMLElement;
    if (!article || !heading)
      throw new AppGenericError("Something went wrong with parsing.");

    article.prepend(heading);

    [".reflist", ".navbox", ".citation"].forEach((s) => {
        Array.prototype.forEach.call(article.querySelectorAll(s), function (n) {
          n.parentNode.removeChild(n);
        });
      });

    return {
      name: parseTitle(html),
      content: getPostParseElement(article),
    };
  },
};
