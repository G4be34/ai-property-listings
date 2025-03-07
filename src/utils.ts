export type ListingRecord = {
  id: string;
  city: string;
  address: string;
  rent: number;
  url: string;
  image: string;
  bedrooms: number;
  bathrooms: number;
  sqft: string;
  latitude: number;
  longitude: number;
};

export type Listing = {
  title: string;
  price: string;
  address: string;
  mainImg: string;
  link: string;
  beds: number;
  baths: number;
  size: string;
  coordinates: number[];
};

export function mapListings(records: ListingRecord[]): Listing[] {
  return records.map(record => {

      return {
          title: `Listing in ${record.city}`,
          price: `$${record.rent.toFixed(2)}`,
          address: record.address,
          mainImg: record.image,
          link: record.url,
          beds: record.bedrooms,
          baths: record.bathrooms,
          size: record.sqft,
          coordinates: [record.longitude, record.latitude]
      };
  });
};