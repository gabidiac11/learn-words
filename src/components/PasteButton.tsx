import { ContentPaste } from "@mui/icons-material";
import { Button } from "@mui/material";
import { PropsWithChildren, useCallback } from "react";
import { useUIFeedback } from "../app-context/useUIFeedback";

export const PasteButton = ({
  onChange,
  disabled,
  children,
}: {
  onChange: (value: string) => void;
  disabled?: boolean;
} & PropsWithChildren) => {
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
    <Button
      disabled={disabled}
      className="paste-btn"
      startIcon={<ContentPaste />}
      onClick={copyFromClipboard}
    >
      {children ?? "Paste"}
    </Button>
  );
};
