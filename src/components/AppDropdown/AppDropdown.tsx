import MenuButton from "@mui/joy/MenuButton";
import Dropdown from "@mui/joy/Dropdown";
import { DeleteForever as Clear } from "@mui/icons-material";
import Checkbox from "@mui/material/Checkbox";
import { useIsElementFocused } from "../../hooks/useIsElementFocused";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

import "./AppDropdown.scss";

export type DropdownProps = {
  label?: string;
  icon?: React.ReactNode;
  value: string[];
  options: {
    label: string;
    value: string;
  }[];
  onChange: (value: string[]) => void;
};

export default function AppDropdown({
  label,
  value,
  icon,
  options,
  onChange,
}: DropdownProps) {
  const [openState, setOpenState] = useState({
    open: false,
    selected: [] as string[],
  });
  const lastClickOutOccurenceRef = useRef<number>();

  const refContainer = useRef<HTMLDivElement>(null);
  const activatorRef = useRef<HTMLDivElement>(null);

  const refContainerCurrent = refContainer.current;
  const activatorRefCurrent = activatorRef.current;

  const focusables = useMemo(() => {
    return [
      refContainerCurrent,
      openState.open ? activatorRefCurrent : null,
    ].filter((i) => !!i) as HTMLElement[];
  }, [refContainerCurrent, openState.open, activatorRefCurrent]);

  const onOpen = useCallback(() => {
    setOpenState({
      open: true,
      selected: value,
    });
  }, [value]);

  const onClose = useCallback(() => {
    if(!openState.open) {
      return;
    }
    onChange(openState.selected);
    setOpenState((op) => ({
      ...op,
      open: false,
    }));
  }, [onChange, openState.open, openState.selected]);

  const { clickOutOccurence } = useIsElementFocused(focusables);

  useEffect(() => {
    if (lastClickOutOccurenceRef.current !== clickOutOccurence) {
      clickOutOccurence && onClose();
    }
    lastClickOutOccurenceRef.current = clickOutOccurence;
  }, [clickOutOccurence, onClose]);

  return (
    <Dropdown>
      <div ref={activatorRef} className="flex-center-all">
        <MenuButton
          onClick={onOpen}
          className="app-dropdown-btn pl-10 pr-5"
        >
          {icon}
          {!!label && label}
          {value.length > 0 ? ` (${value.length})` : ""}
          <ArrowDropDownIcon />
        </MenuButton>
        {value.length > 0 && (
          <button
            className="btn-svg emphasized ml-7 mt-2"
            onClick={() => onChange([])}
          >
            <Clear />
          </button>
        )}
      </div>

      {openState.open &&
        createPortal(
          <div className="app-dropdown-menu">
            <div className="app-dropdown-menu-sub">
              <div ref={refContainer} className="app-dropdown-menu-inner">
                {options.map((o, i) => {
                  const isChecked = openState.selected.indexOf(o.value) > -1;
                  return (
                    <div
                      className="menu-item-app-container"
                      key={i}
                      onClick={() =>
                        setOpenState((op) => ({
                          ...op,
                          selected: isChecked
                            ? op.selected.filter((v) => v !== o.value)
                            : [...op.selected, o.value],
                        }))
                      }
                    >
                      <Checkbox
                        className="btn-svg menu-item-app-icon"
                        key={`${isChecked}-${i}-${o.value}`}
                        defaultChecked={isChecked}
                        color="success"
                        onClick={(e) => {
                          // had to do this because the detector of click outside doesn't work with the checkbox input, and I don't have energy to deal with it
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenState((op) => ({
                            ...op,
                            selected: isChecked
                              ? op.selected.filter((v) => v !== o.value)
                              : [...op.selected, o.value],
                          }));
                        }}
                      />
                      <div className="menu-item-app-txt">{o.label}</div>
                    </div>
                  );
                })}
              </div>
              <div onClick={onClose} className="btn-svg app-close-btn">
                <CloseIcon fontSize="large" />
              </div>
            </div>
          </div>,
          document.body
        )}
    </Dropdown>
  );
}
