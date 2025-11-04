export async function changeUserPassword(
  userId: string,
  current: string,
  next: string,
  token: string
) {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  
  const res = await fetch(`${API_BASE_URL}/usersetting/change-password/${userId}`, {
    method: "PUT", 
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      current_password: current,
      new_password: next,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}