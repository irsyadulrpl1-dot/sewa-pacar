import companion1 from "@/assets/companion-1.jpg";
import companion2 from "@/assets/companion-2.jpg";
import companion3 from "@/assets/companion-3.jpg";
import companion4 from "@/assets/companion-4.jpg";

export interface Companion {
  id: string;
  name: string;
  age: number;
  city: string;
  rating: number;
  hourlyRate: number;
  image: string;
  bio: string;
  description: string;
  personality: string[];
  hobbies: string[];
  activities: string[];
  availability: string;
  packages: {
    name: string;
    duration: string;
    price: number;
  }[];
  gallery: string[];
  whatsapp: string;
}

export const companions: Companion[] = [
  {
    id: "ayu-lestari",
    name: "Ayu Lestari",
    age: 22,
    city: "Jakarta",
    rating: 4.9,
    hourlyRate: 250000,
    image: companion1,
    bio: "Ceria dan asik diajak ngobrol, cocok buat temenin ke acara apapun!",
    description: "Hai! Aku Ayu, cewek yang suka banget ketemu orang baru. Hobi aku traveling, nongkrong di cafe aesthetic, dan dengerin musik. Aku bisa jadi temen hangout yang asik, partner foto-foto, atau temen curhat yang baik. Yuk ketemuan!",
    personality: ["Ceria", "Friendly", "Humble", "Seru"],
    hobbies: ["Cafe hopping", "Nonton film", "Traveling", "Main game"],
    activities: ["Teman hangout", "Teman acara", "Jalan-jalan", "Nongkrong"],
    availability: "Senin - Sabtu, fleksibel",
    packages: [
      { name: "Coffee Date", duration: "3 jam", price: 650000 },
      { name: "Full Day Hangout", duration: "8 jam", price: 1500000 },
      { name: "Weekend Trip", duration: "2 hari", price: 4000000 },
    ],
    gallery: [companion1],
    whatsapp: "+6281234567890",
  },
  {
    id: "raka-pratama",
    name: "Raka Pratama",
    age: 24,
    city: "Bandung",
    rating: 4.8,
    hourlyRate: 300000,
    image: companion2,
    bio: "Cowok humble yang siap jadi partner seru buat acara kamu!",
    description: "Hey! Gue Raka, cowok yang suka adventure dan hal-hal baru. Dari nongkrong santai, hiking, sampe formal event, gue bisa handle semua. Gue juga dengerin musik, main basket, dan suka masak. Butuh temen yang asik? Hit me up!",
    personality: ["Cool", "Humoris", "Perhatian", "Easy-going"],
    hobbies: ["Basket", "Masak", "Musik", "Gym"],
    activities: ["Teman dinner", "Acara formal", "Sports", "Traveling"],
    availability: "Jadwal fleksibel",
    packages: [
      { name: "Dinner Date", duration: "3 jam", price: 800000 },
      { name: "Full Day", duration: "8 jam", price: 1800000 },
      { name: "Weekend Getaway", duration: "2 hari", price: 5000000 },
    ],
    gallery: [companion2],
    whatsapp: "+6281234567891",
  },
  {
    id: "sinta-dewi",
    name: "Sinta Dewi",
    age: 21,
    city: "Surabaya",
    rating: 5.0,
    hourlyRate: 280000,
    image: companion3,
    bio: "Kalem tapi seru, bisa jadi temen ngobrol atau partner foto!",
    description: "Halo! Nama aku Sinta. Aku orangnya kalem tapi tetep asik kok kalau udah kenal. Suka banget sama seni, fotografi, dan coffee shop hunting. Kalau kamu butuh temen yang bisa bikin suasana nyaman dan fun, aku siap!",
    personality: ["Kalem", "Sweet", "Kreatif", "Good listener"],
    hobbies: ["Fotografi", "Melukis", "Baca buku", "Yoga"],
    activities: ["Coffee date", "Art exhibition", "Foto session", "Jalan santai"],
    availability: "Weekdays & Weekend",
    packages: [
      { name: "Cafe Hangout", duration: "4 jam", price: 900000 },
      { name: "Full Day", duration: "8 jam", price: 1700000 },
      { name: "Extended Trip", duration: "2 hari", price: 4500000 },
    ],
    gallery: [companion3],
    whatsapp: "+6281234567892",
  },
  {
    id: "dimas-putra",
    name: "Dimas Putra",
    age: 25,
    city: "Yogyakarta",
    rating: 4.9,
    hourlyRate: 275000,
    image: companion4,
    bio: "Seru, asyik, dan bisa jadi partner buat explore tempat baru!",
    description: "Yo! Gue Dimas dari Jogja. Gue suka explore tempat-tempat keren, dari wisata alam sampe kuliner lokal. Orangnya santai tapi tetep bisa serius kalau dibutuhin. Mau cari temen healing atau jalan-jalan? Gue ready!",
    personality: ["Santai", "Adventurous", "Seru", "Loyal"],
    hobbies: ["Motoran", "Kuliner", "Fotografi", "Nonton konser"],
    activities: ["City tour", "Kuliner trip", "Event partner", "Traveling"],
    availability: "Kamis - Minggu",
    packages: [
      { name: "Hangout Santai", duration: "3 jam", price: 700000 },
      { name: "Full Day Explore", duration: "8 jam", price: 1600000 },
      { name: "Travel Buddy", duration: "3 hari", price: 6000000 },
    ],
    gallery: [companion4],
    whatsapp: "+6281234567893",
  },
];
