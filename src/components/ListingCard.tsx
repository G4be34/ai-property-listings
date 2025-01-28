import { RiPokerDiamondsLine } from "react-icons/ri";
import "./ListingCard.css";

export function ListingCard({ listing }: { listing: Listing }) {
  const openListing = () => {
    window.open(listing.link, "_blank");
  };

  return (
    <div className="listing-card" onClick={openListing}>
      <h2 className="listing-card-title">{listing.title}</h2>
      <p className="listing-card-price">{listing.price}</p>
      <small className="listing-card-address">{listing.address}</small>
      <div className="listing-card-main-img-container">
        <img src={listing.mainImg} alt={listing.title} />
      </div>
      <div className="listing-card-pros-container">
        <div className="listing-card-title-container">
          <RiPokerDiamondsLine style={{ color: "white" }} />
          <span>Your requirements</span>
        </div>
        <ul className="listing-card-pros-list">
          {listing.pros.map((pro, index) => (
            <li key={index}><small>{pro}</small></li>
          ))}
        </ul>
        <button className="listing-card-button" type="button" onClick={openListing}>I want this checked out</button>
      </div>
    </div>
  )
}

// FE & BE have different types for the same data so we need to map them
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