// src/data/products.js

const productImages = import.meta.glob("../assets/products/*.webp", {
  eager: true,
  import: "default",
});

const getImage = (filename) => productImages[`../assets/products/${filename}`];

const PRODUCTS_DATA = [
  {
    id: "1",
    name: "GIDORA RIDING JACKET",
    category: "Outerwear",
    gender: "unisex",
    color: ["black"],
    sizes: ["m", "l", "xl"],
    price: "Rp 2.490.000",
    priceNum: 2490000,
    badge: "NEW",
    images: {
      primary: getImage("riding_jacket1.webp"),
      detail: getImage("riding_jacket_detail.webp"),
      secondary: [
        getImage("riding_jacket2.webp"),
        getImage("riding_jacket3.webp"),
      ],
    },
  },

  {
    id: "2",
    name: "UTILITY VEST BLACK",
    category: "Outerwear",
    gender: "unisex",
    color: ["black"],
    sizes: ["s", "m", "l"],
    price: "Rp 1.850.000",
    priceNum: 1850000,
    badge: "NEW",
    images: {
      primary: getImage("vest_black1.webp"),
      detail: getImage("vest_black_detail.webp"),
      secondary: [getImage("vest_black2.webp"), getImage("vest_black3.webp")],
    },
  },

  {
    id: "3",
    name: "MEN'S TECHNICAL CARGO PANTS",
    category: "Pants",
    gender: "men",
    color: ["black", "navy", "olive"],
    sizes: ["m", "l"],
    price: "Rp 1.950.000",
    priceNum: 1950000,
    badge: "BEST SELLER",
    images: {
      primary: getImage("men's_technical_cargo1.webp"),
      detail: getImage("men's_technical_cargo_detail.webp"),
      secondary: [
        getImage("men's_technical_cargo2.webp"),
        getImage("men's_technical_cargo3.webp"),
        getImage("men's_technical_cargo4.webp"),
      ],
    },
  },

  {
    id: "4",
    name: "WAIST BAG SYSTEM",
    category: "Accessories",
    gender: "men",
    color: ["black"],
    sizes: ["xs", "s", "m", "l", "xl"],
    price: "Rp 950.000",
    priceNum: 950000,
    badge: "",
    images: {
      primary: getImage("waist_bag1.webp"),
      detail: getImage("waist_bag_detail.webp"),
      secondary: [getImage("waist_bag2.webp")],
    },
  },

  {
    id: "5",
    name: "RUNNING JACKET",
    category: "Outerwear",
    gender: "women",
    color: ["grey", "pink"],
    sizes: ["m", "l", "xl"],
    price: "Rp 6.750.000",
    priceNum: 6750000,
    badge: "LIMITED",
    images: {
      primary: getImage("running_jacket1.webp"),
      detail: getImage("running_jacket_detail.webp"),
      secondary: [
        getImage("running_jacket2.webp"),
        getImage("running_jacket3.webp"),
      ],
    },
  },

  {
    id: "6",
    name: "WOMAN'S TECHNICAL CARGO PANTS",
    category: "Pants",
    gender: "women",
    color: ["black", "grey", "beige"],
    sizes: ["s", "m", "l"],
    price: "Rp 4.200.000",
    priceNum: 4200000,
    badge: "FEATURED",
    images: {
      primary: getImage("woman's_technical_cargo1.webp"),
      detail: getImage("woman's_technical_cargo_detail.webp"),
      secondary: [
        getImage("woman's_technical_cargo2.webp"),
        getImage("woman's_technical_cargo3.webp"),
        getImage("woman's_technical_cargo4.webp"),
      ],
    },
  },

  {
    id: "7",
    name: "BASIC T-SHIRT",
    category: "Shirts",
    gender: "unisex",
    color: ["black", "white", "olive", "beige"],
    sizes: ["xs", "s", "m", "l"],
    price: "Rp 2.400.000",
    priceNum: 2400000,
    badge: "CORE",
    images: {
      primary: getImage("t-shirt1.webp"),
      detail: getImage("t-shirt_detail.webp"),
      secondary: [
        getImage("t-shirt2.webp"),
        getImage("t-shirt3.webp"),
        getImage("t-shirt4.webp"),
        getImage("t-shirt5.webp"),
        getImage("t-shirt6.webp"),
      ],
    },
  },

  {
    id: "8",
    name: "BASIC LONG SLEEVE",
    category: "Shirts",
    gender: "unisex",
    color: ["black", "white", "olive", "beige"],
    sizes: ["xs", "s", "m", "l"],
    price: "Rp 2.850.000",
    priceNum: 2850000,
    badge: "",
    images: {
      primary: getImage("long_sleeve_t-shirt1.webp"),
      detail: getImage("long_sleeve_t-shirt_detail.webp"),
      secondary: [
        getImage("long_sleeve_t-shirt2.webp"),
        getImage("long_sleeve_t-shirt3.webp"),
        getImage("long_sleeve_t-shirt4.webp"),
        getImage("long_sleeve_t-shirt5.webp"),
        getImage("long_sleeve_t-shirt6.webp"),
      ],
    },
  },

  {
    id: "9",
    name: "QUILTED MID-LAYER",
    category: "Outerwear",
    gender: "unisex",
    color: ["navy", "grey", "beige"],
    sizes: ["s", "m", "l", "xl"],
    price: "Rp 4.800.000",
    priceNum: 4800000,
    badge: "WATER RESISTANT",
    images: {
      primary: getImage("mid_layer_jacket1.webp"),
      detail: getImage("mid_layer_jacket_detail.webp"),
      secondary: [
        getImage("mid_layer_jacket2.webp"),
        getImage("mid_layer_jacket3.webp"),
        getImage("mid_layer_jacket4.webp"),
        getImage("mid_layer_jacket5.webp"),
      ],
    },
  },

  {
    id: "10",
    name: "WOMEN'S TANK TOP",
    category: "Shirts",
    gender: "women",
    color: ["black", "white", "navy", "grey"],
    sizes: ["xs", "s", "m", "l"],
    price: "Rp 1.650.000",
    priceNum: 1650000,
    badge: "NEW",
    images: {
      primary: getImage("tank_top1.webp"),
      detail: getImage("tank_top_detail.webp"),
      secondary: [
        getImage("tank_top2.webp"),
        getImage("tank_top3.webp"),
        getImage("tank_top4.webp"),
        getImage("tank_top5.webp"),
      ],
    },
  },

  {
    id: "11",
    name: "TACTICAL SHIRT",
    category: "Shirts",
    gender: "men",
    color: ["black", "grey", "navy"],
    sizes: ["xs", "s", "m", "l"],
    price: "Rp 3.150.000",
    priceNum: 3150000,
    badge: "RESTOCKED",
    images: {
      primary: getImage("tactical_shirt1.webp"),
      detail: getImage("tactical_shirt_detail.webp"),
      secondary: [
        getImage("tactical_shirt2.webp"),
        getImage("tactical_shirt3.webp"),
        getImage("tactical_shirt4.webp"),
      ],
    },
  },

  {
    id: "12",
    name: "BELT SYSTEM",
    category: "Accessories",
    gender: "men",
    color: ["black"],
    sizes: ["xs", "s", "m", "l", "xl"],
    price: "Rp 875.000",
    priceNum: 875000,
    badge: "",
    images: {
      primary: getImage("belt1.webp"),
      detail: getImage("belt_detail.webp"),
      secondary: [getImage("belt2.webp")],
    },
  },

  {
    id: "13",
    name: "BACKPACK SYSTEM",
    category: "Accessories",
    gender: "unisex",
    color: ["black", "grey"],
    sizes: ["xs", "s", "m", "l", "xl"],
    price: "Rp 3.950.000",
    priceNum: 3950000,
    badge: "FEATURED",
    images: {
      primary: getImage("backpack1.webp"),
      detail: getImage("backpack_detail.webp"),
      secondary: [
        getImage("backpack2.webp"),
        getImage("backpack3.webp"),
        getImage("backpack4.webp"),
      ],
    },
  },

  {
    id: "14",
    name: "GIDORA LOW-TOP SNEAKERS BLACK",
    category: "Accessories",
    gender: "unisex",
    color: ["black"],
    sizes: ["xs", "s", "m", "l", "xl"],
    price: "Rp 2.750.000",
    priceNum: 2750000,
    badge: "NEW",
    images: {
      primary: getImage("sneakers_black1.webp"),
      detail: getImage("sneakers_black_detail.webp"),
      secondary: [
        getImage("sneakers_black2.webp"),
        getImage("sneakers_black3.webp"),
        getImage("sneakers_black4.webp"),
      ],
    },
  },

  {
    id: "15",
    name: "GIDORA LOW-TOP SNEAKERS WHITE",
    category: "Accessories",
    gender: "unisex",
    color: ["white"],
    sizes: ["xs", "s", "m", "l", "xl"],
    price: "Rp 2.750.000",
    priceNum: 2750000,
    badge: "",
    images: {
      primary: getImage("sneakers_white1.webp"),
      detail: getImage("sneakers_white_detail.webp"),
      secondary: [
        getImage("sneakers_white2.webp"),
        getImage("sneakers_white3.webp"),
        getImage("sneakers_white4.webp"),
      ],
    },
  },
];

export default PRODUCTS_DATA;
