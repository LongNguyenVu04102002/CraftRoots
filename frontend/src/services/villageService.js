import api from './api';

const normalize = (village) => ({
  ...village,
  thumbnail: village.mainImage || village.thumbnail || '',
  regionName: village.regionId?.name || village.regionName || ''
});

const unwrapList = (response) => (response.data?.data || []).map(normalize);

export const villageService = {
  getAll: (params = {}) => {
    const admin = params.includeInactive === 'true' || params.admin === true;
    const query = {
      search: params.search || params.q || undefined,
      regionId: params.regionId || undefined,
      province: params.province || undefined,
      commune: params.commune || undefined,
      page: 1,
      limit: 1000
    };
    if (params.isPublished !== undefined && params.isPublished !== '') query.isPublished = params.isPublished;
    return api.get(admin ? '/admin/villages' : '/public/villages', { params: query }).then(unwrapList).then((villages) => {
      if (params.region && !admin) return villages.filter((village) => village.regionName === params.region);
      return villages;
    });
  },
  getBySlug: (slug) => api.get(`/public/villages/${slug}`).then((response) => normalize(response.data.data)),
  create: (data) => api.post('/admin/villages', data).then((response) => normalize(response.data.data)),
  update: (id, data) => api.put(`/admin/villages/${id}`, data).then((response) => normalize(response.data.data)),
  setPublished: (id, isPublished) => api.patch(`/admin/villages/${id}/status`, { isPublished }),
  remove: (id) => api.delete(`/admin/villages/${id}`)
};
