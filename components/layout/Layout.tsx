// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { FC, ReactNode, useState, useEffect } from 'react'
import { NavBar, TopBar, MobileNavBar, SideBar } from '.'
import { navItems, NavItemsProps } from '../../config/routes'
import { useRouter } from 'next/router'
import { getUserInfo } from '../../services/user'
import { useDispatch } from 'react-redux'
import { Dispatch } from '../../store'

interface LayoutProps {
  children: ReactNode
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false)
  const router = useRouter()
  const [items, setItems] = useState<NavItemsProps[]>(navItems)
  const dispatch = useDispatch<Dispatch>()

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
    setTimeout(() => {
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
    }, 2000)

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
              className='flex h-full min-w-0 flex-1 flex-col lg:order-last'
            >
              {/* The page content */}
              {children}
            </section>
          </main>
          {/* Secondary column (hidden on smaller screens) */}
          <SideBar />
        </div>
      </div>
    </div>
  )
}
