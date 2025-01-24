import { FaRegTrashAlt } from "react-icons/fa";
import { IoIosCheckmarkCircleOutline, IoMdHeartEmpty } from "react-icons/io";
import { RiPokerDiamondsLine } from "react-icons/ri";

function ListingCard({ listing }) {

  return (
    <div>
      <h2>{listing.title}</h2>
      <p>{listing.price}</p>
      <p>{listing.address}</p>
      <div>
        <img src={listing.image} alt={listing.title} />
        <div>
          <button>
            <FaRegTrashAlt />
          </button>
          <button>
            <IoMdHeartEmpty />
          </button>
        </div>
        <button>
          {listing.characteristic}
        </button>
      </div>
      <div>
        <img src="" alt="" />
        <img src="" alt="" />
        <div>
          <img src="" alt="" />
          <span>See photos</span>
        </div>
      </div>
      <div>
        <div>
          <RiPokerDiamondsLine />
          <span>Sunny thinks it's worth a shot</span>
        </div>
        <div>
          <IoIosCheckmarkCircleOutline />
          <span>Pros</span>
        </div>
        <ul>
          {listing.pros.map((pro, index) => (
            <li key={index}>{pro}</li>
          ))}
        </ul>
        <button>I want this checked out</button>
      </div>
    </div>
  )
}

export default ListingCard;