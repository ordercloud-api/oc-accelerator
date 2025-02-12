import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Text,
  Icon,
} from "@chakra-ui/react";
import pluralize from "pluralize";
import { FC, useCallback, useMemo } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import RequestField from "./RequestField";
import RequestObject from "./RequestObject";
import { getLabelOverride, getPropertyLabel } from "../../utils/spec.utils";
import { SelectControl } from "./Controls/select-control";
import { TbPlus } from "react-icons/tb";
import { RelatedResourceControl } from "./Controls/related-resource-control";
import { relatedListOperationsByResource } from "../../config/related-resources";
import { useHasAccess } from "@ordercloud/react-sdk";

interface IRequestArray {
  path?: string;
  propKey?: string;
  schema: any;
  formControl: any;
  resourceId: string;
  nested?: boolean;
  showReadOnlyFields?: boolean;
  hasInitialValues?: boolean;
}

const emptyType: any = (propSchema: any) => {
  switch (propSchema.type) {
    case "string":
      return "";
    case "number":
      return propSchema.format === "float" ? "0.00" : 0;
    case "integer":
      return 1;
    case "boolean":
      return false;
    case "array":
      return [emptyType(propSchema.items)];
    case "object":
      return {};
  }
};

const RequestArray: FC<IRequestArray> = ({
  formControl,
  path,
  schema,
  resourceId,
  nested,
  propKey,
  showReadOnlyFields,
  hasInitialValues,
}) => {
  const { fields, remove, append } = useFieldArray({
    control: formControl,
    name: path!,
  });

  const labelOverride = useMemo(() => {
    return getLabelOverride(path!, resourceId);
  }, [path, resourceId]);

  const label = useMemo(() => {
    return nested ? "" : path && getPropertyLabel(path);
  }, [nested, path]);

  const singularLabel = useMemo(() => {
    return label?.split(" ").map(pluralize.singular).join(" ");
  }, [label]);

  const { control } = useFormContext()
  
  const relatedProperty = useMemo(
    () =>
      relatedListOperationsByResource[resourceId]?.[propKey!] ||
      relatedListOperationsByResource['Assignments'][propKey!],
    [resourceId, propKey]
  )
  const values = useWatch({ control, name: (relatedProperty?.dependencies || []) as string[] })

  const relatedOperationInfo = useMemo(() => {
    return relatedProperty?.operationInfo(values)
  }, [relatedProperty, values])

  const { allowed: canUseRelatedOperation} = useHasAccess(
    relatedOperationInfo?.operationId?.split(".")[0],
  )

  const newItem = useMemo(() => {
    return emptyType(schema.items);
  }, [schema]);

  const renderArrayItem = useCallback(
    (field: any, i: number, remove: any) => {
      const arrayPropPath = `${path}.${i}`;
      switch (schema.items.type) {
        case "object":
          return (
            <RequestObject
              resourceId={resourceId}
              removeCallback={() => remove(i)}
              formControl={formControl}
              labelOverride={labelOverride ?? singularLabel}
              key={field.id}
              path={arrayPropPath}
              schema={schema.items.properties}
              readOnly={schema.readOnly}
              showReadOnlyFields={showReadOnlyFields}
              childOfArray={true}
              hasInitialValues={hasInitialValues}
            />
          );
        case "array":
          return (
            <Box
              padding={5}
              mb={10}
              border="1px"
              borderColor="chakra-border-color"
              rounded="md"
              shadow="lg"
            >
              {!schema.readOnly && (
                <Button
                  colorScheme={"red"}
                  size="sm"
                  variant="ghost"
                  onClick={() => remove(i)}
                >
                  Remove
                </Button>
              )}
              <RequestArray
                resourceId={resourceId}
                key={field.id}
                path={arrayPropPath}
                propKey={propKey}
                formControl={formControl}
                nested={true}
                schema={{ ...schema.items }}
                showReadOnlyFields={showReadOnlyFields}
                hasInitialValues={hasInitialValues}
              />
            </Box>
          );
        default:
          return (
            <>
              <Divider borderColor="transparent" my={1} />
              <RequestField
                resourceId={resourceId}
                removeCallback={() => remove(i)}
                key={field.id}
                propKey={propKey!}
                hideLabel={true}
                path={arrayPropPath}
                schema={{
                  ...schema.items,
                  readOnly: schema.readOnly,
                }}
                hasInitialValues={hasInitialValues}
              />
            </>
          );
      }
    },
    [path, schema.items, schema.readOnly, resourceId, formControl, labelOverride, singularLabel, showReadOnlyFields, hasInitialValues, propKey]
  );

  if (canUseRelatedOperation) {
    return (
      <RelatedResourceControl
        name={path!}
        label={labelOverride ?? label}
        isMulti={true}
        isRequired={schema.required}
        helperText={schema.description}
        operationInfo={relatedOperationInfo}
        renderFn={relatedProperty.renderItem}
      />
    )
  }

  //When read only, only show the label & value if there is something there to show
  return ((schema.readOnly && fields.length) || !schema.readOnly) &&
    !schema.items.enum &&
    schema.items.type !== "string" ? (
    <FormControl isRequired={schema.required} mb={5}>
      <FormLabel
        optionalIndicator={
          <Text
            as="span"
            fontWeight="normal"
            fontStyle="italic"
            color="chakra-subtle-text"
            ml={3}
          >{`(${schema.readOnly ? "read-only" : "optional"})`}</Text>
        }
      >
        {labelOverride ?? label}
      </FormLabel>
      {/* when read only, do not provide controls for add/remove */}
      <Box>
        {fields.map((field, index) => renderArrayItem(field, index, remove))}
        {!schema.readOnly && (
          <Button
            variant="outline"
            width="full"
            colorScheme="primary"
            leftIcon={<Icon as={TbPlus} />}
            onClick={() => {
              append(newItem);
            }}
          >
            Add {labelOverride ?? singularLabel?.toLowerCase()}
          </Button>
        )}
      </Box>
    </FormControl>
  ) : schema.items.enum || schema.items.type === "string" ? (
    <SelectControl
      name={path!}
      isRequired={schema.required}
      isReadOnly={schema.readOnly}
      isDisabled={schema.readOnly}
      selectProps={{
        isMulti: true,
        closeMenuOnSelect: false,
        options:
          schema?.items?.enum?.map((o: any) => ({ label: o, value: o })) || [],
      }}
      label={label}
      creatable={!schema.items.enum}
      singularLabel={singularLabel}
    ></SelectControl>
  ) : null;
};

export default RequestArray;
