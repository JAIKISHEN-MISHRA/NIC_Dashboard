// src/services/api.jsx
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

const safeRequest = async (request) => {
  try {
    const response = await request;
    return { data: response.data, error: null };
  } catch (error) {
    console.error('API error:', error?.response?.data || error.message || error);
    return { data: null, error };
  }
};

export const submitSignup = async (payload) => {
  return safeRequest(api.post('/signup', payload));
};

export const getStates = async () => safeRequest(api.get('/states'));

export const getDivisions = async (stateCode) =>
  safeRequest(api.get(`/divisions/${stateCode}`));

export const getDistricts = async (stateCode, divisionCode) =>
  safeRequest(api.get(`/districts?state_code=${stateCode}&division_code=${divisionCode}`));

export const getTalukas = async (stateCode, divisionCode, districtCode) =>
  safeRequest(api.get(
    `/talukas?state_code=${stateCode}&division_code=${divisionCode}&district_code=${districtCode}`
  ));
