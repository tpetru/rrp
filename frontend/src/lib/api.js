import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({ baseURL: API });

export const getStats = () => api.get("/stats").then(r => r.data);
export const getFactions = () => api.get("/factions").then(r => r.data);
export const getFactionMembers = (id) => api.get(`/factions/${id}/members`).then(r => r.data);

export const getPlayers = () => api.get("/players").then(r => r.data);
export const createPlayer = (data) => api.post("/players", data).then(r => r.data);
export const updatePlayer = (id, data) => api.put(`/players/${id}`, data).then(r => r.data);
export const deletePlayer = (id) => api.delete(`/players/${id}`).then(r => r.data);

export const getVehicles = () => api.get("/vehicles").then(r => r.data);
export const createVehicle = (data) => api.post("/vehicles", data).then(r => r.data);
export const deleteVehicle = (id) => api.delete(`/vehicles/${id}`).then(r => r.data);

export const getHouses = () => api.get("/houses").then(r => r.data);
export const createHouse = (data) => api.post("/houses", data).then(r => r.data);
export const assignHouse = (hid, pid) => api.post(`/houses/${hid}/assign/${pid}`).then(r => r.data);
export const deleteHouse = (id) => api.delete(`/houses/${id}`).then(r => r.data);

export const getBusinesses = () => api.get("/businesses").then(r => r.data);
export const createBusiness = (data) => api.post("/businesses", data).then(r => r.data);
export const assignBusiness = (bid, pid) => api.post(`/businesses/${bid}/assign/${pid}`).then(r => r.data);
export const deleteBusiness = (id) => api.delete(`/businesses/${id}`).then(r => r.data);

export const getPaydayConfig = () => api.get("/payday/config").then(r => r.data);
export const updatePaydayConfig = (data) => api.put("/payday/config", data).then(r => r.data);
export const runPayday = () => api.post("/payday/run").then(r => r.data);
export const getPaydayHistory = () => api.get("/payday/history").then(r => r.data);

export const getCurrentElection = () => api.get("/elections/current").then(r => r.data);
export const castVote = (data) => api.post("/elections/vote", data).then(r => r.data);
export const finalizeElection = () => api.post("/elections/finalize").then(r => r.data);
export const getPresident = () => api.get("/president").then(r => r.data);
export const setPresidentTaxes = (data) => api.put("/president/taxes", data).then(r => r.data);
