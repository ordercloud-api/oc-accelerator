import { OpenAPIV3 } from "openapi-types";

/* Follow Open API Specification
https://swagger.io/specification/ */

export const productXp : OpenAPIV3.SchemaObject = {
  "type": "object",
  "properties": {
    "Images": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "ThumbnailUrl": {
            "type": "string"
          },
          "Url": {
            "type": "string"
          }
        }
      }
    },
    "ProductType": {
      "type": "string",
      "enum": ["A", "B", "C"]
    },
    "Tax": {
      "type": "object",
      "properties": {
        "Description": {
          "type": "string",
          "maxLength": 50
        },
        "LongDescription": {
          "type": "string",
          "maxLength": 200
        },
        "Code": {
          "type": "string"
        }
      }
    }
  },
  "required": ["ProductType"]
}