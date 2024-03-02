import { useUIFeedback } from "../app-context/useUIFeedback";
import Button from "@mui/joy/Button";
import SvgIcon from "@mui/joy/SvgIcon";
import { styled } from "@mui/joy";
import { ChangeEvent, useCallback, useState } from "react";
import { DeleteRounded as ClearIcon } from "@mui/icons-material";
import { uuidv4 } from "@firebase/util";

const VisuallyHiddenInput = styled("input")`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const maxDisplay = 50;

export const FileInput = (props: {
  onChange: (e: File) => Promise<unknown>;
  onRemove: () => void;
}) => {
  const [fileName, setFileName] = useState<string | null>();
  const [inputKey, setInputKey] = useState(uuidv4());

  const { displayError } = useUIFeedback();

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      console.log("change", e);
      const file = e.target.files?.[0];
      if (!file) {
        displayError("No file selected.");
        return;
      }

      setFileName(
        file.name.length > maxDisplay
          ? `${file.name.slice(0, (maxDisplay - 3) / 2)}...${file.name.slice(
              file.name.length - (maxDisplay - 3) / 2,
              file.name.length
            )}`
          : file.name
      );
      props.onChange(file);
    },
    [displayError, props]
  );

  const onRemove = useCallback(() => {
    if (!fileName) {
      displayError("No file selected.");
      return;
    }

    setFileName(null);
    setInputKey(uuidv4());
    props.onRemove();
  }, [displayError, fileName, props]);

  return (
    <div className="flex file-input">
      <Button
        component="label"
        role={undefined}
        tabIndex={-1}
        variant="outlined"
        color="neutral"
        startDecorator={
          <SvgIcon>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
              />
            </svg>
          </SvgIcon>
        }
      >
        {!fileName && "Upload a file"}
        {!!fileName && fileName}
        <VisuallyHiddenInput key={inputKey} type="file" onChange={onChange} />
      </Button>
      {!!fileName && (
        <button className="btn-svg ml-10" onClick={onRemove}>
          <ClearIcon />
        </button>
      )}
    </div>
  );
};
