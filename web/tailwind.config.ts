import type { Config } from "tailwindcss";
import tailwindAnimate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				inter: ['Inter', 'sans-serif'],
				roboto: ['Roboto', 'sans-serif'],
				ui: ['var(--font-family)', 'sans-serif'],
			},
			fontSize: {
				ui: 'var(--font-size)',
			},
			width: {
				cell: 'var(--cell-width)',
			},
			height: {
				cell: 'var(--cell-height)',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					light: 'hsl(var(--primary-light))',
					dark: 'hsl(var(--primary-dark))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))',
					lightBlue: '#60A5FA',
					lightGreen: '#34D399',
					lavender: '#A78BFA',
					salmon: '#F87171',
					amber: '#FBBF24',
					rose: '#FB7185',
					cyan: '#22D3EE',
					indigo: '#6366F1',
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-accent))',
					'primary-foreground': 'hsl(var(--sidebar-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-foreground))',
					border: 'hsl(var(--border))',
					ring: 'hsl(var(--ring))'
				},
				brand: {
					blue: '#1a4480',
					lightBlue: '#71b2ff',
				},
				personnel: {
					prefer: '#4F46E5',
					must: '#6366F1',
					canNot: '#EF4444',
					preferNot: '#F87171',
				},
				status: {
					success: 'hsl(var(--success))',
					warning: 'hsl(var(--warning))',
					error: 'hsl(var(--error))',
					info: 'hsl(var(--info))',
				},
				palette: {
					cyan: "#42A5C5",
					gray: "#808080",
					blue: "#3538CD",
					red: "#E15B4F",
					indigo: "#4F46E5",
					green: "#5CCA69",
					yellow: "#E87F3A",
					magenta: "#D64C93",
					amber: "#E9B539",
					purple: "#9D61E3",
					teal: "#0A7B83",
					black: "#000000",
					brown: "#8B4513",
					navy: "#000080"
				},
				neutral: {
					white: '#FFFFFF',
					offWhite: '#F9FAFB',
					lightGray: '#F3F4F6',
					borderGray: '#E5E7EB',
					mediumGray: '#9CA3AF',
					textGray: '#6B7280',
					darkGray: '#4B5563',
					nearBlack: '#1F2937',
				},
			},
			spacing: {
				'xs': '4px',
				'sm': '8px',
				'md': '16px',
				'lg': '24px',
				'xl': '32px',
				'2xl': '48px',
			},
			boxShadow: {
				'elevation-1': '0 2px 4px rgba(0, 0, 0, 0.1)',
				'elevation-2': '0 4px 6px rgba(0, 0, 0, 0.15)',
				'elevation-3': '0 6px 12px rgba(0, 0, 0, 0.2)',
			},
			borderRadius: {
				'sm': '4px',
				'md': '8px',
				'lg': '12px',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'fade-up': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-up': 'fade-up 0.4s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'float': 'float 3s ease-in-out infinite'
			}
		}
	},
	plugins: [tailwindAnimate],
} satisfies Config;
