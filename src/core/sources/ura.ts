import { AppGenericError } from "../types";
import { parseHtml, parseTitle, getPostParseElement } from "./parseUtils";

//Ex: https://ura.news/news/1052740762
//Ex: https://ura.news/articles/1036288437
export const uraArticleSource = {
  name: "URA.RU",
  img: "https://s.ura.news/favicon.ico?3",
  regex: () => /^https:\/\/ura\.news\/(news|articles)\/[\d]+\/?$/i,
  parse: async (html: string) => {
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
      content: getPostParseElement(article).textContent ?? "empty",
    };
  },
};
