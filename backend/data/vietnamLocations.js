// ÁNH XẠ 6 VÙNG KINH TẾ - VĂN HÓA VỚI 34 TỈNH/THÀNH PHỐ (MÔ HÌNH 2 CẤP)
const normalizeText = (text = '') =>
  text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

const stripProvincePrefix = (name = '') =>
  name
    .toString()
    .trim()
    .replace(/^(TP\.?|Thành phố|Tỉnh)\s+/i, '')
    .trim();

// Chuẩn hóa tên hiển thị: "Thành phố Hà Nội" -> "TP.Hà Nội", "Tỉnh Phú Thọ" -> "Phú Thọ"
const formatProvinceName = (rawName = '', divisionType = '') => {
  const baseName = stripProvincePrefix(rawName);
  const isMunicipality =
    /^thành phố\s+/i.test(rawName.trim()) ||
    /^tp\.?\s*/i.test(rawName.trim()) ||
    normalizeText(divisionType).includes('thanh pho');

  return isMunicipality ? `TP.${baseName}` : baseName;
};

const REGION_PROVINCE_MAP = {
  'trung-du-va-mien-nui-phia-bac': [
    'tuyen quang',
    'cao bang',
    'lai chau',
    'lao cai',
    'thai nguyen',
    'dien bien',
    'lang son',
    'son la',
    'phu tho'
  ],
  'dong-bang-song-hong': [
    'ha noi',
    'hai phong',
    'bac ninh',
    'quang ninh',
    'hung yen',
    'ninh binh'
  ],
  'bac-trung-bo': [
    'thanh hoa',
    'nghe an',
    'ha tinh',
    'quang tri',
    'hue',
    'thua thien hue'
  ],
  'duyen-hai-nam-trung-bo-va-tay-nguyen': [
    'da nang',
    'quang ngai',
    'gia lai',
    'dak lak',
    'khanh hoa',
    'lam dong'
  ],
  'dong-nam-bo': ['dong nai', 'tay ninh', 'ho chi minh'],
  'dong-bang-song-cuu-long': ['dong thap', 'an giang', 'vinh long', 'can tho', 'ca mau']
};

const getRegionSlugByProvinceName = (rawName = '') => {
  const key = normalizeText(stripProvincePrefix(rawName));
  for (const [regionSlug, provinceKeys] of Object.entries(REGION_PROVINCE_MAP)) {
    if (provinceKeys.includes(key)) {
      return regionSlug;
    }
  }
  return '';
};

// Danh sách dự phòng 34 tỉnh/thành nếu API ngoài tạm gián đoạn
const FALLBACK_PROVINCES = [
  { name: 'Tuyên Quang', regionSlug: 'trung-du-va-mien-nui-phia-bac' },
  { name: 'Cao Bằng', regionSlug: 'trung-du-va-mien-nui-phia-bac' },
  { name: 'Lai Châu', regionSlug: 'trung-du-va-mien-nui-phia-bac' },
  { name: 'Lào Cai', regionSlug: 'trung-du-va-mien-nui-phia-bac' },
  { name: 'Thái Nguyên', regionSlug: 'trung-du-va-mien-nui-phia-bac' },
  { name: 'Điện Biên', regionSlug: 'trung-du-va-mien-nui-phia-bac' },
  { name: 'Lạng Sơn', regionSlug: 'trung-du-va-mien-nui-phia-bac' },
  { name: 'Sơn La', regionSlug: 'trung-du-va-mien-nui-phia-bac' },
  { name: 'Phú Thọ', regionSlug: 'trung-du-va-mien-nui-phia-bac' },
  { name: 'TP.Hà Nội', regionSlug: 'dong-bang-song-hong' },
  { name: 'TP.Hải Phòng', regionSlug: 'dong-bang-song-hong' },
  { name: 'Bắc Ninh', regionSlug: 'dong-bang-song-hong' },
  { name: 'Quảng Ninh', regionSlug: 'dong-bang-song-hong' },
  { name: 'Hưng Yên', regionSlug: 'dong-bang-song-hong' },
  { name: 'Ninh Bình', regionSlug: 'dong-bang-song-hong' },
  { name: 'Thanh Hóa', regionSlug: 'bac-trung-bo' },
  { name: 'Nghệ An', regionSlug: 'bac-trung-bo' },
  { name: 'Hà Tĩnh', regionSlug: 'bac-trung-bo' },
  { name: 'Quảng Trị', regionSlug: 'bac-trung-bo' },
  { name: 'TP.Huế', regionSlug: 'bac-trung-bo' },
  { name: 'TP.Đà Nẵng', regionSlug: 'duyen-hai-nam-trung-bo-va-tay-nguyen' },
  { name: 'Quảng Ngãi', regionSlug: 'duyen-hai-nam-trung-bo-va-tay-nguyen' },
  { name: 'Gia Lai', regionSlug: 'duyen-hai-nam-trung-bo-va-tay-nguyen' },
  { name: 'Đắk Lắk', regionSlug: 'duyen-hai-nam-trung-bo-va-tay-nguyen' },
  { name: 'Khánh Hòa', regionSlug: 'duyen-hai-nam-trung-bo-va-tay-nguyen' },
  { name: 'Lâm Đồng', regionSlug: 'duyen-hai-nam-trung-bo-va-tay-nguyen' },
  { name: 'Đồng Nai', regionSlug: 'dong-nam-bo' },
  { name: 'Tây Ninh', regionSlug: 'dong-nam-bo' },
  { name: 'TP.Hồ Chí Minh', regionSlug: 'dong-nam-bo' },
  { name: 'Đồng Tháp', regionSlug: 'dong-bang-song-cuu-long' },
  { name: 'An Giang', regionSlug: 'dong-bang-song-cuu-long' },
  { name: 'Vĩnh Long', regionSlug: 'dong-bang-song-cuu-long' },
  { name: 'TP.Cần Thơ', regionSlug: 'dong-bang-song-cuu-long' },
  { name: 'Cà Mau', regionSlug: 'dong-bang-song-cuu-long' }
].map((item) => ({
  code: null,
  name: item.name,
  rawName: item.name,
  codename: normalizeText(item.name).replace(/[^a-z0-9]+/g, '_'),
  divisionType: item.name.startsWith('TP.') ? 'thành phố trung ương' : 'tỉnh',
  regionSlug: item.regionSlug
}));

module.exports = {
  normalizeText,
  stripProvincePrefix,
  formatProvinceName,
  REGION_PROVINCE_MAP,
  getRegionSlugByProvinceName,
  FALLBACK_PROVINCES
};
