window.LOVE_CONFIG = {
  personA: "Quang Duy",
  personB: "\r\nHà Trang",
  anniversaryText: "Happy Birthday ❤️ Hà Trang",
  dayCount: "99 Days",
  startTitle: "Chạm để mở ❤️",
  startSub: "Một món quà nhỏ dành riêng cho em",
  birthdayDay: 28,

  // =========================
  // MÀU SẮC CHÍNH
  // =========================
  theme: {
    background: "#02030a",
    cyan: "#d9fbff",
    cyanStrong: "#b9f6ff",
    pink: "#ff4f78",
    red: "#ff3b30"
  },

  // Đặt file nhạc tên music.mp3 cùng thư mục với index.html.
  musicFile: "music.mp3",
  finaleMusicFile: "ketthuc.mp3",
  musicVolume: 0.62,

  // Có thể thêm/xóa/sửa các câu ở đây.
  phrases: [
    "Anh yêu em",
    "Chúc em luôn vui vẻ",
    "Vững vàng",
    "Xinh đẹp",
    "Thành công",
    "Phía sau em còn có anh",
    "Mãi bên nhau",
    "Yêu thương",
    "Bình an",
    "Quang Duy ❤️ Hà Trang"
  ],

  // =========================
  // CHỮ / ẢNH / TIM RƠI TỪ TRÊN XUỐNG
  // =========================
  falling: {
    enabled: true,

    // Số phần tử rơi tối đa cùng lúc. Tăng quá cao có thể nặng trên điện thoại.
    maxItems: 26,
    mobileMaxItems: 18,
    mobileMaxByKind: {
      text: 12,
      image: 8,
      heart: 6
    },

    // Chữ rơi
    text: {
      enabled: true,
      spawnRate: 760,          // mili-giây sinh 1 chữ. Số càng nhỏ = xuất hiện càng nhiều.
      minSpeed: 7,             // thời gian rơi (giây). Số càng nhỏ = rơi càng nhanh.
      maxSpeed: 10,
      minSize: 14,
      maxSize: 24
    },

    // Ảnh rơi
    image: {
      enabled: true,
      spawnRate: 1700,
      minSpeed: 5,
      maxSpeed: 13,
      minSize: 82,
      maxSize: 108
    },

    // Trái tim rơi
    heart: {
      enabled: true,
      spawnRate: 1150,
      minSpeed: 7,
      maxSpeed: 10,
      minSize: 13,
      maxSize: 27
    },

    // Độ lắc ngang khi rơi. Số lớn = lắc nhiều hơn.
    swayMin: 12,
    swayMax: 60,

    // Độ xoay ngẫu nhiên khi rơi.
    rotateMin: -22,
    rotateMax: 22
  },

  // =========================
  // HIỆU ỨNG SINH NHẬT NHẸ
  // =========================
  birthday: {
    enabled: true,

    // Dòng chữ sẽ được thêm vào các câu bay/rơi.
    text: "Happy Birthday",

    // Giấy màu rơi lúc vừa mở. Tăng quá cao có thể nặng trên điện thoại.
    confettiBurst: 18,
    mobileConfettiBurst: 0,

    // Pháo hoa nhỏ lặp lại thưa thưa trong nền.
    fireworkInterval: 5200,
    fireworkPieces: 18,
    mobileFireworkPieces: 0
  },

  // =========================
  // CẢNH KẾT: HẠT TỤ THÀNH TRÁI TIM 3D
  // =========================
  finale: {
    enabled: true,

    // Tính từ lúc bấm BẮT ĐẦU. 30000 = 30 giây.
    startAfter: 29000, // 29

    // Thời gian các hạt bay và tụ thành trái tim.
    assembleDuration: 6000,

    // Số hạt trên máy tính và điện thoại.
    particleCount: 1500,
    mobileParticleCount: 320,

    // Tốc độ xoay của trái tim sau khi hình thành.
    rotateSpeed: 0.00022,

    // Màu hạt tự động chuyển lần lượt.
    colors: ["#ffe783", "#ff78b7", "#c06cff"],

    title: "Quang Duy ❤️ \r\n\r\n\n Hà Trang ",
    photo: "images/ketthuc.jpg",
    mobilePhoto: "images/mobile/ketthuc.jpg",
    message: "Cảm ơn em đã xuất hiện trong cuộc đời anh ❤️",
    replayText: "XEM LẠI ❤️",
    showReplayButton: true,

    // Câu hỏi hiện sau khi vào đoạn kết. 5000 = sau 5 giây, 0 = tắt.
    proposal: {
      enabled: true,
      showAfter: 21000,//21
      question: "Em đồng ý làm vợ anh không?",
      yesText: "Có ❤️",
      noText: "Không",
      noMessage: "Rất tiếc, không cũng phải làm vợ anh ❤️",
      happyLine1: "Mãi mãi bên nhau vợ nhé ❤️",
      happyLine2: "Anh yêu Em ❤️",

      // 2 ảnh trang trí ở đoạn kết mới sau khi bấm "Có".
      // Đổi sang ảnh bạn muốn, ví dụ: "images/68.jpg"
        imageLeft: "images/leftimage.jpg",
        imageRight: "images/rightimage.jpg",
        mobileImageLeft: "images/leftimage.jpg",
      mobileImageRight: "images/mobile/rightimage.jpg",

      // Video phát ở màn "Mãi mãi bên nhau..." sau khi bấm Có/Không.
      video: "video.mp4",
      videoMuted: false,
      videoLoop: false
    },

    // Màn pháo hoa sinh nhật cuối cùng sau màn viên mãn.
    birthdayFinale: {
      enabled: true,
      showAfter: 29000,
      title: "Chúc mừng sinh nhật vợ yêu ❤️",
        message: "Chúc em luôn hạnh phúc, mọi sự như ý, bình an và mãi bên anh.❤️❤️❤️❤️❤️",
      musicFile: "sinhnhat.mp4",
      musicVolume: 0.45,
      useMelody: false,
      fireworkCount: 12,
      mobileFireworkCount: 5,
      fireworkBurstCount: 3,
      mobileFireworkBurstCount: 1
    },

    // 0 = giữ nguyên cảnh kết. Ví dụ 20000 = tự chạy lại sau 20 giây.
    autoReplayAfter: 0
  },

  // Nếu để [] thì chữ rơi sẽ tự dùng danh sách phrases ở trên.
  fallTexts: [],

  // THÊM ẢNH RƠI:
  // 1. Tạo thư mục images cạnh index.html.
  // 2. Chép ảnh vào đó.
  // 3. Thêm đường dẫn như ví dụ dưới đây.
  fallImages: [
    "images/8.jpg",
    "images/11.jpg",
    "images/16.jpg",
    "images/17.jpg",
    "images/19.jpg",
    "images/20.jpg",
    "images/21.jpg",
    "images/25.jpg",
    "images/28.jpg",
    "images/29.jpg",
    "images/30.jpg",
    "images/32.jpg",
    "images/34.jpg",
    "images/35.jpg",
    "images/36.jpg",
    "images/38.jpg",
    "images/39.jpg",
    "images/40.jpg",
    "images/41.jpg",
    "images/42.jpg",
    "images/43.jpg",
    "images/44.jpg",
    "images/47.jpg",
    "images/49.jpg",
    "images/50.jpg",
    "images/51.jpg",
    "images/52.jpg",
    "images/53.jpg",
    "images/54.jpg",
    "images/55.jpg",
    "images/56.jpg",
    "images/58.jpg",
    "images/59.jpg",
    "images/61.jpg",
    "images/66.jpg",
    "images/68.jpg",
    "images/69.jpg",
    "images/70.jpg",
    "images/71.jpg",
    "images/72.jpg",
    "images/77.jpg"
  ],

  // Ảnh nhỏ riêng cho điện thoại để hiệu ứng rơi mượt hơn.
  mobileFallImages: [
    "images/mobile/8.jpg",
    "images/mobile/11.jpg",
    "images/mobile/16.jpg",
    "images/mobile/17.jpg",
    "images/mobile/19.jpg",
    "images/mobile/20.jpg",
    "images/mobile/21.jpg",
    "images/mobile/25.jpg",
    "images/mobile/28.jpg",
    "images/mobile/29.jpg",
    "images/mobile/30.jpg",
    "images/mobile/32.jpg",
    "images/mobile/34.jpg",
    "images/mobile/35.jpg",
    "images/mobile/36.jpg",
    "images/mobile/38.jpg",
    "images/mobile/39.jpg",
    "images/mobile/40.jpg",
    "images/mobile/41.jpg",
    "images/mobile/42.jpg",
    "images/mobile/43.jpg",
    "images/mobile/44.jpg",
    "images/mobile/47.jpg",
    "images/mobile/49.jpg",
    "images/mobile/50.jpg",
    "images/mobile/51.jpg",
    "images/mobile/52.jpg",
    "images/mobile/53.jpg",
    "images/mobile/54.jpg",
    "images/mobile/55.jpg",
    "images/mobile/56.jpg",
    "images/mobile/58.jpg",
    "images/mobile/59.jpg",
    "images/mobile/61.jpg",
    "images/mobile/66.jpg",
    "images/mobile/68.jpg",
    "images/mobile/69.jpg",
    "images/mobile/70.jpg",
    "images/mobile/71.jpg",
    "images/mobile/72.jpg",
    "images/mobile/77.jpg"
  ]
};
