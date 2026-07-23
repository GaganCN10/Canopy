import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Species from '../models/Species.js';

dotenv.config();

const INDIAN_SPECIES = [
  {
    name: 'Bengal Tiger',
    scientificName: 'Panthera tigris tigris',
    conservationStatus: 'EN',
    description: 'The Bengal tiger is a population of the Panthera tigris tigris subspecies.',
    region: ['India', 'Nepal', 'Bangladesh', 'Bhutan'],
  },
  {
    name: 'Indian Elephant',
    scientificName: 'Elephas maximus indicus',
    conservationStatus: 'EN',
    description: 'The Indian elephant is a domesticated subspecies of the Asian elephant.',
    region: ['India', 'Sri Lanka', 'Nepal'],
  },
  {
    name: 'Indian Rhinoceros',
    scientificName: 'Rhinoceros unicornis',
    conservationStatus: 'VU',
    description: 'The Indian rhinoceros is a species of rhinoceros native to the Indian subcontinent.',
    region: ['India', 'Nepal'],
  },
  {
    name: 'Asiatic Lion',
    scientificName: 'Panthera leo persica',
    conservationStatus: 'EN',
    description: 'The Asiatic lion is a population of Panthera leo that survives today only in India.',
    region: ['India'],
  },
  {
    name: 'Snow Leopard',
    scientificName: 'Panthera uncia',
    conservationStatus: 'VU',
    description: 'The snow leopard is a felid that lives in Central and South Asia.',
    region: ['India', 'Nepal', 'Bhutan', 'China', 'Pakistan'],
  },
  {
    name: 'Indian Peafowl',
    scientificName: 'Pavo cristatus',
    conservationStatus: 'LC',
    description: 'The Indian peafowl is a large and brightly colored bird native to South Asia.',
    region: ['India', 'Sri Lanka', 'Pakistan', 'Nepal'],
  },
  {
    name: 'Great Indian Bustard',
    scientificName: 'Ardeotis nigriceps',
    conservationStatus: 'CR',
    description: 'The great Indian bustard is a large bird species native to the Indian subcontinent.',
    region: ['India'],
  },
  {
    name: 'Indian Wolf',
    scientificName: 'Canis lupus pallipes',
    conservationStatus: 'EN',
    description: 'The Indian wolf is a subspecies of gray wolf found in the Indian subcontinent.',
    region: ['India', 'Pakistan', 'Iran'],
  },
  {
    name: 'Sloth Bear',
    scientificName: 'Melursus ursinus',
    conservationStatus: 'VU',
    description: 'The sloth bear is a bear species native to the Indian subcontinent.',
    region: ['India', 'Nepal', 'Sri Lanka', 'Bhutan'],
  },
  {
    name: 'Wild Boar',
    scientificName: 'Sus scrofa',
    conservationStatus: 'LC',
    description: 'The wild boar is a suid native to much of Eurasia and North Africa.',
    region: ['India', 'Nepal', 'Sri Lanka', 'Bangladesh'],
  },
  {
    name: 'Sambar Deer',
    scientificName: 'Rusa unicolor',
    conservationStatus: 'VU',
    description: 'The sambar is a large deer native to the Indian subcontinent.',
    region: ['India', 'Nepal', 'Sri Lanka', 'Bangladesh'],
  },
  {
    name: 'Spotted Deer',
    scientificName: 'Axis axis',
    conservationStatus: 'LC',
    description: 'The chital or spotted deer is a deer species native to the Indian subcontinent.',
    region: ['India', 'Nepal', 'Sri Lanka', 'Bangladesh'],
  },
  {
    name: 'Indian Gazelle',
    scientificName: 'Gazella bennettii',
    conservationStatus: 'NT',
    description: 'The Indian gazelle is a gazelle species native to the Indian subcontinent.',
    region: ['India', 'Pakistan', 'Iran'],
  },
  {
    name: 'Mugger Crocodile',
    scientificName: 'Crocodylus palustris',
    conservationStatus: 'VU',
    description: 'The mugger crocodile is a medium-sized crocodilian native to the Indian subcontinent.',
    region: ['India', 'Sri Lanka', 'Nepal', 'Pakistan', 'Bangladesh'],
  },
  {
    name: 'King Cobra',
    scientificName: 'Ophiophagus hannah',
    conservationStatus: 'VU',
    description: 'The king cobra is a venomous snake species endemic to Asia.',
    region: ['India', 'Sri Lanka', 'Nepal', 'Bangladesh', 'Myanmar', 'Thailand', 'China', 'Malaysia', 'Indonesia'],
  },
  {
    name: 'Indian Rock Python',
    scientificName: 'Python molurus',
    conservationStatus: 'NT',
    description: 'The Indian rock python is a large constricting snake species native to the Indian subcontinent.',
    region: ['India', 'Sri Lanka', 'Nepal', 'Bangladesh', 'Pakistan', 'Myanmar'],
  },
  {
    name: 'Gharial',
    scientificName: 'Gavialis gangeticus',
    conservationStatus: 'CR',
    description: 'The gharial is a fish-eating crocodilian native to the Indian subcontinent.',
    region: ['India', 'Nepal', 'Bangladesh'],
  },
  {
    name: 'Golden Jackal',
    scientificName: 'Canis aureus',
    conservationStatus: 'LC',
    description: 'The golden jackal is a canid species native to Eurasia.',
    region: ['India', 'Nepal', 'Sri Lanka', 'Bangladesh', 'Pakistan'],
  },
  {
    name: 'Himalayan Monal',
    scientificName: 'Lophophorus impejanus',
    conservationStatus: 'LC',
    description: 'The Himalayan monal is a bird species native to the Himalayas.',
    region: ['India', 'Nepal', 'Bhutan', 'China', 'Pakistan'],
  },
  {
    name: 'Nilgiri Tahr',
    scientificName: 'Nilgiritragus hylocrius',
    conservationStatus: 'EN',
    description: 'The Nilgiri tahr is a goat species endemic to the Nilgiri Hills in South India.',
    region: ['India'],
  },
];

const seedSpecies = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingCount = await Species.countDocuments();
    console.log(`Existing species count: ${existingCount}`);

    for (const species of INDIAN_SPECIES) {
      const existing = await Species.findOne({ name: species.name });
      if (!existing) {
        await Species.create(species);
        console.log(`Created species: ${species.name}`);
      } else {
        console.log(`Species already exists: ${species.name}`);
      }
    }

    const newCount = await Species.countDocuments();
    console.log(`New species count: ${newCount}`);
    console.log('Seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedSpecies();
