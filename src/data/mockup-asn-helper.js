// asn-helper/index.js;
export const asnHelperHomepage = {
  pageData: {
    meta: {
      title: "ASN Helper - Rumah ASN Jawa Timur",
      description: "Tempat ASN Jatim saling bantu dan berbagi",
    },
    user: {
      id: "user_123",
      name: "Ahmad Fauzi",
      title: "Kasubag Kepegawaian",
      institution: "BKD Jatim",
      avatar: "/avatars/user_123.jpg",
      isHelper: true,
      helperLevel: "expert",
      availabilityStatus: "online",
    },
    heroSection: {
      welcomeMessage: "Selamat datang, Ahmad!",
      subMessage: "Ada 12 ASN yang butuh bantuanmu hari ini",
      callToActions: [
        { label: "Minta Bantuan", href: "/bantuan/buat", variant: "primary" },
        { label: "Beri Bantuan", href: "/bantuan/beri", variant: "secondary" },
      ],
    },
    quickStats: {
      totalHelpsThisWeek: 347,
      activeHelpersNow: 23,
      avgResponseTime: "8 menit",
      successRate: 94,
    },
    recentHelpRequests: [
      {
        id: "req_001",
        title: "Butuh template SK pengangkatan CPNS",
        category: "dokumen",
        urgency: "normal",
        timeAgo: "5 menit yang lalu",
        location: "Malang",
        requesterName: "Sari L.",
        status: "waiting_for_help",
      },
    ],
    availableHelpers: [
      {
        id: "helper_001",
        name: "Lisa Permata",
        expertise: ["sipkd", "teknis"],
        rating: 4.8,
        responseTime: "< 10 menit",
        isOnline: true,
      },
    ],
    myImpact: {
      helpsGivenThisMonth: 23,
      averageRating: 4.9,
      responseTime: "5 menit",
      badgeProgress: {
        current: "expert_helper",
        next: "super_helper",
        progress: 75,
      },
    },
  },
};

// asn-helper/bantuan/buat.js;
export const asnHelperCreateHelpRequest = {
  pageData: {
    meta: {
      title: "Buat Permintaan Bantuan - ASN Helper",
    },
    formConfig: {
      categories: [
        { id: "dokumen", name: "Dokumen & Template", icon: "📄" },
        { id: "regulasi", name: "Regulasi & Kebijakan", icon: "📋" },
        { id: "teknis", name: "Teknis & Troubleshooting", icon: "⚙️" },
        { id: "keuangan", name: "Keuangan & SIPKD", icon: "💰" },
        { id: "lainnya", name: "Lainnya", icon: "❓" },
      ],
      urgencyLevels: [
        {
          id: "normal",
          name: "Normal",
          description: "Bisa menunggu 1-2 hari",
          color: "green",
        },
        {
          id: "urgent",
          name: "Urgent",
          description: "Butuh bantuan hari ini",
          color: "orange",
        },
        {
          id: "very_urgent",
          name: "Sangat Urgent",
          description: "Butuh bantuan sekarang juga",
          color: "red",
        },
      ],
      suggestedTags: [
        "sk_pengangkatan",
        "sipkd",
        "spj",
        "kenaikan_pangkat",
        "template_surat",
        "regulasi_terbaru",
        "input_data",
        "error_system",
        "laporan_bulanan",
      ],
    },
    helpTips: [
      "Jelaskan masalah dengan detail agar helper bisa bantu lebih cepat",
      "Sertakan screenshot jika ada error teknis",
      "Mention deadline jika ada urgency tertentu",
    ],
    recentSimilarRequests: [
      {
        id: "req_similar_001",
        title: "Template SK pengangkatan CPNS terbaru",
        isResolved: true,
        resolvedTime: "15 menit",
      },
    ],
  },
};

