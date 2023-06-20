/* eslint-disable react/display-name */
import {
  Web3Button,
  useAddress,
  useContract,
  useContractRead,
} from "@thirdweb-dev/react";
import { useRouter } from "next/router";
import React, { memo, useCallback, useMemo, useState } from "react";
import Container from "../../components/Container/Container";
import NFTGrid from "../../components/NFT/NFTGrid";
import Skeleton from "../../components/Skeleton/Skeleton";
import styles from "../../styles/Profile.module.css";
import randomColor from "../../util/randomColor";
import {
  HYPER_RENTAL_ADDRESS,
  MUMBAI_CHAIN_ID,
  RENTAL_PACK_ADDRESS,
} from "../../util/const";
import { decodeMetadatas } from "../../util/decodeMetadatas";
import { RentalPackMetadata } from "../../util/type";
import {
  useEvmNFTOwners,
  useEvmNativeBalance,
  useEvmWalletNFTs,
} from "@moralisweb3/next";
import { ethers } from "ethers";
import Link from "next/link";
import { BsBoxArrowUpRight } from "react-icons/bs";
import style from "../../styles/Buy.module.css";

const [randomColor1, randomColor2, randomColor3, randomColor4] = [
  randomColor(),
  randomColor(),
  randomColor(),
  randomColor(),
];

export default function ProfilePage() {
  const [tab, setTab] = useState<"owned" | "listed" | "rented">("owned");
  const address = useAddress();

  const { data: rentalPackContract } = useContract(RENTAL_PACK_ADDRESS);
  const { data: base64Metadatas } = useContractRead(
    rentalPackContract,
    "getAllTokenUris",
    []
  );
  const rentalPacks = useMemo(
    () => decodeMetadatas(base64Metadatas),
    [base64Metadatas]
  );

  const [rentalPack, setRentalPack] = useState<RentalPackMetadata>();
  const handleSelect = useCallback((r: RentalPackMetadata | undefined) => {
    setRentalPack(r);
  }, []);

  return (
    <Container maxWidth="lg">
      <div className={styles.profileHeader}>
        <div
          className={styles.coverImage}
          style={{
            background: `linear-gradient(90deg, ${randomColor1}, ${randomColor2})`,
          }}
        />
        <div
          className={styles.profilePicture}
          style={{
            background: `linear-gradient(90deg, ${randomColor3}, ${randomColor4})`,
          }}
        />
        <WalletAddressDisplay />
      </div>

      <div className={styles.tabs}>
        <h3
          className={`${styles.tab}
        ${tab === "owned" ? styles.activeTab : ""}`}
          onClick={() => setTab("owned")}
        >
          Owned
        </h3>
        <h3
          className={`${styles.tab}
        ${tab === "listed" ? styles.activeTab : ""}`}
          onClick={() => setTab("listed")}
        >
          Listing
        </h3>
        <h3
          className={`${styles.tab}
        ${tab === "rented" ? styles.activeTab : ""}`}
          onClick={() => setTab("rented")}
        >
          Renting
        </h3>
      </div>

      <div
        className={`${
          tab === "owned" ? styles.activeTabContent : styles.tabContent
        }`}
      >
        <OwnedNFTs
          address={address}
          rentalPacks={rentalPacks}
          handleSelect={handleSelect}
        />
      </div>

      <div
        className={`${
          tab === "listed" ? styles.activeTabContent : styles.tabContent
        }`}
      >
        <ListingNFTs
          address={address}
          rentalPacks={rentalPacks}
          handleSelect={handleSelect}
        />
      </div>

      <div
        className={`${
          tab === "rented" ? styles.activeTabContent : styles.tabContent
        }`}
      >
        <RentingNFTs
          address={address}
          rentalPacks={rentalPacks}
          handleSelect={handleSelect}
        />
      </div>
      {rentalPack && (
        <div
          style={{
            position: "fixed",
            top: "0px",
            left: "0px",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              zIndex: 2,
              width: "500px",
              height: "350px",
              padding: "1em",
              background: "#191c1f",
              color: "white",
              border: "2px solid white",
            }}
          >
            {rentalPack.rental_info.status == 0 && (
              <OwnedModal rentalPack={rentalPack} handleSelect={handleSelect} />
            )}
            {rentalPack.rental_info.status == 1 && (
              <ListingModal
                rentalPack={rentalPack}
                handleSelect={handleSelect}
              />
            )}
            {rentalPack.rental_info.status == 2 && (
              <RentingModal
                rentalPack={rentalPack}
                handleSelect={handleSelect}
              />
            )}
          </div>
        </div>
      )}
    </Container>
  );
}

