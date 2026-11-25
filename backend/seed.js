require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');

const User = require('./models/User');
const Region = require('./models/Region');
const CraftDirectory = require('./models/CraftDirectory');
const Village = require('./models/Village');
const Craft = require('./models/Craft');
const Artisan = require('./models/Artisan');
const Artifact = require('./models/Artifact');

async function seedDatabase() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Region.deleteMany({}),
    CraftDirectory.deleteMany({}),
    Village.deleteMany({}),
    Craft.deleteMany({}),
    Artisan.deleteMany({}),
    Artifact.deleteMany({})
  ]);

  const hashedPassword = await bcrypt.hash('123456', 10);

  // 1. Tài khoản mẫu 3 vai trò
  const adminUser = await User.create({
    fullName: 'Quản trị viên CraftRoots',
    email: 'admin@craftroots.vn',
    password: hashedPassword,
    role: 'ADMIN'
  });

  const artisanUser = await User.create({
    fullName: 'Nghệ nhân Trần Văn Độ',
    email: 'nghenhan@craftroots.vn',
    password: hashedPassword,
    role: 'ARTISAN'
  });

  await User.create({
    fullName: 'Nguyễn Minh Anh',
    email: 'user@craftroots.vn',
    password: hashedPassword,
    role: 'USER'
  });

  // 2. Vùng miền (6 vùng kinh tế - văn hóa)
  const regions = await Region.insertMany([
    {
      name: 'Trung du và miền núi phía Bắc',
      slug: 'trung-du-va-mien-nui-phia-bac',
      description: 'Vùng núi phía Bắc nổi tiếng với nghề dệt thổ cẩm, làm giấy dó, đan lát và rèn truyền thống của các dân tộc.',
      isPublished: true,
      isDeleted: false
    },
    {
      name: 'Đồng bằng sông Hồng',
      slug: 'dong-bang-song-hong',
      description: 'Cái nôi lâu đời của các làng nghề gốm sứ, tơ lụa, đúc đồng, chạm khắc gỗ và tranh dân gian.',
      isPublished: true,
      isDeleted: false
    },
    {
      name: 'Bắc Trung Bộ',
      slug: 'bac-trung-bo',
      description: 'Khu vực giàu truyền thống với nghề làm nón lá, mây tre đan, mộc và chế tác thủ công vùng cố đô.',
      isPublished: true,
      isDeleted: false
    },
    {
      name: 'Duyên hải Nam Trung Bộ và Tây Nguyên',
      slug: 'duyen-hai-nam-trung-bo-va-tay-nguyen',
      description: 'Giao thoa văn hóa biển, Chăm và đại ngàn Tây Nguyên với đèn lồng, gốm Bàu Trúc, điêu khắc đá và thổ cẩm.',
      isPublished: true,
      isDeleted: false
    },
    {
      name: 'Đông Nam Bộ',
      slug: 'dong-nam-bo',
      description: 'Vùng đất phát triển mạnh các nghề gốm mỹ nghệ, sơn mài truyền thống và mây tre đan.',
      isPublished: true,
      isDeleted: false
    },
    {
      name: 'Đồng bằng sông Cửu Long',
      slug: 'dong-bang-song-cuu-long',
      description: 'Miền Tây sông nước với các làng nghề dệt chiếu, đan lục bình, làm gốm đỏ và thủ công mỹ nghệ bản địa.',
      isPublished: true,
      isDeleted: false
    }
  ]);

  // 3. Danh mục nghề
  const dirs = await CraftDirectory.insertMany([
    { name: 'Gốm sứ', slug: 'gom-su', description: 'Nghệ thuật tạo hình và nung gốm truyền thống' },
    { name: 'Dệt may & Lụa', slug: 'det-may-lua', description: 'Ươm tơ, dệt lụa và thổ cẩm thủ công' },
    { name: 'Mây tre & Đèn', slug: 'may-tre-den', description: 'Chế tác tre nứa, lục bình và đèn lồng' },
    { name: 'Tranh dân gian', slug: 'tranh-dan-gian', description: 'Tranh khắc gỗ và nghệ thuật giấy truyền thống' }
  ]);

  // 4. Làng nghề
  const villages = await Village.insertMany([
    {
      name: 'Làng gốm Bát Tràng',
      slug: 'lang-gom-bat-trang',
      province: 'TP.Hà Nội',
      commune: 'Xã Bát Tràng',
      regionId: regions[1]._id,
      history: 'Hình thành từ thế kỷ XIV bên bờ sông Hồng, nổi tiếng với dòng men rạn và men lam.',
      description: 'Cái nôi của nghệ thuật gốm sứ thủ công Việt Nam với hàng trăm lò gốm gia truyền.',
      mainImage: 'https://images.pexels.com/photos/6621339/pexels-photo-6621339.jpeg?auto=compress&cs=tinysrgb&w=1000',
      isPublished: true
    },
    {
      name: 'Làng lụa Phùng Xá',
      slug: 'lang-lua-phung-xa',
      province: 'TP.Hà Nội',
      regionId: regions[1]._id,
      history: 'Nơi nghệ nhân Phan Thị Thuận phục dựng thành công kỹ thuật dệt lụa từ tơ cuống sen.',
      description: 'Làng nghề ươm tơ dệt lụa truyền thống kết hợp sáng tạo tơ sen độc bản.',
      mainImage: 'https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1000',
      isPublished: true
    },
    {
      name: 'Làng đèn lồng Hội An',
      slug: 'lang-den-long-hoi-an',
      province: 'TP.Đà Nẵng',
      regionId: regions[3]._id,
      history: 'Gắn liền với thương cảng Hội An hơn 400 năm lịch sử giao thoa văn hóa.',
      description: 'Nghề vót tre, bọc lụa tơ tằm tạo nên biểu tượng ánh sáng phố cổ Hội An.',
      mainImage: 'https://images.pexels.com/photos/3225529/pexels-photo-3225529.jpeg?auto=compress&cs=tinysrgb&w=1000',
      isPublished: true
    }
  ]);

  // 5. Nghệ nhân
  const artisans = await Artisan.insertMany([
    {
      user: artisanUser._id,
      fullName: 'Trần Văn Độ',
      slug: 'tran-van-do',
      title: 'Nghệ nhân Nhân dân',
      yearsOfExperience: 42,
      craftSpecialty: 'Gốm Men Rạn Cổ Bát Tràng',
      villageName: 'Làng gốm Bát Tràng',
      province: 'Hà Nội',
      bio: 'Hơn 40 năm nghiên cứu phục chế bài men rạn cổ thời Lê - Nguyễn.',
      avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=500',
      verificationStatus: 'VERIFIED'
    },
    {
      fullName: 'Phan Thị Thuận',
      slug: 'phan-thi-thuan',
      title: 'Nghệ nhân Ưu tú',
      yearsOfExperience: 45,
      craftSpecialty: 'Dệt Lụa Tơ Sen',
      villageName: 'Làng lụa Phùng Xá',
      province: 'Hà Nội',
      bio: 'Người tiên phong đưa sợi tơ từ cuống sen Việt Nam vươn tầm quốc tế.',
      avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=500',
      verificationStatus: 'VERIFIED'
    }
  ]);

  artisanUser.artisanProfile = artisans[0]._id;
  await artisanUser.save();

  // 6. Nghề thủ công
  const crafts = await Craft.insertMany([
    {
      name: 'Gốm Men Rạn Bát Tràng',
      slug: 'gom-men-ran-bat-trang',
      directory: dirs[0]._id,
      category: 'Gốm sứ',
      village: villages[0]._id,
      villageName: 'Làng gốm Bát Tràng',
      regionName: 'Đồng bằng sông Hồng',
      culturalBackground: 'Dòng men độc bản tạo các vết rạn tự nhiên nhờ chênh lệch độ co giãn giữa xương gốm và men.',
      material: 'Đất sét trắng, men tro trấu',
      technique: 'Vuốt tay bàn xoay & Nung lò 1250°C',
      tools: ['Bàn xoay gốm', 'Que tre tạo hình', 'Bút lông vẽ men'],
      process: ['Chọn và lọc đất sét', 'Tạo hình trên bàn xoay', 'Phủ men tro trấu', 'Nung nhiệt độ cao & xoa mực tàu'],
      thumbnail: 'https://images.pexels.com/photos/6621339/pexels-photo-6621339.jpeg?auto=compress&cs=tinysrgb&w=1000',
      gallery: [
        { url: 'https://images.pexels.com/photos/6621339/pexels-photo-6621339.jpeg?auto=compress&cs=tinysrgb&w=1000', caption: 'Tạo hình bình gốm men rạn' }
      ],
      featured: true
    },
    {
      name: 'Lụa Tơ Sen Phùng Xá',
      slug: 'lua-to-sen-phung-xa',
      directory: dirs[1]._id,
      category: 'Dệt may & Lụa',
      village: villages[1]._id,
      villageName: 'Làng lụa Phùng Xá',
      regionName: 'Đồng bằng sông Hồng',
      culturalBackground: 'Mỗi mét khăn lụa tơ sen cần tới hàng chục nghìn cuống sen tươi rút sợi thủ công trong vòng 24 giờ.',
      material: 'Sợi tơ cuống sen tự nhiên',
      technique: 'Rút tơ thủ công & Dệt khung cửi gỗ',
      tools: ['Khung cửi gỗ', 'Con thoi', 'Guồng quay tơ'],
      process: ['Thu hoạch cuống sen', 'Rút và se sợi tơ sen', 'Mắc khung cửi', 'Dệt thủ công hoàn thiện'],
      thumbnail: 'https://images.pexels.com/photos/5709661/pexels-photo-5709661.jpeg?auto=compress&cs=tinysrgb&w=1000',
      featured: true
    },
    {
      name: 'Đèn Lồng Hội An',
      slug: 'den-long-hoi-an',
      directory: dirs[2]._id,
      category: 'Mây tre & Đèn',
      village: villages[2]._id,
      villageName: 'Làng đèn lồng Hội An',
      regionName: 'Duyên hải Nam Trung Bộ và Tây Nguyên',
      culturalBackground: 'Nan tre già được ngâm nước muối chống mối mọt, uốn khung và bọc lụa Hà Đông rực rỡ.',
      material: 'Tre già, lụa tơ tằm',
      technique: 'Uốn nan tre & Bọc lụa căng khung',
      tools: ['Dao vót tre', 'Khuôn định hình', 'Keo dán thủ công'],
      process: ['Xử lý và vót nan tre', 'Dựng khung đèn', 'Cắt và dán lụa', 'Gắn tua rua trang trí'],
      thumbnail: 'https://images.pexels.com/photos/3225529/pexels-photo-3225529.jpeg?auto=compress&cs=tinysrgb&w=1000',
      featured: true
    }
  ]);

  // 7. Hiện vật / Tác phẩm tiêu biểu
  await Artifact.insertMany([
    {
      name: 'Bình Hút Lộc Men Rạn Rồng Chầu',
      slug: 'binh-hut-loc-men-ran-rong-chau',
      craft: crafts[0]._id,
      craftName: 'Gốm Men Rạn Bát Tràng',
      artisan: artisans[0]._id,
      artisanName: 'Trần Văn Độ',
      eraOrYear: '2024',
      dimensions: 'Cao 48cm x Đường kính 32cm',
      material: 'Đất sét trắng Đông Triều, men tro trấu cổ',
      technique: 'Đắp nổi thủ công hoàn toàn, nung củi truyền thống',
      culturalMeaning: 'Biểu trưng cho sự hội tụ vượng khí, bảo tồn nét chạm khắc rồng thời Lý - Trần.',
      thumbnail: 'https://images.pexels.com/photos/4207892/pexels-photo-4207892.jpeg?auto=compress&cs=tinysrgb&w=1000'
    },
    {
      name: 'Khăn Choàng Tơ Sen Nguyên Bản',
      slug: 'khan-choang-to-sen-nguyen-ban',
      craft: crafts[1]._id,
      craftName: 'Lụa Tơ Sen Phùng Xá',
      artisan: artisans[1]._id,
      artisanName: 'Phan Thị Thuận',
      eraOrYear: '2025',
      dimensions: '180cm x 45cm',
      material: '100% tơ cuống sen tự nhiên',
      technique: 'Se sợi tay và dệt cửi truyền thống không nhuộm hóa chất',
      culturalMeaning: 'Tác phẩm từng được chọn làm quà tặng nguyên thủ quốc tế, mang hương sen thanh khiết.',
      thumbnail: 'https://images.pexels.com/photos/3735641/pexels-photo-3735641.jpeg?auto=compress&cs=tinysrgb&w=1000'
    }
  ]);

  console.log('Seed dữ liệu mẫu CraftRoots1 thành công!');
  console.log('Tài khoản Admin: admin@craftroots.vn / 123456');
  console.log('Tài khoản Nghệ nhân: nghenhan@craftroots.vn / 123456');
  console.log('Tài khoản User: user@craftroots.vn / 123456');
  process.exit(0);
}

seedDatabase();
