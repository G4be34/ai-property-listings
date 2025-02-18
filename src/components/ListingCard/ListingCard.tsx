import { motion } from "framer-motion";
import { Listing } from "../../utils";
import "./ListingCard.css";

export function ListingCard({ listing, setShowModal }: { listing: Listing, setShowModal: React.Dispatch<React.SetStateAction<boolean>> }) {
  const openListing = () => {
    window.open(listing.link, "_blank");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, delay: 0.5 }} className="listing-card">
      <div className="listing-card-main-img-container"  onClick={openListing}>
        <img src={listing.mainImg} alt={listing.title} />
      </div>
      <div className="listing-card-pros-container">
        <h2 className="listing-card-price">{listing.price}/mo</h2>
        <small>Beds: {listing.beds} | Baths: {listing.baths} | {listing.size}</small>
        <small className="listing-card-address">{listing.title} | {listing.address}</small>
        <button className="listing-card-button" type="button" onClick={() => setShowModal(true)}>I want this checked out</button>
      </div>
    </motion.div>
  )
};
