export interface ICommune {
  id: string;
  name: string;
  nameKh: string;
}

export interface IDistrict {
  id: string;
  name: string;
  nameKh: string;
  communes: ICommune[];
}

export interface IProvince {
  id: string;
  name: string;
  nameKh: string;
  districts: IDistrict[];
}

export const CAMBODIA_LOCATIONS: IProvince[] = [
  {
    id: 'siem-reap',
    name: 'Siem Reap',
    nameKh: 'សៀមរាប',
    districts: [
      {
        id: 'siem-reap-city',
        name: 'Siem Reap City',
        nameKh: 'ក្រុងសៀមរាប',
        communes: [
          { id: 'svay-dangkum', name: 'Svay Dangkum', nameKh: 'ស្វាយដង្គំ' },
          { id: 'sala-kamreuk', name: 'Sala Kamreuk', nameKh: 'សាលាកំរើក' },
          { id: 'sla-kram', name: 'Sla Kram', nameKh: 'ស្លក្រាម' },
          { id: 'kouk-chak', name: 'Kouk Chak', nameKh: 'គោកចក' },
          { id: 'nokor-thum', name: 'Nokor Thum', nameKh: 'នគរធំ' },
        ],
      },
      {
        id: 'prasat-bakong',
        name: 'Prasat Bakong',
        nameKh: 'ប្រាសាទបាគង',
        communes: [
          { id: 'bakong', name: 'Bakong', nameKh: 'បាគង' },
          { id: 'ballangk', name: 'Ballangk', nameKh: 'បល្ល័ង្ក' },
          { id: 'kampong-phluk', name: 'Kampong Phluk', nameKh: 'កំពង់ភ្លុក' },
          { id: 'kantreang', name: 'Kantreang', nameKh: 'កន្ត្រាំង' },
          { id: 'kandaek', name: 'Kandaek', nameKh: 'កណ្ដែក' },
        ],
      },
      {
        id: 'banteay-srei',
        name: 'Banteay Srei',
        nameKh: 'បន្ទាយស្រី',
        communes: [
          { id: 'khnar-sanday', name: 'Khnar Sanday', nameKh: 'ខ្នារសណ្ដាយ' },
          { id: 'khun-ream', name: 'Khun Ream', nameKh: 'ឃុនរាម' },
          { id: 'preah-dak', name: 'Preah Dak', nameKh: 'ព្រះដាក់' },
          { id: 'rumchek', name: 'Rumchek', nameKh: 'រំចេក' },
          { id: 'run-ta-aek', name: 'Run Ta Aek', nameKh: 'រុនតាឯក' },
        ],
      },
      {
        id: 'angkor-thom',
        name: 'Angkor Thom',
        nameKh: 'អង្គរធំ',
        communes: [
          { id: 'chob-ta-trav', name: 'Chob Ta Trav', nameKh: 'ជប់តាត្រាវ' },
          { id: 'leang-dai', name: 'Leang Dai', nameKh: 'លាងដៃ' },
          { id: 'peak-snaeng', name: 'Peak Snaeng', nameKh: 'ពាក់ស្នែង' },
          { id: 'svay-chek', name: 'Svay Chek', nameKh: 'ស្វាយចេក' },
          { id: 'angkor-thom-commune', name: 'Angkor Thom', nameKh: 'អង្គរធំ' },
        ],
      },
      {
        id: 'angkor-chum',
        name: 'Angkor Chum',
        nameKh: 'អង្គរជុំ',
        communes: [
          { id: 'char-chhuk', name: 'Char Chhuk', nameKh: 'ចារឈូក' },
          { id: 'doun-peng', name: 'Doun Peng', nameKh: 'ដូនពែង' },
          { id: 'kouk-doung', name: 'Kouk Doung', nameKh: 'គោកដូង' },
          { id: 'koul', name: 'Koul', nameKh: 'កោល' },
          { id: 'nokor-pheas', name: 'Nokor Pheas', nameKh: 'នគរភាស' },
        ],
      },
      {
        id: 'puok',
        name: 'Puok',
        nameKh: 'ពួក',
        communes: [
          { id: 'sasar-sdam', name: 'Sasar Sdam', nameKh: 'សសរស្ដម្ភ' },
          { id: 'doun-kaev', name: 'Doun Kaev', nameKh: 'ដូនកែវ' },
          { id: 'kdei-run', name: 'Kdei Run', nameKh: 'ក្ដីរុន' },
          { id: 'puok-commune', name: 'Puok', nameKh: 'ពួក' },
          { id: 'prey-chruk', name: 'Prey Chruk', nameKh: 'ព្រៃជ្រូក' },
        ],
      },
      {
        id: 'soutr-nikom',
        name: 'Soutr Nikom',
        nameKh: 'សូទ្រនិគម',
        communes: [
          { id: 'chan-sa', name: 'Chan Sa', nameKh: 'ចាន់ស' },
          { id: 'dam-daek', name: 'Dam Daek', nameKh: 'ដំដែក' },
          { id: 'dan-run', name: 'Dan Run', nameKh: 'ដានរុន' },
          { id: 'kampong-khleang', name: 'Kampong Khleang', nameKh: 'កំពង់ឃ្លាំង' },
          { id: 'ta-yaek', name: 'Ta Yaek', nameKh: 'តាយ៉ែក' },
        ],
      },
      {
        id: 'chi-kreng',
        name: 'Chi Kreng',
        nameKh: 'ជីក្រែង',
        communes: [
          { id: 'anlong-samnar', name: 'Anlong Samnar', nameKh: 'អន្លង់សំណរ' },
          { id: 'chi-kreng-commune', name: 'Chi Kreng', nameKh: 'ជីក្រែង' },
          { id: 'kampong-kdei', name: 'Kampong Kdei', nameKh: 'កំពង់ក្ដី' },
          { id: 'khvav', name: 'Khvav', nameKh: 'ខ្វាវ' },
          { id: 'spean-tnaot', name: 'Spean Tnaot', nameKh: 'ស្ពានត្នោត' },
        ],
      },
      {
        id: 'kralanh',
        name: 'Kralanh',
        nameKh: 'ក្រឡាញ់',
        communes: [
          { id: 'chanleas-dai', name: 'Chanleas Dai', nameKh: 'ចន្លាស់ដៃ' },
          { id: 'kampong-thkov', name: 'Kampong Thkov', nameKh: 'កំពង់ថ្កូវ' },
          { id: 'kralanh-commune', name: 'Kralanh', nameKh: 'ក្រឡាញ់' },
          { id: 'saen-sokh', name: 'Saen Sokh', nameKh: 'សែនសុខ' },
          { id: 'sranal', name: 'Sranal', nameKh: 'ស្រណាឡ' },
        ],
      },
      {
        id: 'svay-leu',
        name: 'Svay Leu',
        nameKh: 'ស្វាយលើ',
        communes: [
          { id: 'boeng-mealea', name: 'Boeng Mealea', nameKh: 'បឹងមាលា' },
          { id: 'kantuot', name: 'Kantuot', nameKh: 'កន្តួត' },
          { id: 'khnang-phnum', name: 'Khnang Phnum', nameKh: 'ខ្នងភ្នំ' },
          { id: 'svay-leu-commune', name: 'Svay Leu', nameKh: 'ស្វាយលើ' },
          { id: 'ta-siem', name: 'Ta Siem', nameKh: 'តាសៀម' },
        ],
      },
    ],
  },
  {
    id: 'phnom-penh',
    name: 'Phnom Penh',
    nameKh: 'ភ្នំពេញ',
    districts: [
      {
        id: 'chamkarmon',
        name: 'Chamkarmon',
        nameKh: 'ចំការមន',
        communes: [
          { id: 'tonle-bassac', name: 'Tonle Bassac', nameKh: 'ទន្លេបាសាក់' },
          { id: 'boeung-keng-kang-1', name: 'Boeung Keng Kang 1', nameKh: 'បឹងកេងកង១' },
        ],
      },
      {
        id: 'daun-penh',
        name: 'Daun Penh',
        nameKh: 'ដូនពេញ',
        communes: [
          { id: 'phsar-thmei-1', name: 'Phsar Thmei 1', nameKh: 'ផ្សារថ្មី១' },
          { id: 'chey-choumnas', name: 'Chey Choumnas', nameKh: 'ជ័យជំនះ' },
        ],
      },
    ],
  },
  {
    id: 'battambang',
    name: 'Battambang',
    nameKh: 'បាត់ដំបង',
    districts: [
      {
        id: 'battambang-city',
        name: 'Battambang City',
        nameKh: 'ក្រុងបាត់ដំបង',
        communes: [
          { id: 'svay-pao', name: 'Svay Pao', nameKh: 'ស្វាយប៉ោ' },
          { id: 'rotanak', name: 'Rotanak', nameKh: 'រតនៈ' },
        ],
      },
      {
        id: 'moung-ruessei',
        name: 'Moung Ruessei',
        nameKh: 'មោងឫស្សី',
        communes: [
          { id: 'moung', name: 'Moung', nameKh: 'មោង' },
          { id: 'kakaoh', name: 'Kakaoh', nameKh: 'កកោះ' },
        ],
      },
    ],
  },
  {
    id: 'kampot',
    name: 'Kampot',
    nameKh: 'កំពត',
    districts: [
      {
        id: 'kampot-city',
        name: 'Kampot City',
        nameKh: 'ក្រុងកំពត',
        communes: [
          { id: 'kampong-bay', name: 'Kampong Bay', nameKh: 'កំពង់បាយ' },
          { id: 'andoung-khmer', name: 'Andoung Khmer', nameKh: 'អណ្តូងខ្មែរ' },
        ],
      },
    ],
  },
  {
    id: 'preah-sihanouk',
    name: 'Preah Sihanouk',
    nameKh: 'ព្រះសីហនុ',
    districts: [
      {
        id: 'sihanoukville',
        name: 'Sihanoukville',
        nameKh: 'ក្រុងព្រះសីហនុ',
        communes: [
          { id: 'sangkat-1', name: 'Sangkat 1', nameKh: 'សង្កាត់លេខ១' },
          { id: 'sangkat-4', name: 'Sangkat 4', nameKh: 'សង្កាត់លេខ៤' },
        ],
      },
    ],
  },
  {
    id: 'kandal',
    name: 'Kandal',
    nameKh: 'កណ្តាល',
    districts: [
      {
        id: 'ta-khmau',
        name: 'Ta Khmau',
        nameKh: 'ក្រុងតាខ្មៅ',
        communes: [
          { id: 'ta-khmau-commune', name: 'Ta Khmau', nameKh: 'តាខ្មៅ' },
          { id: 'prek-ho', name: 'Prek Ho', nameKh: 'ព្រែកហូរ' },
        ],
      },
    ],
  },
  {
    id: 'kampong-cham',
    name: 'Kampong Cham',
    nameKh: 'កំពង់ចាម',
    districts: [
      {
        id: 'kampong-cham-city',
        name: 'Kampong Cham City',
        nameKh: 'ក្រុងកំពង់ចាម',
        communes: [
          { id: 'kampong-cham-commune', name: 'Kampong Cham', nameKh: 'កំពង់ចាម' },
          { id: 'sambour-mei', name: 'Sambour Mei', nameKh: 'សំបួរមាស' },
        ],
      },
    ],
  },
  {
    id: 'kampong-speu',
    name: 'Kampong Speu',
    nameKh: 'កំពង់ស្ពឺ',
    districts: [
      {
        id: 'chbar-mon',
        name: 'Chbar Mon',
        nameKh: 'ក្រុងចបារមន',
        communes: [
          { id: 'chbar-mon-commune', name: 'Chbar Mon', nameKh: 'ចបារមន' },
          { id: 'kandol-dom', name: 'Kandol Dom', nameKh: 'កណ្ដោលដុំ' },
        ],
      },
    ],
  },
  {
    id: 'takeo',
    name: 'Takeo',
    nameKh: 'តាកែវ',
    districts: [
      {
        id: 'doun-keo',
        name: 'Doun Keo',
        nameKh: 'ក្រុងដូនកែវ',
        communes: [
          { id: 'rokar-knong', name: 'Rokar Knong', nameKh: 'រកាក្នង' },
          { id: 'baray', name: 'Baray', nameKh: 'បារាយណ៍' },
        ],
      },
    ],
  },
  {
    id: 'tbong-khmum',
    name: 'Tbong Khmum',
    nameKh: 'ត្បូងឃ្មុំ',
    districts: [
      {
        id: 'suong-city',
        name: 'Suong City',
        nameKh: 'ក្រុងសួង',
        communes: [
          { id: 'suong-commune', name: 'Suong', nameKh: 'សួង' },
          { id: 'vihear-luong', name: 'Vihear Luong', nameKh: 'វិហារហ្លួង' },
        ],
      },
    ],
  },
];
