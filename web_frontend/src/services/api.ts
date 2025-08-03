import axios from 'axios';

const BASE_URL = 'http://10.35.250.75:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
});

const safeRequest = async (request: Promise<any>) => {
  try {
    const response = await request;
    return { data: response.data, error: null };
  } catch (error: any) {
    console.error('API error:', error?.message || error);
    return { data: null, error };
  }
};

export const getStates = async () => {
  return safeRequest(api.get('/states'));
};

export const getDivisions = async (stateCode: string) => {
  return safeRequest(api.get(`/divisions/${stateCode}`));
};

export const getDistricts = async (stateCode: string, divisionCode: string) => {
  return safeRequest(api.get(`/districts?state_code=${stateCode}&division_code=${divisionCode}`));
};

export const getTalukas = async (stateCode: string, divisionCode: string, districtCode: string) => {
  return safeRequest(api.get(`/talukas?state_code=${stateCode}&division_code=${divisionCode}&district_code=${districtCode}`));
};
