// src/components/common/ThemeSync.jsx
import { useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';

const ThemeSync = () => {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const themeColor = isDarkMode ? '#15202B' : '#FFFFFF';
    let metaThemeColor = document.querySelector("meta[name=theme-color]");
    
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", themeColor);
    } else {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = "theme-color";
      metaThemeColor.content = themeColor;
      document.getElementsByTagName('head')[0].appendChild(metaThemeColor);
    }
  }, [isDarkMode]);

  return null; // This component does not render anything
};

export default ThemeSync;
