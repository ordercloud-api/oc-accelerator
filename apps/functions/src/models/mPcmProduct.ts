export interface IAllMPcmProductResponse {
  data: {
    allM_PCM_Product: {
      results: Partial<IMPcmProduct>[];
    };
  };
}

export interface IMPcmProduct {
    orderCloudID: string;
    productName: string;
    productShortDescription: {
        "en-US": string;
    };
    pcmProductToAsset: {
        results: {
            urls: {[key: string]: {url: string}}
        }[]
    }
}