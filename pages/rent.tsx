import {
  Web3Button,
  useAddress,
  useContract,
  useContractRead,
  useContractWrite,
  useNFTs,
} from "@thirdweb-dev/react";
import React, { useMemo, useState } from "react";
import Container from "../components/Container/Container";
import NFTGrid from "../components/NFT/NFTGrid";
import { HYPER_RENTAL_ADDRESS, RENTAL_PACK_ADDRESS } from "../util/const";
import { decodeMetadatas } from "../util/decodeMetadatas";
import { RentalPackMetadata } from "../util/type";
import Link from "next/link";
import style from "../styles/Buy.module.css";
import { BsBoxArrowUpRight } from "react-icons/bs";

export default function Rent() {
  const address = useAddress();
  const { data: rentalPackContract } = useContract(RENTAL_PACK_ADDRESS);
  const { data: base64Metadatas } = useContractRead(
    rentalPackContract,
    "getAllTokenUris",
    []
  );
  const listedRentalPacks = useMemo(() => {
    const decodedMetadatas = decodeMetadatas(base64Metadatas);
    return decodedMetadatas.filter((r) => r.rental_info.status == 1);
  }, [base64Metadatas]);

  const [rentalPack, setRentalPack] = useState<RentalPackMetadata>();
  const handleSelect = (r: RentalPackMetadata | undefined) => {
    setRentalPack(r);
  };

  const [rentalHour, setRentalHour] = useState<number>(1);
  const handleRentalHour = (e: any) => {
    setRentalHour(e.target.value);
  };

  const { contract } = useContract(HYPER_RENTAL_ADDRESS);
  const { mutateAsync } = useContractWrite(contract, "rent");

  return (
    <Container maxWidth="lg">
      <h1>{"Let's rent NFTs"}</h1>
      <NFTGrid
        data={listedRentalPacks}
        isLoading={false}
        emptyText={
          "There is no listed rental packs.  You can try lending any assets from lend page!"
        }
        handleSelect={handleSelect}
      />
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
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly",
            }}
          >
            <div
              style={{ fontSize: 18, textAlign: "center", fontWeight: "bold" }}
            >
              Would you like to rent this pack?
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
                <BsBoxArrowUpRight
                  fontSize={16}
                  style={{ marginLeft: "4px" }}
                />
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
            <form>
              <label>
                {"Rental Hour： "}
                <input
                  type="number"
                  onChange={handleRentalHour}
                  step={1}
                  min={`${rentalPack.rental_info.min_hour}`}
                  max={`${rentalPack.rental_info.max_hour}`}
                  value={rentalHour}
                  style={{
                    backgroundColor: "white",
                    border: "none",
                    padding: "4px",
                    color: "black",
                    opacity: "0.95",
                    width: "50px",
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
                  {"h   =   " +
                    rentalPack.rental_info.fee_per_hour *
                      10 ** -18 *
                      rentalHour +
                    " $MATIC"}
                </span>
              </label>
            </form>
            <div
              style={{
                display: "flex",
                justifyContent: "space-evenly",
                marginTop: "5px",
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
                style={{ width: "200px", backgroundColor: "white" }}
                contractAddress={HYPER_RENTAL_ADDRESS}
                action={() => {
                  const args = [rentalPack.id, rentalHour, address];
                  const overrides = {
                    gasLimit: 1000000,
                    value: String(
                      rentalHour * rentalPack.rental_info.fee_per_hour
                    ),
                  };
                  mutateAsync({ args, overrides });
                }}
              >
                Rent
              </Web3Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
