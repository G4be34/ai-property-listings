import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState } from 'react';
import { CiPaperplane } from 'react-icons/ci';
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

const testListings = [
  {
    address: "7010 Sepulveda Blvd, Van Nuys, CA",
    title: "Listing in Los Angeles",
    link: "https://www.zillow.com/apartments/van-nuys-ca/park-manor-apartments/5XjQsB/",
    mainImg: "https://photos.zillowstatic.com/fp/49e4629a03a96c97daa9d1846e86b27d-p_e.jpg",
    price: "$1875.00",
    beds: 2,
    baths: 2,
    size: "1,000 sqft",
    coordinates: [-74.5, 40],
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
  {
    address: "7010 Sepulveda Blvd, Van Nuys, CA",
    title: "Listing in Los Angeles",
    link: "https://www.zillow.com/apartments/van-nuys-ca/park-manor-apartments/5XjQsB/",
    mainImg: "https://photos.zillowstatic.com/fp/49e4629a03a96c97daa9d1846e86b27d-p_e.jpg",
    price: "$1875.00",
    beds: 2,
    baths: 2,
    size: "1,000 sqft",
    coordinates: [-75.5, 41],
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
  {
    address: "7010 Sepulveda Blvd, Van Nuys, CA",
    title: "Listing in Los Angeles",
    link: "https://www.zillow.com/apartments/van-nuys-ca/park-manor-apartments/5XjQsB/",
    mainImg: "https://photos.zillowstatic.com/fp/49e4629a03a96c97daa9d1846e86b27d-p_e.jpg",
    price: "$1875.00",
    beds: 2,
    baths: 2,
    size: "1,000 sqft",
    coordinates: [-76.5, 42],
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
  {
    address: "7010 Sepulveda Blvd, Van Nuys, CA",
    title: "Listing in Los Angeles",
    link: "https://www.zillow.com/apartments/van-nuys-ca/park-manor-apartments/5XjQsB/",
    mainImg: "https://photos.zillowstatic.com/fp/49e4629a03a96c97daa9d1846e86b27d-p_e.jpg",
    price: "$1875.00",
    beds: 2,
    baths: 2,
    size: "1,000 sqft",
    coordinates: [-77.5, 43],
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
  {
    address: "7010 Sepulveda Blvd, Van Nuys, CA",
    title: "Listing in Los Angeles",
    link: "https://www.zillow.com/apartments/van-nuys-ca/park-manor-apartments/5XjQsB/",
    mainImg: "https://photos.zillowstatic.com/fp/49e4629a03a96c97daa9d1846e86b27d-p_e.jpg",
    price: "$1875.00",
    beds: 2,
    baths: 2,
    size: "1,000 sqft",
    coordinates: [-78.5, 44],
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
  {
    address: "7010 Sepulveda Blvd, Van Nuys, CA",
    title: "Listing in Los Angeles",
    link: "https://www.zillow.com/apartments/van-nuys-ca/park-manor-apartments/5XjQsB/",
    mainImg: "https://photos.zillowstatic.com/fp/49e4629a03a96c97daa9d1846e86b27d-p_e.jpg",
    price: "$1875.00",
    beds: 2,
    baths: 2,
    size: "1,000 sqft",
    coordinates: [-79.5, 45],
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
];

const mapBoxAccessToken = "pk.eyJ1IjoiZzRiZTM0IiwiYSI6ImNtNzJqMDU1YzBheXoyam9qMDQ3Nms2Z2wifQ.DqP8i3w9oQJ75-P4UIuyDg";

function App() {
  const [listings, setListings] = useState<Listing[]>(testListings);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loadingMoreListings, setLoadingMoreListings] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [longitude, setLongitude] = useState(-74.5);
  const [latitude, setLatitude] = useState(40);
  const [pagingData, setPagingData] = useState({
    page: 0,
    count: 0,
    totalPages: 4,
    searchText: ''
  });
  const [viewport, setViewport] = useState({
    latitude: 40,
    longitude: -74.5,
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

  const loadMoreListings = async () => {
    try {
      setLoadingMoreListings(true);
      await search(pagingData.searchText, pagingData.page+1);
    } catch (error) {
      console.error("Error loading more listings:", error);
    } finally {
      setLoadingMoreListings(false);
    }
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
          <div className='map-and-listings-container'>
            <Map
              mapboxAccessToken={mapBoxAccessToken}
              mapStyle={"mapbox://styles/mapbox/streets-v12"}
              initialViewState={{
                latitude: viewport.latitude,
                longitude: viewport.longitude,
                zoom: viewport.zoom
              }}
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
                    <FaArrowLeftLong size={20} cursor={"pointer"} />
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
                    <FaArrowRightLong size={20} cursor={"pointer"} />
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
