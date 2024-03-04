import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import Typography from "@mui/joy/Typography";
import { ChangeEvent, useCallback, useState } from "react";
import { useUIFeedback } from "../../app-context/useUIFeedback";
import { PasteButton } from "../../components/PasteButton";
import { useWordContentFunctions } from "../../core/useWordContentFunctions";
import { useRefState } from "../../hooks/useRefState";

export const UrlInput = ({
  onChange: submit,
}: {
  onChange: (name: string, content: string) => void;
}) => {
  const [urlValue, setUrlValue] = useState("");
  const [isFetching, setIsFetching] = useRefState(false);
  const { fetchUrlContent } = useWordContentFunctions();

  const { displayError } = useUIFeedback();

  const onFetchUrlContent = useCallback(
    async (url: string) => {
      setIsFetching(true);
      try {
        const { name, content } = await fetchUrlContent(url);
        submit(name, content);
      } catch (error) {
        console.error(error);
        displayError(error);
      } finally {
        setIsFetching(false);
      }
    },
    [setIsFetching, fetchUrlContent, submit, displayError]
  );

  const onChangeUrlValue = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setUrlValue(e.target.value);
  }, []);

  const onPaste = useCallback(
    (value: string) => {
      setUrlValue(value);
      onFetchUrlContent(value);
    },
    [onFetchUrlContent]
  );

  return (
    <div>
      <div>
        <Typography
          id="decorated-list-demo"
          level="body-xs"
          textTransform="uppercase"
          fontWeight="lg"
          mb={1}
        >
          Sources
        </Typography>
        <List aria-labelledby="decorated-list-demo">
          <ListItem>
            <ListItemDecorator>
              <img
                width="20px"
                alt="genius"
                src="https://assets.genius.com/images/apple-touch-icon.png?1709224724"
              />
            </ListItemDecorator>{" "}
            Genius
          </ListItem>
        </List>
      </div>
      <div className="mt-20 page-input-container">
        <Input
          className="page-input"
          placeholder="Enter url"
          tabIndex={-1}
          // onBlur={() => onFetchUrlContent(urlValue)}
          variant="outlined"
          value={urlValue}
          onChange={onChangeUrlValue}
          endDecorator={
            <div className="flex">
              <PasteButton onChange={onPaste}> </PasteButton>
              <Button
                onClick={() => onFetchUrlContent(urlValue)}
                loading={isFetching}
              >
                Fetch
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
};
