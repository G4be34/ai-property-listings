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
};

export function FilterOption({ label, options, selectedFilters, setSelectedFilters, filterListings }: FilterOptionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const filterPriceRange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (minPrice && maxPrice) {
      await filterListings(`Price range: ${minPrice}-${maxPrice}`);
    } else if (minPrice) {
      await filterListings(`Minimum Price: ${minPrice}`);
    } else if (maxPrice) {
      await filterListings(`Maximum Price: ${maxPrice}`);
    }

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

  const selectFilter = async (option: string) => {
    if (selectedFilters.includes(option)) {
      setSelectedFilters(selectedFilters.filter((filter) => filter !== option));
    } else {
      await filterListings(option);
      setSelectedFilters([...selectedFilters, option]);
    }
  };

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
