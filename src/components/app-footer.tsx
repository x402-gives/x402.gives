import ThemeSwitch from "@/components/theme-switch";
import {
  FaDiscord,
  FaGithub,
  FaGlobe,
  FaInstagram,
  FaLinkedin,
  FaMedium,
  FaTelegram,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

// Define a constant array for social links
const SOCIAL_LINKS = [
  {
    label: "Github",
    href: "https://github.com/x402-gives/x402.gives",
    icon: <FaGithub className="h-6 w-6" />,
  },
  {
    label: "Website",
    href: "https://x402.gives",
    icon: <FaGlobe className="h-6 w-6" />,
  },
];

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          {/* Left side - Branding */}
          <div className="flex flex-col items-center gap-1 md:items-start text-sm text-gray-600">
            <span>Zero platform fees. Funds go directly to creators.</span>
            <span>
              Built with ❤️ on{" "}
              <a
                href="https://x402.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                x402
              </a>{" "}
              and{" "}
              <a
                href="https://x402x.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                x402x
              </a>
              .
            </span>
          </div>

          {/* Right side - Social links and theme switch */}
          <div className="flex items-center gap-4">
            <ul className="flex gap-2">
              {SOCIAL_LINKS.slice(0, 4).map((social) => (
                <li key={social.label}>
                  <a
                    className="flex items-center justify-center text-gray-600 hover:text-blue-600 rounded-full w-8 h-8 transition-colors"
                    href={social.href}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </footer>
  );
}
