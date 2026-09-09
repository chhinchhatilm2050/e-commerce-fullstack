export interface IAddressResponse {
  success: boolean;
  data: {
    address: IAddress
  };
  message: string;
};

export interface IAddress {
  userId: string;
  _id: string;
  streetAddress: string;
  phoneNumber: string;
  province: string;
  district: string;
  commune: string;
  firstName: string,
  lastName: string,
  provinceId: string,
  districtId: string,
  communeId: string,
};

export interface IAddressPayload {
  firstName: string,
  lastName: string,
  phoneNumber: string,
  province: string,
  district: string,
  commune: string,
  streetAddress: string,
};
