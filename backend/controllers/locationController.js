const https = require('https');
const mongoose = require('mongoose');
const Region = require('../models/Region');
const {
  normalizeText,
  stripProvincePrefix,
  formatProvinceName,
  REGION_PROVINCE_MAP,
  getRegionSlugByProvinceName,
  FALLBACK_PROVINCES
} = require('../data/vietnamLocations');

const PROVINCES_API_BASE = 'https://provinces.open-api.vn/api/v2';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

let provincesCache = { data: null, expiresAt: 0 };
const wardsCache = new Map();

const fetchJson = (url) =>
  new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 10000 }, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode} khi gọi ${url}`));
      }
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        raw += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(raw));
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('timeout', () => {
      req.destroy(new Error('Timeout khi gọi API hành chính'));
    });
    req.on('error', reject);
  });

const loadProvinces = async () => {
  if (provincesCache.data && Date.now() < provincesCache.expiresAt) {
    return provincesCache.data;
  }

  try {
    const rawList = await fetchJson(`${PROVINCES_API_BASE}/`);
    if (!Array.isArray(rawList) || rawList.length === 0) {
      throw new Error('Dữ liệu tỉnh/thành từ API rỗng');
    }

    const mapped = rawList
      .map((item) => ({
        code: item.code,
        name: formatProvinceName(item.name, item.division_type),
        rawName: item.name,
        codename: item.codename || '',
        divisionType: item.division_type || '',
        regionSlug: getRegionSlugByProvinceName(item.name)
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

    provincesCache = {
      data: mapped,
      expiresAt: Date.now() + CACHE_TTL_MS
    };
    return mapped;
  } catch (err) {
    if (provincesCache.data) return provincesCache.data;
    return [...FALLBACK_PROVINCES].sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }
};

// GET /api/locations/provinces?regionId=...&regionSlug=...
exports.getProvinces = async (req, res) => {
  try {
    const { regionId, regionSlug } = req.query;
    const allProvinces = await loadProvinces();

    let targetSlug = regionSlug ? normalizeText(regionSlug).replace(/\s+/g, '-') : '';

    if (regionId) {
      if (!mongoose.Types.ObjectId.isValid(regionId)) {
        return res.status(400).json({ success: false, message: 'Invalid regionId' });
      }
      const region = await Region.findOne({ _id: regionId, isDeleted: false });
      if (!region) {
        return res.status(200).json({ success: true, data: [] });
      }
      const nameAsSlug = normalizeText(region.name).replace(/\s+/g, '-');
      targetSlug = REGION_PROVINCE_MAP[region.slug] ? region.slug : nameAsSlug;
    }

    const data = targetSlug
      ? allProvinces.filter((p) => p.regionSlug === targetSlug)
      : allProvinces;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/locations/wards?province=...&provinceCode=...
exports.getWards = async (req, res) => {
  try {
    const { province, provinceCode } = req.query;

    if (!province && !provinceCode) {
      return res.status(200).json({ success: true, data: [] });
    }

    const allProvinces = await loadProvinces();
    let matched = null;

    if (provinceCode) {
      matched = allProvinces.find((p) => String(p.code) === String(provinceCode));
    } else if (province) {
      const targetKey = normalizeText(stripProvincePrefix(province));
      matched = allProvinces.find(
        (p) =>
          normalizeText(p.name) === normalizeText(province) ||
          normalizeText(stripProvincePrefix(p.name)) === targetKey
      );
    }

    if (!matched || !matched.code) {
      return res.status(200).json({ success: true, data: [] });
    }

    const cached = wardsCache.get(matched.code);
    if (cached && Date.now() < cached.expiresAt) {
      return res.status(200).json({ success: true, data: cached.data });
    }

    const detail = await fetchJson(`${PROVINCES_API_BASE}/p/${matched.code}?depth=2`);
    const wards = (Array.isArray(detail?.wards) ? detail.wards : [])
      .map((w) => ({
        code: w.code,
        name: w.name,
        codename: w.codename || '',
        divisionType: w.division_type || ''
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'));

    wardsCache.set(matched.code, {
      data: wards,
      expiresAt: Date.now() + CACHE_TTL_MS
    });

    return res.status(200).json({ success: true, data: wards });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Không tải được danh sách xã/phường từ API hành chính.',
      error: error.message
    });
  }
};