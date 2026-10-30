import type { Category, Product, Settings, StoreData } from "./types";

export const defaultSettings = (): Settings => ({
  monogram: "LR",
  siteName: "Lista de regalos",
  title: "Esenciales para el recién nacido",
  subtitle: "Lo que de verdad necesitan las primeras 8 semanas",
  scriptNote: "Empieza simple,\nsuma solo lo necesario",
  footerLine: "Un comienzo más tranquilo para su casa",
  currency: "USD",
  notifyEmail: "",
  bankName: "",
  accountHolder: "",
  accountNumber: "",
  bankNote: "",
  guestTemplate: `Hola {{nombre}},

Gracias por pensar en el bebé. Apartamos lo que elegiste:

{{items}}

Total: {{total}}

Cuando puedas, envía la transferencia con estos datos:

Banco: {{banco}}
Titular: {{titular}}
Cuenta o IBAN: {{iban}}
Referencia: {{codigo}}

{{nota}}

Un abrazo.`,
  ownerTemplate: `{{nombre}} ({{correo}}) apartó un regalo.

{{items}}

Total: {{total}}
Referencia: {{codigo}}

Mensaje:
{{mensaje}}`,
});

const categories: Category[] = [
  { id: "cat-alimentacion", name: "Alimentación", sort: 10, span: "full" },
  { id: "cat-sueno", name: "Sueño", sort: 20, span: "half" },
  { id: "cat-panales", name: "Pañales", sort: 30, span: "half" },
  { id: "cat-ropa", name: "Ropa", sort: 40, span: "third" },
  { id: "cat-bano", name: "Baño", sort: 50, span: "third" },
  { id: "cat-salud", name: "Salud", sort: 60, span: "third" },
  { id: "cat-calma", name: "Calma", sort: 70, span: "half" },
  { id: "cat-paseo", name: "De paseo", sort: 80, span: "half" },
];

const rows: [string, string, string, number, number, string][] = [
  ["prod-biberones", "cat-alimentacion", "Biberones", 2800, 2, "bottles"],
  ["prod-cepillo", "cat-alimentacion", "Cepillo para biberón", 800, 2, "brush"],
  ["prod-escurridor", "cat-alimentacion", "Escurridor", 2200, 1, "rack"],
  ["prod-panitos", "cat-alimentacion", "Pañitos para eructar", 1600, 2, "burp"],
  ["prod-baberos", "cat-alimentacion", "Baberos", 1400, 2, "bibs"],
  ["prod-almohada", "cat-alimentacion", "Almohada de lactancia", 4000, 1, "pillow"],
  ["prod-moises", "cat-sueno", "Moisés", 12000, 1, "bassinet"],
  ["prod-colchon", "cat-sueno", "Colchón de cuna", 8000, 1, "mattress"],
  ["prod-sabanas", "cat-sueno", "Sábanas", 2400, 2, "sheets"],
  ["prod-arrullos", "cat-sueno", "Arrullos", 3000, 2, "swaddles"],
  ["prod-sacos", "cat-sueno", "Sacos para dormir", 2800, 2, "sacks"],
  ["prod-ruido", "cat-sueno", "Máquina de ruido", 3500, 1, "sound"],
  ["prod-monitor", "cat-sueno", "Monitor", 7000, 1, "monitor"],
  ["prod-panales", "cat-panales", "Pañales", 3600, 3, "diapers"],
  ["prod-toallitas", "cat-panales", "Toallitas húmedas", 1200, 3, "wipes"],
  ["prod-crema", "cat-panales", "Crema para pañal", 1000, 2, "cream"],
  ["prod-espatula", "cat-panales", "Espátula", 600, 2, "spatula"],
  ["prod-cambiador", "cat-panales", "Cambiador", 2500, 1, "pad"],
  ["prod-organizador", "cat-panales", "Organizador de pañales", 3200, 1, "caddy"],
  ["prod-cesto", "cat-panales", "Cesto para pañales", 4500, 1, "pail"],
  ["prod-mamelucos", "cat-ropa", "Mamelucos", 2200, 2, "onesies"],
  ["prod-enteritos", "cat-ropa", "Enteritos", 2600, 2, "sleepers"],
  ["prod-medias", "cat-ropa", "Medias", 1000, 2, "socks"],
  ["prod-gorros", "cat-ropa", "Gorros", 1200, 2, "hats"],
  ["prod-mitones", "cat-ropa", "Mitones", 800, 2, "mittens"],
  ["prod-panos-bano", "cat-bano", "Paños de baño", 1200, 2, "washcloths"],
  ["prod-toalla", "cat-bano", "Toalla con capucha", 1800, 2, "towel"],
  ["prod-jabon", "cat-bano", "Jabón", 900, 2, "soap"],
  ["prod-locion", "cat-bano", "Loción", 1100, 2, "lotion"],
  ["prod-tina", "cat-bano", "Tina", 2800, 1, "tub"],
  ["prod-termometro", "cat-salud", "Termómetro", 1800, 1, "thermo"],
  ["prod-aspirador", "cat-salud", "Aspirador nasal", 1400, 1, "aspirator"],
  ["prod-aseo", "cat-salud", "Kit de aseo", 1600, 1, "grooming"],
  ["prod-lima", "cat-salud", "Lima", 500, 2, "nail"],
  ["prod-dosificador", "cat-salud", "Dosificador", 800, 2, "medicine"],
  ["prod-chupetes", "cat-calma", "Chupetes", 1000, 2, "pacifiers"],
  ["prod-mordedor", "cat-calma", "Mordedor", 900, 2, "teether"],
  ["prod-hamaca", "cat-calma", "Hamaca", 7000, 1, "bouncer"],
  ["prod-peluche", "cat-calma", "Peluche", 1800, 2, "toy"],
  ["prod-cochecito", "cat-paseo", "Cochecito", 28000, 1, "stroller"],
  ["prod-silla", "cat-paseo", "Silla de auto", 18000, 1, "carseat"],
  ["prod-panalera", "cat-paseo", "Pañalera", 5500, 1, "bag"],
  ["prod-portabebe", "cat-paseo", "Portabebé", 9000, 1, "carrier"],
  ["prod-portatil", "cat-paseo", "Cambiador portátil", 2200, 1, "mat"],
];

export function initialData(): StoreData {
  const products: Product[] = rows.map((row, index) => ({
    id: row[0],
    categoryId: row[1],
    name: row[2],
    priceCents: row[3],
    stock: row[4],
    imageUrl: `icon:${row[5]}`,
    amazonUrl: "",
    published: true,
    sort: (index + 1) * 10,
  }));

  return {
    settings: defaultSettings(),
    categories,
    products,
    orders: [],
  };
}
