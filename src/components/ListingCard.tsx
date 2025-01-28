import { RiPokerDiamondsLine } from "react-icons/ri";
import "./ListingCard.css";

function ListingCard({ listing }) {

  const openListing = () => {
    console.log("Opening listing");
    console.log("This is the link: ", listing.link);
  };

  return (
    <div className="listing-card">
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

export default ListingCard;