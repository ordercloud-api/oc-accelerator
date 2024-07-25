
/* If present for an OrderCloud resource, a form override object will be used to control the presentation of form fields.

  The presence of a property in a resource's form override object indicates that it will be shown in the form in the order that is specified.
  The name defined for each property will be the form label shown.

  Exceptions to this rule is required fields on a resource schema, and xp since that is defined in the ./xpSchemas config
*/

export const formOverrides: {[key: string]: any} = {
    // Products: {
    //   Name: "Custom Product Name",
    //   ID: "ID",
    //   Inventory: "Custom Inventory Name",
    //   ['Inventory.Enabled']: "Enabled"
    // },
  }