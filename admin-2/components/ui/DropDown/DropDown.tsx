'use client';

import React from 'react';
import { IoIosArrowDown } from 'react-icons/io';
import styles from './DropDown.module.css';

interface DropDownProps {
  dropDownType: string;
  openClose: boolean;
  options: string[];
  selectedOptions: string;
  handleClick: (option: string) => void;
  toggleDropdown: () => void;
  width?: string;
  dropdownMenuWidth?: string;
}

const DropDown: React.FC<DropDownProps> = ({
  dropDownType,
  openClose,
  options,
  selectedOptions,
  handleClick,
  toggleDropdown,
  width,
  dropdownMenuWidth,
}) => {
  return (
    <div className={styles.dropdownContainer}>
      <button
        className={styles.dropdownButton}
        style={{ width: width, border: '1px solid #4043492b' }}
        onClick={toggleDropdown}
      >
        {dropDownType}{' '}
        <span className={styles.arrowDown}>
          <IoIosArrowDown />
        </span>
      </button>
      {openClose && (
        <div
          className={styles.dropdownMenu}
          style={{ width: dropdownMenuWidth }}
        >
          {options.map((option) => (
            <label className={styles.dropdownItem} key={option}>
              <input
                type="checkbox"
                name={`${dropDownType}`}
                checked={selectedOptions === option}
                onChange={() => handleClick(option)}
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default DropDown;
