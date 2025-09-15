import axios from "../api/axios";

export const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) throw new Error("No refresh token");

    const response = await axios.get("/auth/refresh", {
      headers: {
        Authorization: `Bearer ${refreshToken}`,
      },
    });

    const { accessToken } = response.data;
    if (accessToken) {
      localStorage.setItem("accessToken", accessToken);
      return accessToken;
    } else {
      throw new Error("No access token returned");
    }
  } catch (err) {
    console.error("Failed to refresh token:", err.response?.data || err.message);
    return null;
  }
};