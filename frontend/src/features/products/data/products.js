import { getAsset } from '@/utils/assets';

const getImage = (filename) => getAsset(`products/${filename}`);

const PRODUCTS_DATA = [
  {
    id: 1,
    sku: 'GDR-OW-001',
    slug: 'gidora-riding-jacket',
    name: 'GIDORA RIDING JACKET',
    category: 'Outerwear',
    gender: 'unisex',
    sizeType: 'apparel',
    price: 2490000,
    badge: 'NEW',
    description:
      'Engineered for high-velocity urban mobility, the Gidora Riding Jacket combines heavy-duty protection with a sleek, aerodynamic profile. Designed to withstand unpredictable weather conditions while delivering optimal airflow, it features reinforced impact zones, waterproof utility pockets, and secure anatomical closures that adapt seamlessly to active riding postures.',
    material: '3-Layer Technical Ripstop Nylon with Waterproof Membrane',
    images: {
      primary: getImage('riding_jacket_black.webp'),
      detail: getImage('riding_jacket_black_detail.webp'),
      secondary: [
        getImage('riding_jacket_black_male_model.webp'),
        getImage('riding_jacket_black_female_model.webp'),
      ],
    },
    colors: [
      {
        id: 1,
        name: 'black',
        image: getImage('riding_jacket_black.webp'),
      },
    ],
    variants: [
      { id: 1, sku: 'GDR-OW-001-BLK-M', colorId: 1, size: 'm', stock: 4 },
      { id: 2, sku: 'GDR-OW-001-BLK-L', colorId: 1, size: 'l', stock: 7 },
      { id: 3, sku: 'GDR-OW-001-BLK-XL', colorId: 1, size: 'xl', stock: 2 },
    ],
  },

  {
    id: 2,
    sku: 'GDR-OW-002',
    slug: 'utility-vest-black',
    name: 'UTILITY VEST BLACK',
    category: 'Outerwear',
    gender: 'unisex',
    sizeType: 'apparel',
    price: 1850000,
    badge: 'NEW',
    description:
      'A definitive modular layer designed for immediate accessibility and tactical everyday carry. The Utility Vest Black features an intricate multi-pocket harness system, heavy-duty utility webbing, and high-tensile hardware. Built to layer effortlessly over hoodies or technical shells without adding bulk, ensuring maximum functional utility in the urban landscape.',
    material: 'Heavy-Duty Cordura Ballistic Nylon Twill',
    images: {
      primary: getImage('vest_black.webp'),
      detail: getImage('vest_black_detail.webp'),
      secondary: [getImage('vest_black_male_model.webp'), getImage('vest_black_female_model.webp')],
    },
    colors: [
      {
        id: 1,
        name: 'black',
        image: getImage('vest_black.webp'),
      },
    ],
    variants: [
      { id: 4, sku: 'GDR-OW-002-BLK-S', colorId: 1, size: 's', stock: 3 },
      { id: 5, sku: 'GDR-OW-002-BLK-M', colorId: 1, size: 'm', stock: 6 },
      { id: 6, sku: 'GDR-OW-002-BLK-L', colorId: 1, size: 'l', stock: 2 },
    ],
  },

  {
    id: 3,
    sku: 'GDR-PT-001',
    slug: 'mens-technical-cargo-pants',
    name: "MEN'S TECHNICAL CARGO PANTS",
    category: 'Pants',
    gender: 'men',
    sizeType: 'apparel',
    price: 1950000,
    badge: 'BEST SELLER',
    description:
      "Redefining utility through structural ergonomics, the Men's Technical Cargo Pants are built for high-dexterity movement and durability. Equipped with deep-volume expandable cargo compartments, articulated knee panels, and adjustable cinches at the cuffs. Fabricated from a rugged stretch weave that repels light moisture and resists daily wear and tear.",
    material: 'Stretch Cotton Ripstop with DWR Finish',
    images: {
      primary: getImage("men's_technical_cargo_black.webp"),
      detail: getImage("men's_technical_cargo_black_detail.webp"),
      secondary: [getImage("men's_technical_cargo_black_male_model.webp")],
    },
    colors: [
      {
        id: 1,
        name: 'black',
        image: getImage("men's_technical_cargo_black.webp"),
      },
      {
        id: 2,
        name: 'navy',
        image: getImage("men's_technical_cargo_navy.webp"),
      },
      {
        id: 3,
        name: 'olive',
        image: getImage("men's_technical_cargo_olive.webp"),
      },
    ],
    variants: [
      { id: 7, sku: 'GDR-PT-001-BLK-M', colorId: 1, size: 'm', stock: 4 },
      { id: 8, sku: 'GDR-PT-001-BLK-L', colorId: 1, size: 'l', stock: 1 },
      { id: 9, sku: 'GDR-PT-001-NVY-M', colorId: 2, size: 'm', stock: 4 },
      { id: 10, sku: 'GDR-PT-001-NVY-L', colorId: 2, size: 'l', stock: 2 },
      { id: 11, sku: 'GDR-PT-001-OLV-M', colorId: 3, size: 'm', stock: 5 },
      { id: 12, sku: 'GDR-PT-001-OLV-L', colorId: 3, size: 'l', stock: 3 },
    ],
  },

  {
    id: 4,
    sku: 'GDR-AC-001',
    slug: 'waist-bag-system',
    name: 'WAIST BAG SYSTEM',
    category: 'Accessories',
    gender: 'unisex',
    sizeType: 'one_size',
    price: 950000,
    badge: '',
    description:
      'Compact yet exceptionally high-capacity, the Waist Bag System is built to secure your daily essentials with modular efficiency. Featuring weather-sealed compartments, internal organizational slots, and rapid-adjustment strap architecture. Designed for ambidextrous wear across the chest, back, or waist with military-grade durability.',
    material: 'Weatherproof 400D Nylon Fabric with YKK Aquaguard Zippers',
    images: {
      primary: getImage('waist_bag_black.webp'),
      detail: getImage('waist_bag_black_detail.webp'),
      secondary: [getImage('waist_bag_black_male_model.webp')],
    },
    colors: [
      {
        id: 1,
        name: 'black',
        image: getImage('waist_bag_black.webp'),
      },
    ],
    variants: [{ id: 13, sku: 'GDR-AC-001-BLK-ONE-SIZE', colorId: 1, size: 'one-size', stock: 9 }],
  },

  {
    id: 5,
    sku: 'GDR-OW-003',
    slug: 'running-jacket',
    name: 'RUNNING JACKET',
    category: 'Outerwear',
    gender: 'women',
    sizeType: 'apparel',
    price: 6750000,
    badge: 'LIMITED',
    description:
      'An ultra-lightweight performance shell engineered specifically for high-intensity movement in variable conditions. This limited running jacket provides exceptional wind resistance and advanced vapor permeability, preventing overheating. Styled with minimalist reflective accents for low-light visibility and a streamlined athletic silhouette.',
    material: 'Ultralight Micro-Weave Polyester with Wind-Block Membrane',
    images: {
      primary: getImage('running_jacket_gray.webp'),
      detail: getImage('running_jacket_gray_detail.webp'),
      secondary: [getImage('running_jacket_gray_female_model.webp')],
    },
    colors: [
      {
        id: 1,
        name: 'gray',
        image: getImage('running_jacket_gray.webp'),
      },
      {
        id: 2,
        name: 'pink',
        image: getImage('running_jacket_pink.webp'),
      },
    ],
    variants: [
      { id: 14, sku: 'GDR-OW-003-GRY-M', colorId: 1, size: 'm', stock: 2 },
      { id: 15, sku: 'GDR-OW-003-GRY-L', colorId: 1, size: 'l', stock: 1 },
      { id: 16, sku: 'GDR-OW-003-GRY-XL', colorId: 1, size: 'xl', stock: 4 },
      { id: 17, sku: 'GDR-OW-003-PNK-M', colorId: 2, size: 'm', stock: 3 },
      { id: 18, sku: 'GDR-OW-003-PNK-L', colorId: 2, size: 'l', stock: 1 },
      { id: 19, sku: 'GDR-OW-003-PNK-XL', colorId: 2, size: 'xl', stock: 2 },
    ],
  },

  {
    id: 6,
    sku: 'GDR-PT-002',
    slug: 'womens-technical-cargo-pants',
    name: "WOMEN'S TECHNICAL CARGO PANTS",
    category: 'Pants',
    gender: 'women',
    sizeType: 'apparel',
    price: 4200000,
    badge: 'FEATURED',
    description:
      "Combining a sharp contemporary silhouette with utilitarian performance, the Women's Technical Cargo Pants offer unmatched functionality without sacrificing style. Designed with targeted stretch mapping, ergonomic pocket layouts, and customizable hem fittings. Built from premium technical fabric that holds its sharp shape throughout demanding daily routines.",
    material: 'Technical Cotton-Nylon Blend with Mechanical Stretch',
    images: {
      primary: getImage("woman's_technical_cargo_black.webp"),
      detail: getImage("woman's_technical_cargo_black_detail.webp"),
      secondary: [getImage("woman's_technical_cargo_black_female_model.webp")],
    },
    colors: [
      {
        id: 1,
        name: 'black',
        image: getImage("woman's_technical_cargo_black.webp"),
      },
      {
        id: 2,
        name: 'gray',
        image: getImage("woman's_technical_cargo_gray.webp"),
      },
      {
        id: 3,
        name: 'beige',
        image: getImage("woman's_technical_cargo_beige.webp"),
      },
    ],
    variants: [
      { id: 20, sku: 'GDR-PT-002-BLK-S', colorId: 1, size: 's', stock: 5 },
      { id: 21, sku: 'GDR-PT-002-BLK-M', colorId: 1, size: 'm', stock: 8 },
      { id: 22, sku: 'GDR-PT-002-BLK-L', colorId: 1, size: 'l', stock: 3 },
      { id: 23, sku: 'GDR-PT-002-GRY-S', colorId: 2, size: 's', stock: 2 },
      { id: 24, sku: 'GDR-PT-002-GRY-M', colorId: 2, size: 'm', stock: 6 },
      { id: 25, sku: 'GDR-PT-002-GRY-L', colorId: 2, size: 'l', stock: 4 },
      { id: 26, sku: 'GDR-PT-002-BGE-S', colorId: 3, size: 's', stock: 1 },
      { id: 27, sku: 'GDR-PT-002-BGE-M', colorId: 3, size: 'm', stock: 7 },
      { id: 28, sku: 'GDR-PT-002-BGE-L', colorId: 3, size: 'l', stock: 3 },
    ],
  },

  {
    id: 7,
    sku: 'GDR-SH-001',
    slug: 'basic-t-shirt',
    name: 'BASIC T-SHIRT',
    category: 'Shirts',
    gender: 'unisex',
    sizeType: 'apparel',
    price: 2400000,
    badge: 'CORE',
    description:
      'An essential layering foundation, the Basic T-Shirt is meticulously tailored with a structured boxy drape that retains clean lines over time. Fabricated from heavyweight combed jersey providing an exceptional handfeel and robust longevity. Reinforced neck binding guarantees resistance against stretching and sagging through daily wear.',
    material: '100% Heavyweight Combed Cotton (280 GSM)',
    images: {
      primary: getImage('t-shirt_black.webp'),
      detail: getImage('t-shirt_black_detail.webp'),
      secondary: [
        getImage('t-shirt_black_male_model.webp'),
        getImage('t-shirt_white_female_model.webp'),
      ],
    },
    colors: [
      {
        id: 1,
        name: 'black',
        image: getImage('t-shirt_black.webp'),
      },
      {
        id: 2,
        name: 'white',
        image: getImage('t-shirt_white.webp'),
      },
      {
        id: 3,
        name: 'olive',
        image: getImage('t-shirt_olive.webp'),
      },
      {
        id: 4,
        name: 'beige',
        image: getImage('t-shirt_beige.webp'),
      },
    ],
    variants: [
      { id: 29, sku: 'GDR-SH-001-BLK-XS', colorId: 1, size: 'xs', stock: 8 },
      { id: 30, sku: 'GDR-SH-001-BLK-S', colorId: 1, size: 's', stock: 15 },
      { id: 31, sku: 'GDR-SH-001-BLK-M', colorId: 1, size: 'm', stock: 21 },
      { id: 32, sku: 'GDR-SH-001-BLK-L', colorId: 1, size: 'l', stock: 11 },

      { id: 33, sku: 'GDR-SH-001-WHT-XS', colorId: 2, size: 'xs', stock: 6 },
      { id: 34, sku: 'GDR-SH-001-WHT-S', colorId: 2, size: 's', stock: 18 },
      { id: 35, sku: 'GDR-SH-001-WHT-M', colorId: 2, size: 'm', stock: 24 },
      { id: 36, sku: 'GDR-SH-001-WHT-L', colorId: 2, size: 'l', stock: 9 },

      { id: 37, sku: 'GDR-SH-001-OLV-XS', colorId: 3, size: 'xs', stock: 4 },
      { id: 38, sku: 'GDR-SH-001-OLV-S', colorId: 3, size: 's', stock: 12 },
      { id: 39, sku: 'GDR-SH-001-OLV-M', colorId: 3, size: 'm', stock: 19 },
      { id: 40, sku: 'GDR-SH-001-OLV-L', colorId: 3, size: 'l', stock: 7 },

      { id: 41, sku: 'GDR-SH-001-BGE-XS', colorId: 4, size: 'xs', stock: 5 },
      { id: 42, sku: 'GDR-SH-001-BGE-S', colorId: 4, size: 's', stock: 14 },
      { id: 43, sku: 'GDR-SH-001-BGE-M', colorId: 4, size: 'm', stock: 22 },
      { id: 44, sku: 'GDR-SH-001-BGE-L', colorId: 4, size: 'l', stock: 10 },
    ],
  },

  {
    id: 8,
    sku: 'GDR-SH-002',
    slug: 'basic-long-sleeve',
    name: 'BASIC LONG SLEEVE',
    category: 'Shirts',
    gender: 'unisex',
    sizeType: 'apparel',
    price: 2850000,
    badge: '',
    description:
      'The quintessential long-sleeve staple crafted for versatile transitional styling. Built with a relaxed yet refined fit, clean ribbed cuffs, and durable twin-needle stitching at stress points. It offers a substantial weight that acts as an ideal standalone piece or a robust base layer underneath heavy outerwear.',
    material: '100% Premium Combed Cotton Jersey',
    images: {
      primary: getImage('long_sleeve_t-shirt_black.webp'),
      detail: getImage('long_sleeve_t-shirt_black_detail.webp'),
      secondary: [
        getImage('long_sleeve_t-shirt_black_male_model.webp'),
        getImage('long_sleeve_t-shirt_white_female_model.webp'),
      ],
    },
    colors: [
      {
        id: 1,
        name: 'black',
        image: getImage('long_sleeve_t-shirt_black.webp'),
      },
      {
        id: 2,
        name: 'white',
        image: getImage('long_sleeve_t-shirt_white.webp'),
      },
      {
        id: 3,
        name: 'olive',
        image: getImage('long_sleeve_t-shirt_olive.webp'),
      },
      {
        id: 4,
        name: 'beige',
        image: getImage('long_sleeve_t-shirt_beige.webp'),
      },
    ],
    variants: [
      { id: 45, sku: 'GDR-SH-002-BLK-XS', colorId: 1, size: 'xs', stock: 5 },
      { id: 46, sku: 'GDR-SH-002-BLK-S', colorId: 1, size: 's', stock: 11 },
      { id: 47, sku: 'GDR-SH-002-BLK-M', colorId: 1, size: 'm', stock: 16 },
      { id: 48, sku: 'GDR-SH-002-BLK-L', colorId: 1, size: 'l', stock: 8 },

      { id: 49, sku: 'GDR-SH-002-WHT-XS', colorId: 2, size: 'xs', stock: 3 },
      { id: 50, sku: 'GDR-SH-002-WHT-S', colorId: 2, size: 's', stock: 13 },
      { id: 51, sku: 'GDR-SH-002-WHT-M', colorId: 2, size: 'm', stock: 15 },
      { id: 52, sku: 'GDR-SH-002-WHT-L', colorId: 2, size: 'l', stock: 6 },

      { id: 53, sku: 'GDR-SH-002-OLV-XS', colorId: 3, size: 'xs', stock: 7 },
      { id: 54, sku: 'GDR-SH-002-OLV-S', colorId: 3, size: 's', stock: 10 },
      { id: 55, sku: 'GDR-SH-002-OLV-M', colorId: 3, size: 'm', stock: 14 },
      { id: 56, sku: 'GDR-SH-002-OLV-L', colorId: 3, size: 'l', stock: 4 },

      { id: 57, sku: 'GDR-SH-002-BGE-XS', colorId: 4, size: 'xs', stock: 2 },
      { id: 58, sku: 'GDR-SH-002-BGE-S', colorId: 4, size: 's', stock: 9 },
      { id: 59, sku: 'GDR-SH-002-BGE-M', colorId: 4, size: 'm', stock: 16 },
      { id: 60, sku: 'GDR-SH-002-BGE-L', colorId: 4, size: 'l', stock: 7 },
    ],
  },

  {
    id: 9,
    sku: 'GDR-OW-004',
    slug: 'quilted-mid-layer',
    name: 'QUILTED MID-LAYER',
    category: 'Outerwear',
    gender: 'unisex',
    sizeType: 'apparel',
    price: 4800000,
    badge: 'WATER RESISTANT',
    description:
      'Engineered to deliver exceptional thermal insulation without unnecessary volume, the Quilted Mid-Layer features thermal-trap diamond quilting and a water-resistant outer shell. Designed to lock in core warmth during plummeting temperatures, complete with secure zip pockets and high-collar wind shielding.',
    material: 'Water-Resistant Nylon Shell with Synthetic Thermal Insulation',
    images: {
      primary: getImage('mid_layer_jacket_navy.webp'),
      detail: getImage('mid_layer_jacket_navy_detail.webp'),
      secondary: [
        getImage('mid_layer_jacket_navy_male_model.webp'),
        getImage('mid_layer_jacket_beige_female_model.webp'),
      ],
    },
    colors: [
      {
        id: 1,
        name: 'navy',
        image: getImage('mid_layer_jacket_navy.webp'),
      },
      {
        id: 2,
        name: 'gray',
        image: getImage('mid_layer_jacket_gray.webp'),
      },
      {
        id: 3,
        name: 'beige',
        image: getImage('mid_layer_jacket_beige.webp'),
      },
    ],
    variants: [
      { id: 61, sku: 'GDR-OW-004-NVY-S', colorId: 1, size: 's', stock: 2 },
      { id: 62, sku: 'GDR-OW-004-NVY-M', colorId: 1, size: 'm', stock: 5 },
      { id: 63, sku: 'GDR-OW-004-NVY-L', colorId: 1, size: 'l', stock: 3 },
      { id: 64, sku: 'GDR-OW-004-NVY-XL', colorId: 1, size: 'xl', stock: 1 },

      { id: 65, sku: 'GDR-OW-004-GRY-S', colorId: 2, size: 's', stock: 4 },
      { id: 66, sku: 'GDR-OW-004-GRY-M', colorId: 2, size: 'm', stock: 2 },
      { id: 67, sku: 'GDR-OW-004-GRY-L', colorId: 2, size: 'l', stock: 5 },
      { id: 68, sku: 'GDR-OW-004-GRY-XL', colorId: 2, size: 'xl', stock: 2 },

      { id: 69, sku: 'GDR-OW-004-BGE-S', colorId: 3, size: 's', stock: 1 },
      { id: 70, sku: 'GDR-OW-004-BGE-M', colorId: 3, size: 'm', stock: 4 },
      { id: 71, sku: 'GDR-OW-004-BGE-L', colorId: 3, size: 'l', stock: 3 },
      { id: 72, sku: 'GDR-OW-004-BGE-XL', colorId: 3, size: 'xl', stock: 2 },
    ],
  },

  {
    id: 10,
    sku: 'GDR-SH-003',
    slug: 'womens-tank-top',
    name: "WOMEN'S TANK TOP",
    category: 'Shirts',
    gender: 'women',
    sizeType: 'apparel',
    price: 1650000,
    badge: 'NEW',
    description:
      "A clean, architectural cut defines the Women's Tank Top, offering a streamlined fit that accentuates movement. Crafted from a breathable ribbed cotton blend with subtle elasticity, it provides a smooth, comfortable embrace while maintaining absolute structural integrity through continuous washes.",
    material: '95% Cotton, 5% Spandex Ribbed Knit',
    images: {
      primary: getImage('tank_top_black.webp'),
      detail: getImage('tank_top_black_detail.webp'),
      secondary: [
        getImage('tank_top_black_female_model.webp'),
        getImage('tank_top_white_female_model.webp'),
      ],
    },
    colors: [
      {
        id: 1,
        name: 'black',
        image: getImage('tank_top_black.webp'),
      },
      {
        id: 2,
        name: 'white',
        image: getImage('tank_top_white.webp'),
      },
      {
        id: 3,
        name: 'navy',
        image: getImage('tank_top_navy.webp'),
      },
      {
        id: 4,
        name: 'gray',
        image: getImage('tank_top_gray.webp'),
      },
    ],
    variants: [
      { id: 73, sku: 'GDR-SH-003-BLK-XS', colorId: 1, size: 'xs', stock: 1 },
      { id: 74, sku: 'GDR-SH-003-BLK-S', colorId: 1, size: 's', stock: 3 },
      { id: 75, sku: 'GDR-SH-003-BLK-M', colorId: 1, size: 'm', stock: 2 },
      { id: 76, sku: 'GDR-SH-003-BLK-L', colorId: 1, size: 'l', stock: 4 },

      { id: 77, sku: 'GDR-SH-003-WHT-XS', colorId: 2, size: 'xs', stock: 2 },
      { id: 78, sku: 'GDR-SH-003-WHT-S', colorId: 2, size: 's', stock: 1 },
      { id: 79, sku: 'GDR-SH-003-WHT-M', colorId: 2, size: 'm', stock: 4 },
      { id: 80, sku: 'GDR-SH-003-WHT-L', colorId: 2, size: 'l', stock: 2 },

      { id: 81, sku: 'GDR-SH-003-NVY-XS', colorId: 3, size: 'xs', stock: 1 },
      { id: 82, sku: 'GDR-SH-003-NVY-S', colorId: 3, size: 's', stock: 3 },
      { id: 83, sku: 'GDR-SH-003-NVY-M', colorId: 3, size: 'm', stock: 2 },
      { id: 84, sku: 'GDR-SH-003-NVY-L', colorId: 3, size: 'l', stock: 1 },

      { id: 85, sku: 'GDR-SH-003-GRY-XS', colorId: 4, size: 'xs', stock: 2 },
      { id: 86, sku: 'GDR-SH-003-GRY-S', colorId: 4, size: 's', stock: 4 },
      { id: 87, sku: 'GDR-SH-003-GRY-M', colorId: 4, size: 'm', stock: 3 },
      { id: 88, sku: 'GDR-SH-003-GRY-L', colorId: 4, size: 'l', stock: 1 },
    ],
  },

  {
    id: 11,
    sku: 'GDR-SH-004',
    slug: 'tactical-shirt',
    name: 'TACTICAL SHIRT',
    category: 'Shirts',
    gender: 'men',
    sizeType: 'apparel',
    price: 3150000,
    badge: 'RESTOCKED',
    description:
      'Bridging the gap between utilitarian duty wear and modern street aesthetics, the Tactical Shirt features reinforced chest utility pockets, concealed button closures, and structured shoulder panels. Built to handle rugged field environments while keeping a crisp, professional presentation.',
    material: 'Heavy-Duty Cotton Poplin with Ripstop Weave',
    images: {
      primary: getImage('tactical_shirt_black.webp'),
      detail: getImage('tactical_shirt_black_detail.webp'),
      secondary: [getImage('tactical_shirt_black_male_model.webp')],
    },
    colors: [
      {
        id: 1,
        name: 'black',
        image: getImage('tactical_shirt_black.webp'),
      },
      {
        id: 2,
        name: 'gray',
        image: getImage('tactical_shirt_gray.webp'),
      },
      {
        id: 3,
        name: 'navy',
        image: getImage('tactical_shirt_navy.webp'),
      },
    ],
    variants: [
      { id: 89, sku: 'GDR-SH-004-BLK-XS', colorId: 1, size: 'xs', stock: 3 },
      { id: 90, sku: 'GDR-SH-004-BLK-S', colorId: 1, size: 's', stock: 5 },
      { id: 91, sku: 'GDR-SH-004-BLK-M', colorId: 1, size: 'm', stock: 7 },
      { id: 92, sku: 'GDR-SH-004-BLK-L', colorId: 1, size: 'l', stock: 2 },

      { id: 93, sku: 'GDR-SH-004-GRY-XS', colorId: 2, size: 'xs', stock: 1 },
      { id: 94, sku: 'GDR-SH-004-GRY-S', colorId: 2, size: 's', stock: 4 },
      { id: 95, sku: 'GDR-SH-004-GRY-M', colorId: 2, size: 'm', stock: 6 },
      { id: 96, sku: 'GDR-SH-004-GRY-L', colorId: 2, size: 'l', stock: 3 },

      { id: 97, sku: 'GDR-SH-004-NVY-XS', colorId: 3, size: 'xs', stock: 2 },
      { id: 98, sku: 'GDR-SH-004-NVY-S', colorId: 3, size: 's', stock: 3 },
      { id: 99, sku: 'GDR-SH-004-NVY-M', colorId: 3, size: 'm', stock: 5 },
      { id: 100, sku: 'GDR-SH-004-NVY-L', colorId: 3, size: 'l', stock: 1 },
    ],
  },

  {
    id: 12,
    sku: 'GDR-AC-002',
    slug: 'belt-system',
    name: 'BELT SYSTEM',
    category: 'Accessories',
    gender: 'unisex',
    sizeType: 'one_size',
    price: 875000,
    badge: '',
    description:
      'A heavy-duty architectural belt system featuring a quick-release tactical metal buckle and high-tensile webbed nylon. Engineered for absolute security, easy adjustability, and reliable utility-carrying capacity without slipping under heavy loads.',
    material: 'Military-Grade Webbed Nylon with Anodized Aluminum Buckle',
    images: {
      primary: getImage('belt_black_1.webp'),
      detail: getImage('belt_black_detail.webp'),
      secondary: [getImage('belt_black_2.webp')],
    },
    colors: [
      {
        id: 1,
        name: 'black',
        image: getImage('belt_black_1.webp'),
      },
    ],
    variants: [
      { id: 101, sku: 'GDR-AC-002-BLK-ONE-SIZE', colorId: 1, size: 'one-size', stock: 11 },
    ],
  },

  {
    id: 13,
    sku: 'GDR-AC-003',
    slug: 'backpack-system',
    name: 'BACKPACK SYSTEM',
    category: 'Accessories',
    gender: 'unisex',
    sizeType: 'one_size',
    price: 3950000,
    badge: 'FEATURED',
    description:
      'The ultimate transit companion, the Backpack System combines massive multi-compartment internal storage with a weatherproof armored exterior. Includes a padded technical sleeve for high-value devices, ergonomic breathable back padding, and modular strap attachment points.',
    material: 'Waterproof 800D Ballistic Cordura with Duraflex Hardware',
    images: {
      primary: getImage('backpack_black.webp'),
      detail: getImage('backpack_black_detail.webp'),
      secondary: [
        getImage('backpack_black_male_model.webp'),
        getImage('backpack_gray_female_model.webp'),
      ],
    },
    colors: [
      {
        id: 1,
        name: 'black',
        image: getImage('backpack_black.webp'),
      },
      {
        id: 2,
        name: 'gray',
        image: getImage('backpack_gray.webp'),
      },
    ],
    variants: [
      { id: 102, sku: 'GDR-AC-003-BLK-ONE-SIZE', colorId: 1, size: 'one-size', stock: 6 },
      { id: 103, sku: 'GDR-AC-003-GRY-ONE-SIZE', colorId: 2, size: 'one-size', stock: 3 },
    ],
  },

  {
    id: 14,
    sku: 'GDR-FW-001',
    slug: 'gidora-low-top-sneakers-black',
    name: 'GIDORA LOW-TOP SNEAKERS BLACK',
    category: 'Footwear',
    gender: 'unisex',
    sizeType: 'footwear',
    price: 2750000,
    badge: 'NEW',
    description:
      'Characterized by robust construction and clean geometric lines, the Gidora Low-Top Sneakers Black deliver enduring comfort and structural support. Built with a high-traction vulcanized rubber sole, reinforced toe cap, and cushioned interior arch support designed for long-distance urban walking.',
    material: 'Premium Full-Grain Leather Upper with Vulcanized Rubber Sole',
    images: {
      primary: getImage('sneakers_black_1.webp'),
      detail: getImage('sneakers_black_detail.webp'),
      secondary: [
        getImage('sneakers_black_2.webp'),
        getImage('sneakers_black_male_model.webp'),
        getImage('sneakers_black_female_model.webp'),
      ],
    },
    colors: [
      {
        id: 1,
        name: 'black',
        image: getImage('sneakers_black_1.webp'),
      },
    ],
    variants: [
      { id: 104, sku: 'GDR-FW-001-BLK-39', colorId: 1, size: '39', stock: 2 },
      { id: 105, sku: 'GDR-FW-001-BLK-40', colorId: 1, size: '40', stock: 4 },
      { id: 106, sku: 'GDR-FW-001-BLK-41', colorId: 1, size: '41', stock: 1 },
      { id: 107, sku: 'GDR-FW-001-BLK-42', colorId: 1, size: '42', stock: 5 },
      { id: 108, sku: 'GDR-FW-001-BLK-43', colorId: 1, size: '43', stock: 3 },
      { id: 109, sku: 'GDR-FW-001-BLK-44', colorId: 1, size: '44', stock: 2 },
      { id: 110, sku: 'GDR-FW-001-BLK-45', colorId: 1, size: '45', stock: 1 },
    ],
  },

  {
    id: 15,
    sku: 'GDR-FW-002',
    slug: 'gidora-low-top-sneakers-white',
    name: 'GIDORA LOW-TOP SNEAKERS WHITE',
    category: 'Footwear',
    gender: 'unisex',
    sizeType: 'footwear',
    price: 2750000,
    badge: '',
    description:
      'A pristine monochromatic aesthetic paired with rugged street endurance. The Gidora Low-Top Sneakers White feature a supple leather framework resting on a shock-absorbing midsole, providing a clean silhouette that effortlessly complements any technical or casual ensemble.',
    material: 'Premium Full-Grain Leather Upper with Vulcanized Rubber Sole',
    images: {
      primary: getImage('sneakers_white.webp'),
      detail: getImage('sneakers_white_detail.webp'),
      secondary: [
        getImage('sneakers_white_female_model.webp'),
        getImage('sneakers_white_male_model.webp'),
      ],
    },
    colors: [
      {
        id: 1,
        name: 'white',
        image: getImage('sneakers_white.webp'),
      },
    ],
    variants: [
      { id: 111, sku: 'GDR-FW-002-WHT-39', colorId: 1, size: '39', stock: 0 },
      { id: 112, sku: 'GDR-FW-002-WHT-40', colorId: 1, size: '40', stock: 2 },
      { id: 113, sku: 'GDR-FW-002-WHT-41', colorId: 1, size: '41', stock: 1 },
      { id: 114, sku: 'GDR-FW-002-WHT-42', colorId: 1, size: '42', stock: 3 },
      { id: 115, sku: 'GDR-FW-002-WHT-43', colorId: 1, size: '43', stock: 0 },
      { id: 116, sku: 'GDR-FW-002-WHT-44', colorId: 1, size: '44', stock: 1 },
      { id: 117, sku: 'GDR-FW-002-WHT-45', colorId: 1, size: '45', stock: 0 },
    ],
  },
];

export default PRODUCTS_DATA;
