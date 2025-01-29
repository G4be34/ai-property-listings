import { RiPokerDiamondsLine } from "react-icons/ri";
import { Listing } from "../../utils";
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
};
