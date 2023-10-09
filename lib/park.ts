// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import axios from 'axios'
import { handleNetworkError } from './utils'
import { store } from '../store'
import { isEmpty } from 'lodash'

// Retrieve contact information trough id
export async function retrieveParksList() {
  store.dispatch.park.setLoading(true);
  store.dispatch.park.setLoaded(false);
  let parkObject: any = null;
  try {
    const { data, status } = await axios.get('/astproxy/parkings');
    parkObject = data;
    store.dispatch.park.setParks(parkObject);
    store.dispatch.park.setLoaded(true);
    store.dispatch.park.setLoading(false);
  } catch (error) {
    handleNetworkError(error);
    store.dispatch.park.setLoaded(true);
    store.dispatch.park.setLoading(false);
    throw error;
  }
}

export async function getParking(parkInformation: any) {
  try {
    const { data, status } = await axios.post('/astproxy/pickup_parking', parkInformation)
    return data
  } catch (error) {
    handleNetworkError(error)
    throw error
  }
}
