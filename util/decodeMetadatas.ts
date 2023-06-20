import base64url from "base64url";
import { RentalPackMetadata } from "./type";

export const decodeMetadatas = (arr: string[] | undefined) => {
  if (!arr) return [];
  const metadatas: RentalPackMetadata[] = [];
  for (let i = 0; i < arr.length; i++) {
    const decoded = base64url.decode(arr[i].slice(29));
    const result: RentalPackMetadata = JSON.parse(decoded);
    metadatas.push(result);
  }
  return metadatas;
};
