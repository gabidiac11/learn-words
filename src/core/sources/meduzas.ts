import { AppGenericError } from "../types";
import { parseHtml, parseTitle, getPostParseElement, Source } from "./parseUtils";

//Ex: https://meduza.io/feature/2024/03/05/vsu-pytayutsya-sderzhat-nastuplenie-voysk-rf-v-donetskoy-oblasti-po-rossiyskim-gorodam-ezdit-agitpoezd-sila-v-pravde
//Ex: https://meduza.io/news/2024/03/05/institut-razvitiya-interneta-eto-on-razdaet-dengi-na-patrioticheskiy-kontent-zapustit-sobstvennyy-telekanal-my
export const meduzaArticleSource:Source = {
  name: "Meduza",
  img: "https://meduza.io/favicon-32x32.png",
  regex: () =>
    /^https:\/\/meduza\.io\/(feature|news)\/\d{4}\/\d{2}\/\d{2}\/[\w\-_]+\/?$/i,
  parse: async (html: string) => {
    const article = parseHtml(html).querySelector(
      `.GeneralMaterial-module-root`
    ) as HTMLElement;
    if (!article)
      throw new AppGenericError("Something went wrong with parsing.");

    const removeFooter = () => {
      const articleFooter = article?.querySelector(`[data-testid="toolbar"]`);
      articleFooter?.parentNode?.removeChild(articleFooter);
    };
    const adjustArticleTitle = () => {
      const header =
        article.querySelector(
          `.GeneralMaterial-module-head [data-testid="rich-title"]`
        ) ??
        article.querySelector(
          `.GeneralMaterial-module-head [data-testid="simple-title"]`
        );
      const headerContainer = article?.querySelector(
        `.GeneralMaterial-module-head`
      );
      if (header && headerContainer) {
        headerContainer.innerHTML = header.textContent ?? "Empty title";
      }
    };
    const removeRelatedItems = () => {
      Array.prototype.forEach.call(
        article?.querySelectorAll(`[data-testid="related-rich-block"]`),
        function (node) {
          node?.parentNode?.removeChild(node);
        }
      );
    };
    const removeSeparators = () => {
      article.innerHTML = article.innerHTML.replaceAll(
        /<div[^>]*><\/div>/g,
        ""
      );
    };
    removeFooter();
    adjustArticleTitle();
    removeRelatedItems();
    removeSeparators();

    return {
      name: parseTitle(html),
      content:
        getPostParseElement(article, {
          p: 2,
          div: 1,
          h: 1,
        }),
    };
  },
};
