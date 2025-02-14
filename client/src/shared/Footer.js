import React from "react";
import {
  FaInstagram,
  FaFacebookF,
  FaTwitter,
  FaTiktok,
  FaYoutube,
  FaVk,
} from "react-icons/fa";

const Footer = () => {
  return (
    <>
      <footer className="bg-[#373a39] text-gray-50 py-10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 text-sm ">
            {/* Useful Information */}
            <div>
              <h3 className="text-white text-2xl font-semibold mb-4">
                Useful Information
              </h3>
              <ul className=" space-y-3">
                <li>
                  <a href="#" className="hover:underline">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Language Certificates
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Become an Ambassador
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Press
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Language Exchange
                  </a>
                </li>
              </ul>
            </div>

            {/* Local Tandems */}
            <div>
              <h3 className="text-white text-2xl font-semibold mb-4">
                Local Tandems
              </h3>
              <ul className=" space-y-3">
                <li>
                  <a href="#" className="hover:underline">
                    Berkeley
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Brisbane
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Chicago
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Edinburgh
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Houston
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Melbourne
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    New York
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    San Diego
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Seattle
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Toronto
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-4">&nbsp;</h3>{" "}
              {/* Placeholder for alignment */}
              <ul className=" space-y-3">
                <li>
                  <a href="#" className="hover:underline">
                    Birmingham
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Cambridge
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Dublin
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Glasgow
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    London
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Montreal
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Nottingham
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    San Francisco
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Sydney
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Vancouver
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white text-2xl font-semibold mb-4">Legal</h3>
              <ul>
                <li>
                  <a href="#" className="hover:underline">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Legal Information
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:underline">
                    Privacy
                  </a>
                </li>
              </ul>
              <div className="mt-4">
                <h3 className="text-white font-semibold">Berlin Office</h3>
                <p className="text-sm">
                  Oranienburger Str. 17
                  <br />
                  D-10178 Berlin
                  <br />
                  Germany
                </p>
              </div>
              <div className="mt-4">
                <h3 className="text-white font-semibold">Hannover Office</h3>
                <p className="text-sm">
                  Bölschestr. 21
                  <br />
                  D-30173 Hannover
                  <br />
                  Germany
                </p>
              </div>
            </div>

            {/* Social Media */}
            <div>
              <h3 className="text-white text-2xl font-semibold mb-4">
                Social Media
              </h3>
              <div className="flex space-x-4">
                <a href="https://instagram.com" target="_blank" className="text-gray-400 hover:text-white">
                  <FaInstagram />
                </a>
                <a href="https://facebook.com" target="_blank" className="text-gray-400 hover:text-white">
                  <FaFacebookF />
                </a>
                <a href="https://twitter.com" target="_blank" className="text-gray-400 hover:text-white">
                  <FaTwitter />
                </a>
                <a href="https://tiktok.com" target="_blank" className="text-gray-400 hover:text-white">
                  <FaTiktok />
                </a>
                <a href="https://youtube.com" target="_blank" className="text-gray-400 hover:text-white">
                  <FaYoutube />
                </a>
              </div>
              <div className="mt-6 flex space-x-2">
                <img
                  src="/google.webp"
                  alt="Google Play"
                  className="h-8"
                />
                <img
                  src="/apple.webp"
                  alt="App Store"
                  className="h-8"
                />
              </div>
            </div>
          </div>
        </div>
      </footer>
      <div className=" text-center text-xs text-gray-500 bg-black py-4">
        <p>© 2024 Enlighten - Speak Any Language.</p>
        <p>Enlighten - Mobile Language Exchange is licensed by Enlighten Fundazioa</p>
      </div>
    </>
  );
};

export default Footer;
