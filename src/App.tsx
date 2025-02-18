import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState } from 'react';
import { CiPaperplane } from 'react-icons/ci';
import { FaRegMap } from "react-icons/fa";
import { FaArrowLeftLong, FaArrowRightLong, FaLocationPin } from "react-icons/fa6";
import { Map, Marker, NavigationControl } from 'react-map-gl/mapbox';
import { toast, ToastContainer } from 'react-toastify';
import './App.css';
import { FilterOption } from './components/filterOption/FilterOption';
import { ListingCard } from './components/ListingCard/ListingCard';
import RequestModal from './components/RequestModal/RequestModal';
import ThemeToggle from './components/ThemeToggle';
import { Listing, ListingRecord, mapListings } from './utils';


const filterOptions = [
  {
    label: "Beds & Baths",
    options: ["testing", "testing2", "testing3"],
  },
  {
    label: "Home Type",
    options: ["Houses", "Apartments/Condos", "Townhomes", "Room"],
  },
  {
    label: "Lease",
    options: ["Short Term", "Long Term"],
  },
  {
    label: "Amenities",
    options: ["Pet Friendly", "Washer and Dryer", "One Site Parking", "Furnished"]
  },
  {
    label: "Style",
    options: ["Traditional", "Modern", "Spanish/Mediterranean", "Luxury"]
  }
]

