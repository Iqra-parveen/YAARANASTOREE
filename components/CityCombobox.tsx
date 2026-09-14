"use client";

import { useState } from "react";

type CityComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
};

const cities = [
  "Islamabad",
  "Rawalpindi",
  "Lahore",
  "Karachi",
  "Peshawar",
  "Quetta",
  "Multan",
  "Faisalabad",
  "Gujranwala",
  "Sialkot",
  "Sargodha",
  "Bahawalpur",
  "Abbottabad",
  "Mardan",
  "Hyderabad",
  "Sukkur",
  "Gujrat",
  "Jhelum",
  "Wah Cantt",
  "Taxila",
];

export default function CityCombobox({
  value,
  onChange,
  required,
}: CityComboboxProps) {
  const [open, setOpen] = useState(false);

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(value.toLowerCase())
  );

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        required={required}
        autoComplete="address-level2"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setTimeout(() => setOpen(false), 150);
        }}
        placeholder="Select or type your city"
        className="focus-gold w-full rounded-sm border border-hairline bg-charcoal px-3 py-2.5 text-sm text-bone placeholder:text-bone/40"
      />

      {open && filteredCities.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-sm border border-hairline bg-charcoal shadow-lg">
          {filteredCities.map((city) => (
            <button
              key={city}
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onChange(city);
                setOpen(false);
              }}
              className="block w-full px-3 py-2 text-left text-sm text-bone hover:bg-white/5"
            >
              {city}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}