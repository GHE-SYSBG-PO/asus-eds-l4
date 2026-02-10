module.exports = {
  content: ['./blocks/**/*.{html,js,ejs,ts,tsx,jsx}'],
  theme: {
    // 核心：修正断点配置（确保单位正确，无语法错误）
    screens: {
      sm: '320px', // Mobile
      md: '730px', // Tablet
      lg: '1280px', // Desktop 1280px
    },
    extend: {},
  },
  plugins: [],
};
