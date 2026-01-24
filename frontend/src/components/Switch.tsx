// src/components/Switch.tsx
import React from 'react';
import styled from 'styled-components';
import { useThemeMode } from '../themeProvider';
import { Sun, Moon } from 'lucide-react';

const Switch: React.FC = () => {
  const { mode, toggle } = useThemeMode();
  const checked = mode === 'dark';

  return (
    <StyledWrapper data-theme={mode}>
      <div className="toggle-switch">
        <label className="switch-label">
          <input
            type="checkbox"
            className="checkbox"
            checked={checked}
            onChange={toggle}
            aria-label={checked ? 'Switch to light mode' : 'Switch to dark mode'}
          />
          <span className="slider">
            <span className="thumb">
              <span className="icon icon-light">
                <Sun size={16} />
              </span>
              <span className="icon icon-dark">
                <Moon size={16} />
              </span>
            </span>
          </span>
        </label>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .toggle-switch {
    position: relative;
    width: 39px;
    height: 80px;
    --light: #e5e7eb;
    --lighter: #f9fafb;
    --dark: #212121;
    --dark-soft: #333333;
  }

  .switch-label {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 26px;
    cursor: pointer;
    box-sizing: border-box;
    border: 2px solid var(--dark-soft);
    overflow: hidden;
  }

  .checkbox {
    position: absolute;
    display: none;
  }

  .slider {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 26px;
    display: block;
    /* Light mode (unchecked): darker background overall */
    background: linear-gradient(
      to bottom,
      var(--dark) 0%,
      var(--dark-soft) 50%,
      var(--light) 100%
    );
    transition: background 0.35s ease-out;
  }

  /* Dark mode (checked): lighter background overall */
  .checkbox:checked ~ .slider {
    background: linear-gradient(
      to bottom,
      var(--lighter) 0%,
      var(--light) 50%,
      var(--dark) 100%
    );
  }

  .thumb {
    position: absolute;
    left: 5px;
    top: 5px;
    width: 26px;
    height: 26px;
    border-radius: 999px;
    background-color: var(--light);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    transition: transform 0.3s ease, background-color 0.3s ease;
    overflow: hidden;
  }

  /* Move knob down in dark mode */
  .checkbox:checked ~ .slider .thumb {
    transform: translateY(37px);
    background-color: var(--dark);
  }

  .icon {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.25s ease;
  }

  .icon-light {
    opacity: 1;
  }

  .icon-dark {
    opacity: 0;
  }

  /* Swap icons when checked */
  .checkbox:checked ~ .slider .icon-light {
    opacity: 0;
  }

  .checkbox:checked ~ .slider .icon-dark {
    opacity: 1;
  }
`;

export default Switch;
