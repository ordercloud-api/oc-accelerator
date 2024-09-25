type IGraphQLResponseWithErrors = {
  errors: unknown[];
};

export async function fetchGraphQL<T = void>(query: string): Promise<T> {
  // If there's a development variable, use it, or use production, or default to empty string in last case
  const apiKey = "some-app-setting-needs-to-go-here";
  const endpointUrl = "some-app-setting-needs-to-go-here";
  try {
    return await fetch(endpointUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-GQL-Token": apiKey,
      },
      body: JSON.stringify({ query }),
    })
      .then((response: Response) => {
        const jsonResponsePromise = response.json();
        jsonResponsePromise.then((jsonResponse: unknown) => {
          const responseWithErrors = jsonResponse as IGraphQLResponseWithErrors;
          if (
            responseWithErrors.errors &&
            responseWithErrors.errors.length > 0
          ) {
            console.error(
              "An error was returned by a GraphQL query. See the associated logged object for details.",
              responseWithErrors
            );
          }
        });
        return jsonResponsePromise;
      })
      .catch((error) => {
        return console.log(error);
      });
  } catch (error) {
    console.log(error);
  }
}
