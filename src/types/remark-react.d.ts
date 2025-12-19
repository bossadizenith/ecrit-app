declare module "remark-react" {
  import { Plugin } from "unified";
  import React from "react";

  interface RemarkReactOptions {
    createElement?: typeof React.createElement;
  }

  const remarkReact: Plugin<[RemarkReactOptions], any, any>;
  export default remarkReact;
}
