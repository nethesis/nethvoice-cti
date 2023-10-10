// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later
import { FC, ComponentProps, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faListCheck, faParking, faPhone } from '@fortawesome/free-solid-svg-icons'
import { motion } from 'framer-motion'
import SlideCarousel from '../SlideCarousel'
import { Button } from '../common'
import { retrieveParksList } from '../../lib/park'
import { getParking } from '../../lib/park'
import { useSelector } from 'react-redux'
import { RootState, store } from '../../store'
import { isEmpty } from 'lodash'

export interface ParkCardsProps extends ComponentProps<'div'> {}
export const ParkCards: FC<ParkCardsProps> = ({ className }): JSX.Element => {
  const { t } = useTranslation()
  const currentUser = useSelector((state: RootState) => state.user)
  const parkingInfo = useSelector((state: RootState) => state.park)

  async function pickParking(parkingInfoDetails: any) {
    let parkingObjectInformations: any = {}
    if (!isEmpty(parkingInfoDetails) && !isEmpty(currentUser.default_device)) {
      parkingObjectInformations = {
        parking: parkingInfoDetails?.parking,
        destId: currentUser?.default_device?.id,
      }
    }
    if (!isEmpty(parkingObjectInformations)) {
      try {
        await getParking(parkingObjectInformations)
        store.dispatch.park.setParkingCallTaken(true)
        // retrieveParksList()
      } catch (error) {
        console.error(error)
      }
    }
  }

  const [cardPressStates, setCardPressStates]: any = useState({})
  const animationControls: any = useRef(null)

  const parkCardsData: any[] = Object.keys(parkingInfo.parks).map(
    (parkingKey: any, index: number) => {
      const parkingDetails: any = parkingInfo.parks[parkingKey]
      const handleButtonDown = () => {
        if (!cardPressStates[index]) {
          setCardPressStates((prevState: any) => ({
            ...prevState,
            [index]: true,
          }))
          animationControls.current = setTimeout(() => {
            longPressHandler(parkingDetails)
          }, 2000)
        }
      }

      const handleButtonUp = () => {
        setCardPressStates((prevState: any) => ({
          ...prevState,
          [index]: false,
        }))
        if (animationControls.current) {
          clearTimeout(animationControls.current)
        }
        resetAnimation()
      }

      const longPressHandler = (parkingDetails: any) => {
        pickParking(parkingDetails)
        resetAnimation()
      }

      const resetAnimation = () => {
        animationControls.current = null
      }

      if (!isEmpty(parkingDetails?.parkedCaller?.name)) {
        return {
          key: parkingKey,
          content: (
            <div
              key={parkingKey}
              className='border-b rounded-lg shadow-sm border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 sm:mt-1 relative flex items-center'
            >
              <div className='flex flex-col flex-grow'>
                <div className='flex items-center text-left'>
                  <FontAwesomeIcon
                    icon={faParking}
                    className='h-4 w-4 text-amber-600 dark:text-amber-600'
                    aria-hidden='true'
                  />
                  <span className='text-sm font-semibold text-gray-700 dark:text-gray-100 ml-2'>
                    {t('Parks.Parking')} {parkingDetails.name}
                  </span>
                </div>
                <div className='flex'>
                  <span className='text-sm text-left text-gray-900 dark:text-gray-100'>
                    {parkingDetails.parkedCaller.name}
                  </span>
                </div>
              </div>
              <div className='flex-grow' />
              <div
                className='relative w-20'
                onMouseDown={handleButtonDown}
                onMouseUp={handleButtonUp}
                onMouseLeave={handleButtonUp}
              >
                <Button variant='white'>
                  <FontAwesomeIcon
                    icon={faPhone}
                    className='h-4 w-4 text-gray-500 dark:text-gray-200 mr-2'
                  />
                  <span>{t('Parks.Pick up')}</span>
                </Button>
                <motion.div
                  initial={{ width: 0 }}
                  animate={
                    cardPressStates[index]
                      ? { width: '98%', transition: { duration: 2 } }
                      : { width: 0 }
                  }
                  className='absolute top-0 left-0 w-full h-8 bg-emerald-500 rounded-md overflow-hidden'
                >
                  <motion.button
                    className='w-full h-full bg-transparent text-emerald-500 hover:text-emerald-600 rounded-md focus:outline-none'
                    onMouseDown={handleButtonDown}
                    onMouseUp={handleButtonUp}
                    onMouseLeave={handleButtonUp}
                  >
                    <div className='flex items-center pl-2'>
                      <FontAwesomeIcon
                        icon={faPhone}
                        className='h-4 w-4 text-gray-100 dark:text-gray-200 ml-2 mr-2'
                      />
                      <span className='text-gray-100 text-md'>{t('Parks.Hold')}</span>
                    </div>
                  </motion.button>
                </motion.div>
              </div>
            </div>
          ),
        }
      }
    },
  )

  return (
    <div>
      <SlideCarousel
        cards={parkCardsData.map((card: any) => card?.content)}
        numberOfParkingNotEmpty={parkingInfo.notEmptyParking}
      />
    </div>
  )
}
ParkCards.displayName = 'ParkCards'
