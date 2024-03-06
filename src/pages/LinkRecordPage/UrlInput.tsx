import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import Typography from "@mui/joy/Typography";
import { ChangeEvent, useCallback, useState } from "react";
import { useUIFeedback } from "../../app-context/useUIFeedback";
import { PasteButton } from "../../components/PasteButton";
import { allowedSources } from "../../core/word-content/sources";
import { useWordContentFunctions } from "../../core/word-content/useWordContentFunctions";
import { useRefState } from "../../hooks/useRefState";

export const UrlInput = ({
  onChange: submit,
}: {
  onChange: (name: string, content: string, source: string) => void;
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
        submit(name, content, url);
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
          {allowedSources.map((item, i) => (
            <ListItem key={i}>
              <ListItemDecorator>
                <img width="20px" alt={item.name} src={item.img} />
              </ListItemDecorator>{" "}
              {item.name}
            </ListItem>
          ))}
        </List>
      </div>
      <div className="mt-20 page-input-container">
        <Input
          className="page-input"
          placeholder="Enter url"
          tabIndex={-1}
          variant="outlined"
          value={urlValue}
          onChange={onChangeUrlValue}
          endDecorator={
            <div className="flex">
              <PasteButton disabled={isFetching} onChange={onPaste}>
                {" "}
              </PasteButton>
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
