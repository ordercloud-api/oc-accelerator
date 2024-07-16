import {
  ActionMeta,
  CreatableSelect,
  Props,
  Select,
} from "chakra-react-select";
import useDebounce from "../../../../hooks/useDebounce";
import _, { uniqBy } from "lodash";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { BaseProps, FormControl } from "../form-control";
import { InputGroup, InputLeftAddon } from "@chakra-ui/react";

interface ReactSelectOption {
  label: string;
  value: string;
}

interface ISelectProps extends Props<ReactSelectOption, boolean, any> {
  setInput?: (inputValue: string) => void;
  relatedResourceOptions?: any;
}

export type SelectControlProps = BaseProps & {
  nested?: boolean;
  leftAddon?: string;
  creatable?: boolean;
  singularLabel?: string;
  selectProps: ISelectProps;
};

export const SelectControl: FC<SelectControlProps> = (props) => {
  const {
    name,
    control,
    label,
    leftAddon,
    creatable,
    singularLabel,
    selectProps: { setInput, isMulti, relatedResourceOptions, ...selectProps },
    isDisabled,
    ...rest
  } = props;
  const [options, setOptions] = useState<ReactSelectOption[]>(
    (selectProps?.options as ReactSelectOption[]) || []
  );
  const [selectedOptions, setSelectedOptions] = useState<ReactSelectOption[]>(
    []
  );
  const [inputValue, setInputValue] = useState(selectProps?.inputValue || "");
  const debouncedInputValue = useDebounce(inputValue, setInput ? 300 : 0);
  const [hasFocused, setHasFocused] = useState(false);
  const {
    field: { onChange: onFieldChange, value: fieldValue, ...field },
    fieldState: { isTouched, isDirty },
    formState: { isSubmitting },
  } = useController({
    name,
    control,
  });

  const { resetField } = useFormContext();

  const memoOptions = useMemo(() => {
    if (isMulti && !creatable && !setInput) {
      return [
        {
          value: "[[[ALL]]]",
          label: "Select All",
        } as ReactSelectOption,
        ...options,
      ];
    } else {
      return options;
    }
  }, [creatable, isMulti, setInput, options]);

  const availableOptions = useMemo(() => {
    return uniqBy([...(options || []), ...selectedOptions], (o) => o.value);
  }, [options, selectedOptions]);

  const filterOptions = useCallback(
    ({ label, value }: { label: string; value: any }, string: string) => {
      if (setInput) return true;
      // only when not using async select as options for that method are set by loadOptions
      else if (value === "[[[ALL]]]") {
        return !!string;
      } else if (string) {
        const stringLowercase = string.toLocaleLowerCase();
        const labelLowercase = label.toString().toLocaleLowerCase();
        const valueLowercase = value.toString().toLocaleLowerCase();
        return (
          labelLowercase.includes(stringLowercase) ||
          valueLowercase.includes(stringLowercase)
        );
      } else {
        return true;
      }
    },
    [setInput]
  );

  const handleChange = useCallback(
    (opts: any, obj: ActionMeta<ReactSelectOption>) => {
      if (isMulti) {
        let result: string[] = [];
        let availableOptions: ReactSelectOption[] = opts as ReactSelectOption[];
        if (
          obj?.action === "select-option" &&
          obj?.option?.value.toString() === "[[[ALL]]]"
        ) {
          availableOptions = (
            [
              ...opts,
              ...options.filter((o) => filterOptions(o, inputValue)),
            ] as ReactSelectOption[]
          ).filter((o) => o.value !== "[[[ALL]]]") as ReactSelectOption[];
        }

        result = _.uniq(availableOptions.map((o) => o.value));
        setSelectedOptions((sOpts) => [...sOpts, ...availableOptions]);
        onFieldChange(result);
      } else {
        if (!opts?.value) {
          setSelectedOptions([]);
          resetField(name, { defaultValue: "" });
          return;
        }
        onFieldChange(opts?.value || null);
      }
    },
    [
      isMulti,
      onFieldChange,
      options,
      filterOptions,
      inputValue,
      resetField,
      name,
    ]
  );

  const parsedValue = useMemo(() => {
    if (!fieldValue) {
      return "";
    }
    if (isMulti) {
      return fieldValue.map((fv: any) => {
        return (
          availableOptions.find((o) => fv === o.value) || {
            value: fv,
            label: fv,
          }
        );
      });
    }
    if (Array.isArray(fieldValue)) {
      throw new Error(
        "Unexpected array value consider setting isMulti=true on <SelectControl /> if multi value is needed"
      );
    }
    return (
      availableOptions.find((option) => option.value === fieldValue) || {
        value: fieldValue,
        label: fieldValue,
      }
    );
  }, [availableOptions, fieldValue, isMulti]);

  useEffect(() => {
    if (!setInput) {
      // this solves issue where options are not initially set

      // only when not using async select as options for that method are set by loadOptions
      setOptions(props.selectProps?.options as ReactSelectOption[]);
    }
  }, [props.selectProps?.options, setInput]);

  const loadOptionsCallback = useCallback(
    async (search: string) => {
      if (!setInput) return;
      setInput(search);
    },
    [setInput]
  );

  useEffect(() => {
    if (relatedResourceOptions) {
      setOptions(relatedResourceOptions);
    }
  }, [relatedResourceOptions]);

  const handleFocusEvent = useCallback(() => {
    if (!hasFocused) setHasFocused(true);
  }, [hasFocused]);

  useEffect(() => {
    if (isTouched) {
      setHasFocused(true);
    }
  }, [isTouched, isDirty]);

  useEffect(() => {
    if (hasFocused) {
      loadOptionsCallback(debouncedInputValue);
    }
  }, [loadOptionsCallback, debouncedInputValue, hasFocused, isTouched]);

  const renderSelect = useMemo(() => {
    const otherProps = {
      isMulti: isMulti,
      options: memoOptions,
      onChange: handleChange,
      onInputChange: setInputValue,
      value: parsedValue,
      hideSelectedOptions: true,
      isDisabled: isSubmitting || isDisabled,
      classNamePrefix: "ordercloud-portal",
      filterOption: filterOptions,
      onFocus: handleFocusEvent,
    };
    const allProps = { ...field, ...selectProps, ...otherProps };
    return creatable ? (
      <CreatableSelect
        {...allProps}
        placeholder={singularLabel && `Type to add ${singularLabel}`}
        isSearchable
      />
    ) : (
      <Select {...allProps} isSearchable />
    );
  }, [
    creatable,
    field,
    filterOptions,
    handleChange,
    handleFocusEvent,
    isDisabled,
    isMulti,
    isSubmitting,
    memoOptions,
    parsedValue,
    selectProps,
    singularLabel,
  ]);

  return (
    <FormControl
      name={name}
      control={control}
      label={label}
      {...rest}
      marginBottom={label ? 5 : 0}
    >
      {leftAddon ? (
        <InputGroup
          css={{
            ".ordercloud-portal__control": {
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
            },
          }}
        >
          <InputLeftAddon>{leftAddon}</InputLeftAddon>
          {renderSelect}
        </InputGroup>
      ) : (
        renderSelect
      )}
    </FormControl>
  );
};
