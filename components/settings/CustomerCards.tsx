// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useEffect, useState } from 'react'
import { faIdCardClip } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { Dispatch } from '../../store'
import { getCustomerCardsList, getOrderValues, setUserSettings } from '../../lib/customerCard'
import { Badge, EmptyState } from '../common'
import { isEmpty } from 'lodash'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { getJSONItem, setJSONItem } from '../../lib/storage'

export const CustomerCards = () => {
  const { t } = useTranslation()
  const username = useSelector((state: RootState) => state.user.username)
  const auth = useSelector((state: RootState) => state.authentication)

  const dispatch = useDispatch<Dispatch>()

  const notificationMethods = [
    { id: 'disabled', title: `${t('Settings.Never')}` },
    { id: 'incoming', title: `${t('Settings.On incoming call')}` },
    { id: 'connected', title: `${t('Settings.On answer')}` },
  ]

  const [customerCardSelection, setCustomerCardSelection] = useState('')

  const [customerCardsList, setCustomerCardsList]: any = useState({})
  const [isCustomerCardsListLoaded, setIsCustomerCardsListLoaded] = useState(false)
  const [customerCardError, setCustomerCardError] = useState('')

  //Get user information from store
  const userInformation = useSelector((state: RootState) => state.user)

  //Get ccard information from store
  //Status can be of three types: - disabled - incoming - connected
  const ccardStatus = userInformation.settings?.open_ccard

  // retrieve customer cards
  useEffect(() => {
    async function getCustomerCards() {
      if (!isCustomerCardsListLoaded) {
        try {
          setCustomerCardError('')
          const res = await getCustomerCardsList()
          setCustomerCardsList(res)
        } catch (e) {
          console.error(e)
          setCustomerCardError('Cannot retrieve customer cards list')
        }
        setIsCustomerCardsListLoaded(true)
      }
    }
    getCustomerCards()
  }, [isCustomerCardsListLoaded, customerCardsList])

  // On radio button selection update storage and update settings
  function changeCallDirection(event: any) {
    const newCustomerCardSelection = event.target.id
    setCustomerCardSelection(newCustomerCardSelection)
  }

  //Customer cards list order
  const [customerCardOrder, setCustomerCardOrder]: any = useState([])

  //On radio button or drag and drop update send update settings object
  useEffect(() => {
    async function changeCCardSettings() {
      if (!isEmpty(customerCardOrder) && !isEmpty(customerCardSelection)) {
        const ccardObject = {} as Record<string, any>
        ccardObject.open_ccard = customerCardSelection
        ccardObject.ccard_order = customerCardOrder
        try {
          await setUserSettings(ccardObject)
          dispatch.user.updateSettings(ccardObject)
        } catch (e) {
          console.error(e)
        }
      }
    }
    changeCCardSettings()
  }, [customerCardOrder, customerCardSelection])

  //Get order from local storage
  useEffect(() => {
    const orderValueLocalStorage = getOrderValues(auth.username)
    setCustomerCardOrder(orderValueLocalStorage?.orderValue)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  //Get customer card selection from store
  useEffect(() => {
    if (customerCardSelection == '' && ccardStatus) {
      setCustomerCardSelection(ccardStatus)
    }
  }, [])

  useEffect(() => {
    if (!isEmpty(customerCardsList) && customerCardOrder?.length === 0) {
      const initialOrder = Object.keys(customerCardsList)
      setCustomerCardOrder(initialOrder)
    }
  }, [customerCardsList])

  // Manage drag and drop
  function handleDragEnd(result: any) {
    if (!result.destination) {
      return
    }

    // Get current customer cards list in the current order
    const currentOrder = [...customerCardOrder]

    // Reorder the order depending on drag and drop
    const [removed] = currentOrder.splice(result.source.index, 1)
    currentOrder.splice(result.destination.index, 0, removed)

    // Save new order
    setCustomerCardOrder(currentOrder)

    // Save order inside local storage
    const preferences = getJSONItem(`preferences-${username}`) || {}
    preferences['customerCardOrder'] = currentOrder
    setJSONItem(`preferences-${username}`, preferences)
  }

  return (
    <>
      <section aria-labelledby='phone-configuration-heading'>
        <div className='sm:overflow-hidden w-full dark:bg-gray-900'>
          <div className='bg-white py-6 px-4 sm:p-6 w-full dark:bg-gray-900'>
            {!isEmpty(customerCardsList) ? (
              <div>
                <label className='text-base font-semibold text-gray-900 dark:text-gray-200'>
                  {t('Settings.Customer cards')}
                </label>
                <div className='flex justify-between'>
                  <div className=''>
                    <p className='text-base font-regular text-gray-900 dark:text-gray-200 pt-4'>
                      {t('Settings.Show customer card')}
                    </p>
                    <fieldset className='pt-7'>
                      <legend className='sr-only'>{t('Settings.Customer card show type')}</legend>
                      <div className='space-y-4'>
                        {notificationMethods.map((notificationMethod) => (
                          <div key={notificationMethod.id} className='flex items-center'>
                            <input
                              id={notificationMethod.id}
                              name='notification-method'
                              type='radio'
                              defaultChecked={notificationMethod.id === customerCardSelection}
                              onChange={changeCallDirection}
                              className='h-4 w-4 border-gray-300 text-primary focus:ring-primary dark:text-primaryDark dark:focus:ring-primaryDark'
                            />
                            <label
                              htmlFor={notificationMethod.id}
                              className='ml-3 block text-sm font-medium leading-6 text-gray-900 dark:text-gray-200'
                            >
                              {notificationMethod.title}
                            </label>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                  {/* Vertical divider */}
                  <div className='inline-block w-0.5 self-stretch bg-neutral-100 opacity-100 dark:opacity-50'></div>
                  <div className='w-1/2 pr-4'>
                    <div className='mb-2'>
                      {/* Right section title */}
                      <p className='text-base font-regular text-gray-900 dark:text-gray-200 pt-4'>
                        {t('CustomerCards.Customer Card Order (drag to set your order)')}
                      </p>

                      {/* List header */}
                    </div>

                    <div className='pt-4'>
                      <DragDropContext onDragEnd={handleDragEnd}>
                        <Droppable droppableId='customer-cards'>
                          {(provided) => (
                            <ul {...provided.droppableProps} ref={provided.innerRef}>
                              {customerCardOrder.map((cardId: any, index: any) => (
                                <Draggable key={cardId} draggableId={cardId} index={index}>
                                  {(provided) => (
                                    <>
                                      <li
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className='flex items-center justify-between py-2'
                                      >
                                        {/* Customercard name */}
                                        <div className='flex items-center'>
                                          <span className='mr-4'>
                                            <FontAwesomeIcon
                                              icon={faIdCardClip}
                                              className='h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                                            />
                                          </span>
                                          {customerCardsList[cardId]?.descr}
                                        </div>

                                        {/* Order position */}
                                        <Badge
                                          size='small'
                                          variant='offline'
                                          rounded='full'
                                          className='ml-2 overflow-hidden'
                                        >
                                          <span>{index + 1}</span>
                                        </Badge>
                                      </li>
                                      {/* Divider */}
                                      <div className='relative'>
                                        <div
                                          className='absolute inset-0 flex items-center'
                                          aria-hidden='true'
                                        >
                                          <div className='w-full border-t  border-gray-300 dark:border-gray-600' />
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                            </ul>
                          )}
                        </Droppable>
                      </DragDropContext>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title={t('Settings.No customer cards available')}
                description={t('Settings.Create a new customer card') || ''}
                icon={
                  <FontAwesomeIcon
                    icon={faIdCardClip}
                    className='mx-auto h-12 w-12'
                    aria-hidden='true'
                  />
                }
              />
            )}
          </div>
        </div>
      </section>
    </>
  )
}
