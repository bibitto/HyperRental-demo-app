import {
  Web3Button,
  useAddress,
  useContract,
  useContractRead,
} from "@thirdweb-dev/react";
import React, { useMemo, useState } from "react";
import Container from "../components/Container/Container";
import { useEvmWalletNFTs } from "@moralisweb3/next";
import {
  HYPER_RENTAL_ADDRESS,
  MUMBAI_CHAIN_ID,
  RENTAL_PACK_ADDRESS,
} from "../util/const";
import { decodeMetadatas } from "../util/decodeMetadatas";
import { BsPatchCheckFill } from "react-icons/bs";
import { MdOutlineContentCopy } from "react-icons/md";
import Link from "next/link";
import { ethers } from "ethers";
import { RentalPackMetadata } from "../util/type";
import { EvmNft } from "moralis/common-evm-utils";

export default function Lend() {
  const address = useAddress();
  const { contract } = useContract(RENTAL_PACK_ADDRESS);
  const { data: base64Metadatas } = useContractRead(
    contract,
    "getAllTokenUris",
    []
  );
  const rentalPacks = decodeMetadatas(base64Metadatas);
  const ownedRentalPacks = useMemo(
    () =>
      rentalPacks.filter(
        (r) =>
          r.rental_pack_owner === address?.toLocaleLowerCase() &&
          r.rental_info.status === 0
      ),
    [rentalPacks, address]
  );

  const [rentalPackIndex, setRentalPackIndex] = useState(0);
  const handleChange = (e: any) => {
    setRentalPackIndex(e.target.value);
  };

  const { data: TBAOwnedNfts } = useEvmWalletNFTs({
    address:
      ownedRentalPacks.length == 0
        ? ""
        : ownedRentalPacks[rentalPackIndex]?.token_bound_account,
    chain: MUMBAI_CHAIN_ID,
  });

  const copyText = async (text: string) => {
    await global.navigator.clipboard.writeText(text);
  };

  return (
    <Container maxWidth="lg">
      <h1 style={{ marginBottom: "15px" }}>Lend your NFTs</h1>
      <div style={{ display: "flex" }}>
        <h2>1st Step：Create Rental Pack</h2>
        {ownedRentalPacks.length ? (
          <BsPatchCheckFill
            size={28}
            color="lightgreen"
            style={{ margin: "auto 10px" }}
          />
        ) : (
          <></>
        )}
      </div>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          fontSize: 18,
        }}
      >
        <div>You have to mint Rental Pack NFT in order to start lending.</div>
        <div>
          HyperRental enables trustless token rental via accounts bounded to
          rental packs.
        </div>
      </div>
      <Web3Button
        contractAddress={HYPER_RENTAL_ADDRESS}
        action={(contract) => {
          contract.call("createRentalPack", []);
        }}
      >
        <b>Create RentalPack</b>
      </Web3Button>
      <div style={{ display: "flex", marginTop: "20px" }}>
        <h2>2nd Step：Transfer your assets to TBA</h2>
        {TBAOwnedNfts?.length ? (
          <BsPatchCheckFill
            size={28}
            color="lightgreen"
            style={{ margin: "auto 10px" }}
          />
        ) : (
          <></>
        )}
      </div>

      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          fontSize: 18,
        }}
      >
        <div>
          After creating a rental pack, please transfer any assets to the Token
          Bound Account (TBA) address .
        </div>
        <div>
          It does not matter which tool you use for the transfer. In this app,
          we use OpenSea which is the most famous NFT marketplace.
        </div>
        <div>
          When you finish to transfer rental assets to TAB, please RELOAD this
          page to check whether TBA has any assets.
        </div>
      </div>
      <form
        style={{
          marginTop: "15px",
          marginBottom: "30px",
          display: "flex",
          gap: "40px",
          alignItems: "center",
        }}
      >
        <label>
          <b>Target：</b>

          <select
            value={rentalPackIndex}
            onChange={handleChange}
            style={{
              padding: "4px 8px",
              fontSize: "17px",
              background: "none",
              color: "white",
              width: "170px",
              border: "none",
              borderBottom: "2px solid white",
            }}
            placeholder="Which RentalPack"
            required
          >
            {ownedRentalPacks.map((data, index) => (
              <option key={index} value={index}>
                {data.name}
              </option>
            ))}
          </select>
        </label>
        {ownedRentalPacks[rentalPackIndex] && (
          <label style={{ fontSize: "16px" }}>
            <b>TBA：</b>
            <big>{ownedRentalPacks[rentalPackIndex]?.token_bound_account}</big>
            <MdOutlineContentCopy
              size={24}
              color="#00aaee"
              style={{ cursor: "pointer", marginLeft: "10px" }}
              onClick={async () => {
                await copyText(
                  ownedRentalPacks[rentalPackIndex]?.token_bound_account
                );
                alert(
                  `クリップボードに以下のアドレスをコピーしました！${ownedRentalPacks[rentalPackIndex]?.token_bound_account}`
                );
              }}
            />
          </label>
        )}
      </form>
      <Link
        href="https://testnets.opensea.io/account?search[chains][0]=MUMBAI"
        target="_blank"
      >
        <button
          style={{
            backgroundColor: "white",
            color: "black",
            border: "none",
            borderRadius: "10px",
            padding: "12px",
            fontSize: "16px",
            width: "165px",
            cursor: "pointer",
          }}
        >
          <b>Go to OpenSea</b>
        </button>
      </Link>
      <h2 style={{ marginTop: "40px" }}>
        {"3rd Step：Set Rental Condition and Start Lending"}
      </h2>
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          fontSize: 18,
        }}
      >
        <div>
          When Step2 has a check mark, it is a signal that the preparation is
          complete.
        </div>
        <div>
          Set the rental conditions correctly and then press the button below to
          list your rental pack on the market.
        </div>
      </div>
      <StepThird
        rentalPackIndex={rentalPackIndex}
        handleChange={handleChange}
        ownedRentalPacks={ownedRentalPacks}
        TBAOwnedNfts={TBAOwnedNfts}
      />
    </Container>
  );
}

