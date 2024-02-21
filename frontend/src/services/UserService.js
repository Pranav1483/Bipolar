import axios from "axios";

const HOST_1 = "http://13.201.40.24:80";
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

    adminLogin(creds) {
        return axios.post(`${BACKEND_BASE_URL}/admin`, creds)
    }

    getAdmin(adminAuthToken) {
        return axios.get(`${BACKEND_BASE_URL}/admin`, {headers: {Authorization: `Token ${adminAuthToken}`}})
    }

    logoutAdmin(adminAuthToken) {
        return axios.get(`${BACKEND_BASE_URL}/admin/logout`, {headers: {Authorization: `Token ${adminAuthToken}`}})
    }

    adminSearchFlight(adminAuthToken, query) {
        return axios.get(`${BACKEND_BASE_URL}/flight?flight_number=${query.flight_number}&origin=${query.origin}&destination=${query.destination}`, {headers: {Authorization: `Token ${adminAuthToken}`}})
    }

    adminDeleteFlight(adminAuthToken, id) {
        return axios.delete(`${BACKEND_BASE_URL}/flight?flight_number=${id}`, {headers: {Authorization: `Token ${adminAuthToken}`}})
    }

    adminAddFlight(adminAuthToken, newFlight) {
        return axios.post(`${BACKEND_BASE_URL}/flight`, newFlight, {headers: {Authorization: `Token ${adminAuthToken}`}})
    }

    adminDeleteSchedule(adminAuthToken, id) {
        return axios.delete(`${BACKEND_BASE_URL}/schedule?flightScheduleId=${id}`, {headers: {Authorization: `Token ${adminAuthToken}`}})
    }

    adminAddSchedule(adminAuthToken, schedule) {
        return axios.post(`${BACKEND_BASE_URL}/schedule`, schedule, {headers: {Authorization: `Token ${adminAuthToken}`}})
    }

    adminSearchBookings(adminAuthToken, query) {
        return axios.get(`${BACKEND_BASE_URL}/booking?flight_number=${query.flight_number}&start=${query.start}&end=${query.end}`, {headers: {Authorization: `Token ${adminAuthToken}`}})
    }

}

const userService = new UserService();
export default userService;