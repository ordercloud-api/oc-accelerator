import {ValueEditorProps} from "react-querybuilder"
import {CreatableSelect, MultiValue} from "chakra-react-select"

export const CreatableInputField = (props: ValueEditorProps) => {
  const handleOnChange = (options: MultiValue<any>) => {
    const stringified = options.map((o) => o.value).join(",")
    props.handleOnChange(stringified)
  }

  return (
    <CreatableSelect<any, true>
      value={props?.value
        .split(",")
        .filter((v: any) => !!v) // exclude empty strings
        .map((v: any) => ({label: v, value: v}))}
      isMulti={true}
      noOptionsMessage={() => "Start typing to create option"}
      placeholder="Start typing to create option"
      isDisabled={props.context?.isDisabled}
      onChange={handleOnChange}
      chakraStyles={{
        container: (baseStyles) => ({...baseStyles, minWidth: "300px"})
      }}
    />
  )
}
