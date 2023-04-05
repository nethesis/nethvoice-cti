// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  ComponentPropsWithRef,
  forwardRef,
  useEffect,
  useState,
  useRef,
  createRef,
  RefObject,
} from 'react'
import classNames from 'classnames'
import { InlineNotification, SideDrawerCloseIcon } from '../common'

import { useTranslation } from 'react-i18next'
import {
  faFloppyDisk,
  faCircleXmark,
  faFileMusic,
  faMicrophone,
  faXmark,
} from '@nethesis/nethesis-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { callPhoneNumber, closeSideDrawer } from '../../lib/utils'
import { TextInput, Button, Modal } from '../common'
import { isEmpty } from 'lodash'
import { uploadAudioMsg, reloadAnnouncement, enableMsg } from '../../lib/lines'
export interface ShowAddAnnouncementContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const ShowAddAnnouncementDrawerContent = forwardRef<
  HTMLButtonElement,
  ShowAddAnnouncementContentProps
>(({ config, className, ...props }, ref) => {
  const { t } = useTranslation()
  const [errorMessage, setErrorMessage] = useState('')
  const [textFilter, setTextFilter] = useState('')
  const [selectedType, setSelectedType] = useState('private')
  const [errorUpload, setErrorUpload] = useState(false)
  const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [selectedFileBase64, setSelectedFileBase64] = useState<any>(null)

  const [uploadAudioMessageError, setUploadAudioMessageError] = useState('')

  const dateRuleInformations = [
    { id: 'public', value: t('Lines.Public') },
    { id: 'private', value: t('Lines.Private') },
  ]

  const clearTextFilter = () => {
    setTextFilter('')
    textFilterRef.current.focus()
  }

  function handleDragOver(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    event.stopPropagation()
    event.dataTransfer.dropEffect = 'copy'
  }

  function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    event.stopPropagation()

    const file = event.dataTransfer.files && event.dataTransfer.files[0]

    if (file && file.type.includes('audio/')) {
      setSelectedFile(file)
      const reader = new FileReader()

      reader.readAsDataURL(file)
      reader.onloadend = () => {
        setSelectedFileBase64(reader.result)
      }
      if (errorUpload) {
        setErrorUpload(false)
      }
    } else {
      setErrorUpload(true)
      // return
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    event.preventDefault()
    const file = event.target.files && event.target.files[0]

    if (file && file.type.includes('audio/')) {
      setSelectedFile(file)
      const reader = new FileReader()

      reader.readAsDataURL(file)
      reader.onloadend = () => {
        setSelectedFileBase64(reader.result)
      }
      if (errorUpload) {
        setErrorUpload(false)
      }
    } else {
      setErrorUpload(true)
    }
  }

  function changeTypeSelected(event: any) {
    const radioButtonTypeSelected = event.target.id
    setSelectedType(radioButtonTypeSelected)
  }

  function deleteUploadedAnnouncement() {
    setSelectedFile(null)
  }

  async function saveEditPhoneLines() {
    let editPhoneLinesObj = {}
    if (textFilter && selectedType && selectedFileBase64) {
      editPhoneLinesObj = {
        audio_content: selectedFileBase64,
        description: textFilter,
        privacy: selectedType,
      }
      if (editPhoneLinesObj) {
        try {
          await uploadAudioMsg(editPhoneLinesObj)
        } catch (error) {
          setUploadAudioMessageError('Cannot upload announcement')
          return
        }
      }
    }
    reloadAnnouncement()
    closeSideDrawer()
  }

  function changeTextFilter(event: any) {
    const newTextFilter = event.target.value
    setTextFilter(newTextFilter)
  }

  function recordAudioAnnouncement() {
    //TO DO RECORD FILE AUDIO
  }

  function formatFileSize(sizeInBytes: any) {
    const units = ['B', 'KB', 'MB', 'GB', 'TB']
    let size = sizeInBytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    const sizeFormatted = size.toFixed(2)
    const unit = units[unitIndex]

    return `${sizeFormatted} ${unit}`
  }

  const [isRecordingActive, setIsRecordingActive] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsRecordingActive(false)
  }
  const descriptionModalInputRef: RefObject<HTMLInputElement> = createRef()

  const closedModalSaved = () => {
    setIsRecordingActive(false)
    enableAnnouncement()
  }

  const [modalAnnouncementType, setModalAnnouncementType] = useState('')
  function changeAnnouncementModalTypeSelected(event: any) {
    const radioButtonTypeSelected = event.target.id
    setModalAnnouncementType(radioButtonTypeSelected)
  }

  const [inputTextModal, setInputTextModal] = useState('')
  const [enableAnnouncementError, setEnableAnnouncementError] = useState('')

  const enableAnnouncement = async () => {
    let objectEnableAnnouncement = {
      description: inputTextModal,
      privacy: modalAnnouncementType,
      tempFIleName: '',
    }
    try {
      await enableMsg(objectEnableAnnouncement)
    } catch (error) {
      setEnableAnnouncementError('Cannot enable announcement')
      return
    }
  }

  return (
    <>
      <div className='bg-gray-100 dark:bg-gray-800 py-6 px-6'>
        <div className='flex items-center justify-between'>
          <div className='text-lg font-medium text-gray-700 dark:text-gray-200'>
            {t('Lines.Add announcement')}
          </div>
          <div className='flex items-center h-7'>
            <SideDrawerCloseIcon />
          </div>
        </div>
      </div>
      <div className={classNames(className, 'p-5')} {...props}>
        {/* announcement name */}
        <div className='flex flex-col'>
          <h4 className='text-md font-medium text-gray-700 dark:text-gray-200 mb-3'>
            {t('Lines.Announcement name')}
          </h4>
          <TextInput
            placeholder={t('Lines.Insert announcement name') || ''}
            value={textFilter}
            onChange={changeTextFilter}
            ref={textFilterRef}
            icon={textFilter.length ? faCircleXmark : undefined}
            onIconClick={() => clearTextFilter()}
            trailingIcon={true}
          />
        </div>
        {/* Privacy name section */}
        <div className='flex items-center justify-between mt-8'>
          <h4 className='text-md font-medium text-gray-700 dark:text-gray-200'>
            {t('Lines.Privacy')}
          </h4>
        </div>
        {/* Radio button for privacy selection */}
        <fieldset className='mt-2'>
          <legend className='sr-only'>Announcement type</legend>
          <div className='space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10'>
            {dateRuleInformations.map((dateRuleInformation) => (
              <div key={dateRuleInformation.id} className='flex items-center justify-between mt-1'>
                <div className='flex items-center'>
                  <input
                    id={dateRuleInformation.id}
                    name='date-select'
                    type='radio'
                    defaultChecked={dateRuleInformation.id === 'private'}
                    className='h-4 w-4 border-gray-300 text-primary dark:border-gray-600 focus:ring-primaryLight dark:focus:ring-primaryDark dark:text-primary'
                    onChange={changeTypeSelected}
                  />
                  <label
                    htmlFor={dateRuleInformation.id}
                    className='ml-3 block text-sm font-medium leading-6 text-gray-700 dark:text-gray-200'
                  >
                    {dateRuleInformation.value}
                  </label>
                </div>
              </div>
            ))}
          </div>
        </fieldset>
        {/* Announcement name section */}
        <div className='flex items-center justify-between mt-8'>
          <h4 className='text-md font-medium text-gray-700 dark:text-gray-200'>
            {t('Lines.Announcement')}
          </h4>
        </div>
        {/* Upload announcement section */}
        {/* Upload error */}
        {errorUpload && (
          <InlineNotification
            title={t('Lines.Wrong file type')}
            type='error'
            className='mt-2'
          ></InlineNotification>
        )}
        {/* If the file hasn't been uploaded yet */}
        {!selectedFile ? (
          <>
            <div className='flex items-center justify-center w-full mt-2'>
              <label
                htmlFor='dropzone-file'
                className='flex flex-col items-center justify-center w-full py-2 border-2 border-primary border-dashed rounded-lg cursor-pointer bg-emerald-50 dark:hover:bg-emerald-800 dark:bg-primaryDark hover:bg-emerald-100 dark:border-gray-400 dark:hover:border-gray-500 '
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <div className='flex flex-col items-center justify-center pt-5 pb-6'>
                  <FontAwesomeIcon
                    icon={faFileMusic}
                    className='w-10 h-10 mb-3 text-gray-400 dark:text-gray-200'
                  />
                  <p className='mb-2 text-md text-gray-900 dark:text-gray-100'>
                    <span className='font-normal'>
                      {t('Lines.Select or drag an audio file here')}
                    </span>
                  </p>
                </div>
                <input
                  id='dropzone-file'
                  type='file'
                  className='hidden'
                  onChange={handleFileSelect}
                />
              </label>
            </div>
            <div className='flex items-center pt-2'>
              <span className='flex justify-center py-6'>{t('Common.or')}</span>
              <div className='ml-8'>
                <Button variant='white'>
                  <FontAwesomeIcon
                    icon={faMicrophone}
                    className='h-4 w-4 mr-2 text-gray-500 dark:text-gray-500'
                    aria-hidden='true'
                    onClick={() => recordAudioAnnouncement()}
                  />{' '}
                  {t('Lines.Record now')}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className='py-3'>
              <div className='rounded-md border border-emerald-500'>
                <div className='flex items-center justify-between py-4 pl-3 pr-4'>
                  <div className='flex w-0 flex-1 items-center pl-2'>
                    <div className='h-9 w-9 bg-emerald-50 dark:bg-emerald-200 flex items-center rounded-sm justify-center'>
                      <FontAwesomeIcon
                        icon={faFileMusic}
                        className='h-4 w-4 text-primary dark:text-primaryDark'
                        aria-hidden='true'
                        // onClick={() => recordAudioAnnouncement()}
                      />
                    </div>
                    <div className='text-md flex flex-col pl-3'>
                      <span className='font-semibold text-gray-900 dark:text-gray-100'>
                        {selectedFile.name}
                      </span>
                      <span className='text-sm'>{formatFileSize(selectedFile.size)}</span>
                    </div>
                  </div>
                  <div className='ml-4 flex-shrink-0'>
                    <Button variant='ghost' onClick={() => deleteUploadedAnnouncement()}>
                      <FontAwesomeIcon
                        icon={faXmark}
                        className='h-4 w-4 text-gray-500 dark:text-gray-500'
                        aria-hidden='true'
                      />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* fixed bottom-0 */}
        <div className='flex mt-7'>
          <Button
            variant='primary'
            type='submit'
            onClick={saveEditPhoneLines}
            className='mb-4'
            disabled={!selectedFile ? true : false}
          >
            <FontAwesomeIcon icon={faFloppyDisk} className='mr-2 h-4 w-4' />
            {t('Common.Save')}
          </Button>
          <Button variant='white' type='submit' onClick={closeSideDrawer} className='ml-4 mb-4'>
            {t('Common.Cancel')}
          </Button>
        </div>
      </div>
      <Modal
        show={isRecordingActive}
        focus={descriptionModalInputRef}
        onClose={() => setIsRecordingActive(false)}
      >
        <form onSubmit={handleSubmit}>
          <Modal.Content>
            <div className='mt-3 text-center sm:mt-0 sm:text-left w-full'>
              <h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-200'>
                {t('Lines.Enter announcement information')}
              </h3>
              <div className='mt-3 flex flex-col gap-2'>
                <TextInput
                  placeholder={t('Lines.Description') || ''}
                  name='number'
                  ref={descriptionModalInputRef}
                  value={inputTextModal}
                  onChange={(event) => setInputTextModal(event.target.value)}
                />
              </div>
              {/* Privacy name section */}
              <div className='flex items-center justify-between mt-3'>
                <h4 className='text-md font-medium text-gray-700 dark:text-gray-200'>
                  {t('Lines.Privacy')}
                </h4>
              </div>
              {/* Radio button for privacy selection */}
              <fieldset className='mt-2'>
                <legend className='sr-only'>Announcement type</legend>
                <div className='space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-10'>
                  {dateRuleInformations.map((dateRuleInformation) => (
                    <div
                      key={dateRuleInformation.id}
                      className='flex items-center justify-between mt-1'
                    >
                      <div className='flex items-center'>
                        <input
                          id={dateRuleInformation.id}
                          name='date-select'
                          type='radio'
                          defaultChecked={dateRuleInformation.id === 'private'}
                          className='h-4 w-4 border-gray-300 text-primary dark:border-gray-600 focus:ring-primaryLight dark:focus:ring-primaryDark dark:text-primary'
                          onChange={changeAnnouncementModalTypeSelected}
                        />
                        <label
                          htmlFor={dateRuleInformation.id}
                          className='ml-3 block text-sm font-medium leading-6 text-gray-700 dark:text-gray-200'
                        >
                          {dateRuleInformation.value}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>
          </Modal.Content>
          <Modal.Actions>
            <Button variant='primary' disabled={!inputTextModal} onClick={() => closedModalSaved()}>
              {t('Common.Save')}
            </Button>
            <Button variant='white' onClick={() => setIsRecordingActive(false)}>
              {t('Common.Cancel')}
            </Button>
          </Modal.Actions>
        </form>
      </Modal>
    </>
  )
})

ShowAddAnnouncementDrawerContent.displayName = 'ShowAddAnnouncementDrawerContent'
