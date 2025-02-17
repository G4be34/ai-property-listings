import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import { useEffect, useState } from 'react';
import { CiPaperplane } from 'react-icons/ci';
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
    price: "$1875.00/month",
    beds: 2,
    baths: 2,
    size: "1,000 sqft",
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
  {
    address: "7010 Sepulveda Blvd, Van Nuys, CA",
    title: "Listing in Los Angeles",
    link: "https://www.zillow.com/apartments/van-nuys-ca/park-manor-apartments/5XjQsB/",
    mainImg: "https://photos.zillowstatic.com/fp/49e4629a03a96c97daa9d1846e86b27d-p_e.jpg",
    price: "$1875.00/month",
    beds: 2,
    baths: 2,
    size: "1,000 sqft",
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
  {
    address: "7010 Sepulveda Blvd, Van Nuys, CA",
    title: "Listing in Los Angeles",
    link: "https://www.zillow.com/apartments/van-nuys-ca/park-manor-apartments/5XjQsB/",
    mainImg: "https://photos.zillowstatic.com/fp/49e4629a03a96c97daa9d1846e86b27d-p_e.jpg",
    price: "$1875.00/month",
    beds: 2,
    baths: 2,
    size: "1,000 sqft",
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
  {
    address: "7010 Sepulveda Blvd, Van Nuys, CA",
    title: "Listing in Los Angeles",
    link: "https://www.zillow.com/apartments/van-nuys-ca/park-manor-apartments/5XjQsB/",
    mainImg: "https://photos.zillowstatic.com/fp/49e4629a03a96c97daa9d1846e86b27d-p_e.jpg",
    price: "$1875.00/month",
    beds: 2,
    baths: 2,
    size: "1,000 sqft",
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
  {
    address: "7010 Sepulveda Blvd, Van Nuys, CA",
    title: "Listing in Los Angeles",
    link: "https://www.zillow.com/apartments/van-nuys-ca/park-manor-apartments/5XjQsB/",
    mainImg: "https://photos.zillowstatic.com/fp/49e4629a03a96c97daa9d1846e86b27d-p_e.jpg",
    price: "$1875.00/month",
    beds: 2,
    baths: 2,
    size: "1,000 sqft",
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
  {
    address: "7010 Sepulveda Blvd, Van Nuys, CA",
    title: "Listing in Los Angeles",
    link: "https://www.zillow.com/apartments/van-nuys-ca/park-manor-apartments/5XjQsB/",
    mainImg: "https://photos.zillowstatic.com/fp/49e4629a03a96c97daa9d1846e86b27d-p_e.jpg",
    price: "$1875.00/month",
    beds: 2,
    baths: 2,
    size: "1,000 sqft",
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
  const [pagingData, setPagingData] = useState({
    page: 0,
    count: 0,
    totalPages: 1,
    searchText: ''
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
        page: 0,
        totalPages: res.data.totalPages,
        count: res.data.count,
        searchText: searchText
      })

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


  useEffect(() => {
    mapboxgl.accessToken = mapBoxAccessToken;

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [-74.5, 40],
      zoom: 9,
    });

    map.on("load", () => {window.dispatchEvent(new Event("resize"));});
  }, []);

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
            <div id='map'></div>
            <div className='listings-and-button-container'>
              <div className='listing-grid-container'>
                {listings.map((listing, index) => (
                  <ListingCard key={index} listing={listing} setShowModal={setShowModal} />
                ))}
              </div>
              {pagingData.page < pagingData.totalPages
                ? <button className='load-more-button' onClick={loadMoreListings}>
                    {loadingMoreListings ? <div className='loader'></div> : "Load More"}
                  </button>
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