// asn-helper/bantuan/saya.js;
export const asnHelperRequestMe = {
  pageData: {
    meta: {
      title: "Permintaan Bantuan Saya - ASN Helper",
    },
    summary: {
      totalRequests: 15,
      resolved: 12,
      pending: 2,
      inProgress: 1,
      averageResolutionTime: "2.5 jam",
    },
    filterTabs: [
      { id: "semua", name: "Semua", count: 15 },
      { id: "pending", name: "Menunggu", count: 2 },
      { id: "in_progress", name: "Sedang Dibantu", count: 1 },
      { id: "resolved", name: "Selesai", count: 12 },
    ],
    myRequests: [
      {
        id: "req_user_001",
        title: "Cara input SPJ dengan akun baru di SIPKD",
        category: "teknis",
        status: "in_progress",
        createdAt: "2025-06-07T09:00:00Z",
        helper: {
          id: "helper_001",
          name: "Lisa Permata",
          avatar: "/avatars/helper_001.jpg",
        },
        responseCount: 3,
        lastActivity: "2025-06-07T10:30:00Z",
        estimatedCompletion: "30 menit lagi",
      },
      {
        id: "req_user_002",
        title: "Template surat pengantar untuk proposal kegiatan",
        category: "dokumen",
        status: "resolved",
        createdAt: "2025-06-05T14:00:00Z",
        helper: {
          id: "helper_002",
          name: "Ahmad Fauzi",
          avatar: "/avatars/helper_002.jpg",
        },
        resolutionTime: "45 menit",
        rating: 5,
        feedback: "Sangat membantu, template lengkap!",
      },
    ],
  },
};

// asn-helper/bantuan/beri.js;
export const asnHelperBrowseRequestToHelp = {
  pageData: {
    meta: {
      title: "Beri Bantuan - ASN Helper",
    },
    helperStats: {
      helpsGivenTotal: 156,
      helpsGivenThisWeek: 8,
      averageRating: 4.9,
      responseRate: 95,
      currentWorkload: 2,
      maxConcurrentHelps: 5,
    },
    filters: {
      categories: [
        { id: "all", name: "Semua Kategori", count: 47 },
        { id: "dokumen", name: "Dokumen", count: 15 },
        { id: "regulasi", name: "Regulasi", count: 8 },
        { id: "teknis", name: "Teknis", count: 20 },
        { id: "keuangan", name: "Keuangan", count: 4 },
      ],
      urgency: [
        { id: "all", name: "Semua Urgency", count: 47 },
        { id: "very_urgent", name: "Sangat Urgent", count: 3 },
        { id: "urgent", name: "Urgent", count: 8 },
        { id: "normal", name: "Normal", count: 36 },
      ],
      location: [
        { id: "all", name: "Semua Lokasi", count: 47 },
        { id: "nearby", name: "Terdekat (< 25km)", count: 23 },
        { id: "same_city", name: "Kota yang Sama", count: 15 },
      ],
    },
    availableRequests: [
      {
        id: "req_help_001",
        title: "URGENT: Error input SPJ deadline hari ini",
        description: "Mohon bantuan, error saat input SPJ di SIPKD...",
        category: "teknis",
        urgency: "very_urgent",
        createdAt: "2025-06-07T10:00:00Z",
        deadline: "2025-06-07T16:00:00Z",
        requester: {
          name: "Bambang W.",
          title: "Bendahara",
          institution: "Dinkes Surabaya",
          avatar: "/avatars/requester_001.jpg",
        },
        location: {
          city: "Surabaya",
          distance: "3 km",
        },
        tags: ["sipkd", "spj", "error", "deadline"],
        matchingScore: 0.95,
        estimatedTime: "30 menit",
        currentResponders: 2,
      },
    ],
    recommendedForYou: [
      {
        id: "req_rec_001",
        title: "Butuh panduan kenaikan pangkat PNS",
        matchReason: "Sesuai expertise: kepegawaian, regulasi",
        urgency: "normal",
        location: "Malang (12 km)",
      },
    ],
  },
};

