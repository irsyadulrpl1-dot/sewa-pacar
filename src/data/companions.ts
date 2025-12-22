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
    id: "sophia-laurent",
    name: "Sophia Laurent",
    age: 26,
    city: "New York",
    rating: 4.9,
    hourlyRate: 150,
    image: companion1,
    bio: "Elegant and well-traveled, perfect for sophisticated events.",
    description: "With a background in art history and a passion for fine dining, I bring sophistication and warmth to every encounter. Whether it's a gallery opening, corporate event, or an intimate dinner, I'll ensure you feel confident and at ease with a companion who can hold captivating conversations.",
    personality: ["Charming", "Intellectual", "Warm", "Adventurous"],
    hobbies: ["Art galleries", "Wine tasting", "Travel", "Reading"],
    activities: ["Dining companion", "Event companion", "Travel partner", "Social events"],
    availability: "Monday - Saturday, evenings preferred",
    packages: [
      { name: "Evening Date", duration: "3 hours", price: 400 },
      { name: "Full Day", duration: "8 hours", price: 950 },
      { name: "Weekend Getaway", duration: "2 days", price: 2500 },
    ],
    gallery: [companion1],
    whatsapp: "+1234567890",
  },
  {
    id: "james-harrison",
    name: "James Harrison",
    age: 29,
    city: "Los Angeles",
    rating: 4.8,
    hourlyRate: 175,
    image: companion2,
    bio: "Charismatic gentleman with a love for adventure and great conversation.",
    description: "Former finance professional turned lifestyle consultant, I offer more than just companionship—I offer an experience. My expertise in fine dining, sports, and cultural events makes me the perfect plus-one for any occasion where you need a confident, articulate companion by your side.",
    personality: ["Confident", "Humorous", "Attentive", "Cultured"],
    hobbies: ["Golf", "Fine dining", "Sports events", "Music"],
    activities: ["Business dinners", "Galas", "Sports events", "Travel companion"],
    availability: "Flexible schedule",
    packages: [
      { name: "Business Dinner", duration: "3 hours", price: 475 },
      { name: "Full Day", duration: "8 hours", price: 1100 },
      { name: "Weekend Trip", duration: "2 days", price: 3000 },
    ],
    gallery: [companion2],
    whatsapp: "+1234567891",
  },
  {
    id: "mei-chen",
    name: "Mei Chen",
    age: 24,
    city: "San Francisco",
    rating: 5.0,
    hourlyRate: 160,
    image: companion3,
    bio: "Graceful and multilingual, specializing in international events.",
    description: "Fluent in English, Mandarin, and Japanese, I bridge cultures with ease. My background in international relations and genuine curiosity about people makes every interaction meaningful. I specialize in accompanying clients to multicultural events, business meetings with international partners, or simply enjoying a peaceful evening conversation.",
    personality: ["Graceful", "Multilingual", "Empathetic", "Refined"],
    hobbies: ["Tea ceremonies", "Calligraphy", "Contemporary art", "Meditation"],
    activities: ["International events", "Cultural experiences", "Business meetings", "Casual walks"],
    availability: "Weekdays and weekends",
    packages: [
      { name: "Cultural Experience", duration: "4 hours", price: 550 },
      { name: "Full Day", duration: "8 hours", price: 1000 },
      { name: "Extended Experience", duration: "2 days", price: 2700 },
    ],
    gallery: [companion3],
    whatsapp: "+1234567892",
  },
  {
    id: "marcus-cole",
    name: "Marcus Cole",
    age: 32,
    city: "Miami",
    rating: 4.9,
    hourlyRate: 165,
    image: companion4,
    bio: "Sophisticated world traveler with stories from every continent.",
    description: "Having lived in five countries and visited over 40, I bring a worldly perspective to every conversation. Whether you need a companion for a yacht party, a sophisticated dinner, or simply want engaging company for an evening out, my easy-going nature and diverse experiences make me adaptable to any social setting.",
    personality: ["Worldly", "Easy-going", "Storyteller", "Sophisticated"],
    hobbies: ["Sailing", "Photography", "Cuisine exploration", "History"],
    activities: ["Social events", "Yacht parties", "Dinner companion", "Travel"],
    availability: "Thursday - Sunday",
    packages: [
      { name: "Evening Out", duration: "3 hours", price: 450 },
      { name: "Full Day", duration: "8 hours", price: 1050 },
      { name: "Travel Companion", duration: "3 days", price: 4000 },
    ],
    gallery: [companion4],
    whatsapp: "+1234567893",
  },
];
