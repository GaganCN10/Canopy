import Species from '../models/Species.js';
import logger from '../utils/logger.js';

export const createSpecies = async (speciesData) => {
  const species = await Species.create(speciesData);
  return species;
};

export const getAllSpecies = async ({ page = 1, limit = 20, search = '' } = {}) => {
  const query = search ? { name: { $regex: search, $options: 'i' } } : {};
  const species = await Species.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ name: 1 });

  const total = await Species.countDocuments(query);

  return { species, total, page, limit };
};

export const getSpeciesById = async (id) => {
  const species = await Species.findById(id);
  if (!species) {
    throw new Error('Species not found');
  }
  return species;
};

export const updateSpecies = async (id, updateData) => {
  const species = await Species.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!species) {
    throw new Error('Species not found');
  }
  return species;
};

export const deleteSpecies = async (id) => {
  const species = await Species.findByIdAndDelete(id);
  if (!species) {
    throw new Error('Species not found');
  }
  return species;
};
