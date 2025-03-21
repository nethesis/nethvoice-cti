// Copyright (C) 2024 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import {
  ComponentPropsWithRef,
  forwardRef,
  useState,
  useEffect,
} from 'react'
import { InlineNotification, SideDrawerCloseIcon } from '../common'
import { useTranslation } from 'react-i18next'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faXmark,
  faFileArrowUp,
} from '@fortawesome/free-solid-svg-icons'
import { closeSideDrawer, formatFileSize } from '../../lib/utils'
import { Button } from '../common'
import {
  reloadAnnouncement,
  recordingAnnouncement,
} from '../../lib/lines'
import { RootState } from '../../store'
import { useSelector } from 'react-redux'
import { uploadVoicemailGreetingMessage, deleteVoicemailGreetingMessage } from '../../services/voicemail'

export interface EditVoicemailContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const UploadVoicemail = forwardRef<HTMLButtonElement, EditVoicemailContentProps>(
  ({ config }) => {
    console.log(config)
    const { t } = useTranslation()

    const [selectedType, setSelectedType] = useState('greet')
    const [errorUpload, setErrorUpload] = useState(false)
    const [errorFormatMessage, setErrorFormatMessage] = useState('')
    const [selectedFile, setSelectedFile] = useState<any>(null)
    const [selectedFileBase64, setSelectedFileBase64] = useState<any>(null)
    const [uploadAudioMessageError, setUploadAudioMessageError] = useState('')

    const user = useSelector((state: RootState) => state.user)

    // Load recorded file if available when component mounts
    useEffect(() => {
      if (config.isRecorded && config.audioFileURL) {
        loadRecordedFile()
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [config.isRecorded, config.audioFileURL])

    // Function to load the recorded file from the phone island
    const loadRecordedFile = async () => {
      try {
        // Fetch the file from the URL provided
        const response = await fetch(config.audioFileURL)
        const blob = await response.blob()
        
        // Create a File object from the blob
        const file = new File([blob], config.tempFileName || 'recorded-audio.wav', { 
          type: 'audio/wav'
        })
        
        // Process the file as if it was uploaded
        await processAudioFile(file)
      } catch (error) {
        console.error("Error loading recorded file:", error)
        setErrorUpload(true)
        setErrorFormatMessage(t('Settings.Could not load recorded file') || '')
      }
    }

    const dateRuleInformations = [
      { id: 'greet', value: t('Settings.Greeating status') },
      { id: 'busy', value: t('Settings.Busy status') },
      { id: 'unavail', value: t('Settings.Unavailable status') },
    ]

    // Function to validate audio file format
    const validateAudioFormat = (file: File): Promise<boolean> => {
      return new Promise((resolve) => {
      if (!file.type.includes('audio/wav') && !file.type.includes('audio/x-wav') && !file.type.includes('audio/mpeg')) {
        setErrorFormatMessage(t('Settings.File must be in WAV or MP3 format') || '')
        resolve(false)
        return
      }
      // File is valid
      setErrorFormatMessage('')
      resolve(true)
      })
    }

    // Process audio file - common function for both drop and select
    async function processAudioFile(file: File) {
      if (file && file.type.includes('audio/')) {
        const isValidFormat = await validateAudioFormat(file)
        
        if (isValidFormat) {
          setSelectedFile(file)
          const reader = new FileReader()

          reader.readAsDataURL(file)
          reader.onloadend = () => {
            // Extract pure base64 string by removing the data URL prefix
            const result = reader.result as string
            const base64Content = result.split(',')[1] // Get only the part after the comma
            setSelectedFileBase64(base64Content)
          }
          if (errorUpload) {
            setErrorUpload(false)
          }
          return true
        } else {
          setErrorUpload(true)
          setSelectedFile(null)
          setSelectedFileBase64(null)
          return false
        }
      } else {
        setErrorUpload(true)
        setErrorFormatMessage(t('Settings.File must be an audio file') || '')
        return false
      }
    }

    function handleDragOver(event: React.DragEvent<HTMLLabelElement>) {
      event.preventDefault()
      event.stopPropagation()
      event.dataTransfer.dropEffect = 'copy'
    }

    async function handleDrop(event: React.DragEvent<HTMLLabelElement>) {
      event.preventDefault()
      event.stopPropagation()

      const file = event.dataTransfer.files && event.dataTransfer.files[0]
      if (file) {
        await processAudioFile(file)
      }
    }

    async function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
      event.preventDefault()
      const file = event.target.files && event.target.files[0]
      if (file) {
        await processAudioFile(file)
      }
    }

    function changeTypeSelected(event: any) {
      const radioButtonTypeSelected = event.target.id
      setSelectedType(radioButtonTypeSelected)
    }

    function deleteUploadedAnnouncement() {
      setSelectedFile(null)
    }

    async function saveCreatePhoneSettings() {
      if (selectedFileBase64) {
        try {
          // First try to delete any existing greeting message
          try {
            await deleteVoicemailGreetingMessage(selectedType)
            // If deletion succeeds, we can proceed with the upload
          } catch (error) {
            // If deletion fails (e.g., no existing message), we still proceed with the upload
            console.log('Deletion failed, but continuing with upload:', error)
          }
          
          // Proceed with upload regardless of deletion outcome
          console.log(selectedFileBase64)
          await uploadVoicemailGreetingMessage(selectedType, selectedFileBase64)
        } catch (error) {
          setUploadAudioMessageError(t('Settings.Cannot upload message') || '')
          return
        }
      }
      reloadAnnouncement()
      // Call the onClose callback in addition to closing the drawer
      if (config.onClose && typeof config.onClose === 'function') {
        config.onClose()
      }
      closeSideDrawer()
    }

    // Handle closing the drawer with config callback
    const handleClose = () => {
      // Call the onClose callback if provided in config
      if (config.onClose && typeof config.onClose === 'function') {
        config.onClose()
      }
      // Always close the side drawer
      closeSideDrawer()
    }

    //Start recording announcement function
    const startRecordingAnnouncement = () => {
      if (user.default_device.type === 'physical') {
        recordingAnnouncement('physical')
      } else {
        recordingAnnouncement('webrtc')
      }
    }

    return (
      <>
        <div className='bg-white dark:bg-gray-900 pt-6 px-6'>
          <div className='flex items-center justify-between'>
            <div className='text-lg font-medium text-gray-700 dark:text-gray-200'>
              {config.isEdit ? t('Settings.Announcement details') : t('Settings.Upload message')}
            </div>
            <div className='flex items-center h-7'>
              <SideDrawerCloseIcon onClick={handleClose} />
            </div>
          </div>
        </div>
        <div className='px-5'>
          {/* Divider */}
          <div className='relative pb-8'>
            <div className='absolute inset-0 flex items-center' aria-hidden='true'>
              <div className='w-full border-t border-gray-300 dark:border-gray-600' />
            </div>
          </div>

          {!config.isEdit && (
            <>
              {/* Message name section */}
              <div className='flex items-center justify-between mt-2'>
                <h4 className='text-base font-medium text-gray-700 dark:text-gray-200'>
                  {config.isRecorded 
                    ? t('Settings.Recorded audio file') 
                    : t('Settings.Audio file')}
                </h4>
              </div>
              
              {/* Upload error */}
              {errorUpload && (
                <InlineNotification
                  title={errorFormatMessage || t('Settings.Wrong file type')}
                  type='error'
                  className='mt-2'
                ></InlineNotification>
              )}
              
              {/* Display upload message error if exists */}
              {uploadAudioMessageError && (
                <InlineNotification
                  title={uploadAudioMessageError}
                  type='error'
                  className='mt-2'
                ></InlineNotification>
              )}
              
              {/* If the file hasn't been uploaded yet */}
              {!selectedFile ? (
                <>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center justify-center w-full mt-2'>
                      <label
                        htmlFor='dropzone-file'
                        className='flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-100 dark:hover:bg-gray-700 dark:bg-gray-800 hover:bg-gray-200 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                      >
                        <div className='flex flex-col items-center justify-center pt-6 text-gray-600 dark:text-gray-300'>
                          <FontAwesomeIcon icon={faFileArrowUp} className='w-8 h-8 mb-4' />
                          <p className='mb-4 text-base font-medium'>
                            {t('Settings.Drag and drop or click to upload')}
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
                    <span className='text-xs font-poppins font-normal text-gray-600 dark:text-gray-100'>
                      {t('Settings.Accepted formats')}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className='py-3'>
                    <div className='rounded-md border-2 border-gray-400 bg-gray-200 dark:bg-gray-700 dark:border-gray-500'>
                      <div className='flex items-center justify-between py-4 pl-3 pr-4'>
                        <div className='flex w-0 flex-1 items-center pl-2'>
                          <div className='h-9 w-9 bg-gray-100 dark:bg-gray-800 flex items-center rounded justify-center'>
                            <FontAwesomeIcon
                              icon={faFileArrowUp}
                              className='h-4 w-4 text-gray-600 dark:text-gray-300'
                              aria-hidden='true'
                              onClick={() => startRecordingAnnouncement()}
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
                              className='h-4 w-4 text-gray-600 dark:text-gray-300'
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

          {/* Privacy name section */}
          <div className='flex items-center justify-between mt-8'>
            <h4 className='text-base font-medium text-gray-700 dark:text-gray-200'>
              {t('Settings.Message category')}
            </h4>
          </div>
          {/* Radio button for privacy selection */}
          <fieldset className='mt-2'>
            <div className='space-y-4'>
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
                      defaultChecked={dateRuleInformation.id === 'greet'}
                      className={`h-4 w-4 border-gray-300 text-primary dark:text-primaryDark focus:ring-primary dark:focus:ring-primaryDark ${
                        selectedType === dateRuleInformation.id
                          ? 'dark:bg-primaryLight dark:text-primaryDark dark:border-gray-600'
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

          {/* Divider */}
          <div className='relative pb-10 pt-6'>
            <div className='absolute inset-0 flex items-center' aria-hidden='true'>
              <div className='w-full border-t border-gray-300 dark:border-gray-600' />
            </div>
          </div>
          {/* fixed bottom-0 */}
          <div className='flex justify-end'>
            <Button variant='ghost' type='submit' onClick={handleClose} className='mb-4'>
              {t('Common.Cancel')}
            </Button>
            <Button
              variant='primary'
              type='submit'
              onClick={saveCreatePhoneSettings}
              className='ml-4 mb-4'
              disabled={!selectedFile ? true : false}
            >
              {t('Common.Save')}
            </Button>
          </div>
        </div>
      </>
    )
  },
)

UploadVoicemail.displayName = 'UploadVoicemail'
