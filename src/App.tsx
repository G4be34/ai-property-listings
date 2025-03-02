import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
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
import { SortButton } from './components/SortButton/SortButton';
import ThemeToggle from './components/ThemeToggle';
import { Listing, ListingRecord, mapListings } from './utils';


const filterOptions = [
  {
    label: "Price",
    options: ["Min Price", "Max Price"],
  },
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
    options: ["Pet Friendly", "Washer and Dryer", "On Site Parking", "Furnished"]
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
  },
  {
    address: "17806 Lassen St, Northridge, CA 91325",
    title: "Valleywood Apartments",
    link: "https://www.zillow.com/apartments/northridge-ca/valleywood-apartments/5j3nVB/",
    mainImg: "https://photos.zillowstatic.com/fp/22235decc9972e4df6e569ad159f866f-p_e.jpg",
    price: "$2850",
    beds: 2,
    baths: 2,
    size: "945 sqft",
    coordinates: [-118.52182, 34.24972],
  },
  {
    address: "1141 1/2 S Swall Dr, Los Angeles, CA 90035",
    title: "1141 1/2 S Swall Dr",
    link: "https://www.zillow.com/homedetails/1141-1-2-S-Swall-Dr-Los-Angeles-CA-90035/2056046373_zpid/",
    mainImg: "https://photos.zillowstatic.com/fp/868e48a0ec25fc5134e37bb74816fa15-p_e.jpg",
    price: "$2745",
    beds: 1,
    baths: 1,
    size: "1,100 sqft",
    coordinates: [-118.38582, 34.055946],
  },
  {
    address: "2209 Clyde Ave #2209A, Los Angeles, CA 90016",
    title: "2209 Clyde Ave #2209A",
    link: "https://www.zillow.com/homedetails/2209-Clyde-Ave-2209A-Los-Angeles-CA-90016/447574360_zpid/",
    mainImg: "https://photos.zillowstatic.com/fp/8e8cd9565de870b2726bbbcd274630e2-p_e.jpg",
    price: "$2395",
    beds: 1,
    baths: 1,
    size: "750 sqft",
    coordinates: [-118.365395, 34.03776],
  },
  {
    address: "924 W 78th St #926, Los Angeles, CA 90044",
    title: "924 W 78th St #926",
    link: "https://www.zillow.com/homedetails/924-W-78th-St-926-Los-Angeles-CA-90044/447574300_zpid/",
    mainImg: "https://maps.googleapis.com/maps/api/streetview?location=924+W+78th+St%2C+Los+Angeles%2C+CA+90044&size=960x720&key=AIzaSyARFMLB1na-BBWf7_R3-5YOQQaHqEJf6RQ&source=outdoor&&signature=1D5FUrojMNp28vpsS2HjhNQRW58=",
    price: "$3550",
    beds: 3,
    baths: 2,
    size: "1281 sqft",
    coordinates: [-118.29013, 33.968517],
  }
];

const mapBoxAccessToken = import.meta.env.VITE_MAPBOX_API_TOKEN;

