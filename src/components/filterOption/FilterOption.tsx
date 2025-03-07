import { useEffect, useRef, useState } from "react";
import { FaMinus } from "react-icons/fa6";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import "./FilterOption.css";

type FilterOptionProps = {
  label: string;
  options: string[];
  selectedFilters: string[];
  setSelectedFilters: React.Dispatch<React.SetStateAction<string[]>>;
  filterListings: (option: string) => Promise<void>;
  minPrice: string;
  setMinPrice: React.Dispatch<React.SetStateAction<string>>;
  maxPrice: string;
  setMaxPrice: React.Dispatch<React.SetStateAction<string>>;
  numberOfBeds: string;
  setNumberOfBeds: React.Dispatch<React.SetStateAction<string>>;
  numberOfBaths: string;
  setNumberOfBaths: React.Dispatch<React.SetStateAction<string>>;
};

const numChoices = ["Any", "1+", "2+", "3+", "4+", "5+"];

export function FilterOption({ label, options, selectedFilters, setSelectedFilters, filterListings, minPrice, setMinPrice, maxPrice, setMaxPrice, numberOfBeds, setNumberOfBeds, numberOfBaths, setNumberOfBaths }: FilterOptionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const filterPriceRange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (minPrice && maxPrice) {
      setSelectedFilters((prevFilters) => {
        if (prevFilters.find(filter => filter.includes("Price range:"))) {
          const updatedFilters = prevFilters.filter(filter => !filter.includes("Price range:"));
          return [...updatedFilters, `Price range: ${minPrice}-${maxPrice}`];
        } else {
          return [...prevFilters, `Price range: ${minPrice}-${maxPrice}`];
        }
      });
      await filterListings(`Price range: ${minPrice}-${maxPrice}`);
    } else if (minPrice) {
      setSelectedFilters((prevFilters) => {
        if (prevFilters.find(filter => filter.includes("Minimum Price:"))) {
          const updatedFilters = prevFilters.filter(filter => !filter.includes("Minimum Price:"));
          return [...updatedFilters, `Minimum Price: ${minPrice}`];
        } else {
          return [...prevFilters, `Minimum Price: ${minPrice}`];
        }
      });
      await filterListings(`Minimum Price: ${minPrice}`);
    } else if (maxPrice) {
      setSelectedFilters((prevFilters) => {
        if (prevFilters.find(filter => filter.includes("Maximum Price:"))) {
          const updatedFilters = prevFilters.filter(filter => !filter.includes("Maximum Price:"));
          return [...updatedFilters, `Maximum Price: ${maxPrice}`];
        } else {
          return [...prevFilters, `Maximum Price: ${maxPrice}`];
        }
      });
      await filterListings(`Maximum Price: ${maxPrice}`);
    }

    setIsOpen(false);
  };

  const selectFilter = async (option: string) => {
    if (selectedFilters.includes(option)) {
      setSelectedFilters(selectedFilters.filter((filter) => filter !== option));
      await filterListings(option);
    } else {
      setSelectedFilters([...selectedFilters, option]);
      await filterListings(option);
    }
  };

  const selectNumberOfBeds = async (option: string) => {
    setNumberOfBeds(option);
    setSelectedFilters((prevFilters) => {
      if (prevFilters.find(filter => filter.includes("Number of Beds:"))) {
        const updatedFilters = prevFilters.filter(filter => !filter.includes("Number of Beds:"));
        return [...updatedFilters, `Number of Beds: ${option}`];
      } else {
        return [...prevFilters, `Number of Beds: ${option}`];
      }
    })
    await filterListings(`Number of Beds: ${option}`);
    setIsOpen(false);
  };

  const selectNumberOfBaths = async (option: string) => {
    setNumberOfBaths(option);
    setSelectedFilters((prevFilters) => {
      if (prevFilters.find(filter => filter.includes("Number of Baths:"))) {
        const updatedFilters = prevFilters.filter(filter => !filter.includes("Number of Baths:"));
        return [...updatedFilters, `Number of Baths: ${option}`];
      } else {
        return [...prevFilters, `Number of Baths: ${option}`];
      }
    })
    await filterListings(`Number of Baths: ${option}`);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button className="filter-button" onClick={() => setIsOpen(!isOpen)}>
        {label}{" "}
        {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
      </button>
      {isOpen && (
        (label === "Price") ? (
            <form className="price-form" onSubmit={filterPriceRange}>
              <div className="price-range">
                <div>
                  <label htmlFor="minPrice">Min Price</label>
                  <input
                    type="text"
                    name="minPrice"
                    placeholder="0"
                    onChange={(e) => setMinPrice(e.target.value)}
                    value={minPrice}
                    />
                </div>
                <div className="price-range-separator"><FaMinus size={20} /></div>
                <div>
                  <label htmlFor="maxPrice">Max Price</label>
                  <input
                    type="text"
                    name="maxPrice"
                    onChange={(e) => setMaxPrice(e.target.value)}
                    value={maxPrice}
                    />
                </div>
              </div>
              <button type="submit" disabled={!minPrice && !maxPrice}>Apply</button>
            </form>
        ) : (label === "Beds & Baths") ? (
          <div className="beds-baths-container">
            <p>Number of Beds</p>
            <div className="beds-baths">
              {numChoices.map((choice, index) => (
                <div
                  key={index}
                  className="beds-baths-button"
                  style={{
                    backgroundColor: numberOfBeds === choice ? 'lightgray' : '',
                    borderLeft: index === 0 ? '2px solid lightgray' : '',
                    color: numberOfBeds === choice ? 'black' : ''
                  }}
                  onClick={() => selectNumberOfBeds(choice)}
                  >
                    {choice}
                  </div>
              ))}
            </div>
            <p>Number of Baths</p>
            <div className="beds-baths">
              {numChoices.map((choice, index) => (
                <div
                  key={index}
                  className="beds-baths-button"
                  style={{
                    backgroundColor: numberOfBaths === choice ? 'lightgray' : '',
                    borderLeft: index === 0 ? '2px solid lightgray' : '',
                    color: numberOfBaths === choice ? 'black' : ''
                  }}
                  onClick={() => selectNumberOfBaths(choice)}
                  >
                    {choice}
                  </div>
              ))}
            </div>
          </div>
        ) : (
          <ul className="options-container">
            {options.map((option, index) => (
              <li onClick={() => selectFilter(option)} key={index} className="option">
                {selectedFilters.includes(option) ? <ImCheckboxChecked /> : <ImCheckboxUnchecked />}
                {option}
              </li>
            ))}
          </ul>
        )
      )}
    </div>
  )
};
