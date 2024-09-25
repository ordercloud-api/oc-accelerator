import { IAllMPcmProductResponse, IMPcmProduct } from "../models/mPcmProduct";
import { fetchGraphQL } from "../services/fetchGraphQL";

const allMPcmProductQuery = (ids: string[]) => `
{
  allM_PCM_Product(where:	{orderCloudID_anyOf:${ids}}) {
    results{
      orderCloudID
      productName
      productShortDescription
      pCMProductToAsset {
        results {
          urls
        }
      }
    }
  }
}
`;

export async function getAllPcmProduct(
  ids: string[]
): Promise<{
    pcmProducts: Partial<IMPcmProduct>[];
}> {
  const results: IAllMPcmProductResponse = await fetchGraphQL<IAllMPcmProductResponse>(allMPcmProductQuery(ids));

  return {
    pcmProducts: results.data.allM_PCM_Product.results,
  };
}