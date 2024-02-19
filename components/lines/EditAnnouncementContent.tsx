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
import { InlineNotification, SideDrawerCloseIcon, Dropdown } from '../common'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faFileAudio,
  faTriangleExclamation,
  faEllipsisVertical,
  faTrashCan,
  faXmark,
  faCircleXmark,
  faFloppyDisk,
} from '@fortawesome/free-solid-svg-icons'
import { closeSideDrawer, formatFileSize } from '../../lib/utils'
import { TextInput, Button, Modal } from '../common'
import {
  uploadAudioMsg,
  reloadAnnouncement,
  recordingAnnouncement,
  modifyMsg,
  deleteMsg,
} from '../../lib/lines'

export interface EditAnnouncementContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const EditAnnouncementDrawerContent = forwardRef<
  HTMLButtonElement,
  EditAnnouncementContentProps
>(({ config, className, ...props }, ref) => {
  const { t } = useTranslation()
  const [errorMessage, setErrorMessage] = useState('')
  const [textFilter, setTextFilter] = useState('')
  const [selectedType, setSelectedType] = useState('private')
  const [errorUpload, setErrorUpload] = useState(false)
  const textFilterRef = useRef() as React.MutableRefObject<HTMLInputElement>
  const [selectedFile, setSelectedFile] = useState<any>(null)
  const [selectedFileBase64, setSelectedFileBase64] = useState<any>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteAnnouncementId, setDeleteAnnouncementId] = useState(null)

  const [uploadAudioMessageError, setUploadAudioMessageError] = useState('')

  const [firstRender, setFirstRender] = useState(true)
  const cancelButtonRef: RefObject<HTMLButtonElement> = createRef()

  const contactMenuItems = (
    <>
      <Dropdown.Item icon={faTrashCan} onClick={() => deleteAnnouncement(config.announcement_id)}>
        {t('Common.Delete')}
      </Dropdown.Item>
    </>
  )

  const deleteAnnouncement = (announcementId: any) => {
    setShowDeleteModal(true)
    setDeleteAnnouncementId(announcementId)
  }

  const [deleteAudioMessageError, setDeleteAudioMessageError] = useState('')

  async function closedModalDeleteAnnouncement() {
    if (deleteAnnouncementId) {
      try {
        await deleteMsg(deleteAnnouncementId)
      } catch (error) {
        setDeleteAudioMessageError('Cannot play announcement')
        return
      }
    }
    setShowDeleteModal(false)
  }

  useEffect(() => {
    if (firstRender) {
      setFirstRender(false)
      return
    }
    if (config.isEdit) {
      setSelectedType(config.privacy)
      setTextFilter(config.description)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstRender])

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

  async function saveCreatePhoneLines() {
    let createAnnouncementObj = {}
    if (textFilter && selectedType && selectedFileBase64) {
      createAnnouncementObj = {
        audio_content: selectedFileBase64,
        description: textFilter,
        privacy: selectedType,
      }
      if (createAnnouncementObj) {
        try {
          await uploadAudioMsg(createAnnouncementObj)
        } catch (error) {
          setUploadAudioMessageError('Cannot upload announcement')
          return
        }
      }
    }
    reloadAnnouncement()
    closeSideDrawer()
  }

  async function saveEditPhoneLines() {
    let editAnnouncementObj = {}
    if (textFilter && selectedType && config.announcement_id) {
      editAnnouncementObj = {
        description: textFilter,
        id: config.announcement_id.toString(),
        privacy: selectedType,
      }

      if (editAnnouncementObj) {
        try {
          await modifyMsg(editAnnouncementObj)
        } catch (error) {
          setUploadAudioMessageError('Cannot edit announcement')
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

  return (
    <>
      <div className='bg-gray-100 dark:bg-gray-800 py-6 px-6'>
        <div className='flex items-center justify-between'>
          <div className='text-lg font-medium text-gray-700 dark:text-gray-200'>
            {config.isEdit ? t('Lines.Announcement details') : t('Lines.Add announcement')}
          </div>
          <div className='flex items-center h-7'>
            <SideDrawerCloseIcon />
          </div>
        </div>
      </div>
      <div className={classNames(className, 'p-5')} {...props}>
        {config.isEdit && (
          <div className='flex justify-end'>
            {/* delete announcement Dropdown menu */}
            <Dropdown items={contactMenuItems} position='left' divider={true} className='mr-1'>
              <Button variant='ghost'>
                <FontAwesomeIcon icon={faEllipsisVertical} className='h-4 w-4' />
                <span className='sr-only'>Open contact menu</span>
              </Button>
            </Dropdown>
          </div>
        )}

        {/* announcement name */}
        <div className='flex flex-col'>
          <h4 className='text-base font-medium text-gray-700 dark:text-gray-200 mb-3'>
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
          <h4 className='text-base font-medium text-gray-700 dark:text-gray-200'>
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
                    className={`h-4 w-4 border-gray-300 text-primary dark:text-primaryDark focus:ring-primary dark:focus:ring-primaryDark ${
                      selectedType === dateRuleInformation.id
                        ? 'dark:bg-primaryLight dark:text-primary dark:border-gray-600'
                        : 'dark:bg-gray-700 dark:text-white dark:border-gray-600'
                    }`}
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
        {!config.isEdit && (
          <>
            {/* Announcement name section */}
            <div className='flex items-center justify-between mt-8'>
              <h4 className='text-base font-medium text-gray-700 dark:text-gray-200'>
                {t('Lines.Select audio file')}
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
                        icon={faFileAudio}
                        className='w-10 h-10 mb-3 text-gray-400 dark:text-gray-200'
                      />
                      <p className='mb-2 text-base text-gray-900 dark:text-gray-100'>
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
              </>
            ) : (
              <>
                <div className='py-3'>
                  <div className='rounded-md border border-emerald-500'>
                    <div className='flex items-center justify-between py-4 pl-3 pr-4'>
                      <div className='flex w-0 flex-1 items-center pl-2'>
                        <div className='h-9 w-9 bg-emerald-50 dark:bg-emerald-200 flex items-center rounded-sm justify-center'>
                          <FontAwesomeIcon
                            icon={faFileAudio}
                            className='h-4 w-4 text-primary dark:text-primaryDark'
                            aria-hidden='true'
                            onClick={() => recordingAnnouncement()}
                          />
                        </div>
                        <div className='text-base flex flex-col pl-3'>
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
          </>
        )}

        {/* fixed bottom-0 */}
        <div className='flex mt-7'>
          {config.isEdit ? (
            <>
              <Button variant='primary' type='submit' onClick={saveEditPhoneLines} className='mb-4'>
                <FontAwesomeIcon icon={faFloppyDisk} className='mr-2 h-4 w-4' />
                {t('Common.Save')}
              </Button>
              <Button variant='white' type='submit' onClick={closeSideDrawer} className='ml-4 mb-4'>
                {t('Common.Cancel')}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant='primary'
                type='submit'
                onClick={saveCreatePhoneLines}
                className='mb-4'
                disabled={!selectedFile || !textFilter ? true : false}
              >
                <FontAwesomeIcon icon={faFloppyDisk} className='mr-2 h-4 w-4' />
                {t('Common.Save')}
              </Button>
              <Button variant='white' type='submit' onClick={closeSideDrawer} className='ml-4 mb-4'>
                {t('Common.Cancel')}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Delete announcement modal */}
      <Modal
        show={showDeleteModal}
        focus={cancelButtonRef}
        onClose={() => setShowDeleteModal(false)}
      >
        <Modal.Content>
          <div className='mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0'>
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className='h-5 w-5 text-red-600'
              aria-hidden='true'
            />
          </div>
          <div className='mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left'>
            <h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-200'>
              {t('Lines.Delete announcement')}
            </h3>
            <div className='mt-2'>
              <p className='text-sm text-gray-500'>
                {t('Lines.Are you sure to delete selected announcement?')}
              </p>
            </div>
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button variant='danger' onClick={() => closedModalDeleteAnnouncement()}>
            {t('Common.Delete')}
          </Button>
          <Button variant='white' onClick={() => setShowDeleteModal(false)} ref={cancelButtonRef}>
            {t('Common.Cancel')}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  )
})

EditAnnouncementDrawerContent.displayName = 'EditAnnouncementDrawerContent'
