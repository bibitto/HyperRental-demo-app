type RentalInfo = {
  fee_per_hour: number;
  min_hour: number;
  max_hour: number;
  status: number;
};

export type RentalPackMetadata = {
  id: string;
  name: string;
  description: string;
  image: string;
  token_bound_account: string;
  rental_pack_owner: string;
  rental_info: RentalInfo;
};