type NftGrideProps = {
  address: string | undefined;
  rentalPacks: RentalPackMetadata[] | undefined;
  handleSelect: (r: RentalPackMetadata | undefined) => void;
};

const OwnedNFTs = memo(
  ({ address, rentalPacks, handleSelect }: NftGrideProps) => {
    const ownedRentalPacks = rentalPacks?.filter(
      (r) =>
        r.rental_info.status == 0 &&
        r.rental_pack_owner == address?.toLocaleLowerCase()
    );
    return (
      <NFTGrid
        data={ownedRentalPacks}
        isLoading={false}
        emptyText="There is no stored rental packs. You can mint rental pack in Lend page"
        handleSelect={handleSelect}
      />
    );
  }
);

const ListingNFTs = memo(
  ({ address, rentalPacks, handleSelect }: NftGrideProps) => {
    const listedRentalPacks = rentalPacks?.filter(
      (r) =>
        r.rental_info.status == 1 &&
        r.rental_pack_owner == address?.toLocaleLowerCase()
    );
    return (
      <NFTGrid
        data={listedRentalPacks}
        isLoading={false}
        emptyText="There is no listing rental packs. You can list your owned rental packs in Lend page"
        handleSelect={handleSelect}
      />
    );
  }
);

const RentingNFTs = memo(
  ({ address, rentalPacks, handleSelect }: NftGrideProps) => {
    const { data } = useEvmNFTOwners({
      address: RENTAL_PACK_ADDRESS,
      chain: MUMBAI_CHAIN_ID,
    });

    const rentingTokenIds = data
      ?.filter((r: any) => r.ownerOf?._value == address)
      .map((r) => Number(r.tokenId));

    const listedRentalPacks = rentalPacks?.filter(
      (r) =>
        r.rental_info.status == 2 && rentingTokenIds?.includes(Number(r.id))
    );

    return (
      <NFTGrid
        data={listedRentalPacks}
        isLoading={false}
        emptyText="There is no renting assets. You can rent any assets from others in Rent page"
        handleSelect={handleSelect}
      />
    );
  }
);

type ModalProps = {
  rentalPack: RentalPackMetadata;
  handleSelect: (r: RentalPackMetadata | undefined) => void;
};

