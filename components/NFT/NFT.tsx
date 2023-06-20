import React, { useEffect, useState } from "react";
import styles from "./NFT.module.css";
import { RentalPackMetadata } from "../../util/type";
import { useEvmWalletNFTs } from "@moralisweb3/next";
import { MUMBAI_CHAIN_ID } from "../../util/const";
import { EvmNft } from "moralis/common-evm-utils";

type Props = {
  rentalPack: RentalPackMetadata;
};

export default function NFTComponent({ rentalPack }: Props) {
  const { data: rentalNfts } = useEvmWalletNFTs({
    address: rentalPack.token_bound_account,
    chain: MUMBAI_CHAIN_ID,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ImageRender rentalNfts={rentalNfts} />
      <div>
        {rentalNfts && (
          <p className={styles.nftTokenId}>
            Asset Count：<b>{rentalNfts.length}</b>
          </p>
        )}
        <p className={styles.nftName}>{rentalPack.name}</p>

        <div className={styles.priceContainer}>
          {rentalPack.rental_info.status == 0 &&
            rentalPack.rental_info.fee_per_hour == 0 && (
              <div className={styles.nftPriceContainer}>
                <div>
                  <p className={styles.nftPriceLabel}>Fee (h)</p>
                  <div className={styles.nftPriceValue}>Not set yet</div>
                </div>
              </div>
            )}
          {rentalPack.rental_info.status == 0 &&
            rentalPack.rental_info.fee_per_hour != 0 && (
              <div className={styles.nftPriceContainer}>
                <div>
                  <p className={styles.nftPriceLabel}>Fee (h)</p>
                  <div className={styles.nftPriceValue}>
                    <big style={{ marginRight: "10px" }}>
                      {rentalPack.rental_info.fee_per_hour / 10 ** 18}
                    </big>
                    <span>$MATIC</span>
                  </div>
                </div>
              </div>
            )}
          {rentalPack.rental_info.status == 1 && (
            <div className={styles.nftPriceContainer}>
              <div>
                <p className={styles.nftPriceLabel}>Fee (h)</p>
                <div className={styles.nftPriceValue}>
                  <big style={{ marginRight: "10px" }}>
                    {rentalPack.rental_info.fee_per_hour / 10 ** 18}
                  </big>
                  <span>$MATIC</span>
                </div>
              </div>
            </div>
          )}
          {rentalPack.rental_info.status == 2 && (
            <div className={styles.nftPriceContainer}>
              <div>
                <p className={styles.nftPriceLabel}>Fee (h)</p>
                <div className={styles.nftPriceValue}>
                  <big style={{ marginRight: "10px" }}>
                    {rentalPack.rental_info.fee_per_hour / 10 ** 18}
                  </big>
                  <span>$MATIC</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

type Prop = {
  rentalNfts: EvmNft[] | undefined;
};

const ImageRender = ({ rentalNfts }: Prop) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!rentalNfts?.length) return;
    const interval = setInterval(() => {
      setIndex((prevIndex) => {
        if (prevIndex === rentalNfts.length - 1) {
          return 0;
        } else {
          return prevIndex + 1;
        }
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [rentalNfts]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
      }}
    >
      {!rentalNfts || !rentalNfts.length ? (
        <div
          style={{
            height: "200px",
            width: "200px",
            border: "1px solid white",
            borderRadius: "6px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          No NFTs
        </div>
      ) : (
        rentalNfts.map((nft: any, i) => (
          <div key={i}>
            {index == i && (
              <img
                height={200}
                width={200}
                style={{ borderRadius: "6px" }}
                key={i}
                src={
                  !nft.metadata
                    ? "https://bafkreidj7ooaanx4arm232eoia3c5xnptrpnkgxhjefxtliyyx7wxdxsfa.ipfs.nftstorage.link/"
                    : nft.metadata?.image
                }
              />
            )}
          </div>
        ))
      )}
    </div>
  );
};
