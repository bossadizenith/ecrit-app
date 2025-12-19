import { useCallback, useState } from "react";

import { Preview } from "./preview";
import { Writer } from "./writer";

export const Editor = () => {
  const [docs, setDocs] = useState("# Hello Zenith");

  const handleDocsChange = useCallback((docs: string) => {
    setDocs(docs);
  }, []);

  return (
    <div className="size-full flex gap-2">
      <Writer initialDocs={docs} onChange={handleDocsChange} />
      <Preview docs={docs} />
    </div>
  );
};
