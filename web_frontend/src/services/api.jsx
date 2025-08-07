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

export const fetchSchemes = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/scheme/list`);
    console.log(response)
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Error fetching schemes:', error);
    return { data: null, error };
  }
};

export const fetchSchemes2 = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/scheme/list2`);
    console.log(response)
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Error fetching schemes:', error);
    return { data: null, error };
  }
};


export const uploadSchemeData = async (payload) => {
  try {
    const response = await axios.post(`${BASE_URL}/scheme/data`, payload);
    return { data: response.data, error: null };
  } catch (error) {
    console.error('Error uploading scheme data:', error);
    return { data: null, error };
  }
};

export const fetchSchemeStructure = async (schemeCode) => {
  try {
    const res = await axios.get(`http://localhost:5000/api/scheme/${schemeCode}/categories`);
    return { data: res.data };
  } catch (error) {
    console.error('Error fetching scheme structure:', error);
    return { error };
  }
};

export const getDashboardData = async (filters) =>
  safeRequest(api.post('/getDashboardData', filters));

export const getTimeSeriesData = (payload) => axios.post(`${BASE_URL}/dashboard/timeseries`, payload);
export const loginUser = async (credentials) => {
  return safeRequest(api.post('/login', credentials));
};

export const changePassword = async (payload) => {
  return safeRequest(api.post('/change-password', payload));
};

