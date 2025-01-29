export type ListingRecord = {
  id: string;
  city: string;
  address: string;
  rent: number;
  washer_dryer: boolean;
  pet_friendly: boolean;
  url: string;
  image: string;
};

export type Listing = {
  title: string;
  price: string;
  address: string;
  mainImg: string;
  subImgs: string[];
  pros: string[];
  link: string;
};

export function mapListings(records: ListingRecord[]): Listing[] {
  return records.map(record => {
      const pros: string[] = [];
      if (record.washer_dryer) pros.push("Washer/Dryer included");
      if (record.pet_friendly) pros.push("Pet-friendly");

      return {
          title: `Listing in ${record.city}`,
          price: `$${record.rent.toFixed(2)}/month`,
          address: record.address,
          mainImg: record.image,
          subImgs: [], // Assuming no sub-images are provided in the original record
          pros: pros,
          link: record.url
      };
  });
};