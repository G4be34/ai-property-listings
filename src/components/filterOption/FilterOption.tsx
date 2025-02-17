import { useEffect, useRef, useState } from "react";
import { ImCheckboxChecked, ImCheckboxUnchecked } from "react-icons/im";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import "./FilterOption.css";

type FilterOptionProps = {
  label: string;
  options: string[];
  selectedFilters: string[];
  setSelectedFilters: React.Dispatch<React.SetStateAction<string[]>>;
};

export function FilterOption({ label, options, selectedFilters, setSelectedFilters }: FilterOptionProps) {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement | null>(null);

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

  const selectFilter = (option: string) => {
    if (selectedFilters.includes(option)) {
      setSelectedFilters(selectedFilters.filter((filter) => filter !== option));
    } else {
      setSelectedFilters([...selectedFilters, option]);
    }
  };

  return (
    <div ref={dropdownRef}>
      <button className="filter-button" onClick={() => setIsOpen(!isOpen)}>
        {label}{" "}
        {isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}
      </button>
      {isOpen && (
        <ul className="options-container">
          {options.map((option, index) => (
            <li onClick={() => selectFilter(option)} key={index} className="option">
              {selectedFilters.includes(option) ? <ImCheckboxChecked /> : <ImCheckboxUnchecked />}
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
};
