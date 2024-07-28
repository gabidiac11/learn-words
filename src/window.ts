declare global {
  interface Window {
    scrEl: () => HTMLDivElement;
    _wlTranslate: (text: string) => Promise<string|null>;
    _wlTranslateInner?: (text: string) => Promise<unknown>;
  }
}

window.scrEl = () => {
  const node = document.querySelector<HTMLDivElement>(".main");
  if (!node) throw new Error("Something went wrong!");
  return node;
};

window._wlTranslate = (() => {
  const _d: { [key: string]: string } = {};
  
  return async (text: string): Promise<string|null> => {
    if(_d[text]) return _d[text];

    if(window._wlTranslateInner) {
      try {
        const translated = window._wlTranslate(text);
        if(typeof translated === "string")
        {
          _d[text] = translated;
          return translated;
        }
      } catch(error) {
        return null;
      }
    }
    return null;
  };
})();

export {};
