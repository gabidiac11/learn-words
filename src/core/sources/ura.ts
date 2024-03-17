import { AppGenericError } from "../types";
import {
  parseHtml,
  parseTitle,
  getPostParseElement,
  SourceWithMobile,
  isMobile,
} from "./parseUtils";

//Ex: https://ura.news/news/1052740762
//Ex: https://ura.news/articles/1036288437
export const uraArticleSource: SourceWithMobile = {
  name: "URA.RU",
  img: "https://s.ura.news/favicon.ico?3",
  regex: () => /^https:\/\/(m\.)?ura\.news\/(news|articles)\/[\d]+\/?$/i,
  parseMobile: async function (html: string) {
    const parent = parseHtml(html).querySelector(
      `[data-type="news"]`
    ) as HTMLElement;

    const articleHeading = parent.querySelector(`h1`);
    const article = parent.querySelector(`.item-text`) as HTMLElement;
    if (!article || !articleHeading)
      throw new AppGenericError("Something went wrong while parsing.");
    article.prepend(articleHeading);

    [".publication-send-news", ".yandex-rss-hidden"].forEach((s) => {
      Array.prototype.forEach.call(article.querySelectorAll(s), function (n) {
        n.parentNode.removeChild(n);
      });
    });
    return {
      name: parseTitle(html),
      content:
        getPostParseElement(article, {
          p: 0,
          div: 0,
          h: 1,
        }),
    };
  },
  parse: async function (html: string, url: string) {
    if (isMobile(url)) {
      return await this.parseMobile(html);
    }
    const articleContainer = parseHtml(html).querySelector(
      `.vc-publication-center`
    ) as HTMLElement;

    const articleTitle = articleContainer.querySelector(".publication-title");
    const article = articleContainer.querySelector(`.item-text`) as HTMLElement;
    articleTitle && article.prepend(articleTitle);

    if (!article)
      throw new AppGenericError("Something went wrong with parsing.");

    [
      ...(Array.prototype.map.call(
        article.querySelectorAll(`.yandex-rss-hidden`),
        function (n) {
          return n as HTMLElement;
        }
      ) as HTMLElement[]),
    ].forEach((node) => {
      node?.parentNode?.removeChild(node);
    });
    return {
      name: parseTitle(html),
      content: getPostParseElement(article),
    };
  },
};