const OwnedModal = memo(({ rentalPack, handleSelect }: ModalProps) => {
  const [withdrawAssetType, setWithdrawAssetType] = useState<
    "RentalAssets" | "NativeToken"
  >();
  const handleAssetType = (e: any) => {
    setWithdrawAssetType(e.target.value);
  };

  const { data: rentalAssets } = useEvmWalletNFTs({
    address:
      rentalPack && rentalPack.rental_info.status == 0
        ? rentalPack.token_bound_account
        : "",
    chain: MUMBAI_CHAIN_ID,
  });
  const { data: nativeTokenAmount } = useEvmNativeBalance({
    address:
      rentalPack && rentalPack.rental_info.status == 0
        ? rentalPack.token_bound_account
        : "",
    chain: MUMBAI_CHAIN_ID,
  });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-evenly",
        height: "100%",
      }}
    >
      <div style={{ fontSize: 18, textAlign: "center", fontWeight: "bold" }}>
        Would you like to withdraw assets?
      </div>
      <div>Name： {rentalPack.name}</div>
      <div style={{ display: "flex" }}>
        TBA：
        <Link
          href={
            "https://mumbai.polygonscan.com/address/" +
            rentalPack.token_bound_account
          }
          target="_blank"
          style={{
            display: "flex",
            alignItems: "center",
            width: "400px",
            marginLeft: 6,
          }}
          className={style.linkContainer}
        >
          <div>{rentalPack.token_bound_account}</div>
          <BsBoxArrowUpRight fontSize={16} style={{ marginLeft: "4px" }} />
        </Link>
      </div>
      <div>
        Rental Token Counts： {rentalAssets ? rentalAssets.length : 0}{" "}
        <small>NFTs</small>
      </div>
      <div>
        Native Token Amount：{" "}
        {nativeTokenAmount ? nativeTokenAmount.balance.ether : 0.0}{" "}
        <small>$MATIC</small>
      </div>
      <form style={{ display: "flex", gap: 5 }}>
        <label>Withdraw Assets Type：</label>
        <div style={{ display: "flex", gap: 20, marginTop: 2 }}>
          <div>
            <input
              type="checkbox"
              value={"RentalAssets"}
              onChange={handleAssetType}
              checked={withdrawAssetType == "RentalAssets"}
              disabled={!rentalAssets || rentalAssets.length == 0}
            />
            <span
              style={{
                color:
                  !rentalAssets || rentalAssets.length == 0 ? "gray" : "white",
              }}
            >
              Rental Tokens
            </span>
          </div>
          <div>
            <input
              type="checkbox"
              value={"NativeToken"}
              onChange={handleAssetType}
              checked={withdrawAssetType == "NativeToken"}
              disabled={
                !nativeTokenAmount || nativeTokenAmount.balance.ether == "0.0"
              }
            />
            <span
              style={{
                color:
                  !nativeTokenAmount || nativeTokenAmount.balance.ether == "0.0"
                    ? "gray"
                    : "white",
              }}
            >
              Native Token
            </span>
          </div>
        </div>
      </form>
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          marginTop: 4,
        }}
      >
        <button
          onClick={() => {
            handleSelect(undefined);
            setWithdrawAssetType(undefined);
          }}
          style={{
            backgroundColor: "white",
            color: "black",
            border: "none",
            borderRadius: "10px",
            padding: "12px",
            fontSize: "16px",
            width: "200px",
            cursor: "pointer",
          }}
        >
          Close
        </button>

        <Web3Button
          contractAddress={HYPER_RENTAL_ADDRESS}
          action={(contract) => {
            const rentalPackTokenId = rentalPack.id;
            if (withdrawAssetType == "RentalAssets" && rentalAssets) {
              const assetDatas = [];
              for (let i = 0; i < rentalAssets.length; i++) {
                const asset = rentalAssets[i];
                const dataType = asset.contractType;
                if (dataType != "ERC721" && dataType != "ERC1155") continue;
                assetDatas.push(
                  ethers.utils.defaultAbiCoder.encode(
                    ["address", "uint256", "uint256", "bytes32"],
                    [
                      asset.tokenAddress.checksum,
                      asset.tokenId,
                      1,
                      ethers.utils.keccak256(
                        ethers.utils.toUtf8Bytes(dataType)
                      ),
                    ]
                  )
                );
              }
              contract.call("withdrawAssets", [rentalPackTokenId, assetDatas]);
            } else if (
              withdrawAssetType == "NativeToken" &&
              nativeTokenAmount
            ) {
              contract.call("withdrawNativeToken", [
                rentalPackTokenId,
                nativeTokenAmount.balance.wei,
              ]);
            }
          }}
          style={{ width: "200px", backgroundColor: "white" }}
          isDisabled={!withdrawAssetType}
        >
          Withdraw
        </Web3Button>
      </div>
    </div>
  );
});

