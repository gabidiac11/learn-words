import { AppGenericError } from "../types";
import {
  parseHtml,
  parseTitle,
  getPostParseElement,
  isMobile,
  SourceWithMobile,
} from "./parseUtils";

//Ex: https://lenta.ru/news/2024/03/06/v-odesse-proizoshla-seriya-vzryvov/
//Ex: https://lenta.ru/articles/2024/03/05/simonova/
export const lentaArticleSource: SourceWithMobile = {
  name: "Lenta",
  img: "https://icdn.lenta.ru/images/icons/icon-256x256.png",
  regex: function () {
    return /^https:\/\/(m\.)?lenta\.ru\/(articles|news|brief)\/\d{4}\/\d{2}\/\d{2}\/[\w\-_]+\/?$/i;
  },
  parseMobile: async function (html: string) {
    const body = parseHtml(html);
    const heading = body.querySelector(
      ".common-head__titles-container"
    ) as HTMLElement;
    const article = body.querySelector(`.content-body`) as HTMLElement;
    if (!article || !heading)
      throw new AppGenericError("Something went wrong with parsing.");

    article.prepend(heading);
    return {
      name: parseTitle(html),
      content:
        getPostParseElement(article, {
          p: 2,
          div: 1,
          h: 2,
        }),
    };
  },
  parse: async function (html: string, url: string) {
    if (isMobile(url)) {
      return this.parseMobile(html);
    }
    const article = parseHtml(html).querySelector(
      `.topic-page__container`
    ) as HTMLElement;
    if (!article)
      throw new AppGenericError("Something went wrong with parsing.");

    [`.topic-page__header`, `.topic-footer`].forEach((selector) => {
      const node = article.querySelector(selector);
      node?.parentNode?.removeChild(node);
    });

    return {
      name: parseTitle(html),
      content:
        getPostParseElement(article, {
          p: 2,
          div: 1,
          h: 2,
        }),
    };
  },
};