type Props = {
  rentalPackIndex: number;
  handleChange: (e: any) => void;
  ownedRentalPacks: RentalPackMetadata[];
  TBAOwnedNfts: EvmNft[] | undefined;
};
const StepThird = ({
  rentalPackIndex,
  handleChange,
  ownedRentalPacks,
  TBAOwnedNfts,
}: Props) => {
  const [feePerHour, setFeePerHour] = useState<number>();
  const [minHour, setMinHour] = useState<number>();
  const [maxHour, setMaxHour] = useState<number>();
  const handleFeePerHour = (e: any) => {
    setFeePerHour(e.target.value);
  };
  const handleMinHour = (e: any) => {
    setMinHour(e.target.value);
  };
  const handleMaxHour = (e: any) => {
    setMaxHour(e.target.value);
  };
  return (
    <>
      <form
        style={{
          marginBottom: "30px",
          marginTop: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "30px",
        }}
      >
        <label>
          <b>Target：</b>
          <select
            value={rentalPackIndex}
            onChange={handleChange}
            style={{
              padding: "4px 8px",
              fontSize: "17px",
              background: "none",
              color: "white",
              width: "170px",
              border: "none",
              borderBottom: "2px solid white",
            }}
            placeholder="Which RentalPack"
            required
          >
            {ownedRentalPacks.map((data, index) => (
              <option key={index} value={index}>
                {data.name}
              </option>
            ))}
          </select>
        </label>
        <div
          style={{
            display: "flex",
            gap: "40px",
          }}
        >
          <label>
            <b>Fee：</b>
            <input
              type="number"
              step="0.0001"
              value={feePerHour}
              onChange={handleFeePerHour}
              style={{
                backgroundColor: "white",
                border: "none",
                padding: "4px",
                color: "black",
                opacity: "0.95",
                width: "100px",
                fontSize: "16px",
              }}
              required
            />
            <span
              style={{
                fontSize: "14px",
                marginLeft: "6px",
                color: "lightgray",
              }}
            >
              $MATIC / h
            </span>
          </label>
          <label>
            <b>Min Duration：</b>
            <input
              type="number"
              value={minHour}
              step={1}
              onChange={handleMinHour}
              style={{
                backgroundColor: "white",
                border: "none",
                padding: "4px",
                color: "black",
                opacity: "0.95",
                width: "60px",
                fontSize: "16px",
              }}
              required
            />
            <span
              style={{
                fontSize: "14px",
                marginLeft: "6px",
                color: "lightgray",
              }}
            >
              hour
            </span>
          </label>
          <label>
            <b>Max Duration：</b>
            <input
              type="number"
              onChange={handleMaxHour}
              value={maxHour}
              step={1}
              style={{
                backgroundColor: "white",
                border: "none",
                padding: "4px",
                color: "black",
                opacity: "0.95",
                width: "60px",
                fontSize: "16px",
              }}
              required
            />
            <span
              style={{
                fontSize: "14px",
                marginLeft: "6px",
                color: "lightgray",
              }}
            >
              hour
            </span>
          </label>
        </div>
      </form>
      <Web3Button
        style={{ marginBottom: "60px", width: 165 }}
        contractAddress={HYPER_RENTAL_ADDRESS}
        action={(contract) => {
          const rentalPackTokenId = ownedRentalPacks[rentalPackIndex].id;
          const rentalCondition = {
            feePerHour: ethers.utils.parseEther(String(feePerHour!)),
            minHour: ethers.BigNumber.from(minHour!),
            maxHour: ethers.BigNumber.from(maxHour!),
          };

          contract.call("lend", [rentalPackTokenId, rentalCondition]);
        }}
        isDisabled={
          !TBAOwnedNfts ||
          !TBAOwnedNfts.length ||
          !feePerHour ||
          !minHour ||
          !maxHour
        }
      >
        <b>Start Lending</b>
      </Web3Button>
    </>
  );
};