const ListingModal = memo(({ rentalPack, handleSelect }: ModalProps) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-evenly",
        height: "100%",
      }}
    >
      <div style={{ fontSize: 18, textAlign: "center", fontWeight: "bold" }}>
        Would you like to cancel listing?
      </div>
      <div>Name： {rentalPack.name}</div>
      <div style={{ display: "flex" }}>
        TBA：
        <Link
          href={
            "https://mumbai.polygonscan.com/address/" +
            rentalPack.token_bound_account
          }
          target="_blank"
          style={{
            display: "flex",
            alignItems: "center",
            width: "400px",
            marginLeft: 6,
          }}
          className={style.linkContainer}
        >
          <div>{rentalPack.token_bound_account}</div>
          <BsBoxArrowUpRight fontSize={16} style={{ marginLeft: "4px" }} />
        </Link>
      </div>
      <div>
        Fee： {rentalPack.rental_info.fee_per_hour * 10 ** -18}{" "}
        <span
          style={{
            fontSize: "14px",
            marginLeft: "4px",
          }}
        >
          {"$MATIC / h"}
        </span>
      </div>
      <div>
        Duration：{" "}
        {rentalPack.rental_info.min_hour +
          "h ~ " +
          rentalPack.rental_info.max_hour +
          "h"}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          marginTop: 4,
        }}
      >
        <button
          onClick={() => {
            handleSelect(undefined);
          }}
          style={{
            backgroundColor: "white",
            color: "black",
            border: "none",
            borderRadius: "10px",
            padding: "12px",
            fontSize: "16px",
            width: "200px",
            cursor: "pointer",
          }}
        >
          Close
        </button>

        <Web3Button
          contractAddress={HYPER_RENTAL_ADDRESS}
          action={(contract) => {
            contract.call("cancelLending", [rentalPack.id]);
          }}
          style={{ width: "200px", backgroundColor: "white" }}
        >
          Delist
        </Web3Button>
      </div>
    </div>
  );
});

const RentingModal = memo(({ rentalPack, handleSelect }: ModalProps) => {
  const [receiver, setReceiver] = useState();
  const handleReceiver = (e: any) => {
    setReceiver(e.target.value);
  };
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-evenly",
        height: "100%",
      }}
    >
      <div style={{ fontSize: 18, textAlign: "center", fontWeight: "bold" }}>
        Would you like to transfer this pack?
      </div>
      <div>Name： {rentalPack.name}</div>
      <div style={{ display: "flex" }}>
        TBA：
        <Link
          href={
            "https://mumbai.polygonscan.com/address/" +
            rentalPack.token_bound_account
          }
          target="_blank"
          style={{
            display: "flex",
            alignItems: "center",
            width: "400px",
            marginLeft: 6,
          }}
          className={style.linkContainer}
        >
          <div>{rentalPack.token_bound_account}</div>
          <BsBoxArrowUpRight fontSize={16} style={{ marginLeft: "4px" }} />
        </Link>
      </div>
      <div>
        Fee： {rentalPack.rental_info.fee_per_hour * 10 ** -18}{" "}
        <span
          style={{
            fontSize: "14px",
            marginLeft: "4px",
          }}
        >
          {"$MATIC / h"}
        </span>
      </div>
      <div>
        Duration：{" "}
        {rentalPack.rental_info.min_hour +
          "h ~ " +
          rentalPack.rental_info.max_hour +
          "h"}
      </div>
      <div style={{ display: "flex" }}>
        Receiver：
        <input
          type="text"
          onChange={handleReceiver}
          style={{
            backgroundColor: "white",
            border: "none",
            padding: "4px",
            color: "black",
            opacity: "0.95",
            width: "85%",
            fontSize: "16px",
          }}
          required
        />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-evenly",
          marginTop: 4,
        }}
      >
        <button
          onClick={() => {
            handleSelect(undefined);
          }}
          style={{
            backgroundColor: "white",
            color: "black",
            border: "none",
            borderRadius: "10px",
            padding: "12px",
            fontSize: "16px",
            width: "200px",
            cursor: "pointer",
          }}
        >
          Close
        </button>

        <Web3Button
          contractAddress={HYPER_RENTAL_ADDRESS}
          action={(contract) => {
            contract.call("transferRentalPack", [rentalPack.id, receiver]);
          }}
          style={{ width: "200px", backgroundColor: "white" }}
        >
          Transfer
        </Web3Button>
      </div>
    </div>
  );
});

const WalletAddressDisplay = () => {
  const router = useRouter();
  return (
    <h1 className={styles.profileName}>
      {router.query.address ? (
        router.query.address.toString().substring(0, 5) +
        "..." +
        router.query.address.toString().substring(38, 42)
      ) : (
        <Skeleton width="320" />
      )}
    </h1>
  );
};
