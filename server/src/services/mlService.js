import axios from 'axios';
import { config } from '../config/env.js';
import logger from '../utils/logger.js';

const ML_SERVICE_URL = config.mlServiceUrl;

export const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 120000,
});

export const checkMLHealth = async () => {
  try {
    const { data } = await mlClient.get('/health');
    return data;
  } catch (error) {
    logger.error('ML service health check failed:', error);
    throw new Error('ML service is unavailable');
  }
};

export const predictSpeciesImage = async (formData) => {
  const { data } = await mlClient.post('/species-image', formData);
  return data;
};

export const triageCameraTrap = async (formData) => {
  const { data } = await mlClient.post('/camera-trap', formData);
  return data;
};

export const predictBioacoustic = async (formData) => {
  const { data } = await mlClient.post('/bioacoustic', formData);
  return data;
};

export const predictThreatAudio = async (formData) => {
  const { data } = await mlClient.post('/threat-audio', formData);
  return data;
};

export const getHabitatNDVI = async (payload) => {
  const { data } = await mlClient.post('/habitat-ndvi', payload);
  return data;
};

export const getPoachingHotspots = async (payload) => {
  const { data } = await mlClient.post('/poaching-hotspots', payload);
  return data;
};

export const getPopulationForecast = async (payload) => {
  const { data } = await mlClient.post('/population-forecast', payload);
  return data;
};

export const detectAnomalies = async (payload) => {
  const { data } = await mlClient.post('/anomalies', payload);
  return data;
};

export const scanTradeText = async (payload) => {
  const { data } = await mlClient.post('/trade-scan', payload);
  return data;
};

export const getMovementCorridors = async (formData) => {
  const { data } = await mlClient.post('/movement-corridors', formData);
  return data;
};
