export const role = {
  User: "user",
  Admin: "admin"
} as const;
type role = (typeof role)[keyof typeof role]; // 'user' | 'admin'
