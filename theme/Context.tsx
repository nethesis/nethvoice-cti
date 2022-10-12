import defaultTheme from './Theme'
import { createContext, useContext } from 'react'

export const ThemeContext = createContext({
  theme: defaultTheme,
})

export function useTheme() {
  return useContext(ThemeContext)
}
