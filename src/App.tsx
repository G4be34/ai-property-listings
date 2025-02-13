import axios from 'axios';
import { AnimatePresence, motion } from 'framer-motion';
import mapboxgl from 'mapbox-gl';
import { useEffect, useState } from 'react';
import { CiDollar, CiPaperplane } from 'react-icons/ci';
import { MdLightbulbOutline } from 'react-icons/md';
import { PiMapPinArea } from 'react-icons/pi';
import { TbBed } from 'react-icons/tb';
import { toast, ToastContainer } from 'react-toastify';
import './App.css';
import { FilterOption } from './components/filterOption/FilterOption';
import { ListingCard } from './components/ListingCard/ListingCard';
import RequestModal from './components/RequestModal/RequestModal';
import ThemeToggle from './components/ThemeToggle';
import { Listing, ListingRecord, mapListings } from './utils';

const presetCommands = [
  { command: 'Tell me which city is best for me', icon: <PiMapPinArea size={20} /> },
  { command: 'Which apartments can I afford?', icon: <CiDollar size={20} /> },
  { command: 'Help me find the best 2 bedroom under $4k', icon: <TbBed size={20} /> },
  { command: 'Find me a place that fits my daily routine', icon: <MdLightbulbOutline size={20} /> },
];

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
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
  {
    address: "7010 Sepulveda Blvd, Van Nuys, CA",
    title: "Listing in Los Angeles",
    link: "https://www.zillow.com/apartments/van-nuys-ca/park-manor-apartments/5XjQsB/",
    mainImg: "https://photos.zillowstatic.com/fp/49e4629a03a96c97daa9d1846e86b27d-p_e.jpg",
    price: "$1875.00/month",
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
  {
    address: "7010 Sepulveda Blvd, Van Nuys, CA",
    title: "Listing in Los Angeles",
    link: "https://www.zillow.com/apartments/van-nuys-ca/park-manor-apartments/5XjQsB/",
    mainImg: "https://photos.zillowstatic.com/fp/49e4629a03a96c97daa9d1846e86b27d-p_e.jpg",
    price: "$1875.00/month",
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
  {
    address: "7010 Sepulveda Blvd, Van Nuys, CA",
    title: "Listing in Los Angeles",
    link: "https://www.zillow.com/apartments/van-nuys-ca/park-manor-apartments/5XjQsB/",
    mainImg: "https://photos.zillowstatic.com/fp/49e4629a03a96c97daa9d1846e86b27d-p_e.jpg",
    price: "$1875.00/month",
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
  {
    address: "7010 Sepulveda Blvd, Van Nuys, CA",
    title: "Listing in Los Angeles",
    link: "https://www.zillow.com/apartments/van-nuys-ca/park-manor-apartments/5XjQsB/",
    mainImg: "https://photos.zillowstatic.com/fp/49e4629a03a96c97daa9d1846e86b27d-p_e.jpg",
    price: "$1875.00/month",
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
  {
    address: "7010 Sepulveda Blvd, Van Nuys, CA",
    title: "Listing in Los Angeles",
    link: "https://www.zillow.com/apartments/van-nuys-ca/park-manor-apartments/5XjQsB/",
    mainImg: "https://photos.zillowstatic.com/fp/49e4629a03a96c97daa9d1846e86b27d-p_e.jpg",
    price: "$1875.00/month",
    pros: ["Washer/Dryer included", "Pet-friendly"],
  },
];

const mapBoxAccessToken = "pk.eyJ1IjoiZzRiZTM0IiwiYSI6ImNtNzJqMDU1YzBheXoyam9qMDQ3Nms2Z2wifQ.DqP8i3w9oQJ75-P4UIuyDg";

function App() {
  const [listings, setListings] = useState<Listing[]>(testListings);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingCommand, setLoadingCommand] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loadingMoreListings, setLoadingMoreListings] = useState(false);
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

  const commandClick = async (command: string) => {
    try {
      setLoadingCommand(true);
      await search(command);
    } catch (error) {
      console.error("Error executing command:", error);
    } finally {
      setLoadingCommand(false);
    }
  };

  useEffect(() => {
    mapboxgl.accessToken = mapBoxAccessToken;

    const map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/standard',
      center: [-74.5, 40],
      zoom: 9,
    })
  }, []);

  return (
    <>
      {loadingCommand && <div className='large-loader'></div>}
      {showModal && <RequestModal setShowModal={setShowModal} showToast={showToast} />}
      <header className='header'>
        <h1 className='header-title' onClick={() => window.location.reload()}>Finding Places</h1>
        <ThemeToggle />
      </header>
      <AnimatePresence>
        {listings.length === 0
          && <motion.div key="options" exit={{ opacity: 0, y: -25 }} transition={{ duration: 0.5}}>
              <h2 className='title'>AI-Powered home search and property inspection</h2>
              <div className='description-container'>
                <p className='description'>I'll help you find your ideal apartment. Share your preferences for location, budget, and features, and I'll do the rest</p>
                <p className='description'>Or I can help you in other ways shown below!</p>
              </div>
              <div className='command-grid-container'>
                {presetCommands.map((section, index) => (
                  <div key={index} className='command-container' onClick={() => commandClick(section.command)}>
                    <div className='command-icon'>{section.icon}</div>
                    <p className='command'>{section.command}</p>
                  </div>
                ))}
              </div>
            </motion.div>}
        <motion.form layout onSubmit={submitPreference} className='preferences-form'>
          <input className='preferences-input' type="text" name="preferences" placeholder='Tell me your preferences' />
          <button type='submit' className='submit-button' disabled={isLoading || loadingCommand}>
            {isLoading ? <div className='loader'></div> : <CiPaperplane size={25} style={{ strokeWidth: 0.5}} />}
          </button>
        </motion.form>
      </AnimatePresence>
      <div className='powered-by-container'>
        <small className='powered-by'>Powered by GPT-4</small>
      </div>
      {listings.length > 0
        && <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, delay: 0.5 }}>
            <div className='main-body-container'>
              <div className='filters-container'>
                {filterOptions.map((option, index) => (
                  <FilterOption key={index} label={option.label} options={option.options} />
                ))}
              </div>
              <div className='map-and-listings-container'>
                <div id='map' style={{ height: '100%', width: '50%'}}></div>
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
          </motion.div>}
        <ToastContainer />
    </>
  )
}

export default App
