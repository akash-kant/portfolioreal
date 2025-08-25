export const ROUTES = {
  HOME: '/',
  PROJECTS: '/projects',
  BLOG: '/blog',
  SOCIAL: '/social',
  RESOURCES: '/resources',
  SERVICES: '/services',
  CONTACT: '/contact',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard'
}
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ME: '/auth/me',
    LOGOUT: '/auth/logout'
  },
  BLOG: '/blog',
  PROJECTS: '/projects',
  RESOURCES: '/resources',
  SERVICES: '/services',
  PAYMENTS: '/payments',
  BOOKINGS: '/bookings',
  CONTACT: '/contact',
  SOCIAL: '/social'
}
export const STORAGE_KEYS = { TOKEN: 'token', THEME: 'theme', USER_PREFERENCES: 'userPreferences' };
export const CATEGORIES = {
  BLOG: ['Technical', 'Career', 'Tutorials', 'Tips', 'Industry News'],
  PROJECTS: ['Web Development', 'Mobile App', 'AI/ML', 'Data Science', 'DevOps', 'Other'],
  RESOURCES: ['Resume Templates', 'Interview Prep', 'Coding Sheets', 'Study Notes', 'Cheat Sheets', 'Guides', 'Other'],
  SERVICES: ['Resume Review', 'Mock Interview', 'Career Consultation', 'Code Review', 'Mentorship', 'Other'],
};
export const SOCIAL_LINKS = {
  GITHUB: 'https://github.com/akash-kant',
  LINKEDIN: 'https://linkedin.com/in/akash-kant',
  TWITTER: 'https://twitter.com/akashkant',
  YOUTUBE: 'https://youtube.com/@thingswithakash',
  INSTAGRAM: 'https://www.instagram.com/akash_.kant',
};
export const SITE = {
  BRAND: 'Akash Kant',
  BRAND_INITIALS: 'AK',
  YEAR: new Date().getFullYear(),
};