// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Two Factor Authentication types
 */

export interface TwoFactorSetupResponse {
  url: string
  secret: string
}

export interface TwoFactorStatusResponse {
  enabled: boolean
}

export interface TwoFactorBackupCodesResponse {
  backup_codes: string[]
}
