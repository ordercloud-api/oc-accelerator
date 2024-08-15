import { defineStyle, defineStyleConfig } from "@chakra-ui/styled-system"

const baseStyle = defineStyle({
  rounded: "none",
})

const buttonTheme = defineStyleConfig({
  baseStyle,
})

const Button = {
  ...buttonTheme
}

export default Button
