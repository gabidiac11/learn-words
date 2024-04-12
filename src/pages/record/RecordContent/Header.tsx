import { Button } from "@mui/joy";
import HighlightIcon from "@mui/icons-material/Highlight";
import EditNoteIcon from "@mui/icons-material/EditNote";
import RefreshIcon from "@mui/icons-material/Refresh";
import AbcIcon from "@mui/icons-material/Abc";
import "./RecordContent.scss";
import { ClearRounded, Translate } from "@mui/icons-material";
import { highlightModes, HightlightMode } from "./contentHightligh";
import { ContentSection } from "../../../core/types";

export const RecordContentHeader = ({
  hightlightMode,
  sections,
  changed,
  onChangeHightlighMode,
  onAddHighlight,
  onRemoveHighlight,
}: {
  hightlightMode: HightlightMode;
  sections: ContentSection[] | undefined;
  changed: boolean | undefined;
  onChangeHightlighMode: (value: HightlightMode) => void;
  onAddHighlight: () => void;
  onRemoveHighlight: () => void;
}) => {
  return (
    <div className="record-panel mb-15 flex flex-wrap">
      <div className="flex flex-end">
        {!!sections &&
          highlightModes.map((h, i) => (
            <Button
              key={i}
              variant="solid"
              className="mr-15 mb-5 btn-mode"
              onClick={() => onChangeHightlighMode(h)}
              color={h === hightlightMode ? "primary" : "neutral"}
            >
              {(() => {
                switch (h) {
                  case HightlightMode.TranslateLink:
                    return <Translate />;
                  case HightlightMode.Add:
                    return <EditNoteIcon />;
                  default:
                    return <AbcIcon />;
                }
              })()}
            </Button>
          ))}
      </div>
      <div className="flex flex-end">
        <Button
          className="mr-15 mb-5"
          variant="solid"
          disabled={!changed}
          onClick={() => onAddHighlight()}
        >
          {!sections ? <HighlightIcon /> : <RefreshIcon />}
        </Button>
        {!!sections && (
          <Button
            className="mr-15 mb-5"
            variant="solid"
            onClick={onRemoveHighlight}
          >
            <ClearRounded />
          </Button>
        )}
      </div>
    </div>
  );
};
