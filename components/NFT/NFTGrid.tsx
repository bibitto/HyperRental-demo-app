import type { NFT as NFTType } from "@thirdweb-dev/sdk";
import Link from "next/link";
import React from "react";
import Skeleton from "../Skeleton/Skeleton";
import NFT from "./NFT";
import styles from "../../styles/Buy.module.css";
import { RentalPackMetadata } from "../../util/type";

type Props = {
  isLoading: boolean;
  data: RentalPackMetadata[] | undefined;
  // overrideOnclickBehavior?: (nft: NFTType) => void;
  emptyText?: string;
  handleSelect: (r: RentalPackMetadata) => void;
};

export default function NFTGrid({
  isLoading,
  data,
  // overrideOnclickBehavior,
  emptyText = "No NFTs found for this collection.",
  handleSelect,
}: Props) {
  return (
    <div className={styles.nftGridContainer}>
      {!data ? (
        [...Array(20)].map((_, index) => (
          <div key={index} className={styles.nftContainer}>
            <Skeleton key={index} width={"100%"} height="312px" />
          </div>
        ))
      ) : data && data.length > 0 ? (
        data.map((nft, i) => (
          <div
            key={i}
            className={styles.nftContainer}
            onClick={() => handleSelect(nft)}
          >
            <NFT rentalPack={nft} />
          </div>
        ))
      ) : (
        <p>{emptyText}</p>
      )}
    </div>
  );
}