// asn-helper/bantuan/riwayat.js;
export const asnHelperHistory = {
  pageData: {
    meta: {
      title: "Riwayat Bantuan - ASN Helper",
    },
    periodFilter: {
      selected: "this_month",
      options: [
        { id: "this_week", name: "Minggu Ini" },
        { id: "this_month", name: "Bulan Ini" },
        { id: "last_3_months", name: "3 Bulan Terakhir" },
        { id: "all_time", name: "Semua Waktu" },
      ],
    },
    summary: {
      period: "Bulan Ini",
      totalInteractions: 35,
      helpsGiven: 23,
      helpsReceived: 12,
      averageRating: 4.8,
      totalTimeSpent: "18 jam 30 menit",
    },
    historyTabs: [
      { id: "given", name: "Bantuan Diberikan", count: 23 },
      { id: "received", name: "Bantuan Diterima", count: 12 },
    ],
    historyItems: [
      {
        id: "hist_001",
        type: "given",
        title: "Membantu troubleshoot error SIPKD",
        partner: {
          name: "Bambang W.",
          institution: "Dinkes Surabaya",
        },
        date: "2025-06-06T14:30:00Z",
        duration: "25 menit",
        category: "teknis",
        rating: 5,
        feedback: "Sangat membantu! Masalah selesai dengan cepat.",
        tags: ["sipkd", "troubleshoot", "spj"],
      },
      {
        id: "hist_002",
        type: "received",
        title: "Mendapat template surat pengantar",
        partner: {
          name: "Ahmad Fauzi",
          institution: "BKD Jatim",
        },
        date: "2025-06-05T09:15:00Z",
        duration: "15 menit",
        category: "dokumen",
        rating: 5,
        feedback: "Template sangat lengkap dan sesuai format terbaru",
        tags: ["template", "surat_pengantar"],
      },
    ],
  },
};

// asn-helper/bantuan/detail.js;
export const asnHelperHelpRequestDetail = {
  pageData: {
    meta: {
      title: "Detail Permintaan Bantuan - ASN Helper",
    },
    helpRequest: {
      id: "req_001",
      title: "Butuh template SK pengangkatan CPNS terbaru",
      description:
        "Selamat siang, saya butuh template SK pengangkatan CPNS yang sesuai dengan regulasi terbaru. Untuk keperluan 15 CPNS yang akan dilantik bulan depan. Mohon template yang sudah include lampiran persyaratan lengkap.",
      category: "dokumen",
      urgency: "normal",
      status: "waiting_for_help",
      createdAt: "2025-06-07T09:30:00Z",
      deadline: null,
      tags: ["sk_pengangkatan", "cpns", "template", "regulasi"],
      attachments: [],
      requester: {
        id: "user_456",
        name: "Sari Lestari",
        title: "Staff BKD Malang",
        institution: "BKD Kabupaten Malang",
        avatar: "/avatars/user_456.jpg",
        joinDate: "2024-03-15",
        helpRequestsCount: 8,
        averageRating: 4.2,
      },
      location: {
        city: "Malang",
        province: "Jawa Timur",
        distance: "12 km dari Anda",
      },
    },
    responses: [
      {
        id: "resp_001",
        helperId: "helper_001",
        helperName: "Ahmad Fauzi",
        helperTitle: "Kasubag Kepegawaian",
        helperInstitution: "BKD Jatim",
        helperAvatar: "/avatars/helper_001.jpg",
        helperRating: 4.9,
        message:
          "Saya punya template SK pengangkatan CPNS terbaru sesuai Permenpan RB No. 27/2021. Sudah include semua lampiran yang dibutuhkan.",
        responseTime: "5 menit",
        createdAt: "2025-06-07T09:35:00Z",
        attachments: [
          {
            type: "document",
            name: "Template_SK_CPNS_2025.docx",
            size: "45 KB",
            url: "/uploads/template_sk_cpns.docx",
          },
        ],
        isSelected: false,
      },
    ],
    similarResolved: [
      {
        id: "similar_001",
        title: "Template SK kenaikan pangkat",
        resolvedTime: "20 menit",
        helperName: "Lisa P.",
      },
    ],
    userPermissions: {
      canRespond: true,
      canEdit: false,
      canDelete: false,
      canSelectHelper: false,
    },
  },
};