function App() {
  const [listings, setListings] = useState<Listing[]>(defaultListings);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedSort, setSelectedSort] = useState<string>('');
  const [longitude, setLongitude] = useState(-118.26234);
  const [latitude, setLatitude] = useState(34.071907);
  const [isMapOpen, setIsMapOpen] = useState(false);
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

  const search = async (searchText:string, page=0, pageSize=10) =>{
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

    await search(`${preferences}. Filters: [${selectedFilters.length > 0 ? selectedFilters : 'None'}], Sort by (${selectedSort ? selectedSort : 'None'})`, 0)
  };

  const backPage = async () => {
    await search(pagingData.searchText, pagingData.page - 1);
  };

  const nextPage = async () => {
    await search(pagingData.searchText, pagingData.page + 1);
  };

  const filterListings = async (option: string) => {
    let updatedSearchText;

    if (pagingData.searchText.includes(option)) {
      updatedSearchText = pagingData.searchText.replace(/\[([^\]]*)\]/, (match) => {
        const insideBrackets = match.slice(1, -1); // Remove the square brackets
        const updatedContent = insideBrackets.split(', ').filter(item => item !== option).join(', '); // Remove the filter
        return `[${updatedContent}]`;
      });
    } else {
      updatedSearchText = pagingData.searchText.replace(/\[([^\]]*)\]/, (match) => {
        const insideBrackets = match.slice(1, -1); // Remove the square brackets

        if (insideBrackets === 'None') {
          return `[${option}]`;
        } else {
          const updatedContent = insideBrackets + ', ' + option; // Add new filter
          return `[${updatedContent}]`;
        }
      });
    }

    await search(updatedSearchText);
  };

  const sortListings = async (option: string) => {
    pagingData.searchText = pagingData.searchText.replace(/\(([^)]*)\)/, `(${option})`);

    await search(pagingData.searchText);
  };

  const clearFilters = async () => {
    setSelectedFilters([]);
    pagingData.searchText = pagingData.searchText.replace(/\[([^\]]*)\]/, '[None]');
    await search(pagingData.searchText);
  };


  return (
    <>
      {isLoading && <div className='large-loader'></div>}
      {showModal && <RequestModal setShowModal={setShowModal} showToast={showToast} />}
      <AnimatePresence>
        {isMapOpen &&
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.5 }}
            style={{ width: "100%", height: "auto", position: "fixed", top: 0, left: 0, bottom: 0, zIndex: 1 }}
          >
            <Map
              mapboxAccessToken={mapBoxAccessToken}
              mapStyle={"mapbox://styles/mapbox/streets-v12"}
              initialViewState={{
                latitude: viewport.latitude,
                longitude: viewport.longitude,
                zoom: viewport.zoom
              }}
              style={{ width: "100%", height: "100vh", position: "absolute", top: 0, left: 0, zIndex: 1 }}
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
          </motion.div>
        }
      </AnimatePresence>
      <header className='header'>
        <h1 className='header-title' onClick={() => window.location.reload()}>We Visit Properties For You</h1>
        <img src={"./dibby-icon.png"} height={55} style={{ marginRight: 'auto', marginLeft: '15px'}}/>
        <ThemeToggle />
      </header>
      <div>
        <div className='main-body-container'>
          <div className='filters-container'>
            <form onSubmit={submitPreference} className='preferences-form'>
              <input className='preferences-input' type="text" name="preferences" placeholder='Enter a city' />
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
                  filterListings={filterListings}
                  />
              ))}
              <button className='new-property-button' onClick={() => setShowModal(true)}>Send us to visit any property online</button>
            </div>
            <div className='filter-button-container'>
              <button
                className='filter-btn'
                onClick={clearFilters}
                disabled={selectedFilters.length === 0 || isLoading}
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
              <SortButton
                selectedSort={selectedSort}
                setSelectedSort={setSelectedSort}
                sortListings={sortListings}
                />
              <div className='listing-grid-container'>
                {listings.map((listing, index) => (
                  <ListingCard key={index} listing={listing} setShowModal={setShowModal} />
                ))}
                <div className='map-hover-button' onClick={() => {
                  setIsMapOpen(!isMapOpen);
                  document.body.classList.toggle('map-open', !isMapOpen);
                }}>
                  {isMapOpen ? "Close" : <>Map <FaRegMap size={20} /></>}
                </div>
              </div>
              {pagingData.totalPages > 1
                ? <div className='pagination-container'>
                    <FaArrowLeftLong size={20} cursor={"pointer"} onClick={backPage} />
                    <div className='pagination-numbers-container'>
                      {(() => {
                          const pageNumbers = [];
                          const totalPages = pagingData.totalPages;
                          const currentPage = pagingData.page;

                          // Calculate start and end pages for the window of 7 numbers
                          let start = Math.max(0, currentPage - 3);
                          let end = Math.min(totalPages - 1, currentPage + 3);

                          if (currentPage < 4) {
                            start = 0;
                            end = Math.min(6, totalPages - 1); // Ensure we don't exceed the total number of pages
                          }

                          // Adjust if we're near the end of the pagination
                          if (totalPages <= 7) {
                            start = 0;
                            end = totalPages - 1;
                          } else if (currentPage >= totalPages - 4) {
                            start = totalPages - 7;
                            end = totalPages - 1;
                          }

                          // Populate the page numbers to show
                          for (let i = start; i <= end; i++) {
                            pageNumbers.push(i);
                          }

                          return pageNumbers.map((index) => (
                            <div
                              key={index}
                              className="pagination-button"
                              onClick={() => {
                                if (pagingData.page !== index) {
                                  search(pagingData.searchText, index);
                                }
                              }}
                            >
                              {`${index + 1}`}
                              {pagingData.page === index && (
                                <div className="current-page-circle"></div>
                              )}
                            </div>
                          ));
                        })()}
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
