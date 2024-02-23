import React, { KeyboardEventHandler } from "react";

export const useOnEnter = (handleSubmit: () => void): KeyboardEventHandler<HTMLInputElement | HTMLTextAreaElement> => {
  return (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  };
};
