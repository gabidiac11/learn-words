declare global {
  interface Window {
    scrEl: () => HTMLDivElement;
  }
}

window.scrEl = () => {
    const node = document.querySelector<HTMLDivElement>(".main");
    if(!node) throw new Error("Something went wrong!");
    return node;
}

export {};
