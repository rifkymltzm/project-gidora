// src/data/products.js

const PRODUCTS_DATA = [
  {
    id: "1",
    name: "GIDORA TECH JACKET",
    category: "Outerwear",
    gender: "men",
    color: "black",
    sizes: ["m", "l", "xl"],
    price: "Rp 2.490.000",
    priceNum: 2490000,
    badge: "NEW",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBrK70SeRpttvLfFY6OS8tB2kSjsghl_Awee3nQRsOZZas_gqsy0o7E4zg-giY8b6N_mtC6DGFsp34i-o-P3lKMwYDwwoGEl57d-RvsH_CbArmRxvnSELFk6grK1JlnB2PcsQuinmp9rKrWD3PoE8queZ5OuIdTGKOOk1sQ8cSVYtmhrmG06N3bvoMfDOXxokM_uAuQPw0vJ0QQN4mNLWdV0Yt0KeHmCid9kyigLDovs8Yj4ImV8ytt",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAmzXeEDVTuM8sgNa1wQFzfTp7eOM4CihYuqq4XKhNAC3p2-J81fQ246suvWQzpuwYImSkT2DNn5aE6Y26ur-nLV_vCUfrb6sS7J5p51EnMzsia6mj5sLVbFIgd5fS37cjPua2rYqHhcarGwVgorhfN1NkjERzfaLsPzzPiGw48usLqjY-_KQ7TAQ1Ws0R_AqQYLGdO4tlDUVyzj7L0NbrRv5Vo7O-MNtFPJK-VoCHSGQQKXDJJUIXB",
    ],
  },

  {
    id: "2",
    name: "UTILITY VEST 02",
    category: "Outerwear",
    gender: "men",
    color: "black",
    sizes: ["s", "m", "l"],
    price: "Rp 1.850.000",
    priceNum: 1850000,
    badge: "NEW",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDEglTZ-cSi88SHwrcVxPBsusumyj8Xr-PJICIHAdlfdhI_FA-U1eZZCVmeTxExjYrTGTRk9L6mfOsiPQT2eTzjt4_veVOStF7fu4nSXRZ91NXyBUH15CJpzqlFoK9CARgsLBJ1SbkK7y8vrTXEAb8j0W06MdojVAQ6zTNJbvEWicTY6E3rUE_QlKkDbRGujWN3lMYly0_G4K5IEqxWwb-OSeSusuQmLvRfuxxCo2PDe4QC2gMIZ8eY",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD3GhnAT0GVyJ9ALyTd1Saiw6QKXeZVC4P1SfHMsaDXwwGg2LsXNH3uwXvslMH-naEH9pCpQGZianFrp6cz_lqGdnH8aaNfi6QNZpCACW4RfhilAGC4HfplqRxyzLhIDWQWKi5Nf6XlU06bI8Y3bXcIBP_aIhNhxWqZVg1EpK3OGFJaRQXiJjVyjd2xcPbsENn6rAhUsc99-AUlcIMPyY3xMJmTn6ImFF9CdVJgFKe-VEC_mGi9LUX7",
    ],
  },

  {
    id: "3",
    name: "ARTICULATED CARGO",
    category: "Pants",
    gender: "men",
    color: "black",
    sizes: ["m", "l"],
    price: "Rp 1.950.000",
    priceNum: 1950000,
    badge: "",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC_vZj9McjnSCC7tm8gTHEgAw0mhkiRdnDfAEziDc1Fcr_6nrm98XFfIRnB0JmzVZ5IxnvhH1cn20GkYEtikxMpiBfumjFDPA-CFfRIrwNiCfphlL21z_2-7OeE-ycN9KQOiQmW0GWtUq3hGGQDJAKo4c_4YqtLylPbgoMiYLzf-dxEj0Mk41NFUfja2pomiRYzKjDEbuKMnffoAay5FYHMyX_OXnUxXHbZUgQ8eQiR3cmM-C7boDuW",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC2O-CjtrKGHjzBF8bg0LQNEoNvDnOb3pNmtM5aBV3-eyMKwkwXRiqDIVXcW7Wyro_Meo62wHgS_opF1Rpz4NqP8v63la3QrffGDNIdkzCtvPdFdBsxilZBsP1Ipm0KGHEjt4xFfDqfl9D49BtFZyP8ZGJjWYqJW1z0HHxpAdw2s0nXgZjJ86QnjMK5CIquIRpueJJ0x7g-_sHnzYpad_p-qSK8KaEU2WYVXd0qH-eDgcw1M0FrnzE",
    ],
  },

  {
    id: "4",
    name: "SLING SYSTEM 01",
    category: "Accessories",
    gender: "unisex",
    color: "black",
    sizes: ["xs", "s", "m", "l", "xl"],
    price: "Rp 950.000",
    priceNum: 950000,
    badge: "",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAbD4-AagZid0aWWpVFo78EmFJQ2Vv8oUdgunfmDBJWmEQ7wrchuA_hyAt5-QNeZBXVXGQbO2bCONq576Uc6bAP0nejhFr00B_ekJUWknjuI3rvuvMCNmEsHrq9ls3QeWy1TlA1l9U6GtuOptXjatFsYNEcw9_Gp1bblxRA3IiTBUb2WUVbZ2LYVNGJnJDrXY04qUN-jVy9lFgVwZh-VOeBLWdm7f7UA-StftttdPRQewbSCrb29_oD",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuApZYjQKy40QS8CtqcB4mzS1EgJzm8fh8pDGTTwiPWxiCTegEwNtNBUkLNrtQXvbnHkZ_gkkK2nNG3my2IBhR9xknL7h5-4qZFgedBlOod5haouN4b3T6nU0FshIGPv5bi-vftrcXRBJd0g29fioMg22jdT0BcgxHtV1WmI_FtMRlhL2CxRVyP47DKcItqM9L-6DLJkx-PWVZrrgAEgdboE9PVSN7CJcStpefaayf00NETTnSgZVFRD",
    ],
  },

  {
    id: "5",
    name: "G-TYPE SHELL JACKET",
    category: "Outerwear",
    gender: "men",
    color: "black",
    sizes: ["m", "l", "xl"],
    price: "Rp 6.750.000",
    priceNum: 6750000,
    badge: "NEW",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuASFkvyU4J44Qq3Ksw99mK1xkK-nT0g21yKkypQt4kILilmS3-v_St7AUAKB0aurRGKIk9vSy6_Th_NG77HnUU1aypsvDb3Yc37vQ8nkdX2xQsc1j5MOY4sivnMGzCuTJVjm477MD_xlGaK0hOE_8xYnCf9tHwSr8qexmgnBjq-kRtHh8jhJRocRcHdsfaargibkgn3FNjAlRVX_vGQhw0csbHjAx9okZIZRa2OZJtmZ6-iC86YYFuz",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDEglTZ-cSi88SHwrcVxPBsusumyj8Xr-PJICIHAdlfdhI_FA-U1eZZCVmeTxExjYrTGTRk9L6mfOsiPQT2eTzjt4_veVOStF7fu4nSXRZ91NXyBUH15CJpzqlFoK9CARgsLBJ1SbkK7y8vrTXEAb8j0W06MdojVAQ6zTNJbvEWicTY6E3rUE_QlKkDbRGujWN3lMYly0_G4K5IEqxWwb-OSeSusuQmLvRfuxxCo2PDe4QC2gMIZ8eY",
    ],
  },

  {
    id: "6",
    name: "ARTICULATED CARGO PANT",
    category: "Pants",
    gender: "men",
    color: "olive",
    sizes: ["s", "m", "l"],
    price: "Rp 4.200.000",
    priceNum: 4200000,
    badge: "",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuD0IAhv0QBg6_Hy9I1bEy-SN2hUnYtnGa8-gmPT242r1d6bVnE9iNHH5OmL_8BKz_G8S_Gc8v1MshdiNGqVS4GyjGlSVTCx924taDHXO_4y7Y7KGOlQwnChg6YwUeW9uilCjHiJ-oSAgLF8T975wfgBfx5twG9IbTtYMsIhzPq-0lxP2Z8QYDa6LGlBMhS9KNqJ24TnR9a92r4wGk6NvNiRV7OpNCgGVJ217QN5DQczKNxtCeRV2sds",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC2O-CjtrKGHjzBF8bg0LQNEoNvDnOb3pNmtM5aBV3-eyMKwkwXRiqDIVXcW7Wyro_Meo62wHgS_opF1Rpz4NqP8v63la3QrffGDNIdkzCtvPdFdBsxilZBsP1Ipm0KGHEjt4xFfDqfl9D49BtFZyP8ZGJjWYqJW1z0HHxpAdw2s0nXgZjJ86QnjMK5CIquIRpueJJ0x7g-_sHnzYpad_p-qSK8KaEU2WYVXd0qH-eDgcw1M0FrnzE",
    ],
  },

  {
    id: "7",
    name: "MERINO TECH LONG SLEEVE",
    category: "Shirts",
    gender: "women",
    color: "beige",
    sizes: ["xs", "s", "m", "l"],
    price: "Rp 2.400.000",
    priceNum: 2400000,
    badge: "",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAVuenzLIWrM3BZji00vurMnxqtXcR2SfMNf12k814TA1ecidcDr3voAsdd0Jj8Sto60AdfflrUIsKBR9j-HkRg6K6pUYWyMA5evPkOTMygyj72rGf3RX55xFaUWlkUwpnbVIrICyoX--5638PHZyRGcnbFhXDsE37chpMG1e6LkcFSO7PAKeRv2cqPXyEgrYUUihXEU9Wd-DzhRGb5SirCtXa6pUhaWwbgR5eVb4AY0UbdPWKcyTb3",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCKNupMBz10eC6Dc1_wVAbOVkNgMXnBMvPUV7nywlcvPzquDG46D6sArTHjGkny0-OoB9jbvVO3Nlc2O79vBOgJgGfL8Gn_Nc-mNkgsWd7I04PjTOG-UoDWTzTTh2dOetYJ_kIZNwCYc_SqHvqLwizo0whJvnXBV-CXW0XC4s_nhUnkg9v_7x8ZmgS5nTEOqLbNWLre4oPswlJDBbSUysmSxoK--7xOiDEruxBMxqIFPv9rekBgCPWu",
    ],
  },

  {
    id: "8",
    name: "QUILTED MID-LAYER",
    category: "Outerwear",
    gender: "women",
    color: "navy",
    sizes: ["s", "m", "l", "xl"],
    price: "Rp 4.800.000",
    priceNum: 4800000,
    badge: "WATER RESISTANT",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDcZk-cp-GSey_KTtKGxeYhcqvi1x-bpmSWRGN9h9znuOWevGJm-9OwowKhjMD8ULC4wKQTFnHxc3uIFlFcvaiX2Yseq04dY2A6uiqOBAsTDgoGgyhCuU2Pp--etvh967t7g-4kUw_JGTzqENzD40kSJ2W9yi49ZBRp2jLEwbr2OMgK7SeQV2Hgw5paaL_TX91zoMYF7O2LTX_V6tVleY0zpXXpQQU7iLkf9p5-Z_wX6bY9GH_4EOJD",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAf9CdaqAKUA8hQcB7dpmu30F8shDwztiqCil7TzkTB7nYHSGK-dWw0wEBEtV-TVr3JQp-LS4tCT__PWXU9IBj2uCXUygY-Vr7hlCOrcDFJpUCGYEYq_YTvXs8emQH-d2olLraVRt8hEuLGABYWPZN9yY4JjuCFAmjuLBCzZlSXu2Tm_btZENE-gv3tmnW89GEodaYYHaX-bLrALoyM6tsGhDoUNMKNKCj-Ijgu9LPirq32irratTQ2",
    ],
  },
];

export default PRODUCTS_DATA;
