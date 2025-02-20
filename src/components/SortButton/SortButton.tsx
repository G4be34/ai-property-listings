import { useEffect, useRef, useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import "./SortButton.css";

const sortOptions = [
  "Price (High to Low)",
  "Price (Low to High)",
  "Bedrooms",
  "Bathrooms",
  "Square Feet"
];

type SortButtonProps = {
  selectedSort: string;
  setSelectedSort: React.Dispatch<React.SetStateAction<string>>;
  sortListings: (option: string) => Promise<void>;
};

export function SortButton({ selectedSort, setSelectedSort, sortListings }: SortButtonProps) {
    const [isSortOpen, setIsSortOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const selectSortOption = async (option: string) => {
    setSelectedSort(option);
    await sortListings(option);
    setIsSortOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <button
        className='sort-button'
        onClick={() => setIsSortOpen(!isSortOpen)}
      >
        Sort{selectedSort ? ": " + selectedSort : null}<IoIosArrowDown size={20} />
      </button>
      {isSortOpen && (
        <ul className='sort-options'>
          {sortOptions.map((option, index) => (
            <li
              key={index}
              className='sort-option'
              onClick={() => selectSortOption(option)}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}