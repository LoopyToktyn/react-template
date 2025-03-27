// src/api/userService.ts
import axios from "axios";

/** The shape of user data from jsonplaceholder.typicode.com */
export interface UserApiData {
  id: string;
  name: string;
  email: string;
  description?: string; // Not in real API, but used for form demo
  gender?: string;
  subscribe?: boolean;
  country?: string;
  skills?: string[];
  addresses?: string[];
  customData?: { option: string; checked: boolean };
}

/** Fetch a user by ID from jsonplaceholder */
export async function fetchUser(id: string): Promise<UserApiData> {
  const response = await axios.get(
    `https://jsonplaceholder.typicode.com/users/${id}`
  );
  return {
    ...response.data,
    description: "", // stub for form fields not included in real API
    gender: "",
    subscribe: false,
    country: "usa",
    skills: [],
    addresses: [],
    customData: { option: "", checked: false },
  };
}

/** Create a user — jsonplaceholder will fake a response */
export async function createUser(
  data: Omit<UserApiData, "id">
): Promise<UserApiData> {
  const response = await axios.post(
    `https://jsonplaceholder.typicode.com/users`,
    data
  );
  return {
    ...data,
    id: String(Math.floor(Math.random() * 10000)), // simulate ID assignment
  };
}

/** Update a user — jsonplaceholder fakes success */
export async function updateUser(
  id: string,
  data: Partial<UserApiData>
): Promise<UserApiData> {
  // Simulate a delay of 1.5 seconds
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const response = await axios.put(
    `https://jsonplaceholder.typicode.com/users/${id}`,
    data
  );

  return {
    id,
    ...data,
  } as UserApiData;
}
/** Delete a user — jsonplaceholder fakes deletion */
export async function deleteUser(id: string): Promise<void> {
  await axios.delete(`https://jsonplaceholder.typicode.com/users/${id}`);
}
