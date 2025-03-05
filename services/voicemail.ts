// Copyright (C) 2025 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios';

const PATH = '/voicemail';
import { getApiEndpoint, getApiScheme, handleNetworkError } from '../lib/utils'
import { getHistoryUrl } from '../lib/history';

export const getAllVoicemails = async () => {
    try {
        const response = await axios.get(`${PATH}/list/all`);
        return response.data.rows;
    } catch (error) {
        handleNetworkError(error)
        throw error
    }
};

export const downloadVoicemail = async (id: any) => {
    try {
        const response = await axios.get(`${PATH}/download/${id}`);

        const filename = response.data;
        if (!filename) {
            console.error("Errore: il server non ha restituito il nome del file.");
            return;
        }
        const fileUrl = `${getApiScheme()}${getApiEndpoint()}/webrest/static/${filename}`;

        const link = document.createElement("a");
        link.href = fileUrl
        link.download = filename
        link.click()        
    } catch (error) {
        handleNetworkError(error);
        throw error;
    }
};


export const deleteVoicemail = async (id: any) => {
    try {
        await axios.post(`${PATH}/delete`, { id: id.toString() });
    } catch (error) {
        handleNetworkError(error);
        throw error;
    }
}
