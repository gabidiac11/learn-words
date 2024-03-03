import { ContentPaste } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useCallback } from "react";
import { useUIFeedback } from "../app-context/useUIFeedback";

export const PasteButton = ({
  onChange,
}: {
  onChange: (value: string) => void;
}) => {
  const { displayError } = useUIFeedback();
  const copyFromClipboard = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch (err) {
      console.error("Failed to read clipboard contents:", err);
      displayError("Failed to read clipboard contents");
    }
  }, [displayError, onChange]);

  return (
    <Button startIcon={<ContentPaste />} onClick={copyFromClipboard}>
      Paste
    </Button>
  );
};