const defaultListings = [
  {
    address: "627 Belmont Ave #6, Los Angeles, CA 90026",
    title: "Belmont Apartments",
    link: "https://www.zillow.com/b/belmont-apartments-los-angeles-ca-9MLcY6/",
    mainImg: "https://photos.zillowstatic.com/fp/c078b065e5795fe5558af6dd9504402c-p_e.jpg",
    price: "$2967",
    beds: 2,
    baths: 1,
    size: "875 sqft",
    coordinates: [-118.26234, 34.071907],
    pros: ["Air conditioning", "Pet-friendly"],
  },
  {
    address: "1232 S La Jolla Ave #1236, Los Angeles, CA 90035",
    title: "1232 S. La Jolla",
    link: "https://www.zillow.com/b/1232-s.-la-jolla-los-angeles-ca-5Xn9Yd/",
    mainImg: "https://photos.zillowstatic.com/fp/2d06c9b8ada52c277ca3832e0248a2d5-p_e.jpg",
    price: "$2450",
    beds: 1,
    baths: 1,
    size: "950 sqft",
    coordinates: [-118.37344, 34.053967],
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
  {
    address: "3432 Mentone Ave #5, Los Angeles, CA 90034",
    title: "3432 Mentone Ave #5",
    link: "https://www.zillow.com/homedetails/3432-Mentone-Ave-5-Los-Angeles-CA-90034/2069596364_zpid/",
    mainImg: "https://photos.zillowstatic.com/fp/e19fc9be2dd6fd26a56115c55e75d6fe-p_e.jpg",
    price: "$2795",
    beds: 2,
    baths: 1,
    size: "850 sqft",
    coordinates: [-118.40978, 34.026585],
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
  {
    address: "5731 1/2 Klump Ave, North Hollywood, CA 91601",
    title: "5731 1/2 Klump Ave",
    link: "https://www.zillow.com/homedetails/5731-1-2-Klump-Ave-North-Hollywood-CA-91601/447309322_zpid/",
    mainImg: "https://photos.zillowstatic.com/fp/32ab0a675b4a807916e31235dbb98d8d-p_e.jpg",
    price: "$3700",
    beds: 3,
    baths: 3,
    size: "1,300 sqft",
    coordinates: [-118.37574, 34.161892],
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
  {
    address: "11938 Goshen Ave APT 6, Los Angeles, CA 90049",
    title: "Primetime Brentwood",
    link: "https://www.zillow.com/b/primetime-brentwood-los-angeles-ca-5XmYhz/",
    mainImg: "https://photos.zillowstatic.com/fp/fa1d2462434ffbf8d2e9d64c7c3c2c10-p_e.jpg",
    price: "$3295",
    beds: 2,
    baths: 2,
    size: "950 sqft",
    coordinates: [-118.46554, 34.04678],
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
  {
    address: "2901 S Sepulveda Blvd APT 261, Los Angeles, CA 90064",
    title: "Westwood Villa",
    link: "https://www.zillow.com/apartments/los-angeles-ca/westwood-villa/5XjPxS/",
    mainImg: "https://photos.zillowstatic.com/fp/3b328c704243e2b68eec269dfc1da161-p_e.jpg",
    price: "$2450",
    beds: 1,
    baths: 1,
    size: "550-700 sqft",
    coordinates: [-118.42976, 34.028744],
    pros: ["Washer/Dryer included", "Pet-friendly"],
  }
];

const mapBoxAccessToken = "pk.eyJ1IjoiZzRiZTM0IiwiYSI6ImNtNzJqMDU1YzBheXoyam9qMDQ3Nms2Z2wifQ.DqP8i3w9oQJ75-P4UIuyDg";

function App() {
  const [listings, setListings] = useState<Listing[]>(defaultListings);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [longitude, setLongitude] = useState(-118.26234);
  const [latitude, setLatitude] = useState(34.071907);
  const [pagingData, setPagingData] = useState({
    page: 0,
    count: 0,
    totalPages: 1,
    searchText: ''
  });
  const [viewport, setViewport] = useState({
    latitude: 34.071907,
    longitude: -118.26234,
    zoom: 9
  });

  const showToast = (toastType: 'success' | 'error') => {
    if (toastType === 'success') {
      toast.success('Success! Someone will contact you shortly.', {
        position: "top-center",
      });
    } else {
      toast.error('Something went wrong. Please try again later.', {
        position: "top-center",
      });
    }
  };

  const search = async (searchText:string, page=0, pageSize=6) =>{
    try {
      setIsLoading(true);
      // todo: integrate the backend directly into this project so the temporary vercel endpoint isn't needed
      const res = await axios.post('https://vite-react-theta-two-40.vercel.app/search', { text: searchText, page, pageSize });
      const listingRecords = res.data.matches as ListingRecord[];
      const found = mapListings(listingRecords);

      if(page===0) setListings(found)
      else setListings([...listings, ...found])
      setPagingData({
        page: res.data.page,
        totalPages: res.data.totalPages,
        count: res.data.count,
        searchText: searchText
      });

      setLongitude(found[0].coordinates[0]);
      setLatitude(found[0].coordinates[1]);
      setViewport({
        latitude: found[0].coordinates[1],
        longitude: found[0].coordinates[0],
        zoom: 9
      });

    } catch (error) {
      console.log("Error submitting preferences:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const submitPreference = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const preferences = formData.get('preferences') as string;

    await search(preferences, 0)
  };

  const backPage = async () => {
    await search(pagingData.searchText, pagingData.page - 1);
  };

  const nextPage = async () => {
    await search(pagingData.searchText, pagingData.page + 1);
  };

  const filterListings = async () => {
    await search(`${pagingData.searchText}, Filters: ${selectedFilters.join(', ')}`);
  };


  return (
    <>
      {isLoading && <div className='large-loader'></div>}
      {showModal && <RequestModal setShowModal={setShowModal} showToast={showToast} />}
      <header className='header'>
        <h1 className='header-title' onClick={() => window.location.reload()}>Finding Places</h1>
        <ThemeToggle />
      </header>
      <div>
        <div className='main-body-container'>
          <div className='filters-container'>
            <form onSubmit={submitPreference} className='preferences-form'>
              <input className='preferences-input' type="text" name="preferences" placeholder='Search' />
              <button type='submit' className='submit-button' disabled={isLoading}>
                {isLoading ? <div className='loader'></div> : <CiPaperplane size={25} style={{ strokeWidth: 0.5}} />}
              </button>
            </form>
            <div className='filter-options-container'>
              {filterOptions.map((option, index) => (
                <FilterOption
                  key={index}
                  label={option.label}
                  options={option.options}
                  selectedFilters={selectedFilters}
                  setSelectedFilters={setSelectedFilters}
                  />
              ))}
            </div>
            <div className='filter-button-container'>
              <button
                className='filter-btn'
                onClick={filterListings}
                disabled={isLoading || selectedFilters.length === 0}
                >
                  Filter
                </button>
              <button
                className='filter-btn'
                onClick={() => setSelectedFilters([])}
                >
                  Clear Filters
                </button>
            </div>
          </div>
          <div className='map-and-listings-container'>
            <Map
              mapboxAccessToken={mapBoxAccessToken}
              mapStyle={"mapbox://styles/mapbox/streets-v12"}
              initialViewState={{
                latitude: viewport.latitude,
                longitude: viewport.longitude,
                zoom: viewport.zoom
              }}
              id='map'
              style={{ width: "100%", height: "auto" }}
            >
              {listings.map((listing, index) => (
                <Marker
                  key={index}
                  latitude={listing.coordinates[1]}
                  longitude={listing.coordinates[0]}
                >
                  <div style={{ position: "relative" }}>
                    <div
                      style={{
                        position: "absolute",
                        top: "-30%",
                        left: "-50%",
                        color: "black",
                        background: "white",
                        borderRadius: "50%",
                        padding: "5px 10px",
                        fontWeight: "bold",
                        cursor: "pointer",
                        backgroundColor: "#1BFFFF"
                      }}
                      onClick={() => window.open(listing.link, "_blank")}
                    >{listing.price}</div>
                    <FaLocationPin size={30} color='#1BFFFF' />
                  </div>
                </Marker>
              ))}
              <NavigationControl position="top-right" />
            </Map>
            <div className='listings-and-button-container'>
              <div className='listing-grid-container'>
                {listings.map((listing, index) => (
                  <ListingCard key={index} listing={listing} setShowModal={setShowModal} />
                ))}
                <div className='map-hover-button'>
                  Map <FaRegMap size={20} />
                </div>
              </div>
              {pagingData.totalPages > 1
                ? <div
                    style={{
                      display: 'flex',
                      marginBottom: '1rem',
                      marginTop: '1rem',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '90%',
                      alignSelf: 'center',
                    }}
                  >
                    <FaArrowLeftLong size={20} cursor={"pointer"} onClick={backPage} />
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '1.5rem'
                    }}>
                      {[...Array(pagingData.totalPages)].map((_, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '20px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                            position: 'relative',
                            padding: '0.5rem 0.75rem',
                          }}
                          onClick={() => {
                            if (pagingData.page !== index) {
                              search(pagingData.searchText, index);
                            }
                          }}
                        >
                          {`${index + 1}`}
                          {pagingData.page === index && (
                              <div style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                border: '2px solid white'
                              }}></div>
                            )
                          }
                        </div>
                      ))}
                    </div>
                    <FaArrowRightLong size={20} cursor={"pointer"} onClick={nextPage} />
                  </div>
                : null}
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  )
}

export default App
