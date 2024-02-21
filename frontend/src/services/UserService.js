import axios from "axios";

const HOST = "http://localhost:8000";
const VERSION = "v1";
const BACKEND_BASE_URL = `${HOST}/api/${VERSION}`;

class UserService {

    login(creds) {
        return axios.post(`${BACKEND_BASE_URL}/login`, creds)
    }

    signup(creds) {
        return axios.post(`${BACKEND_BASE_URL}/signup`, creds)
    }

    getUser(authToken) {
        return axios.get(`${BACKEND_BASE_URL}/login`, {headers: {Authorization: `Token ${authToken}`}})
    }

    logout(authToken) {
        return axios.get(`${BACKEND_BASE_URL}/logout`, {headers: {Authorization: `Token ${authToken}`}})
    }

    getUserBookings(authToken) {
        return axios.get(`${BACKEND_BASE_URL}/booking`, {headers: {Authorization: `Token ${authToken}`}})
    }

    searchFlightsByQuery(authToken, query) {
        return axios.get(`${BACKEND_BASE_URL}/schedule?start=${query.start}&end=${query.end}&origin=${query.origin}&destination=${query.destination}`, {headers: {Authorization: `Token ${authToken}`}})
    }

    searchFlightsById(authToken, id) {
        return axios.get(`${BACKEND_BASE_URL}/schedule?id=${id}`, {headers: {Authorization: `Token ${authToken}`}})
    }

    buyTicket(authToken, id, quantity) {
        return axios.post(`${BACKEND_BASE_URL}/booking`, {flightScheduleId: id, quantity: quantity}, {headers: {Authorization: `Token ${authToken}`}})
    }

}

const userService = new UserService();
export default userService;