export async function changeUserPassword(
  userId: string,
  current: string,
  next: string,
  token: string
) {
  const res = await fetch(`http://localhost:3080/api/usersetting/change-password/${userId}`, {
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