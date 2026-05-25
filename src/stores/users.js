// src/stores/userStore.js

import { ref } from "vue";
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", () => {
  const users = ref([]);
  const currentUser = ref(null);
  const loading = ref(false);
  const isReady = ref(false);

  // const api = "http://localhost:3000/users";
  const baseUrl = import.meta.env.VITE_API_URL;
  const api = `${baseUrl}/users`;
  // const api = import.meta.env.VITE_API_URL

  // Fetch all users
  const fetchUsers = async () => {
    try {
      loading.value = true;

      const response = await fetch(api);

      if (!response.ok) throw new Error("Failed to fetch users");

      users.value = await response.json();

    } catch (error) {
      console.error("Fetch users error:", error);
    } finally {
      loading.value = false;
    }
  };

  const checkUserExists = async (name) => {
  try {
    loading.value = true;

    const response = await fetch(`${api}?name=${name}`);

    if (!response.ok) {
      throw new Error("Failed to check user");
    }

    const data = await response.json();

    // returns first user or null
    return data.length > 0 ? data[0] : null;

  } catch (error) {
    console.error("Check user error:", error);
    return null;
  } finally {
    loading.value = false;
  }
};

// Register / Add User
const addUser = async (user) => {
  try {
    loading.value = true;

    // 🔥 check existing user first
    const existingUser = await checkUserExists(user.name);

    // If user exists → login instead
    if (existingUser) {

      // update existing user
      const response = await fetch(
        `${api}/${existingUser.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(user)
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update user");
      }

      const updatedUser = await response.json();

      currentUser.value = updatedUser;

      localStorage.setItem(
        "currentUserId",
        updatedUser.id
      );

      return updatedUser;
    }

    // Create new user
    const response = await fetch(api, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(user)
    });

    if (!response.ok) {
      throw new Error("Failed to create user");
    }

    const newUser = await response.json();

    users.value.push(newUser);

    currentUser.value = newUser;

    localStorage.setItem(
      "currentUserId",
      newUser.id
    );

    return newUser;

  } catch (error) {
    console.error("Add user error:", error);
    return null;
  } finally {
    loading.value = false;
  }
};

  // Fetch Current Logged In User
  const fetchCurrentUser = async () => {
  try {
    const id = localStorage.getItem("currentUserId");

    if (!id) {
      isReady.value = true;
      return;
    }

    loading.value = true;

    const response = await fetch(`${api}/${id}`);

    if (!response.ok) throw new Error("Failed to fetch current user");

    currentUser.value = await response.json();

  } catch (error) {
    console.error("Current user error:", error);
  } finally {
    loading.value = false;
    isReady.value = true; // 🔥 important
  }
};

  // Logout
  const logoutUser = () => {
    currentUser.value = null;
    localStorage.removeItem("currentUserId");
  };

  // Delete User
  const deleteUser = async (id) => {
    try {
      loading.value = true;

      const response = await fetch(`${api}/${id}`, {
        method: "DELETE"
      });

      if (!response.ok) throw new Error("Delete failed");

      users.value = users.value.filter(user => user.id !== id);

      if (currentUser.value?.id === id) {
        logoutUser();
      }

    } catch (error) {
        console.error("Delete user error:", error);
    } finally {
        loading.value = false;
    }
  };

  return {
    users,
    currentUser,
    loading,
    isReady,
    fetchUsers,
    addUser,
    fetchCurrentUser,
    logoutUser,
    deleteUser,
    checkUserExists
  };
});