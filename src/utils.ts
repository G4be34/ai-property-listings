export type ListingRecord = {
  id: string;
  city: string;
  address: string;
  rent: number;
  url: string;
  image: string;
  beds: number;
  baths: number;
  size: string;
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
          price: `$${record.rent.toFixed(2)}/month`,
          address: record.address,
          mainImg: record.image,
          link: record.url,
          beds: record.beds,
          baths: record.baths,
          size: record.size,
          coordinates: []
      };
  });
};