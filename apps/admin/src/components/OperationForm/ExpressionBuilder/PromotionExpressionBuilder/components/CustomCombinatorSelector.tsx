import {Select} from "@chakra-ui/react"
import {CombinatorSelectorProps} from "react-querybuilder"

export function CustomCombinatorSelector({
  className,
  value,
  handleOnChange,
  options,
  context
}: CombinatorSelectorProps) {
  if (value === ",") {
    // comma is used for min/max but should not be visible in the UI
    return
  }
  return (
    <Select
      className={className}
      value={value}
      onChange={(e) => handleOnChange(e.target.value)}
      isDisabled={context?.isDisabled}
    >
      {(options as any)
        .filter((o: any) => o.label !== "COMMA") // comma is used for min/max but should not be visible in the UI
        .map((option: any) => (
          <option key={option["name"]} value={option["name"]}>
            {option.label}
          </option>
        ))}
    </Select>
  )
}
