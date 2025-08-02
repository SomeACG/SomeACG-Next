module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        xs: {
          max: '475px',
        },
        md: {
          max: '768px',
        },
        tablet: '640px',
        xl: '1366px',
        '2xl': '1366px',
      },
      colors: {
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        accent: {
          200: 'var(--accent-200)',
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        danger: 'var(--danger)',
        header: 'var(--bg-header)',
        text: {
          100: 'var(--text-100)',
          200: 'var(--text-200)',
        },
        bg: {
          100: 'var(--bg-100)',
          200: 'var(--bg-200)',
          300: 'var(--bg-300)',
          900: 'var(--bg-900)',
        },
        blue: {
          DEFAULT: '#49a1f5',
        },
        yellow: {
          DEFAULT: '#fec61d',
        },
        red: {
          DEFAULT: '#ec4f41',
        },
        // Artist card colors
        artist: {
          neutral: {
            100: 'hsl(220 14% 96%)', // 浅色边框/背景
            200: 'hsl(220 12% 87%)', // hover边框
            600: 'hsl(215 12% 53%)', // 次要文字
            700: 'hsl(215 16% 37%)', // 按钮背景
            800: 'hsl(215 20% 17%)', // 主要文字
          },
          'neutral-dark': {
            200: 'hsl(215 15% 74%)', // 浅色文字
            300: 'hsl(215 14% 34%)', // hover边框
            700: 'hsl(215 16% 28%)', // 边框
            800: 'hsl(215 20% 20%)', // 背景
            900: 'hsl(210 20% 95%)', // 主要文字
          },
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
      backgroundImage: {
        gradient: 'var(--gradient-bg)',
      },
      fontFamily: {
        poppins: 'var(--font-poppins)',
        averia: 'var(--font-averia)',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')],
};
