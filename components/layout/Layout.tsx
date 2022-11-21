// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ReactNode, useState, useEffect } from 'react'
import { NavBar, TopBar, MobileNavBar, SideBar, SideDrawer } from '.'
import { navItems, NavItemsProps } from '../../config/routes'
import { useRouter } from 'next/router'
import { getUserInfo } from '../../services/user'
import { useDispatch } from 'react-redux'
import { Dispatch } from '../../store'
import { RootState } from '../../store'
import { useSelector } from 'react-redux'
import { closeSideDrawer } from '../../lib/utils'

interface LayoutProps {
  children: ReactNode
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false)
  const router = useRouter()
  const [items, setItems] = useState<NavItemsProps[]>(navItems)
  const dispatch = useDispatch<Dispatch>()
  const sideDrawer = useSelector((state: RootState) => state.sideDrawer)

  useEffect(() => {
    const currentItems = items.map((route) => {
      if (router.pathname === route.href) {
        route.current = true
      } else {
        route.current = false
      }
      return route
    })

    setItems(currentItems)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router])

  useEffect(() => {
    const getData = async () => {
      const userInfo = await getUserInfo()
      if (userInfo && userInfo.data) {
        dispatch.user.update({
          name: userInfo.data.name,
          mainextension: userInfo.data.endpoints.mainextension[0].id,
          mainPresence: userInfo.data.mainPresence,
        })
      }
    }
    getData()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className='flex h-full'>
      {/* Navigation bar */}
      <NavBar items={items} />
      <div className='flex flex-1 flex-col overflow-hidden'>
        {/* Top heading bar */}
        <TopBar openMobileCb={() => setOpenMobileMenu(true)} />
        {/* Mobile navigation bar */}
        <MobileNavBar
          show={openMobileMenu}
          items={items}
          closeMobileMenu={() => setOpenMobileMenu(false)}
        />
        {/* Main content */}
        <div className='flex flex-1 items-stretch overflow-hidden'>
          <main className='flex-1 overflow-y-auto'>
            {/* Primary column */}
            <section
              aria-labelledby='primary-heading'
              className='flex h-full min-w-0 flex-1 flex-col lg:order-last p-8 bg-gray-100 dark:bg-gray-800'
            >
              {/* The page content */}
              {children}
            </section>
          </main>
          {/* Secondary column (hidden on smaller screens) */}
          <SideBar />
          <SideDrawer
            isShown={sideDrawer.isShown}
            contentType={sideDrawer.contentType}
            config={sideDrawer.config}
            drawerClosed={() => closeSideDrawer()}
          />
        </div>
      </div>
    </div>
  )
}
