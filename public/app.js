const tokenEl = document.getElementById("token");
const outputEl = document.getElementById("output");
const sessionInfoEl = document.getElementById("sessionInfo");

const registerForm = document.getElementById("registerForm");
const loginForm = document.getElementById("loginForm");

const userIdInput = document.getElementById("userIdInput");
const blockUserIdInput = document.getElementById("blockUserIdInput");

const getUserBtn = document.getElementById("getUserBtn");
const getUsersBtn = document.getElementById("getUsersBtn");
const blockUserBtn = document.getElementById("blockUserBtn");
const saveTokenBtn = document.getElementById("saveTokenBtn");
const clearTokenBtn = document.getElementById("clearTokenBtn");
const logoutBtn = document.getElementById("logoutBtn");
const menuItems = document.querySelectorAll(".menu-item");
const views = document.querySelectorAll(".view");

const TOKEN_KEY = "user_service_access_token";
const USER_KEY = "user_service_current_user";
const savedToken = localStorage.getItem(TOKEN_KEY);
const savedUser = localStorage.getItem(USER_KEY);
if (savedToken) {
  tokenEl.value = savedToken;
}
if (savedUser) {
  updateSessionInfo(JSON.parse(savedUser));
}

function setActiveView(viewName) {
  menuItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === viewName);
  });
  views.forEach((view) => {
    view.classList.toggle("active", view.id === `view-${viewName}`);
  });
}

menuItems.forEach((item) => {
  item.addEventListener("click", () => setActiveView(item.dataset.view));
});

function renderResponse(label, payload) {
  outputEl.textContent = `${label}\n\n${JSON.stringify(payload, null, 2)}`;
}

function updateSessionInfo(user) {
  if (!user) {
    sessionInfoEl.textContent = "Нет авторизации";
    return;
  }
  sessionInfoEl.textContent = `${user.email} | ${user.role} | ${user.isActive ? "активен" : "заблокирован"}`;
}

function clearSession() {
  tokenEl.value = "";
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  updateSessionInfo(null);
}

function getHeaders(withAuth = false) {
  const headers = { "Content-Type": "application/json" };
  if (withAuth && tokenEl.value.trim()) {
    headers.Authorization = `Bearer ${tokenEl.value.trim()}`;
  }
  return headers;
}

async function request(label, path, options = {}) {
  try {
    const response = await fetch(path, options);
    const data = await response.json().catch(() => ({}));
    renderResponse(`${label} [${response.status}]`, data);
    return { response, data };
  } catch (error) {
    renderResponse(`${label} [ошибка-сети]`, {
      message: error?.message || "Не удалось выполнить запрос",
    });
    return null;
  }
}

registerForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(registerForm);

  const body = {
    fullName: String(form.get("fullName") || "").trim(),
    birthDate: String(form.get("birthDate") || "").trim(),
    email: String(form.get("email") || "").trim(),
    password: String(form.get("password") || ""),
  };

  const result = await request("РЕГИСТРАЦИЯ", "/auth/register", {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify(body),
  });

  if (result?.data?.accessToken) {
    tokenEl.value = result.data.accessToken;
    localStorage.setItem(USER_KEY, JSON.stringify(result.data.user));
    updateSessionInfo(result.data.user);
    setActiveView("users");
  }
});

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const form = new FormData(loginForm);

  const body = {
    email: String(form.get("email") || "").trim(),
    password: String(form.get("password") || ""),
  };

  const result = await request("ВХОД", "/auth/login", {
    method: "POST",
    headers: getHeaders(false),
    body: JSON.stringify(body),
  });

  if (result?.data?.accessToken) {
    tokenEl.value = result.data.accessToken;
    localStorage.setItem(USER_KEY, JSON.stringify(result.data.user));
    updateSessionInfo(result.data.user);
    setActiveView("users");
  }
});

getUserBtn.addEventListener("click", async () => {
  const id = userIdInput.value.trim();
  if (!id) {
    renderResponse("ПОЛУЧИТЬ ПОЛЬЗОВАТЕЛЯ", { message: "Необходимо указать ID пользователя" });
    return;
  }

  await request("ПОЛУЧИТЬ ПОЛЬЗОВАТЕЛЯ", `/users/${encodeURIComponent(id)}`, {
    method: "GET",
    headers: getHeaders(true),
  });
});

getUsersBtn.addEventListener("click", async () => {
  await request("СПИСОК ПОЛЬЗОВАТЕЛЕЙ", "/users", {
    method: "GET",
    headers: getHeaders(true),
  });
});

blockUserBtn.addEventListener("click", async () => {
  const id = blockUserIdInput.value.trim();
  if (!id) {
    renderResponse("БЛОКИРОВКА ПОЛЬЗОВАТЕЛЯ", { message: "Необходимо указать ID пользователя" });
    return;
  }

  await request("БЛОКИРОВКА ПОЛЬЗОВАТЕЛЯ", `/users/${encodeURIComponent(id)}/block`, {
    method: "PATCH",
    headers: getHeaders(true),
  });
});

saveTokenBtn.addEventListener("click", () => {
  const token = tokenEl.value.trim();
  if (!token) {
    renderResponse("ТОКЕН", { message: "Токен пустой" });
    return;
  }

  localStorage.setItem(TOKEN_KEY, token);
  renderResponse("ТОКЕН", { message: "Токен сохранен в localStorage" });
});

clearTokenBtn.addEventListener("click", () => {
  clearSession();
  renderResponse("ТОКЕН", { message: "Сессия очищена" });
});

logoutBtn.addEventListener("click", async () => {
  const token = tokenEl.value.trim();
  if (!token) {
    clearSession();
    renderResponse("ВЫХОД", { message: "Вы уже вышли из системы" });
    return;
  }

  const result = await request("ВЫХОД", "/auth/logout", {
    method: "POST",
    headers: getHeaders(true),
  });

  if (result?.response?.ok) {
    clearSession();
    setActiveView("dashboard");
  }
});
