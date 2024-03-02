import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useRef } from "react";
import { uuidv4 } from "@firebase/util";

export type Option<T> = {
  value: T;
  displayValue?: T;
};
export default function AppSelect<T>({
  value,
  label,
  options,
  className,
  handleChange,
}: {
  label: string;
  className: string;
  value: T;
  options: Option<T>[];
  handleChange: (event: SelectChangeEvent) => void;
}) {
  const id = useRef(uuidv4());

  return (
    <div className={`${className ?? ""}`}>
      <FormControl sx={{ m: 1, minWidth: 80 }}>
        <InputLabel id={id.current}>{label}</InputLabel>
        <Select
          labelId={id.current}
          id="demo-simple-select-autowidth"
          value={String(value)}
          onChange={handleChange}
          autoWidth
          size="small"
          label={label}
        >
          {options.map((option, i) => (
            <MenuItem key={i} value={String(option.value)}>
              {String(option.displayValue ?? option.value)}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
