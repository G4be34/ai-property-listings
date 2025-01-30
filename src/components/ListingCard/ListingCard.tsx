import { motion } from "framer-motion";
import { RiPokerDiamondsLine } from "react-icons/ri";
import { Listing } from "../../utils";
import "./ListingCard.css";

export function ListingCard({ listing, setShowModal }: { listing: Listing, setShowModal: React.Dispatch<React.SetStateAction<boolean>> }) {
  const openListing = () => {
    window.open(listing.link, "_blank");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, delay: 0.5 }} className="listing-card">
      <h2 className="listing-card-title">{listing.title}</h2>
      <p className="listing-card-price">{listing.price}</p>
      <small className="listing-card-address">{listing.address}</small>
      <div className="listing-card-main-img-container"  onClick={openListing}>
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
        <button className="listing-card-button" type="button" onClick={() => setShowModal(true)}>I want this checked out</button>
      </div>
    </motion.div>
  )
};
