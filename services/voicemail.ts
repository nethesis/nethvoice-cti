// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios';

const PATH = '/voicemail';
import { handleNetworkError } from '../lib/utils'

export const getAllVoicemails = async () => {
    try {
        const response = await axios.get(`${PATH}/list/all`);
        return response.data.rows;
    } catch (error) {
        handleNetworkError(error)
        throw error
    }
};
