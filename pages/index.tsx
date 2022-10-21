// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import type { NextPage } from 'next'
import * as Janus from 'janus-gateway'
import { MdFavoriteBorder } from 'react-icons/md'

const Home: NextPage = () => {
  console.log(Janus)

  return (
    <>
      <h1 className='text-5xl font-extrabold text-sky-600 flex gap-6'>
      </h1>
    </>
  )
}

export default Home
