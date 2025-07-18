// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { useState, useEffect, useRef, RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import {
  faShield,
  faQrcode,
  faKey,
  faTriangleExclamation,
  faCircleNotch,
  faCircleCheck,
  faEye,
  faEyeSlash,
  faCopy,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, Modal, InlineNotification, OTPInput } from '../common'
import type { OTPInputRef } from '../common/OTPInput'
import { RootState } from '../../store'
import {
  getTwoFactorStatus,
  otpVerify,
  getQRcode,
  disableTwoFactor,
} from '../../services/twoFactor'
import dynamic from 'next/dynamic'
import { TwoFactorSetupResponse } from '../../services/types/twoFactor'
import { updateAuthStore } from '../../lib/login'
import axios from 'axios'
import { updateAxiosToken } from '../../config/axios'

const QRCode = dynamic(() => import('./QRCode'), {
  ssr: false,
})

export const Authentication = () => {
  const { t } = useTranslation()
  const auth = useSelector((state: RootState) => state.authentication)

  // State management
  const [isEnabled, setIsEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [showDisableModal, setShowDisableModal] = useState(false)
  const [setupData, setSetupData] = useState<TwoFactorSetupResponse | null>(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [totpCode, setTotpCode] = useState('')
  const [secretVisible, setSecretVisible] = useState(false)
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)

  const cancelButtonRef: RefObject<HTMLButtonElement> = useRef(null)
  const otpInputRef: RefObject<OTPInputRef> = useRef(null)
  const disableCancelButtonRef: RefObject<HTMLButtonElement> = useRef(null)

  const authenticationStore = useSelector((state: RootState) => state.authentication)

  // Load 2FA status on component mount
  useEffect(() => {
    loadTwoFactorStatus()
  }, [])

  const loadTwoFactorStatus = async () => {
    try {
      setIsLoading(true)
      const response = await getTwoFactorStatus()
      setIsEnabled(response.status)
    } catch (error) {
      console.error('Error loading 2FA status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Inizialize setup
  const handleSetupStart = async () => {
    try {
      setIsProcessing(true)
      setError('')
      setCurrentStep(1)
      setShowSetupModal(true)
    } catch (error) {
      setError(t('Settings.Error initializing 2FA setup') || 'Error initializing 2FA setup')
    } finally {
      setIsProcessing(false)
    }
  }

  // Step 1: Fetch setup data
  const getSetupData = async () => {
    try {
      setIsProcessing(true)
      setError('')
      const data = await getQRcode()
      setSetupData(data)
      setCurrentStep(2)
    } catch (error) {
      setError(t('Settings.Error fetching setup data') || 'Error fetching setup data')
    } finally {
      setIsProcessing(false)
    }
  }

  // Step 3: Enable 2FA with TOTP code
  const handleEnable2FA = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setError(
        t('Settings.Please enter a valid 6-digit code') || 'Please enter a valid 6-digit code',
      )
      return
    }

    try {
      setIsProcessing(true)
      setError('')
      const response = await otpVerify(authenticationStore.username, totpCode)
      if (response?.code === 200) {
        updateAxiosToken(response.data.token)
        updateAuthStore(authenticationStore.username, response.data.token)
      }

      handleNextStep()
    } catch (error) {
      setError(
        t('Settings.Invalid verification code. Please try again.') ||
          'Invalid verification code. Please try again.',
      )
    } finally {
      setIsProcessing(false)
    }
  }

  // Step 4: Complete setup
  const completeSetup = () => {
    setIsEnabled(true)
    setShowSetupModal(false)
    resetModalState()
  }

  const handleDisable2FA = async () => {
    if (!totpCode || totpCode.length !== 6) {
      setError(
        t('Settings.Please enter a valid 6-digit code') || 'Please enter a valid 6-digit code',
      )
      return
    }

    try {
      setIsProcessing(true)
      setError('')

      const response = await disableTwoFactor(totpCode)
      if (response?.code === 200) {
        updateAxiosToken(response.data.token)
        updateAuthStore(authenticationStore.username, response.data.token)
        setIsEnabled(false)
        setShowDisableModal(false)
        resetModalState()
      }
    } catch (error) {
      setError(
        t('Settings.Invalid verification code. Please try again.') ||
          'Invalid verification code. Please try again.',
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
      if (currentStep === 3) {
        // Focus TOTP input when moving to verification step
        setTimeout(() => otpInputRef.current?.focus(), 100)
      }
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      setError('')
    }
  }

  const downloadBackupCodes = () => {
    const content = backupCodes.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = '2fa-backup-codes.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const resetModalState = () => {
    setCurrentStep(1)
    setTotpCode('')
    setError('')
    setSetupData(null)
    setBackupCodes([])
    setSecretVisible(false)
  }

  const closeSetupModal = () => {
    setShowSetupModal(false)
    setTimeout(() => {
      resetModalState()
    }, 1000)
  }

  const closeDisableModal = () => {
    setShowDisableModal(false)
    setTimeout(() => {
      resetModalState()
    }, 1000)
  }

  // Auto focus OTP input when disable modal opens
  useEffect(() => {
    if (showDisableModal) {
      setTimeout(() => otpInputRef.current?.focus(), 100)
    }
  }, [showDisableModal])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (isLoading) {
    return (
      <section aria-labelledby='authentication-heading'>
        <div className='sm:overflow-hidden w-full'>
          <div className='py-6 px-4 sm:p-6 w-full'>
            <div className='flex items-center justify-center py-8'>
              <FontAwesomeIcon icon={faCircleNotch} className='fa-spin h-8 w-8 text-gray-400' />
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section aria-labelledby='authentication-heading'>
        <div className='sm:overflow-hidden w-full'>
          <div className='py-6 px-4 sm:p-6 w-full'>
            <div>
              <h2 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-6'>
                {t('Settings.Two-Factor Authentication')}
              </h2>
            </div>

            <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6'>
              <div className='flex items-start'>
                <div className='flex-shrink-0'>
                  <FontAwesomeIcon
                    icon={faShield}
                    className='h-6 w-6 text-primary dark:text-primaryDark'
                  />
                </div>
                <div className='ml-3'>
                  <h3 className='text-sm font-medium text-gray-900 dark:text-gray-100 mb-2'>
                    {t('Settings.Secure your account')}
                  </h3>
                  <p className='text-sm text-gray-600 dark:text-gray-400'>
                    {t(
                      'Settings.Two-factor authentication adds an extra layer of security to your account by requiring a code from your phone in addition to your password.',
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <div>
                <h4 className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                  {t('Settings.Status')}
                </h4>
                <div className='flex items-center mt-1'>
                  {isEnabled ? (
                    <>
                      <FontAwesomeIcon
                        icon={faCircleCheck}
                        className='h-4 w-4 text-green-500 mr-2'
                      />
                      <span className='text-sm text-green-600 dark:text-green-400'>
                        {t('Settings.Enabled')}
                      </span>
                    </>
                  ) : (
                    <>
                      <div className='h-4 w-4 bg-gray-300 dark:bg-gray-600 rounded-full mr-2' />
                      <span className='text-sm text-gray-500 dark:text-gray-400'>
                        {t('Settings.Disabled')}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div>
                {isEnabled ? (
                  <Button variant='danger' onClick={() => setShowDisableModal(true)}>
                    {t('Settings.Disable 2FA')}
                  </Button>
                ) : (
                  <Button variant='primary' onClick={handleSetupStart}>
                    <FontAwesomeIcon icon={faShield} className='mr-2 h-4 w-4' />
                    {t('Settings.Setup 2FA')}
                  </Button>
                )}
              </div>
            </div>

            {error && <InlineNotification type='error' title={error} className='mt-4' />}
          </div>
        </div>
      </section>

      {/* Setup 2FA Modal */}
      <Modal show={showSetupModal} focus={cancelButtonRef} onClose={closeSetupModal} size='large'>
        <Modal.Content>
          <div className='text-center sm:text-left w-full'>
            <div className='flex items-center justify-center mb-6'>
              <h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4'>
                {t('Settings.Setup Two-Factor Authentication')}
              </h3>
            </div>

            {/* Step indicator */}
            <div className='flex items-center justify-center mb-6'>
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className='flex items-center'>
                  <div
                    className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium
                    ${
                      currentStep >= step
                        ? 'bg-primary text-white dark:bg-primaryDark'
                        : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }
                  `}
                  >
                    {step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`
                      w-12 h-1 mx-2
                      ${
                        currentStep > step
                          ? 'bg-primary dark:bg-primaryDark'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }
                    `}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Instructions */}
            {currentStep === 1 && (
              <div className='text-center'>
                <div className='mb-6'>
                  <FontAwesomeIcon
                    icon={faShield}
                    className='h-16 w-16 text-primary dark:text-primaryDark mb-4'
                  />
                </div>
                <h4 className='text-base font-medium text-gray-900 dark:text-gray-100 mb-4'>
                  {t('Settings.Setup Two-Factor Authentication')}
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-6'>
                  {t(
                    'Settings.Follow these steps to secure your account with two-factor authentication.',
                  )}
                </p>

                <div className='space-y-4 text-left max-w-md mx-auto'>
                  <div className='flex items-start space-x-3'>
                    <div className='flex-shrink-0'>
                      <FontAwesomeIcon
                        icon={faQrcode}
                        className='h-5 w-5 text-primary dark:text-primaryDark mt-0.5'
                      />
                    </div>
                    <div>
                      <h5 className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                        {t('Settings.Option 1: QR Code')}
                      </h5>
                      <p className='text-xs text-gray-600 dark:text-gray-400'>
                        {t(
                          'Settings.Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)',
                        )}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-start space-x-3'>
                    <div className='flex-shrink-0'>
                      <FontAwesomeIcon
                        icon={faKey}
                        className='h-5 w-5 text-primary dark:text-primaryDark mt-0.5'
                      />
                    </div>
                    <div>
                      <h5 className='text-sm font-medium text-gray-900 dark:text-gray-100'>
                        {t('Settings.Option 2: Manual Entry')}
                      </h5>
                      <p className='text-xs text-gray-600 dark:text-gray-400'>
                        {t('Settings.Manually enter the secret key in your authenticator app')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: QR Code */}
            {currentStep === 2 && setupData && (
              <div className='text-center'>
                <h4 className='text-base font-medium text-gray-900 dark:text-gray-100 mb-4'>
                  {t('Settings.Scan QR Code')}
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-6'>
                  {t('Settings.Scan this QR code with your authenticator app')}
                </p>
                <div className='flex justify-center mb-6'>
                  <QRCode data={setupData.url} />
                </div>

                {/* Code */}
                <div className='bg-gray-50 dark:bg-gray-800 rounded-lg p-4'>
                  <h5 className='text-sm font-medium text-gray-900 dark:text-gray-100 mb-2'>
                    {t('Settings.Manual Entry')}
                  </h5>
                  <p className='text-xs text-gray-600 dark:text-gray-400 mb-3'>
                    {t('Settings.If you cannot scan the QR code, enter this code manually:')}
                  </p>
                  <div className='flex items-center justify-center space-x-2'>
                    <code className='bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm font-mono text-gray-900 dark:text-gray-100 break-all'>
                      {secretVisible ? setupData.key : '••••••••••••••••••••••••••••••••'}
                    </code>
                    <Button
                      variant='white'
                      size='small'
                      onClick={() => setSecretVisible(!secretVisible)}
                      className='!p-2'
                    >
                      <FontAwesomeIcon
                        icon={secretVisible ? faEyeSlash : faEye}
                        className='h-4 w-4'
                      />
                    </Button>
                    <Button
                      variant='white'
                      size='small'
                      onClick={() => copyToClipboard(setupData.key)}
                      className='!p-2'
                    >
                      <FontAwesomeIcon icon={faCopy} className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Manual Entry */}
            {currentStep === 3 && (
              <div>
                <h4 className='text-base font-medium text-gray-900 dark:text-gray-100 mb-4'>
                  {t('Settings.Verify Setup')}
                </h4>
                <p className='text-sm text-gray-600 dark:text-gray-400 mb-4'>
                  {t(
                    'Settings.Enter the 6-digit code from your authenticator app to complete setup:',
                  )}
                </p>
                <div className='mb-4'>
                  <OTPInput
                    ref={otpInputRef}
                    value={totpCode}
                    onChange={setTotpCode}
                    length={6}
                    className='justify-center'
                  />
                </div>
                {error && <InlineNotification type='error' title={error} className='mb-4' />}
              </div>
            )}

            {/* Step 4: Verification */}
            {currentStep === 4 && setupData && (
              <div>
                <h4 className='text-base font-medium text-gray-900 dark:text-gray-100 mb-4'>
                  {t('Settings.Manual Entry')}
                </h4>
              </div>
            )}
          </div>
        </Modal.Content>

        <Modal.Actions>
          {currentStep === 1 && (
            <>
              <Button variant='primary' onClick={getSetupData} disabled={isProcessing}>
                {isProcessing && <FontAwesomeIcon icon={faCircleNotch} className='fa-spin mr-2' />}
                {t('Common.Next')}
              </Button>
              <Button variant='ghost' onClick={closeSetupModal} ref={cancelButtonRef}>
                {t('Common.Cancel')}
              </Button>
            </>
          )}

          {currentStep === 2 && (
            <>
              <Button variant='primary' onClick={handleNextStep}>
                {t('Common.Next')}
              </Button>
              <Button variant='white' onClick={handlePreviousStep}>
                {t('Common.Previous')}
              </Button>
              <Button variant='ghost' onClick={closeSetupModal} ref={cancelButtonRef}>
                {t('Common.Cancel')}
              </Button>
            </>
          )}

          {currentStep === 3 && (
            <>
              <Button
                variant='primary'
                onClick={handleEnable2FA}
                disabled={isProcessing || totpCode.length !== 6}
              >
                {isProcessing && <FontAwesomeIcon icon={faCircleNotch} className='fa-spin mr-2' />}
                {t('Common.Verify')}
              </Button>
              <Button variant='white' onClick={handlePreviousStep}>
                {t('Common.Previous')}
              </Button>
              <Button variant='ghost' onClick={closeSetupModal} ref={cancelButtonRef}>
                {t('Common.Cancel')}
              </Button>
            </>
          )}

          {currentStep === 4 && (
            <>
              <Button variant='primary' onClick={completeSetup}>
                {t('Common.Complete')}
              </Button>
            </>
          )}
        </Modal.Actions>
      </Modal>

      {/* Disable 2FA Modal */}
      <Modal show={showDisableModal} focus={disableCancelButtonRef} onClose={closeDisableModal}>
        <Modal.Content>
          <div className='text-center w-full'>
            <div className='flex items-center justify-center mb-4'>
              <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900 sm:mx-0'>
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className='h-6 w-6 text-red-600 dark:text-red-200'
                  aria-hidden='true'
                />
              </div>
              <h3 className='text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 ml-4'>
                {t('Settings.Disable Two-Factor Authentication')}
              </h3>
            </div>
            <div className='flex mb-4 text-center'>
              <p className='text-sm text-gray-500 dark:text-gray-400'>
                {t(
                  'Settings.This will make your account less secure. Enter your authenticator code to confirm',
                )}
              </p>
            </div>
            <div className='flex mb-4 justify-center'>
              <OTPInput
                ref={otpInputRef}
                value={totpCode}
                onChange={setTotpCode}
                length={6}
                className='justify-center'
              />
            </div>
            {error && <InlineNotification type='error' title={error} />}
          </div>
        </Modal.Content>
        <Modal.Actions>
          <Button
            variant='danger'
            onClick={handleDisable2FA}
            disabled={isProcessing || totpCode.length !== 6}
          >
            {isProcessing && <FontAwesomeIcon icon={faCircleNotch} className='fa-spin mr-2' />}
            {t('Common.Disable')}
          </Button>
          <Button variant='ghost' onClick={closeDisableModal} ref={disableCancelButtonRef}>
            {t('Common.Cancel')}
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  )
}
