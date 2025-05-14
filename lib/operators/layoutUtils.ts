import { useMemo } from 'react'

/**
 * Hook that calculates grid classes based on the layout type and sidebar state
 * @param layoutType - The layout type ('standard', 'compact', or 'grouped')
 * @param isSidebarOpen - Whether the sidebar is open or closed
 * @returns The appropriate Tailwind CSS classes for the layout
 */
export const useGridClasses = (layoutType: string, isSidebarOpen: boolean) => {
  return useMemo(() => {
    switch (layoutType) {
      case 'standard':
        return isSidebarOpen
          ? 'mx-auto grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 md:gap-x-6 lg:max-w-5xl lg:gap-x-8 lg:gap-y-12 xl:grid-cols-5 5xl:grid-cols-6 6xl:grid-cols-7 7xl:grid-cols-8 5xl:max-w-screen-2xl'
          : 'mx-auto grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4 md:gap-x-6 lg:max-w-6xl lg:gap-x-8 lg:gap-y-12 xl:grid-cols-6 5xl:grid-cols-7 6xl:grid-cols-8 7xl:grid-cols-9 5xl:max-w-screen-2xl'

      case 'compact':
      case 'grouped':
      default:
        return isSidebarOpen
          ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-3 5xl:grid-cols-4 6xl:grid-cols-5 7xl:grid-cols-6 5xl:max-w-screen-2xl'
          : 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 5xl:grid-cols-5 6xl:grid-cols-6 7xl:grid-cols-7 5xl:max-w-screen-2xl'
    }
  }, [layoutType, isSidebarOpen])
}
