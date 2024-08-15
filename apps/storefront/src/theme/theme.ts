import { extendTheme } from "@chakra-ui/react";
import sitecoreTheme from "@sitecore/blok-theme";
import components from "./components/index";
import foundations from "./foundations/index";
import layerStyles from "./layer-styles";
import semanticTokens from "./semantic-tokens";
import styles from "./styles";

const acceleratorTheme = extendTheme(
  {
    config: {
      initialColorMode: "light",
      // initialColorMode: "system",
      // useSystemColorMode: true,
    },
    ...foundations,
    components,
    styles,
    layerStyles,
    semanticTokens,
  },
  sitecoreTheme
);

export default acceleratorTheme;
