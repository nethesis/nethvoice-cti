// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useState } from 'react'
import { Provider } from 'react-redux'
import { store } from '../store'
import Script from 'next/script'
import 'react-loading-skeleton/dist/skeleton.css'
import { TopBar, NavBar, MobileNavBar, SideBar } from '../components/layout'
import { navigationItems } from '../config/routes'

function MyApp({ Component, pageProps }: AppProps) {
  const [openMobileMenu, setOpenMobileMenu] = useState(false)

  return (
    <>
      <Provider store={store}>
        <div className='flex h-full'>
          <NavBar items={navigationItems} />
          <div className='flex flex-1 flex-col overflow-hidden'>
            <TopBar openMobileCb={() => setOpenMobileMenu(true)} />
            <MobileNavBar
              show={openMobileMenu}
              items={navigationItems}
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
                  <h1 id='primary-heading' className='sr-only'>
                    Photos
                  </h1>
                  <Component {...pageProps} />
                </section>
              </main>

              {/* Secondary column (hidden on smaller screens) */}
              <SideBar />
            </div>
          </div>
        </div>
      </Provider>
       {/* //// improve config import */}
      <Script src={`config/config.${process.env.NODE_ENV}.js`}></Script>
    </>
  )
}

export default MyApp
