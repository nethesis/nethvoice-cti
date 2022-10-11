import type { NextPage } from 'next'
import * as Janus from 'janus-gateway'
import { MdFavoriteBorder } from 'react-icons/md'

const Home: NextPage = () => {
  console.log(Janus)

  return (
    <>
      <h1 className='text-5xl font-extrabold text-sky-600 flex gap-6'>
        <p>NethVoice CTI</p>

        <MdFavoriteBorder />
      </h1>
    </>
  )
}

export default Home
