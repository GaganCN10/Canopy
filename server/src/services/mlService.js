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
  const { data } = await mlClient.post('/predict/species-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const triageCameraTrap = async (formData) => {
  const { data } = await mlClient.post('/predict/camera-trap', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const predictBioacoustic = async (formData) => {
  const { data } = await mlClient.post('/predict/bioacoustic', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const predictThreatAudio = async (formData) => {
  const { data } = await mlClient.post('/predict/threat-audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getHabitatNDVI = async (payload) => {
  const { data } = await mlClient.post('/predict/habitat-ndvi', payload);
  return data;
};

export const getPoachingHotspots = async (payload) => {
  const { data } = await mlClient.post('/predict/poaching-hotspots', payload);
  return data;
};

export const getPopulationForecast = async (payload) => {
  const { data } = await mlClient.post('/predict/population-forecast', payload);
  return data;
};

export const detectAnomalies = async (payload) => {
  const { data } = await mlClient.post('/predict/anomalies', payload);
  return data;
};

export const scanTradeText = async (payload) => {
  const { data } = await mlClient.post('/predict/trade-scan', payload);
  return data;
};

export const getMovementCorridors = async (payload) => {
  const { data } = await mlClient.post('/predict/movement-corridors', payload);
  return data;
};