// asn-helper/bantuan/[id]/chat.js;
export const asnHelperChatConversation = {
  pageData: {
    meta: {
      title: "Chat Bantuan - ASN Helper",
    },
    conversation: {
      id: "conv_001",
      helpRequestId: "req_001",
      status: "active",
      startedAt: "2025-06-07T09:40:00Z",
      participants: [
        {
          id: "user_456",
          name: "Sari Lestari",
          role: "requester",
          avatar: "/avatars/user_456.jpg",
          isOnline: true,
          lastSeen: "2025-06-07T10:45:00Z",
        },
        {
          id: "helper_001",
          name: "Ahmad Fauzi",
          role: "helper",
          avatar: "/avatars/helper_001.jpg",
          isOnline: true,
          lastSeen: "2025-06-07T10:43:00Z",
        },
      ],
    },
    messages: [
      {
        id: "msg_001",
        senderId: "helper_001",
        senderName: "Ahmad Fauzi",
        content:
          "Halo Bu Sari, saya bisa bantu dengan template SK CPNS. Saya kirim template terbaru ya.",
        timestamp: "2025-06-07T09:40:00Z",
        type: "text",
        isRead: true,
      },
      {
        id: "msg_002",
        senderId: "helper_001",
        senderName: "Ahmad Fauzi",
        content: "",
        timestamp: "2025-06-07T09:41:00Z",
        type: "file",
        attachment: {
          name: "Template_SK_CPNS_2025.docx",
          size: "45 KB",
          url: "/uploads/template_sk_cpns.docx",
          preview: "/previews/template_preview.jpg",
        },
        isRead: true,
      },
      {
        id: "msg_003",
        senderId: "user_456",
        senderName: "Sari Lestari",
        content:
          "Wah makasih banyak Pak Ahmad! Ini persis yang saya butuhkan. Lampiran persyaratannya lengkap banget.",
        timestamp: "2025-06-07T09:45:00Z",
        type: "text",
        isRead: true,
      },
    ],
    quickActions: [
      "Terima kasih banyak!",
      "Boleh minta penjelasan lebih detail?",
      "Masalah sudah selesai",
      "Butuh bantuan tambahan",
    ],
    helpStatus: {
      canMarkComplete: true,
      requiresRating: true,
      estimatedTimeRemaining: "5 menit",
    },
  },
};

// asn-helper/bantuan/[id]/selesai.js;
export const asnHelperMarkComplete = {
  pageData: {
    meta: {
      title: "Selesaikan Bantuan - ASN Helper",
    },
    helpRequest: {
      id: "req_001",
      title: "Butuh template SK pengangkatan CPNS terbaru",
      helper: {
        id: "helper_001",
        name: "Ahmad Fauzi",
        avatar: "/avatars/helper_001.jpg",
      },
      startTime: "2025-06-07T09:40:00Z",
      duration: "25 menit",
    },
    completionForm: {
      ratingOptions: [
        {
          value: 5,
          label: "Sangat Membantu",
          description: "Masalah selesai sempurna",
        },
        {
          value: 4,
          label: "Membantu",
          description: "Masalah sebagian besar selesai",
        },
        {
          value: 3,
          label: "Cukup Membantu",
          description: "Ada progress tapi belum tuntas",
        },
        { value: 2, label: "Kurang Membantu", description: "Minimal progress" },
        {
          value: 1,
          label: "Tidak Membantu",
          description: "Tidak ada progress",
        },
      ],
      predefinedFeedback: [
        "Sangat responsif dan helpful!",
        "Penjelasan detail dan mudah dipahami",
        "File/template yang diberikan sangat berguna",
        "Sabar dalam memberikan panduan",
        "Masalah selesai dengan cepat",
      ],
      impactQuestions: [
        {
          id: "time_saved",
          question: "Berapa waktu yang dihemat dengan bantuan ini?",
          options: ["< 1 jam", "1-3 jam", "3-8 jam", "1 hari", "> 1 hari"],
        },
        {
          id: "knowledge_gained",
          question: "Apakah Anda belajar hal baru dari bantuan ini?",
          options: [
            "Ya, sangat banyak",
            "Ya, beberapa hal",
            "Sedikit",
            "Tidak",
          ],
        },
      ],
    },
    nextActions: [
      {
        id: "share_success",
        title: "Bagikan Success Story",
        description: "Bantu motivasi komunitas dengan cerita sukses Anda",
      },
      {
        id: "help_others",
        title: "Bantu ASN Lain",
        description: "Sekarang giliran Anda membantu yang lain",
      },
      {
        id: "save_solution",
        title: "Simpan ke Knowledge Base",
        description: "Agar solusi ini bisa membantu ASN lain",
      },
    ],
  },
};

