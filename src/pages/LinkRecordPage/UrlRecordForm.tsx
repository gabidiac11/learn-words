import { RocketLaunch } from "@mui/icons-material";
import { Textarea } from "@mui/joy";
import { Button as ButtonMat } from "@mui/material";
import { useState, useCallback, ChangeEvent } from "react";
import { useUIFeedback } from "../../app-context/useUIFeedback";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import List from "@mui/joy/List";
import ListItem from "@mui/joy/ListItem";
import ListItemDecorator from "@mui/joy/ListItemDecorator";
import { PasteButton } from "../../components/PasteButton";
import { allowedSources } from "../../core/word-content/sources";
import { useWordContentFunctions } from "../../core/word-content/useWordContentFunctions";
import { useRefState } from "../../hooks/useRefState";

export const UrlRecordForm = ({
  submit,
}: {
  submit: (name: string, content: string, source: string) => void;
}) => {
  const { displayError } = useUIFeedback();

  const [urlValue, setUrlValue] = useState("");
  const [urlFetched, setUrlFetched] = useState("");

  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const [errors, setErrors] = useState({
    name: false,
    content: false,
    url: false,
  });

  const [isFetching, setIsFetching] = useRefState(false);
  const { fetchUrlContent } = useWordContentFunctions();

  const onChangeContent = useCallback(async (value: string) => {
    setErrors((p) => ({
      ...p,
      content: false,
    }));
    setContent(value);
  }, []);

  const onChangeName = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    setErrors((p) => ({
      ...p,
      name: false,
    }));
    setName(e.target.value);
  }, []);

  const onSubmit = useCallback(() => {
    setErrors({
      name: !name,
      content: !content,
      url: urlFetched !== urlValue || !urlValue,
    });

    if(!urlFetched) {
      displayError("You need to fetch the url.");
      return;
    }

    const errorMessages: string[] = [];
    if (!content) {
      errorMessages.push("Content is required.");
    }
    if (!name) {
      errorMessages.push("Name is required.");
    }
    if (urlFetched !== urlValue) {
      errorMessages.push(
        "Current url was not fetch: the cotennt might not match the source url."
      );
    }
    const errorMessage = errorMessages.join(" ");
    if (errorMessage) {
      displayError(errorMessage);
      return;
    }

    submit(name, content, urlValue);
  }, [name, content, urlFetched, urlValue, submit, displayError]);

  const onFetchUrlContent = useCallback(
    async (url: string) => {
      setIsFetching(true);
      try {
        const { name, content } = await fetchUrlContent(url);
        setUrlFetched(url);
        setName(name);
        setContent(content);
        setErrors({
          name: false,
          content: false,
          url: false,
        });
      } catch (error) {
        console.error(error);
        displayError(error);
      } finally {
        setIsFetching(false);
      }
    },
    [setIsFetching, fetchUrlContent, displayError]
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
    <div className="url-page-form">
      <div className="mt-20">
        <ButtonMat
          className="pr-20"
          startIcon={<RocketLaunch />}
          onClick={onSubmit}
        >
          Generate
        </ButtonMat>
      </div>

      <div className="mt-20 page-input-container">
        <div>
          <div className="app-txt">Sources</div>
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
            error={errors.url}
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

      {content && (
        <div className="mt-20 page-input-container">
          <Input
            className="page-input"
            error={errors.name}
            onChange={onChangeName}
            value={name}
            placeholder="Enter name"
          />
        </div>
      )}

      {content && (
        <div className="mt-20 page-input-container">
          <Textarea
            className="mt-15"
            error={errors.content}
            aria-label="minimum height"
            value={content}
            onChange={(e) => onChangeContent(e.target.value)}
            minRows={5}
            placeholder="Fetched content"
          />
        </div>
      )}
    </div>
  );
};
