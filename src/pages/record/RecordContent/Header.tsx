import { Button } from "@mui/joy";
import HighlightIcon from "@mui/icons-material/Highlight";
import EditNoteIcon from "@mui/icons-material/EditNote";
import RefreshIcon from "@mui/icons-material/Refresh";
import AbcIcon from "@mui/icons-material/Abc";
import "./RecordContent.scss";
import { ClearRounded, Translate } from "@mui/icons-material";
import { HightlightMode } from "./contentHightligh";
import { ContentSection } from "../../../core/types";

export const RecordContentHeader = ({
    hightlightMode,
    sections,
    changed,
    switchHightligh,
    onAddHighlight,
    onRemoveHighlight,
  }: {
    hightlightMode: HightlightMode;
    sections: ContentSection[] | undefined;
    changed: boolean | undefined;
    switchHightligh: () => void;
    onAddHighlight: () => void;
    onRemoveHighlight: () => void;
  }) => {
    return (
      <div className="record-panel mb-15">
        <div className="flex flex-wrap">
          {!!sections && (
            <Button
              variant="solid"
              className="mr-15 mb-5 btn-mode"
              onClick={switchHightligh}
            >
              {(() => {
                switch (hightlightMode) {
                  case HightlightMode.TranslateLink:
                    return <Translate />;
                  case HightlightMode.Add:
                    return <EditNoteIcon />;
                  default:
                    return <AbcIcon />;
                }
              })()}
            </Button>
          )}
          <Button
            className="mr-15 mb-5"
            variant="solid"
            disabled={!changed}
            onClick={() => onAddHighlight()}
            startDecorator={!sections ? <HighlightIcon /> : <RefreshIcon />}
          >
            {!sections && "Add"}
            {!!sections && "Refresh"}
          </Button>
          {!!sections && (
            <Button
              className="mr-15 mb-5"
              variant="solid"
              onClick={onRemoveHighlight}
              startDecorator={<ClearRounded />}
            >
              Remove color
            </Button>
          )}
        </div>
      </div>
    );
  };
  