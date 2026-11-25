import api from './api';

export const locationService = {
  getProvinces: (params = {}) =>
    api.get('/locations/provinces', { params }).then((res) => res.data?.data || []),
  getWards: (params = {}) =>
    api.get('/locations/wards', { params }).then((res) => res.data?.data || [])
};