// asn-helper/dashboard.js;
export const asnHelperDashboard = {
  pageData: {
    meta: {
      title: "Dashboard Helper - ASN Helper",
    },
    helperProfile: {
      id: "helper_001",
      name: "Ahmad Fauzi",
      title: "Kasubag Kepegawaian",
      institution: "BKD Jatim",
      avatar: "/avatars/helper_001.jpg",
      helperSince: "2024-01-15",
      currentLevel: "expert",
      nextLevel: "super_helper",
      levelProgress: 75,
    },
    overviewStats: {
      totalHelpsGiven: 156,
      averageRating: 4.9,
      responseRate: 95,
      averageResponseTime: "5 menit",
      successRate: 97,
      totalTimeSpent: "78 jam 30 menit",
      thankYouMessages: 147,
    },
    monthlyStats: {
      helpsThisMonth: 23,
      hoursThisMonth: 12.5,
      newConnectionsThisMonth: 15,
      ratingThisMonth: 4.9,
      goal: {
        target: 30,
        progress: 77,
        daysLeft: 8,
      },
    },
    categoryBreakdown: [
      { category: "kepegawaian", count: 67, percentage: 43 },
      { category: "regulasi", count: 45, percentage: 29 },
      { category: "dokumen", count: 32, percentage: 20 },
      { category: "teknis", count: 12, percentage: 8 },
    ],
    recentActivity: [
      {
        id: "activity_001",
        type: "help_completed",
        title: "Membantu troubleshoot SIPKD",
        partner: "Bambang W.",
        date: "2025-06-06T14:30:00Z",
        rating: 5,
        duration: "25 menit",
      },
    ],
    achievements: [
      {
        id: "badge_001",
        name: "Quick Responder",
        description: "Response time rata-rata < 10 menit",
        icon: "⚡",
        earnedDate: "2025-05-15",
        isRecent: false,
      },
      {
        id: "badge_002",
        name: "Kepegawaian Expert",
        description: "50+ bantuan di kategori kepegawaian",
        icon: "👑",
        earnedDate: "2025-06-01",
        isRecent: true,
      },
    ],
    upcomingMilestones: [
      {
        id: "milestone_001",
        title: "Super Helper Badge",
        description: "7 bantuan lagi untuk mencapai level Super Helper",
        progress: 75,
        target: 200,
        current: 156,
      },
    ],
  },
};

// asn-helper/leaderboard.js;
export const asnHelperLeaderBoard = {
  pageData: {
    meta: {
      title: "Leaderboard Helper - ASN Helper",
    },
    leaderboardPeriod: {
      current: "this_month",
      options: [
        { id: "this_week", name: "Minggu Ini" },
        { id: "this_month", name: "Bulan Ini" },
        { id: "this_quarter", name: "Kuartal Ini" },
        { id: "all_time", name: "Sepanjang Masa" },
      ],
    },
    categories: [
      { id: "overall", name: "Overall", icon: "🏆" },
      { id: "most_helps", name: "Terbanyak Membantu", icon: "🤝" },
      { id: "fastest_response", name: "Tercepat Merespon", icon: "⚡" },
      { id: "highest_rating", name: "Rating Tertinggi", icon: "⭐" },
      { id: "most_active", name: "Paling Aktif", icon: "🔥" },
    ],
    topHelpers: [
      {
        rank: 1,
        id: "helper_001",
        name: "Ahmad Fauzi",
        title: "Kasubag Kepegawaian",
        institution: "BKD Jatim",
        avatar: "/avatars/helper_001.jpg",
        stats: {
          helpsThisMonth: 34,
          averageRating: 4.9,
          responseTime: "3 menit",
          successRate: 98,
        },
        badges: ["expert_helper", "quick_responder", "top_contributor"],
        trend: "up",
        previousRank: 2,
      },
      {
        rank: 2,
        id: "helper_002",
        name: "Lisa Permata",
        title: "Staff IT Diskominfo",
        institution: "Diskominfo Sidoarjo",
        avatar: "/avatars/helper_002.jpg",
        stats: {
          helpsThisMonth: 31,
          averageRating: 4.8,
          responseTime: "5 menit",
          successRate: 96,
        },
        badges: ["sipkd_expert", "helpful_member"],
        trend: "down",
        previousRank: 1,
      },
    ],
    currentUserRank: {
      rank: 5,
      outOf: 234,
      category: "overall",
      trend: "up",
      pointsToNextRank: 12,
      encouragement: "3 bantuan lagi untuk naik ke rank 4!",
    },
    achievements: [
      {
        id: "monthly_champion",
        title: "Champion Bulan Juni",
        winner: "Ahmad Fauzi",
        criteria: "Terbanyak membantu dengan rating tertinggi",
        prize: "Special badge + spotlight di homepage",
      },
    ],
    categoryLeaders: [
      {
        category: "kepegawaian",
        leader: {
          name: "Ahmad Fauzi",
          helps: 67,
          expertise: "SK & Regulasi",
        },
      },
      {
        category: "teknis",
        leader: {
          name: "Lisa Permata",
          helps: 45,
          expertise: "SIPKD & Troubleshooting",
        },
      },
    ],
  },
};

