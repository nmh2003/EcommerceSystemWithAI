import { API_BASE_URL, API_ENDPOINTS } from "./constants";

async function handleResponse(response) {

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {

    const error = new Error(data.error || data.message || "Đã xảy ra lỗi");
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

function getHeaders(customHeaders = {}) {
  return {
    "Content-Type": "application/json",
    ...customHeaders,
  };
}

export async function registerUser(userData) {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.auth.register}`,
    {
      method: "POST",
      headers: getHeaders(),
      credentials: "include", // Gửi/nhận cookie
      body: JSON.stringify(userData),
    }
  );

  return handleResponse(response);
}

export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.login}`, {
    method: "POST",
    headers: getHeaders(),
    credentials: "include", // Gửi/nhận cookie
    body: JSON.stringify(credentials),
  });

  return handleResponse(response);
}

export async function logoutUser() {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.logout}`, {
    method: "POST",
    credentials: "include", // Gửi cookie để backend clear
  });

  return handleResponse(response);
}

export async function verifyOTP(email, otpCode) {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.auth.verifyOTP}`,
    {
      method: "POST",
      headers: {

        ...getHeaders(),
      },
      body: JSON.stringify({ email, otp: otpCode }),
    }
  );

  return handleResponse(response);
}

export async function sendOTP(email) {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.auth.sendOTP}`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ email }),
  });

  return handleResponse(response);
}

export async function getProducts(params = {}) {

  const queryString = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}${API_ENDPOINTS.products.getAll}${
    queryString ? "?" + queryString : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function getProductById(id) {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.products.getById(id)}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export async function createProduct(productData) {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.products.create}`,
    {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(productData),
    }
  );

  return handleResponse(response);
}

export async function updateProduct(id, productData) {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.products.update(id)}`,
    {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(productData),
    }
  );

  return handleResponse(response);
}

export async function deleteProduct(id) {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.products.delete(id)}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export async function getCategories(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}${API_ENDPOINTS.categories.getAll}${
    queryString ? "?" + queryString : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function getCategoryById(id) {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.categories.getById(id)}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export async function createCategory(categoryData) {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.categories.create}`,
    {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(categoryData),
    }
  );

  return handleResponse(response);
}

export async function updateCategory(id, categoryData) {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.categories.update(id)}`,
    {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(categoryData),
    }
  );

  return handleResponse(response);
}

export async function deleteCategory(id) {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.categories.delete(id)}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export async function createOrder(orderData) {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.orders.create}`,
    {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(orderData),
    }
  );

  return handleResponse(response);
}

export async function getUserOrders() {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.orders.getMine}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export async function getOrderById(id) {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.orders.getById(id)}`,
    {
      method: "GET",
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export async function getAllOrders(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_BASE_URL}${API_ENDPOINTS.orders.getAll}${
    queryString ? "?" + queryString : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  return handleResponse(response);
}

export async function updateOrderStatus(id, statusData) {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.orders.updateStatus(id)}`,
    {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(statusData),
    }
  );

  return handleResponse(response);
}

export async function uploadImage(formData) {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.upload.image}`, {
    method: "POST",

    credentials: "include",
    body: formData,
  });

  return handleResponse(response);
}

export async function deleteImage(filename) {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.upload.delete}?filename=${filename}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  return handleResponse(response);
}

export default {

  registerUser,
  loginUser,
  logoutUser,

  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,

  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,

  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,

  uploadImage,
  deleteImage,
};
