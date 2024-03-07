import { dwArticleSource } from "./dw";
import { geniousSongSource, geniousAlbumSource } from "./genius";
import { lentaArticleSource } from "./lenta";
import { meduzaArticleSource } from "./meduzas";
import { uraArticleSource } from "./ura";

export const allowedSources = [
  geniousSongSource,
  geniousAlbumSource,
  meduzaArticleSource,
  lentaArticleSource,
  uraArticleSource,
  dwArticleSource,
];
