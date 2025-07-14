// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Contains the request to the APIs for Two Factor Authentication
 */

import axios, { AxiosResponse } from 'axios'
import { handleNetworkError } from '../lib/utils'
import {
  TwoFactorBackupCodesResponse,
  TwoFactorSetupResponse,
  TwoFactorStatusResponse,
} from './types/twoFactor'

/**
 * The path to the two factor authentication endpoints
 */
const PATH = '/2fa'

/**
 * Get the current 2FA status for the user
 *
 * @returns An object with the enabled boolean property
 */
export const getTwoFactorStatus = async (): Promise<TwoFactorStatusResponse> => {
  try {
    const res: AxiosResponse = await axios.get(`${PATH}`)
    return res.data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

/**
 * Initialize 2FA setup and get QR code
 *
 * @returns An object with qrcode and secret
 */
export const getQRcode = async (): Promise<TwoFactorSetupResponse> => {
  try {
    const res: AxiosResponse = await axios.get(`${PATH}/qr-code`)
    return res.data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

/**
 * Enable 2FA with TOTP code verification
 *
 * @param totpCode - The TOTP code from authenticator app
 * @returns Success response
 */
export const enableTwoFactor = async (totpCode: string) => {
  try {
    const res: AxiosResponse = await axios.post(`${PATH}/enable`, {
      totp_code: totpCode,
    })
    return res.data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

/**
 * Disable 2FA with TOTP code verification
 *
 * @param totpCode - The TOTP code from authenticator app
 * @returns Success response
 */
export const disableTwoFactor = async (totpCode: string) => {
  try {
    const res: AxiosResponse = await axios.post(`${PATH}/disable`, {
      totp_code: totpCode,
    })
    return res.data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}

/**
 * Generate new backup codes
 *
 * @returns New backup codes
 */
export const generateBackupCodes = async (
  totpCode: string,
): Promise<TwoFactorBackupCodesResponse> => {
  try {
    const res: AxiosResponse = await axios.post(`${PATH}/recovery-codes`)
    return res.data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}
