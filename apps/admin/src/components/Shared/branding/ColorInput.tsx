import { Input, InputGroup, InputLeftAddon, useColorModeValue } from '@chakra-ui/react'
import { useCallback, useRef } from 'react'

interface ColorInputProps {
  value: string
  onChange: (newValue: string) => void
}

const ColorInput: React.FC<ColorInputProps> = ({ value, onChange }) => {
  const pickerRef = useRef<HTMLInputElement>(null)

  const handlePickerClick = useCallback(() => {
    pickerRef?.current?.click()
  }, [pickerRef])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <InputGroup>
      <InputLeftAddon
        bgColor={value}
        borderColor={useColorModeValue('gray.300', 'inherit')}
        style={{ aspectRatio: 1 / 1 }}
        onClick={handlePickerClick}
      >
        <Input
          visibility="hidden"
          ref={pickerRef}
          type="color"
          value={value}
          onChange={handleChange}
        />
      </InputLeftAddon>
      <Input
        id="colorInput"
        placeholder="Select a color"
        value={value}
        onChange={handleChange}
      />
    </InputGroup>
  )
}

export default ColorInput