// asn-helper/profil.js;
export const asnHelperProfile = {
  pageData: {
    meta: {
      title: "Profil Helper - ASN Helper",
    },
    currentProfile: {
      id: "helper_001",
      basicInfo: {
        name: "Ahmad Fauzi",
        title: "Kasubag Kepegawaian",
        institution: "BKD Provinsi Jawa Timur",
        location: "Surabaya",
        workingHours: "08:00-16:00",
        timeZone: "WIB",
      },
      expertise: [
        {
          category: "kepegawaian",
          level: "expert",
          yearsExperience: 12,
          certifications: ["Brevet Kepegawaian Tingkat Lanjut"],
          specificSkills: ["SK Pengangkatan", "Kenaikan Pangkat", "Mutasi PNS"],
        },
        {
          category: "regulasi",
          level: "advanced",
          yearsExperience: 8,
          certifications: [],
          specificSkills: ["Permenpan RB", "PP Kepegawaian", "UU ASN"],
        },
      ],
      availability: {
        isHelper: true,
        maxConcurrentHelps: 5,
        preferredCategories: ["kepegawaian", "regulasi"],
        workingDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        breakTimes: ["12:00-13:00"],
        autoResponse: "Saya akan merespon dalam 10 menit selama jam kerja.",
      },
      communication: {
        preferredMethods: ["chat", "voice_message"],
        languages: ["indonesian", "javanese"],
        responseStyle: "detail_oriented",
        specializations: ["step_by_step_guidance", "template_sharing"],
      },
    },
    formConfig: {
      expertiseCategories: [
        { id: "kepegawaian", name: "Kepegawaian", icon: "👥" },
        { id: "keuangan", name: "Keuangan & SIPKD", icon: "💰" },
        { id: "regulasi", name: "Regulasi & Kebijakan", icon: "📋" },
        { id: "teknis", name: "Teknis & IT", icon: "⚙️" },
        { id: "dokumen", name: "Dokumen & Template", icon: "📄" },
      ],
      experienceLevels: [
        { id: "beginner", name: "Pemula", description: "0-2 tahun pengalaman" },
        {
          id: "intermediate",
          name: "Menengah",
          description: "3-7 tahun pengalaman",
        },
        {
          id: "advanced",
          name: "Lanjutan",
          description: "8-15 tahun pengalaman",
        },
        { id: "expert", name: "Expert", description: "15+ tahun pengalaman" },
      ],
      communicationStyles: [
        { id: "concise", name: "Ringkas & To the Point" },
        { id: "detail_oriented", name: "Detail & Komprehensif" },
        { id: "visual", name: "Visual dengan Screenshot" },
        { id: "step_by_step", name: "Step-by-Step Guide" },
      ],
    },
    profileStats: {
      completeness: 85,
      missingFields: ["certifications", "languages"],
      lastUpdated: "2025-06-01T10:00:00Z",
      profileViews: 234,
      helpRequestsReceived: 89,
    },
  },
};
