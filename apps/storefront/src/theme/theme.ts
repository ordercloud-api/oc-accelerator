import { extendTheme } from "@chakra-ui/react";
import components from "./components/index";
import foundations from "./foundations/index";
import layerStyles from "./layer-styles";
import semanticTokens from "./semantic-tokens";
import styles from "./styles";

const acceleratorTheme = extendTheme({
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
});

export default acceleratorTheme;
