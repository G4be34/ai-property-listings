import { useState } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";

export function FilterOption({ label, options }: { label: string, options: string[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button>{label}{" "}{isOpen ? <IoIosArrowUp /> : <IoIosArrowDown />}</button>
      {isOpen && (
        <ul>
          {options.map((option, index) => (
            <li key={index}>{option}</li>
          ))}
        </ul>
      )}
    </div>
  )
};
