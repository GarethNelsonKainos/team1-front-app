export const APPLICANT = {
  email: process.env.TEST_APPLICANT_EMAIL ?? 'alice@example.com',
  password: process.env.TEST_APPLICANT_PASSWORD ?? 'password1',
};

export const ADMIN = {
  email: process.env.TEST_ADMIN_EMAIL ?? 'charlie@example.com',
  password: process.env.TEST_ADMIN_PASSWORD ?? 'password1',
};
