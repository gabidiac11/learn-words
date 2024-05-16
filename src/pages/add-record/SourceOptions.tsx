import Input from "@mui/joy/Input";
import { PasteButton } from "../../components/PasteButton";
import { useCallback } from "react";

export const SourceOptions = ({
  urlValue,
  setUrlValue,
  className
}: {
  urlValue: string|undefined;
  setUrlValue: (str: string) => void;
  className?: string;
}) => {
  const onPaste = useCallback(
    (value: string) => {
      setUrlValue(value);
    },
    [setUrlValue]
  );

  return (
    <Input
      className={`page-input ${className ?? ""}`}
      placeholder="Enter source (optional)"
      tabIndex={-1}
      variant="outlined"
      value={urlValue}
      onChange={(e) => setUrlValue(e.target.value)}
      endDecorator={
        <div className="flex">
          <PasteButton onChange={onPaste} />
        </div>
      }
    />
  );
};
